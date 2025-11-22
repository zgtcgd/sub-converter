import express from 'express';
import bodyParser from 'body-parser';
import { SingboxConfigBuilder } from './src/SingboxConfigBuilder.js';
import { generateHtml } from './src/htmlBuilder.js';
import { ClashConfigBuilder } from './src/ClashConfigBuilder.js';
import { SurgeConfigBuilder } from './src/SurgeConfigBuilder.js';
import { GenerateWebPath } from './src/utils.js';
import { PREDEFINED_RULE_SETS } from './src/config.js';
import { t, setLanguage } from './src/i18n/index.js';
import yaml from 'js-yaml';
import { kvGet, kvPut, saveAutoUpdateTask, getAllAutoUpdateTasks, deleteAutoUpdateTask } from './src/kvSqlite.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/src/img', express.static('src/img'))

// 存储自动更新任务的内存对象
const autoUpdateTasks = new Map();

// 转化为中国时间
function toChinaTime(date) {
    if (!(date instanceof Date) || isNaN(date)) return 'N/A';

    // 使用 'zh-CN' locale 和 'Asia/Shanghai' timezone
    return date.toLocaleString('zh-CN', {
        timeZone: 'Asia/Shanghai',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false // 使用 24 小时制
    });
}

// 服务器启动时恢复自动更新任务
async function restoreAutoUpdateTasks() {
    try {
        const savedTasks = await getAllAutoUpdateTasks();

        for (const taskData of savedTasks) {
            const { shortCode, originalUrl, selectedRules, customRules, userAgent, configId, lastUpdate, intervalMs } = taskData;

            // 重新创建定时任务
            const intervalId = setInterval(async () => {
                try {
                    const currentLastUpdate = new Date();
                    await performBackendUpdate(shortCode, originalUrl, selectedRules, customRules, userAgent, configId, {
                        protocol: 'http',
                        get: (key) => key === 'host' ? 'localhost:' + PORT : null
                    });

                    // 更新任务信息中的最后执行时间
                    const task = autoUpdateTasks.get(shortCode);
                    if (task) {
                        task.lastUpdate = currentLastUpdate;
                        // 更新数据库中的最后执行时间
                        await saveAutoUpdateTask(task);
                    }
                    console.log(`${shortCode} 的自动更新已完成（中国标准时间：${toChinaTime(currentLastUpdate)}）`);
                } catch (error) {
                    console.error(`${shortCode} 的自动更新失败：`, error);
                }
            }, intervalMs);

            // 存储到内存中
            autoUpdateTasks.set(shortCode, {
                intervalId,
                originalUrl,
                selectedRules,
                customRules,
                userAgent,
                configId,
                lastUpdate: new Date(lastUpdate),
                                intervalMs
            });

            console.log(`已恢复自动更新任务: ${shortCode}`);
        }

        console.log(`已成功恢复 ${savedTasks.length} 个自动更新任务`);
    } catch (error) {
        console.error('恢复自动更新任务时出错:', error);
    }
}

// 启动自动更新任务
app.post('/auto-update/start', async (req, res) => {
    const { shortCode, interval, unit, originalUrl, selectedRules, customRules, userAgent, configId } = req.body;

    if (!shortCode || !originalUrl || !interval || !unit) {
        return res.status(400).json({ error: '缺少必需参数' });
        // return res.status(400).json({ error: '缺少必需参数 (shortCode, originalUrl, interval, unit)' });
    }

    try {
        // 停止已存在的同名任务
        if (autoUpdateTasks.has(shortCode)) {
            clearInterval(autoUpdateTasks.get(shortCode).intervalId);
            await deleteAutoUpdateTask(shortCode);
        }

        // 计算间隔时间（毫秒）
        let intervalMs = interval * 60 * 1000; // 默认分钟
        if (unit === 'hours') intervalMs = interval * 60 * 60 * 1000;
        if (unit === 'days') intervalMs = interval * 24 * 60 * 60 * 1000;

        // 立即执行一次更新
        const lastUpdateDate = new Date();
        await performBackendUpdate(shortCode, originalUrl, selectedRules, customRules, userAgent, configId, req);

        // 创建定时任务
        const intervalId = setInterval(async () => {
            try {
                const currentLastUpdate = new Date();
                await performBackendUpdate(shortCode, originalUrl, selectedRules, customRules, userAgent, configId, req);

                // 更新任务信息中的最后执行时间
                const task = autoUpdateTasks.get(shortCode);
                if (task) {
                    task.lastUpdate = currentLastUpdate;
                    // 更新数据库中的最后执行时间
                    await saveAutoUpdateTask(task);
                }
                console.log(`${shortCode} 的自动更新已完成（中国标准时间：${toChinaTime(currentLastUpdate)}）`);
            } catch (error) {
                console.error(`${shortCode} 的自动更新失败：`, error);
            }
        }, intervalMs);

        // 存储任务信息
        const taskInfo = {
            shortCode,
         originalUrl,
         selectedRules,
         customRules,
         userAgent,
         configId,
         lastUpdate: lastUpdateDate,
         intervalMs
        };

        autoUpdateTasks.set(shortCode, {
            ...taskInfo,
            intervalId
        });

        // 保存到数据库
        await saveAutoUpdateTask(taskInfo);

        const nextUpdateTime = new Date(lastUpdateDate.getTime() + intervalMs);

        res.json({
            success: true,
            message: '自动更新已成功启动',
            nextUpdate: toChinaTime(nextUpdateTime),
            lastUpdate: toChinaTime(lastUpdateDate)
        });

    } catch (error) {
        console.error('启动自动更新时发生错误:', error);
        res.status(500).json({ error: '启动自动更新失败' });
    }
});

// 停止自动更新 - 修复路径匹配问题
app.post('/auto-update/stop', async (req, res) => {
    const { shortCode } = req.body;

    if (!shortCode) {
        return res.status(400).json({ error: '缺少 shortCode 参数' });
    }

    console.log(`尝试停止自动更新任务: ${shortCode}`);

    if (autoUpdateTasks.has(shortCode)) {
        const task = autoUpdateTasks.get(shortCode);
        console.log(`找到任务，停止定时器: ${shortCode}`);
        clearInterval(task.intervalId);
        autoUpdateTasks.delete(shortCode);

        // 从数据库删除
        try {
            await deleteAutoUpdateTask(shortCode);
            console.log(`从数据库删除任务: ${shortCode}`);
        } catch (error) {
            console.error(`删除数据库任务失败: ${shortCode}`, error);
        }

        res.json({
            success: true,
            message: `自动更新任务 ${shortCode} 已停止`
        });
    } else {
        console.log(`任务不存在: ${shortCode}`);
        res.status(404).json({ error: '自动更新任务不存在' });
    }
});

// 保留原有的路径参数版本，确保兼容性
app.post('/auto-update/stop/:shortCode', async (req, res) => {
    const { shortCode } = req.params;

    console.log(`通过路径参数停止自动更新任务: ${shortCode}`);

    if (autoUpdateTasks.has(shortCode)) {
        const task = autoUpdateTasks.get(shortCode);
        console.log(`找到任务，停止定时器: ${shortCode}`);
        clearInterval(task.intervalId);
        autoUpdateTasks.delete(shortCode);

        // 从数据库删除
        try {
            await deleteAutoUpdateTask(shortCode);
            console.log(`从数据库删除任务: ${shortCode}`);
        } catch (error) {
            console.error(`删除数据库任务失败: ${shortCode}`, error);
        }

        res.json({
            success: true,
            message: `自动更新任务 ${shortCode} 已停止`
        });
    } else {
        console.log(`任务不存在: ${shortCode}`);
        res.status(404).json({ error: '自动更新任务不存在' });
    }
});

// 停止所有自动更新任务
app.post('/auto-update/stop-all', async (req, res) => {
    try {
        const taskCount = autoUpdateTasks.size;
        console.log(`尝试停止所有自动更新任务，共 ${taskCount} 个`);

        let stoppedCount = 0;

        // 停止所有内存中的任务
        for (const [shortCode, task] of autoUpdateTasks.entries()) {
            console.log(`停止任务: ${shortCode}`);
            clearInterval(task.intervalId);
            stoppedCount++;
        }

        // 清空内存
        autoUpdateTasks.clear();

        // 清空数据库中的所有任务
        try {
            const allTasks = await getAllAutoUpdateTasks();
            for (const task of allTasks) {
                await deleteAutoUpdateTask(task.shortCode);
            }
            console.log(`从数据库清空所有任务`);
        } catch (error) {
            console.error('清空数据库任务失败:', error);
        }

        res.json({
            success: true,
            message: `已停止所有自动更新任务`,
            stoppedCount: stoppedCount
        });

    } catch (error) {
        console.error('停止所有任务时发生错误:', error);
        res.status(500).json({ error: '停止所有任务失败' });
    }
});

// 获取自动更新状态
app.get('/auto-update/status/:shortCode', (req, res) => {
    const { shortCode } = req.params;

    if (autoUpdateTasks.has(shortCode)) {
        const task = autoUpdateTasks.get(shortCode);
        const nextUpdateDate = new Date(task.lastUpdate.getTime() + task.intervalMs);

        res.json({
            active: true,
            // 使用 toChinaTime 转换显示时间
            lastUpdate: toChinaTime(task.lastUpdate),
            nextUpdate: toChinaTime(nextUpdateDate),
            originalUrl: task.originalUrl
        });
    } else {
        res.json({ active: false, message: '任务不存在或未启动' });
    }
});

// 列出所有自动更新任务
app.get('/auto-update/tasks', (req, res) => {
    const tasks = {};
    autoUpdateTasks.forEach((task, shortCode) => {
        const nextUpdateDate = new Date(task.lastUpdate.getTime() + task.intervalMs);
        tasks[shortCode] = {
            originalUrl: task.originalUrl.substring(0, 50) + '...',
            // 使用 toChinaTime 转换显示时间
            lastUpdate: toChinaTime(task.lastUpdate),
            nextUpdate: toChinaTime(nextUpdateDate),
            intervalMs: task.intervalMs
        };
    });
    res.json(tasks);
});

// 执行更新的核心函数
async function performBackendUpdate(shortCode, originalUrl, selectedRules, customRules, userAgent, configId, req) {
    try {
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        const configParam = configId ? `&configId=${configId}` : '';

        // 自动更新会更新所有类型的短链接内容
        const shortUrlParams = `?config=${encodeURIComponent(originalUrl)}&ua=${encodeURIComponent(userAgent)}&selectedRules=${encodeURIComponent(JSON.stringify(selectedRules))}&customRules=${encodeURIComponent(JSON.stringify(customRules))}${configParam}`;

        // 更新 KV 存储中的短链接内容 这个参数会被所有4种类型的路由使用
        kvPut(shortCode, shortUrlParams);

        console.log(`已更新 ${shortCode} 任务`);

        // 更新任务的上次更新时间
        if (autoUpdateTasks.has(shortCode)) {
            autoUpdateTasks.get(shortCode).lastUpdate = new Date();
        }

        return { success: true, updatedAt: new Date() };
    } catch (error) {
        console.error(`Update failed for ${shortCode}:`, error);
        throw error;
    }
}

app.get('/', (req, res) => {
    const lang = req.query.lang || req.headers['accept-language']?.split(',')[0];
    setLanguage(lang);
    res.setHeader('Content-Type', 'text/html');
    res.send(generateHtml('', '', '', '', req.protocol + '://' + req.get('host')));
});

app.get(['/singbox', '/clash', '/surge'], async (req, res) => {
    let { config: inputString, selectedRules, customRules, lang, ua: userAgent, configId } = req.query;
    lang = lang || 'zh-CN';
    setLanguage(lang);
    userAgent = userAgent || 'curl/7.74.0';

    if (!inputString) return res.status(400).send(t('missingConfig'));

    let normalizedInput = inputString.replace(/\\n/g, '\n').replace(/,/g, '\n');

    if (PREDEFINED_RULE_SETS[selectedRules]) {
        selectedRules = PREDEFINED_RULE_SETS[selectedRules];
    } else {
        try {
            selectedRules = JSON.parse(decodeURIComponent(selectedRules));
        } catch {
            selectedRules = PREDEFINED_RULE_SETS.minimal;
        }
    }

    try {
        customRules = JSON.parse(decodeURIComponent(customRules));
    } catch {
        customRules = [];
    }

    let baseConfig;
    if (configId) {
        const customConfig = kvGet(configId);
        if (customConfig) baseConfig = JSON.parse(customConfig);
    }

    let configBuilder;
    if (req.path.startsWith('/singbox')) {
        configBuilder = new SingboxConfigBuilder(normalizedInput, selectedRules, customRules, baseConfig, lang, userAgent);
    } else if (req.path.startsWith('/clash')) {
        configBuilder = new ClashConfigBuilder(normalizedInput, selectedRules, customRules, baseConfig, lang, userAgent);
    } else {
        configBuilder = new SurgeConfigBuilder(normalizedInput, selectedRules, customRules, baseConfig, lang, userAgent)
        .setSubscriptionUrl(req.protocol + '://' + req.get('host') + req.originalUrl);
    }

    const config = await configBuilder.build();

    if (req.path.startsWith('/singbox')) {
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.send(JSON.stringify(config, null, 2));
    } else if (req.path.startsWith('/clash')) {
        res.setHeader('Content-Type', 'text/yaml; charset=utf-8');
        res.send(config);
    } else {
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        res.setHeader('subscription-userinfo', 'upload=0; download=0; total=10737418240; expire=2546249531');
        res.send(config);
    }
});

app.get('/xray', async (req, res) => {
    let inputString = req.query.config;
    if (!inputString) return res.status(400).send('Missing config parameter');
    inputString = inputString.replace(/\\n/g, '\n').replace(/,/g, '\n');
    const proxylist = inputString.split('\n');
    const finalProxyList = [];
    let userAgent = req.query.ua || 'curl/7.74.0';

    for (const proxy of proxylist) {
        if (proxy.startsWith('http://') || proxy.startsWith('https://')) {
            try {
                const response = await fetch(proxy, { headers: { 'User-Agent': userAgent } });
                let text = await response.text();
                let decodedText = Buffer.from(text.trim(), 'base64').toString();
                if (decodedText.includes('%')) {
                    decodedText = decodeURIComponent(decodedText);
                }
                finalProxyList.push(...decodedText.split('\n'));
            } catch (e) {
                // 忽略错误
            }
        } else {
            finalProxyList.push(proxy);
        }
    }
    const finalString = finalProxyList.join('\n');
    if (!finalString) return res.status(400).send('Missing config parameter');
    const encoded = Buffer.from(finalString).toString('base64');
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.send(encoded);
});

app.get('/shorten', (req, res) => {
    const originalUrl = req.query.url;
    if (!originalUrl) return res.status(400).send(t('missingUrl'));
    const shortCode = GenerateWebPath();
    kvPut(shortCode, originalUrl);
    const shortUrl = `${req.protocol}://${req.get('host')}/s/${shortCode}`;
    res.json({ shortUrl });
});

app.get('/shorten-v2', (req, res) => {
    const originalUrl = req.query.url;
    let shortCode = req.query.shortCode;
    if (!originalUrl) return res.status(400).send('Missing URL parameter');

    // 解析URL，只存储查询参数部分
    const parsedUrl = new URL(originalUrl);
    const queryString = parsedUrl.search;

    if (!shortCode) shortCode = GenerateWebPath();

    // 只存储查询参数部分，不包含路径
    kvPut(shortCode, queryString);

    res.type('text/plain').send(shortCode);
});

// 修改短链接路由，直接返回订阅内容而不是重定向
app.get(['/b/:code', '/c/:code', '/x/:code', '/s/:code'], async (req, res) => {
    const { code } = req.params;
    const originalParam = kvGet(code);

    if (!originalParam) {
        return res.status(404).send(t('shortUrlNotFound'));
    }

    try {
        // 解析原始参数（所有类型共用这部分）
        const urlObj = new URL(originalParam, 'http://localhost');
        const config = urlObj.searchParams.get('config');
        const ua = urlObj.searchParams.get('ua') || 'curl/7.74.0';
        const selectedRules = JSON.parse(urlObj.searchParams.get('selectedRules') || '[]');
        const customRules = JSON.parse(urlObj.searchParams.get('customRules') || '[]');
        const configId = urlObj.searchParams.get('configId') || '';

        if (!config) {
            return res.status(400).send('Missing config parameter');
        }

        let normalizedInput = config.replace(/\\n/g, '\n').replace(/,/g, '\n');

        let baseConfig;
        if (configId) {
            const customConfig = kvGet(configId);
            if (customConfig) baseConfig = JSON.parse(customConfig);
        }

        // 根据路径前缀分发到不同的配置生成器
        if (req.path.startsWith('/b/')) {
            // Singbox 配置 - 返回 JSON
            const configBuilder = new SingboxConfigBuilder(normalizedInput, selectedRules, customRules, baseConfig, 'zh-CN', ua);
            const singboxConfig = await configBuilder.build();
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            res.send(JSON.stringify(singboxConfig, null, 2));

        } else if (req.path.startsWith('/c/')) {
            // Clash 配置 - 返回 YAML
            const configBuilder = new ClashConfigBuilder(normalizedInput, selectedRules, customRules, baseConfig, 'zh-CN', ua);
            const clashConfig = await configBuilder.build();
            res.setHeader('Content-Type', 'text/yaml; charset=utf-8');
            res.send(clashConfig);

        } else if (req.path.startsWith('/x/')) {
            // Xray 配置 - 返回 Base64 编码的文本
            const proxylist = normalizedInput.split('\n');
            const finalProxyList = [];

            for (const proxy of proxylist) {
                if (proxy.startsWith('http://') || proxy.startsWith('https://')) {
                    try {
                        const response = await fetch(proxy, { headers: { 'User-Agent': ua } });
                        let text = await response.text();
                        let decodedText = Buffer.from(text.trim(), 'base64').toString();
                        if (decodedText.includes('%')) {
                            decodedText = decodeURIComponent(decodedText);
                        }
                        finalProxyList.push(...decodedText.split('\n'));
                    } catch (e) {
                        finalProxyList.push(proxy);
                    }
                } else {
                    finalProxyList.push(proxy);
                }
            }

            const finalString = finalProxyList.join('\n');
            if (!finalString) return res.status(400).send('Missing config parameter');
            const encoded = Buffer.from(finalString).toString('base64');
            res.setHeader('Content-Type', 'text/plain; charset=utf-8');
            res.send(encoded);

        } else if (req.path.startsWith('/s/')) {
            // Surge 配置 - 返回纯文本
            const configBuilder = new SurgeConfigBuilder(normalizedInput, selectedRules, customRules, baseConfig, 'zh-CN', ua)
            .setSubscriptionUrl(req.protocol + '://' + req.get('host') + req.originalUrl);
            const surgeConfig = await configBuilder.build();
            res.setHeader('Content-Type', 'text/plain; charset=utf-8');
            res.setHeader('subscription-userinfo', 'upload=0; download=0; total=10737418240; expire=2546249531');
            res.send(surgeConfig);
        }
    } catch (error) {
        console.error('Error processing short URL:', error);
        res.status(500).send('Error processing subscription: ' + error.message);
    }
});

app.post('/config', async (req, res) => {
    const { type, content } = req.body;
    const configId = `${type}_${GenerateWebPath(8)}`;
    try {
        let configString;
        if (type === 'clash') {
            if (typeof content === 'string' && (content.trim().startsWith('-') || content.includes(':'))) {
                const yamlConfig = yaml.load(content);
                configString = JSON.stringify(yamlConfig);
            } else {
                configString = typeof content === 'object' ? JSON.stringify(content) : content;
            }
        } else {
            configString = typeof content === 'object' ? JSON.stringify(content) : content;
        }
        JSON.parse(configString);
        kvPut(configId, configString, { expirationTtl: 60 * 60 * 24 * 30 });
        res.type('text/plain').send(configId);
    } catch (error) {
        res.status(400).type('text/plain').send(t('invalidFormat') + error.message);
    }
});

app.get('/resolve', (req, res) => {
    const shortUrl = req.query.url;
    if (!shortUrl) return res.status(400).send(t('missingUrl'));
    try {
        const urlObj = new URL(shortUrl);
        const pathParts = urlObj.pathname.split('/');
        if (pathParts.length < 3) return res.status(400).send(t('invalidShortUrl'));
        const prefix = pathParts[1];
        const shortCode = pathParts[2];
        if (!['b', 'c', 'x', 's'].includes(prefix)) return res.status(400).send(t('invalidShortUrl'));
        const originalParam = kvGet(shortCode);
        if (!originalParam) return res.status(404).send(t('shortUrlNotFound'));

        // 返回完整的转换URL而不是重定向URL
        const originalUrl = `${req.protocol}://${req.get('host')}/${prefix}${originalParam}`;
        res.json({ originalUrl });
    } catch {
        res.status(400).send(t('invalidShortUrl'));
    }
});

app.get('/api-doc', (req, res) => {
    const lang = req.query.lang || req.headers['accept-language']?.split(',')[0] || 'zh-CN';
    setLanguage(lang);
    const doc = t('apiDoc');
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(`
    <!DOCTYPE html>
    <html lang="${lang}">
    <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${doc.title} - sub-converter</title>
    <link rel="icon" href="/src/img/favicon.ico" type="image/x-icon">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.0/css/bootstrap.min.css" rel="stylesheet">
    <style>
    body { background: #f8f9fa; color: #222; margin: 0; }
    .api-doc-header {
        background: linear-gradient(90deg, #1f579b 0%, #1f560f 100%);
        color: #fff;
        padding: 2rem 0 1.2rem 0;
        text-align: center;
        margin-bottom: 2rem;
        box-shadow: 0 2px 12px rgba(106,17,203,0.08);
    }
    .api-doc-header h1 { font-size: 2.5rem; font-weight: 700; letter-spacing: 2px; margin-left: 7rem;}
    .container { max-width: 900px; margin: 0 auto 40px auto; background: #fff; border-radius: 18px; box-shadow: 0 4px 24px rgba(0,0,0,0.10); padding: 2.5rem 2rem; }
    h2 { margin-top: 2.5rem; border-left: 4px solid #6a11cb; padding-left: 0.5rem; font-size: 1.5rem; }
    h3 { margin-top: 1.5rem; font-size: 1.15rem; color: #2575fc; }
    pre { background: #f3f3f3; border-radius: 8px; padding: 1rem; font-size: 1rem; overflow-x: auto; }
    code { color: #c7254e; background: #f9f2f4; border-radius: 4px; padding: 2px 4px; }
    .back-link {background-color: #ffffff;color: #0a78ff; font-weight: 500;float: right; margin-top: 30px; margin-right: 40px; }
    .api-nav {padding-top: 1rem; margin-bottom: 2rem; }
    .api-nav a { margin-right: 1.2rem; color: #a6b9d8; text-decoration: none; font-weight: 500;}
    .api-nav a:hover { text-decoration: underline; }
    @media (max-width: 600px) {
        .container { padding: 1rem 0.5rem; }
        .api-doc-header h1 { font-size: 1.5rem; }
        .back-link { margin-right: 10px; }
    }
    hr { margin: 2.5rem 0 2rem 0; border: none; border-top: 1px solid #eee; }
    </style>
    </head>
    <body>
    <a href="/" class="btn btn-outline-secondary back-link">${doc.back}</a>
    <div class="api-doc-header">
    <h1>${doc.title}</h1>
    <div class="api-nav">
    <a href="#main">${doc.nav.main}</a>
    <a href="#params">${doc.nav.params}</a>
    <a href="#examples">${doc.nav.examples}</a>
    <a href="#response">${doc.nav.response}</a>
    <a href="#more">${doc.nav.more}</a>
    </div>
    </div>
    <div class="container">
    <p>${doc.intro}</p>
    <hr>
    <h2 id="main">${doc.nav.main}</h2>
    <ul>
    ${doc.mainList.map(item => `<li><b>${item.path}</b> - ${item.desc}</li>`).join('')}
    </ul>
    <hr>
    <h2 id="params">${doc.nav.params}</h2>
    <ul>
    ${doc.params.map(item => `<li><b>${item.key}</b>：${item.desc}</li>`).join('')}
    </ul>
    <hr>
    <h2 id="examples">${doc.nav.examples}</h2>
    ${doc.examples.map((ex, i) => `
        <h3>${i+1}. ${ex.title}</h3>
        <pre>${ex.extra ? ex.extra + '\n' : ''}${doc.labels.example} ${ex.example}\n${doc.labels.desc} ${ex.desc}</pre>
        `).join('')}
        <hr>
        <h2 id="response">${doc.nav.response}</h2>
        <ul>
        ${doc.response.map(r => `<li>${r}</li>`).join('')}
        </ul>
        <hr>
        <h2 id="more">${doc.nav.more}</h2>
        <ul>
        ${doc.more.map(m => `<li>${m}</li>`).join('')}
        </ul>
        </div>
        </body>
        </html>
        `);
});

app.use((req, res) => {
    res.status(404).send(t('notFound'));
});

// 在服务器启动时调用恢复函数
app.listen(PORT, async () => {
    console.log(`Server running at http://localhost:${PORT}`);
    // 恢复自动更新任务
    await restoreAutoUpdateTasks();
});

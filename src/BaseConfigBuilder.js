import { ProxyParser } from './ProxyParsers.js';
import { DeepCopy, decodeBase64 } from './utils.js';
import { t, setLanguage } from './i18n/index.js';
import { generateRules, getOutbounds, PREDEFINED_RULE_SETS } from './config.js';

export class BaseConfigBuilder {
    constructor(inputString, baseConfig, lang, userAgent) {
        this.inputString = inputString;
        this.config = DeepCopy(baseConfig);
        this.customRules = [];
        this.selectedRules = [];
        setLanguage(lang);
        this.userAgent = userAgent;
    }

    async build() {
        const customItems = await this.parseCustomItems();
        this.addCustomItems(customItems);
        this.addSelectors();
        return this.formatConfig();
    }

    async parseCustomItems() {
        const urls = this.inputString.split('\n').filter(url => url.trim() !== '');
        const parsedItems = [];
        
        for (const url of urls) {
            // 尝试解码，看看它是否是 base64 编码
            let processedUrls = this.tryDecodeBase64(url);
            
            // 处理单个URL或URL数组
            if(!Array.isArray(processedUrls)){
                processedUrls = [processedUrls];
            }

            // 从单个 base64 字符串处理多个 URL
            for (const processedUrl of processedUrls) {
                const result = await ProxyParser.parse(processedUrl, this.userAgent);
                if (Array.isArray(result)) {
                    for (const subUrl of result) {
                        const subResult = await ProxyParser.parse(subUrl, this.userAgent);
                        if (subResult) {
                            parsedItems.push(subResult);
                        }
                    }
                } else if (result) {
                    parsedItems.push(result);
                }
            }
        }
        
        return parsedItems;
    }

    tryDecodeBase64(str) {
        // 如果字符串已经包含协议前缀，则按原样返回。
        if (str.includes('://')) {
            return str;
        }

        try {
            // 尝试以 base64 格式解码
            const decoded = decodeBase64(str);
            
            // 检查解码后的内容是否包含多个链接
            if (decoded.includes('\n')) {
                // 按换行符分割并过滤掉空行
                const multipleUrls = decoded.split('\n').filter(url => url.trim() !== '');
                
                // 检查是否至少有一个有效的 URL
                if (multipleUrls.some(url => url.includes('://'))) {
                    return multipleUrls;
                }
            }
            
            // 检查解码后的字符串是否像一个有效的 URL
            if (decoded.includes('://')) {
                return decoded;
            }
        } catch (e) {
            // 如果解码失败，则返回原始字符串
        }
        return str;
    }

    getOutboundsList() {
        let outbounds;
        if (typeof this.selectedRules === 'string' && PREDEFINED_RULE_SETS[this.selectedRules]) {
            outbounds = getOutbounds(PREDEFINED_RULE_SETS[this.selectedRules]);
        } else if (this.selectedRules && Object.keys(this.selectedRules).length > 0) {
            outbounds = getOutbounds(this.selectedRules);
        } else {
            outbounds = getOutbounds(PREDEFINED_RULE_SETS.minimal);
        }
        return outbounds;
    }

    getProxyList() {
        return this.getProxies().map(proxy => this.getProxyName(proxy));
    }

    getProxies() {
        throw new Error('getProxies must be implemented in child class');
    }

    getProxyName(proxy) {
        throw new Error('getProxyName must be implemented in child class');
    }

    convertProxy(proxy) {
        throw new Error('convertProxy must be implemented in child class');
    }

    addProxyToConfig(proxy) {
        throw new Error('addProxyToConfig must be implemented in child class');
    }

    addAutoSelectGroup(proxyList) {
        throw new Error('addAutoSelectGroup must be implemented in child class');
    }

    addNodeSelectGroup(proxyList) {
        throw new Error('addNodeSelectGroup must be implemented in child class');
    }

    addOutboundGroups(outbounds, proxyList) {
        throw new Error('addOutboundGroups must be implemented in child class');
    }

    addCustomRuleGroups(proxyList) {
        throw new Error('addCustomRuleGroups must be implemented in child class');
    }

    addFallBackGroup(proxyList) {
        throw new Error('addFallBackGroup must be implemented in child class');
    }

    addCustomItems(customItems) {
        const validItems = customItems.filter(item => item != null);
        validItems.forEach(item => {
            if (item?.tag) {
                const convertedProxy = this.convertProxy(item);
                if (convertedProxy) {
                    this.addProxyToConfig(convertedProxy);
                }
            }
        });
    }

    addSelectors() {
        const outbounds = this.getOutboundsList();
        const proxyList = this.getProxyList();

        this.addAutoSelectGroup(proxyList);
        this.addNodeSelectGroup(proxyList);
        this.addOutboundGroups(outbounds, proxyList);
        this.addCustomRuleGroups(proxyList);
        this.addFallBackGroup(proxyList);
    }

    generateRules() {
        return generateRules(this.selectedRules, this.customRules);
    }

    formatConfig() {
        throw new Error('formatConfig must be implemented in child class');
    }
}

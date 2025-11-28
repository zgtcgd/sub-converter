import { UNIFIED_RULES, PREDEFINED_RULE_SETS } from './config.js';
import { generateStyles } from './style.js';
import { t } from './i18n/index.js';

export function generateHtml(xrayUrl, singboxUrl, clashUrl, surgeUrl, baseUrl) {
  return `
    <!DOCTYPE html>
    <html lang="en">
      ${generateHead()}
      ${generateBody(xrayUrl, singboxUrl, clashUrl, surgeUrl, baseUrl)}
    </html>
  `;
}

const generateHead = () => `
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="${t('pageDescription')}">
    <meta name="keywords" content="${t('pageKeywords')}">
    <title>${t('pageTitle')}</title>
    <meta property="og:title" content="${t('ogTitle')}">
    <meta property="og:description" content="${t('ogDescription')}">
    <meta property="og:type" content="website">
    <meta property="og:url" content="https://sublink.eooce.com/">
    <link rel="icon" href="/src/img/favicon.ico" type="image/x-icon">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.0/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
    <script src="https://cdn.jsdelivr.net/npm/qrcode-generator@1.4.4/qrcode.min.js"></script>
    <style>
      ${generateStyles()}
      .task-list {
        max-height: 200px;
        overflow-y: auto;
      }
      .task-item {
        background: #fff;
        border: 1px solid #e9ecef;
      }
      .task-item:hover {
        background: #f8f9fa;
      }
      body[data-theme="dark"] .task-item {
        background: #2d3748;
        border-color: #4a5568;
      }
      body[data-theme="dark"] .task-item:hover {
        background: #374151;
      }
      .api-doc-btn {
        color: #0aa26d;
        background: none;
        border: none;
        box-shadow: none;
        font-weight: 600;
        border-radius: 0;
        padding: 0.5rem 1.2rem;
        transition: none;
      }
      .api-doc-btn:hover, .api-doc-btn:focus {
        color: #1f579b !important;
        background: none;
        border: none;
        box-shadow: none;
      }
      /* 自动更新相关样式 */
      .auto-update-section {
        background: #f8f9fa;
        border-radius: 8px;
        padding: 1rem;
        margin-top: 1rem;
        border-left: 4px solid #0d6efd;
      }
      .auto-update-controls {
        display: flex;
        gap: 10px;
        align-items: center;
        flex-wrap: wrap;
      }
      .update-interval-input {
        width: 120px;
      }
      .update-status {
        margin-top: 10px;
        font-size: 0.9rem;
      }
      .update-active {
        color: #198754;
        font-weight: bold;
      }
      .update-stopped {
        color: #6c757d;
      }
      .last-update-time {
        font-size: 0.8rem;
        color: #6c757d;
        margin-top: 5px;
      }
      /* 深色模式适配：支持 prefers-color-scheme 和 data-theme=dark */
      @media (prefers-color-scheme: dark) {
        .api-doc-btn {
          color: #fff !important;
        }
        .api-doc-btn:hover, .api-doc-btn:focus {
          color: #1f579b !important;
        }
        .auto-update-section {
          background: #2d3748;
          border-left-color: #4299e1;
        }
      }
      body[data-theme="dark"] .api-doc-btn,
      html[data-theme="dark"] .api-doc-btn {
        color: #fff !important;
      }
      body[data-theme="dark"] .api-doc-btn:hover,
      html[data-theme="dark"] .api-doc-btn:hover,
      body[data-theme="dark"] .api-doc-btn:focus,
      html[data-theme="dark"] .api-doc-btn:focus {
        color: #1f579b !important;
      }
      body[data-theme="dark"] .auto-update-section {
        background: #2d3748;
        border-left-color: #4299e1;
      }
    </style>
  </head>
`;

const generateBody = (xrayUrl, singboxUrl, clashUrl, surgeUrl, baseUrl) => `
  <body>
    ${generateDarkModeToggle()}
    ${generateApiDocLink()}
    ${generateLanguageSelector()}
    ${generateGithubLink()}
    <div class="container mt-5">
      <div class="card mb-5">
        ${generateCardHeader()}
        <div class="card-body">
          ${generateForm()}
          <div id="subscribeLinksContainer">
            ${generateSubscribeLinks(xrayUrl, singboxUrl, clashUrl, surgeUrl, baseUrl)}
            ${generateAutoUpdateSection()}
          </div>
        </div>
      </div>
    </div>
    ${generateScripts()}
    <script>
      // 设置下拉框选中当前语言
      (function() {
        var urlParams = new URLSearchParams(window.location.search);
        var lang = urlParams.get('lang') || navigator.language || 'zh-CN';
        document.getElementById('langSelect').value = lang;
        document.getElementById('langSelect').addEventListener('change', function() {
          urlParams.set('lang', this.value);
          window.location.search = urlParams.toString();
        });
      })();
    </script>
  </body>
`;

// 自动更新部分、选择框
const generateAutoUpdateSection = () => `
  <div class="auto-update-section" id="autoUpdateSection" style="display: none;">
    <h6><i class="fas fa-sync-alt me-2"></i>${t('autoUpdate') || '自动更新'}</h6>
    <div class="auto-update-controls">
      <input type="number" class="form-control update-interval-input" id="updateInterval"
             placeholder="${t('updateInterval') || '更新间隔'}" min="1" max="365" value="60">
      <select class="form-select" id="updateIntervalUnit" style="width: 100px;">
        <option value="minutes">${t('minutes') || '分钟'}</option>
        <option value="hours">${t('hours') || '小时'}</option>
        <option value="days">${t('days') || '天'}</option>
      </select>
      <button type="button" class="btn btn-success" id="startAutoUpdateBtn">
        <i class="fas fa-play me-2"></i>${t('startAutoUpdate') || '开始自动更新'}
      </button>
      <button type="button" class="btn btn-warning" id="stopAutoUpdateBtn" style="display: none;">
        <i class="fas fa-stop me-2"></i>${t('stopAutoUpdate') || '停止自动更新'}
      </button>
      <!-- 新增手动更新按钮 -->
      <button type="button" class="btn btn-info" id="manualUpdateBtn">
      <i class="fas fa-sync me-2"></i>${t('manualUpdate') || '手动更新'}
      </button>
    </div>
    <div class="update-status">
      <span id="updateStatus" class="update-stopped">${t('autoUpdateStopped') || '自动更新已停止'}</span>
      <div class="last-update-time" id="lastUpdateTime"></div>
    </div>

    <!-- 新增：自动更新任务管理区域 -->
    <div id="autoUpdateTasksManager" style="display: none; margin-top: 15px; padding-top: 15px; border-top: 1px solid #dee2e6;">
      <h6><i class="fas fa-tasks me-2"></i>后台运行中的自动更新任务</h6>
      <div id="autoUpdateTasksList" class="mb-2"></div>
      <button type="button" class="btn btn-outline-danger btn-sm" id="stopAllTasksBtn">
        <i class="fas fa-stop-circle me-2"></i>停止所有任务
      </button>
    </div>
  </div>
`;

const generateApiDocLink = () => `
  <a href="#" id="apiDocLink" class="api-doc-btn" style="position: fixed; top: 13px; right: 200px; z-index: 1001; font-size: 1rem; text-decoration: none; color: #0aa26d;">API文档</a>
`;

const generateLanguageSelector = () => `
  <div style="position: fixed; top: 10px; right: 70px; z-index: 1001;">
    <select id="langSelect" class="form-select form-select-sm" style="width: 110px; height: 45px;">
      <option value="zh-CN">简体中文</option>
      <option value="en">English</option>
    </select>
  </div>
`;

const generateDarkModeToggle = () => `
  <button id="darkModeToggle" class="btn btn-outline-secondary">
    <i class="fas fa-moon"></i>
  </button>
`;

const generateGithubLink = () => `
  <a href="https://github.com/eooce/sub-converter" target="_blank" rel="noopener noreferrer" class="github-link">
    <i class="fab fa-github"></i>
  </a>
`;

const generateCardHeader = () => `
  <div class="card-header text-center">
    <h1 class="display-4 mb-0">${t('pageTitle')}</h1>
  </div>
`;

// Form Components
const generateForm = () => `
  <form method="POST" id="encodeForm">
    ${generateShareUrlsSection()}
    ${generateAdvancedOptionsToggle()}
    ${generateAdvancedOptions()}
    ${generateButtonContainer()}
  </form>
`;

const generateShareUrlsSection = () => `
  <div class="form-section">
    <div class="form-section-title">${t('shareUrls')}</div>
    <textarea class="form-control" id="inputTextarea" name="input" required placeholder="${t('urlPlaceholder')}" rows="3"></textarea>
  </div>
`;

const generateAdvancedOptionsToggle = () => `
  <div class="form-check form-switch mb-3">
    <input class="form-check-input" type="checkbox" id="advancedToggle">
    <label class="form-check-label" for="advancedToggle">${t('advancedOptions')}</label>
  </div>
`;

const generateAdvancedOptions = () => `
  <div id="advancedOptions">
    ${generateRuleSetSelection()}
    ${generateBaseConfigSection()}
    ${generateUASection()}
  </div>
`;

const generateButtonContainer = () => `
  <div class="button-container d-flex gap-2 mt-4">
    <button type="submit" class="btn btn-primary flex-grow-1">
      <i class="fas fa-sync-alt me-2"></i>${t('convert')}
    </button>
    <button type="button" class="btn btn-outline-secondary" id="clearFormBtn">
      <i class="fas fa-trash-alt me-2"></i>${t('clear')}
    </button>
  </div>
`;

const generateSubscribeLinks = (xrayUrl, singboxUrl, clashUrl, surgeUrl, baseUrl) => `
  <div class="mt-4">
    ${generateLinkInput('Xray Link (Base64):', 'xrayLink', xrayUrl)}
    ${generateLinkInput('SingBox Link:', 'singboxLink', singboxUrl)}
    ${generateLinkInput('Clash Link:', 'clashLink', clashUrl)}
    ${generateLinkInput('Surge Link:', 'surgeLink', surgeUrl)}
    ${generateCustomPathSection(baseUrl)}
    ${generateShortenButton()}
  </div>
`;

const generateLinkInput = (label, id, value) => `
  <div class="mb-4">
    <label for="${id}" class="form-label">${label}</label>
    <div class="input-group">
      <span class="input-group-text"><i class="fas fa-link"></i></span>
      <input type="text" class="form-control" id="${id}" value="${value}" readonly>
      <button class="btn btn-outline-secondary" type="button" onclick="copyToClipboard('${id}')">
        <i class="fas fa-copy"></i>
      </button>
      <button class="btn btn-outline-secondary" type="button" onclick="generateQRCode('${id}')">
        <i class="fas fa-qrcode"></i>
      </button>
    </div>
  </div>
`;

const generateCustomPathSection = (baseUrl) => `
  <div class="mb-4 mt-3">
    <label for="customShortCode" class="form-label">${t('customPath')}</label>
    <div class="input-group flex-nowrap">
      <span class="input-group-text text-truncate" style="max-width: 400px;" title="${baseUrl}/s/">
        ${baseUrl}/s/
      </span>
      <input type="text" class="form-control" id="customShortCode" placeholder="e.g. my-custom-link">
      <select id="savedCustomPaths" class="form-select" style="max-width: 200px;">
        <option value="">${t('savedPaths')}</option>
      </select>
      <button class="btn btn-outline-danger" type="button" onclick="deleteSelectedPath()">
        <i class="fas fa-trash-alt"></i>
      </button>
    </div>
  </div>
`;

const generateShortenButton = () => `
  <div class="d-grid mt-3">
    <button class="btn btn-primary btn-lg" type="button" onclick="shortenAllUrls()">
      <i class="fas fa-compress-alt me-2"></i>${t('shortenLinks')}
    </button>
  </div>
`;

const generateScripts = () => `
  <script>
    ${copyToClipboardFunction()}
    ${shortenAllUrlsFunction()}
    ${darkModeToggleFunction()}
    ${advancedOptionsToggleFunction()}
    ${applyPredefinedRulesFunction()}
    ${tooltipFunction()}
    ${submitFormFunction()}
    ${customRuleFunctions()}
    ${generateQRCodeFunction()}
    ${customPathFunctions()}
    ${saveConfig()}
    ${clearConfig()}
    ${autoUpdateFunctions()}  // 新增自动更新功能

    // 动态多语言API文档按钮
    document.addEventListener('DOMContentLoaded', function() {
      function updateApiDocLink() {
        var lang = document.getElementById('langSelect').value;
        var apiDocLink = document.getElementById('apiDocLink');
        var apiDocText = {
          'zh-CN': 'API文档',
          'en': 'API Doc',
          'en-US': 'API Doc'
        };
        apiDocLink.textContent = apiDocText[lang] || 'API Doc';
        apiDocLink.href = '/api-doc?lang=' + lang;
      }
      updateApiDocLink();
      document.getElementById('langSelect').addEventListener('change', updateApiDocLink);

      // 新增：自动更新多语言文本更新函数
      function updateAutoUpdateTexts() {
        const lang = document.getElementById('langSelect').value;

        // 更新手动更新按钮
        const manualUpdateBtn = document.getElementById('manualUpdateBtn');
        if (manualUpdateBtn) {
          const manualUpdateText = {
            'zh-CN': '手动更新',
            'en': 'Manual Update'
          };
          manualUpdateBtn.innerHTML = '<i class="fas fa-sync me-2"></i>' + (manualUpdateText[lang] || 'Manual Update');
        }

        // 更新停止所有任务按钮
        const stopAllBtn = document.getElementById('stopAllTasksBtn');
        if (stopAllBtn) {
          const stopAllText = {
            'zh-CN': '停止所有任务',
            'en': 'Stop All Tasks'
          };
          stopAllBtn.innerHTML = '<i class="fas fa-stop-circle me-2"></i>' + (stopAllText[lang] || 'Stop All Tasks');
        }

        // 更新后台任务标题
        const tasksTitle = document.querySelector('#autoUpdateTasksManager h6');
        if (tasksTitle) {
          const tasksTitleText = {
            'zh-CN': '后台运行中的自动更新任务',
            'en': 'Background Auto-update Tasks'
          };
          tasksTitle.innerHTML = '<i class="fas fa-tasks me-2"></i>' + (tasksTitleText[lang] || 'Background Auto-update Tasks');
        }

        // 更新状态文本（如果正在运行）
        const updateStatus = document.getElementById('updateStatus');
        if (updateStatus && updateStatus.classList.contains('update-active')) {
          const runningText = {
            'zh-CN': '自动更新运行中（后端服务）',
            'en': 'Auto-update running (backend service)'
          };
          updateStatus.textContent = runningText[lang] || 'Auto-update running (backend service)';
        }

        // 更新自动更新任务列表
        displayAutoUpdateTasks();
      }

      // 初始更新
      updateAutoUpdateTexts();

      // 监听语言切换
      document.getElementById('langSelect').addEventListener('change', updateAutoUpdateTexts);
    });
  </script>
`;

// 新增自动更新功能函数
const autoUpdateFunctions = () => `
  let currentShortCode = null;

  // 新增：手动更新函数 - 立即执行订阅更新
  async function manualUpdate() {
    const singboxLink = document.getElementById('singboxLink');
    if (!singboxLink || !singboxLink.value.includes('/b/')) {
      // 使用多语言提示
      const alertText = {
        'zh-CN': '请先生成短链接',
        'en': 'Please generate short link first'
      };
      const lang = document.getElementById('langSelect').value;
      alert(alertText[lang] || 'Please generate short link first');
      return;
    }

    const match = singboxLink.value.match(/\\/b\\/([^\\/]+)/);
    if (!match) {
      // 使用多语言提示
      const alertText = {
        'zh-CN': '无效的短链接',
        'en': 'Invalid short link'
      };
      const lang = document.getElementById('langSelect').value;
      alert(alertText[lang] || 'Invalid short link');
      return;
    }

    const shortCode = match[1];
    const manualUpdateBtn = document.getElementById('manualUpdateBtn');

    try {
      // 保存按钮原始状态（多语言）
      const originalText = manualUpdateBtn.innerHTML;
      const lang = document.getElementById('langSelect').value;

      const updatingText = {
        'zh-CN': '<i class="fas fa-spinner fa-spin me-2"></i>更新中...',
        'en': '<i class="fas fa-spinner fa-spin me-2"></i>Updating...'
      };

      manualUpdateBtn.disabled = true;
      manualUpdateBtn.innerHTML = updatingText[lang] || '<i class="fas fa-spinner fa-spin me-2"></i>Updating...';

      // 获取当前的表单数据
      const inputTextarea = document.getElementById('inputTextarea');
      const originalUrl = inputTextarea ? inputTextarea.value.trim() : '';
      const userAgent = document.getElementById('customUA').value || 'curl/7.74.0';

      let selectedRules;
      const predefinedRules = document.getElementById('predefinedRules').value;
      if (predefinedRules !== 'custom') {
        selectedRules = predefinedRules;
      } else {
        selectedRules = Array.from(document.querySelectorAll('input[name="selectedRules"]:checked'))
        .map(checkbox => checkbox.value);
      }

      const customRules = parseCustomRules();
      const configId = new URLSearchParams(window.location.search).get('configId') || '';

      // 构建更新请求，使用与自动更新相同的逻辑
      const updateData = {
        shortCode: shortCode,
        originalUrl: originalUrl,
        selectedRules: selectedRules,
        customRules: customRules,
        userAgent: userAgent,
        configId: configId
      };

      // 发送手动更新请求
      const response = await fetch('/manual-update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData)
      });

      if (!response.ok) {
        throw new Error('HTTP error! status: ' + response.status);
      }

      const result = await response.json();

      if (result.success) {
        // 使用多语言成功提示
        const successText = {
          'zh-CN': '手动更新成功！订阅内容已刷新。',
          'en': 'Manual update successful! Subscription content refreshed.'
        };
        alert(successText[lang] || 'Manual update successful! Subscription content refreshed.');

        // 更新显示时间（多语言）
        const now = new Date();
        const lastUpdateText = {
          'zh-CN': '最后更新: ',
          'en': 'Last update: '
        };
        document.getElementById('lastUpdateTime').textContent = (lastUpdateText[lang] || 'Last update: ') + now.toLocaleString();

        console.log('手动更新成功:', result);
      } else {
        // 使用多语言错误提示
        const errorText = {
          'zh-CN': '手动更新失败: ',
          'en': 'Manual update failed: '
        };
        alert((errorText[lang] || 'Manual update failed: ') + result.error);
      }
    } catch (error) {
      console.error('Error during manual update:', error);
      // 使用多语言错误提示
      const errorText = {
        'zh-CN': '手动更新时发生错误: ',
        'en': 'Error during manual update: '
      };
      const lang = document.getElementById('langSelect').value;
      alert((errorText[lang] || 'Error during manual update: ') + error.message);
    } finally {
      // 恢复按钮状态（使用多语言）
      const lang = document.getElementById('langSelect').value;
      const manualUpdateText = {
        'zh-CN': '<i class="fas fa-sync me-2"></i>手动更新',
        'en': '<i class="fas fa-sync me-2"></i>Manual Update'
      };
      manualUpdateBtn.disabled = false;
      manualUpdateBtn.innerHTML = manualUpdateText[lang] || '<i class="fas fa-sync me-2"></i>Manual Update';
    }
  }

  // 新增：获取所有自动更新任务
  async function getAllAutoUpdateTasks() {
    try {
      const response = await fetch('/auto-update/tasks');
      if (response.ok) {
        const tasks = await response.json();
        return tasks;
      }
      return {};
    } catch (error) {
      console.error('Error fetching auto-update tasks:', error);
      return {};
    }
  }

  // 新增：显示所有自动更新任务
  async function displayAutoUpdateTasks() {
    const tasks = await getAllAutoUpdateTasks();
    const tasksList = document.getElementById('autoUpdateTasksList');
    const manager = document.getElementById('autoUpdateTasksManager');

    if (!tasksList || !manager) return;

    if (Object.keys(tasks).length === 0) {
      manager.style.display = 'none';
      return;
    }

    manager.style.display = 'block';

    // 获取当前语言
    const lang = document.getElementById('langSelect').value;

    // 多语言文本
    const textMap = {
      'zh-CN': {
        lastUpdate: '最后更新',
        nextUpdate: '下次更新'
      },
      'en': {
        lastUpdate: 'Last update',
        nextUpdate: 'Next update'
      }
    };

    const texts = textMap[lang] || textMap['en'];

    let html = '<div class="task-list">';
    for (const [shortCode, task] of Object.entries(tasks)) {
      html += \`
        <div class="task-item mb-2 p-2 border rounded">
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <strong>\${shortCode}</strong>
              <div class="text-muted small">\${task.originalUrl}</div>
              <div class="text-muted small">
              \${texts.lastUpdate}: \${task.lastUpdate} | \${texts.nextUpdate}: \${task.nextUpdate}
              </div>
            </div>
            <button type="button" class="btn btn-outline-danger btn-sm" onclick="stopSpecificTask('\${shortCode}')">
              <i class="fas fa-stop"></i>
            </button>
          </div>
        </div>
      \`;
    }
    html += '</div>';
    tasksList.innerHTML = html;
  }

  // 停止所有任务 - 使用新的API
  async function stopAllAutoUpdateTasks() {
    try {
      const tasks = await getAllAutoUpdateTasks();
      const taskCount = Object.keys(tasks).length;

      if (taskCount === 0) {
        console.log('没有运行中的自动更新任务');
        return 0;
      }

      // 多语言确认提示
      const lang = document.getElementById('langSelect').value;
      const confirmText = {
        'zh-CN': '确定要停止所有 ' + taskCount + ' 个自动更新任务吗？',
        'en': 'Are you sure you want to stop all ' + taskCount + ' auto-update tasks?'
      };

      if (!confirm(confirmText[lang] || confirmText['en'])) {
        return 0;
      }

      console.log('正在停止所有自动更新任务...');
      const response = await fetch('/auto-update/stop-all', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error('HTTP error! status: ' + response.status);
      }

      const result = await response.json();

      if (result.success) {
        console.log('成功停止所有任务:', result);

        // 多语言成功提示
        const successText = {
          'zh-CN': '已停止 ' + result.stoppedCount + ' 个自动更新任务',
          'en': 'Stopped ' + result.stoppedCount + ' auto-update tasks'
        };
        alert(successText[lang] || successText['en']);

        await displayAutoUpdateTasks();
        updateUIForAutoUpdate(false);
        currentShortCode = null;
        return result.stoppedCount;
      } else {
        throw new Error(result.error || '停止所有任务失败');
      }
    } catch (error) {
      console.error('Error stopping all tasks:', error);

      // 多语言错误提示
      const lang = document.getElementById('langSelect').value;
      const errorText = {
        'zh-CN': '停止所有任务时发生错误: ',
        'en': 'Error stopping all tasks: '
      };
      alert((errorText[lang] || errorText['en']) + error.message);
      return 0;
    }
  }

  // 停止特定任务 - 使用正确的API路径
  async function stopSpecificTask(shortCode) {
    // 多语言确认提示
    const lang = document.getElementById('langSelect').value;
    const confirmText = {
      'zh-CN': '确定要停止任务 ' + shortCode + ' 吗？',
      'en': 'Are you sure you want to stop task ' + shortCode + '?'
    };

    if (!confirm(confirmText[lang] || confirmText['en'])) {
      return;
    }

    try {
      const response = await fetch('/auto-update/stop', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          shortCode: shortCode
        })
      });

      const result = await response.json();

      if (result.success) {
        // 多语言成功提示
        const successText = {
          'zh-CN': '已停止任务: ' + shortCode,
          'en': 'Stopped task: ' + shortCode
        };
        alert(successText[lang] || successText['en']);

        await displayAutoUpdateTasks();

        // 如果停止的是当前任务，更新UI状态
        if (currentShortCode === shortCode) {
          updateUIForAutoUpdate(false);
          currentShortCode = null;
        }
      } else {
        // 多语言错误提示
        const errorText = {
          'zh-CN': '停止任务失败: ',
          'en': 'Failed to stop task: '
        };
        alert((errorText[lang] || errorText['en']) + result.error);
      }
    } catch (error) {
      console.error('Error stopping task:', error);

      // 多语言错误提示
      const errorText = {
        'zh-CN': '停止任务时发生错误',
        'en': 'Error stopping task'
      };
      alert(errorText[lang] || errorText['en']);
    }
  }

  // 修改：增强的清除表单数据函数
  async function clearFormData() {
    console.log('开始清除表单数据...');

    // 停止所有相关的自动更新任务
    const stoppedCount = await stopAllAutoUpdateTasks();
    console.log('停止任务结果:', stoppedCount);

    // 清除本地存储
    localStorage.removeItem('inputTextarea');
    localStorage.removeItem('advancedToggle');
    localStorage.removeItem('selectedRules');
    localStorage.removeItem('predefinedRules');
    localStorage.removeItem('configEditor');
    localStorage.removeItem('configType');
    localStorage.removeItem('userAgent');
    localStorage.removeItem('autoUpdateSettings');
    localStorage.removeItem('subscribeLinksVisible'); // 清除订阅链接显示状态
    localStorage.removeItem('autoUpdateSectionVisible'); // 清除自动更新部分显示状态

    // 重置表单
    document.getElementById('inputTextarea').value = '';
    document.getElementById('advancedToggle').checked = false;
    const event = new Event('change');
    document.getElementById('advancedToggle').dispatchEvent(event);
    document.getElementById('configEditor').value = '';
    document.getElementById('configType').value = 'singbox';
    document.getElementById('customUA').value = '';

    localStorage.removeItem('customPath');
    document.getElementById('customShortCode').value = '';

    // 重置规则选择
    document.getElementById('predefinedRules').value = 'custom';
    document.querySelectorAll('.rule-checkbox').forEach(checkbox => {
      checkbox.checked = false;
    });

    // 清除自定义规则
    document.querySelectorAll('.custom-rule').forEach(rule => rule.remove());
    const jsonTextarea = document.querySelector('#customRulesJSON textarea');
    if (jsonTextarea) {
      jsonTextarea.value = '';
    }

    // 隐藏自动更新部分
    hideAutoUpdateSection();

    // 重置订阅链接显示区域
    const subscribeLinksContainer = document.getElementById('subscribeLinksContainer');
    subscribeLinksContainer.classList.remove('show');
    subscribeLinksContainer.classList.add('hide');

    // 清空生成的链接
    document.getElementById('xrayLink').value = '';
    document.getElementById('singboxLink').value = '';
    document.getElementById('clashLink').value = '';
    document.getElementById('surgeLink').value = '';

    // 重置自动更新UI状态
    updateUIForAutoUpdate(false);
    currentShortCode = null;

    // 延迟重置容器显示
    setTimeout(() => {
      subscribeLinksContainer.classList.remove('hide');
    }, 500);

    // 显示清除成功提示（多语言支持）
    const lang = document.getElementById('langSelect').value;
    const messageText = {
      'zh-CN': {
        base: '表单已清除',
        withTasks: '，并停止了 ' + stoppedCount + ' 个自动更新任务',
        noTasks: '，没有运行中的自动更新任务'
      },
      'en': {
        base: 'Form cleared',
        withTasks: ', and stopped ' + stoppedCount + ' auto-update tasks',
        noTasks: ', no running auto-update tasks'
      }
    };

    const texts = messageText[lang] || messageText['en'];
    let message = texts.base;

    if (stoppedCount > 0) {
      message += texts.withTasks;
    } else {
      message += texts.noTasks;
    }

    alert(message);
    console.log('清除表单完成:', message);
  }

  // 修改：页面加载时检查自动更新状态
  document.addEventListener('DOMContentLoaded', function() {
    const startBtn = document.getElementById('startAutoUpdateBtn');
    const stopBtn = document.getElementById('stopAutoUpdateBtn');
    const stopAllBtn = document.getElementById('stopAllTasksBtn');
    const manualUpdateBtn = document.getElementById('manualUpdateBtn');

    if (startBtn) {
      startBtn.addEventListener('click', startAutoUpdate);
    }

    if (stopBtn) {
      stopBtn.addEventListener('click', stopAutoUpdate);
    }

    if (stopAllBtn) {
      stopAllBtn.addEventListener('click', stopAllAutoUpdateTasks);
    }

    if (manualUpdateBtn) {
      manualUpdateBtn.addEventListener('click', manualUpdate);
    }

    // 页面加载时恢复自动更新部分显示状态
    const shouldShowAutoUpdate = localStorage.getItem('autoUpdateSectionVisible') === 'true';
    if (shouldShowAutoUpdate) {
      showAutoUpdateSection();
    }

    // 页面加载时显示所有自动更新任务
    setTimeout(() => {
      displayAutoUpdateTasks();
    }, 1000);

    // 监听链接变化，检查自动更新状态
    const observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        if (mutation.type === 'attributes' && mutation.attributeName === 'value') {
          const target = mutation.target;
          if (target.id === 'singboxLink' && target.value.includes('/b/')) {
            setTimeout(() => {
              checkCurrentLinkForAutoUpdate();
            }, 500);
          }
        }
      });
    });

    const singboxLink = document.getElementById('singboxLink');
    if (singboxLink) {
      observer.observe(singboxLink, { attributes: true });
    }
  });

  // 新增：检查当前链接是否有对应的自动更新任务
  async function checkCurrentLinkForAutoUpdate() {
    const singboxLink = document.getElementById('singboxLink');
    if (!singboxLink || !singboxLink.value) return;

    // 从Singbox链接中提取短代码
    const match = singboxLink.value.match(/\\/b\\/([^\\/]+)/);
    if (!match) return;

    const shortCode = match[1];

    try {
      const response = await fetch('/auto-update/status/' + shortCode);
      const status = await response.json();

      if (status.active) {
        currentShortCode = shortCode;
        updateUIForAutoUpdate(true);
        updateLastUpdateTime(status.lastUpdate);
        console.log('检测到自动更新任务:', shortCode);
      }
    } catch (error) {
      console.error('Error checking auto-update status:', error);
    }
  }

  // 修改：停止自动更新函数，支持指定短代码
  async function stopAutoUpdate() {
    let shortCodeToStop = currentShortCode;

    if (!shortCodeToStop) {
      // 如果没有currentShortCode，尝试从Singbox链接中提取
      const singboxLink = document.getElementById('singboxLink');
      if (singboxLink && singboxLink.value.includes('/b/')) {
        const match = singboxLink.value.match(/\\/b\\/([^\\/]+)/);
        if (match) {
          shortCodeToStop = match[1];
        }
      }
    }

    if (!shortCodeToStop) {
      // 多语言提示
      const lang = document.getElementById('langSelect').value;
      const alertText = {
        'zh-CN': '没有找到要停止的自动更新任务',
        'en': 'No auto-update task found to stop'
      };
      alert(alertText[lang] || alertText['en']);
      return;
    }

    try {
      const response = await fetch('/auto-update/stop/' + shortCodeToStop, {
        method: 'POST'
      });

      const result = await response.json();

      if (result.success) {
        updateUIForAutoUpdate(false);
        currentShortCode = null;

        // 多语言成功提示
        const lang = document.getElementById('langSelect').value;
        const successText = {
          'zh-CN': '自动更新已停止',
          'en': 'Auto-update stopped'
        };
        alert(successText[lang] || successText['en']);

        await displayAutoUpdateTasks();
      } else {
        // 多语言错误提示
        const lang = document.getElementById('langSelect').value;
        const errorText = {
          'zh-CN': '停止自动更新失败: ',
          'en': 'Failed to stop auto-update: '
        };
        alert((errorText[lang] || errorText['en']) + result.error);
      }
    } catch (error) {
      console.error('Error stopping auto-update:', error);

      // 多语言错误提示
      const lang = document.getElementById('langSelect').value;
      const errorText = {
        'zh-CN': '停止自动更新时发生错误',
        'en': 'Error stopping auto-update'
      };
      alert(errorText[lang] || errorText['en']);
    }
  }

  function showAutoUpdateSection() {
    const autoUpdateSection = document.getElementById('autoUpdateSection');
    if (autoUpdateSection) {
      autoUpdateSection.style.display = 'block';
      // 保存状态到 localStorage
      localStorage.setItem('autoUpdateSectionVisible', 'true');
      // 显示时刷新任务列表
      displayAutoUpdateTasks();
    }
  }

  function hideAutoUpdateSection() {
    const autoUpdateSection = document.getElementById('autoUpdateSection');
    if (autoUpdateSection) {
      autoUpdateSection.style.display = 'none';
      // 保存状态到 localStorage
      localStorage.setItem('autoUpdateSectionVisible', 'false');
    }
  }

  function updateUIForAutoUpdate(isActive) {
    const startBtn = document.getElementById('startAutoUpdateBtn');
    const stopBtn = document.getElementById('stopAutoUpdateBtn');
    const status = document.getElementById('updateStatus');

    if (startBtn) startBtn.style.display = isActive ? 'none' : 'inline-block';
    if (stopBtn) stopBtn.style.display = isActive ? 'inline-block' : 'none';
    if (status) {
      status.textContent = isActive ?
      '${t('autoUpdateRunning')}' || '自动更新运行中（后端服务）' :
      '${t('autoUpdateStopped')}' || '自动更新已停止';
      status.className = isActive ? 'update-active' : 'update-stopped';
    }
  }

  async function startAutoUpdate() {
    const intervalInput = document.getElementById('updateInterval');
    const unitSelect = document.getElementById('updateIntervalUnit');
    const interval = parseInt(intervalInput.value);

    if (!interval || interval < 1) {
      alert('请输入有效的更新间隔');
      return;
    }

    const singboxLink = document.getElementById('singboxLink');
    if (!singboxLink || !singboxLink.value.includes('/b/')) {
      alert('请先生成短链接');
      return;
    }

    const match = singboxLink.value.match(/\\/b\\/([^\\/]+)/);
    if (!match) {
      alert('无效的短链接');
      return;
    }

    currentShortCode = match[1];

    const inputTextarea = document.getElementById('inputTextarea');
    const originalUrl = inputTextarea ? inputTextarea.value.trim() : '';
    const userAgent = document.getElementById('customUA').value || 'curl/7.74.0';

    let selectedRules;
    const predefinedRules = document.getElementById('predefinedRules').value;
    if (predefinedRules !== 'custom') {
      selectedRules = predefinedRules;
    } else {
      selectedRules = Array.from(document.querySelectorAll('input[name="selectedRules"]:checked'))
        .map(checkbox => checkbox.value);
    }

    const customRules = parseCustomRules();
    const configId = new URLSearchParams(window.location.search).get('configId') || '';

    try {
      const response = await fetch('/auto-update/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          shortCode: currentShortCode,
          interval: interval,
          unit: unitSelect.value,
          originalUrl: originalUrl,
          selectedRules: selectedRules,
          customRules: customRules,
          userAgent: userAgent,
          configId: configId
        })
      });

      const result = await response.json();

      if (result.success) {
        updateUIForAutoUpdate(true);

        // 多语言成功提示
        const lang = document.getElementById('langSelect').value;
        const successText = {
          'zh-CN': '自动更新已启动！即使关闭页面也会继续运行。短代码: ' + currentShortCode,
          'en': 'Auto-update started! It will continue running even if you close the page. Short code: ' + currentShortCode
        };
        alert(successText[lang] || successText['en']);

        await displayAutoUpdateTasks();
      } else {
        // 多语言失败提示
        const lang = document.getElementById('langSelect').value;
        const errorText = {
          'zh-CN': '启动自动更新失败: ',
          'en': 'Failed to start auto-update: '
        };
        alert((errorText[lang] || errorText['en']) + result.error);
      }
    } catch (error) {
      console.error('Error starting auto-update:', error);

      // 多语言异常提示
      const lang = document.getElementById('langSelect').value;
      const errorText = {
        'zh-CN': '启动自动更新时发生错误',
        'en': 'Error occurred while starting auto-update'
      };
      alert(errorText[lang] || errorText['en']);
    }
  }

  function updateLastUpdateTime(dateString) {
    const lastUpdateElement = document.getElementById('lastUpdateTime');
    if (lastUpdateElement && dateString) {
      lastUpdateElement.textContent = '最后更新: ' + dateString;
    }
  }
`;

const customPathFunctions = () => `
  function saveCustomPath() {
    const customPath = document.getElementById('customShortCode').value;
    if (customPath) {
      let savedPaths = JSON.parse(localStorage.getItem('savedCustomPaths') || '[]');
      if (!savedPaths.includes(customPath)) {
        savedPaths.push(customPath);
        localStorage.setItem('savedCustomPaths', JSON.stringify(savedPaths));
        updateSavedPathsDropdown();
      }
    }
  }

  function updateSavedPathsDropdown() {
    const savedPaths = JSON.parse(localStorage.getItem('savedCustomPaths') || '[]');
    const dropdown = document.getElementById('savedCustomPaths');
    dropdown.innerHTML = '<option value="">Saved paths</option>';
    savedPaths.forEach(path => {
      const option = document.createElement('option');
      option.value = path;
      option.textContent = path;
      dropdown.appendChild(option);
    });
  }

  function loadSavedCustomPath() {
    const dropdown = document.getElementById('savedCustomPaths');
    const customShortCode = document.getElementById('customShortCode');
    if (dropdown.value) {
      customShortCode.value = dropdown.value;
    }
  }

  function deleteSelectedPath() {
    const dropdown = document.getElementById('savedCustomPaths');
    const selectedPath = dropdown.value;
    if (selectedPath) {
      let savedPaths = JSON.parse(localStorage.getItem('savedCustomPaths') || '[]');
      savedPaths = savedPaths.filter(path => path !== selectedPath);
      localStorage.setItem('savedCustomPaths', JSON.stringify(savedPaths));
      updateSavedPathsDropdown();
      document.getElementById('customShortCode').value = '';
    }
  }

  document.addEventListener('DOMContentLoaded', function() {
    updateSavedPathsDropdown();
    document.getElementById('savedCustomPaths').addEventListener('change', loadSavedCustomPath);
  });
`;

const advancedOptionsToggleFunction = () => `
  document.getElementById('advancedToggle').addEventListener('change', function() {
    const advancedOptions = document.getElementById('advancedOptions');
    if (this.checked) {
      advancedOptions.classList.add('show');
    } else {
      advancedOptions.classList.remove('show');
    }
  });
`;

const copyToClipboardFunction = () => `
  function copyToClipboard(elementId) {
    const element = document.getElementById(elementId);
    element.select();
    document.execCommand('copy');

    const button = element.nextElementSibling;
    const originalText = button.innerHTML;
    button.innerHTML = '<i class="fas fa-check"></i> Copied!';
    button.classList.remove('btn-outline-secondary');
    button.classList.add('btn-success');
    setTimeout(() => {
      button.innerHTML = originalText;
      button.classList.remove('btn-success');
      button.classList.add('btn-outline-secondary');
    }, 2000);
  }
`;

const shortenAllUrlsFunction = () => `
  let isShortening = false;

  async function shortenUrl(url, customShortCode) {
    saveCustomPath();
    const response = await fetch(\`/shorten-v2?url=\${encodeURIComponent(url)}&shortCode=\${encodeURIComponent(customShortCode || '')}\`);
    if (response.ok) {
      const data = await response.text();
      return data;
    }
    throw new Error('Failed to shorten URL');
  }

  async function shortenAllUrls() {
    if (isShortening) {
      return;
    }

    const shortenButton = document.querySelector('button[onclick="shortenAllUrls()"]');

    try {
      isShortening = true;
      shortenButton.disabled = true;
      shortenButton.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Shortening...';

      const singboxLink = document.getElementById('singboxLink');
      const customShortCode = document.getElementById('customShortCode').value;

      if (singboxLink.value.includes('/b/')) {
        alert('Links are already shortened!');
        return;
      }

      const shortCode = await shortenUrl(singboxLink.value, customShortCode);

      const xrayLink = document.getElementById('xrayLink');
      const clashLink = document.getElementById('clashLink');
      const surgeLink = document.getElementById('surgeLink');

      xrayLink.value = window.location.origin + '/x/' + shortCode;
      singboxLink.value = window.location.origin + '/b/' + shortCode;
      clashLink.value = window.location.origin + '/c/' + shortCode;
      surgeLink.value = window.location.origin + '/s/' + shortCode;
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to shorten URLs. Please try again.');
    } finally {
      isShortening = false;
      shortenButton.disabled = false;
      shortenButton.innerHTML = '<i class="fas fa-compress-alt me-2"></i>Shorten Links';
    }
  }
`;

const darkModeToggleFunction = () => `
  const darkModeToggle = document.getElementById('darkModeToggle');
  const body = document.body;

  darkModeToggle.addEventListener('click', () => {
    body.setAttribute('data-theme', body.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
    darkModeToggle.innerHTML = body.getAttribute('data-theme') === 'dark' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
  });

  // Check for saved theme preference or use system preference
  const savedTheme = localStorage.getItem('theme');
  const systemDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

  if (savedTheme) {
    body.setAttribute('data-theme', savedTheme);
    darkModeToggle.innerHTML = savedTheme === 'dark' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
  } else if (systemDarkMode) {
    body.setAttribute('data-theme', 'dark');
    darkModeToggle.innerHTML = '<i class="fas fa-sun"></i>';
  }

  // Save theme preference when changed
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'attributes' && mutation.attributeName === 'data-theme') {
        localStorage.setItem('theme', body.getAttribute('data-theme'));
      }
    });
  });

  observer.observe(body, { attributes: true });
`;

const generateRuleSetSelection = () => `
  <div class="form-section">
    <div class="form-section-title d-flex align-items-center">
      ${t('ruleSelection')}
      <span class="tooltip-icon ms-2">
        <i class="fas fa-question-circle"></i>
        <span class="tooltip-content">
          ${t('ruleSelectionTooltip')}
        </span>
      </span>
    </div>
    <div class="content-container mb-3">
      <select class="form-select" id="predefinedRules" onchange="applyPredefinedRules()">
        <option value="custom">${t('custom')}</option>
        <option value="minimal">${t('minimal')}</option>
        <option value="balanced">${t('balanced')}</option>
        <option value="comprehensive">${t('comprehensive')}</option>
      </select>
    </div>
    <div class="row" id="ruleCheckboxes">
      ${UNIFIED_RULES.map(rule => generateRuleCheckbox(rule)).join('')}
    </div>
    ${generateCustomRulesSection()}
  </div>
`;

const generateRuleCheckbox = (rule) => `
  <div class="col-md-4 mb-2">
    <div class="form-check">
      <input class="form-check-input rule-checkbox" type="checkbox" value="${rule.name}" id="${rule.name}" name="selectedRules">
      <label class="form-check-label" for="${rule.name}">${t('outboundNames.' + rule.name)}</label>
    </div>
  </div>
`;

const generateCustomRulesSection = () => `
  <div class="mt-2">
    <div class="custom-rules-section-header">
      <h5 class="custom-rules-section-title">${t('customRulesSection')}</h5>
      <span class="tooltip-icon">
        <i class="fas fa-question-circle"></i>
        <span class="tooltip-content">
          ${t('customRulesSectionTooltip')}
        </span>
      </span>
    </div>
    <div class="custom-rules-container">
      ${generateCustomRulesTabs()}
      ${generateCustomRulesContent()}
    </div>
  </div>
`;

const generateCustomRulesTabs = () => `
  <div class="custom-rules-tabs">
    <button type="button" class="custom-rules-tab active" onclick="switchCustomRulesTab('form')" id="formTab">
      <i class="fas fa-edit me-2"></i>${t('customRulesForm')}
    </button>
    <button type="button" class="custom-rules-tab" onclick="switchCustomRulesTab('json')" id="jsonTab">
      <i class="fas fa-code me-2"></i>${t('customRulesJSON')}
    </button>
  </div>
`;

const generateCustomRulesContent = () => `
  <div class="custom-rules-content">
    ${generateFormView()}
    ${generateJSONView()}
  </div>
`;

const generateFormView = () => `
  <div id="formView" class="custom-rules-view active">
    <div class="conversion-controls">
      <button type="button" class="btn btn-outline-primary btn-sm" onclick="addCustomRule()">
        <i class="fas fa-plus me-1"></i>${t('addCustomRule')}
      </button>
      <button type="button" class="btn btn-outline-danger btn-sm" onclick="clearAllCustomRules()">
        <i class="fas fa-trash me-1"></i>${t('clearAll')}
      </button>
    </div>
    <div id="customRules">
      <!-- Custom rules will be dynamically added here -->
    </div>
    <div id="emptyFormMessage" class="empty-state" style="display: none;">
      <i class="fas fa-plus-circle fa-2x mb-2"></i>
      <p>${t('noCustomRulesForm')}</p>
    </div>
  </div>
`;

const generateJSONView = () => `
  <div id="jsonView" class="custom-rules-view">
    <div class="conversion-controls">
      <button type="button" class="btn btn-outline-danger btn-sm" onclick="clearAllCustomRules()">
        <i class="fas fa-trash me-1"></i>${t('clearAll')}
      </button>
    </div>
    <div id="customRulesJSON">
      <div class="mb-2">
        <label class="form-label">${t('customRuleJSON')}</label>
        <div class="json-textarea-container">
          <textarea class="form-control json-textarea" name="customRuleJSON[]" rows="15"
                    oninput="validateJSONRealtime(this)"></textarea>
          <div class="json-validation-message" style="display: none;"></div>
        </div>
      </div>
    </div>
  </div>
`;

const generateBaseConfigSection = () => `
  <div class="form-section">
    <div class="form-section-title d-flex align-items-center">
      ${t('baseConfigSettings')}
      <span class="tooltip-icon ms-2">
        <i class="fas fa-question-circle"></i>
        <span class="tooltip-content">
          ${t('baseConfigTooltip')}
        </span>
      </span>
    </div>
    <div class="mb-3">
      <select class="form-select" id="configType">
        <option value="singbox">SingBox (JSON)</option>
        <option value="clash">Clash (YAML)</option>
      </select>
    </div>
    <div class="mb-3">
      <textarea class="form-control" id="configEditor" rows="3" placeholder="Paste your custom config here..."></textarea>
    </div>
    <div class="d-flex gap-2">
      <button type="button" class="btn btn-secondary" onclick="saveConfig()">${t('saveConfig')}</button>
      <button type="button" class="btn btn-outline-danger" onclick="clearConfig()">
        <i class="fas fa-trash-alt me-2"></i>${t('clearConfig')}
      </button>
    </div>
  </div>
`;

const generateUASection = () => `
  <div class="form-section">
    <div class="form-section-title d-flex align-items-center">
      ${t('UASettings')}
      <span class="tooltip-icon ms-2">
        <i class="fas fa-question-circle"></i>
        <span class="tooltip-content">
          ${t('UAtip')}
        </span>
      </span>
    </div>
    <input type="text" class="form-control" id="customUA" placeholder="curl/7.74.0">
  </div>
`;

const applyPredefinedRulesFunction = () => `
  function applyPredefinedRules() {
    const predefinedRules = document.getElementById('predefinedRules').value;
    const checkboxes = document.querySelectorAll('.rule-checkbox');

    checkboxes.forEach(checkbox => {
      checkbox.checked = false;
    });

    if (predefinedRules === 'custom') {
      return;
    }

    const rulesToApply = ${JSON.stringify(PREDEFINED_RULE_SETS)};

    rulesToApply[predefinedRules].forEach(rule => {
      const checkbox = document.getElementById(rule);
      if (checkbox) {
        checkbox.checked = true;
      }
    });
  }

  // Add event listeners to checkboxes
  document.addEventListener('DOMContentLoaded', function() {
    const checkboxes = document.querySelectorAll('.rule-checkbox');
    checkboxes.forEach(checkbox => {
      checkbox.addEventListener('change', function() {
        const predefinedSelect = document.getElementById('predefinedRules');
        if (predefinedSelect.value !== 'custom') {
          predefinedSelect.value = 'custom';
        }
      });
    });
  });
`;

const tooltipFunction = () => `
  function initTooltips() {
    const tooltips = document.querySelectorAll('.tooltip-icon');
    tooltips.forEach(tooltip => {
      tooltip.addEventListener('click', (e) => {
        e.stopPropagation();
        const content = tooltip.querySelector('.tooltip-content');
        content.style.display = content.style.display === 'block' ? 'none' : 'block';
      });
    });

    document.addEventListener('click', () => {
      const openTooltips = document.querySelectorAll('.tooltip-content[style="display: block;"]');
      openTooltips.forEach(tooltip => {
        tooltip.style.display = 'none';
      });
    });
  }

  document.addEventListener('DOMContentLoaded', initTooltips);
`;

const submitFormFunction = () => `
  function submitForm(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    const inputString = formData.get('input');

    const userAgent = document.getElementById('customUA').value;

    // Save form data to localStorage
    localStorage.setItem('inputTextarea', inputString);
    localStorage.setItem('advancedToggle', document.getElementById('advancedToggle').checked);
    localStorage.setItem('userAgent', document.getElementById('customUA').value);
    localStorage.setItem('configEditor', document.getElementById('configEditor').value);
    localStorage.setItem('configType', document.getElementById('configType').value);

    let selectedRules;
    const predefinedRules = document.getElementById('predefinedRules').value;
    if (predefinedRules !== 'custom') {
      selectedRules = predefinedRules;
    } else {
      selectedRules = Array.from(document.querySelectorAll('input[name="selectedRules"]:checked'))
        .map(checkbox => checkbox.value);
    }

    const configId = new URLSearchParams(window.location.search).get('configId') || '';
    const customRules = parseCustomRules();

    const configParam = configId ? \`&configId=\${configId}\` : '';
    const xrayUrl = \`\${window.location.origin}/xray?config=\${encodeURIComponent(inputString)}&ua=\${encodeURIComponent(userAgent)}\${configParam}\`;
    const singboxUrl = \`\${window.location.origin}/singbox?config=\${encodeURIComponent(inputString)}&ua=\${encodeURIComponent(userAgent)}&selectedRules=\${encodeURIComponent(JSON.stringify(selectedRules))}&customRules=\${encodeURIComponent(JSON.stringify(customRules))}\${configParam}\`;
    const clashUrl = \`\${window.location.origin}/clash?config=\${encodeURIComponent(inputString)}&ua=\${encodeURIComponent(userAgent)}&selectedRules=\${encodeURIComponent(JSON.stringify(selectedRules))}&customRules=\${encodeURIComponent(JSON.stringify(customRules))}\${configParam}\`;
    const surgeUrl = \`\${window.location.origin}/surge?config=\${encodeURIComponent(inputString)}&ua=\${encodeURIComponent(userAgent)}&selectedRules=\${encodeURIComponent(JSON.stringify(selectedRules))}&customRules=\${encodeURIComponent(JSON.stringify(customRules))}\${configParam}\`;

    document.getElementById('xrayLink').value = xrayUrl;
    document.getElementById('singboxLink').value = singboxUrl;
    document.getElementById('clashLink').value = clashUrl;
    document.getElementById('surgeLink').value = surgeUrl;

    // 显示自动更新部分
    showAutoUpdateSection();

    // 延迟检查自动更新状态（确保链接已经更新）
    setTimeout(() => {
      checkCurrentLinkForAutoUpdate();
    }, 100);

    // Show the subscribe part
    const subscribeLinksContainer = document.getElementById('subscribeLinksContainer');
    subscribeLinksContainer.classList.remove('hide');
    subscribeLinksContainer.classList.add('show');

    // 保存订阅链接容器显示状态
    localStorage.setItem('subscribeLinksVisible', 'true');

    // Scroll to the subscribe part
    subscribeLinksContainer.scrollIntoView({ behavior: 'smooth' });
  }

  function parseUrlAndFillForm(url) {
    try {
      const urlObj = new URL(url);
      const params = new URLSearchParams(urlObj.search);

      // Parse base configuration
      const config = params.get('config');
      if (config) {
        const decodedConfig = decodeURIComponent(config);
        document.getElementById('inputTextarea').value = decodedConfig;
      }

      // Parse UserAgent
      const ua = params.get('ua');
      if (ua) {
        document.getElementById('customUA').value = decodeURIComponent(ua);
      }

      // Parse rule selection
      const selectedRules = params.get('selectedRules');
      if (selectedRules) {
        try {
          const decodedRules = decodeURIComponent(selectedRules).replace(/^"|"$/g, '');
          // Check if it's a predefined rule set
          if (['minimal', 'balanced', 'comprehensive'].includes(decodedRules)) {
            const predefinedRules = document.getElementById('predefinedRules');
            predefinedRules.value = decodedRules;
            // Apply predefined rules to checkboxes
            const rulesToApply = ${JSON.stringify(PREDEFINED_RULE_SETS)};
            const checkboxes = document.querySelectorAll('.rule-checkbox');
            checkboxes.forEach(checkbox => {
              checkbox.checked = rulesToApply[decodedRules].includes(checkbox.value);
            });
          } else {
            // Handle custom rules (JSON array)
            const rules = JSON.parse(decodedRules);
            if (Array.isArray(rules)) {
              document.getElementById('predefinedRules').value = 'custom';
              const checkboxes = document.querySelectorAll('.rule-checkbox');
              checkboxes.forEach(checkbox => {
                checkbox.checked = rules.includes(checkbox.value);
              });
            }
          }
        } catch (e) {
          console.error('Error parsing selected rules:', e);
        }
      }

      // Parse custom rules
      const customRules = params.get('customRules');
      if (customRules) {
        try {
          const rules = JSON.parse(decodeURIComponent(customRules));
          if (Array.isArray(rules) && rules.length > 0) {
            // Clear existing custom rules
            document.querySelectorAll('.custom-rule').forEach(rule => rule.remove());

            // Switch to JSON view and write rules
            switchCustomRulesTab('json');
            const jsonTextarea = document.querySelector('#customRulesJSON textarea');
            if (jsonTextarea) {
              jsonTextarea.value = JSON.stringify(rules, null, 2);
              validateJSONRealtime(jsonTextarea);
            }
          }
        } catch (e) {
          console.error('Error parsing custom rules:', e);
        }
      }

      // Parse configuration ID
      const configId = params.get('configId');
      if (configId) {
        // Fetch configuration content
        fetch(\`/config?type=singbox&id=\${configId}\`)
          .then(response => response.json())
          .then(data => {
            if (data.content) {
              document.getElementById('configEditor').value = data.content;
              document.getElementById('configType').value = data.type || 'singbox';
            }
          })
          .catch(error => console.error('Error fetching config:', error));
      }

      // Show advanced options
      document.getElementById('advancedToggle').checked = true;
      document.getElementById('advancedOptions').classList.add('show');
    } catch (e) {
      console.error('Error parsing URL:', e);
    }
  }

  // 检测是否是短链
  function isShortUrl(url) {
    try {
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split('/');
      return pathParts.length >= 3 && ['b', 'c', 'x', 's'].includes(pathParts[1]) && pathParts[2];
    } catch (error) {
      return false;
    }
  }

  // 自动解析短链
  async function autoResolveShortUrl(shortUrl) {
    try {
      const response = await fetch(\`/resolve?url=\${encodeURIComponent(shortUrl)}\`);

      if (response.ok) {
        const data = await response.json();
        const originalUrl = data.originalUrl;

        // 用原始URL替换输入框中的短链
        document.getElementById('inputTextarea').value = originalUrl;

        // 解析原始URL到表单
        parseUrlAndFillForm(originalUrl);

        return true;
      } else {
        console.error('Failed to resolve short URL:', await response.text());
        return false;
      }
    } catch (error) {
      console.error('Error resolving short URL:', error);
      return false;
    }
  }

  // Add input box event listener
  document.addEventListener('DOMContentLoaded', function() {
    const inputTextarea = document.getElementById('inputTextarea');
    let lastValue = '';

    inputTextarea.addEventListener('input', async function() {
      const currentValue = this.value.trim();

      if (currentValue && currentValue !== lastValue) {
        // 首先检查是否是短链
        if (isShortUrl(currentValue)) {
          await autoResolveShortUrl(currentValue);
        }
        // 然后检查是否是项目生成的完整链接
        else if (currentValue.includes('/singbox?') ||
                 currentValue.includes('/clash?') ||
                 currentValue.includes('/surge?') ||
                 currentValue.includes('/xray?')) {
          parseUrlAndFillForm(currentValue);
        }
      }

      lastValue = currentValue;
    });
  });

  function loadSavedFormData() {
    const savedInput = localStorage.getItem('inputTextarea');
    if (savedInput) {
      document.getElementById('inputTextarea').value = savedInput;
    }

    const advancedToggle = localStorage.getItem('advancedToggle');
    if (advancedToggle) {
      document.getElementById('advancedToggle').checked = advancedToggle === 'true';
      if (advancedToggle === 'true') {
        document.getElementById('advancedOptions').classList.add('show');
      }
    }

    // Load userAgent
    const savedUA = localStorage.getItem('userAgent');
    if (savedUA) {
      document.getElementById('customUA').value = savedUA;
    }

    // Load configEditor and configType
    const savedConfig = localStorage.getItem('configEditor');
    const savedConfigType = localStorage.getItem('configType');

    if (savedConfig) {
      document.getElementById('configEditor').value = savedConfig;
    }
    if (savedConfigType) {
      document.getElementById('configType').value = savedConfigType;
    }

    const savedCustomPath = localStorage.getItem('customPath');
    if (savedCustomPath) {
      document.getElementById('customShortCode').value = savedCustomPath;
    }

    // 恢复订阅链接容器显示状态
    const subscribeLinksVisible = localStorage.getItem('subscribeLinksVisible') === 'true';
    const subscribeLinksContainer = document.getElementById('subscribeLinksContainer');
    if (subscribeLinksVisible && subscribeLinksContainer) {
      subscribeLinksContainer.classList.remove('hide');
      subscribeLinksContainer.classList.add('show');
    }

    loadSelectedRules();
  }

  function saveSelectedRules() {
    const selectedRules = Array.from(document.querySelectorAll('input[name="selectedRules"]:checked'))
      .map(checkbox => checkbox.value);
    localStorage.setItem('selectedRules', JSON.stringify(selectedRules));
    localStorage.setItem('predefinedRules', document.getElementById('predefinedRules').value);
  }

  function loadSelectedRules() {
    const savedRules = localStorage.getItem('selectedRules');
    if (savedRules) {
      const rules = JSON.parse(savedRules);
      rules.forEach(rule => {
        const checkbox = document.querySelector(\`input[name="selectedRules"][value="\${rule}"]\`);
        if (checkbox) {
          checkbox.checked = true;
        }
      });
    }

    const savedPredefinedRules = localStorage.getItem('predefinedRules');
    if (savedPredefinedRules) {
      document.getElementById('predefinedRules').value = savedPredefinedRules;
    }
  }

  document.addEventListener('DOMContentLoaded', function() {
    loadSavedFormData();
    document.getElementById('encodeForm').addEventListener('submit', submitForm);
    document.getElementById('clearFormBtn').addEventListener('click', clearFormData);
  });
`;

const customRuleFunctions = () => `
  let customRuleCount = 0;
  let currentTab = 'form';

  function switchCustomRulesTab(tab) {
    try {
      currentTab = tab;

      // Update tab buttons
      document.querySelectorAll('.custom-rules-tab').forEach(btn => btn.classList.remove('active'));
      document.getElementById(tab + 'Tab').classList.add('active');

      // Update views
      document.querySelectorAll('.custom-rules-view').forEach(view => view.classList.remove('active'));
      document.getElementById(tab + 'View').classList.add('active');

      // Automatic view conversion
      if (tab === 'json') {
        convertFormToJSON();
      } else {
        convertJSONToForm();
      }

      updateEmptyMessages();
    } catch (error) {
      console.error('Error switching tabs:', error);
      // Ensure the view is correctly displayed if an error occurs during the switch
      document.querySelectorAll('.custom-rules-view').forEach(view => view.classList.remove('active'));
      document.getElementById(tab + 'View').classList.add('active');
    }
  }

  function updateEmptyMessages() {
    const hasFormRules = document.querySelectorAll('.custom-rule').length > 0;
    document.getElementById('emptyFormMessage').style.display = hasFormRules ? 'none' : 'block';
  }

  function addCustomRule() {
    const customRulesDiv = document.getElementById('customRules');
    const newRuleDiv = document.createElement('div');
    newRuleDiv.className = 'custom-rule mb-3 p-3 border rounded';
    newRuleDiv.dataset.ruleId = customRuleCount++;
    newRuleDiv.innerHTML = \`
      <div class="d-flex justify-content-between align-items-center mb-2">
        <h6 class="mb-0">${t('customRule')} #\${getNextRuleNumber()}</h6>
        <button type="button" class="btn btn-danger btn-sm" onclick="removeRule(this)">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div class="row">
        <div class="col-md-6 mb-2">
          <label class="form-label">${t('customRuleOutboundName')}</label>
          <input type="text" class="form-control" name="customRuleName[]" placeholder="${t('customRuleOutboundName')}" required>
        </div>
        <div class="col-md-6 mb-2">
          <label class="form-label">${t('customRuleGeoSite')}</label>
          <span class="tooltip-icon">
            <i class="fas fa-question-circle"></i>
            <span class="tooltip-content">
              ${t('customRuleGeoSiteTooltip')}
            </span>
          </span>
          <input type="text" class="form-control" name="customRuleSite[]" placeholder="${t('customRuleGeoSitePlaceholder')}">
        </div>
      </div>
      <div class="row">
        <div class="col-md-6 mb-2">
          <label class="form-label">${t('customRuleGeoIP')}</label>
          <span class="tooltip-icon">
            <i class="fas fa-question-circle"></i>
            <span class="tooltip-content">
              ${t('customRuleGeoIPTooltip')}
            </span>
          </span>
          <input type="text" class="form-control" name="customRuleIP[]" placeholder="${t('customRuleGeoIPPlaceholder')}">
        </div>
        <div class="col-md-6 mb-2">
          <label class="form-label">${t('customRuleDomainSuffix')}</label>
          <input type="text" class="form-control" name="customRuleDomainSuffix[]" placeholder="${t('customRuleDomainSuffixPlaceholder')}">
        </div>
      </div>
      <div class="row">
        <div class="col-md-6 mb-2">
          <label class="form-label">${t('customRuleDomainKeyword')}</label>
          <input type="text" class="form-control" name="customRuleDomainKeyword[]" placeholder="${t('customRuleDomainKeywordPlaceholder')}">
        </div>
        <div class="col-md-6 mb-2">
          <label class="form-label">${t('customRuleIPCIDR')}</label>
          <input type="text" class="form-control" name="customRuleIPCIDR[]" placeholder="${t('customRuleIPCIDRPlaceholder')}">
        </div>
      </div>
      <div class="mb-2">
        <label class="form-label">${t('customRuleProtocol')}</label>
        <span class="tooltip-icon">
          <i class="fas fa-question-circle"></i>
          <span class="tooltip-content">
            ${t('customRuleProtocolTooltip')}
          </span>
        </span>
        <input type="text" class="form-control" name="customRuleProtocol[]" placeholder="${t('customRuleProtocolPlaceholder')}">
      </div>
    \`;
    customRulesDiv.appendChild(newRuleDiv);
    updateEmptyMessages();

    // Switch to form tab if not already there
    if (currentTab !== 'form') {
      switchCustomRulesTab('form');
    }
  }

  function clearAllCustomRules() {
    if (confirm('${t('confirmClearAllRules')}')) {
      document.querySelectorAll('.custom-rule').forEach(rule => rule.remove());
      document.querySelectorAll('.custom-rule-json').forEach(rule => rule.remove());
      customRuleCount = 0;
      updateEmptyMessages();
    }
  }

  // Add a function to get the next rule number
  function getNextRuleNumber() {
    const existingRules = document.querySelectorAll('.custom-rule');
    return existingRules.length + 1;
  }

  // Modify the remove rule function to update the sequence number
  function removeRule(button) {
    const ruleDiv = button.closest('.custom-rule, .custom-rule-json');
    if (ruleDiv) {
      ruleDiv.remove();
      // Update the sequence number of the remaining rules
      document.querySelectorAll('.custom-rule').forEach((rule, index) => {
        const titleElement = rule.querySelector('h6');
        if (titleElement) {
          titleElement.textContent = \`${t('customRule')} #\${index + 1}\`;
        }
      });
      updateEmptyMessages();
    }
  }

  function convertFormToJSON() {
    const formRules = [];
    document.querySelectorAll('.custom-rule').forEach(rule => {
      const ruleData = {
        name: rule.querySelector('input[name="customRuleName[]"]').value || '',
        site: rule.querySelector('input[name="customRuleSite[]"]').value || '',
        ip: rule.querySelector('input[name="customRuleIP[]"]').value || '',
        domain_suffix: rule.querySelector('input[name="customRuleDomainSuffix[]"]').value || '',
        domain_keyword: rule.querySelector('input[name="customRuleDomainKeyword[]"]').value || '',
        ip_cidr: rule.querySelector('input[name="customRuleIPCIDR[]"]').value || '',
        protocol: rule.querySelector('input[name="customRuleProtocol[]"]').value || ''
      };

      // Only add rules that have at least a name
      if (ruleData.name.trim()) {
        formRules.push(ruleData);
      }
    });

    // Update JSON editor content
    const jsonTextarea = document.querySelector('#customRulesJSON textarea');
    if (jsonTextarea) {
      jsonTextarea.value = JSON.stringify(formRules, null, 2);
      validateJSONRealtime(jsonTextarea);
    }
  }

  function convertJSONToForm() {
    const jsonTextarea = document.querySelector('#customRulesJSON textarea');
    if (!jsonTextarea || !jsonTextarea.value.trim()) {
      return;
    }

    try {
      const rules = JSON.parse(jsonTextarea.value.trim());
      if (!Array.isArray(rules)) {
        throw new Error('${t('mustBeArray')}');
      }

      // Clear existing form rules
      document.querySelectorAll('.custom-rule').forEach(rule => rule.remove());

      // Convert each JSON rule to form
      rules.forEach((ruleData, index) => {
        if (ruleData && ruleData.name) {
          const customRulesDiv = document.getElementById('customRules');
          const newRuleDiv = document.createElement('div');
          newRuleDiv.className = 'custom-rule mb-3 p-3 border rounded';
          newRuleDiv.innerHTML = \`
            <div class="d-flex justify-content-between align-items-center mb-2">
              <h6 class="mb-0">${t('customRule')} #\${index + 1}</h6>
              <button type="button" class="btn btn-danger btn-sm" onclick="removeRule(this)">
                <i class="fas fa-times"></i>
              </button>
            </div>
            <div class="row">
              <div class="col-md-6 mb-2">
                <label class="form-label">${t('customRuleOutboundName')}</label>
                <input type="text" class="form-control" name="customRuleName[]" value="\${ruleData.name || ''}" required>
              </div>
              <div class="col-md-6 mb-2">
                <label class="form-label">${t('customRuleGeoSite')}</label>
                <input type="text" class="form-control" name="customRuleSite[]" value="\${ruleData.site || ''}">
              </div>
            </div>
            <div class="row">
              <div class="col-md-6 mb-2">
                <label class="form-label">${t('customRuleGeoIP')}</label>
                <input type="text" class="form-control" name="customRuleIP[]" value="\${ruleData.ip || ''}">
              </div>
              <div class="col-md-6 mb-2">
                <label class="form-label">${t('customRuleDomainSuffix')}</label>
                <input type="text" class="form-control" name="customRuleDomainSuffix[]" value="\${ruleData.domain_suffix || ''}">
              </div>
            </div>
            <div class="row">
              <div class="col-md-6 mb-2">
                <label class="form-label">${t('customRuleDomainKeyword')}</label>
                <input type="text" class="form-control" name="customRuleDomainKeyword[]" value="\${ruleData.domain_keyword || ''}">
              </div>
              <div class="col-md-6 mb-2">
                <label class="form-label">${t('customRuleIPCIDR')}</label>
                <input type="text" class="form-control" name="customRuleIPCIDR[]" value="\${ruleData.ip_cidr || ''}">
              </div>
            </div>
            <div class="mb-2">
              <label class="form-label">${t('customRuleProtocol')}</label>
              <input type="text" class="form-control" name="customRuleProtocol[]" value="\${ruleData.protocol || ''}">
            </div>
          \`;
          customRulesDiv.appendChild(newRuleDiv);
        }
      });
    } catch (error) {
      console.error('Error converting JSON to form:', error);
      // If an error occurs during the conversion, clear the form view
      document.querySelectorAll('.custom-rule').forEach(rule => rule.remove());
    }

    updateEmptyMessages();
  }

  function validateJSONRealtime(textarea) {
    const messageDiv = textarea.parentNode.querySelector('.json-validation-message');
    const jsonText = textarea.value.trim();
    // Clear previous validation state
    textarea.classList.remove('json-valid', 'json-invalid');
    messageDiv.style.display = 'none';
    messageDiv.classList.remove('valid', 'invalid');
    if (!jsonText) {
      return; // Don't validate empty textarea
    }
    try {
      const rules = JSON.parse(jsonText);
      if (!Array.isArray(rules)) {
        throw new Error('${t('mustBeArray')}');
      }
      const errors = [];
      rules.forEach((ruleData, ruleIndex) => {
        if (!ruleData.name || !ruleData.name.trim()) {
          errors.push(\`${t('rule')} #\${ruleIndex + 1}: ${t('nameRequired')}\`);
        }
      });
      if (errors.length > 0) {
        throw new Error(errors.join('; '));
      }
      // Valid JSON
      textarea.classList.add('json-valid');
      messageDiv.textContent = \`✓ ${t('validJSON')} (\${rules.length} ${t('rules')})\`;
      messageDiv.classList.add('valid');
      messageDiv.style.display = 'block';
    } catch (error) {
      // Invalid JSON
      textarea.classList.add('json-invalid');
      messageDiv.textContent = \`✗ \${error.message}\`;
      messageDiv.classList.add('invalid');
      messageDiv.style.display = 'block';
    }
  }

  function validateJSON() {
    let allValid = true;
    let errorMessages = [];
    document.querySelectorAll('.custom-rule-json').forEach((rule, index) => {
      const textarea = rule.querySelector('textarea[name="customRuleJSON[]"]');
      validateJSONRealtime(textarea);
      if (textarea.classList.contains('json-invalid')) {
        allValid = false;
        const messageDiv = textarea.parentNode.querySelector('.json-validation-message');
        errorMessages.push(\`JSON #\${index + 1}: \${messageDiv.textContent.replace('✗ ', '')}\`);
      }
    });
    if (allValid) {
      alert('${t('allJSONValid')}');
    } else {
      alert('${t('jsonValidationErrors')}:\\n\\n' + errorMessages.join('\\n'));
    }
  }

  function parseCustomRules() {
    const customRules = [];

    // Process ordinary form rules
    document.querySelectorAll('.custom-rule').forEach(rule => {
      const ruleData = {
        name: rule.querySelector('input[name="customRuleName[]"]').value || '',
        site: rule.querySelector('input[name="customRuleSite[]"]').value || '',
        ip: rule.querySelector('input[name="customRuleIP[]"]').value || '',
        domain_suffix: rule.querySelector('input[name="customRuleDomainSuffix[]"]').value || '',
        domain_keyword: rule.querySelector('input[name="customRuleDomainKeyword[]"]').value || '',
        ip_cidr: rule.querySelector('input[name="customRuleIPCIDR[]"]').value || '',
        protocol: rule.querySelector('input[name="customRuleProtocol[]"]').value || ''
      };

      if (ruleData.name.trim()) {
        customRules.push(ruleData);
      }
    });

    // Process JSON rules
    const jsonTextarea = document.querySelector('#customRulesJSON textarea');
    if (jsonTextarea && jsonTextarea.value.trim()) {
      try {
        const jsonRules = JSON.parse(jsonTextarea.value.trim());
        if (Array.isArray(jsonRules)) {
          customRules.push(...jsonRules.filter(r => r.name && r.name.trim()));
        }
      } catch (error) {
        console.error('Error parsing JSON rules:', error);
      }
    }

    return customRules;
  }

  // Initialize interface state
  document.addEventListener('DOMContentLoaded', function() {
    updateEmptyMessages();

    // Initialize real-time validation for JSON textarea
    const jsonTextarea = document.querySelector('#customRulesJSON textarea');
    if (jsonTextarea && jsonTextarea.value.trim()) {
      validateJSONRealtime(jsonTextarea);
    }

    // Initialize tooltips for dynamically added content
    const observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach(function(node) {
            if (node.nodeType === 1 && node.querySelectorAll) {
              initTooltips();
            }
          });
        }
      });
    });

    observer.observe(document.getElementById('customRules'), { childList: true, subtree: true });
  });

  function addCustomRuleJSON() {
    const customRulesJSONDiv = document.getElementById('customRulesJSON');
    const newRuleDiv = document.createElement('div');
    newRuleDiv.className = 'custom-rule-json mb-3 p-3 border rounded';
    newRuleDiv.dataset.ruleId = customRuleCount++;
    newRuleDiv.innerHTML = \`
      <div class="d-flex justify-content-between align-items-center mb-2">
        <h6 class="mb-0">${t('customRuleJSON')}</h6>
        <button type="button" class="btn btn-danger btn-sm" onclick="removeRule(this)">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div class="mb-2">
        <label class="form-label">${t('customRuleJSON')}</label>
        <div class="json-textarea-container">
          <textarea class="form-control json-textarea" name="customRuleJSON[]" rows="15"
                    oninput="validateJSONRealtime(this)"></textarea>
          <div class="json-validation-message" style="display: none;"></div>
        </div>
      </div>
    \`;
    customRulesJSONDiv.appendChild(newRuleDiv);
    updateEmptyMessages();
  }
`;

const generateQRCodeFunction = () => `
  function generateQRCode(id) {
    const input = document.getElementById(id);
    const text = input.value;
    if (!text) {
      alert('No link provided!');
      return;
    }
    try {
      const qr = qrcode(0, 'M');
      qr.addData(text);
      qr.make();

      const moduleCount = qr.getModuleCount();
      const cellSize = Math.max(2, Math.min(8, Math.floor(300 / moduleCount)));
      const margin = Math.floor(cellSize * 0.5);

      const qrImage = qr.createDataURL(cellSize, margin);

      const modal = document.createElement('div');
      modal.className = 'qr-modal';
      modal.innerHTML = \`
        <div class="qr-card">
          <img src="\${qrImage}" alt="QR Code">
          <p>Scan QR Code</p>
        </div>
      \`;

      document.body.appendChild(modal);

      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          closeQRModal();
        }
      });

      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          closeQRModal();
        }
      });

      requestAnimationFrame(() => {
        modal.classList.add('show');
      });
    } catch (error) {
      console.error('Error in generating:', error);
      alert('Try to use short links!');
    }
  }

  function closeQRModal() {
    const modal = document.querySelector('.qr-modal');
    if (modal) {
      modal.classList.remove('show');
      modal.addEventListener('transitionend', () => {
        document.body.removeChild(modal);
      }, { once: true });
    }
  }
`;

const saveConfig = () => `
  function saveConfig() {
    const configEditor = document.getElementById('configEditor');
    const configType = document.getElementById('configType').value;
    const config = configEditor.value;

    localStorage.setItem('configEditor', config);
    localStorage.setItem('configType', configType);

    fetch('/config?type=' + configType, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: configType,
        content: config
      })
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to save configuration');
      }
      return response.text();
    })
    .then(configId => {
      const currentUrl = new URL(window.location.href);
      currentUrl.searchParams.set('configId', configId);
      window.history.pushState({}, '', currentUrl);
      alert('Configuration saved successfully!');
    })
    .catch(error => {
      alert('Error: ' + error.message);
    });
  }
`;

const clearConfig = () => `
  function clearConfig() {
    document.getElementById('configEditor').value = '';
    const currentUrl = new URL(window.location.href);
    currentUrl.searchParams.delete('configId');
    window.history.pushState({}, '', currentUrl);
    localStorage.removeItem('configEditor');
  }
`;

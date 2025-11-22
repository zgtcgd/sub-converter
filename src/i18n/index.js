import {checkStartsWith} from "../utils.js";
// 定义语言包
const translations = {
  'zh-CN': {
    missingInput: '缺少输入参数',
    missingConfig: '缺少配置参数',
    missingUrl: '缺少URL参数',
    shortUrlNotFound: '短链接未找到',
    invalidShortUrl: '无效的短链接',
    internalError: '内部服务器错误',
    notFound: '未找到',
    invalidFormat: '无效格式：',
    defaultRules: ['广告拦截', '谷歌服务', '国外媒体', '电报消息'],
    configValidationError: '配置验证错误：',
    pageDescription: '在线订阅链接转换工具',
    pageKeywords: '订阅链接,转换,V2rayN,SingBox,Clash,Surge',
    pageTitle: '在线订阅转换',
    ogTitle: '在线订阅链接转换工具',
    ogDescription: '一个强大的订阅链接转换工具，支持多种客户端格式',
    shareUrls: '订阅链接或单节点',
    urlPlaceholder: '在此输入base64(V2rayN)订阅链接或单节点(每行一个). . .',
    advancedOptions: '自定义规则',
    baseConfigSettings: '基础配置设置',
    baseConfigTooltip: '在此处自定义您的基础配置',
    saveConfig: '保存配置',
    clearConfig: '清除配置',
    convert: '开始转换',
    clear: '清除',
    customPath: '自定义路径',
    savedPaths: '已保存的路径',
    shortenLinks: '生成短链接',
    ruleSelection: '规则选择',
    ruleSelectionTooltip: '选择您需要的规则集',
    custom: '自定义',
    minimal: '最小化',
    balanced: '均衡',
    comprehensive: '全面',
    addCustomRule: '添加自定义规则',
    customRuleOutboundName: '出站名称*',
    customRuleGeoSite: 'Geo-Site规则集',
    customRuleGeoSiteTooltip: 'SingBox中的Site规则来自 https://github.com/lyc8503/sing-box-rules，这意味着您的自定义规则必须在该仓库中',
    customRuleGeoSitePlaceholder: '例如：google,anthropic',
    customRuleGeoIP: 'Geo-IP规则集',
    customRuleGeoIPTooltip: 'SingBox中的IP规则来自 https://github.com/lyc8503/sing-box-rules，这意味着您的自定义规则必须在该仓库中',
    customRuleGeoIPPlaceholder: '例如：private,cn',
    customRuleDomainSuffix: '域名后缀',
    customRuleDomainSuffixPlaceholder: '域名后缀（用逗号分隔）',
    customRuleDomainKeyword: '域名关键词',
    customRuleDomainKeywordPlaceholder: '域名关键词（用逗号分隔）',
    customRuleIPCIDR: 'IP CIDR',
    customRuleIPCIDRPlaceholder: 'IP CIDR（用逗号分隔）',
    customRuleProtocol: '协议类型',
    customRuleProtocolTooltip: '特定流量类型的协议规则。更多详情：https://sing-box.sagernet.org/configuration/route/sniff/',
    customRuleProtocolPlaceholder: '协议（用逗号分隔，例如：http,ssh,dns）',
    removeCustomRule: '移除',
    addCustomRuleJSON: '添加JSON规则',
    customRuleJSON: 'JSON规则',
    customRuleJSONTooltip: '使用JSON格式添加自定义规则，支持批量添加',
    customRulesSection: '自定义规则',
    customRulesSectionTooltip: '创建自定义路由规则来控制特定流量的路由行为。支持表单和JSON两种编辑方式，可以相互转换。',
    customRulesForm: '表单视图',
    customRulesJSON: 'JSON视图',
    customRule: '自定义规则',
    convertToJSON: '转换为JSON',
    convertToForm: '转换为表单',
    validateJSON: '验证JSON',
    clearAll: '清空所有',
    addJSONRule: '添加JSON规则',
    noCustomRulesForm: '点击"添加自定义规则"开始创建规则',
    noCustomRulesJSON: '点击"添加JSON规则"开始创建规则',
    confirmClearAllRules: '确定要清空所有自定义规则吗？',
    noFormRulesToConvert: '没有表单规则可以转换',
    noValidJSONToConvert: '没有有效的JSON规则可以转换',
    convertedFromForm: '从表单转换',
    convertedFromJSON: '从JSON转换',
    mustBeArray: '必须是数组格式',
    nameRequired: '规则名称是必需的',
    invalidJSON: '无效的JSON格式',
    allJSONValid: '所有JSON规则都有效！',
    jsonValidationErrors: 'JSON验证错误',
    // 自动更新部分
    autoUpdate: '自动更新',
    updateInterval: '更新间隔',
    minutes: '分钟',
    hours: '小时',
    days: '天',
    startAutoUpdate: '开始自动更新',
    stopAutoUpdate: '停止自动更新',
    autoUpdateRunning: '自动更新运行中',
    autoUpdateStopped: '自动更新已停止',
    lastUpdate: '最后更新',
    pleaseEnterValidInterval: '请输入有效的更新间隔',
    pleaseGenerateShortLinkFirst: '请先生成短链接',
    invalidShortLink: '无效的短链接',
    autoUpdateFailed: '自动更新失败',

    // 规则名称和出站名称的翻译
    outboundNames: {
      'Auto Select': '♻️ 自动选择',
      'Node Select': '🚀 节点选择',
      'Fall Back': '🐟 漏网之鱼',
      'Ad Block': '🚫 广告拦截',
      'AI Services': '🤖 AI 服务',
      'Bilibili': '📺 哔哩哔哩',
      'Youtube': '▶️ 油管视频',
      'Google': '🔍 谷歌服务',
      'Private': '🏠 私有网络',
      'Location:CN': '🔒 国内服务',
      'Telegram': '📲 电报消息',
      'Github': '🐱 Github',
      'Microsoft': 'Ⓜ️ 微软服务',
      'Apple': '🍏 苹果服务',
      'Social Media': '🌐 社交媒体',
      'Streaming': '🎬 流媒体',
      'Gaming': '🎮 游戏平台',
      'Education': '🎓 教育资源',
      'Financial': '💰 金融服务',
      'Cloud Services': '☁️ 云服务',
      'Non-China': '🌏 非中国',
      'GLOBAL': 'GLOBAL'
    },
    UASettings: '自定义UserAgent',
    UAtip: '默认值curl/7.74.0',
    apiDoc: {
      title: 'API 文档',
      back: '返回首页',
      nav: {
        main: '主要接口',
        params: '参数说明',
        examples: '示例',
        response: '返回格式',
        more: '更多'
      },
      intro: '本项目支持多种订阅转换、短链生成等 API，适合自动化脚本、第三方集成等场景，可直接将带参数的链接放进代理软件直接订阅，无需打开网页手动转换。',
      mainList: [
        { path: 'GET /singbox?config=...', desc: '生成 Singbox 配置' },
        { path: 'GET /clash?config=...', desc: '生成 Clash 配置' },
        { path: 'GET /surge?config=...', desc: '生成 Surge 配置' },
        { path: 'GET /xray?config=...', desc: '生成 Xray 配置' },
        { path: 'GET /shorten?url=...', desc: '生成短链' },
        { path: 'GET /b/:code /c/:code /x/:code /s/:code', desc: '短链跳转' },
        { path: 'POST /config', desc: '存储自定义配置' }
      ],
      params: [
        { key: 'config', desc: '必填，原始订阅内容（Base64或明文）' },
        { key: 'selectedRules', desc: '可选，预设规则集 key 或自定义规则' },
        { key: 'customRules', desc: '可选，自定义规则（JSON）' },
        { key: 'lang', desc: '可选，界面语言（zh-CN/en/fa/ru）' },
        { key: 'ua', desc: '可选，User-Agent' }
      ],
      examples: [
        {
          title: 'Singbox 配置示例',
          example: 'https://your-domain/singbox?config=订阅链接或单节点',
          desc: 'config 参数支持订阅链接（Base64）或单节点(多个订阅链接或多个单节点用","或"%0A"或"\\n"分隔)，可直接将拼接的链接作为订阅链接实时更新节点'
        },
        {
          title: 'Clash 配置示例',
          example: 'https://your-domain/clash?config=订阅链接或单节点',
          desc: 'config 参数支持订阅链接（Base64）或单节点(多个订阅链接或多个单节点用","或"%0A"或"\\n"分隔)，可直接将拼接的链接作为订阅链接实时更新节点'
        },
        {
          title: 'Surge 配置示例',
          example: 'https://your-domain/surge?config=订阅链接或单节点',
          desc: 'config 参数支持订阅链接（Base64）或单节点(多个订阅链接或多个单节点用","或"%0A"或"\\n"分隔)，可直接将拼接的链接作为订阅链接实时更新节点'
        },
        {
          title: 'Xray 配置示例',
          example: 'https://your-domain/xray?config=订阅链接或单节点',
          desc: 'config 参数支持订阅链接（Base64）或单节点(多个订阅链接或多个单节点用","或"%0A"或"\\n"分隔)，可直接将拼接的链接作为订阅链接实时更新节点'
        },
        {
          title: '生成短链',
          example: 'https://your-domain/shorten?url=https://your-domain/clash?config=订阅链接或单节点',
          desc: 'url 参数为需要生成短链的完整链接，可直接将生成的作为订阅链接实时更新'
        },
        {
          title: '短链跳转',
          example: 'https://your-domain/c/xxxxxxx',
          desc: 'xxxxxxx 为短链生成的 code，支持 /b/、/c/、/s/、/x/ 四种前缀'
        },
        {
          title: '存储自定义配置',
          example: 'POST https://your-domain/config',
          desc: 'type 支持 clash/singbox/surge/xray，content 为配置内容（JSON 或 YAML 字符串）',
          extra: 'Content-Type: application/json\n{\n  "type": "clash",\n  "content": "..."\n}'
        }
      ],
      response: [
        '配置接口返回 YAML/JSON/明文',
        '短链接口返回 JSON 或 302 跳转',
        '错误时返回 4xx/5xx 状态码及错误信息'
      ],
      more: [
        '详细参数和进阶用法请参考 <a href="https://github.com/eooce/sub-converter/blob/main/docs/APIDoc.md" target="_blank">APIDoc.md</a>',
        '如有疑问欢迎 issue 或 PR'
      ],
      labels: {
        example: '示例：',
        desc: '说明：'
      },
    },
  },
  'en-US': {
    missingInput: 'Missing input parameter',
    missingConfig: 'Missing config parameter',
    missingUrl: 'Missing URL parameter',
    shortUrlNotFound: 'Short URL not found',
    invalidShortUrl: 'Invalid short URL',
    internalError: 'Internal Server Error',
    notFound: 'Not Found',
    invalidFormat: 'Invalid format: ',
    defaultRules: ['Ad Blocking', 'Google Services', 'Foreign Media', 'Telegram'],
    configValidationError: 'Config validation error: ',
    pageDescription: 'Subscription Link Converter',
    pageKeywords: 'subscription link,converter,Xray,SingBox,Clash,Surge',
    pageTitle: 'Subscription Link Converter',
    ogTitle: 'Subscription Link Converter',
    ogDescription: 'A powerful subscription link converter supporting multiple client formats',
    shareUrls: 'Subscription Link',
    urlPlaceholder: 'Enter your base64(V2rayN) subscription link here...',
    advancedOptions: 'Custom Rules',
    baseConfigSettings: 'Base Config Settings',
    baseConfigTooltip: 'Customize your base configuration here',
    saveConfig: 'Save Config',
    clearConfig: 'Clear Config',
    convert: 'Convert',
    clear: 'Clear',
    customPath: 'Custom Path',
    savedPaths: 'Saved Paths',
    shortenLinks: 'Generate Short Links',
    ruleSelection: 'Rule Selection',
    ruleSelectionTooltip: 'Select your desired rule sets',
    custom: 'Custom',
    minimal: 'Minimal',
    balanced: 'Balanced',
    comprehensive: 'Comprehensive',
    addCustomRule: 'Add Custom Rule',
    customRuleOutboundName: 'Outbound Name*',
    customRuleGeoSite: 'Geo-Site Rules',
    customRuleGeoSiteTooltip: 'SingBox Site rules come from https://github.com/lyc8503/sing-box-rules, which means your custom rules must be in that repository',
    customRuleGeoSitePlaceholder: 'e.g., google,anthropic',
    customRuleGeoIP: 'Geo-IP Rules',
    customRuleGeoIPTooltip: 'SingBox IP rules come from https://github.com/lyc8503/sing-box-rules, which means your custom rules must be in that repository',
    customRuleGeoIPPlaceholder: 'e.g., private,cn',
    customRuleDomainSuffix: 'Domain Suffix',
    customRuleDomainSuffixPlaceholder: 'Domain suffixes (comma separated)',
    customRuleDomainKeyword: 'Domain Keyword',
    customRuleDomainKeywordPlaceholder: 'Domain keywords (comma separated)',
    customRuleIPCIDR: 'IP CIDR',
    customRuleIPCIDRPlaceholder: 'IP CIDR (comma separated)',
    customRuleProtocol: 'Protocol Type',
    customRuleProtocolTooltip: 'Protocol rules for specific traffic types. More details: https://sing-box.sagernet.org/configuration/route/sniff/',
    customRuleProtocolPlaceholder: 'Protocols (comma separated, e.g., http,ssh,dns)',
    removeCustomRule: 'Remove',
    addCustomRuleJSON: 'Add JSON Rule',
    customRuleJSON: 'JSON Rule',
    customRuleJSONTooltip: 'Add custom rules using JSON format, supports batch adding',
    customRulesSection: 'Custom Rules',
    customRulesSectionTooltip: 'Create custom routing rules to control traffic routing behavior. Supports both form and JSON editing modes with bidirectional conversion.',
    customRulesForm: 'Form View',
    customRulesJSON: 'JSON View',
    customRule: 'Custom Rule',
    convertToJSON: 'Convert to JSON',
    convertToForm: 'Convert to Form',
    validateJSON: 'Validate JSON',
    clearAll: 'Clear All',
    addJSONRule: 'Add JSON Rule',
    noCustomRulesForm: 'Click "Add Custom Rule" to start creating rules',
    noCustomRulesJSON: 'Click "Add JSON Rule" to start creating rules',
    confirmClearAllRules: 'Are you sure you want to clear all custom rules?',
    noFormRulesToConvert: 'No form rules to convert',
    noValidJSONToConvert: 'No valid JSON rules to convert',
    convertedFromForm: 'Converted from Form',
    convertedFromJSON: 'Converted from JSON',
    mustBeArray: 'Must be an array format',
    nameRequired: 'Rule name is required',
    invalidJSON: 'Invalid JSON format',
    allJSONValid: 'All JSON rules are valid!',
    jsonValidationErrors: 'JSON validation errors',
    autoUpdate: 'Auto Update',
    updateInterval: 'Update Interval',
    minutes: 'Minutes',
    hours: 'hours',
    days: 'days',
    startAutoUpdate: 'Start Auto Update',
    stopAutoUpdate: 'Stop Auto Update',
    autoUpdateRunning: 'Auto Update Running',
    autoUpdateStopped: 'Auto Update Stopped',
    lastUpdate: 'Last Update',
    pleaseEnterValidInterval: 'Please enter a valid interval',
    pleaseGenerateShortLinkFirst: 'Please generate short link first',
    invalidShortLink: 'Invalid short link',
    autoUpdateFailed: 'Auto update failed',
    outboundNames:{
      'Auto Select': '♻️ Auto Select',
      'Node Select': '🚀 Node Select',
      'Fall Back': '🐟 Fall Back',
      'Ad Block': '🚫 Ad Blocking',
      'AI Services': '🤖 AI Services',
      'Bilibili': '📺 Bilibili',
      'Youtube': '▶️ Youtube',
      'Google': '🔍 Google Services',
      'Private': '🏠 Private Network',
      'Location:CN': '🔒 China Services',
      'Telegram': '📲 Telegram',
      'Github': '🐱 Github',
      'Microsoft': 'Ⓜ️ Microsoft Services',
      'Apple': '🍏 Apple Services',
      'Social Media': '🌐 Social Media',
      'Streaming': '🎬 Streaming',
      'Gaming': '🎮 Gaming Platform',
      'Education': '🎓 Education Resources',
      'Financial': '💰 Financial Services',
      'Cloud Services': '☁️ Cloud Services',
      'Non-China': '🌏 Non-China',
      'GLOBAL': 'GLOBAL'
    },
    UASettings: 'Custom UserAgent',
    UAtip: 'By default it will use curl/7.74.0',
    apiDoc: {
      title: 'API Doc',
      back: 'Back to Home',
      nav: {
        main: 'Main Endpoints',
        params: 'Parameters',
        examples: 'Examples',
        response: 'Response Format',
        more: 'More'
      },
      intro: 'This project supports various subscription conversion and short link generation APIs, suitable for automation scripts and third-party integration. You can directly use the parameterized link in your proxy software without manual conversion.',
      mainList: [
        { path: 'GET /singbox?config=...', desc: 'Generate Singbox config' },
        { path: 'GET /clash?config=...', desc: 'Generate Clash config' },
        { path: 'GET /surge?config=...', desc: 'Generate Surge config' },
        { path: 'GET /xray?config=...', desc: 'Generate Xray config' },
        { path: 'GET /shorten?url=...', desc: 'Generate short link' },
        { path: 'GET /b/:code /c/:code /x/:code /s/:code', desc: 'Short link redirect' },
        { path: 'POST /config', desc: 'Store custom config' }
      ],
      params: [
        { key: 'config', desc: 'Required, original subscription content (Base64 or plain text)' },
        { key: 'selectedRules', desc: 'Optional, preset rule set key or custom rules' },
        { key: 'customRules', desc: 'Optional, custom rules (JSON)' },
        { key: 'lang', desc: 'Optional, interface language (zh-CN/en/fa/ru)' },
        { key: 'ua', desc: 'Optional, User-Agent' }
      ],
      examples: [
        {
          title: 'Singbox Example',
          example: 'https://your-domain/singbox?config=subscription or node',
          desc: 'config supports subscription (Base64) or single node(Multiple subscription links or multiple single nodes separated by “,” or "%0A" or "\\n"), can be used as a real-time updating subscription link'
        },
        {
          title: 'Clash Example',
          example: 'https://your-domain/clash?config=subscription or node',
          desc: 'config supports subscription (Base64) or single node(Multiple subscription links or multiple single nodes separated by “,” or "%0A" or "\\n"), can be used as a real-time updating subscription link'
        },
        {
          title: 'Surge Example',
          example: 'https://your-domain/surge?config=subscription or node',
          desc: 'config supports subscription (Base64) or single node(Multiple subscription links or multiple single nodes separated by “,” or "%0A" or "\\n"), can be used as a real-time updating subscription link'
        },
        {
          title: 'Xray Example',
          example: 'https://your-domain/xray?config=subscription or node',
          desc: 'config supports subscription (Base64) or single node(Multiple subscription links or multiple single nodes separated by “,” or "%0A" or "\\n"), can be used as a real-time updating subscription link'
        },
        {
          title: 'Shorten',
          example: 'https://your-domain/shorten?url=https://your-domain/clash?config=subscription or node',
          desc: 'url is the full link to be shortened, can be used as a real-time updating subscription link'
        },
        {
          title: 'Short Link Redirect',
          example: 'https://your-domain/c/xxxxxxx',
          desc: 'xxxxxxx is the code generated by the short link, supports /b/, /c/, /s/, /x/ prefixes'
        },
        {
          title: 'Store Custom Config',
          example: 'POST https://your-domain/config',
          desc: 'type supports clash/singbox/surge/xray, content is the config content (JSON or YAML string)',
          extra: 'Content-Type: application/json\n{\n  "type": "clash",\n  "content": "..."\n}'
        }
      ],
      response: [
        'Config endpoints return YAML/JSON/plain text',
        'Short link endpoints return JSON or 302 redirect',
        'On error, returns 4xx/5xx status code and error message'
      ],
      more: [
        'See <a href="https://github.com/eooce/sub-converter/blob/main/docs/APIDoc.md" target="_blank">APIDoc.md</a> for advanced usage',
        'For questions, welcome issue or PR'
      ],
      labels: {
        example: 'Example:',
        desc: 'Note:'
      },
    },
  }
};

// 当前语言
let currentLang = 'zh-CN';


// 设置语言
export function setLanguage(lang) {
  if(translations[lang]) {
    currentLang = lang;
  } else if(checkStartsWith(lang, 'en')) {
    currentLang = 'en-US';
  } else {
    currentLang = 'zh-CN';
  }
}

// 获取翻译，支持嵌套键值访问
export function t(key) {
  const keys = key.split('.');
  let value = translations[currentLang];
  
  // 逐级查找翻译值
  for (const k of keys) {
    value = value?.[k];
    if (value === undefined) {
      if (checkStartsWith(key, 'outboundNames.')) {
        return key.split('.')[1];
      }
      // 找不到翻译时返回原始键名
      return key;
    }
  }
  return value;
}

// 获取当前语言
export function getCurrentLang() {
  return currentLang;
}

// 获取默认规则列表
export function getDefaultRules() {
  return translations[currentLang].defaultRules;
}

// 获取出站集
export function getOutbounds(){
  return translations[currentLang].outboundNames;
}

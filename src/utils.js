const PATH_LENGTH = 7;

// 自定义的字符串前缀检查函数
export function checkStartsWith(str, prefix) {
  if (str === undefined || str === null || prefix === undefined || prefix === null) {
    return false;
  }
  str = String(str);
  prefix = String(prefix);
  return str.slice(0, prefix.length) === prefix;
}


// Base64 编码函数
export function encodeBase64(input) {
	const encoder = new TextEncoder();
	const utf8Array = encoder.encode(input);
	let binaryString = '';
	for (const byte of utf8Array) {
		binaryString += String.fromCharCode(byte);
	}
	return base64FromBinary(binaryString);
}

// Base64 解码函数
export function decodeBase64(input) {
	const binaryString = base64ToBinary(input);
	const bytes = new Uint8Array(binaryString.length);
	for (let i = 0; i < binaryString.length; i++) {
		bytes[i] = binaryString.charCodeAt(i);
	}
	const decoder = new TextDecoder();
	return decoder.decode(bytes);
}

// 将二进制字符串转换为 Base64（编码）
export function base64FromBinary(binaryString) {
	const base64Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
	let base64String = '';
	let padding = '';

	const remainder = binaryString.length % 3;
	if (remainder > 0) {
		padding = '='.repeat(3 - remainder);
		binaryString += '\0'.repeat(3 - remainder);
	}

	for (let i = 0; i < binaryString.length; i += 3) {
		const bytes = [
			binaryString.charCodeAt(i),
			binaryString.charCodeAt(i + 1),
			binaryString.charCodeAt(i + 2)
		];
		const base64Index1 = bytes[0] >> 2;
		const base64Index2 = ((bytes[0] & 3) << 4) | (bytes[1] >> 4);
		const base64Index3 = ((bytes[1] & 15) << 2) | (bytes[2] >> 6);
		const base64Index4 = bytes[2] & 63;

		base64String += base64Chars[base64Index1] +
			base64Chars[base64Index2] +
			base64Chars[base64Index3] +
			base64Chars[base64Index4];
	}

	return base64String.slice(0, base64String.length - padding.length) + padding;
}

// 将 Base64 转换为二进制字符串（解码）
export function base64ToBinary(base64String) {
	const base64Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
	let binaryString = '';
	base64String = base64String.replace(/=+$/, ''); // 去掉末尾的 '='

	for (let i = 0; i < base64String.length; i += 4) {
		const bytes = [
			base64Chars.indexOf(base64String[i]),
			base64Chars.indexOf(base64String[i + 1]),
			base64Chars.indexOf(base64String[i + 2]),
			base64Chars.indexOf(base64String[i + 3])
		];
		const byte1 = (bytes[0] << 2) | (bytes[1] >> 4);
		const byte2 = ((bytes[1] & 15) << 4) | (bytes[2] >> 2);
		const byte3 = ((bytes[2] & 3) << 6) | bytes[3];

		if (bytes[1] !== -1) binaryString += String.fromCharCode(byte1);
		if (bytes[2] !== -1) binaryString += String.fromCharCode(byte2);
		if (bytes[3] !== -1) binaryString += String.fromCharCode(byte3);
	}

	return binaryString;
}
export function DeepCopy(obj) {
	if (obj === null || typeof obj !== 'object') {
		return obj;
	}
	if (Array.isArray(obj)) {
		return obj.map(item => DeepCopy(item));
	}
	const newObj = {};
	for (const key in obj) {
		if (Object.prototype.hasOwnProperty.call(obj, key)) {
			newObj[key] = DeepCopy(obj[key]);
		}
	}
	return newObj;
}

export function GenerateWebPath(length = PATH_LENGTH) {
	const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
	let result = ''
	for (let i = 0; i < length; i++) {
		result += characters.charAt(Math.floor(Math.random() * characters.length))
	}
	return result
}

export function parseServerInfo(serverInfo) {
	let host, port;
	if (serverInfo.startsWith('[')) {
	  const closeBracketIndex = serverInfo.indexOf(']');
	  host = serverInfo.slice(1, closeBracketIndex);
	  port = serverInfo.slice(closeBracketIndex + 2); // +2 to skip ']:'
	} else {
	  const lastColonIndex = serverInfo.lastIndexOf(':');
	  host = serverInfo.slice(0, lastColonIndex);
	  port = serverInfo.slice(lastColonIndex + 1);
	}
	return { host, port: parseInt(port) };
  }
  
  export function parseUrlParams(url) {
	const [, rest] = url.split('://');
	const [addressPart, ...remainingParts] = rest.split('?');
	const paramsPart = remainingParts.join('?');
  
	const [paramsOnly, ...fragmentParts] = paramsPart.split('#');
	const searchParams = new URLSearchParams(paramsOnly);
	const params = Object.fromEntries(searchParams.entries());

	let name = fragmentParts.length > 0 ? fragmentParts.join('#') : '';
	try {
	    name = decodeURIComponent(name);
	} catch (error) { };
	
	return { addressPart, params, name };
  }
  
  export function createTlsConfig(params) {
	let tls = { enabled: false };
	if (params.security != 'none') {
	  tls = {
		enabled: true,
		server_name: params.sni || params.host,
		insecure: !!params?.allowInsecure || !!params?.insecure || !!params?.allow_insecure,
		// utls: {
		//   enabled: true,
		//   fingerprint: "chrome"
		// },
	  };
	  if (params.security === 'reality') {
		tls.reality = {
		  enabled: true,
		  public_key: params.pbk,
		  short_id: params.sid,
		};
	  }
	}
	return tls;
  }

export function createTransportConfig(params) {
	return {
		type: params.type,
		path: params.path ?? undefined,
		...(params.host && {'headers': {'host': params.host}}),
		...(params.type === 'grpc' && {
			service_name: params.serviceName ?? undefined,
		})
	};
}

// ========== 以下为从 sublink-worker 移植的增强工具函数 ==========

// 订阅内容多级解码: 直接→分行→base64→URL解码, 自动容错
// 输入可以是: 明文节点列表 / base64编码 / URL编码, 返回字符串或字符串数组
export function tryDecodeSubscriptionLines(input, { decodeUriComponent = false } = {}) {
	if (typeof input !== 'string') {
		return input;
	}

	const trimmed = input.trim();
	if (trimmed === '') {
		return trimmed;
	}

	const splitIfMultiple = (value) => {
		if (typeof value !== 'string') {
			return value;
		}

		const normalized = value.replace(/\r\n/g, '\n');
		const segments = normalized
			.split('\n')
			.map(segment => segment.trim())
			.filter(segment => segment !== '');

		if (segments.length > 1 && segments.some(segment => segment.includes('://'))) {
			return segments;
		}

		return normalized.trim();
	};

	const directResult = splitIfMultiple(trimmed);
	if (Array.isArray(directResult)) {
		return directResult;
	}
	if (typeof directResult === 'string' && directResult.includes('://')) {
		return directResult;
	}

	try {
		let decoded = decodeBase64(trimmed);
		if (decodeUriComponent && decoded.includes('%')) {
			const hasProtocolScheme = decoded.includes('://');
			if (!hasProtocolScheme) {
				try {
					decoded = decodeURIComponent(decoded);
				} catch (_) {
					// ignore URI decode errors and fall back to the decoded string
				}
			}
		}

		const decodedResult = splitIfMultiple(decoded);
		if (Array.isArray(decodedResult)) {
			return decodedResult;
		}
		if (typeof decodedResult === 'string' && decodedResult.includes('://')) {
			return decodedResult;
		}
	} catch (_) {
		// ignore decoding errors and return the original trimmed input
	}

	// 兼容原有行为: 若输入含 % 编码且非 base64, 尝试 URL 解码兜底
	if (decodeUriComponent && trimmed.includes('%')) {
		try {
			const uriDecoded = decodeURIComponent(trimmed);
			const uriResult = splitIfMultiple(uriDecoded);
			if (Array.isArray(uriResult)) {
				return uriResult;
			}
			if (typeof uriResult === 'string' && uriResult.includes('://')) {
				return uriResult;
			}
		} catch (_) {
			// ignore URI decode errors
		}
	}

	return trimmed;
}

// 解析布尔值: 支持 true/false/1/0/字符串
// 无法识别时返回 fallback(默认 undefined)
export function parseBool(value, fallback = undefined) {
	if (value === undefined || value === null) return fallback;
	if (typeof value === 'boolean') return value;
	const lowered = String(value).toLowerCase();
	if (lowered === 'true' || lowered === '1') return true;
	if (lowered === 'false' || lowered === '0') return false;
	return fallback;
}

// 安全解析数字: 非数字返回 undefined
export function parseMaybeNumber(value) {
	if (value === undefined || value === null) return undefined;
	const num = Number(value);
	return Number.isNaN(num) ? undefined : num;
}

// 逗号分隔字符串 → 数组 (自动 trim 并过滤空项)
// 输入: "US,JP, HK" → ["US","JP","HK"]
export function parseArray(value) {
	if (!value) return undefined;
	if (Array.isArray(value)) return value;
	return String(value)
		.split(',')
		.map(entry => entry.trim())
		.filter(entry => entry.length > 0);
}

// FNV-1a 哈希: 用 URL 生成稳定 provider 名
// 例: createStableProviderName(url) → "_auto_provider_xxxxxxxx"
const FNV_32_OFFSET_BASIS = 0x811c9dc5;
const FNV_32_PRIME = 0x01000193;
export function createStableProviderName(url) {
	if (typeof url !== 'string' || url.trim() === '') {
		throw new Error('Provider URL must be a non-empty string');
	}

	const normalizedUrl = url.trim();
	let hash = FNV_32_OFFSET_BASIS;
	for (let i = 0; i < normalizedUrl.length; i++) {
		hash ^= normalizedUrl.charCodeAt(i);
		hash = Math.imul(hash, FNV_32_PRIME);
	}

	return `_auto_provider_${(hash >>> 0).toString(36)}`;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
export function get<T, Default = undefined>(obj: T, path: string, defaultValue: Default = undefined as Default): any {
  // 如果路径为空，直接返回整个对象
  if (path === '') {
    return obj;
  }

  // 分割路径，保留空字符串以处理数组
  const keys = path.replace(/\[(\w*)\]/g, '.$1').split('.');

  let result: any = obj;
  for (let i = 0; i < keys.length; i++) {
    if (keys[i] === '') {
      // 处理数组迭代
      if (!Array.isArray(result)) {
        // 如果预期为数组但实际不是，则返回默认值
        return defaultValue;
      }
      return result.map(item => get(item, keys.slice(i + 1).join('.'), defaultValue));
    } else if (result !== null && result !== undefined) {
      // 使用 typeof 检查以确保 result 是对象或数组
      if (typeof result === 'object' && keys[i] in result) {
        // 正常的键值访问
        result = result[keys[i]];
      } else {
        // 如果路径不存在或 result 不是对象/数组，返回默认值
        return defaultValue;
      }
    } else {
      // 如果路径不存在，返回默认值
      return defaultValue;
    }
  }

  return result;
}

export function set<T>(obj: T, path: string, value: any): T {
  if (path === '') {
    throw new Error('Path must be a non-empty string');
  }

  const keys = path
    .replace(/\[(\w*)]/g, '.$1')
    .split('.')
    .filter(Boolean);
  let current: any = obj;

  for (let i = 0; i < keys.length; i++) {
    if (i === keys.length - 1) {
      // 最后一个键，设置值
      current[keys[i]] = value;
    } else {
      // 如果下一个键不存在或不是对象/数组，则创建一个对象
      if (!(keys[i] in current) || (typeof current[keys[i]] !== 'object' && typeof current[keys[i]] !== 'function')) {
        current[keys[i]] = {};
      }
      current = current[keys[i]];
    }
  }

  return obj;
}

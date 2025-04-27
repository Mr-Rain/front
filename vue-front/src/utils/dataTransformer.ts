/**
 * 数据转换工具
 * 用于前后端数据字段命名风格转换
 * 前端使用 camelCase，后端使用 snake_case
 */

/**
 * 将对象的键从 snake_case 转换为 camelCase
 * @param obj 要转换的对象
 * @returns 转换后的对象
 */
export function snakeToCamel(obj: any): any {
  if (obj === null || typeof obj !== 'object') return obj;
  
  if (Array.isArray(obj)) {
    return obj.map(item => snakeToCamel(item));
  }
  
  return Object.keys(obj).reduce((result, key) => {
    // 转换键名：snake_case 到 camelCase
    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    // 递归转换值
    result[camelKey] = snakeToCamel(obj[key]);
    return result;
  }, {} as any);
}

/**
 * 将对象的键从 camelCase 转换为 snake_case
 * @param obj 要转换的对象
 * @returns 转换后的对象
 */
export function camelToSnake(obj: any): any {
  if (obj === null || typeof obj !== 'object') return obj;
  
  if (Array.isArray(obj)) {
    return obj.map(item => camelToSnake(item));
  }
  
  return Object.keys(obj).reduce((result, key) => {
    // 转换键名：camelCase 到 snake_case
    const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
    // 递归转换值
    result[snakeKey] = camelToSnake(obj[key]);
    return result;
  }, {} as any);
}

/**
 * 检测对象是否包含 snake_case 键
 * @param obj 要检测的对象
 * @returns 是否包含 snake_case 键
 */
export function hasSnakeCase(obj: any): boolean {
  if (obj === null || typeof obj !== 'object') return false;
  
  return Object.keys(obj).some(key => key.includes('_'));
}

/**
 * 检测对象是否包含 camelCase 键
 * @param obj 要检测的对象
 * @returns 是否包含 camelCase 键
 */
export function hasCamelCase(obj: any): boolean {
  if (obj === null || typeof obj !== 'object') return false;
  
  return Object.keys(obj).some(key => /[a-z][A-Z]/.test(key));
}

/**
 * 智能转换对象的键名风格
 * 根据对象的键名风格自动选择转换方向
 * @param obj 要转换的对象
 * @param targetStyle 目标风格，'camel' 或 'snake'
 * @returns 转换后的对象
 */
export function transformKeys(obj: any, targetStyle: 'camel' | 'snake' = 'camel'): any {
  if (obj === null || typeof obj !== 'object') return obj;
  
  if (targetStyle === 'camel') {
    if (hasSnakeCase(obj)) {
      return snakeToCamel(obj);
    }
  } else if (targetStyle === 'snake') {
    if (hasCamelCase(obj)) {
      return camelToSnake(obj);
    }
  }
  
  return obj;
}

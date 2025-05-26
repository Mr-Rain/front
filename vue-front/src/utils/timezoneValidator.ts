/**
 * 时区处理验证工具
 * 用于测试和验证时区信息的正确性
 */

import {
  parseDateTime,
  formatDateTime,
  hasTimezoneInfo,
  isValidISO8601,
  convertTimezone
} from './dateUtils';

/**
 * 时区验证结果接口
 */
export interface TimezoneValidationResult {
  isValid: boolean;
  hasTimezone: boolean;
  originalFormat: string;
  parsedDate: Date | null;
  formattedDate: string;
  warnings: string[];
  errors: string[];
}

/**
 * 批量验证结果接口
 */
export interface BatchValidationResult {
  totalTests: number;
  passedTests: number;
  failedTests: number;
  results: TimezoneValidationResult[];
  summary: string;
}

/**
 * API时区验证结果接口
 */
export interface ApiTimezoneValidationResult {
  isValid: boolean;
  dateFields: string[];
  issues: string[];
}

/**
 * 验证日期字符串的时区处理
 * @param dateString 日期字符串
 * @returns 验证结果
 */
export function validateTimezoneHandling(dateString: string): TimezoneValidationResult {
  const result: TimezoneValidationResult = {
    isValid: false,
    hasTimezone: false,
    originalFormat: dateString,
    parsedDate: null,
    formattedDate: '',
    warnings: [],
    errors: []
  };

  try {
    // 检查是否为有效的ISO 8601格式
    const isISO8601 = isValidISO8601(dateString);
    if (isISO8601) {
      result.warnings.push('检测到ISO 8601格式');
    }

    // 检查是否包含时区信息
    result.hasTimezone = hasTimezoneInfo(dateString);
    if (!result.hasTimezone) {
      result.warnings.push('缺少时区信息，将假设为北京时间');
    }

    // 尝试解析日期
    result.parsedDate = parseDateTime(dateString);
    if (!result.parsedDate) {
      result.errors.push('日期解析失败');
      return result;
    }

    // 尝试格式化日期
    result.formattedDate = formatDateTime(result.parsedDate, { format: 'full' });
    if (!result.formattedDate) {
      result.errors.push('日期格式化失败');
      return result;
    }

    result.isValid = true;
  } catch (error) {
    result.errors.push(`验证过程中发生错误: ${error}`);
  }

  return result;
}

/**
 * 批量验证多个日期字符串
 * @param dateStrings 日期字符串数组
 * @returns 验证结果数组
 */
export function batchValidateTimezone(dateStrings: string[]): TimezoneValidationResult[] {
  return dateStrings.map(dateString => validateTimezoneHandling(dateString));
}

/**
 * 生成时区处理测试用例
 * @returns 测试用例数组
 */
export function generateTimezoneTestCases(): string[] {
  return [
    // ISO 8601格式（带时区）
    '2024-01-15T14:30:45.123+08:00',
    '2024-01-15T06:30:45.123Z',
    '2024-01-15T14:30:45+08:00',

    // ISO 8601格式（无时区）
    '2024-01-15T14:30:45.123',
    '2024-01-15T14:30:45',

    // 旧格式
    '2024-01-15 14:30:45',
    '2024-01-15 14:30:45.123',

    // 其他格式
    '2024/01/15 14:30:45',
    'Mon Jan 15 2024 14:30:45 GMT+0800',

    // 边界情况
    '',
    'invalid-date',
    '2024-13-45 25:70:80'
  ];
}

/**
 * 运行完整的时区处理测试
 * @returns 测试报告
 */
export function runTimezoneTest(): BatchValidationResult {
  const testCases = generateTimezoneTestCases();
  const results = batchValidateTimezone(testCases);

  const passedTests = results.filter(r => r.isValid).length;
  const failedTests = results.filter(r => !r.isValid).length;

  const summary = `
时区处理测试报告:
- 总测试数: ${testCases.length}
- 通过测试: ${passedTests}
- 失败测试: ${failedTests}
- 成功率: ${((passedTests / testCases.length) * 100).toFixed(2)}%

主要问题:
${results
  .filter(r => r.errors.length > 0)
  .map(r => `- ${r.originalFormat}: ${r.errors.join(', ')}`)
  .join('\n')}

警告信息:
${results
  .filter(r => r.warnings.length > 0)
  .map(r => `- ${r.originalFormat}: ${r.warnings.join(', ')}`)
  .join('\n')}
  `;

  return {
    totalTests: testCases.length,
    passedTests,
    failedTests,
    results,
    summary
  };
}

/**
 * 检查API响应中的时区信息完整性
 * @param apiResponse API响应对象
 * @returns 检查结果
 */
export function validateApiTimezoneInfo(apiResponse: any): ApiTimezoneValidationResult {
  const result: ApiTimezoneValidationResult = {
    isValid: true,
    dateFields: [],
    issues: []
  };

  // 递归检查对象中的日期字段
  function checkObject(obj: any, path: string = ''): void {
    if (!obj || typeof obj !== 'object') return;

    for (const [key, value] of Object.entries(obj)) {
      const currentPath = path ? `${path}.${key}` : key;

      // 检查是否为日期字段（通常以Time结尾或包含date）
      if (typeof value === 'string' &&
          (key.toLowerCase().includes('time') ||
           key.toLowerCase().includes('date') ||
           key.toLowerCase().includes('created') ||
           key.toLowerCase().includes('updated'))) {

        result.dateFields.push(currentPath);

        // 验证时区信息
        if (!hasTimezoneInfo(value)) {
          result.issues.push(`${currentPath}: 缺少时区信息 (${value})`);
          result.isValid = false;
        }

        // 验证格式
        if (!isValidISO8601(value)) {
          result.issues.push(`${currentPath}: 非ISO 8601格式 (${value})`);
          result.isValid = false;
        }
      } else if (Array.isArray(value)) {
        value.forEach((item, index) => {
          checkObject(item, `${currentPath}[${index}]`);
        });
      } else if (typeof value === 'object') {
        checkObject(value, currentPath);
      }
    }
  }

  checkObject(apiResponse);
  return result;
}

/**
 * 格式化验证结果为可读的报告
 * @param result 验证结果
 * @returns 格式化的报告字符串
 */
export function formatValidationReport(result: TimezoneValidationResult): string {
  const status = result.isValid ? '✅ 通过' : '❌ 失败';
  const timezone = result.hasTimezone ? '✅ 包含时区' : '⚠️ 缺少时区';

  let report = `
验证结果: ${status}
原始格式: ${result.originalFormat}
时区信息: ${timezone}
解析结果: ${result.parsedDate ? result.parsedDate.toISOString() : '解析失败'}
格式化结果: ${result.formattedDate || '格式化失败'}
`;

  if (result.warnings.length > 0) {
    report += `\n警告:\n${result.warnings.map(w => `- ${w}`).join('\n')}`;
  }

  if (result.errors.length > 0) {
    report += `\n错误:\n${result.errors.map(e => `- ${e}`).join('\n')}`;
  }

  return report;
}

/**
 * 创建时区验证的快速测试函数
 * @param dateString 要测试的日期字符串
 * @returns 简化的验证结果
 */
export function quickTimezoneCheck(dateString: string): {
  isValid: boolean;
  hasTimezone: boolean;
  message: string;
} {
  const result = validateTimezoneHandling(dateString);

  return {
    isValid: result.isValid,
    hasTimezone: result.hasTimezone,
    message: result.isValid
      ? `✅ 验证通过${result.hasTimezone ? '（包含时区）' : '（缺少时区）'}`
      : `❌ 验证失败: ${result.errors.join(', ')}`
  };
}

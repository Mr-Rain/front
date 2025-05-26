/**
 * 日期工具函数
 * 统一处理ISO 8601格式和向后兼容旧格式
 */

// ISO 8601格式验证正则表达式
const ISO_8601_REGEX = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?([+-]\d{2}:\d{2}|Z)$/;

// 旧格式验证正则表达式 'YYYY-MM-DD HH:mm:ss'
const OLD_FORMAT_REGEX = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;

/**
 * 验证是否为有效的ISO 8601格式
 * @param dateString 日期字符串
 * @returns 是否为有效的ISO 8601格式
 */
export function isValidISO8601(dateString: string): boolean {
  return ISO_8601_REGEX.test(dateString);
}

/**
 * 统一的日期时间解析函数
 * 支持ISO 8601格式和兼容旧格式
 * 增强时区信息处理
 * @param dateString 日期字符串
 * @returns Date对象或null
 */
export function parseDateTime(dateString: string | null | undefined): Date | null {
  if (!dateString) return null;

  try {
    // 优先按ISO 8601格式解析
    if (isValidISO8601(dateString)) {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        console.warn('ISO 8601格式日期解析失败:', dateString);
        return null;
      }
      return date;
    }

    // 兼容旧格式 'YYYY-MM-DD HH:mm:ss'
    if (OLD_FORMAT_REGEX.test(dateString)) {
      // 假设为北京时间，添加时区信息
      const dateWithTimezone = dateString + '+08:00';
      const date = new Date(dateWithTimezone);
      if (isNaN(date.getTime())) {
        console.warn('旧格式日期解析失败:', dateString);
        return null;
      }
      return date;
    }

    // 其他格式尝试直接解析
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      console.warn('无法解析的日期格式:', dateString);
      return null;
    }

    // 检查是否缺少时区信息
    if (!hasTimezoneInfo(dateString)) {
      console.info('日期字符串缺少时区信息，假设为北京时间:', dateString);
    }

    return date;
  } catch (error) {
    console.error('日期解析失败:', dateString, error);
    return null;
  }
}

/**
 * 检查日期字符串是否包含时区信息
 * @param dateString 日期字符串
 * @returns 是否包含时区信息
 */
export function hasTimezoneInfo(dateString: string): boolean {
  // 检查是否包含时区偏移（+HH:mm, -HH:mm, Z）
  const timezoneRegex = /([+-]\d{2}:\d{2}|Z)$/;
  return timezoneRegex.test(dateString);
}

/**
 * 格式化选项接口
 */
export interface FormatOptions {
  format?: 'full' | 'date' | 'time' | 'short';
  timezone?: string;
}

/**
 * 时区转换选项接口
 */
export interface TimezoneConvertOptions {
  fromTimezone?: string;
  toTimezone?: string;
}

/**
 * 时区转换工具函数
 * 增强版本，提供更精确的时区转换逻辑
 * @param dateInput 日期输入
 * @param options 转换选项
 * @returns 转换后的Date对象或null
 */
export function convertTimezone(
  dateInput: string | Date | null | undefined,
  options: TimezoneConvertOptions = {}
): Date | null {
  const { fromTimezone = 'UTC', toTimezone = 'Asia/Shanghai' } = options;

  let date: Date | null;
  if (typeof dateInput === 'string') {
    date = parseDateTime(dateInput);
  } else if (dateInput instanceof Date) {
    date = dateInput;
  } else {
    console.warn('convertTimezone: 无效的日期输入', dateInput);
    return null;
  }

  if (!date || isNaN(date.getTime())) {
    console.warn('convertTimezone: 日期解析失败', dateInput);
    return null;
  }

  try {
    // 如果输入已经包含时区信息，且目标时区与当前时区相同，直接返回
    if (typeof dateInput === 'string' && hasTimezoneInfo(dateInput)) {
      console.info('convertTimezone: 输入已包含时区信息，直接返回', dateInput);
      return date;
    }

    // 验证时区名称的有效性
    if (!isValidTimezone(fromTimezone) || !isValidTimezone(toTimezone)) {
      console.error('convertTimezone: 无效的时区名称', { fromTimezone, toTimezone });
      return date;
    }

    // 如果源时区和目标时区相同，直接返回
    if (fromTimezone === toTimezone) {
      console.info('convertTimezone: 源时区和目标时区相同，无需转换');
      return date;
    }

    // 使用Intl.DateTimeFormat进行精确的时区转换
    const sourceTime = date.getTime();

    // 获取源时区的偏移量
    const sourceOffset = getTimezoneOffset(sourceTime, fromTimezone);
    // 获取目标时区的偏移量
    const targetOffset = getTimezoneOffset(sourceTime, toTimezone);

    // 计算时区差异并调整时间
    const offsetDifference = targetOffset - sourceOffset;
    const convertedTime = sourceTime + offsetDifference;

    const convertedDate = new Date(convertedTime);

    console.info('convertTimezone: 时区转换完成', {
      original: date.toISOString(),
      converted: convertedDate.toISOString(),
      fromTimezone,
      toTimezone,
      offsetDifference: offsetDifference / (1000 * 60) // 转换为分钟
    });

    return convertedDate;
  } catch (error) {
    console.error('convertTimezone: 时区转换失败', error, {
      dateInput,
      fromTimezone,
      toTimezone
    });
    return date;
  }
}

/**
 * 验证时区名称是否有效
 * @param timezone 时区名称
 * @returns 是否有效
 */
function isValidTimezone(timezone: string): boolean {
  try {
    Intl.DateTimeFormat(undefined, { timeZone: timezone });
    return true;
  } catch {
    return false;
  }
}

/**
 * 获取指定时区在特定时间的偏移量（毫秒）
 * @param timestamp 时间戳
 * @param timezone 时区名称
 * @returns 偏移量（毫秒）
 */
function getTimezoneOffset(timestamp: number, timezone: string): number {
  try {
    const date = new Date(timestamp);
    const utcTime = date.getTime() + (date.getTimezoneOffset() * 60000);
    const targetTime = new Date(utcTime + (getTimezoneOffsetMinutes(timezone, date) * 60000));
    return targetTime.getTime() - utcTime;
  } catch (error) {
    console.error('getTimezoneOffset: 获取时区偏移量失败', error);
    return 0;
  }
}

/**
 * 获取指定时区的偏移量（分钟）
 * @param timezone 时区名称
 * @param date 日期对象
 * @returns 偏移量（分钟）
 */
function getTimezoneOffsetMinutes(timezone: string, date: Date): number {
  try {
    const formatter = new Intl.DateTimeFormat('en', {
      timeZone: timezone,
      timeZoneName: 'longOffset'
    });

    const parts = formatter.formatToParts(date);
    const offsetPart = parts.find(part => part.type === 'timeZoneName');

    if (offsetPart && offsetPart.value) {
      // 解析偏移量字符串，如 "GMT+08:00"
      const match = offsetPart.value.match(/GMT([+-])(\d{2}):(\d{2})/);
      if (match) {
        const sign = match[1] === '+' ? 1 : -1;
        const hours = parseInt(match[2], 10);
        const minutes = parseInt(match[3], 10);
        return sign * (hours * 60 + minutes);
      }
    }

    // 备用方法：使用简单的时区映射
    const timezoneOffsets: Record<string, number> = {
      'UTC': 0,
      'Asia/Shanghai': 8 * 60,
      'Asia/Tokyo': 9 * 60,
      'Europe/London': 0, // 注意：这是简化的，实际需要考虑夏令时
      'America/New_York': -5 * 60, // 注意：这是简化的，实际需要考虑夏令时
    };

    return timezoneOffsets[timezone] || 0;
  } catch (error) {
    console.error('getTimezoneOffsetMinutes: 获取时区偏移分钟数失败', error);
    return 0;
  }
}

/**
 * 统一的日期时间格式化函数
 * 增强时区信息验证和处理
 * @param dateInput 日期输入（字符串或Date对象）
 * @param options 格式化选项
 * @returns 格式化后的日期字符串
 */
export function formatDateTime(
  dateInput: string | Date | null | undefined,
  options: FormatOptions = {}
): string {
  const { format = 'full', timezone = 'Asia/Shanghai' } = options;

  let date: Date | null;
  if (typeof dateInput === 'string') {
    // 检查时区信息
    if (!hasTimezoneInfo(dateInput) && !OLD_FORMAT_REGEX.test(dateInput)) {
      console.warn('日期字符串缺少时区信息，可能导致显示不准确:', dateInput);
    }
    date = parseDateTime(dateInput);
  } else if (dateInput instanceof Date) {
    date = dateInput;
  } else {
    return '';
  }

  if (!date || isNaN(date.getTime())) {
    return '';
  }

  const formatOptions: Intl.DateTimeFormatOptions = {
    timeZone: timezone,
    hour12: false
  };

  switch (format) {
    case 'full':
      Object.assign(formatOptions, {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
      break;
    case 'date':
      Object.assign(formatOptions, {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
      break;
    case 'time':
      Object.assign(formatOptions, {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
      break;
    case 'short':
      Object.assign(formatOptions, {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
      break;
  }

  try {
    return date.toLocaleString('zh-CN', formatOptions);
  } catch (error) {
    console.error('日期格式化失败:', error);
    return '';
  }
}

/**
 * 将UTC时间字符串转换为北京时间
 * @param utcTimeString UTC时间字符串
 * @returns 格式化后的北京时间字符串
 * @deprecated 请使用 formatDateTime(dateString, { format: 'full' }) 替代
 */
export function formatToBeiJingTime(utcTimeString: string | null | undefined): string {
  return formatDateTime(utcTimeString, { format: 'full' });
}

/**
 * 将UTC时间字符串转换为简短的北京时间格式（不含秒）
 * @param utcTimeString UTC时间字符串
 * @returns 格式化后的北京时间字符串
 * @deprecated 请使用 formatDateTime(dateString, { format: 'short' }) 替代
 */
export function formatToBeiJingTimeShort(utcTimeString: string | null | undefined): string {
  return formatDateTime(utcTimeString, { format: 'short' });
}

/**
 * 将UTC时间字符串转换为仅日期的北京时间格式
 * @param utcTimeString UTC时间字符串
 * @returns 格式化后的北京日期字符串
 * @deprecated 请使用 formatDateTime(dateString, { format: 'date' }) 替代
 */
export function formatToBeiJingDate(utcTimeString: string | null | undefined): string {
  return formatDateTime(utcTimeString, { format: 'date' });
}

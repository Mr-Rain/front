/**
 * 日期工具函数
 */

/**
 * 将UTC时间字符串转换为北京时间
 * @param utcTimeString UTC时间字符串
 * @returns 格式化后的北京时间字符串
 */
export function formatToBeiJingTime(utcTimeString: string | null | undefined): string {
  if (!utcTimeString) return '';
  
  try {
    // 创建Date对象（JavaScript会自动处理时区）
    const date = new Date(utcTimeString);
    
    // 检查日期是否有效
    if (isNaN(date.getTime())) {
      console.error('Invalid date:', utcTimeString);
      return '';
    }
    
    // 格式化为北京时间（UTC+8）
    // 使用toLocaleString方法，指定中国时区和格式
    return date.toLocaleString('zh-CN', { 
      timeZone: 'Asia/Shanghai',
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
}

/**
 * 将UTC时间字符串转换为简短的北京时间格式（不含秒）
 * @param utcTimeString UTC时间字符串
 * @returns 格式化后的北京时间字符串
 */
export function formatToBeiJingTimeShort(utcTimeString: string | null | undefined): string {
  if (!utcTimeString) return '';
  
  try {
    // 创建Date对象
    const date = new Date(utcTimeString);
    
    // 检查日期是否有效
    if (isNaN(date.getTime())) {
      console.error('Invalid date:', utcTimeString);
      return '';
    }
    
    // 格式化为北京时间（UTC+8），简短格式
    return date.toLocaleString('zh-CN', { 
      timeZone: 'Asia/Shanghai',
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
}

/**
 * 将UTC时间字符串转换为仅日期的北京时间格式
 * @param utcTimeString UTC时间字符串
 * @returns 格式化后的北京日期字符串
 */
export function formatToBeiJingDate(utcTimeString: string | null | undefined): string {
  if (!utcTimeString) return '';
  
  try {
    // 创建Date对象
    const date = new Date(utcTimeString);
    
    // 检查日期是否有效
    if (isNaN(date.getTime())) {
      console.error('Invalid date:', utcTimeString);
      return '';
    }
    
    // 格式化为北京时间（UTC+8），仅日期
    return date.toLocaleString('zh-CN', { 
      timeZone: 'Asia/Shanghai',
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit'
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
}

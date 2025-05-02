import request from '@/utils/request';

/**
 * 删除文件
 * @param bucket 存储桶名称
 * @param path 文件路径
 * @returns 删除结果
 */
export function deleteFile(bucket: string, path: string): Promise<any> {
  return request({
    url: '/api/files',
    method: 'delete',
    data: {
      bucket,
      path
    }
  });
}

/**
 * 从URL中提取文件路径
 * @param url 文件URL
 * @returns 文件路径
 */
export function getPathFromUrl(url: string): string {
  if (!url) return '';

  try {
    // 处理相对URL
    if (url.startsWith('/')) {
      // 解析URL中的path参数
      const urlObj = new URL(url, window.location.origin);
      return urlObj.searchParams.get('path') || '';
    }

    // 处理绝对URL
    const urlObj = new URL(url);
    return urlObj.searchParams.get('path') || '';
  } catch (error) {
    console.error('解析URL失败:', url, error);

    // 尝试使用正则表达式提取
    const pathMatch = url.match(/[?&]path=([^&]+)/);
    return pathMatch ? decodeURIComponent(pathMatch[1]) : '';
  }
}

/**
 * 从URL中提取存储桶名称
 * @param url 文件URL
 * @returns 存储桶名称
 */
export function getBucketFromUrl(url: string): string {
  if (!url) return '';

  try {
    // 处理相对URL
    if (url.startsWith('/')) {
      // 解析URL中的bucket参数
      const urlObj = new URL(url, window.location.origin);
      return urlObj.searchParams.get('bucket') || '';
    }

    // 处理绝对URL
    const urlObj = new URL(url);
    return urlObj.searchParams.get('bucket') || '';
  } catch (error) {
    console.error('解析URL失败:', url, error);

    // 尝试使用正则表达式提取
    const bucketMatch = url.match(/[?&]bucket=([^&]+)/);
    return bucketMatch ? decodeURIComponent(bucketMatch[1]) : '';
  }
}

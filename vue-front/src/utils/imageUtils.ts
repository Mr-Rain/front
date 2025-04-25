/**
 * 图片资源优化工具函数
 * 提供图片懒加载、WebP格式支持检测、图片占位符等功能
 */

/**
 * 检测浏览器是否支持WebP格式
 * @returns Promise<boolean> 是否支持WebP
 */
export const checkWebpSupport = (): Promise<boolean> => {
  return new Promise((resolve) => {
    const webpImage = new Image();
    webpImage.onload = () => resolve(true);
    webpImage.onerror = () => resolve(false);
    webpImage.src = 'data:image/webp;base64,UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoBAAEAAwA0JaQAA3AA/vuUAAA=';
  });
};

/**
 * 获取图片的WebP版本路径（如果支持）
 * @param imagePath 原始图片路径
 * @param webpSupported 是否支持WebP
 * @returns 最终使用的图片路径
 */
export const getOptimizedImagePath = (imagePath: string, webpSupported: boolean): string => {
  // 如果是SVG格式，直接返回原路径
  if (imagePath.endsWith('.svg')) {
    return imagePath;
  }
  
  // 如果支持WebP且原图不是WebP，返回WebP版本路径
  if (webpSupported && !imagePath.endsWith('.webp')) {
    // 移除原有扩展名并添加.webp
    const basePath = imagePath.substring(0, imagePath.lastIndexOf('.'));
    return `${basePath}.webp`;
  }
  
  return imagePath;
};

/**
 * 生成图片占位符URL
 * @param width 宽度
 * @param height 高度
 * @param color 背景色
 * @returns 占位符图片的Data URL
 */
export const generatePlaceholder = (width: number, height: number, color: string = '#f0f0f0'): string => {
  // 创建一个SVG占位符
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <rect width="100%" height="100%" fill="${color}"/>
    </svg>
  `;
  
  // 转换为Base64编码的Data URL
  return `data:image/svg+xml;base64,${btoa(svg.trim())}`;
};

/**
 * 处理图片加载错误，使用默认图片替代
 * @param event 错误事件
 * @param fallbackSrc 备用图片路径
 */
export const handleImageError = (event: Event, fallbackSrc: string): void => {
  const imgElement = event.target as HTMLImageElement;
  if (imgElement.src !== fallbackSrc) {
    imgElement.src = fallbackSrc;
  }
};

/**
 * 预加载图片
 * @param imageSrc 图片路径
 * @returns Promise 图片加载完成的Promise
 */
export const preloadImage = (imageSrc: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = imageSrc;
  });
};

/**
 * 压缩图片尺寸（用于上传前压缩）
 * @param file 图片文件
 * @param maxWidth 最大宽度
 * @param maxHeight 最大高度
 * @param quality 压缩质量(0-1)
 * @returns Promise<Blob> 压缩后的图片Blob
 */
export const compressImage = (
  file: File,
  maxWidth: number = 1200,
  maxHeight: number = 1200,
  quality: number = 0.8
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      
      img.onload = () => {
        // 计算新的尺寸
        let width = img.width;
        let height = img.height;
        
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
        
        // 创建Canvas并绘制压缩后的图片
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('无法创建Canvas上下文'));
          return;
        }
        
        ctx.drawImage(img, 0, 0, width, height);
        
        // 转换为Blob
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('图片压缩失败'));
            }
          },
          file.type,
          quality
        );
      };
      
      img.onerror = () => {
        reject(new Error('图片加载失败'));
      };
    };
    
    reader.onerror = () => {
      reject(new Error('文件读取失败'));
    };
  });
};

/**
 * 默认图片路径
 */
export const DEFAULT_AVATAR = '/src/assets/images/default-avatar.svg';
export const DEFAULT_COMPANY = '/src/assets/images/default-company.svg';
export const EMPTY_SEARCH = '/src/assets/images/empty-search.svg';

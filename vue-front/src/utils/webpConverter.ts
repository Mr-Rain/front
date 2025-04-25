/**
 * WebP转换工具
 * 用于将图片转换为WebP格式
 */

/**
 * 将图片文件转换为WebP格式
 * @param file 原始图片文件
 * @param quality WebP质量(0-1)
 * @returns Promise<File> 转换后的WebP文件
 */
export const convertToWebP = async (file: File, quality: number = 0.8): Promise<File> => {
  return new Promise((resolve, reject) => {
    // 检查文件类型
    if (!file.type.startsWith('image/')) {
      reject(new Error('不是有效的图片文件'));
      return;
    }

    // 如果已经是WebP格式，直接返回
    if (file.type === 'image/webp') {
      resolve(file);
      return;
    }

    // 创建FileReader读取文件
    const reader = new FileReader();
    reader.readAsDataURL(file);
    
    reader.onload = (event) => {
      // 创建图片对象
      const img = new Image();
      img.src = event.target?.result as string;
      
      img.onload = () => {
        // 创建Canvas
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        
        // 绘制图片
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('无法创建Canvas上下文'));
          return;
        }
        
        ctx.drawImage(img, 0, 0);
        
        // 转换为WebP
        canvas.toBlob(
          (blob) => {
            if (blob) {
              // 创建新的File对象
              const webpFile = new File(
                [blob],
                `${file.name.substring(0, file.name.lastIndexOf('.'))}.webp`,
                { type: 'image/webp' }
              );
              resolve(webpFile);
            } else {
              reject(new Error('WebP转换失败'));
            }
          },
          'image/webp',
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
 * 检查浏览器是否支持WebP格式
 * @returns Promise<boolean> 是否支持WebP
 */
export const isWebPSupported = (): Promise<boolean> => {
  return new Promise((resolve) => {
    const webpImage = new Image();
    webpImage.onload = () => resolve(true);
    webpImage.onerror = () => resolve(false);
    webpImage.src = 'data:image/webp;base64,UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoBAAEAAwA0JaQAA3AA/vuUAAA=';
  });
};

/**
 * 批量转换图片为WebP格式
 * @param files 原始图片文件数组
 * @param quality WebP质量(0-1)
 * @returns Promise<File[]> 转换后的WebP文件数组
 */
export const batchConvertToWebP = async (files: File[], quality: number = 0.8): Promise<File[]> => {
  // 检查是否支持WebP
  const isSupported = await isWebPSupported();
  if (!isSupported) {
    return files; // 如果不支持WebP，返回原始文件
  }
  
  // 转换所有图片
  const promises = files.map(file => {
    // 只转换图片文件
    if (file.type.startsWith('image/') && file.type !== 'image/webp' && file.type !== 'image/svg+xml') {
      return convertToWebP(file, quality);
    }
    return Promise.resolve(file); // 非图片文件或已经是WebP/SVG，直接返回
  });
  
  return Promise.all(promises);
};

/**
 * 获取图片的尺寸信息
 * @param file 图片文件
 * @returns Promise<{width: number, height: number}> 图片尺寸
 */
export const getImageDimensions = (file: File): Promise<{width: number, height: number}> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      
      img.onload = () => {
        resolve({
          width: img.width,
          height: img.height
        });
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

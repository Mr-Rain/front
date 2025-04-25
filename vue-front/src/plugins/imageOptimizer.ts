/**
 * 图片优化插件
 * 提供全局图片优化功能
 */

import type { App } from 'vue';
import { checkWebpSupport, getOptimizedImagePath, DEFAULT_AVATAR, DEFAULT_COMPANY } from '@/utils/imageUtils';
import { convertToWebP, batchConvertToWebP } from '@/utils/webpConverter';

// 图片优化器配置
export interface ImageOptimizerOptions {
  // 是否启用WebP转换
  enableWebP?: boolean;
  // 是否启用图片压缩
  enableCompression?: boolean;
  // 默认图片质量
  defaultQuality?: number;
  // 默认最大宽度
  defaultMaxWidth?: number;
  // 默认最大高度
  defaultMaxHeight?: number;
  // 默认头像
  defaultAvatar?: string;
  // 默认公司图标
  defaultCompany?: string;
}

// 默认配置
const defaultOptions: ImageOptimizerOptions = {
  enableWebP: true,
  enableCompression: true,
  defaultQuality: 0.8,
  defaultMaxWidth: 1200,
  defaultMaxHeight: 1200,
  defaultAvatar: DEFAULT_AVATAR,
  defaultCompany: DEFAULT_COMPANY
};

// 图片优化器类
class ImageOptimizer {
  private options: ImageOptimizerOptions;
  private webpSupported: boolean = false;
  private initialized: boolean = false;

  constructor(options: ImageOptimizerOptions = {}) {
    this.options = { ...defaultOptions, ...options };
  }

  // 初始化
  async init() {
    if (this.initialized) return;
    
    try {
      this.webpSupported = await checkWebpSupport();
      this.initialized = true;
    } catch (error) {
      console.error('图片优化器初始化失败:', error);
      this.webpSupported = false;
      this.initialized = true;
    }
    
    return this;
  }

  // 获取优化后的图片路径
  getOptimizedPath(imagePath: string): string {
    return getOptimizedImagePath(imagePath, this.webpSupported);
  }

  // 转换为WebP格式
  async convertToWebP(file: File, quality?: number): Promise<File> {
    if (!this.options.enableWebP || !this.webpSupported) {
      return file;
    }
    
    return convertToWebP(file, quality || this.options.defaultQuality);
  }

  // 批量转换为WebP格式
  async batchConvertToWebP(files: File[], quality?: number): Promise<File[]> {
    if (!this.options.enableWebP || !this.webpSupported) {
      return files;
    }
    
    return batchConvertToWebP(files, quality || this.options.defaultQuality);
  }

  // 是否支持WebP
  isWebPSupported(): boolean {
    return this.webpSupported;
  }

  // 获取默认头像
  getDefaultAvatar(): string {
    return this.options.defaultAvatar || DEFAULT_AVATAR;
  }

  // 获取默认公司图标
  getDefaultCompany(): string {
    return this.options.defaultCompany || DEFAULT_COMPANY;
  }
}

// 创建插件
export const createImageOptimizerPlugin = (options: ImageOptimizerOptions = {}) => {
  const imageOptimizer = new ImageOptimizer(options);
  
  return {
    install: async (app: App) => {
      // 初始化图片优化器
      await imageOptimizer.init();
      
      // 添加全局属性
      app.config.globalProperties.$imageOptimizer = imageOptimizer;
      
      // 添加全局注入
      app.provide('imageOptimizer', imageOptimizer);
    }
  };
};

// 声明模块扩展
declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $imageOptimizer: ImageOptimizer;
  }
}

export default createImageOptimizerPlugin;

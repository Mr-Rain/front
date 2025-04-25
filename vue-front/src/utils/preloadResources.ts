/**
 * 资源预加载工具
 * 用于预加载关键资源，提高应用性能
 */

// 预加载类型
export enum PreloadType {
  // 预加载图片
  IMAGE = 'image',
  // 预加载样式
  STYLE = 'style',
  // 预加载脚本
  SCRIPT = 'script',
  // 预加载字体
  FONT = 'font',
  // 预加载音频
  AUDIO = 'audio',
  // 预加载视频
  VIDEO = 'video',
  // 预取链接
  PREFETCH = 'prefetch',
  // DNS预解析
  DNS_PREFETCH = 'dns-prefetch',
  // 预连接
  PRECONNECT = 'preconnect'
}

// 预加载资源接口
interface PreloadResource {
  // 资源URL
  url: string;
  // 预加载类型
  type: PreloadType;
  // 资源MIME类型
  as?: string;
  // 是否跨域
  crossOrigin?: boolean;
  // 媒体查询
  media?: string;
  // 是否禁用
  disabled?: boolean;
}

// 预加载配置接口
interface PreloadConfig {
  // 是否启用预加载
  enabled: boolean;
  // 预加载资源列表
  resources: PreloadResource[];
  // 是否自动预加载
  autoPreload: boolean;
  // 预加载延迟（毫秒）
  delay: number;
  // 是否使用requestIdleCallback
  useIdleCallback: boolean;
  // 空闲回调超时（毫秒）
  idleTimeout: number;
}

// 默认配置
const defaultConfig: PreloadConfig = {
  enabled: true,
  resources: [],
  autoPreload: true,
  delay: 0,
  useIdleCallback: true,
  idleTimeout: 2000
};

// 预加载状态
const preloadState = {
  // 已预加载的资源
  loadedResources: new Set<string>(),
  // 预加载配置
  config: { ...defaultConfig }
};

/**
 * 初始化预加载配置
 * @param config 预加载配置
 */
export function initPreload(config: Partial<PreloadConfig> = {}): void {
  // 合并配置
  preloadState.config = { ...defaultConfig, ...config };
  
  // 如果启用自动预加载，则自动预加载资源
  if (preloadState.config.enabled && preloadState.config.autoPreload) {
    if (preloadState.config.delay > 0) {
      // 延迟预加载
      setTimeout(() => {
        preloadResources(preloadState.config.resources);
      }, preloadState.config.delay);
    } else {
      // 立即预加载
      preloadResources(preloadState.config.resources);
    }
  }
}

/**
 * 预加载资源
 * @param resources 要预加载的资源列表
 */
export function preloadResources(resources: PreloadResource[]): void {
  // 如果未启用预加载，则直接返回
  if (!preloadState.config.enabled) {
    return;
  }
  
  // 过滤出未加载的资源
  const unloadedResources = resources.filter(
    resource => !resource.disabled && !preloadState.loadedResources.has(resource.url)
  );
  
  // 如果没有未加载的资源，则直接返回
  if (unloadedResources.length === 0) {
    return;
  }
  
  // 预加载函数
  const doPreload = () => {
    unloadedResources.forEach(resource => {
      // 创建预加载链接
      createPreloadLink(resource);
      // 标记为已加载
      preloadState.loadedResources.add(resource.url);
    });
  };
  
  // 使用requestIdleCallback或setTimeout
  if (preloadState.config.useIdleCallback && 'requestIdleCallback' in window) {
    // 使用requestIdleCallback
    requestIdleCallback(
      () => {
        doPreload();
      },
      { timeout: preloadState.config.idleTimeout }
    );
  } else {
    // 使用setTimeout
    setTimeout(doPreload, 0);
  }
}

/**
 * 创建预加载链接
 * @param resource 预加载资源
 */
function createPreloadLink(resource: PreloadResource): void {
  // 创建link元素
  const link = document.createElement('link');
  
  // 设置通用属性
  link.href = resource.url;
  link.rel = resource.type;
  
  // 设置特定属性
  if (resource.as) {
    link.setAttribute('as', resource.as);
  }
  
  if (resource.crossOrigin) {
    link.setAttribute('crossorigin', '');
  }
  
  if (resource.media) {
    link.setAttribute('media', resource.media);
  }
  
  // 添加到文档头部
  document.head.appendChild(link);
}

/**
 * 预加载图片
 * @param urls 图片URL数组
 * @param priority 是否高优先级
 */
export function preloadImages(urls: string[], priority: boolean = false): void {
  // 创建预加载资源列表
  const resources: PreloadResource[] = urls.map(url => ({
    url,
    type: priority ? PreloadType.IMAGE : PreloadType.PREFETCH,
    as: 'image'
  }));
  
  // 预加载资源
  preloadResources(resources);
}

/**
 * 预加载样式
 * @param urls 样式URL数组
 */
export function preloadStyles(urls: string[]): void {
  // 创建预加载资源列表
  const resources: PreloadResource[] = urls.map(url => ({
    url,
    type: PreloadType.STYLE,
    as: 'style'
  }));
  
  // 预加载资源
  preloadResources(resources);
}

/**
 * 预加载脚本
 * @param urls 脚本URL数组
 */
export function preloadScripts(urls: string[]): void {
  // 创建预加载资源列表
  const resources: PreloadResource[] = urls.map(url => ({
    url,
    type: PreloadType.SCRIPT,
    as: 'script'
  }));
  
  // 预加载资源
  preloadResources(resources);
}

/**
 * 预加载字体
 * @param urls 字体URL数组
 * @param crossOrigin 是否跨域
 */
export function preloadFonts(urls: string[], crossOrigin: boolean = true): void {
  // 创建预加载资源列表
  const resources: PreloadResource[] = urls.map(url => ({
    url,
    type: PreloadType.FONT,
    as: 'font',
    crossOrigin
  }));
  
  // 预加载资源
  preloadResources(resources);
}

/**
 * 预解析DNS
 * @param domains 域名数组
 */
export function prefetchDNS(domains: string[]): void {
  // 创建预加载资源列表
  const resources: PreloadResource[] = domains.map(domain => ({
    url: domain,
    type: PreloadType.DNS_PREFETCH
  }));
  
  // 预加载资源
  preloadResources(resources);
}

/**
 * 预连接
 * @param urls URL数组
 * @param crossOrigin 是否跨域
 */
export function preconnect(urls: string[], crossOrigin: boolean = true): void {
  // 创建预加载资源列表
  const resources: PreloadResource[] = urls.map(url => ({
    url,
    type: PreloadType.PRECONNECT,
    crossOrigin
  }));
  
  // 预加载资源
  preloadResources(resources);
}

/**
 * 获取已预加载的资源
 * @returns 已预加载的资源URL数组
 */
export function getLoadedResources(): string[] {
  return Array.from(preloadState.loadedResources);
}

/**
 * 检查资源是否已预加载
 * @param url 资源URL
 * @returns 是否已预加载
 */
export function isResourcePreloaded(url: string): boolean {
  return preloadState.loadedResources.has(url);
}

/**
 * 清除预加载状态
 */
export function clearPreloadState(): void {
  preloadState.loadedResources.clear();
}

import type { RouteComponent } from 'vue-router'

// 使用 import.meta.glob 预先获取所有可能的视图组件
// 注意：import.meta.glob 是 Vite 特有的，它返回一个模块映射
// key 是相对路径，value 是一个异步加载函数 () => Promise<Module>
const views = import.meta.glob('@/views/**/*.vue');

/**
 * 路由懒加载函数
 *
 * 注意：此函数不再使用defineAsyncComponent包装，
 * 而是直接返回动态导入函数，以避免Vue Router警告
 *
 * @param loader 组件加载函数
 * @returns 异步组件
 */
export function lazyLoad(
  loader: () => Promise<any>
): RouteComponent {
  // 对于路由组件，我们直接返回加载函数
  // 这样Vue Router就不会发出警告
  return loader;
}

/**
 * 创建路由懒加载函数 (使用 import.meta.glob)
 * @param path 相对于 src/views/ 的组件路径，例如 'common/HomePage' 或 'student/Dashboard'
 * @returns 懒加载组件
 */
export function createLazyComponent(path: string): RouteComponent {
  const componentPath = `/src/views/${path}.vue`; // import.meta.glob 的 key 是相对于项目根目录的路径
  const loader = views[componentPath]; // 从映射中查找加载函数

  if (!loader) {
    const errorMsg = `Component loader not found in import.meta.glob for path: ${componentPath}. Check the path passed to createLazyComponent ('${path}') and the glob pattern.`;
    console.error(errorMsg);
    // 返回一个显示错误的组件
    return () => Promise.reject(new Error(errorMsg));
  }

  // 直接返回加载函数，不使用defineAsyncComponent包装
  // 这样Vue Router就不会发出警告
  return loader;
}

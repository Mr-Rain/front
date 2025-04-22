import type { RouteComponent } from 'vue-router'
import { defineAsyncComponent } from 'vue'
import LoadingState from '@/components/common/LoadingState.vue'
import ErrorState from '@/components/common/ErrorState.vue'

// 使用 import.meta.glob 预先获取所有可能的视图组件
// 注意：import.meta.glob 是 Vite 特有的，它返回一个模块映射
// key 是相对路径，value 是一个异步加载函数 () => Promise<Module>
const views = import.meta.glob('@/views/**/*.vue');

/**
 * 路由懒加载函数
 * @param loader 组件加载函数
 * @param delay 延迟显示加载组件的时间（毫秒）
 * @param timeout 加载超时时间（毫秒）
 * @returns 异步组件
 */
export function lazyLoad(
  loader: () => Promise<any>,
  delay: number = 200,
  timeout: number = 10000
): RouteComponent {
  return defineAsyncComponent({
    // 加载函数
    loader,
    
    // 加载异步组件时使用的组件
    loadingComponent: LoadingState,
    
    // 加载失败时使用的组件
    errorComponent: ErrorState,
    
    // 展示加载组件前的延迟时间，默认为 200ms
    delay,
    
    // 如果提供了 timeout，并且加载组件的时间超过了设定值，将显示错误组件
    // 默认值是：Infinity
    timeout,
    
    // 定义组件是否可挂起，默认为 true
    suspensible: true,
    
    /**
     * 加载失败时的回调函数
     * @param error 错误信息
     * @param retry 重试函数
     * @param fail 失败函数
     * @param attempts 已重试次数
     */
    onError(error, retry, fail, attempts) {
      if (error.message.match(/fetch/) && attempts <= 3) {
        // 当网络错误时，尝试重试
        console.log(`Retrying to load component, attempt ${attempts}...`)
        retry()
      } else {
        // 记录错误并显示错误组件
        console.error('Error loading component:', error)
        fail()
      }
    },
  })
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
    // 返回一个显示错误的组件或者直接抛出错误
    return defineAsyncComponent({
      loader: () => Promise.reject(new Error(errorMsg)),
      errorComponent: ErrorState,
    });
  }
  // 使用 lazyLoad 包装找到的加载函数
  return lazyLoad(loader);
}

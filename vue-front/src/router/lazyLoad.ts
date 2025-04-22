import type { RouteComponent } from 'vue-router'
import { defineAsyncComponent } from 'vue'
import LoadingState from '@/components/common/LoadingState.vue'
import ErrorState from '@/components/common/ErrorState.vue'

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
 * 创建路由懒加载函数
 * @param path 组件路径
 * @returns 懒加载组件
 */
export function createLazyComponent(path: string): RouteComponent {
  return lazyLoad(() => import(`@/views/${path}.vue`))
}

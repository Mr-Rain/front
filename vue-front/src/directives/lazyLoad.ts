import type { App, Directive } from 'vue'

interface LazyLoadOptions {
  // 默认图片
  defaultSrc?: string
  // 加载失败时显示的图片
  errorSrc?: string
  // 加载延迟（毫秒）
  delay?: number
  // 是否使用渐变效果
  fadeIn?: boolean
  // 渐变持续时间（毫秒）
  fadeDuration?: number
  // 观察器选项
  observerOptions?: IntersectionObserverInit
}

// 默认选项
const defaultOptions: LazyLoadOptions = {
  defaultSrc: 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', // 透明图片
  errorSrc: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0Ij48cGF0aCBmaWxsPSIjZjU2YzZjIiBkPSJNMTIgMjJDNi40NzcgMjIgMiAxNy41MjMgMiAxMlM2LjQ3NyAyIDEyIDJzMTAgNC40NzcgMTAgMTAtNC40NzcgMTAtMTAgMTB6bTAtMmE4IDggMCAxIDAgMC0xNiA4IDggMCAwIDAgMCAxNnpNMTEgN2gydjZoLTJWN3ptMCA4aDJ2MmgtMnYtMnoiLz48L3N2Zz4=', // 错误图标
  delay: 0,
  fadeIn: true,
  fadeDuration: 300,
  observerOptions: {
    rootMargin: '0px',
    threshold: 0.1
  }
}

// 创建懒加载指令
export const createLazyLoadDirective = (options: LazyLoadOptions = {}): Directive => {
  // 合并选项
  const mergedOptions = { ...defaultOptions, ...options }
  
  // 观察器实例
  let observer: IntersectionObserver | null = null
  
  // 加载图片
  const loadImage = (el: HTMLElement, src: string) => {
    // 如果设置了延迟，则延迟加载
    if (mergedOptions.delay && mergedOptions.delay > 0) {
      setTimeout(() => {
        setImageSrc(el, src)
      }, mergedOptions.delay)
    } else {
      setImageSrc(el, src)
    }
  }
  
  // 设置图片源
  const setImageSrc = (el: HTMLElement, src: string) => {
    // 如果元素不是图片，则查找内部的图片元素
    const imgEl = el.tagName.toLowerCase() === 'img' ? el : el.querySelector('img')
    
    if (!imgEl) return
    
    // 如果启用了渐变效果
    if (mergedOptions.fadeIn) {
      // 设置过渡样式
      imgEl.style.transition = `opacity ${mergedOptions.fadeDuration}ms ease-in-out`
      imgEl.style.opacity = '0'
      
      // 图片加载完成后显示
      const onLoad = () => {
        imgEl.style.opacity = '1'
        imgEl.removeEventListener('load', onLoad)
      }
      
      imgEl.addEventListener('load', onLoad)
    }
    
    // 设置加载错误处理
    const onError = () => {
      if (mergedOptions.errorSrc) {
        imgEl.setAttribute('src', mergedOptions.errorSrc)
      }
      imgEl.removeEventListener('error', onError)
    }
    
    imgEl.addEventListener('error', onError)
    
    // 设置图片源
    imgEl.setAttribute('src', src)
  }
  
  return {
    // 指令挂载时
    mounted(el, binding) {
      // 设置默认图片
      if (mergedOptions.defaultSrc) {
        setImageSrc(el, mergedOptions.defaultSrc)
      }
      
      // 创建观察器
      observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          // 当元素进入视口
          if (entry.isIntersecting) {
            // 加载真实图片
            loadImage(el, binding.value)
            // 停止观察该元素
            if (observer) {
              observer.unobserve(el)
            }
          }
        })
      }, mergedOptions.observerOptions)
      
      // 开始观察元素
      observer.observe(el)
    },
    
    // 指令更新时
    updated(el, binding) {
      // 如果图片源发生变化
      if (binding.oldValue !== binding.value) {
        // 重新加载图片
        loadImage(el, binding.value)
      }
    },
    
    // 指令卸载时
    unmounted(el) {
      // 停止观察元素
      if (observer) {
        observer.unobserve(el)
      }
    }
  }
}

// 创建插件
export const createLazyLoadPlugin = (options: LazyLoadOptions = {}) => {
  return {
    install(app: App) {
      // 注册全局指令
      app.directive('lazy', createLazyLoadDirective(options))
    }
  }
}

// 默认导出
export default createLazyLoadPlugin

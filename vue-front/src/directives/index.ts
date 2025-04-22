import type { App } from 'vue'
import { createLazyLoadDirective } from './lazyLoad'

// 扩展 HTMLElement 接口，添加自定义属性
declare global {
  interface HTMLElement {
    _debounceHandler?: (e: Event) => void;
    _throttleHandler?: (e: Event) => void;
    _longPressHandlers?: {
      startHandler: (e: Event) => void;
      endHandler: () => void;
      cancelHandler: () => boolean;
    };
    _copyHandler?: () => void;
  }
}

// 创建防抖指令
const createDebounceDirective = () => {
  return {
    mounted(el: HTMLElement, binding: any) {
      // 获取事件类型和处理函数
      const { arg: event = 'click', value: handler, modifiers } = binding

      // 获取延迟时间（默认300毫秒）
      const delay = Object.keys(modifiers).find(key => !isNaN(Number(key)))
        ? Number(Object.keys(modifiers).find(key => !isNaN(Number(key))))
        : 300

      // 是否立即执行
      const immediate = modifiers.immediate

      // 防抖函数
      let timeout: ReturnType<typeof setTimeout> | null = null

      // 事件处理函数
      const eventHandler = (e: Event) => {
        if (timeout) {
          clearTimeout(timeout)
        }

        if (immediate && !timeout) {
          handler(e)
        }

        timeout = setTimeout(() => {
          if (!immediate) {
            handler(e)
          }
          timeout = null
        }, delay)
      }

      // 保存事件处理函数，以便卸载时使用
      el._debounceHandler = eventHandler

      // 添加事件监听器
      el.addEventListener(event, eventHandler)
    },

    beforeUnmount(el: HTMLElement & { _debounceHandler?: any }, binding: any) {
      // 获取事件类型
      const { arg: event = 'click' } = binding

      // 移除事件监听器
      if (el._debounceHandler) {
        el.removeEventListener(event, el._debounceHandler)
        delete el._debounceHandler
      }
    }
  }
}

// 创建节流指令
const createThrottleDirective = () => {
  return {
    mounted(el: HTMLElement, binding: any) {
      // 获取事件类型和处理函数
      const { arg: event = 'click', value: handler, modifiers } = binding

      // 获取延迟时间（默认300毫秒）
      const delay = Object.keys(modifiers).find(key => !isNaN(Number(key)))
        ? Number(Object.keys(modifiers).find(key => !isNaN(Number(key))))
        : 300

      // 是否立即执行
      const immediate = modifiers.immediate

      // 上次执行时间
      let lastExecTime = 0

      // 事件处理函数
      const eventHandler = (e: Event) => {
        const now = Date.now()

        // 如果是第一次执行且需要立即执行
        if (lastExecTime === 0 && immediate) {
          lastExecTime = now
          handler(e)
          return
        }

        // 如果距离上次执行时间超过了延迟时间
        if (now - lastExecTime >= delay) {
          lastExecTime = now
          handler(e)
        }
      }

      // 保存事件处理函数，以便卸载时使用
      el._throttleHandler = eventHandler

      // 添加事件监听器
      el.addEventListener(event, eventHandler)
    },

    beforeUnmount(el: HTMLElement & { _throttleHandler?: any }, binding: any) {
      // 获取事件类型
      const { arg: event = 'click' } = binding

      // 移除事件监听器
      if (el._throttleHandler) {
        el.removeEventListener(event, el._throttleHandler)
        delete el._throttleHandler
      }
    }
  }
}

// 创建长按指令
const createLongPressDirective = () => {
  return {
    mounted(el: HTMLElement, binding: any) {
      // 获取处理函数和延迟时间（默认500毫秒）
      const { value: handler, modifiers } = binding

      // 获取延迟时间
      const delay = Object.keys(modifiers).find(key => !isNaN(Number(key)))
        ? Number(Object.keys(modifiers).find(key => !isNaN(Number(key))))
        : 500

      // 定时器
      let timeout: ReturnType<typeof setTimeout> | null = null

      // 是否已触发
      let triggered = false

      // 按下事件处理函数
      const startHandler = (e: Event) => {
        if (e.type === 'click' && e.target !== el) {
          return
        }

        if (timeout) {
          clearTimeout(timeout)
        }

        triggered = false

        timeout = setTimeout(() => {
          triggered = true
          handler(e)
        }, delay)
      }

      // 结束事件处理函数
      const endHandler = () => {
        if (timeout) {
          clearTimeout(timeout)
          timeout = null
        }
      }

      // 取消事件处理函数
      const cancelHandler = () => {
        if (timeout) {
          clearTimeout(timeout)
          timeout = null
        }

        // 如果已触发，则阻止默认点击事件
        if (triggered) {
          triggered = false
          return false
        }

        return true
      }

      // 保存事件处理函数，以便卸载时使用
      el._longPressHandlers = {
        startHandler,
        endHandler,
        cancelHandler
      }

      // 添加事件监听器
      el.addEventListener('mousedown', startHandler)
      el.addEventListener('touchstart', startHandler)
      el.addEventListener('mouseup', endHandler)
      el.addEventListener('mouseleave', endHandler)
      el.addEventListener('touchend', endHandler)
      el.addEventListener('touchcancel', endHandler)
      el.addEventListener('click', cancelHandler)
    },

    beforeUnmount(el: HTMLElement & { _longPressHandlers?: any }) {
      // 移除事件监听器
      if (el._longPressHandlers) {
        const { startHandler, endHandler, cancelHandler } = el._longPressHandlers

        el.removeEventListener('mousedown', startHandler)
        el.removeEventListener('touchstart', startHandler)
        el.removeEventListener('mouseup', endHandler)
        el.removeEventListener('mouseleave', endHandler)
        el.removeEventListener('touchend', endHandler)
        el.removeEventListener('touchcancel', endHandler)
        el.removeEventListener('click', cancelHandler)

        delete el._longPressHandlers
      }
    }
  }
}

// 创建复制指令
const createCopyDirective = () => {
  return {
    mounted(el: HTMLElement, binding: any) {
      // 获取处理函数和选项
      const { value, modifiers } = binding

      // 是否显示提示
      const showTip = !modifiers.noTip

      // 复制文本
      const copyText = typeof value === 'function' ? value() : value

      // 复制函数
      const copy = async () => {
        const text = typeof copyText === 'function' ? copyText() : copyText

        try {
          // 使用现代 Clipboard API
          if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(text)
          } else {
            // 兼容旧浏览器
            const textarea = document.createElement('textarea')
            textarea.value = text
            textarea.style.position = 'fixed'
            textarea.style.opacity = '0'
            document.body.appendChild(textarea)

            // 选择文本并复制
            textarea.select()
            // @ts-ignore - 忽略已弃用警告
            document.execCommand('copy')

            // 移除临时文本区域
            document.body.removeChild(textarea)
          }
        } catch (err) {
          console.error('Failed to copy text: ', err)
        }

        // 显示提示
        if (showTip) {
          const tip = document.createElement('div')
          tip.textContent = '复制成功'
          tip.style.position = 'fixed'
          tip.style.top = '50%'
          tip.style.left = '50%'
          tip.style.transform = 'translate(-50%, -50%)'
          tip.style.padding = '6px 12px'
          tip.style.backgroundColor = 'rgba(0, 0, 0, 0.7)'
          tip.style.color = '#fff'
          tip.style.borderRadius = '4px'
          tip.style.fontSize = '14px'
          tip.style.zIndex = '9999'

          document.body.appendChild(tip)

          // 2秒后移除提示
          setTimeout(() => {
            document.body.removeChild(tip)
          }, 2000)
        }
      }

      // 保存复制函数，以便卸载时使用
      el._copyHandler = copy

      // 添加事件监听器
      el.addEventListener('click', copy)
    },

    updated(el: HTMLElement & { _copyHandler?: any }, binding: any) {
      // 更新复制文本
      const { value } = binding

      // 移除旧的事件监听器
      if (el._copyHandler) {
        el.removeEventListener('click', el._copyHandler)
      }

      // 复制文本
      const copyText = typeof value === 'function' ? value() : value

      // 复制函数
      const copy = async () => {
        const text = typeof copyText === 'function' ? copyText() : copyText

        try {
          // 使用现代 Clipboard API
          if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(text)
          } else {
            // 兼容旧浏览器
            const textarea = document.createElement('textarea')
            textarea.value = text
            textarea.style.position = 'fixed'
            textarea.style.opacity = '0'
            document.body.appendChild(textarea)

            // 选择文本并复制
            textarea.select()
            // @ts-ignore - 忽略已弃用警告
            document.execCommand('copy')

            // 移除临时文本区域
            document.body.removeChild(textarea)
          }
        } catch (err) {
          console.error('Failed to copy text: ', err)
        }
      }

      // 保存复制函数，以便卸载时使用
      el._copyHandler = copy

      // 添加事件监听器
      el.addEventListener('click', copy)
    },

    beforeUnmount(el: HTMLElement & { _copyHandler?: any }) {
      // 移除事件监听器
      if (el._copyHandler) {
        el.removeEventListener('click', el._copyHandler)
        delete el._copyHandler
      }
    }
  }
}

// 创建插件
export const setupDirectives = (app: App) => {
  // 注册全局指令
  app.directive('lazy', createLazyLoadDirective())
  app.directive('debounce', createDebounceDirective())
  app.directive('throttle', createThrottleDirective())
  app.directive('long-press', createLongPressDirective())
  app.directive('copy', createCopyDirective())
}

export default setupDirectives

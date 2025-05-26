import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import { ElNotification } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { useNotificationStore } from '@/stores/notification'

export class WebSocketService {
  private client: Client | null = null
  private isConnected = false
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectInterval = 5000
  private initialized = false

  constructor() {
    // 不在构造函数中初始化，而是在connect方法中按需初始化
  }

  private initializeClient() {
    const userStore = useUserStore()

    if (!userStore.token) {
      console.log('用户未登录，跳过WebSocket连接')
      return
    }

    // 构建WebSocket URL，将token作为查询参数传递（SockJS兼容性更好）
    const wsUrl = `${import.meta.env.VITE_WS_URL || import.meta.env.VITE_API_BASE_URL}/ws?token=${userStore.token}`

    this.client = new Client({
      webSocketFactory: () => new SockJS(wsUrl),
      connectHeaders: {
        Authorization: `Bearer ${userStore.token}`
      },
      debug: (str) => {
        console.log('WebSocket Debug:', str)
      },
      reconnectDelay: this.reconnectInterval,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        console.log('WebSocket连接成功')
        this.isConnected = true
        this.reconnectAttempts = 0
        this.subscribeToNotifications()
      },
      onDisconnect: () => {
        console.log('WebSocket连接断开')
        this.isConnected = false
      },
      onStompError: (frame) => {
        console.error('WebSocket错误:', frame.headers['message'])
        this.handleReconnect()
      }
    })
  }

  public connect() {
    // 如果还没有初始化，先初始化客户端
    if (!this.initialized) {
      this.initializeClient()
      this.initialized = true
    }

    if (this.client && !this.isConnected) {
      try {
        this.client.activate()
      } catch (error) {
        console.error('WebSocket连接失败:', error)
        this.handleReconnect()
      }
    }
  }

  public disconnect() {
    if (this.client && this.isConnected) {
      this.client.deactivate()
      this.isConnected = false
    }
  }

  private subscribeToNotifications() {
    if (!this.client || !this.isConnected) return

    const userStore = useUserStore()
    const notificationStore = useNotificationStore()
    const userId = userStore.userInfo?.id

    if (!userId) return

    // 订阅个人通知
    this.client.subscribe(`/user/${userId}/queue/notifications`, (message) => {
      try {
        const notification = JSON.parse(message.body)
        this.handleNewNotification(notification)
        notificationStore.addNotification(notification)
      } catch (error) {
        console.error('处理通知消息失败:', error)
      }
    })

    // 订阅未读数量更新
    this.client.subscribe(`/user/${userId}/queue/unread-count`, (message) => {
      try {
        const unreadCount = parseInt(message.body)
        notificationStore.setUnreadCount(unreadCount)
      } catch (error) {
        console.error('处理未读数量更新失败:', error)
      }
    })

    // 订阅系统广播通知
    this.client.subscribe('/topic/system', (message) => {
      try {
        const notification = JSON.parse(message.body)
        this.handleSystemNotification(notification)
        notificationStore.addNotification(notification)
      } catch (error) {
        console.error('处理系统通知失败:', error)
      }
    })
  }

  private handleNewNotification(notification: any) {
    // 显示桌面通知
    ElNotification({
      title: notification.title,
      message: notification.content,
      type: this.getNotificationType(notification.type),
      duration: 5000,
      position: 'top-right',
      onClick: () => {
        // 点击通知跳转到相关页面
        if (notification.link) {
          window.location.href = notification.link
        }
      }
    })

    // 播放通知声音（可选）
    this.playNotificationSound()
  }

  private handleSystemNotification(notification: any) {
    // 系统通知使用更显眼的样式
    ElNotification({
      title: '系统通知',
      message: notification.content,
      type: 'warning',
      duration: 0, // 不自动关闭
      position: 'top-right',
      showClose: true
    })
  }

  private getNotificationType(type: string): 'success' | 'warning' | 'info' | 'error' {
    switch (type) {
      case 'application':
        return 'info'
      case 'interview':
        return 'warning'
      case 'system':
        return 'info'
      default:
        return 'info'
    }
  }

  private playNotificationSound() {
    try {
      // 创建简单的通知音效
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      oscillator.frequency.value = 800
      oscillator.type = 'sine'

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)

      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.5)
    } catch (error) {
      // 忽略音频播放错误
    }
  }

  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      console.log(`WebSocket重连尝试 ${this.reconnectAttempts}/${this.maxReconnectAttempts}`)

      setTimeout(() => {
        this.connect()
      }, this.reconnectInterval * this.reconnectAttempts)
    } else {
      console.error('WebSocket重连失败，已达到最大重试次数')
    }
  }

  public isWebSocketConnected(): boolean {
    return this.isConnected
  }
}

// 全局WebSocket服务实例 - 延迟创建
let webSocketServiceInstance: WebSocketService | null = null

export const webSocketService = {
  connect() {
    if (!webSocketServiceInstance) {
      webSocketServiceInstance = new WebSocketService()
    }
    return webSocketServiceInstance.connect()
  },
  disconnect() {
    if (webSocketServiceInstance) {
      return webSocketServiceInstance.disconnect()
    }
  },
  isWebSocketConnected() {
    if (webSocketServiceInstance) {
      return webSocketServiceInstance.isWebSocketConnected()
    }
    return false
  }
}

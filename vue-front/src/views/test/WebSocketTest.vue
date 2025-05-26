<template>
  <div class="websocket-test">
    <el-card class="test-card">
      <template #header>
        <div class="card-header">
          <span>WebSocket 实时通知测试</span>
          <el-tag :type="connectionStatus === 'connected' ? 'success' : 'danger'">
            {{ connectionStatus === 'connected' ? '已连接' : '未连接' }}
          </el-tag>
        </div>
      </template>

      <div class="test-content">
        <!-- 连接状态 -->
        <el-row :gutter="20" class="status-row">
          <el-col :span="12">
            <el-card shadow="never">
              <h4>连接状态</h4>
              <p>WebSocket: <el-tag :type="connectionStatus === 'connected' ? 'success' : 'danger'">
                {{ connectionStatus === 'connected' ? '已连接' : '未连接' }}
              </el-tag></p>
              <p>用户ID: {{ userStore.user?.id || '未登录' }}</p>
              <p>用户类型: {{ userStore.user?.userType || '未知' }}</p>
            </el-card>
          </el-col>
          <el-col :span="12">
            <el-card shadow="never">
              <h4>通知统计</h4>
              <p>未读通知: <el-badge :value="unreadCount" class="badge-item" /></p>
              <p>总通知数: {{ notifications.length }}</p>
              <p>最后更新: {{ lastUpdateTime || '无' }}</p>
            </el-card>
          </el-col>
        </el-row>

        <!-- 操作按钮 -->
        <el-row :gutter="20" class="action-row">
          <el-col :span="24">
            <el-space wrap>
              <el-button type="primary" @click="connectWebSocket" :disabled="connectionStatus === 'connected'">
                连接WebSocket
              </el-button>
              <el-button type="danger" @click="disconnectWebSocket" :disabled="connectionStatus !== 'connected'">
                断开连接
              </el-button>
              <el-button type="success" @click="createTestNotification">
                创建测试通知
              </el-button>
              <el-button @click="refreshNotifications">
                刷新通知列表
              </el-button>
              <el-button @click="clearNotifications">
                清空通知
              </el-button>
            </el-space>
          </el-col>
        </el-row>

        <!-- 实时日志 -->
        <el-card shadow="never" class="log-card">
          <template #header>
            <div class="card-header">
              <span>实时日志</span>
              <el-button size="small" @click="clearLogs">清空日志</el-button>
            </div>
          </template>
          <div class="log-content" ref="logContainer">
            <div v-for="(log, index) in logs" :key="index" class="log-item" :class="log.type">
              <span class="log-time">{{ log.time }}</span>
              <span class="log-message">{{ log.message }}</span>
            </div>
            <div v-if="logs.length === 0" class="no-logs">暂无日志</div>
          </div>
        </el-card>

        <!-- 通知列表 -->
        <el-card shadow="never" class="notification-card">
          <template #header>
            <span>收到的通知</span>
          </template>
          <div class="notification-list">
            <div v-for="notification in notifications" :key="notification.id" class="notification-item">
              <div class="notification-header">
                <span class="notification-title">{{ notification.title }}</span>
                <el-tag size="small" :type="getNotificationTagType(notification.type)">
                  {{ notification.type }}
                </el-tag>
              </div>
              <div class="notification-content">{{ notification.content }}</div>
              <div class="notification-time">{{ formatTime(notification.createTime) }}</div>
            </div>
            <div v-if="notifications.length === 0" class="no-notifications">暂无通知</div>
          </div>
        </el-card>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { useNotificationStore } from '@/stores/notification'
import { createTestNotifications } from '@/api/notification'

const userStore = useUserStore()
const notificationStore = useNotificationStore()

// 响应式数据
const connectionStatus = ref<'connected' | 'disconnected'>('disconnected')
const unreadCount = ref(0)
const notifications = ref<any[]>([])
const logs = ref<Array<{ time: string; message: string; type: string }>>([])
const lastUpdateTime = ref<string>('')
const logContainer = ref<HTMLElement>()

// 添加日志
const addLog = (message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
  const now = new Date()
  logs.value.push({
    time: now.toLocaleTimeString(),
    message,
    type
  })

  // 自动滚动到底部
  nextTick(() => {
    if (logContainer.value) {
      logContainer.value.scrollTop = logContainer.value.scrollHeight
    }
  })
}

// WebSocket连接
const connectWebSocket = async () => {
  if (!userStore.token) {
    ElMessage.error('请先登录')
    addLog('连接失败：用户未登录', 'error')
    return
  }

  addLog('正在连接WebSocket...', 'info')

  try {
    const { webSocketService } = await import('@/utils/websocket')
    webSocketService.connect()

    // 检查连接状态
    setTimeout(() => {
      if (webSocketService.isWebSocketConnected()) {
        connectionStatus.value = 'connected'
        addLog('WebSocket连接成功', 'success')
      } else {
        addLog('WebSocket连接失败', 'error')
      }
    }, 2000)
  } catch (error) {
    addLog(`WebSocket连接失败: ${error}`, 'error')
  }
}

// 断开WebSocket连接
const disconnectWebSocket = async () => {
  try {
    const { webSocketService } = await import('@/utils/websocket')
    webSocketService.disconnect()
    connectionStatus.value = 'disconnected'
    addLog('WebSocket连接已断开', 'warning')
  } catch (error) {
    addLog(`断开连接失败: ${error}`, 'error')
  }
}

// 创建测试通知
const createTestNotification = async () => {
  try {
    addLog('正在创建测试通知...', 'info')
    await createTestNotifications()
    addLog('测试通知创建成功', 'success')
    ElMessage.success('测试通知已创建，请查看通知中心')
  } catch (error) {
    addLog(`创建测试通知失败: ${error}`, 'error')
    ElMessage.error('创建测试通知失败')
  }
}

// 刷新通知列表
const refreshNotifications = async () => {
  try {
    addLog('正在刷新通知列表...', 'info')
    const response = await notificationStore.fetchNotifications({ limit: 10 })
    if (response) {
      notifications.value = response.list || []
      lastUpdateTime.value = new Date().toLocaleTimeString()
      addLog(`通知列表刷新成功，共${notifications.value.length}条通知`, 'success')
    }
  } catch (error) {
    addLog(`刷新通知列表失败: ${error}`, 'error')
  }
}

// 清空通知
const clearNotifications = () => {
  notifications.value = []
  addLog('通知列表已清空', 'info')
}

// 清空日志
const clearLogs = () => {
  logs.value = []
}

// 格式化时间
const formatTime = (time: string) => {
  return new Date(time).toLocaleString()
}

// 获取通知标签类型
const getNotificationTagType = (type: string) => {
  switch (type) {
    case 'system': return 'info'
    case 'application': return 'success'
    case 'interview': return 'warning'
    default: return 'info'
  }
}

// 监听WebSocket事件
onMounted(async () => {
  addLog('页面加载完成', 'info')

  // 检查初始连接状态
  try {
    const { webSocketService } = await import('@/utils/websocket')
    if (webSocketService.isWebSocketConnected()) {
      connectionStatus.value = 'connected'
      addLog('WebSocket已连接', 'success')
    }
  } catch (error) {
    addLog('检查WebSocket状态失败', 'warning')
  }

  // 获取初始通知数据
  refreshNotifications()
})

onUnmounted(() => {
  addLog('页面即将卸载', 'info')
})
</script>

<style scoped>
.websocket-test {
  padding: 20px;
}

.test-card {
  max-width: 1200px;
  margin: 0 auto;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.test-content {
  space-y: 20px;
}

.status-row,
.action-row {
  margin-bottom: 20px;
}

.log-card,
.notification-card {
  margin-top: 20px;
}

.log-content {
  max-height: 300px;
  overflow-y: auto;
  background: #f5f5f5;
  padding: 10px;
  border-radius: 4px;
}

.log-item {
  margin-bottom: 5px;
  font-family: monospace;
  font-size: 12px;
}

.log-item.info { color: #409eff; }
.log-item.success { color: #67c23a; }
.log-item.warning { color: #e6a23c; }
.log-item.error { color: #f56c6c; }

.log-time {
  color: #999;
  margin-right: 10px;
}

.no-logs,
.no-notifications {
  text-align: center;
  color: #999;
  padding: 20px;
}

.notification-list {
  max-height: 400px;
  overflow-y: auto;
}

.notification-item {
  border-bottom: 1px solid #eee;
  padding: 10px 0;
}

.notification-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 5px;
}

.notification-title {
  font-weight: bold;
}

.notification-content {
  color: #666;
  margin-bottom: 5px;
}

.notification-time {
  font-size: 12px;
  color: #999;
}

.badge-item {
  margin-right: 10px;
}
</style>

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useUserStore } from '../user'

// 模拟API调用
vi.mock('@/api/user', () => ({
  login: vi.fn().mockResolvedValue({
    code: 200,
    data: {
      token: 'mock-token',
      user_info: {
        id: 1,
        username: 'testuser',
        user_type: 'student',
        avatar: ''
      }
    }
  }),
  getUserInfo: vi.fn().mockResolvedValue({
    code: 200,
    data: {
      id: 1,
      username: 'testuser',
      user_type: 'student',
      avatar: ''
    }
  }),
  logout: vi.fn().mockResolvedValue({ code: 200 })
}))

// 模拟路由
vi.mock('vue-router', () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn()
  })),
  createRouter: vi.fn(),
  createWebHistory: vi.fn()
}))

// 模拟Element Plus消息组件
vi.mock('element-plus', () => ({
  ElMessage: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn()
  }
}))

describe('User Store', () => {
  beforeEach(() => {
    // 创建一个新的Pinia实例并设为活动实例
    setActivePinia(createPinia())
  })

  it('初始状态应该是未登录', () => {
    const store = useUserStore()
    expect(store.token).toBeNull()
    expect(store.userInfo).toBeNull()
    expect(store.loading).toBe(false)
  })

  it('登录成功后应该设置token和用户信息', async () => {
    const store = useUserStore()
    await store.login({ username: 'testuser', password: 'password' })

    expect(store.token).toBe('mock-token')
    expect(store.userInfo).toEqual({
      id: 1,
      username: 'testuser',
      user_type: 'student',
      avatar: ''
    })
  })

  it('登出后应该清除token和用户信息', async () => {
    const store = useUserStore()

    // 先登录
    await store.login({ username: 'testuser', password: 'password' })
    expect(store.token).toBe('mock-token')

    // 然后登出
    await store.logout()
    expect(store.token).toBeNull()
    expect(store.userInfo).toBeNull()
  })
})

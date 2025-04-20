import { describe, it, expect, vi, beforeEach } from 'vitest'
import axios from 'axios'
import service from '../request'

// 模拟axios
vi.mock('axios', () => {
  const interceptors = {
    request: { use: vi.fn() },
    response: { use: vi.fn() }
  };
  return {
    default: {
      create: vi.fn(() => ({
        interceptors
      }))
    }
  }
})

// 模拟Pinia store
vi.mock('@/stores/user', () => ({
  useUserStore: vi.fn(() => ({
    token: 'mock-token'
  }))
}))

// 模拟Element Plus消息组件
vi.mock('element-plus', () => ({
  ElMessage: {
    error: vi.fn()
  }
}))

describe('Axios Request Service', () => {
  it('应该创建一个axios实例', () => {
    expect(axios.create).toHaveBeenCalled()
  })

  it('应该配置请求和响应拦截器', () => {
    const mockAxiosInstance = axios.create()
    expect(mockAxiosInstance.interceptors.request.use).toHaveBeenCalled()
    expect(mockAxiosInstance.interceptors.response.use).toHaveBeenCalled()
  })
})

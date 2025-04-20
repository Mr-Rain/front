import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import Navbar from '../common/Navbar.vue'
import { createPinia, setActivePinia } from 'pinia'
import { ElMenu, ElButton } from 'element-plus'

// 创建模拟路由
const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home' },
    { path: '/login', name: 'login' },
    { path: '/register', name: 'register' }
  ]
})

// 模拟用户store
vi.mock('@/stores/user', () => ({
  useUserStore: vi.fn(() => ({
    token: null,
    userInfo: null,
    logout: vi.fn()
  }))
}))

describe('Navbar', () => {
  beforeEach(() => {
    // 创建并激活一个新的Pinia实例
    setActivePinia(createPinia())
  })

  it('renders properly when user is not logged in', () => {
    const wrapper = mount(Navbar, {
      global: {
        plugins: [router],
        stubs: {
          ElMenu,
          ElButton,
          'el-menu-item': true,
          'el-sub-menu': true,
          'el-dropdown': true,
          'el-icon': true,
          MobileMenu: true
        }
      }
    })

    // 验证登录按钮存在
    expect(wrapper.find('.navbar-content').exists()).toBe(true)
    expect(wrapper.find('button').text()).toContain('登录')
  })
})

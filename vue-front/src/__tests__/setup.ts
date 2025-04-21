import { vi } from 'vitest';
import { config } from '@vue/test-utils';
import { createPinia } from 'pinia';

// 全局设置
config.global.plugins = [createPinia()];

// 模拟 window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// 模拟 Element Plus 组件
vi.mock('element-plus', () => {
  return {
    ElMessage: {
      success: vi.fn(),
      error: vi.fn(),
      warning: vi.fn(),
      info: vi.fn(),
    },
    ElMessageBox: {
      confirm: vi.fn().mockResolvedValue(true),
      alert: vi.fn().mockResolvedValue(true),
    },
  };
});

// 模拟 vue-router
vi.mock('vue-router', () => {
  const router = {
    push: vi.fn(),
    replace: vi.fn(),
    go: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
  };
  
  return {
    useRouter: vi.fn(() => router),
    useRoute: vi.fn(() => ({
      path: '/',
      query: {},
      params: {},
    })),
    createRouter: vi.fn(() => router),
    createWebHistory: vi.fn(),
  };
});

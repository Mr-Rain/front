import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useUserStore } from '@/stores/user';

// 模拟 API 调用
vi.mock('@/api/user', () => {
  return {
    login: vi.fn(),
    getUserInfo: vi.fn(),
    logout: vi.fn(),
  };
});

// 模拟 localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value.toString();
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('User Store', () => {
  beforeEach(() => {
    // 创建一个新的 Pinia 实例并使其成为活动实例
    setActivePinia(createPinia());
    
    // 清除 localStorage 模拟
    localStorageMock.clear();
    
    // 重置所有模拟
    vi.resetAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('initializes with correct state', () => {
    const store = useUserStore();
    expect(store.token).toBeNull();
    expect(store.userInfo).toBeNull();
    expect(store.isLoggedIn).toBe(false);
  });

  it('sets token correctly', () => {
    const store = useUserStore();
    store.setToken('test-token');
    expect(store.token).toBe('test-token');
    expect(localStorageMock.setItem).toHaveBeenCalledWith('token', 'test-token');
  });

  it('sets user info correctly', () => {
    const store = useUserStore();
    const userInfo = { id: '1', username: 'test', user_type: 'student' };
    store.setUserInfo(userInfo);
    expect(store.userInfo).toEqual(userInfo);
  });

  it('clears state on logout', () => {
    const store = useUserStore();
    
    // 设置初始状态
    store.setToken('test-token');
    store.setUserInfo({ id: '1', username: 'test', user_type: 'student' });
    
    // 执行登出
    store.logout();
    
    // 验证状态已清除
    expect(store.token).toBeNull();
    expect(store.userInfo).toBeNull();
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('token');
  });

  it('computes isLoggedIn correctly', () => {
    const store = useUserStore();
    
    // 初始状态
    expect(store.isLoggedIn).toBe(false);
    
    // 设置 token
    store.setToken('test-token');
    expect(store.isLoggedIn).toBe(true);
    
    // 清除 token
    store.setToken(null);
    expect(store.isLoggedIn).toBe(false);
  });
});

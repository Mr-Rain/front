import { defineStore } from 'pinia';
import { ref, watch } from 'vue';

// 主题类型
export type ThemeType = 'light' | 'dark' | 'system';

// 主题颜色
export interface ThemeColors {
  primary: string;
  success: string;
  warning: string;
  danger: string;
  info: string;
}

export const useThemeStore = defineStore('theme', () => {
  // 获取系统主题偏好
  const getSystemTheme = (): 'light' | 'dark' => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  };

  // 从本地存储获取主题设置
  const getSavedTheme = (): ThemeType => {
    const savedTheme = localStorage.getItem('theme');
    return (savedTheme as ThemeType) || 'system';
  };

  // 从本地存储获取主题颜色
  const getSavedColors = (): ThemeColors => {
    const savedColors = localStorage.getItem('themeColors');
    return savedColors ? JSON.parse(savedColors) : {
      primary: '#409EFF',
      success: '#67C23A',
      warning: '#E6A23C',
      danger: '#F56C6C',
      info: '#909399'
    };
  };

  // 主题状态
  const themeType = ref<ThemeType>(getSavedTheme());
  const themeColors = ref<ThemeColors>(getSavedColors());
  const currentTheme = ref<'light' | 'dark'>(
    themeType.value === 'system' ? getSystemTheme() : themeType.value as 'light' | 'dark'
  );

  // 监听系统主题变化
  const setupSystemThemeListener = () => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = (e: MediaQueryListEvent) => {
      if (themeType.value === 'system') {
        currentTheme.value = e.matches ? 'dark' : 'light';
        applyTheme();
      }
    };

    mediaQuery.addEventListener('change', handleChange);

    // 返回清理函数
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  };

  // 设置主题
  const setTheme = (theme: ThemeType) => {
    themeType.value = theme;

    if (theme === 'system') {
      currentTheme.value = getSystemTheme();
    } else {
      currentTheme.value = theme;
    }

    // 保存到本地存储
    localStorage.setItem('theme', theme);

    // 应用主题
    applyTheme();
  };

  // 设置主题颜色
  const setThemeColors = (colors: Partial<ThemeColors>) => {
    themeColors.value = { ...themeColors.value, ...colors };

    // 保存到本地存储
    localStorage.setItem('themeColors', JSON.stringify(themeColors.value));

    // 应用主题颜色
    applyThemeColors();
  };

  // 应用主题
  const applyTheme = () => {
    // 获取当前路由路径
    const currentPath = window.location.pathname;

    // 判断是否在白名单路径上（不应用主题切换）
    const whiteList = ['/', '/login', '/register', '/forgot-password', '/auth'];
    const isWhitePath = whiteList.some(path => currentPath === path || currentPath.startsWith(path + '/'));

    // 如果是白名单路径，不应用主题切换
    if (isWhitePath) {
      // 移除之前的主题类
      document.documentElement.classList.remove('light-theme', 'dark-theme');
      document.body.classList.remove('light-theme', 'dark-theme');

      // 重置 Element Plus 主题为默认值
      document.documentElement.removeAttribute('data-theme');
      document.documentElement.style.removeProperty('--el-bg-color');
      document.documentElement.style.removeProperty('--el-bg-color-overlay');
      document.documentElement.style.removeProperty('--el-text-color-primary');

      return; // 不继续应用主题
    }

    // 对于需要应用主题的路径
    // 移除之前的主题类
    document.documentElement.classList.remove('light-theme', 'dark-theme');
    document.body.classList.remove('light-theme', 'dark-theme');
    document.querySelectorAll('html, body, #app').forEach(el => {
      el.classList.remove('light-theme', 'dark-theme');
    });

    // 添加当前主题类
    document.documentElement.classList.add(`${currentTheme.value}-theme`);
    document.body.classList.add(`${currentTheme.value}-theme`);
    document.querySelectorAll('html, body, #app').forEach(el => {
      el.classList.add(`${currentTheme.value}-theme`);
    });

    // 设置 Element Plus 主题
    document.documentElement.setAttribute('data-theme', currentTheme.value);
    document.documentElement.style.setProperty('--el-bg-color', currentTheme.value === 'dark' ? '#1a1a1a' : '#ffffff');
    document.documentElement.style.setProperty('--el-bg-color-overlay', currentTheme.value === 'dark' ? '#1a1a1a' : '#ffffff');
    document.documentElement.style.setProperty('--el-text-color-primary', currentTheme.value === 'dark' ? '#e5eaf3' : '#303133');

    // 应用主题颜色
    applyThemeColors();
  };

  // 应用主题颜色
  const applyThemeColors = () => {
    // 获取当前路由路径
    const currentPath = window.location.pathname;

    // 判断是否在白名单路径上（不应用主题切换）
    const whiteList = ['/', '/login', '/register', '/forgot-password', '/auth'];
    const isWhitePath = whiteList.some(path => currentPath === path || currentPath.startsWith(path + '/'));

    // 如果是白名单路径，不应用主题颜色
    if (isWhitePath) {
      return; // 不继续应用主题颜色
    }

    // 设置 CSS 变量
    const root = document.documentElement;

    Object.entries(themeColors.value).forEach(([key, value]) => {
      root.style.setProperty(`--el-color-${key}`, value);

      // 为主色设置不同的亮度变体
      if (key === 'primary') {
        // 生成主色的不同亮度变体
        for (let i = 1; i <= 9; i++) {
          const lightColor = currentTheme.value === 'dark'
            ? getDarkerColor(value, i * 0.05) // 深色模式下的亮色变体更暗
            : getLighterColor(value, i * 0.1); // 浅色模式下的正常亮色变体
          root.style.setProperty(`--el-color-${key}-light-${i}`, lightColor);
        }

        // 设置主色的暗色变体
        const darkColor = currentTheme.value === 'dark'
          ? getLighterColor(value, 0.2) // 深色模式下的暗色变体实际上更亮
          : getDarkerColor(value, 0.1); // 浅色模式下的正常暗色变体
        root.style.setProperty(`--el-color-${key}-dark-2`, darkColor);
      }

      // 为其他颜色设置亮色和暗色变体
      if (['success', 'warning', 'danger', 'info'].includes(key)) {
        // 设置亮色变体
        for (let i = 3; i <= 9; i += 2) {
          const lightColor = currentTheme.value === 'dark'
            ? getDarkerColor(value, (i / 20)) // 深色模式下的变体
            : getLighterColor(value, (i / 10)); // 浅色模式下的变体
          root.style.setProperty(`--el-color-${key}-light-${i}`, lightColor);
        }

        // 设置暗色变体
        const darkColor = currentTheme.value === 'dark'
          ? getLighterColor(value, 0.2) // 深色模式下的暗色变体实际上更亮
          : getDarkerColor(value, 0.1); // 浅色模式下的正常暗色变体
        root.style.setProperty(`--el-color-${key}-dark-2`, darkColor);
      }
    });

    // 强制应用主题到 Element Plus 组件
    if (currentTheme.value === 'dark') {
      root.style.setProperty('--el-border-color', '#4c4d4f');
      root.style.setProperty('--el-border-color-light', '#414243');
      root.style.setProperty('--el-border-color-lighter', '#363637');
      root.style.setProperty('--el-fill-color-blank', '#1a1a1a');
      root.style.setProperty('--el-mask-color', 'rgba(0, 0, 0, 0.8)');
      root.style.setProperty('--el-mask-color-extra-light', 'rgba(0, 0, 0, 0.3)');
    } else {
      root.style.setProperty('--el-border-color', '#dcdfe6');
      root.style.setProperty('--el-border-color-light', '#e4e7ed');
      root.style.setProperty('--el-border-color-lighter', '#ebeef5');
      root.style.setProperty('--el-fill-color-blank', '#ffffff');
      root.style.setProperty('--el-mask-color', 'rgba(255, 255, 255, 0.9)');
      root.style.setProperty('--el-mask-color-extra-light', 'rgba(255, 255, 255, 0.3)');
    }
  };

  // 获取更亮的颜色
  const getLighterColor = (hex: string, amount: number): string => {
    const rgb = hexToRgb(hex);
    if (!rgb) return hex;

    const { r, g, b } = rgb;
    const lighterR = Math.min(255, r + (255 - r) * amount);
    const lighterG = Math.min(255, g + (255 - g) * amount);
    const lighterB = Math.min(255, b + (255 - b) * amount);

    return rgbToHex(Math.round(lighterR), Math.round(lighterG), Math.round(lighterB));
  };

  // 获取更暗的颜色
  const getDarkerColor = (hex: string, amount: number): string => {
    const rgb = hexToRgb(hex);
    if (!rgb) return hex;

    const { r, g, b } = rgb;
    const darkerR = Math.max(0, r * (1 - amount));
    const darkerG = Math.max(0, g * (1 - amount));
    const darkerB = Math.max(0, b * (1 - amount));

    return rgbToHex(Math.round(darkerR), Math.round(darkerG), Math.round(darkerB));
  };

  // 十六进制颜色转 RGB
  const hexToRgb = (hex: string): { r: number, g: number, b: number } | null => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  };

  // RGB 转十六进制颜色
  const rgbToHex = (r: number, g: number, b: number): string => {
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
  };

  // 重置主题设置
  const resetTheme = () => {
    setTheme('system');
    setThemeColors({
      primary: '#409EFF',
      success: '#67C23A',
      warning: '#E6A23C',
      danger: '#F56C6C',
      info: '#909399'
    });
  };

  // 监听主题变化
  watch(themeType, (newTheme) => {
    if (newTheme === 'system') {
      currentTheme.value = getSystemTheme();
    } else {
      currentTheme.value = newTheme;
    }
    applyTheme();
  });

  // 初始化主题
  const initTheme = () => {
    // 设置系统主题监听器
    setupSystemThemeListener();

    // 应用初始主题
    applyTheme();

    // 监听路由变化，重新应用主题
    window.addEventListener('popstate', applyTheme);

    // 监听点击事件，检测路由变化
    let lastPath = window.location.pathname;
    document.addEventListener('click', () => {
      // 延迟检查，等待路由变化完成
      setTimeout(() => {
        const currentPath = window.location.pathname;
        if (currentPath !== lastPath) {
          lastPath = currentPath;
          applyTheme();
        }
      }, 100);
    });
  };

  return {
    themeType,
    themeColors,
    currentTheme,
    setTheme,
    setThemeColors,
    resetTheme,
    initTheme
  };
});

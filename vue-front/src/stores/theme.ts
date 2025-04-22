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
    // 移除之前的主题类
    document.documentElement.classList.remove('light-theme', 'dark-theme');
    
    // 添加当前主题类
    document.documentElement.classList.add(`${currentTheme.value}-theme`);
    
    // 设置 Element Plus 主题
    document.documentElement.setAttribute('data-theme', currentTheme.value);
    
    // 应用主题颜色
    applyThemeColors();
  };

  // 应用主题颜色
  const applyThemeColors = () => {
    // 设置 CSS 变量
    const root = document.documentElement;
    
    Object.entries(themeColors.value).forEach(([key, value]) => {
      root.style.setProperty(`--el-color-${key}`, value);
      
      // 为主色设置不同的亮度变体
      if (key === 'primary') {
        // 生成主色的不同亮度变体
        for (let i = 1; i <= 9; i++) {
          const lightColor = getLighterColor(value, i * 0.1);
          root.style.setProperty(`--el-color-${key}-light-${i}`, lightColor);
        }
        
        // 设置主色的暗色变体
        const darkColor = getDarkerColor(value, 0.1);
        root.style.setProperty(`--el-color-${key}-dark-2`, darkColor);
      }
    });
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

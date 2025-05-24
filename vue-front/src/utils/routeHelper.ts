import type { Router } from 'vue-router';
import { ElMessage } from 'element-plus';

/**
 * 路由重定向映射表
 * 用于处理路径变更时的自动重定向
 */
const REDIRECT_MAP: Record<string, string> = {
  '/company/application-manage': '/company/applications',
  '/student/application-detail': '/student/applications',
  '/admin/user-manage': '/admin/users',
  '/admin/company-audit': '/admin/companies',
  '/admin/announcement-manage': '/admin/announcements'
};

/**
 * 简单的路由跳转函数，与项目其他部分保持一致
 * @param router Vue Router实例
 * @param link 目标链接
 * @returns Promise<boolean> 跳转是否成功
 */
export async function navigateTo(router: Router, link: string): Promise<boolean> {
  if (!link) {
    console.warn('Navigation link is empty');
    return false;
  }

  console.log('Navigating to:', link);

  try {
    // 检查是否为外部链接
    if (link.startsWith('http://') || link.startsWith('https://')) {
      window.open(link, '_blank');
      return true;
    }

    // 检查是否需要重定向
    const redirectedLink = getRedirectedLink(link);
    const finalLink = redirectedLink || link;

    if (redirectedLink) {
      console.log('Redirected to:', redirectedLink);
    }

    // 使用与项目其他部分一致的跳转方式
    await router.push(finalLink);
    return true;
  } catch (error) {
    console.error('Navigation error:', error);
    ElMessage.error('页面跳转失败');
    return false;
  }
}

/**
 * 获取重定向链接
 * @param originalLink 原始链接
 * @returns 重定向后的链接，如果不需要重定向则返回null
 */
export function getRedirectedLink(originalLink: string): string | null {
  // 检查完整路径匹配
  if (REDIRECT_MAP[originalLink]) {
    return REDIRECT_MAP[originalLink];
  }

  // 检查路径前缀匹配
  for (const [oldPath, newPath] of Object.entries(REDIRECT_MAP)) {
    if (originalLink.startsWith(oldPath)) {
      return originalLink.replace(oldPath, newPath);
    }
  }

  // 处理带参数的路径
  if (originalLink.includes('?')) {
    const [path, query] = originalLink.split('?');
    const redirectedPath = getRedirectedLink(path);
    if (redirectedPath) {
      return `${redirectedPath}?${query}`;
    }
  }

  return null;
}

/**
 * 检查路由是否存在
 * @param router Vue Router实例
 * @param link 要检查的链接
 * @returns 路由状态描述
 */
export function checkRouteStatus(router: Router, link: string): string {
  try {
    const targetRoute = router.resolve(link);
    if (targetRoute.name === 'not-found' || !targetRoute.matched.length) {
      return '路由不存在';
    }
    return '路由存在';
  } catch (error) {
    return '路由解析错误';
  }
}

/**
 * 智能导航函数
 * 支持外部链接、路由检查、智能重定向等功能
 * @param router Vue Router实例
 * @param link 目标链接
 * @param options 配置选项
 */
export async function smartNavigate(
  router: Router,
  link: string,
  options: {
    showSuccessMessage?: boolean;
    showErrorMessage?: boolean;
    openExternalInNewTab?: boolean;
  } = {}
): Promise<boolean> {
  const {
    showSuccessMessage = false,
    showErrorMessage = true,
    openExternalInNewTab = true
  } = options;

  if (!link) {
    if (showErrorMessage) {
      ElMessage.warning('链接为空');
    }
    return false;
  }

  console.log('Smart navigating to link:', link);

  try {
    // 检查链接是否为外部链接
    if (link.startsWith('http://') || link.startsWith('https://')) {
      if (openExternalInNewTab) {
        window.open(link, '_blank');
      } else {
        window.location.href = link;
      }
      return true;
    }

    // 处理内部路由链接
    // 检查路由是否存在
    const targetRoute = router.resolve(link);

    if (targetRoute.name === 'not-found' || !targetRoute.matched.length) {
      // 路由不存在，尝试智能重定向
      const redirectedLink = getRedirectedLink(link);
      if (redirectedLink && redirectedLink !== link) {
        console.log('Redirecting to:', redirectedLink);
        await router.push(redirectedLink);
        if (showSuccessMessage) {
          ElMessage.success('已重定向到新页面');
        }
        return true;
      } else {
        if (showErrorMessage) {
          ElMessage.warning('目标页面不存在或已被移动');
        }
        console.warn('Route not found:', link);
        return false;
      }
    } else {
      // 路由存在，直接跳转
      await router.push(link);
      return true;
    }
  } catch (error) {
    console.error('Navigation error:', error);
    if (showErrorMessage) {
      ElMessage.error('页面跳转失败');
    }
    return false;
  }
}

/**
 * 添加新的重定向规则
 * @param oldPath 旧路径
 * @param newPath 新路径
 */
export function addRedirectRule(oldPath: string, newPath: string): void {
  REDIRECT_MAP[oldPath] = newPath;
}

/**
 * 获取所有重定向规则
 * @returns 重定向规则映射表的副本
 */
export function getRedirectRules(): Record<string, string> {
  return { ...REDIRECT_MAP };
}

/**
 * 清除重定向规则
 * @param oldPath 要清除的旧路径，如果不提供则清除所有规则
 */
export function clearRedirectRules(oldPath?: string): void {
  if (oldPath) {
    delete REDIRECT_MAP[oldPath];
  } else {
    Object.keys(REDIRECT_MAP).forEach(key => {
      delete REDIRECT_MAP[key];
    });
  }
}

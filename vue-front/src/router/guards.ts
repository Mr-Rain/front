import type { Router, RouteLocationNormalized } from 'vue-router';
import { useUserStore } from '@/stores/user'; // 假设 user store 用于管理登录状态和用户信息
import { usePermissionStore } from '@/stores/permission';
// import NProgress from 'nprogress'; // optional progress bar
// import 'nprogress/nprogress.css';

// NProgress.configure({ showSpinner: false }); // optional configuration

// 白名单，不需要登录即可访问的路由路径
const whiteList = ['/', '/login', '/register', '/forgot-password', '/404', '/401', '/jobs', '/companies', '/account-settings'];

// 定义角色对应的首页路径
const homePathMap: Record<string, string> = {
  student: '/student/dashboard', // TODO: Update with actual student dashboard path
  company: '/company/dashboard', // TODO: Update with actual company dashboard path
  admin: '/admin/dashboard',   // TODO: Update with actual admin dashboard path
};

/*
 * 获取用户角色对应的首页路径
 * @param roles 用户角色列表
 * @returns 首页路径，默认为 '/'
 */
function getHomePath(roles: string[]): string {
  if (!roles || roles.length === 0) return '/';
  // 简单处理：取第一个角色对应的路径，或者可以根据优先级判断
  const role = roles[0];
  return homePathMap[role] || '/';
}

export function createRouterGuards(router: Router) {
  router.beforeEach(async (to: RouteLocationNormalized, from: RouteLocationNormalized, next: any) => {
    // NProgress.start();
    const userStore = useUserStore();
    const permissionStore = usePermissionStore();
    const token = userStore.token;

    if (token) {
      // --- 已登录 ---
      if (to.path === '/login') {
        // 如果已登录，访问登录页则重定向到对应角色的首页
        const homePath = getHomePath(permissionStore.roles); // 需要先获取角色信息
        next({ path: homePath, replace: true });
      } else {
        // 检查是否已有用户信息和权限信息
        const hasUserInfo = !!userStore.userInfo;
        const hasPermissions = permissionStore.roles.length > 0;

        if (hasUserInfo && hasPermissions) {
          // 如果已有信息，直接放行
          next(); // 放行到目标路由 (including '/' now)
        } else {
          try {
            // 异步获取用户信息
            if (!hasUserInfo) {
              await userStore.getUserInfo();
            }
            // 异步获取权限信息 (角色和权限点)
            if (!hasPermissions) {
              await permissionStore.fetchUserPermissions();
            }

            // 基于角色添加动态路由
            const roles = permissionStore.roles;

            // 使用 hasRoutePermission 方法检查路由权限
            if (!permissionStore.hasRoutePermission(to)) {
              // 没有权限访问该路由
              next({ path: '/unauthorized' });
              return;
            }

            // 根据角色设置重定向路由
            if (to.path === '/' || to.path === '/home') {
              // 根据角色重定向到不同的首页
              if (roles.includes('admin')) {
                next({ path: '/admin/dashboard' });
                return;
              } else if (roles.includes('company')) {
                next({ path: '/company/dashboard' });
                return;
              } else if (roles.includes('student')) {
                next({ path: '/student/dashboard' });
                return;
              }
            }

            // === START: Remove root path redirect AFTER fetching ===
            // 获取信息后再次检查目标路径
            // if (to.path === '/') { // <-- Remove this block
            //    const homePath = getHomePath(permissionStore.roles);
            //    next({ path: homePath, replace: true });
            //} else {
            next({ ...to, replace: true }); // Continue to original target (including '/')
            //}
            // === END: Remove root path redirect AFTER fetching ===

          } catch (error) {
            // 获取信息失败 (例如 token 失效)
            console.error('Guard Error: Failed to get user info or permissions:', error);
            await userStore.logout(); // 清理状态并跳转到登录页
            next(`/login?redirect=${to.path}`);
          }
        }
      }
    } else {
      // --- 未登录 ---
      if (whiteList.includes(to.path) || to.path.match(/^\/jobs\/\d+$/)) {
        // 如果在白名单中或是职位详情页，直接放行
        next();
      } else {
        // === START: Remove explicit root path redirect for unauthenticated ===
        // if (to.path === '/') { // <-- Remove this block
        //     next('/login');
        // } else {
        next(`/login?redirect=${to.path}`);
        // }
        // === END: Remove explicit root path redirect for unauthenticated ===
      }
    }
  });

  router.afterEach(() => {
    // NProgress.done();
  });

  router.onError((error) => {
    console.error('Router Error:', error);
    // NProgress.done(); // Ensure progress bar stops on error
  });
}
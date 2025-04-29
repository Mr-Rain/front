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

// 防止无限重定向的标志
let isRedirecting = false;
let apiErrorOccurred = false;

export function createRouterGuards(router: Router) {
  router.beforeEach(async (to: RouteLocationNormalized, from: RouteLocationNormalized, next: any) => {
    console.log(`Route navigation: ${from.path} -> ${to.path}`);

    // 如果正在重定向或发生API错误，直接放行
    if (isRedirecting || (apiErrorOccurred && to.path === '/login')) {
      console.log('Skipping guard checks due to redirection or API error');
      isRedirecting = false;
      next();
      return;
    }

    // 如果是从同一路径导航到同一路径（例如刷新页面），直接放行
    if (from.path === to.path && from.name === to.name) {
      console.log('Same route navigation, skipping guard checks');
      next();
      return;
    }

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
              try {
                // 尝试获取用户信息
                await userStore.getUserInfo();
              } catch (error) {
                console.error('Failed to get user info:', error);
                // 如果获取用户信息失败，重置认证状态并跳转到登录页
                userStore.resetAuth();
                next(`/login?redirect=${to.path}`);
                return;
              }
            }

            // 异步获取权限信息 (角色和权限点)
            if (!hasPermissions) {
              try {
                await permissionStore.fetchUserPermissions();
              } catch (error) {
                console.error('Failed to fetch permissions:', error);
                // 标记API错误已发生
                apiErrorOccurred = true;

                // 如果是网络错误，可能是后端未启动，使用用户类型作为备用
                if (userStore.userInfo) {
                  console.log('Using user type as fallback for permissions');
                  const userType = userStore.userInfo?.userType?.toLowerCase();
                  if (userType) {
                    // 手动设置角色，避免重复请求API
                    permissionStore.setRoles([userType as any]);
                    console.log('Set roles based on user type:', userType);

                    // 继续导航
                    next();
                    return;
                  } else {
                    console.warn('No user type available in userInfo:', userStore.userInfo);
                    // 如果没有用户类型，尝试继续导航
                    next();
                    return;
                  }
                } else {
                  // 如果没有用户信息，重置认证状态并跳转到登录页
                  userStore.resetAuth();
                  isRedirecting = true;
                  next(`/login?redirect=${to.path}`);
                  return;
                }
              }
            }

            // 基于角色添加动态路由
            const roles = permissionStore.roles;

            // 使用 hasRoutePermission 方法检查路由权限
            if (to.meta.requiresAuth) {
              console.log('Checking permission for route:', to.path);
              console.log('User roles:', permissionStore.roles);
              console.log('Required roles:', to.meta.roles);

              // 获取用户类型
              const userType = userStore.userInfo?.userType?.toLowerCase();
              console.log('User type:', userType);

              // 检查用户是否有权限访问路由
              const hasPermission = permissionStore.hasRoutePermission(to);
              console.log('Has permission from permission store:', hasPermission);

              // 检查用户类型是否匹配路由所需角色
              const hasRoleByUserType = userType && to.meta.roles &&
                Array.isArray(to.meta.roles) && to.meta.roles.includes(userType);
              console.log('Has role by user type:', hasRoleByUserType);

              // 如果有权限或用户类型匹配，允许访问
              if (hasPermission || hasRoleByUserType) {
                console.log('Permission granted for route:', to.path);

                // 如果权限存储中没有角色，但用户类型匹配，设置角色
                if (!hasPermission && hasRoleByUserType && userType) {
                  console.log('Setting roles based on user type:', userType);
                  permissionStore.setRoles([userType as any]);
                }

                next();
                return;
              }

              // 没有权限访问该路由
              console.log('No permission to access route, redirecting to unauthorized');
              next({ path: '/unauthorized' });
              return;
            }

            // 根据角色设置重定向路由
            if (to.path === '/' || to.path === '/home') {
              // 根据角色重定向到不同的首页
              const userType = userStore.userInfo?.userType?.toLowerCase();

              // 优先使用权限存储中的角色，如果没有则使用用户类型
              if (roles.includes('admin') || userType === 'admin') {
                console.log('Redirecting admin to dashboard');
                next({ path: '/admin/dashboard' });
                return;
              } else if (roles.includes('company') || userType === 'company') {
                console.log('Redirecting company to dashboard');
                next({ path: '/company/dashboard' });
                return;
              } else if (roles.includes('student') || userType === 'student') {
                console.log('Redirecting student to dashboard');
                next({ path: '/student/dashboard' });
                return;
              } else {
                console.log('No valid role found, allowing access to home page');
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
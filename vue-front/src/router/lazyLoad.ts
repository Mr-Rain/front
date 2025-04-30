import type { RouteComponent } from 'vue-router'

// 使用 import.meta.glob 预先获取所有可能的视图组件
// 注意：import.meta.glob 是 Vite 特有的，它返回一个模块映射
// key 是相对路径，value 是一个异步加载函数 () => Promise<Module>
const views = import.meta.glob('../views/**/*.vue');

// 调试用：打印所有可用的视图组件路径
console.log('Available view components:', Object.keys(views));

/**
 * 路由懒加载函数
 *
 * 注意：此函数不再使用defineAsyncComponent包装，
 * 而是直接返回动态导入函数，以避免Vue Router警告
 *
 * @param loader 组件加载函数
 * @returns 异步组件
 */
export function lazyLoad(
  loader: () => Promise<any>
): RouteComponent {
  // 对于路由组件，我们直接返回加载函数
  // 这样Vue Router就不会发出警告
  return loader;
}

/**
 * 创建路由懒加载函数 (使用直接导入)
 * @param path 相对于 src/views/ 的组件路径，例如 'common/HomePage' 或 'student/Dashboard'
 * @returns 懒加载组件
 */
export function createLazyComponent(path: string): RouteComponent {
  // 使用直接导入语句，避免使用 import.meta.glob
  // 这样可以确保每次导航时都重新加载组件
  console.log(`Creating lazy component for path: ${path}`);

  // 根据路径返回不同的导入函数
  if (path === 'student/Dashboard') {
    return () => import('../views/student/Dashboard.vue');
  }
  else if (path === 'student/Profile' || path === 'student/ProfileNew') {
    return () => import('../views/student/ProfileNew.vue');
  }
  else if (path === 'student/JobList') {
    return () => import('../views/student/JobList.vue');
  }
  else if (path === 'student/JobDetail') {
    return () => import('../views/student/JobDetail.vue');
  }
  else if (path === 'student/Resume') {
    return () => import('../views/student/Resume.vue');
  }
  else if (path === 'student/ResumePreview') {
    return () => import('../views/student/ResumePreview.vue');
  }
  else if (path === 'student/ResumeEdit') {
    return () => import('../views/student/ResumeEdit.vue');
  }
  else if (path === 'student/Application') {
    return () => import('../views/student/Application.vue');
  }
  else if (path === 'student/ApplicationDetail') {
    return () => import('../views/student/ApplicationDetail.vue');
  }
  else if (path === 'student/Recommendation') {
    return () => import('../views/student/Recommendation.vue');
  }
  else if (path === 'student/RecommendationSettings') {
    return () => import('../views/student/RecommendationSettings.vue');
  }
  else if (path === 'common/HomePage') {
    return () => import('../views/common/HomePage.vue');
  }
  else if (path === 'common/CompanyList') {
    return () => import('../views/common/CompanyList.vue');
  }
  else if (path === 'common/NotFound') {
    return () => import('../views/common/NotFound.vue');
  }
  else if (path === 'common/Unauthorized') {
    return () => import('../views/common/Unauthorized.vue');
  }
  else if (path === 'common/Notifications') {
    return () => import('../views/common/Notifications.vue');
  }
  else if (path === 'common/NotificationSettings') {
    return () => import('../views/common/NotificationSettings.vue');
  }
  else if (path === 'common/AccountSettings') {
    return () => import('../views/common/AccountSettings.vue');
  }
  else if (path === 'common/SearchResults') {
    return () => import('../views/common/SearchResults.vue');
  }
  else if (path === 'common/CompanyDetail') {
    return () => import('../views/common/CompanyDetail.vue');
  }
  else if (path === 'common/ComponentDemo') {
    return () => import('../views/common/ComponentDemo.vue');
  }
  else if (path === 'common/ImageOptimizationDemo') {
    return () => import('../views/common/ImageOptimizationDemo.vue');
  }
  else if (path === 'common/ErrorHandlingDemo') {
    return () => import('../views/common/ErrorHandlingDemo.vue');
  }
  else if (path === 'common/ApiCacheDemo') {
    return () => import('../views/common/ApiCacheDemo.vue');
  }
  else if (path === 'common/StaticCacheDemo') {
    return () => import('../views/common/StaticCacheDemo.vue');
  }
  else if (path === 'auth/Login') {
    return () => import('../views/auth/Login.vue');
  }
  else if (path === 'auth/Register') {
    return () => import('../views/auth/Register.vue');
  }
  else if (path === 'auth/ForgotPassword') {
    return () => import('../views/auth/ForgotPassword.vue');
  }
  else if (path === 'company/Dashboard') {
    return () => import('../views/company/Dashboard.vue');
  }
  else if (path === 'company/Profile') {
    return () => import('../views/company/Profile.vue');
  }
  else if (path === 'company/JobManage') {
    return () => import('../views/company/JobManage.vue');
  }
  else if (path === 'company/JobEdit') {
    return () => import('../views/company/JobEdit.vue');
  }
  else if (path === 'company/ApplicationManage') {
    return () => import('../views/company/ApplicationManage.vue');
  }
  else if (path === 'admin/Dashboard') {
    return () => import('../views/admin/Dashboard.vue');
  }
  else if (path === 'admin/UserManage') {
    return () => import('../views/admin/UserManage.vue');
  }
  else if (path === 'admin/CompanyAudit') {
    return () => import('../views/admin/CompanyAudit.vue');
  }

  // 如果没有匹配的路径，返回错误组件
  console.error(`No direct import available for path: ${path}`);
  return () => import('../components/common/ErrorComponent.vue');
}

import { createRouter, createWebHistory } from 'vue-router'
import { createLazyComponent } from './lazyLoad'

// 布局组件
import StudentLayout from '@/layouts/StudentLayout.vue'
import CompanyLayout from '@/layouts/CompanyLayout.vue'
import AdminLayout from '@/layouts/AdminLayout.vue'
import DefaultLayout from '@/layouts/DefaultLayout.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  // 添加自定义导航行为
  scrollBehavior(to, from, savedPosition) {
    // 始终滚动到顶部
    return { top: 0 }
  },
  routes: [
    // === START: Add Home Route ===
    {
      path: '/',
      name: 'home',
      component: createLazyComponent('common/HomePage'),
      meta: { title: '首页' } // Public page, no requiresAuth needed
    },
    // === END: Add Home Route ===

    // --- Authentication Routes ---
    {
      path: '/login',
      name: 'login',
      component: createLazyComponent('auth/Login'),
      meta: { title: '登录' },
    },
    {
      path: '/register',
      name: 'register',
      component: createLazyComponent('auth/Register'),
      meta: { title: '注册' },
    },
    {
      path: '/forgot-password',
      name: 'forgot-password',
      component: createLazyComponent('auth/ForgotPassword'),
      meta: { title: '忘记密码' },
    },

    // --- Student Routes ---
    {
      path: '/student',
      component: StudentLayout,
      redirect: '/student/dashboard', // Redirect /student to dashboard
      meta: { requiresAuth: true, roles: ['student'], permissions: ['job:view', 'application:apply', 'resume:edit'] }, // Add role and permissions meta
      children: [
        {
          path: 'dashboard',
          name: 'student-dashboard',
          component: createLazyComponent('student/Dashboard'),
          meta: { title: '学生仪表盘' },
        },
        {
          path: 'profile',
          name: 'student-profile',
          component: () => import('../views/student/ProfileNew.vue'),
          meta: { title: '个人信息' }
        },
        {
          path: 'jobs',
          name: 'student-job-list',
          component: createLazyComponent('student/JobList'),
          meta: { title: '职位列表' }
        },
         {
          path: '/jobs/:id',
          name: 'student-job-detail',
          component: createLazyComponent('student/JobDetail'),
          meta: { title: '职位详情' }
        },
        {
          path: 'resume',
          name: 'student-resume',
          component: createLazyComponent('student/Resume'),
          meta: { title: '我的简历' }
        },
        {
          path: 'resume/:id/preview',
          name: 'student-resume-preview',
          component: createLazyComponent('student/ResumePreview'),
          meta: { title: '简历预览' }
        },
        {
          path: 'resume/:id/edit',
          name: 'student-resume-edit',
          component: createLazyComponent('student/ResumeEdit'),
          meta: { title: '编辑简历' }
        },
         {
          path: 'applications',
          name: 'student-applications',
          component: createLazyComponent('student/Application'),
          meta: { title: '我的申请' }
        },
        {
          path: 'applications/:id',
          name: 'student-application-detail',
          component: createLazyComponent('student/ApplicationDetail'),
          meta: { title: '申请详情' }
        },
        {
          path: 'recommendations',
          name: 'student-recommendations',
          component: createLazyComponent('student/Recommendation'),
          meta: { title: '智能推荐' }
        },
        {
          path: 'recommendations/settings',
          name: 'student-recommendation-settings',
          component: createLazyComponent('student/RecommendationSettings'),
          meta: { title: '推荐设置' }
        },
        {
          path: 'companies',
          name: 'student-company-list',
          component: createLazyComponent('common/CompanyList'),
          meta: { title: '企业列表' }
        }
      ]
    },

    // --- Company Routes ---
    {
      path: '/company',
      component: CompanyLayout,
      redirect: '/company/dashboard',
      meta: { requiresAuth: true, roles: ['company'], permissions: ['job:view', 'job:create', 'job:edit'] },
      children: [
        {
          path: 'dashboard',
          name: 'company-dashboard',
          component: createLazyComponent('company/Dashboard'),
          meta: { title: '企业工作台' },
        },
        {
          path: 'profile',
          name: 'company-profile',
          component: createLazyComponent('company/Profile'),
          meta: { title: '公司信息' }
        },
        {
          path: 'jobs',
          name: 'company-job-manage',
          component: createLazyComponent('company/JobManage'),
          meta: { title: '职位管理' }
        },
        {
          path: 'jobs/edit/:id?', // Optional ID for editing, none for creation
          name: 'company-job-edit',
          component: createLazyComponent('company/JobEdit'),
          meta: { title: '编辑职位' } // Title can be dynamic based on route param
        },
         {
          path: 'applications',
          name: 'company-application-manage',
          component: createLazyComponent('company/ApplicationManage'),
          meta: { title: '收到的申请' }
        },
        {
          path: 'companies',
          name: 'company-company-list',
          component: createLazyComponent('common/CompanyList'),
          meta: { title: '企业列表' }
        },
      ]
    },

    // --- Admin Routes ---
    {
      path: '/admin',
      component: AdminLayout,
      redirect: '/admin/dashboard',
      meta: { requiresAuth: true, roles: ['admin'], permissions: ['user:view'] },
      children: [
        {
          path: 'dashboard',
          name: 'admin-dashboard',
          component: createLazyComponent('admin/Dashboard'),
          meta: { title: '管理工作台' },
        },
        {
          path: 'users',
          name: 'admin-user-manage',
          component: createLazyComponent('admin/UserManage'),
          meta: { title: '用户管理', permissions: ['user:view', 'user:edit', 'user:status'] }
        },
        {
          path: 'companies',
          name: 'admin-company-audit',
          component: createLazyComponent('admin/CompanyAudit'),
          meta: { title: '企业审核', permissions: ['company:view', 'company:audit'] }
        },
        {
          path: 'jobs',
          name: 'admin-job-list',
          component: createLazyComponent('student/JobList'),
          meta: { title: '职位列表' }
        },
        {
          path: 'company-list',
          name: 'admin-company-list',
          component: createLazyComponent('common/CompanyList'),
          meta: { title: '企业列表' }
        }
        // Add more admin routes here
      ]
    },

    // --- General App Routes (accessible to all users) ---
    {
        path: '/jobs',
        component: DefaultLayout,
        children: [
            {
                path: '',
                name: 'job-list',
                component: createLazyComponent('student/JobList'),
                meta: { title: '职位列表' }
            },
            {
                path: ':id',
                name: 'job-detail',
                component: createLazyComponent('student/JobDetail'),
                meta: { title: '职位详情' }
            }
        ]
    },
    {
        path: '/companies',
        component: DefaultLayout,
        children: [
            {
                path: '',
                name: 'company-list',
                component: createLazyComponent('common/CompanyList'),
                meta: { title: '企业列表' }
            }
            // 未来可以添加企业详情页
            // {
            //     path: ':id',
            //     name: 'company-detail',
            //     component: () => import('@/views/common/CompanyDetail.vue'),
            //     meta: { title: '企业详情' }
            // }
        ]
    },

     // --- Root path redirect based on role (handled by guard) ---
     // Remove the previous placeholder for '/'
    // {
    //     path: '/',
    //     name: 'dashboard',
    //     component: () => import('@/views/common/NotFound.vue'),
    //     meta: { requiresAuth: true, title: '仪表盘' }
    // },

    // --- 通知相关路由 ---
    {
      path: '/notifications',
      component: DefaultLayout,
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          name: 'notifications',
          component: createLazyComponent('common/Notifications'),
          meta: { title: '消息通知' }
        },
        {
          path: 'settings',
          name: 'notification-settings',
          component: createLazyComponent('common/NotificationSettings'),
          meta: { title: '通知设置' }
        }
      ]
    },

    // --- 账号设置路由 ---
    {
      path: '/account-settings',
      component: DefaultLayout,
      children: [
        {
          path: '',
          name: 'account-settings',
          component: createLazyComponent('common/AccountSettings'),
          meta: { title: '账号设置' }
        }
      ]
    },

    // --- 搜索结果页面 ---
    {
      path: '/search',
      component: DefaultLayout,
      children: [
        {
          path: '',
          name: 'search-results',
          component: createLazyComponent('common/SearchResults'),
          meta: { title: '搜索结果' }
        }
      ]
    },

    // --- 组件演示页面 ---
    {
      path: '/demo',
      component: DefaultLayout,
      children: [
        {
          path: '',
          name: 'component-demo',
          component: createLazyComponent('common/ComponentDemo'),
          meta: { title: '组件演示' }
        },
        {
          path: 'image-optimization',
          name: 'image-optimization-demo',
          component: createLazyComponent('common/ImageOptimizationDemo'),
          meta: { title: '图片资源优化示例' }
        },
        {
          path: 'error-handling',
          name: 'error-handling-demo',
          component: createLazyComponent('common/ErrorHandlingDemo'),
          meta: { title: 'API错误处理示例' }
        },
        {
          path: 'api-cache',
          name: 'api-cache-demo',
          component: createLazyComponent('common/ApiCacheDemo'),
          meta: { title: 'API数据缓存示例' }
        },
        {
          path: 'static-cache',
          name: 'static-cache-demo',
          component: createLazyComponent('common/StaticCacheDemo'),
          meta: { title: '静态资源缓存示例' }
        },
        {
          path: 'api-test',
          name: 'api-test',
          component: () => import('@/components/common/ApiTest.vue'),
          meta: { title: 'API测试' }
        }
      ]
    },

    // --- Common Routes ---
    {
      path: '/404',
      name: 'not-found',
      component: createLazyComponent('common/NotFound'),
      meta: { title: '页面未找到' },
    },
    {
      path: '/401',
      name: 'unauthorized',
      component: createLazyComponent('common/Unauthorized'),
      meta: { title: '无权限' },
    },
    // Catch-all route must be last
    {
      path: '/:pathMatch(.*)*',
      redirect: '/404',
    },

    // Remove default routes if not needed
    // {
    //   path: '/',
    //   name: 'home',
    //   component: HomeView
    // },
    // {
    //   path: '/about',
    //   name: 'about',
    //   component: () => import('../views/AboutView.vue')
    // }
  ],
})

export default router

import { createRouter, createWebHistory } from 'vue-router'
// Remove default HomeView/AboutView imports if not needed
// import HomeView from '../views/HomeView.vue'
import StudentLayout from '@/layouts/StudentLayout.vue'; // Import student layout
import CompanyLayout from '@/layouts/CompanyLayout.vue'; // Import company layout
import AdminLayout from '@/layouts/AdminLayout.vue'; // Import admin layout
import DefaultLayout from '@/layouts/DefaultLayout.vue'; // Import default layout for public pages

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // === START: Add Home Route ===
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/common/HomePage.vue'), // Point to the new home page
      meta: { title: '首页' } // Public page, no requiresAuth needed
    },
    // === END: Add Home Route ===

    // --- Authentication Routes ---
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/auth/Login.vue'),
      meta: { title: '登录' }, // Example meta field
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('@/views/auth/Register.vue'),
      meta: { title: '注册' },
    },
    {
      path: '/forgot-password',
      name: 'forgot-password',
      component: () => import('@/views/auth/ForgotPassword.vue'),
      meta: { title: '忘记密码' },
    },

    // --- Student Routes ---
    {
      path: '/student',
      component: StudentLayout,
      redirect: '/student/dashboard', // Redirect /student to dashboard
      meta: { requiresAuth: true, roles: ['student'] }, // Add role meta
      children: [
        {
          path: 'dashboard',
          name: 'student-dashboard',
          component: () => import('@/views/student/Dashboard.vue'),
          meta: { title: '学生仪表盘' },
        },
        {
          path: 'profile',
          name: 'student-profile',
          component: () => import('@/views/student/Profile.vue'),
          meta: { title: '个人信息' }
        },
        {
          path: 'jobs',
          name: 'student-job-list', // Use specific name
          component: () => import('@/views/student/JobList.vue'),
          meta: { title: '职位列表' }
        },
         {
          // Note: JobDetail might be shared, consider placing under a general layout later
          // For now, keep it under student for simplicity
          path: '/jobs/:id', // Using /jobs/:id for consistency for now
          name: 'student-job-detail',
          component: () => import('@/views/student/JobDetail.vue'),
          meta: { title: '职位详情' }
        },
        {
          path: 'resume',
          name: 'student-resume',
          component: () => import('@/views/student/Resume.vue'),
          meta: { title: '我的简历' }
        },
         {
          path: 'applications',
          name: 'student-applications',
          component: () => import('@/views/student/Application.vue'),
          meta: { title: '我的申请' }
        },
        {
          path: 'recommendations',
          name: 'student-recommendations',
          component: () => import('@/views/student/Recommendation.vue'),
          meta: { title: '智能推荐' }
        }
      ]
    },

    // --- Company Routes ---
    {
      path: '/company',
      component: CompanyLayout,
      redirect: '/company/dashboard',
      meta: { requiresAuth: true, roles: ['company'] },
      children: [
        {
          path: 'dashboard',
          name: 'company-dashboard',
          component: () => import('@/views/company/Dashboard.vue'),
          meta: { title: '企业工作台' },
        },
        {
          path: 'profile',
          name: 'company-profile',
          component: () => import('@/views/company/Profile.vue'),
          meta: { title: '公司信息' }
        },
        {
          path: 'jobs',
          name: 'company-job-manage',
          component: () => import('@/views/company/JobManage.vue'),
          meta: { title: '职位管理' }
        },
        {
          path: 'jobs/edit/:id?', // Optional ID for editing, none for creation
          name: 'company-job-edit',
          component: () => import('@/views/company/JobEdit.vue'),
          meta: { title: '编辑职位' } // Title can be dynamic based on route param
        },
         {
          path: 'applications',
          name: 'company-application-manage',
          component: () => import('@/views/company/ApplicationManage.vue'),
          meta: { title: '收到的申请' }
        },
      ]
    },

    // --- Admin Routes ---
    {
      path: '/admin',
      component: AdminLayout,
      redirect: '/admin/dashboard',
      meta: { requiresAuth: true, roles: ['admin'] },
      children: [
        {
          path: 'dashboard',
          name: 'admin-dashboard',
          component: () => import('@/views/admin/Dashboard.vue'),
          meta: { title: '管理工作台' },
        },
        {
          path: 'users',
          name: 'admin-user-manage',
          component: () => import('@/views/admin/UserManage.vue'),
          meta: { title: '用户管理' }
        },
        {
          path: 'companies',
          name: 'admin-company-audit',
          component: () => import('@/views/admin/CompanyAudit.vue'),
          meta: { title: '企业审核' }
        },
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
                component: () => import('@/views/student/JobList.vue'),
                meta: { title: '职位列表' }
            },
            {
                path: ':id',
                name: 'job-detail',
                component: () => import('@/views/student/JobDetail.vue'),
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
                component: () => import('@/views/common/CompanyList.vue'),
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

    // --- Common Routes ---
    {
      path: '/404',
      name: 'not-found',
      component: () => import('@/views/common/NotFound.vue'),
      meta: { title: '页面未找到' },
    },
    {
      path: '/401',
      name: 'unauthorized',
      component: () => import('@/views/common/Unauthorized.vue'),
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

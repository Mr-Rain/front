import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import JobCard from '../common/JobCard.vue'

// 创建模拟路由
const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/jobs/:id',
      name: 'job-detail',
      component: {} as any,
      redirect: ''
    }
  ]
})

// 模拟路由push方法
const mockRouterPush = vi.fn()

// 模拟vue-router
vi.mock('vue-router', () => ({
  useRouter: vi.fn(() => ({
    push: mockRouterPush
  })),
  createRouter: vi.fn(() => router),
  createWebHistory: vi.fn()
}))

describe('JobCard', () => {
  it('renders job information correctly', () => {
    const job = {
      id: 1,
      title: '前端开发工程师',
      salary_range: '15k-25k',
      location: '北京',
      experience_required: '3-5年',
      education_required: '本科及以上',
      tags: ['Vue', 'React', 'TypeScript'],
      company_name: '测试公司',
      company_logo: ''
    }

    const wrapper = mount(JobCard, {
      props: {
        job
      },
      global: {
        plugins: [router],
        stubs: {
          'el-tag': true,
          'el-icon': true,
          'el-divider': true
        }
      }
    })

    // 验证职位信息是否正确渲染
    expect(wrapper.find('.title').text()).toBe('前端开发工程师')
    expect(wrapper.find('.salary').text()).toBe('15k-25k')
    expect(wrapper.find('.details').text()).toContain('北京')
    expect(wrapper.find('.details').text()).toContain('3-5年')
    expect(wrapper.find('.details').text()).toContain('本科及以上')
    expect(wrapper.find('.company-name').text()).toBe('测试公司')
  })

  it('navigates to job detail page when clicked', async () => {
    const job = {
      id: 1,
      title: '前端开发工程师',
      salary_range: '15k-25k',
      location: '北京',
      experience_required: '3-5年',
      education_required: '本科及以上',
      company_name: '测试公司',
      company_logo: '',
      job_type: '全职',
      status: 'open',
      description: '职位描述',
      requirements: '职位要求',
      company_id: 'company1'
    }

    const wrapper = mount(JobCard, {
      props: {
        job
      },
      global: {
        stubs: {
          'el-avatar': true,
          'el-tag': true,
          'el-icon': true,
          'el-divider': true
        }
      }
    })

    // 点击卡片
    await wrapper.find('.job-card').trigger('click')

    // 验证路由跳转
    expect(mockRouterPush).toHaveBeenCalledWith('/jobs/1')
  })
})

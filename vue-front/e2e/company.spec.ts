import { test, expect } from '@playwright/test';

test.describe('企业端关键流程测试', () => {
  // 在每个测试前登录
  test.beforeEach(async ({ page }) => {
    // 模拟登录状态
    await page.goto('/');
    
    // 设置 localStorage 模拟已登录状态
    await page.evaluate(() => {
      localStorage.setItem('token', 'fake-token');
      localStorage.setItem('user', JSON.stringify({
        id: '2',
        username: 'companyuser',
        user_type: 'company'
      }));
    });
    
    // 拦截用户信息请求
    await page.route('**/api/user/info', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            id: '2',
            username: 'companyuser',
            user_type: 'company',
            avatar: '',
            email: 'company@example.com',
            company_name: '测试企业'
          }
        })
      });
    });
    
    // 刷新页面应用登录状态
    await page.reload();
  });

  test('企业仪表板加载正确', async ({ page }) => {
    await page.goto('/company/dashboard');
    await expect(page.locator('.dashboard-title')).toBeVisible();
    await expect(page.locator('.dashboard-content')).toBeVisible();
  });

  test('查看职位管理列表', async ({ page }) => {
    // 拦截职位列表请求
    await page.route('**/api/company/jobs**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            list: [
              {
                id: 'job1',
                title: '测试职位1',
                location: '北京',
                salary_range: '15k-20k',
                status: 'open',
                applications_count: 5
              },
              {
                id: 'job2',
                title: '测试职位2',
                location: '上海',
                salary_range: '20k-30k',
                status: 'open',
                applications_count: 3
              }
            ],
            total: 2
          }
        })
      });
    });
    
    await page.goto('/company/jobs');
    
    // 验证职位列表显示
    await expect(page.locator('.job-list')).toBeVisible();
    await expect(page.locator('.job-item')).toHaveCount(2);
  });

  test('发布新职位流程', async ({ page }) => {
    // 拦截创建职位请求
    await page.route('**/api/company/jobs', async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: {
              id: 'new-job',
              title: '新测试职位',
              status: 'open'
            }
          })
        });
      }
    });
    
    await page.goto('/company/jobs/create');
    
    // 填写职位表单
    await page.fill('input[name="title"]', '新测试职位');
    await page.fill('input[name="location"]', '北京');
    await page.fill('input[name="salary_range"]', '15k-25k');
    await page.selectOption('select[name="job_type"]', '全职');
    await page.fill('textarea[name="description"]', '这是一个测试职位描述');
    await page.fill('textarea[name="requirements"]', '要求：1. 熟悉前端开发');
    
    // 提交表单
    await page.locator('button[type="submit"]').click();
    
    // 验证成功消息
    await expect(page.locator('.success-message')).toBeVisible();
    
    // 应该重定向到职位列表
    await expect(page).toHaveURL(/\/company\/jobs/);
  });

  test('管理申请流程', async ({ page }) => {
    // 拦截申请列表请求
    await page.route('**/api/company/applications**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            list: [
              {
                id: 'app1',
                job_id: 'job1',
                job_title: '测试职位1',
                student_id: 'student1',
                student_name: '测试学生',
                resume_id: 'resume1',
                status: 'pending',
                apply_time: '2023-01-01T00:00:00Z'
              }
            ],
            total: 1
          }
        })
      });
    });
    
    // 拦截更新申请状态请求
    await page.route('**/api/company/applications/app1/status', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            success: true
          }
        })
      });
    });
    
    await page.goto('/company/applications');
    
    // 验证申请列表显示
    await expect(page.locator('.application-list')).toBeVisible();
    await expect(page.locator('.application-item')).toHaveCount(1);
    
    // 点击处理申请按钮
    await page.locator('.process-button').first().click();
    
    // 选择通过
    await page.locator('.approve-button').click();
    
    // 验证成功消息
    await expect(page.locator('.success-message')).toBeVisible();
  });
});

import { test, expect } from '@playwright/test';

test.describe('管理员端关键流程测试', () => {
  // 在每个测试前登录
  test.beforeEach(async ({ page }) => {
    // 模拟登录状态
    await page.goto('/');
    
    // 设置 localStorage 模拟已登录状态
    await page.evaluate(() => {
      localStorage.setItem('token', 'fake-token');
      localStorage.setItem('user', JSON.stringify({
        id: '3',
        username: 'adminuser',
        user_type: 'admin'
      }));
    });
    
    // 拦截用户信息请求
    await page.route('**/api/user/info', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            id: '3',
            username: 'adminuser',
            user_type: 'admin',
            avatar: '',
            email: 'admin@example.com'
          }
        })
      });
    });
    
    // 刷新页面应用登录状态
    await page.reload();
  });

  test('管理员仪表板加载正确', async ({ page }) => {
    await page.goto('/admin/dashboard');
    await expect(page.locator('.dashboard-title')).toBeVisible();
    await expect(page.locator('.dashboard-content')).toBeVisible();
  });

  test('用户管理功能', async ({ page }) => {
    // 拦截用户列表请求
    await page.route('**/api/admin/users**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            list: [
              {
                id: 'user1',
                username: '测试用户1',
                user_type: 'student',
                email: 'student1@example.com',
                status: 'active'
              },
              {
                id: 'user2',
                username: '测试用户2',
                user_type: 'company',
                email: 'company1@example.com',
                status: 'active'
              }
            ],
            total: 2
          }
        })
      });
    });
    
    await page.goto('/admin/users');
    
    // 验证用户列表显示
    await expect(page.locator('.user-list')).toBeVisible();
    await expect(page.locator('.user-item')).toHaveCount(2);
  });

  test('禁用用户功能', async ({ page }) => {
    // 拦截用户列表请求
    await page.route('**/api/admin/users**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            list: [
              {
                id: 'user1',
                username: '测试用户1',
                user_type: 'student',
                email: 'student1@example.com',
                status: 'active'
              }
            ],
            total: 1
          }
        })
      });
    });
    
    // 拦截更新用户状态请求
    await page.route('**/api/admin/users/user1/status', async (route) => {
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
    
    await page.goto('/admin/users');
    
    // 点击禁用用户按钮
    await page.locator('.disable-user-button').first().click();
    
    // 确认禁用
    await page.locator('.confirm-button').click();
    
    // 验证成功消息
    await expect(page.locator('.success-message')).toBeVisible();
  });

  test('企业审核功能', async ({ page }) => {
    // 拦截企业列表请求
    await page.route('**/api/admin/companies**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            list: [
              {
                id: 'company1',
                company_name: '测试企业1',
                industry: '互联网',
                scale: '100-499人',
                audit_status: 'pending'
              }
            ],
            total: 1
          }
        })
      });
    });
    
    // 拦截审核请求
    await page.route('**/api/admin/companies/company1/audit', async (route) => {
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
    
    await page.goto('/admin/companies');
    
    // 验证企业列表显示
    await expect(page.locator('.company-list')).toBeVisible();
    await expect(page.locator('.company-item')).toHaveCount(1);
    
    // 点击审核按钮
    await page.locator('.audit-button').first().click();
    
    // 选择通过
    await page.locator('.approve-button').click();
    
    // 验证成功消息
    await expect(page.locator('.success-message')).toBeVisible();
  });
});

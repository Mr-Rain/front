import { test, expect } from '@playwright/test';

// 模拟登录函数
async function login(page) {
  await page.goto('/login');
  await page.fill('input[placeholder="用户名/邮箱"]', 'student');
  await page.fill('input[placeholder="密码"]', 'password');
  await page.click('button:has-text("登录")');
  await page.waitForURL('**/student/dashboard');
}

// 学生仪表盘测试
test('学生仪表盘应该正确渲染', async ({ page }) => {
  // 先登录
  await login(page);
  
  // 验证仪表盘页面元素
  await expect(page.locator('.student-dashboard')).toBeVisible();
  await expect(page.locator('.profile-summary')).toBeVisible();
  await expect(page.locator('.recommended-jobs')).toBeVisible();
});

// 学生个人信息页面测试
test('学生个人信息页面应该正确渲染', async ({ page }) => {
  // 先登录
  await login(page);
  
  // 导航到个人信息页面
  await page.click('text=个人信息');
  await page.waitForURL('**/student/profile');
  
  // 验证个人信息页面元素
  await expect(page.locator('form')).toBeVisible();
  await expect(page.locator('button:has-text("编辑")')).toBeVisible();
});

// 职位列表页面测试
test('职位列表页面应该正确渲染', async ({ page }) => {
  // 先登录
  await login(page);
  
  // 导航到职位列表页面
  await page.click('text=浏览职位');
  await page.waitForURL('**/student/jobs');
  
  // 验证职位列表页面元素
  await expect(page.locator('.job-list-page')).toBeVisible();
  await expect(page.locator('.job-card')).toBeVisible();
});

import { test, expect } from '@playwright/test';

// 登录页面测试
test('登录页面应该正确渲染', async ({ page }) => {
  // 导航到登录页面
  await page.goto('/login');
  
  // 验证页面标题
  await expect(page.locator('h2')).toContainText('登录');
  
  // 验证表单元素存在
  await expect(page.locator('input[placeholder="用户名/邮箱"]')).toBeVisible();
  await expect(page.locator('input[placeholder="密码"]')).toBeVisible();
  await expect(page.locator('button:has-text("登录")')).toBeVisible();
});

// 注册页面测试
test('注册页面应该正确渲染', async ({ page }) => {
  // 导航到注册页面
  await page.goto('/register');
  
  // 验证页面标题
  await expect(page.locator('h2')).toContainText('注册');
  
  // 验证表单元素存在
  await expect(page.locator('input[placeholder="用户名"]')).toBeVisible();
  await expect(page.locator('input[placeholder="邮箱"]')).toBeVisible();
  await expect(page.locator('input[placeholder="密码"]')).toBeVisible();
  await expect(page.locator('input[placeholder="确认密码"]')).toBeVisible();
  await expect(page.locator('button:has-text("注册")')).toBeVisible();
});

// 登录流程测试
test('用户应该能够登录并重定向到对应首页', async ({ page }) => {
  // 导航到登录页面
  await page.goto('/login');
  
  // 填写登录表单
  await page.fill('input[placeholder="用户名/邮箱"]', 'student');
  await page.fill('input[placeholder="密码"]', 'password');
  
  // 点击登录按钮
  await page.click('button:has-text("登录")');
  
  // 等待重定向完成
  await page.waitForURL('**/student/dashboard');
  
  // 验证是否成功登录并重定向到学生仪表盘
  await expect(page.url()).toContain('/student/dashboard');
});

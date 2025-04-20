import { test, expect } from '@playwright/test';

// 首页测试
test('首页应该正确渲染', async ({ page }) => {
  // 导航到首页
  await page.goto('/');
  
  // 验证页面标题和内容
  await expect(page.locator('.hero-title')).toBeVisible();
  await expect(page.locator('.hero-subtitle')).toBeVisible();
  
  // 验证导航按钮存在
  await expect(page.locator('button:has-text("立即登录")')).toBeVisible();
  await expect(page.locator('button:has-text("注册账号")')).toBeVisible();
});

// 导航测试
test('首页导航按钮应该正确跳转', async ({ page }) => {
  // 导航到首页
  await page.goto('/');
  
  // 点击登录按钮
  await page.click('button:has-text("立即登录")');
  
  // 验证是否跳转到登录页面
  await expect(page.url()).toContain('/login');
  
  // 返回首页
  await page.goto('/');
  
  // 点击注册按钮
  await page.click('button:has-text("注册账号")');
  
  // 验证是否跳转到注册页面
  await expect(page.url()).toContain('/register');
});

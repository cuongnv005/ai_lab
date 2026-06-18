import { test, expect } from '@playwright/test';
import { AdminDashboardPage } from '../../pages/admin-dashboard.page';

test.describe('Admin Dashboard — E2E Flow', () => {
  let adminPage: AdminDashboardPage;

  test.beforeEach(async ({ page }) => {
    adminPage = new AdminDashboardPage(page);
  });

  test.afterEach(async ({ page }) => {
    // Clean up route intercepts between tests
    await page.unrouteAll();
  });

  // ─── Happy Path ───────────────────────────────────

  test('PW-01: Admin đăng nhập — hiển thị Dashboard đúng URL', async ({ page }) => {
    await adminPage.gotoAsAdmin();
    await expect(page).toHaveURL('/admin/dashboard');
    await expect(adminPage.pageTitle).toBeVisible();
    await expect(adminPage.statTotalUsers).toBeVisible();
    await expect(adminPage.statTotalPosts).toBeVisible();
    await expect(adminPage.statPendingApproval).toBeVisible();
  });

  // ─── Page Navigation (direct goto) ───────────────────────────────────

  test('PW-02: Trang Approval Queue — render đúng content', async ({ page }) => {
    await adminPage.gotoAsAdmin();
    await page.goto('/admin/approval-queue');
    await expect(page).toHaveURL('/admin/approval-queue');
    await expect(page.locator('h1:has-text("Duyệt bài viết")')).toBeVisible();
  });

  test('PW-03: Trang Reports — render đúng content', async ({ page }) => {
    await adminPage.gotoAsAdmin();
    await page.goto('/admin/reports');
    await expect(page).toHaveURL('/admin/reports');
    await expect(page.locator('h1:has-text("Báo cáo vi phạm")')).toBeVisible();
  });

  test('PW-04: Trang Users — render đúng content', async ({ page }) => {
    await adminPage.gotoAsAdmin();
    await page.goto('/admin/users');
    await expect(page).toHaveURL('/admin/users');
    await expect(page.locator('h1:has-text("Thành viên")')).toBeVisible();
  });

  test('PW-05: Trang Posts — render đúng content', async ({ page }) => {
    await adminPage.gotoAsAdmin();
    await page.goto('/admin/posts');
    await expect(page).toHaveURL('/admin/posts');
    await expect(page.locator('h1:has-text("Bài viết")')).toBeVisible();
  });


  test('PW-07: Trang Categories — render đúng content', async ({ page }) => {
    await adminPage.gotoAsAdmin();
    await page.goto('/admin/categories');
    await expect(page).toHaveURL('/admin/categories');
    await expect(page.locator('h1:has-text("Danh mục")')).toBeVisible();
  });

  // ─── Auth Guard ───────────────────────────────────

  test('PW-08: Chưa login — trang admin → hiển thị màn hình Access Denied', async () => {
    await adminPage.gotoUnauthenticated();
    await expect(adminPage.page.locator('text=Access Denied')).toBeVisible();
    await expect(adminPage.page.locator('text=Back to Home')).toBeVisible();
  });

  test('PW-09: User không phải admin → hiển thị màn hình Access Denied', async () => {
    await adminPage.gotoAsMember();
    await expect(adminPage.page.locator('text=Access Denied')).toBeVisible();
    await expect(adminPage.page.locator('text=Back to Home')).toBeVisible();
  });

  // ─── UX Flow ─────────────────────────────────────

  test('PW-10: Back to site link — redirect về trang chủ', async ({ page }) => {
    await adminPage.gotoAsAdmin();
    await adminPage.backToSiteLink.click();
    await expect(page).toHaveURL('/');
  });

  test('PW-11: API 500 admin stats → Dashboard vẫn hiển thị (fallback)', async ({ page }) => {
    // Override the default good intercept with a 500
    await page.route('**/api/admin/dashboard/stats', (route) =>
      route.fulfill({
        status: 500,
        body: JSON.stringify({ message: 'Internal Server Error' }),
      })
    );
    await adminPage.gotoAsAdmin();
    await expect(page).toHaveURL('/admin/dashboard');
    // Page should still render even if stats API fails
    await expect(adminPage.pageTitle).toBeVisible();
  });

  test('PW-12: Mobile viewport — sidebar toggle hoạt động', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await adminPage.gotoAsAdmin();

    // Mobile: sidebar toggle button should be visible
    await expect(adminPage.sidebarToggle).toBeVisible();

    // Click toggle → mobile sidebar overlay opens
    await adminPage.sidebarToggle.click();

    // After opening, at least one nav item should be visible in the viewport
    await expect(adminPage.navDashboard.first()).toBeVisible();

    // Click Dashboard nav → sidebar closes, stay on dashboard
    await adminPage.navDashboard.first().click();
    await expect(page).toHaveURL('/admin/dashboard');
  });
});

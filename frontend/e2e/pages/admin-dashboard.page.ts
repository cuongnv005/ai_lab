import { type Locator, type Page } from '@playwright/test';

/**
 * Page Object cho Admin Dashboard.
 * Bao gồm: sidebar nav, stat cards, period/chart toggles, tables.
 */
export class AdminDashboardPage {
  readonly page: Page;

  // ── Sidebar ──
  readonly sidebarToggle: Locator;
  readonly navDashboard: Locator;
  readonly navApproval: Locator;
  readonly navReports: Locator;
  readonly navUsers: Locator;
  readonly navPosts: Locator;
  readonly navCategories: Locator;

  // ── Header ──
  readonly backToSiteLink: Locator;

  // ── Stat cards ──
  readonly statTotalUsers: Locator;
  readonly statTotalPosts: Locator;
  readonly statPendingApproval: Locator;

  // ── Chart ──
  readonly chartTypePosts: Locator;
  readonly chartTypeUsers: Locator;

  // ── Period buttons ──
  readonly periodToday: Locator;
  readonly period30Days: Locator;

  // ── Page titles ──
  readonly pageTitle: Locator;

  constructor(page: Page) {
    this.page = page;

    // Sidebar
    this.sidebarToggle = page.locator('[data-testid="admin-sidebar-toggle"]');
    this.navDashboard = page.locator('[data-testid="admin-nav-dashboard"]');
    this.navApproval = page.locator('[data-testid="admin-nav-approval"]');
    this.navReports = page.locator('[data-testid="admin-nav-reports"]');
    this.navUsers = page.locator('[data-testid="admin-nav-users"]');
    this.navPosts = page.locator('[data-testid="admin-nav-posts"]');
    this.navCategories = page.locator('[data-testid="admin-nav-categories"]');

    // Header
    this.backToSiteLink = page.locator('[data-testid="admin-back-to-site"]');

    // Stats (text-based selectors — safe because card labels are static)
    this.statTotalUsers = page.locator('text=Tổng thành viên');
    this.statTotalPosts = page.locator('text=Tổng bài viết');
    this.statPendingApproval = page.locator('text=Chờ phê duyệt');

    // Chart toggles
    this.chartTypePosts = page.locator('button:has-text("bài viết")');
    this.chartTypeUsers = page.locator('button:has-text("thành viên")');

    // Period buttons
    this.periodToday = page.locator('button:has-text("Hôm nay")');
    this.period30Days = page.locator('button:has-text("30 ngày")');

    // Page title
    this.pageTitle = page.locator('h1:has-text("Tổng quan hệ thống")');
  }

  /**
   * Navigate to /admin/dashboard with mocked admin auth state.
   * Intercepts /api/auth/me to return an admin user.
   */
  async gotoAsAdmin() {
    await this.page.route('**/api/auth/me', (route) =>
      route.fulfill({
        status: 200,
        body: JSON.stringify({
          success: true,
          data: {
            id: 1,
            name: 'Admin Test',
            email: 'admin@example.com',
            roles: ['admin'],
            permissions: [],
          },
        }),
      })
    );

    // Also intercept all admin API endpoints with empty but valid data shapes
    await this.page.route('**/api/admin/**', (route) => {
      const url = route.request().url()
      if (url.includes('/api/admin/categories')) {
        return route.fulfill({ status: 200, body: JSON.stringify({ success: true, data: [] }) })
      }
      if (url.includes('/api/admin/dashboard/')) {
        return route.fulfill({ status: 200, body: JSON.stringify({ success: true, data: [] }) })
      }
      // Default fallback for paginated lists (posts, reports, users, comments, pending posts)
      return route.fulfill({
        status: 200,
        body: JSON.stringify({
          success: true,
          data: {
            data: [],
            current_page: 1,
            last_page: 1,
            total: 0,
          },
        }),
      })
    })

    await this.page.goto('/admin/dashboard');
  }

  /**
   * Navigate to /admin/dashboard with mocked non-admin user.
   */
  async gotoAsMember() {
    await this.page.route('**/api/auth/me', (route) =>
      route.fulfill({
        status: 200,
        body: JSON.stringify({
          success: true,
          data: {
            id: 2,
            name: 'Member Test',
            email: 'member@example.com',
            roles: ['member'],
            permissions: [],
          },
        }),
      })
    );

    await this.page.goto('/admin/dashboard');
  }

  /**
   * Navigate without any auth (unauthenticated).
   */
  async gotoUnauthenticated() {
    await this.page.route('**/api/auth/me', (route) =>
      route.fulfill({ status: 401, body: JSON.stringify({ message: 'Unauthenticated' }) })
    );
    await this.page.goto('/admin/dashboard');
  }
}

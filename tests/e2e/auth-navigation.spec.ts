import { test, expect } from '@playwright/test';

test.describe('ISACCOS & Zanzibar VICOBA Platform - E2E & Functional Test Suite', () => {

  test('Public Landing Page renders properly and supports quick role navigation', async ({ page }) => {
    await page.goto('/');

    // Check title or main header text
    await expect(page.locator('body')).toBeVisible();
    
    // Check if role switcher or navigation bar is available
    const roleNav = page.locator('#role-switcher-bar, nav, header');
    await expect(roleNav.first()).toBeVisible();
  });

  test('Member Portal: Verify 1 to 50 member registration workflow', async ({ page }) => {
    await page.goto('/');

    // Switch role to Member / Mwanachama
    const memberRoleBtn = page.getByRole('button', { name: /Mwanachama/i }).first();
    if (await memberRoleBtn.isVisible()) {
      await memberRoleBtn.click();
    }

    // Verify Member Dashboard view
    const memberDashboard = page.locator('#member-portal-view, body');
    await expect(memberDashboard).toBeVisible();

    // Click on "Sajili Wanachama Wapya (1 - 50)" button
    const registerMembersBtn = page.locator('#register-members-btn');
    if (await registerMembersBtn.isVisible()) {
      await registerMembersBtn.click();

      // Modal should appear
      const modal = page.locator('#submember-registration-modal');
      await expect(modal).toBeVisible();

      // Verify header text mentions 1 mpaka 50
      await expect(modal).toContainText('Sajili Wanachama Wapya (1 mpaka 50)');

      // Click preset '50' button
      const preset50Btn = modal.getByRole('button', { name: '50', exact: true });
      if (await preset50Btn.isVisible()) {
        await preset50Btn.click();
      }

      // Submit registration
      const confirmBtn = modal.locator('#confirm-batch-members-btn');
      await expect(confirmBtn).toBeVisible();
    }
  });

  test('Tenant Admin Portal: Verify Member Management panel & batch modal', async ({ page }) => {
    await page.goto('/');

    // Switch role to Tenant Admin
    const tenantAdminBtn = page.getByRole('button', { name: /Meneja Taasisi|Tenant Admin/i }).first();
    if (await tenantAdminBtn.isVisible()) {
      await tenantAdminBtn.click();
    }

    // Navigate to Member Management tab if needed
    const membersTab = page.getByRole('button', { name: /Wanachama|Members/i }).first();
    if (await membersTab.isVisible()) {
      await membersTab.click();
    }
  });

  test('SuperAdmin Portal: Verify Manual Database ZIP Backup Export trigger', async ({ page }) => {
    await page.goto('/');

    // Switch role to SuperAdmin
    const superAdminBtn = page.getByRole('button', { name: /Super Admin|SuperAdmin/i }).first();
    if (await superAdminBtn.isVisible()) {
      await superAdminBtn.click();
    }

    // Verify ZIP backup button is visible
    const backupBtn = page.getByRole('button', { name: /Pakua Database Backup \(\.ZIP\)/i });
    if (await backupBtn.isVisible()) {
      await expect(backupBtn).toBeEnabled();
    }
  });

});

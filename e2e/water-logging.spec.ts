import { test, expect } from '@playwright/test';

test.describe('Water Logging Flow', () => {
  test('should log water intake successfully', async ({ page }) => {
    // Navigate to dashboard
    await page.goto('/');
    
    // Click quick water action
    await page.click('[data-testid="quick-water"]');
    
    // Should be on water logging page
    await expect(page).toHaveURL('/log/water');
    await expect(page.locator('[data-testid="log-water-page"]')).toBeVisible();
    
    // Click 250ml preset
    await page.click('[data-testid="water-preset-250"]');
    
    // Should show success toast
    await expect(page.locator('[data-testid="water-toast"]')).toBeVisible();
    await expect(page.locator('[data-testid="water-toast"]')).toContainText('Đã ghi 250ml nước');
    
    // Should redirect back to dashboard
    await expect(page).toHaveURL('/');
  });
});
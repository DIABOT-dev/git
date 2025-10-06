import { test, expect } from '@playwright/test';

test.describe('Blood Glucose Logging Flow', () => {
  test('should log BG fasting value successfully', async ({ page }) => {
    // Navigate to dashboard
    await page.goto('/');
    
    // Click quick BG action
    await page.click('[data-testid="quick-bg"]');
    
    // Should be on BG logging page
    await expect(page).toHaveURL('/log/bg');
    await expect(page.locator('[data-testid="log-bg-page"]')).toBeVisible();
    
    // Enter BG value
    await page.fill('[data-testid="bg-value-input"]', '120');
    
    // Select fasting context (should be default)
    await expect(page.locator('[data-testid="context-fasting"]')).toHaveClass(/btn-primary/);
    
    // Submit form
    await page.click('[data-testid="submit-bg"]');
    
    // Should show success toast
    await expect(page.locator('[data-testid="bg-toast"]')).toBeVisible();
    await expect(page.locator('[data-testid="bg-toast"]')).toContainText('Đã ghi đường huyết 120 mg/dL');
    
    // Should redirect back to dashboard
    await expect(page).toHaveURL('/');
  });
});
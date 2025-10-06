import { test, expect } from '@playwright/test';

test.describe('AI Agent Demo', () => {
  test('should respond to blood glucose question', async ({ page }) => {
    // Navigate to dashboard
    await page.goto('/');
    
    // AI Agent should be visible (if enabled)
    const aiAgent = page.locator('[data-testid="ai-agent"]');
    if (await aiAgent.isVisible()) {
      // Type question about blood glucose
      await page.fill('[data-testid="chat-input"]', 'đường huyết');
      
      // Send message
      await page.click('[data-testid="send-message"]');
      
      // Should show user message
      await expect(page.locator('[data-testid="message-user"]').last()).toContainText('đường huyết');
      
      // Should show bot response
      await expect(page.locator('[data-testid="message-bot"]').last()).toContainText('119 mg/dL');
    }
  });
});
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['list'],
    ['html', { open: 'never', outputFolder: 'test-results/html' }],
  ],
  use: {
    baseURL: 'http://localhost:4322',
    screenshot: 'on',
    trace: 'on-first-retry',
  },
  outputFolder: 'test-results',
  webServer: {
    command: 'npm run build && python3 -m http.server 4322 --directory dist',
    port: 4322,
    timeout: 120000,
    reuseExistingServer: !process.env.CI,
  },
  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium' },
    },
  ],
});

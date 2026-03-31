import { defineConfig, devices } from '@playwright/test';
import { existsSync } from 'fs';
import path from 'path';

const globalSetupPath = path.resolve(__dirname, '../tests/global.setup.ts');

export default defineConfig({
  testDir: '../tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure'
  },
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
    cwd: '.'
  },
  ...(existsSync(globalSetupPath) && { globalSetup: require.resolve('../tests/global.setup.ts') }),
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    }
  ]
});

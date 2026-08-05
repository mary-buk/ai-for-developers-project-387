import { defineConfig } from '@playwright/test';

// Runs the REAL apps, no mocks: backend (Express, :3000) and frontend
// (Vite dev server, :5173, which proxies API calls to the backend).
// Commands are the `npm run dev` scripts from the respective package.json files.
export default defineConfig({
  testDir: './tests',
  // The backend stores data in memory and all tests share that state,
  // so run serially in a single worker.
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['html']] : [['list'], ['html']],
  use: {
    baseURL: 'http://localhost:5173',
  },
  webServer: [
    {
      command: 'npm run dev',
      cwd: '../backend',
      url: 'http://localhost:3000/event-types',
      reuseExistingServer: !process.env.CI,
      timeout: 60_000,
    },
    {
      command: 'npm run dev',
      cwd: '../frontend',
      url: 'http://localhost:5173',
      reuseExistingServer: !process.env.CI,
      timeout: 60_000,
    },
  ],
});

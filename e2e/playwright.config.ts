import { defineConfig } from '@playwright/test';

// Runs the REAL apps, no mocks: backend (Express) and frontend (Vite dev
// server, which proxies API calls to the backend). Commands are the `npm run
// dev` scripts from the respective package.json files.
//
// Tests use DEDICATED ports (backend 3001, frontend 5174) and never reuse
// running servers: reusing could pick up a stale in-memory backend or, worse,
// a dev server from another project squatting on the default port. Fresh
// processes also guarantee an empty backend for 00-empty-state.spec.ts.
export default defineConfig({
  testDir: './tests',
  // The backend stores data in memory and all tests share that state,
  // so run serially in a single worker.
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['html']] : [['list'], ['html']],
  use: {
    baseURL: 'http://localhost:5174',
  },
  webServer: [
    {
      command: 'npm run dev',
      cwd: '../backend',
      url: 'http://localhost:3001/event-types',
      reuseExistingServer: false,
      timeout: 60_000,
      env: { PORT: '3001' },
    },
    {
      command: 'npm run dev -- --port 5174 --strictPort',
      cwd: '../frontend',
      url: 'http://localhost:5174',
      reuseExistingServer: false,
      timeout: 60_000,
      env: { VITE_API_PROXY_TARGET: 'http://localhost:3001' },
    },
  ],
});

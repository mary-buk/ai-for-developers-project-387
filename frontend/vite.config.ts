import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// In dev, the Vite server proxies API calls to the backend; in production the
// frontend expects the API on the same origin, or set VITE_API_URL
// (see .env.example).
//
// Proxy keys are regexes (leading ^) so ONLY contract API paths are proxied.
// A plain '/event-types' prefix would also swallow the SPA page route
// /event-types/:id and break direct loads/refreshes of the booking page.
//
// VITE_API_PROXY_TARGET overrides the backend target (used by e2e tests so the
// test frontend talks to the test backend on its own port).
const proxyTarget = process.env.VITE_API_PROXY_TARGET ?? 'http://localhost:3000';
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // GET/POST /event-types (list + create, no subpaths)
      '^/event-types$': proxyTarget,
      // GET /event-types/:id/slots?date=...
      '^/event-types/[^/]+/slots': proxyTarget,
      // GET/POST /bookings
      '^/bookings': proxyTarget,
    },
  },
});

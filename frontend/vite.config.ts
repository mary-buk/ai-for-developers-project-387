import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// In dev, the Vite server proxies API calls to the backend; in production the
// frontend expects the API on the same origin, or set VITE_API_URL
// (see .env.example).
//
// Proxy keys are regexes (leading ^) so ONLY contract API paths are proxied.
// A plain '/event-types' prefix would also swallow the SPA page route
// /event-types/:id and break direct loads/refreshes of the booking page.
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // GET/POST /event-types (list + create, no subpaths)
      '^/event-types$': 'http://localhost:3000',
      // GET /event-types/:id/slots?date=...
      '^/event-types/[^/]+/slots': 'http://localhost:3000',
      // GET/POST /bookings
      '^/bookings': 'http://localhost:3000',
    },
  },
});

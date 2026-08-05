import { createApp } from './app.js';
import {
  InMemoryBookingRepository,
  InMemoryEventTypeRepository,
} from './storage/memory.js';

const app = createApp({
  eventTypes: new InMemoryEventTypeRepository(),
  bookings: new InMemoryBookingRepository(),
});

// Port 3000 matches the frontend dev proxy (frontend/vite.config.ts).
const port = Number(process.env.PORT ?? 3000);
app.listen(port, () => {
  console.log(`Calendar booking API listening on http://localhost:${port}`);
});

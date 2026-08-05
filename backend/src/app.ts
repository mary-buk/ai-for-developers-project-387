import cors from 'cors';
import express from 'express';
import type { Express, NextFunction, Request, Response } from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { HttpError } from './errors.js';
import { bookingsRouter } from './routes/bookings.js';
import { eventTypesRouter } from './routes/eventTypes.js';
import { slotsRouter } from './routes/slots.js';
import type { BookingRepository, EventTypeRepository } from './storage/repository.js';
import type { ErrorBody } from './types.js';

export interface Repositories {
  eventTypes: EventTypeRepository;
  bookings: BookingRepository;
}

const currentDir = path.dirname(fileURLToPath(import.meta.url));

// In production (Docker image) the built frontend sits next to dist/ at
// /app/public. STATIC_DIR overrides it. In dev (tsx watch + Vite dev server)
// the directory does not exist and static serving is skipped entirely.
const staticDir = process.env.STATIC_DIR ?? path.join(currentDir, '../public');

// GET paths that belong to the contract API even when no route matched them
// (they must get the JSON 404, not index.html). Note that /event-types/:id is
// a SPA PAGE route, not an API path — only the /slots subpath is API.
function isApiPath(p: string): boolean {
  return /^\/bookings(\/|$)/.test(p) || /^\/event-types\/[^/]+\/slots/.test(p);
}

function errorBody(code: string, message: string): ErrorBody {
  return { code, message };
}

export function createApp(repos: Repositories): Express {
  const app = express();

  app.use(express.json());
  app.use(cors());

  app.use(eventTypesRouter(repos.eventTypes));
  app.use(slotsRouter(repos.eventTypes, repos.bookings));
  app.use(bookingsRouter(repos.eventTypes, repos.bookings));

  if (fs.existsSync(staticDir)) {
    app.use(express.static(staticDir));
    // SPA fallback: page routes (/, /admin, /event-types/:id) get index.html.
    // Only GET requests reach this; API routers had their chance above.
    app.get('*', (req, res, next) => {
      if (isApiPath(req.path)) {
        next();
        return;
      }
      res.sendFile(path.join(staticDir, 'index.html'));
    });
  }

  app.use((_req, res) => {
    res.status(404).json(errorBody('not_found', 'Route not found'));
  });

  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    if (err instanceof HttpError) {
      res.status(err.status).json(errorBody(err.code, err.message));
      return;
    }
    if (err instanceof SyntaxError) {
      // Malformed JSON body from express.json().
      res.status(400).json(errorBody('bad_request', 'Malformed JSON body'));
      return;
    }
    res.status(500).json(errorBody('internal_error', 'Internal server error'));
  });

  return app;
}

import { Router } from 'express';
import { badRequest } from '../errors.js';
import type { EventTypeRepository } from '../storage/repository.js';
import type { EventTypeCreate } from '../types.js';

// Validation mirrors EventTypeCreate from tsp/models.tsp.
function parseEventTypeCreate(body: unknown): EventTypeCreate {
  if (typeof body !== 'object' || body === null) {
    throw badRequest('Body must be a JSON object');
  }
  const { title, description, durationMinutes } = body as Record<string, unknown>;

  if (typeof title !== 'string' || title.trim() === '') {
    throw badRequest('title must be a non-empty string');
  }
  if (typeof description !== 'string') {
    throw badRequest('description must be a string');
  }
  if (
    typeof durationMinutes !== 'number' ||
    !Number.isInteger(durationMinutes) ||
    durationMinutes < 1
  ) {
    throw badRequest('durationMinutes must be an integer >= 1');
  }

  return { title: title.trim(), description, durationMinutes };
}

export function eventTypesRouter(repo: EventTypeRepository): Router {
  const router = Router();

  // Shared read: guest catalog and owner admin list (per the spec).
  router.get('/event-types', (_req, res) => {
    res.json(repo.list());
  });

  router.post('/event-types', (req, res, next) => {
    try {
      const created = repo.add(parseEventTypeCreate(req.body));
      res.status(201).json(created);
    } catch (err) {
      next(err);
    }
  });

  return router;
}

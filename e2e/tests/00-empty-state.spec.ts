import { expect, test } from '@playwright/test';

// These tests assume a FRESH backend: the in-memory storage must be empty.
// Playwright always boots a fresh backend on the test port, so that holds.
test('home page shows the empty state when there are no event types', async ({ page }) => {
  await page.goto('/');
  await expect(
    page.getByRole('heading', { name: 'Записаться на встречу' }),
  ).toBeVisible();
  await expect(page.getByText('Пока нет доступных видов брони.')).toBeVisible();
});

test('an unknown event type page shows a not-found message', async ({ page }) => {
  await page.goto('/event-types/does-not-exist');
  await expect(page.getByText('Тип события не найден.')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Вернуться к списку' })).toBeVisible();
});

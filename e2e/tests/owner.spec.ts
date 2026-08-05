import { expect, test } from '@playwright/test';
import { fetchSlots, seedBooking, seedEventType, tomorrowISODate } from './helpers';

test('owner creates an event type through the admin form and is redirected home', async ({ page }) => {
  const title = `Админский тип ${Math.random().toString(36).slice(2, 8)}`;

  await page.goto('/admin');
  await page.getByLabel('Название').fill(title);
  await page.getByLabel('Описание').fill('Создано владельцем через форму');
  await page.getByLabel('Длительность (мин)').fill('45');
  await page.getByRole('button', { name: 'Создать тип события' }).click();

  await expect(page).toHaveURL('/');
  const card = page.locator('.card', { hasText: title });
  await expect(card).toBeVisible();
  await expect(card).toContainText('Создано владельцем через форму');
  await expect(card).toContainText('Длительность: 45 мин');
});

test('owner sees upcoming bookings of all event types in one list', async ({ page }) => {
  const typeA = await seedEventType('Встреча А', 60);
  const typeB = await seedEventType('Встреча Б', 30);
  const date = tomorrowISODate();

  const slotsA = await fetchSlots(typeA.id, date);
  const slotsB = await fetchSlots(typeB.id, date);
  await seedBooking(typeA.id, slotsA[0].startTime, 'Гость А');
  // The last slot of the day cannot overlap the first one (busy rule is global).
  await seedBooking(typeB.id, slotsB.at(-1)!.startTime, 'Гость Б');

  await page.goto('/admin/bookings');

  const table = page.locator('table');
  await expect(table).toContainText('Гость А');
  await expect(table).toContainText('Гость Б');
  await expect(table).toContainText(typeA.title);
  await expect(table).toContainText(typeB.title);
});

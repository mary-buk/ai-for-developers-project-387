import { expect, test } from '@playwright/test';
import {
  dayButton,
  fetchSlots,
  seedBooking,
  seedEventType,
  tomorrowDayNumber,
  tomorrowISODate,
} from './helpers';

test('guest sees event types on the home page', async ({ page }) => {
  const type = await seedEventType('Каталог', 60);

  await page.goto('/');

  const card = page.locator('.card', { hasText: type.title });
  await expect(card).toBeVisible();
  await expect(card.getByText('Создано из e2e-теста')).toBeVisible();
  await expect(card.getByText('Длительность: 60 мин')).toBeVisible();
  await expect(card.getByRole('link', { name: 'Выбрать слот' })).toBeVisible();
});

test('guest picks a day, sees free slots and books one', async ({ page }) => {
  const type = await seedEventType('Бронь', 60);
  const day = tomorrowDayNumber();

  await page.goto(`/event-types/${type.id}`);
  await expect(page.getByRole('heading', { name: type.title })).toBeVisible();

  // The booking window offers exactly 14 days.
  await expect(page.locator('.days button')).toHaveCount(14);
  await dayButton(page, day).click();

  const slots = page.locator('.slots .slot');
  await expect(slots.first()).toBeVisible();
  const time = await slots.first().innerText();

  await slots.first().click();
  await page.getByLabel('Ваше имя').fill('Иван Петров');
  await page.getByRole('button', { name: 'Забронировать' }).click();

  await expect(page.locator('.success')).toContainText('Бронирование подтверждено');

  // The booked slot is not offered anymore after reloading the page.
  await page.reload();
  await dayButton(page, day).click();
  await expect(page.locator('.slots .slot', { hasText: time })).toHaveCount(0);
});

test('guest sees an error when the slot was just taken', async ({ page }) => {
  const type = await seedEventType('Гонка', 60);
  const day = tomorrowDayNumber();
  const [slot] = await fetchSlots(type.id, tomorrowISODate());

  await page.goto(`/event-types/${type.id}`);
  await dayButton(page, day).click();
  await expect(page.locator('.slots .slot').first()).toBeVisible();

  // Someone books the same slot through the API "behind our back".
  const taken = await seedBooking(type.id, slot.startTime, 'Другой гость');
  expect(taken.status).toBe(201);

  // Our page still shows the stale slot; booking it must fail gracefully.
  await page.locator('.slots .slot').first().click();
  await page.getByLabel('Ваше имя').fill('Опоздавший Гость');
  await page.getByRole('button', { name: 'Забронировать' }).click();

  await expect(page.locator('.error')).toContainText('Этот слот уже занят');
});

test('guest gets a message when the chosen slot expires while filling the form', async ({
  page,
}) => {
  const type = await seedEventType('Истекает', 60);
  const day = tomorrowDayNumber();

  // Mock only the browser clock; the API and the seed data stay real. The
  // clock is frozen at the real "now", so the day strip and the server window
  // still agree when the page loads.
  await page.clock.install();

  await page.goto(`/event-types/${type.id}`);
  await expect(page.getByRole('heading', { name: type.title })).toBeVisible();
  await dayButton(page, day).click();

  const slots = page.locator('.slots .slot');
  await expect(slots.first()).toBeVisible();
  await slots.first().click();
  await page.getByLabel('Ваше имя').fill('Иван Петров');

  // A day and a half passes while the guest is typing: the tomorrow slot they
  // picked has expired (its startTime is now in the past), so the client must
  // refuse the booking without even hitting the API.
  await page.clock.fastForward(36 * 60 * 60 * 1000);

  await page.getByRole('button', { name: 'Забронировать' }).click();
  await expect(page.locator('.error')).toContainText(
    'Время этого слота уже прошло. Выберите другой.',
  );
});

test('the last day of the booking window loads without error', async ({ page }) => {
  const type = await seedEventType('Окно', 60);

  await page.goto(`/event-types/${type.id}`);
  await expect(page.locator('.days button')).toHaveCount(14);

  // The 14th day is still inside the server window: no 400, no stuck spinner.
  await page.locator('.days button').last().click();
  await expect(page.locator('.days .day-button.active')).toHaveCount(1);
  await expect(page.locator('.slots .slot').first()).toBeVisible();
  await expect(page.locator('.error')).toHaveCount(0);
});

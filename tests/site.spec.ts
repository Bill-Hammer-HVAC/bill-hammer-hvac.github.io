import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test('homepage has one h1, valid landmarks, and no detectable axe violations', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('h1')).toHaveCount(1);
  await expect(page.locator('header')).toHaveCount(1);
  await expect(page.locator('main')).toHaveCount(1);
  await expect(page.locator('footer')).toHaveCount(1);
  await expect(page).toHaveTitle(/Hammer Heating and Air Conditioning/);

  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});

test('mobile navigation controls visibility and restores focus with Escape', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 740 });
  await page.goto('/');
  const button = page.getByRole('button', { name: 'Menu' });
  const nav = page.getByRole('navigation', { name: 'Primary navigation' });

  await expect(button).toHaveAttribute('aria-expanded', 'false');
  await expect(nav).toBeHidden();
  await button.click();
  await expect(button).toHaveAttribute('aria-expanded', 'true');
  await expect(nav).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(nav).toBeHidden();
  await expect(button).toBeFocused();

  await button.click();
  await nav.getByRole('link', { name: 'Services', exact: true }).click();
  await expect(page).toHaveURL(/\/services\/$/);
});

test('navigation identifies the active page', async ({ page }) => {
  await page.goto('/about/');
  await expect(page.locator('#primary-navigation a[aria-current="page"]')).toHaveText('About');
});

test('form shows accessible inline validation', async ({ page }) => {
  await page.goto('/contact/');
  await page.getByRole('button', { name: 'Send estimate request' }).click();
  await expect(page.locator('#name')).toBeFocused();
  await expect(page.locator('#name-error')).toContainText('required');
  await expect(page.locator('#name')).toHaveAttribute('aria-invalid', 'true');
});

test('enhanced contact form handles success and emits a safe analytics event', async ({ page }) => {
  await page.addInitScript(() => {
    window.capturedEvents = [];
    window.gtag = (...args: unknown[]) => window.capturedEvents?.push(args);
  });
  await page.route('https://www.formbackend.com/f/1f99438a868890f4', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ submission_text: 'Thanks for contacting Hammer.' }) });
  });
  await page.goto('/contact/');
  await page.getByLabel('Name *').fill('Alex Homeowner');
  await page.getByLabel('Email *').fill('alex@example.com');
  await page.getByLabel('Phone *').fill('310-555-0100');
  await page.getByLabel('How can we help? *').fill('Please contact me about a new system.');
  await page.getByRole('button', { name: 'Send estimate request' }).click();

  const status = page.locator('[data-form-status]');
  await expect(status).toContainText('Thanks for contacting Hammer.');
  await expect(status).toBeFocused();
  await expect(page.locator('[data-contact-form]')).toBeHidden();
  await expect(page.getByLabel('Name *')).toBeHidden();
  const events = await page.evaluate(() => window.capturedEvents);
  expect(events?.some((event) => event[0] === 'event' && event[1] === 'contact_form_submit')).toBeTruthy();
});

test('enhanced contact form preserves values and restores button after failure', async ({ page }) => {
  await page.route('https://www.formbackend.com/f/1f99438a868890f4', async (route) => route.fulfill({ status: 500, contentType: 'text/plain', body: 'failure' }));
  await page.goto('/contact/');
  await page.getByLabel('Name *').fill('Alex Homeowner');
  await page.getByLabel('Email *').fill('alex@example.com');
  await page.getByLabel('Phone *').fill('310-555-0100');
  await page.getByLabel('How can we help? *').fill('My entered message should remain.');
  await page.getByRole('button', { name: 'Send estimate request' }).click();

  await expect(page.locator('[data-form-status]')).toContainText('could not send');
  await expect(page.getByLabel('How can we help? *')).toHaveValue('My entered message should remain.');
  await expect(page.getByRole('button', { name: 'Send estimate request' })).toBeEnabled();
});

test('basic form remains a usable POST without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:4321/contact/');
  const form = page.locator('form[data-contact-form]');
  await expect(form).toHaveAttribute('method', 'POST');
  await expect(form).toHaveAttribute('action', 'https://www.formbackend.com/f/1f99438a868890f4');
  await expect(page.getByLabel('Name *')).toHaveAttribute('required', '');
  await expect(page.getByLabel('Phone *')).toHaveAttribute('required', '');
  await expect(page.getByRole('button', { name: 'Send estimate request' })).toBeEnabled();
  await context.close();
});

test('legacy files resolve exactly and point to canonical routes', async ({ request }) => {
  const cases = [
    ['/services.html', '/services/'],
    ['/Services.html', '/services/'],
    ['/About_Us.html', '/about/'],
    ['/Testimonials.html', '/testimonials/'],
    ['/Contact_Us.html', '/contact/'],
    ['/hammerheatingandair.html', '/'],
  ];
  for (const [legacy, destination] of cases) {
    const response = await request.get(legacy!);
    expect(response.ok()).toBeTruthy();
    const html = await response.text();
    expect(html).toContain(`href="${destination}"`);
    expect(html).toContain(`content="0; url=${destination}"`);
  }
});

test('mobile pages do not create horizontal overflow', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 700 });
  for (const path of ['/', '/services/', '/about/', '/testimonials/', '/contact/', '/privacy/']) {
    await page.goto(path);
    const sizes = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, client: document.documentElement.clientWidth }));
    expect(sizes.scroll, `${path} overflowed horizontally`).toBeLessThanOrEqual(sizes.client);
  }
});

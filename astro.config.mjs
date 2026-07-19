import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

const redirects = new Set([
  '/services.html',
  '/Services.html',
  '/About_Us.html',
  '/Testimonials.html',
  '/Contact_Us.html',
  '/hammerheatingandair.html',
]);

export default defineConfig({
  site: 'https://hammerheatingandair.com',
  output: 'static',
  trailingSlash: 'always',
  integrations: [
    sitemap({
      filter: (page) => !redirects.has(new URL(page).pathname),
    }),
  ],
});

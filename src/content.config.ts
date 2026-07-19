import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const pages = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/pages' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    eyebrow: z.string().optional(),
    heading: z.string(),
    intro: z.string().optional(),
  }),
});

const services = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/services' }),
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    order: z.number().int().positive(),
    featured: z.boolean().default(false),
    icon: z.enum(['heat', 'cool', 'replace', 'repair', 'home', 'control']),
  }),
});

const testimonials = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/testimonials' }),
  schema: z.object({
    names: z.string(),
    location: z.string(),
    role: z.string().optional(),
    order: z.number().int().positive(),
    featured: z.boolean().default(false),
  }),
});

export const collections = { pages, services, testimonials };

import { defineCollection } from 'astro:content';
import { z } from 'zod';

function normalizePostDate(input: unknown): Date | undefined {
  if (input instanceof Date && !Number.isNaN(input.getTime())) {
    return input;
  }

  if (typeof input === 'number' && Number.isFinite(input)) {
    // Accept unix-time (seconds) and unix milliseconds.
    const ms = input > 1e12 ? input : input * 1000;
    const parsed = new Date(ms);
    return Number.isNaN(parsed.getTime()) ? undefined : parsed;
  }

  if (typeof input === 'string') {
    const value = input.trim();
    if (!value) return undefined;

    // Accept unix-time represented as string.
    if (/^\d+$/.test(value)) {
      const n = Number(value);
      if (Number.isFinite(n)) {
        const ms = n > 1e12 ? n : n * 1000;
        const parsed = new Date(ms);
        if (!Number.isNaN(parsed.getTime())) return parsed;
      }
    }

    // Accept date-only format like "2025-10-8" robustly.
    const dateOnly = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(value);
    if (dateOnly) {
      const year = Number(dateOnly[1]);
      const month = Number(dateOnly[2]);
      const day = Number(dateOnly[3]);
      const parsed = new Date(Date.UTC(year, month - 1, day));
      return Number.isNaN(parsed.getTime()) ? undefined : parsed;
    }

    // Accept ISO date-time and other Date-compatible strings.
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }

  return undefined;
}

const posts = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    titleCn: z.string().optional(),
    date: z.preprocess(
      (value) => normalizePostDate(value),
      z.date({ error: 'Invalid date. Use YYYY-M-D, ISO datetime, or unix-time.' })
    ),
    description: z.string().optional(),
    tags: z.array(z.string()).optional(),
  }),
});

export const collections = { posts };

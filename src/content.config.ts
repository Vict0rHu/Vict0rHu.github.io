import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/**
 * Portfolio projects.
 *
 * Each project is a markdown file in `src/content/projects/`.
 * - The frontmatter (below) drives the grid card and the case study.
 * - The markdown body becomes the rich "overview" narrative on the detail page.
 *
 * The schema is validated at build time, so a typo in `filter` (or a missing
 * required field) fails the build instead of silently breaking the site.
 */
const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    // Category shown in the project archive.
    filter: z.enum(['Projects', 'Research', 'Competitions', 'Coursework']),
    category: z.string().optional(),
    date: z.string().optional(),
    role: z.string().optional(),
    // Lower numbers show first in the grid.
    order: z.number().default(99),
    // Card thumbnail + one-line blurb shown in the grid.
    thumbnail: z.string(),
    description: z.string(),
    // Tools shown in the case study.
    tech: z.array(z.string()).default([]),
    // Outbound links (GitHub / demo / paper …).
    links: z
      .array(
        z.object({
          label: z.string(),
          url: z.string(),
        })
      )
      .default([]),
    // Bullet-point outcomes.
    highlights: z.array(z.string()).default([]),
    // Case-study media: images and/or embedded videos (YouTube/Vimeo URL or .mp4).
    media: z
      .array(
        z.object({
          type: z.enum(['image', 'video']).default('image'),
          src: z.string(),
          alt: z.string().optional(),
        })
      )
      .default([]),
    // Set true to hide a project without deleting the file.
    draft: z.boolean().default(false),
  }),
});

export const collections = { projects };

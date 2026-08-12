import { z, defineCollection } from 'astro:content';

const blogCollection = defineCollection({
  type: 'content', // Use 'content' for Markdown/MDX files
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.date(),
    image: z.string().optional(),
  }),
});

export const collections = {
  'blog': blogCollection,
};

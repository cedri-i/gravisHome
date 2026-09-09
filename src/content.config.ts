import { defineCollection, z } from 'astro:content';
import { docsLoader } from '@astrojs/starlight/loaders';
import { docsSchema } from '@astrojs/starlight/schema';

export const collections = {
    docs: defineCollection({ loader: docsLoader(), schema: docsSchema({
        extend: z.object({
            createdAt: z.string().datetime({ offset: true }).optional(),
            updatedAt: z.string().datetime({ offset: true }).optional(),
            timeSource: z.enum(['git', 'source', 'manual']).optional(),
        }).refine(({ createdAt, updatedAt }) => !createdAt || !updatedAt ||
            Date.parse(updatedAt) >= Date.parse(createdAt),
            { message: '最近修改时间不得早于建立时间' }),
    }) }),
};

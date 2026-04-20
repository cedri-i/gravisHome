// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// https://astro.build/config
export default defineConfig({
    // 1. 添加 site 属性（Vercel 构建有时必须要有这个）
    site: 'https://gravis-home.vercel.app', 
    integrations: [
        starlight({
            title: 'My Docs',
            social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/cedri-i/gravisHome' }],
            sidebar: [
                {
                    label: 'Guides',
                    autogenerate: { directory: 'guides' }, // 改为自动生成
                },
                {
                    label: 'Notes',
                    autogenerate: { directory: 'notes' }, // 自动抓取你刚改好的 Lecture 笔记
                },
                {
                    label: 'Reference',
                    autogenerate: { directory: 'reference' },
                },
            ],
        }),
    ],
});
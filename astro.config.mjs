import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { remarkObsidianColor } from './remark-obsidian-color.mjs'; // 确保你创建了这个文件

export default defineConfig({
    site: 'https://gravis-home.vercel.app',
    integrations: [
        starlight({
            title: 'My Docs',
            // 如果你后面创建了自定义CSS，可以在这里取消注释
            // customCss: ['./src/styles/custom.css'], 
            sidebar: [
                {
                    label: 'My Notes',
                    autogenerate: { directory: 'notes' }, 
                },
            ],
        }),
    ],
    markdown: {
        // remarkPlugins 处理 Markdown 语法（数学公式解析、自定义颜色语法）
        remarkPlugins: [remarkMath, remarkObsidianColor],
        // rehypePlugins 处理 HTML 转换（把公式渲染成漂亮的样式）
        rehypePlugins: [rehypeKatex],
    },
});
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { remarkObsidianColor } from './remark-obsidian-color.mjs';
import { remarkObsidianHighlight } from './remark-obsidian-highlight.mjs';
import { remarkCodeLanguageAliases } from './remark-code-language-aliases.mjs';
import { rehypeMermaid } from './rehype-mermaid.mjs';

function mermaidClient() {
    return {
        name: 'mermaid-client',
        hooks: {
            'astro:config:setup': ({ injectScript }) => {
                injectScript(
                    'page',
                    `import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs';
mermaid.initialize({ startOnLoad: false, theme: document.documentElement.dataset.theme === 'dark' ? 'dark' : 'default' });
await mermaid.run({ querySelector: '.mermaid' });`
                );
            },
        },
    };
}

export default defineConfig({
    site: 'https://gravis-home-xi.vercel.app',
    integrations: [
        starlight({
            title: 'My Docs',
            customCss: ['./src/styles/custom.css'],
            sidebar: [
                {
                    label: '计算机系统',
                    items: [
                        {
                            label: 'CMU: CSAPP',
                            autogenerate: { directory: 'notes' },
                        },
                    ],
                },
            ],
        }),
        mermaidClient(),
    ],
    markdown: {
        gfm: false,
        remarkPlugins: [
            [remarkGfm, { singleTilde: false }],
            remarkMath,
            remarkObsidianColor,
            remarkObsidianHighlight,
            remarkCodeLanguageAliases,
        ],
        rehypePlugins: [rehypeKatex, rehypeMermaid],
    },
});

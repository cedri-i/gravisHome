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
            customCss: ['./src/styles/custom.css', './src/styles/home-entry.css'],
            head: [
                {
                    tag: 'script',
                    attrs: { type: 'module' },
                    content: `const bindSkyToggle = () => {
  let btn = document.getElementById('sky-toggle');

  if (!btn) {
    btn = document.createElement('button');
    btn.id = 'sky-toggle';
    btn.type = 'button';
    btn.setAttribute('aria-label', 'Toggle day night');
    btn.innerHTML = '<span class="moon">&#127769;</span><span class="sun">&#9728;&#65039;</span>';
    document.body.appendChild(btn);
  }

  if (btn.dataset.bound === 'true') return;
  btn.dataset.bound = 'true';

  btn.addEventListener('click', () => {
    const root = document.documentElement;
    const current = root.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';

    root.setAttribute('data-theme', next);
    localStorage.setItem('starlight-theme', next);
    window.StarlightThemeProvider?.updatePickers?.(next);
  });
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bindSkyToggle, { once: true });
} else {
  bindSkyToggle();
}`,
                },
            ],
            locales: {
                root: {
                    label: '简体中文',
                    lang: 'zh-CN',
                },
            },
            sidebar: [
                {
                    label: 'My Notes',
                    items: [
                        {
                            label: '导航',
                            link: '/my-notes/',
                        },
                        {
                            label: '计算机系统',
                            collapsed: true,
                            items: [
                                {
                                    label: 'Overview',
                                    link: '/computer-systems/',
                                },
                                {
                                    label: 'CMU: CSAPP',
                                    collapsed: true,
                                    items: [
                                        {
                                            label: 'Overview',
                                            link: '/computer-systems/csapp/',
                                        },
                                        {
                                            label: 'Lecture 01',
                                            link: '/notes/lecture-01/',
                                        },
                                        {
                                            label: 'Lecture 02',
                                            link: '/notes/lecture-02/',
                                        },
                                        {
                                            label: 'Lecture 03',
                                            link: '/notes/lecture-03/',
                                        },
                                        {
                                            label: 'Lecture 04',
                                            link: '/notes/lecture-04/',
                                        },
                                        {
                                            label: 'Lecture 05',
                                            link: '/notes/lecture-05/',
                                        },
                                        {
                                            label: 'Lecture 06',
                                            link: '/notes/lecture-06/',
                                        },
                                        {
                                            label: 'Lecture 07',
                                            link: '/notes/lecture-07/',
                                        },
                                        {
                                            label: 'Lecture 08',
                                            link: '/notes/lecture-08/',
                                        },
                                        {
                                            label: 'Lecture 09',
                                            link: '/notes/lecture-09/',
                                        },
                                        {
                                            label: 'Lecture 10',
                                            link: '/notes/lecture-10/',
                                        },
                                        {
                                            label: 'Lecture 11',
                                            link: '/notes/lecture-11/',
                                        },
                                        {
                                            label: 'Lecture 12',
                                            link: '/notes/lecture-12/',
                                        },
                                        {
                                            label: 'Lecture 13',
                                            link: '/notes/lecture-13/',
                                        },
                                    ],
                                },
                            ],
                        },
                        {
                            label: '白鱼n',
                            items: [
                                {
                                    label: 'Overview',
                                    link: '/baiyun/',
                                },
                                {
                                    label: '游苍山记',
                                    link: '/baiyun/you-cangshan-ji/',
                                },
                                {
                                    label: '触山',
                                    link: '/baiyun/chu-shan/',
                                },
                                {
                                    label: '不懂杭州',
                                    link: '/baiyun/bu-dong-hangzhou/',
                                },
                                {
                                    label: '逢秋满陇',
                                    link: '/baiyun/feng-qiu-man-long/',
                                },
                            ],
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

import { readFile, readdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from 'parse5';

const blockTags = new Set([
    'article', 'aside', 'blockquote', 'br', 'dd', 'div', 'dl', 'dt',
    'figcaption', 'figure', 'li', 'ol', 'p', 'pre', 'section', 'table', 'td', 'th', 'tr', 'ul',
]);
const ignoredTags = new Set(['button', 'footer', 'nav', 'script', 'style', 'svg', 'template']);
const attribute = (node, name) => node.attrs?.find((attr) => attr.name === name)?.value;
const hasClass = (node, name) => attribute(node, 'class')?.split(/\s+/).includes(name);

function find(node, predicate) {
    if (predicate(node)) return node;
    for (const child of node.childNodes ?? []) {
        const match = find(child, predicate);
        if (match) return match;
    }
}

const clean = (text) => text.replace(/\s+/g, ' ').trim();

function indexPage(html, url) {
    const main = find(parse(html), (node) => attribute(node, 'data-pagefind-body') !== undefined);
    if (!main) return;

    const sections = [];
    const keywords = [];
    let title = '';
    let section = { heading: '', id: '', parts: [] };

    function finishSection() {
        const text = clean(section.parts.join(''));
        if (section.heading || text) sections.push([section.heading, section.id, text]);
    }

    function read(node, override) {
        if (attribute(node, 'data-pagefind-ignore') !== undefined ||
            attribute(node, 'aria-hidden') === 'true' || ignoredTags.has(node.tagName) ||
            hasClass(node, 'content-dates') || hasClass(node, 'katex-html')) return;

        if (node.nodeName === '#text') {
            (override ?? section.parts).push(node.value);
            return;
        }

        const id = attribute(node, 'id');
        const children = node.childNodes ?? [];
        if (!override && /^h[1-6]$/.test(node.tagName ?? '') && id) {
            const headingParts = [];
            for (const child of children) read(child, headingParts);
            const heading = clean(headingParts.join(''));
            if (id === '_top') {
                title = heading;
            } else if (heading) {
                finishSection();
                section = { heading, id, parts: [] };
            }
            return;
        }

        if (!override && attribute(node, 'data-pagefind-meta') === 'keywords') {
            const keywordParts = [];
            for (const child of children) read(child, keywordParts);
            keywords.push(clean(keywordParts.join('')));
            return;
        }

        const block = blockTags.has(node.tagName);
        if (block) (override ?? section.parts).push(' ');
        for (const child of children) read(child, override);
        if (block) (override ?? section.parts).push(' ');
    }

    read(main);
    finishSection();
    if (title) return { title, url, keywords: keywords.join(' '), sections };
}

export function notesSearchIndex() {
    return {
        name: 'notes-search-index',
        hooks: {
            'astro:build:done': async ({ dir, logger }) => {
                const root = fileURLToPath(dir);
                const files = (await readdir(root, { recursive: true }))
                    .filter((name) => name.endsWith('.html')).sort();
                const entries = [];
                for (const file of files) {
                    const url = '/' + file.split(/[\\/]/).join('/')
                        .replace(/(^|\/)index\.html$/, '$1').replace(/\.html$/, '/');
                    const entry = indexPage(await readFile(join(root, file), 'utf8'), url);
                    if (entry) entries.push(entry);
                }
                if (!entries.length) throw new Error('No pages were found for the notes search index.');
                await writeFile(join(root, 'search-index.json'), JSON.stringify(entries));
                logger.info(`Indexed ${entries.length} pages for search.`);
            },
        },
    };
}

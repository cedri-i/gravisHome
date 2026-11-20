export interface SearchEntry {
    title: string;
    url: string;
    description?: string;
    keywords: string;
    sections: [heading: string, id: string, text: string][];
}

const fold = (value: string) => value.normalize('NFKC').toLowerCase();
const normalize = (value: string) => fold(value)
    .replace(/(?<=[a-z0-9])[-‐‑–—](?=[a-z0-9])/g, ' ')
    .replace(/\s+/g, ' ').trim()
    .replace(/(?<=\p{Script=Han}) | (?=\p{Script=Han})/gu, '')
    .replaceAll('结点', '节点');

// Common names used in the notes, including searches for their Chinese titles.
const equivalentTerms = [
    ['avl', 'avl tree', 'avl树', '平衡二叉树', '平衡二叉搜索树'],
    ['red black tree', '红黑树'],
    ['splay tree', '伸展树'],
    ['b tree', 'b树'],
    ['b+ tree', 'b+树'],
    ['binary search tree', '二叉搜索树', 'bst'],
    ['single cycle', '单周期'],
    ['datapath', 'data path', '数据通路'],
    ['pipeline', 'pipelines', 'pipelining', 'pipelined', '流水线'],
    ['data hazard', 'data hazards', '数据冒险'],
    ['control hazard', 'control hazards', '控制冒险'],
    ['structural hazard', 'structural hazards', '结构冒险'],
    ['cache', 'caches', '缓存'],
    ['direct mapped cache', '直接映射缓存'],
    ['rotation', 'rotations', '旋转'],
];

const aliases = new Map(equivalentTerms.flatMap((group) => group.map((term) => [term, group] as const)));

function asPattern(value: string) {
    const escaped = value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    // Letters, digits and language suffixes such as ++ belong to their own token.
    const start = /^[a-z0-9]/.test(value) ? '(?<![a-z0-9_+#])' : '';
    const end = /[a-z0-9+#]$/.test(value) ? '(?![a-z0-9_+#])' : '';
    return start + escaped + end;
}

const aliasPattern = [...aliases.keys()]
    .sort((a, b) => b.length - a.length)
    .map(asPattern).join('|');
const queryParts = new RegExp(aliasPattern + '|[a-z0-9_]+[+#]*|\\p{Script=Han}+|[^\\s]', 'gu');
const onlyHan = /^\p{Script=Han}+$/u;
const stopWords = new Set(['的', '和', '与', '及']);
const segmenter = typeof Intl.Segmenter === 'function'
    ? new Intl.Segmenter('zh-CN', { granularity: 'word' })
    : undefined;

function chineseTerms(value: string) {
    if (!segmenter) return [value];
    const segments = [];
    let singles = '';
    for (const { segment } of segmenter.segment(value)) {
        if (stopWords.has(segment)) continue;
        if (segment.length === 1) {
            singles += segment;
        } else {
            if (singles.length === 1) {
                segments.push(singles + segment);
            } else {
                if (singles) segments.push(singles);
                segments.push(segment);
            }
            singles = '';
        }
    }
    if (singles.length === 1 && segments.length) segments[segments.length - 1] += singles;
    else if (singles) segments.push(singles);
    return segments;
}

function makeQuery(value: string) {
    const query = normalize(value);
    const variants = aliases.get(query) ?? [query];
    const terms = new Map<string, RegExp>();
    for (const [part] of query.matchAll(queryParts)) {
        const group = aliases.get(part);
        const words = group ? [part] : onlyHan.test(part) ? chineseTerms(part) : [part];
        for (const word of words) {
            if (!/[a-z0-9\p{Script=Han}]/u.test(word)) continue;
            const spellings = aliases.get(word) ?? [word];
            terms.set(spellings[0], new RegExp(spellings.map(asPattern).join('|'), 'u'));
        }
    }
    return {
        exact: new RegExp(asPattern(query), 'u'),
        phrase: new RegExp(variants.map(asPattern).join('|'), 'u'),
        query,
        variants,
        terms: [...terms.values()],
    };
}

export function prepareIndex(entries: SearchEntry[]) {
    return entries.map((entry) => ({
        title: entry.title,
        url: entry.url,
        normalizedTitle: normalize(entry.title),
        description: normalize(entry.description ?? ''),
        keywords: normalize(entry.keywords),
        sections: entry.sections.map(([heading, id, text]) => ({
            heading, id, text,
            label: normalize(heading).replace(/^\d+[.)]\s*/, ''),
            content: normalize(text),
        })),
    }));
}

type Query = ReturnType<typeof makeQuery>;

function labelScore(text: string, search: Query, weight: number) {
    if (text === search.query) return weight;
    if (search.variants.includes(text)) return weight - 8;
    if (search.exact.test(text)) return weight - 20;
    if (search.phrase.test(text)) return weight - 28;
    if (search.terms.length > 1 && search.terms.every((term) => term.test(text))) return weight - 45;
    return 0;
}

function makeExcerpt(text: string, search: Query) {
    const folded = fold(text);
    const match = folded.search(search.exact);
    const positions = search.terms.map((term) => folded.search(term)).filter((position) => position >= 0);
    const position = match >= 0 ? match : Math.min(...positions, text.length);
    const start = position < text.length ? Math.max(0, position - 25) : 0;
    const end = Math.min(text.length, start + 125);
    return (start ? '…' : '') + text.slice(start, end).trim() + (end < text.length ? '…' : '');
}

export function findNotes(index: ReturnType<typeof prepareIndex>, input: string) {
    if (!input.trim()) return [];
    const search = makeQuery(input);
    if (!search.terms.length) return [];

    const singleLetter = /^[a-z]$/.test(search.query);
    const results = [];
    for (const entry of index) {
        const { normalizedTitle, description, keywords, sections } = entry;
        const titleScore = labelScore(normalizedTitle, search, 300);
        const metadataScore = Math.max(labelScore(description, search, 165), labelScore(keywords, search, 157));

        const titleTerms = search.terms.map((term) => term.test(normalizedTitle));
        const contextTerms = search.terms.map((term, i) => titleTerms[i] || term.test(description) || term.test(keywords));
        const titleCoverage = titleTerms.filter(Boolean).length / search.terms.length;

        let bestSection = sections[0];
        let sectionScore = 0;
        for (const section of sections) {
            const headingScore = labelScore(section.label, search, 230);
            // Single letters also appear as variables and people's initials in prose.
            const bodyScore = singleLetter ? 0
                : search.exact.test(section.content) ? 120
                : search.phrase.test(section.content) ? 112 : 0;
            let combinedScore = 0;
            if (search.terms.length > 1) {
                const headingMatches = search.terms.map((term) => section.label.match(term)?.[0]);
                const localTerms = search.terms.map((term, i) => Boolean(headingMatches[i]) || term.test(section.content));
                const localCount = localTerms.filter(Boolean).length;
                if (localCount && localTerms.every((found, i) => found || contextTerms[i])) {
                    // A title can supply the topic while the section supplies the specific detail.
                    const localCoverage = localCount / search.terms.length;
                    const headingCoverage = headingMatches.filter(Boolean).length / search.terms.length;
                    const exactHeadingBonus = headingMatches.includes(section.label) ? 16 : 0;
                    combinedScore = 75 + 24 * localCoverage + 24 * headingCoverage + 50 * titleCoverage + exactHeadingBonus;
                }
            }
            const score = Math.max(headingScore, bodyScore, combinedScore);
            if (score > sectionScore) {
                bestSection = section;
                sectionScore = score;
            }
        }

        const score = Math.max(titleScore, metadataScore, sectionScore);
        if (!score) continue;
        const id = sectionScore && !titleScore ? bestSection?.id : '';
        results.push({
            title: entry.title,
            url: entry.url + (id ? '#' + encodeURIComponent(id) : ''),
            heading: id ? bestSection.heading : '',
            excerpt: bestSection ? makeExcerpt(bestSection.text, search) : '',
            score,
        });
    }
    return results.sort((a, b) => b.score - a.score);
}

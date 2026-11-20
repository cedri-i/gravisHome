export interface SearchEntry {
    title: string;
    url: string;
    keywords: string;
    sections: [heading: string, id: string, text: string][];
}

const fold = (value: string) => value.normalize('NFKC').toLowerCase();
const normalize = (value: string) => fold(value)
    .replace(/(?<=[a-z0-9])[-‐‑–—](?=[a-z0-9])/g, ' ')
    .replace(/\s+/g, ' ').trim()
    .replace(/(?<=\p{Script=Han}) | (?=\p{Script=Han})/gu, '')
    .replaceAll('结点', '节点');

export function prepareIndex(entries: SearchEntry[]) {
    return entries.map((entry) => ({
        title: entry.title,
        url: entry.url,
        normalizedTitle: normalize(entry.title),
        keywords: normalize(entry.keywords),
        sections: entry.sections.map(([heading, id, text]) => ({
            heading, id, text, label: normalize(heading), content: normalize(text),
        })),
    }));
}

function makeExcerpt(text: string, query: string) {
    const match = fold(text).indexOf(fold(query));
    const start = Math.max(0, match - 25);
    const end = Math.min(text.length, start + 125);
    return (start ? '…' : '') + text.slice(start, end).trim() + (end < text.length ? '…' : '');
}

export function findNotes(index: ReturnType<typeof prepareIndex>, input: string) {
    const query = normalize(input);
    if (!query) return [];
    const words = fold(input).trim().split(/\s+/).map(normalize).filter((word) => word.length > 1);
    const matchesAll = (text: string) => words.length > 1 && words.every((word) => text.includes(word));
    const results = [];
    for (const entry of index) {
        const { normalizedTitle, keywords, sections } = entry;
        const titleScore = normalizedTitle === query ? 150
            : normalizedTitle.startsWith(query) ? 125
            : normalizedTitle.includes(query) ? 110
            : matchesAll(normalizedTitle) ? 95 : 0;
        const keywordScore = keywords.includes(query) ? 80 : 0;
        let bestSection = sections[0];
        let sectionScore = 0;
        for (const section of sections) {
            const score = section.label === query ? 90
                : section.label.includes(query) ? 70
                : section.content.includes(query) ? 55
                : matchesAll(section.content) ? 25 : 0;
            if (score > sectionScore) {
                bestSection = section;
                sectionScore = score;
            }
        }

        const score = Math.max(titleScore, keywordScore, sectionScore);
        if (!score) continue;
        const id = sectionScore && !titleScore ? bestSection?.id : '';
        results.push({
            title: entry.title,
            url: entry.url + (id ? '#' + encodeURIComponent(id) : ''),
            heading: id ? bestSection.heading : '',
            excerpt: bestSection ? makeExcerpt(bestSection.text, input.trim()) : '',
            score,
        });
    }
    return results.sort((a, b) => b.score - a.score);
}

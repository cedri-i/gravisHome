function splitTextNode(node) {
    if (node.type !== 'text' || !node.value.includes('\n')) return [node];

    const lines = node.value.split('\n');
    const next = [];

    lines.forEach((line, index) => {
        if (line) {
            next.push({
                ...node,
                value: line,
            });
        }

        if (index < lines.length - 1) {
            next.push({ type: 'break' });
        }
    });

    return next;
}

function preserveInlineBreaks(node) {
    if (!Array.isArray(node.children)) return;

    node.children = node.children.flatMap((child) => {
        if (child.type === 'text') return splitTextNode(child);
        preserveInlineBreaks(child);
        return [child];
    });
}

function transformNode(node) {
    if (!Array.isArray(node.children)) return;

    // A physical newline in an imported Obsidian paragraph is intentional.
    // Apply this to every paragraph, including blockquotes and list items,
    // instead of letting CommonMark collapse the newline into a space.
    if (node.type === 'paragraph') {
        preserveInlineBreaks(node);
        return;
    }

    for (const child of node.children) {
        transformNode(child);
    }
}

export function remarkPreserveParagraphBreaks() {
    return (tree) => {
        transformNode(tree);
    };
}

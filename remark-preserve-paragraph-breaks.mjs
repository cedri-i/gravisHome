const proseParents = new Set(['root', 'blockquote']);

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

function transformNode(node, parent) {
    if (!Array.isArray(node.children)) return;

    if (node.type === 'paragraph' && parent && proseParents.has(parent.type)) {
        node.children = node.children.flatMap(splitTextNode);
        return;
    }

    for (const child of node.children) {
        transformNode(child, node);
    }
}

export function remarkPreserveParagraphBreaks() {
    return (tree) => {
        transformNode(tree, null);
    };
}

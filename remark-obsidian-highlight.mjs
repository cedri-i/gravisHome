function splitHighlightTokens(value) {
  const parts = [];
  let lastIndex = 0;
  let index = value.indexOf('==');

  while (index !== -1) {
    if (index > lastIndex) {
      parts.push({ type: 'text', value: value.slice(lastIndex, index) });
    }

    parts.push({ type: 'highlight' });
    lastIndex = index + 2;
    index = value.indexOf('==', lastIndex);
  }

  if (lastIndex < value.length) {
    parts.push({ type: 'text', value: value.slice(lastIndex) });
  }

  return parts;
}

function wrapHighlights(children) {
  const markerCount = children.reduce((count, child) => {
    if (child.type !== 'text') return count;
    return count + (child.value.match(/==/g) ?? []).length;
  }, 0);

  if (markerCount === 0 || markerCount % 2 !== 0) {
    return children;
  }

  const next = [];
  let isOpen = false;

  for (const child of children) {
    if (child.type !== 'text' || !child.value.includes('==')) {
      next.push(child);
      continue;
    }

    for (const part of splitHighlightTokens(child.value)) {
      if (part.type === 'text') {
        if (part.value) next.push({ ...child, value: part.value });
        continue;
      }

      next.push({ type: 'html', value: isOpen ? '</mark>' : '<mark>' });
      isOpen = !isOpen;
    }
  }

  return next;
}

function transformNode(node) {
  if (!Array.isArray(node.children)) return;

  for (const child of node.children) {
    transformNode(child);
  }

  node.children = wrapHighlights(node.children);
}

export function remarkObsidianHighlight() {
  return (tree) => {
    transformNode(tree);
  };
}

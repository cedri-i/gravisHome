const COLOR_ALIASES = new Map([
  ['red', 'red'],
  ['orange', 'orange'],
  ['yellow', 'yellow'],
  ['green', 'green'],
  ['cyan', 'cyan'],
  ['blue', 'blue'],
  ['purple', 'purple'],
  ['pink', 'pink'],
]);

const tokenPattern = /~=\s*\{([^}]+)\}|=~/g;

function colorClass(color) {
  const key = color.trim().toLowerCase();
  return COLOR_ALIASES.get(key) ?? key.replace(/[^a-z0-9_-]/g, '');
}

function splitColorTokens(value) {
  const parts = [];
  let lastIndex = 0;
  let match;

  tokenPattern.lastIndex = 0;
  while ((match = tokenPattern.exec(value)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: 'text', value: value.slice(lastIndex, match.index) });
    }

    if (match[0] === '=~') {
      parts.push({ type: 'colorClose' });
    } else {
      parts.push({ type: 'colorOpen', color: match[1] });
    }

    lastIndex = tokenPattern.lastIndex;
  }

  if (lastIndex < value.length) {
    parts.push({ type: 'text', value: value.slice(lastIndex) });
  }

  return parts;
}

function wrapColorMarkup(children) {
  const next = [];
  const openColors = [];

  for (const child of children) {
    if (child.type !== 'text' || (!child.value.includes('~=') && !child.value.includes('=~'))) {
      next.push(child);
      continue;
    }

    for (const part of splitColorTokens(child.value)) {
      if (part.type === 'text') {
        if (part.value) next.push({ ...child, value: part.value });
        continue;
      }

      if (part.type === 'colorOpen') {
        const className = colorClass(part.color);
        if (!className) continue;
        openColors.push(className);
        next.push({
          type: 'html',
          value: `<span class="obsidian-color obsidian-color-${className}">`,
        });
        continue;
      }

      if (openColors.length > 0) {
        openColors.pop();
        next.push({ type: 'html', value: '</span>' });
      } else {
        next.push({ type: 'text', value: '=~' });
      }
    }
  }

  while (openColors.length > 0) {
    openColors.pop();
    next.push({ type: 'html', value: '</span>' });
  }

  return next;
}

function transformNode(node) {
  if (!Array.isArray(node.children)) return;

  for (const child of node.children) {
    transformNode(child);
  }

  node.children = wrapColorMarkup(node.children);
}

export function remarkObsidianColor() {
  return (tree) => {
    transformNode(tree);
  };
}

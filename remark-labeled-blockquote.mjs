const NOTE_MARKER = /^\[!(?:note|说明)\][ \t]*(?:\r?\n)?/i;

function appendClass(node, className) {
  node.data ??= {};
  node.data.hProperties ??= {};

  const current = node.data.hProperties.className;
  const classes = Array.isArray(current)
    ? current
    : typeof current === 'string'
      ? current.split(/\s+/).filter(Boolean)
      : [];

  if (!classes.includes(className)) classes.push(className);
  node.data.hProperties.className = classes;
}

function markExplanation(node) {
  if (node.type !== 'blockquote' || !Array.isArray(node.children)) return;

  const paragraph = node.children[0];
  const marker = paragraph?.type === 'paragraph' ? paragraph.children?.[0] : undefined;
  if (marker?.type !== 'text' || !NOTE_MARKER.test(marker.value)) return;

  marker.value = marker.value.replace(NOTE_MARKER, '');
  if (!marker.value) paragraph.children.shift();
  if (paragraph.children.length === 0) node.children.shift();

  appendClass(node, 'note-explainer');
}

function transformNode(node) {
  if (!node || typeof node !== 'object') return;

  markExplanation(node);
  if (!Array.isArray(node.children)) return;
  for (const child of node.children) transformNode(child);
}

export function remarkLabeledBlockquote() {
  return (tree) => transformNode(tree);
}

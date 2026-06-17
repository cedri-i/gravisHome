import { visit } from 'unist-util-visit';

function textContent(node) {
  if (!Array.isArray(node.children)) return '';

  return node.children
    .map((child) => {
      if (child.type === 'text') return child.value;
      return textContent(child);
    })
    .join('');
}

function isMermaidCode(node) {
  if (node?.type !== 'element' || node.tagName !== 'pre') return false;

  const code = node.children?.find((child) => child.type === 'element' && child.tagName === 'code');
  const className = code?.properties?.className ?? [];

  return Array.isArray(className) && className.includes('language-mermaid');
}

export function rehypeMermaid() {
  return (tree) => {
    visit(tree, 'element', (node, index, parent) => {
      if (!parent || typeof index !== 'number' || !isMermaidCode(node)) return;

      const code = node.children.find((child) => child.type === 'element' && child.tagName === 'code');
      parent.children[index] = {
        type: 'element',
        tagName: 'div',
        properties: { className: ['mermaid'] },
        children: [{ type: 'text', value: textContent(code).trim() }],
      };
    });
  };
}

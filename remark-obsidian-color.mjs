import { visit } from 'unist-util-visit';

export function remarkObsidianColor() {
  return (tree) => {
    visit(tree, 'text', (node, index, parent) => {
      const regex = /~={([^}]+)}([^=]+)=~/g;
      if (regex.test(node.value)) {
        const children = [];
        let lastIndex = 0;
        let match;
        regex.lastIndex = 0;

        while ((match = regex.exec(node.value)) !== null) {
          if (match.index > lastIndex) {
            children.push({ type: 'text', value: node.value.slice(lastIndex, match.index) });
          }
          children.push({
            type: 'html',
            value: `<span style="color: ${match[1]}">${match[2]}</span>`
          });
          lastIndex = regex.lastIndex;
        }
        if (lastIndex < node.value.length) {
          children.push({ type: 'text', value: node.value.slice(lastIndex) });
        }
        parent.children.splice(index, 1, ...children);
      }
    });
  };
}
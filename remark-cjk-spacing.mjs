import { visit } from 'unist-util-visit';

const excludedParents = new Set([
  'code',
  'inlineCode',
  'html',
  'math',
  'inlineMath',
  'yaml',
  'toml',
]);

const addCjkLatinSpacing = (value) => {
  return value
    .replace(/([\p{Script=Han}])([A-Za-z0-9])/gu, '$1 $2')
    .replace(/([A-Za-z0-9])([\p{Script=Han}])/gu, '$1 $2');
};

export function remarkCjkSpacing() {
  return (tree) => {
    visit(tree, 'text', (node, _index, parent) => {
      if (!parent || excludedParents.has(parent.type)) return;
      node.value = addCjkLatinSpacing(node.value);
    });
  };
}

import { visit } from 'unist-util-visit';

const LANGUAGE_ALIASES = new Map([
  ['assmebly', 'asm'],
  ['assembly', 'asm'],
  ['gas', 'asm'],
  ['ia32', 'asm'],
  ['x86', 'asm'],
  ['c', 'c'],
  ['ubuntu', 'bash'],
]);

export function remarkCodeLanguageAliases() {
  return (tree) => {
    visit(tree, 'code', (node) => {
      if (!node.lang) return;

      const normalized = LANGUAGE_ALIASES.get(node.lang.trim().toLowerCase());
      if (normalized) node.lang = normalized;
    });
  };
}

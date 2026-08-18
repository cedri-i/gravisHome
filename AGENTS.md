# Repository working rules

## Obsidian note imports (mandatory)

When importing or updating a note from the Obsidian repository, fidelity to the
source Markdown takes priority over rewriting or compacting it.

- Preserve every intentional physical line break. Never join adjacent prose
  lines into one line, and never invent `-` markers to simulate line breaks.
- Preserve blank lines and paragraph boundaries. When Obsidian visually places
  an unmarked, unindented paragraph outside a preceding list but CommonMark
  would parse it as a lazy continuation, insert the blank separator required to
  close the list in the imported target. Never repair this by adding a list
  marker or indentation.
- Preserve every blockquote marker (`>`) and its nesting depth. Obsidian
  callout markers such as `> [!note]` must stay inside the blockquote; do not
  turn quoted text into an ordinary paragraph or custom HTML card.
- Preserve heading levels, list markers and indentation, fenced code blocks,
  tables, math delimiters, image order, captions, and intentional inline HTML.
- Keep display-math delimiters compatible with the site parser: when Obsidian
  places TeX on the same physical line as an opening or closing `$$`, move only
  the delimiter onto its own line in the imported target. Preserve the formula
  body exactly; otherwise remark-math may consume the remainder of the note.
- Allowed transformations are limited to site frontmatter, routable internal
  links and asset paths, and corrections explicitly requested by the user.
- Match the destination folder and frontmatter conventions of adjacent notes,
  but do not rephrase, summarize, or reorder the note body.
- After an import, inspect the Markdown diff and run both
  `npm run check:note-format` and `npm run build`.

The site converts soft newlines inside all Markdown paragraphs—including
paragraphs in blockquotes and list items—into visible line breaks. Do not remove
those source newlines during import.

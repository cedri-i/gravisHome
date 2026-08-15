# Repository working rules

## Obsidian note imports (mandatory)

When importing or updating a note from the Obsidian repository, fidelity to the
source Markdown takes priority over rewriting or compacting it.

- Preserve every intentional physical line break. Never join adjacent prose
  lines into one line, and never invent `-` markers to simulate line breaks.
- Preserve blank lines and paragraph boundaries.
- Preserve every blockquote marker (`>`) and its nesting depth. Obsidian
  callout markers such as `> [!note]` must stay inside the blockquote; do not
  turn quoted text into an ordinary paragraph or custom HTML card.
- Preserve heading levels, list markers and indentation, fenced code blocks,
  tables, math delimiters, image order, captions, and intentional inline HTML.
- Allowed transformations are limited to site frontmatter, routable internal
  links and asset paths, and corrections explicitly requested by the user.
- Match the destination folder and frontmatter conventions of adjacent notes,
  but do not rephrase, summarize, or reorder the note body.
- After an import, inspect the Markdown diff and run both
  `npm run check:note-format` and `npm run build`.

The site converts soft newlines inside all Markdown paragraphs—including
paragraphs in blockquotes and list items—into visible line breaks. Do not remove
those source newlines during import.

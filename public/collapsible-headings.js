const headingSelector = '.sl-markdown-content h1, .sl-markdown-content h2, .sl-markdown-content h3, .sl-markdown-content h4, .sl-markdown-content h5, .sl-markdown-content h6';

const addCjkLatinSpacing = (value) => {
  return value
    .replace(/([\p{Script=Han}])([A-Za-z0-9])/gu, '$1 $2')
    .replace(/([A-Za-z0-9])([\p{Script=Han}])/gu, '$1 $2');
};

const formatTableOfContents = () => {
  document.querySelectorAll('.right-sidebar-panel starlight-toc a span').forEach((label) => {
    label.textContent = addCjkLatinSpacing(label.textContent);
  });
};

const bindCollapsibleHeadings = () => {
  formatTableOfContents();
  const root = document.querySelector('.sl-markdown-content');
  if (!root || root.dataset.collapsibleHeadings === 'true') return;
  root.dataset.collapsibleHeadings = 'true';

  const headings = [...root.querySelectorAll(headingSelector)];
  headings.forEach((heading, index) => {
    if (heading.closest('[data-no-heading-collapse]')) return;

    const level = Number(heading.tagName.slice(1));
    const headingNode = heading.closest('.sl-heading-wrapper') || heading;
    const section = document.createElement('section');
    section.className = 'obsidian-heading-section';
    section.dataset.headingLevel = String(level);

    const body = document.createElement('div');
    body.className = 'obsidian-heading-body';

    headingNode.before(section);
    section.append(headingNode, body);

    let sibling = section.nextSibling;
    while (sibling) {
      const siblingHeading =
        sibling.nodeType === Node.ELEMENT_NODE
          ? sibling.matches?.('h1, h2, h3, h4, h5, h6')
            ? sibling
            : sibling.querySelector?.(':scope > h1, :scope > h2, :scope > h3, :scope > h4, :scope > h5, :scope > h6')
          : null;
      if (siblingHeading && Number(siblingHeading.tagName.slice(1)) <= level) {
        break;
      }
      const next = sibling.nextSibling;
      body.append(sibling);
      sibling = next;
    }

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'obsidian-heading-toggle';
    button.setAttribute('aria-expanded', 'true');
    button.setAttribute('aria-label', `收起“${heading.textContent.trim() || `标题 ${index + 1}`}”`);
    button.innerHTML = '<span aria-hidden="true">⌄</span>';
    heading.prepend(button);

    button.addEventListener('click', () => {
      const collapsed = section.classList.toggle('is-collapsed');
      button.setAttribute('aria-expanded', String(!collapsed));
      button.setAttribute(
        'aria-label',
        `${collapsed ? '展开' : '收起'}“${heading.textContent.trim()}”`
      );
    });
  });
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bindCollapsibleHeadings, { once: true });
} else {
  bindCollapsibleHeadings();
}

const mobileTableQuery = window.matchMedia('(max-width: 49.999rem)');

const prepareMobileTables = () => {
  if (!mobileTableQuery.matches) {
    document.querySelectorAll('.mobile-table-scroll').forEach((shell) => {
      const table = shell.querySelector(':scope > table');
      if (table) shell.replaceWith(table);
    });
    return;
  }

  document.querySelectorAll('.sl-markdown-content table').forEach((table) => {
    if (
      table.hasAttribute('style') ||
      table.closest('.mobile-table-scroll, .cs61c-replica-scroll') ||
      table.classList.contains('cs61c-replica-table')
    ) {
      return;
    }

    const columnCount = Math.max(
      1,
      ...Array.from(table.rows, (row) =>
        Array.from(row.cells).reduce((total, cell) => total + (cell.colSpan || 1), 0)
      )
    );
    const shell = document.createElement('div');
    const cue = document.createElement('div');

    shell.className = 'mobile-table-scroll';
    shell.dataset.columns = String(Math.min(columnCount, 6));
    shell.tabIndex = 0;
    shell.setAttribute('role', 'region');
    shell.setAttribute('aria-label', '可横向滚动的表格');

    cue.className = 'mobile-table-cue';
    cue.setAttribute('aria-hidden', 'true');
    cue.innerHTML = '<span>横向滑动查看完整表格</span><span>↔</span>';

    table.before(shell);
    shell.append(cue, table);
  });
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', prepareMobileTables, { once: true });
} else {
  prepareMobileTables();
}

document.addEventListener('astro:page-load', prepareMobileTables);
mobileTableQuery.addEventListener('change', prepareMobileTables);

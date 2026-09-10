// Progressive enhancement: links, papers, and disclosures also work without JS.
document.documentElement.classList.add('js');
const toggle = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#site-navigation');
if (toggle && navigation) {
  const closeMenu = () => {
    navigation.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
  };
  toggle.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') !== 'true';
    toggle.setAttribute('aria-expanded', String(open));
    navigation.classList.toggle('is-open', open);
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
      closeMenu();
      toggle.focus();
    }
  });
  const desktop = window.matchMedia('(min-width: 641px)');
  desktop.addEventListener('change', () => { if (desktop.matches) closeMenu(); });
}
const filters = document.querySelector('.publication-filters');
if (filters) {
  filters.hidden = false;
  const status = document.querySelector('.filter-status');
  const buttons = [...filters.querySelectorAll('button')];
  buttons.forEach(button => button.addEventListener('click', () => {
    buttons.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    let count = 0;
    document.querySelectorAll('.publication-group').forEach(group => {
      group.hidden = button.dataset.filter !== 'all' && group.dataset.category !== button.dataset.filter;
      if (!group.hidden) count += group.querySelectorAll('.publication').length;
    });
    status.textContent = `${count} ${count === 1 ? 'paper' : 'papers'} shown`;
    status.hidden = false;
  }));
}
document.querySelectorAll('.copy-button').forEach(button => {
  button.hidden = false;
  button.addEventListener('click', async () => {
    const citation = button.closest('.citation');
    const text = citation.querySelector('code').textContent;
    const status = citation.querySelector('.copy-status');
    try {
      if (!navigator.clipboard) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(text);
      status.textContent = 'Copied.';
    } catch {
      const selection = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(citation.querySelector('code'));
      selection.removeAllRanges();
      selection.addRange(range);
      status.textContent = 'Citation selected. Use your keyboard to copy.';
    }
  });
});

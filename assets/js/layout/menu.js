// Menu: the mobile dropdown (open / close, aria-expanded); closes after a link click,
// a click outside it or Escape.

export const initMenu = () => {
  const menu = document.querySelector('.header__menu');
  const nav = menu.querySelector('.header__menu-space');
  const toggle = menu.querySelector('.header__menu-toggle');
  const isOpen = () => menu.classList.contains('is-open');

  const open = () => {
    menu.classList.add('is-visible');
    setTimeout(() => {
      menu.classList.add('is-open');
    }, 50);
    toggle.setAttribute('aria-expanded', true);
  };

  const close = () => {
    menu.classList.remove('is-open');
    setTimeout(() => {
      menu.classList.remove('is-visible');
    }, 400);
    toggle.setAttribute('aria-expanded', false);
  };

  toggle.addEventListener('click', () => (isOpen() ? close() : open()));

  // After a link click
  menu.addEventListener('click', (e) => {
    if (e.target.closest('a') && isOpen()) close();
  });

  // Outside the dropdown
  document.addEventListener('click', (e) => {
    if (isOpen() && !nav.contains(e.target)) close();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen()) {
      close();
      toggle.focus();
    }
  });
};

// Menu: the mobile dropdown (open / close, aria-expanded), closes after a link click.

export const initMenu = () => {
  const menu = document.querySelector('.header__menu');
  const toggle = menu.querySelector('.header__menu-toggle');

  const open = () => {
    menu.classList.add('is-visible');
    setTimeout(() => {
      menu.classList.add('is-open');
    }, 50);
  };

  const close = () => {
    menu.classList.remove('is-open');
    setTimeout(() => {
      menu.classList.remove('is-visible');
    }, 400);
  };

  const onToggle = () => {
    const opening = !menu.classList.contains('is-open');
    opening ? open() : close();
    toggle.setAttribute('aria-expanded', opening);
  };
  toggle.addEventListener('click', onToggle);

  // Close the mobile menu after a link click
  menu.addEventListener('click', (e) => {
    if (e.target.closest('a') && menu.classList.contains('is-open')) {
      close();
      toggle.setAttribute('aria-expanded', false);
    }
  });
};

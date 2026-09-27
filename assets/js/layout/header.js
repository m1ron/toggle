// Header: the mobile menu and anchor navigation with a constant-speed scroll.

import { prefersReducedMotion } from '../core/env.js';

// Anchor scroll: ease in, steady speed, ease out
const NAV_SPEED = 1200;   // px/s
const NAV_EASE_IN = .6;   // s
const NAV_EASE_OUT = .9;  // s

// Trapezoid speed profile; a, b: ramp shares of the duration
const trapezoid = (a, b) => {
  const peak = 1 / (1 - (a + b) / 2);
  return (t) => {
    if (t < a) return peak * t * t / (2 * a);
    if (t <= 1 - b) return peak * (a / 2 + t - a);
    return 1 - peak * (1 - t) ** 2 / (2 * b);
  };
};

export const initAnchors = (lenis) => {
  let navigating = false;
  let activeLink = null;
  let endTimer;

  const finish = () => {
    navigating = false;
    clearTimeout(endTimer);
    document.body.classList.remove('is-navigating');
    if (activeLink) {
      activeLink.classList.remove('is-active');
      activeLink.blur(); // :focus looks the same as :hover
      activeLink = null;
    }
    window.removeEventListener('wheel', finish);
    window.removeEventListener('touchstart', finish);
  };

  // `link` keeps its hover look on the way
  const navigate = (hash, link = document.querySelector(`.header__menu-nav a[href="${hash}"]`)) => {
    const target = hash.length > 1 && document.getElementById(hash.slice(1));
    // One scroll at a time
    if (!target || navigating) return;

    const distance = Math.abs(target.getBoundingClientRect().top);
    // Short hops: triangle profile
    const ramps = NAV_EASE_IN + NAV_EASE_OUT;
    const duration = Math.max(distance / NAV_SPEED + ramps / 2, ramps);

    navigating = true;
    document.body.classList.add('is-navigating');
    activeLink = link;
    link?.classList.add('is-active');
    // Wheel / touch interrupts it
    window.addEventListener('wheel', finish, { passive: true });
    window.addEventListener('touchstart', finish, { passive: true });
    endTimer = setTimeout(finish, (duration + .2) * 1000); // if onComplete never fires

    lenis.scrollTo(target, {
      duration,
      easing: trapezoid(NAV_EASE_IN / duration, NAV_EASE_OUT / duration),
      immediate: prefersReducedMotion,
      onComplete: finish,
    });
    history.pushState(null, '', hash);
  };

  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href^="#"]');
    if (!link || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

    const hash = link.getAttribute('href');
    if (hash.length < 2 || !document.getElementById(hash.slice(1))) return;

    e.preventDefault();
    navigate(hash, link);
  });

  return navigate;
};

export const initMenu = () => {
  const menu = document.querySelector('.header__menu');
  const toggle = menu.querySelector('.header__menu-toggle');

  const open = () => {
    menu.classList.add('visible');
    setTimeout(() => {
      menu.classList.add('active');
    }, 50);
  };

  const close = () => {
    menu.classList.remove('active');
    setTimeout(() => {
      menu.classList.remove('visible');
    }, 400);
  };

  const onToggle = () => {
    const opening = !menu.classList.contains('active');
    opening ? open() : close();
    toggle.setAttribute('aria-expanded', opening);
  };
  toggle.addEventListener('click', onToggle);

  // Close the mobile menu after a link click
  menu.addEventListener('click', (e) => {
    if (e.target.closest('a') && menu.classList.contains('active')) {
      close();
      toggle.setAttribute('aria-expanded', false);
    }
  });
};

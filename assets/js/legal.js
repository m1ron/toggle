// Entry for the legal pages: smooth scroll with the contents links, the mobile menu,
// starry background, email links. No GSAP here.

import Lenis from 'lenis';

import { prefersReducedMotion } from './core/env.js';
import { initMenu } from './layout/menu.js';
import { initStars } from './layout/stars.js';

const lenis = new Lenis({
  duration: 1.8,
  wheelMultiplier: .85,
  smoothWheel: !prefersReducedMotion,
  // Contents links; the gap under the fixed header comes from scroll-margin-top
  anchors: { immediate: prefersReducedMotion },
});
const raf = (time) => {
  lenis.raf(time);
  requestAnimationFrame(raf);
};
requestAnimationFrame(raf);

initMenu();
initStars(lenis);

// Shade under the header once the text scrolls beneath it
const page = document.querySelector('.legal');
const onScroll = ({ scroll }) => page.classList.toggle('is-scrolled', scroll > 40);
onScroll(lenis);
lenis.on('scroll', onScroll);

// Spam protection, as on the home page: addresses are decoded here
for (const link of document.querySelectorAll('[data-email]')) {
  const email = atob(link.dataset.email);
  link.href = `mailto:${email}`;
  link.textContent = email;
}

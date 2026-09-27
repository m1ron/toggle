// Entry for the subpages (legal pages, 404): smooth scroll with the contents links,
// starry background, email links. No GSAP, no menu: the header has the logo only.

import Lenis from 'lenis';

import { prefersReducedMotion } from './core/env.js';
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

initStars(lenis);

// Shade under the header once the text scrolls beneath it
const page = document.querySelector('.legal');
if (page) {
  const onScroll = ({ scroll }) => page.classList.toggle('is-scrolled', scroll > 40);
  onScroll(lenis);
  lenis.on('scroll', onScroll);
}

// Spam protection, as on the home page: addresses are decoded here
for (const link of document.querySelectorAll('[data-email]')) {
  const email = atob(link.dataset.email);
  link.href = `mailto:${email}`;
  link.textContent = email;
}

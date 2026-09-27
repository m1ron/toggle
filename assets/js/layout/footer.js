// Footer: fixed under the page and uncovered at the end (tablet and up); tabbing into it scrolls it into view.

import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { doc, prefersReducedMotion } from '../core/env.js';
import { onWidthResize } from '../core/utils.js';

// md breakpoint: phones keep a regular footer
const tablet = window.matchMedia('(min-width: 768px)');

// Fixed under the page and uncovered at the end, if it fits the screen
export const initFooter = (lenis) => {
  const footer = document.querySelector('.footer');
  // Tabbing into the hidden footer scrolls to the bottom
  footer.addEventListener('focusin', () => {
    if (document.body.classList.contains('has-fixed-footer')) lenis.scrollTo(lenis.limit, { immediate: prefersReducedMotion });
  });
  const update = () => {
    document.body.classList.toggle('has-fixed-footer', tablet.matches && footer.offsetHeight <= window.innerHeight);
    doc.style.setProperty('--footer-height', `${footer.offsetHeight}px`);
  };
  update();
  onWidthResize(() => {
    update();
    ScrollTrigger.refresh();
  });
};

// Footer: fixed under the page and uncovered at the end; tabbing into it scrolls it into view.

import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { doc, prefersReducedMotion } from '../core/env.js';
import { onWidthResize } from '../core/utils.js';

// Fixed under the page and uncovered at the end, if it fits the screen
export const initFooter = (lenis) => {
  const footer = document.querySelector('.footer');
  // Tabbing into the hidden footer scrolls to the bottom
  footer.addEventListener('focusin', () => {
    if (document.body.classList.contains('footer-reveal')) lenis.scrollTo(lenis.limit, { immediate: prefersReducedMotion });
  });
  const update = () => {
    document.body.classList.toggle('footer-reveal', footer.offsetHeight <= window.innerHeight);
    doc.style.setProperty('--footer-height', `${footer.offsetHeight}px`);
  };
  update();
  onWidthResize(() => {
    update();
    ScrollTrigger.refresh();
  });
};

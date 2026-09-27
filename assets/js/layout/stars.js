// Starry background: a fixed layer that scrolls slower than the page.

import { prefersReducedMotion } from '../core/env.js';

// stars.svg tile height, = $stars-tile
const STARS_TILE = 1441;

// Starry background, slower than the page
export const initStars = (lenis) => {
  if (prefersReducedMotion) return;
  const layer = document.querySelector('.stars__layer');
  const speed = .15;
  const onScroll = ({ scroll }) => {
    // Shifted within one tile: seamless
    layer.style.transform = `translate3d(0, ${-(scroll * speed % STARS_TILE)}px, 0)`;
  };
  onScroll(lenis);
  lenis.on('scroll', onScroll);
};

// Join: card reveal and glow parallax.

import { parallax, reveal } from '../core/motion.js';

export const initJoin = () => {
  // The glow only sinks, so no gap opens at the bottom
  parallax('.join', '--join-parallax', '25px', '0px', { trigger: '.join', start: 'top bottom', end: 'bottom top' });

  reveal(document.querySelector('.join'));
};

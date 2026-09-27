// About: stat cards and text reveal line by line, background glow parallax.

import { onWidthResize } from '../core/utils.js';
import { parallax, reveal } from '../core/motion.js';
import { splitToLines } from '../core/text.js';

export const initAbout = () => {
  const about = document.querySelector('.about');
  const p = about.querySelector('.about__text');

  splitToLines(p, 'about__line');
  onWidthResize(() => splitToLines(p, 'about__line'));

  // Background glow (::before)
  parallax(about.querySelector('.about__glow'), '--about-parallax', '0px', '100px', { trigger: about, start: 'top bottom', end: 'bottom top' });

  reveal(about);
};

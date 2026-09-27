// Team: text reveal and avatar orbits, paused while off screen.

import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { onWidthResize } from '../core/utils.js';
import { reveal } from '../core/motion.js';
import { splitToLines } from '../core/text.js';

export const initTeam = () => {
  const team = document.querySelector('.team');
  const p = team.querySelector('.team__text');

  // Orbits pause offscreen
  ScrollTrigger.create({
    trigger: '.team',
    start: 'top bottom',
    end: 'bottom top',
    onToggle: self => team.classList.toggle('offscreen', !self.isActive)
  });

  reveal(team);

  splitToLines(p);
  onWidthResize(() => splitToLines(p));
};

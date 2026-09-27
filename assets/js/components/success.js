// Success: pinned section, letters light up with the scroll, artwork drift.

import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { parallax, reveal, softPin, SOFT_PIN_SHIFT } from '../core/motion.js';
import { splitToLetters } from '../core/text.js';

export const initSuccess = () => {
  const success = document.querySelector('.success');
  const title = success.querySelector('.success__title');

  splitToLetters(title, 'success__letter');
  const letters = title.querySelectorAll('.success__letter');
  let lit = 0;

  reveal(success);

  const animation = success.querySelector('.success__animation');

  const pin = softPin(success, '150% top', { content: [title, animation] });

  // Artwork drift while pinned
  parallax(animation, '--success-drift', '20px', '-20px', { start: () => pin.start, end: () => pin.end });

  // Letters light up while pinned; range from the pin (a trigger on it would be pushed past it)
  ScrollTrigger.create({
    start: () => pin.start + SOFT_PIN_SHIFT,
    end: () => pin.start + SOFT_PIN_SHIFT + success.offsetHeight * 1.475,
    // One letter per percent of progress; only the letters that change are touched
    onUpdate: self => {
      const count = Math.min(Math.floor(self.progress * 100), letters.length);
      for (let i = Math.min(lit, count); i < Math.max(lit, count); i++) letters[i].classList.toggle('is-lit', i < count);
      lit = count;
    }
  });
};

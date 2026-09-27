// Success: pinned section, letters light up with the scroll, artwork drift.

import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { parallax, reveal, softPin, SOFT_PIN_SHIFT } from '../core/motion.js';
import { splitToLetters } from '../core/text.js';

export const initSuccess = () => {
  const success = document.querySelector('.success');
  const title = success.querySelector('.success__title');

  splitToLetters(title);

  reveal(success);

  const pin = softPin(success, '150% top');

  // Artwork drift while pinned
  parallax(success, '--success-drift', '20px', '-20px', { start: () => pin.start, end: () => pin.end });

  // Letters light up while pinned; range from the pin (a trigger on it would be pushed past it)
  ScrollTrigger.create({
    start: () => pin.start + SOFT_PIN_SHIFT,
    end: () => pin.start + SOFT_PIN_SHIFT + success.offsetHeight * 1.475,
    onUpdate: self => {
      title.setAttribute('data-progress', Math.floor(self.progress * 100));
    }
  });
};

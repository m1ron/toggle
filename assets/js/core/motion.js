// Shared scroll animation helpers: section reveal, scrubbed CSS-variable parallax
// and soft pins with eased entry and exit.

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { prefersReducedMotion } from './env.js';

// Parallax lag behind the scroll, s
export const PARALLAX_SCRUB = .8;

const REVEAL_START = 'top 75%';

// Adds .animated (CSS entrance) when the section enters the lower quarter of the viewport
export const reveal = (section, onEnter) => ScrollTrigger.create({
  trigger: section,
  start: REVEAL_START,
  onEnter: () => {
    section.classList.add('animated');
    onEnter?.();
  },
});

// Scroll-linked CSS variable; off for reduced motion
export const parallax = (target, prop, from, to, scrollTrigger) => {
  if (prefersReducedMotion) return;
  gsap.fromTo(target, { [prop]: from }, {
    [prop]: to,
    ease: 'none',
    scrollTrigger: { ...scrollTrigger, scrub: PARALLAX_SCRUB },
  });
};

// Pin with eased entry and exit instead of a dead stop; CSS applies the shift (--pin-shift)
export const SOFT_PIN_SHIFT = prefersReducedMotion ? 0 : 140; // px the content travels during each ramp

// reparent: for pins inside a pinned element (`content` then carries the shift); property: lets nested shifts add up
export const softPin = (section, end, {
  anchor = 'top', start, shift: shiftOption = SOFT_PIN_SHIFT, reparent = false, content = section, property = '--pin-shift',
} = {}) => {
  const shift = prefersReducedMotion ? 0 : shiftOption;
  // 2 × shift: a power1 ramp then meets the scroll speed exactly
  const ramp = shift * 2;

  // Pull the next section up; before the pin, which moves margins onto the spacer
  if (shift) section.style.marginBottom = `${-2 * shift}px`;

  const pin = ScrollTrigger.create({
    trigger: section,
    start: start ? start(shift) : anchor === 'center' ? `center center+=${shift}` : `top ${shift}px`,
    end,
    pin: true,
    pinReparent: reparent,
  });
  if (!shift) return pin; // reduced motion: a plain pin

  gsap.fromTo(content, { [property]: '0px' }, {
    [property]: `${-shift}px`,
    ease: 'power1.out',
    scrollTrigger: { start: () => pin.start, end: () => pin.start + ramp, scrub: true },
  });
  gsap.fromTo(content, { [property]: `${-shift}px` }, {
    [property]: `${-2 * shift}px`,
    ease: 'power1.in',
    immediateRender: false,
    scrollTrigger: { start: () => pin.end - ramp, end: () => pin.end, scrub: true },
  });

  return pin;
};

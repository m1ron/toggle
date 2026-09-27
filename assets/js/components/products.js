// Products: the heading pins and greys out while its title copy flies onto
// the app screenshots; then the section pins.

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { prefersReducedMotion } from '../core/env.js';
import { parallax, reveal, softPin } from '../core/motion.js';

export const initProducts = () => {
  const products = document.querySelector('.products');
  const heading = products.querySelector('.products__heading');
  const paragraph = heading.querySelector('p');
  const title = products.querySelector('.products__title');
  const dupe = title.children[0];
  const animation = products.querySelector('.products__animation');

  // Heading pin length (text greys out)
  const HEADING_PIN = () => window.innerHeight * 1.45;
  const HEADING_SHIFT = 80; // soft pin ramps for the heading

  let offsetX = 0, offsetY = 0, flight = 0;
  const scale = 2.25;

  // Offset through any offsetParent (the paragraph's transform makes it one)
  const topWithin = (el, ancestor) => {
    let top = 0;
    for (let e = el; e && e !== ancestor; e = e.offsetParent) top += e.offsetTop;
    return top;
  };

  // Flight target: centred over the screenshots
  const calculateOffsets = () => {
    offsetX = 0;
    if (window.innerWidth >= 540) {
      offsetX = (window.innerWidth - dupe.clientWidth * scale) / 2 - dupe.getBoundingClientRect().left;
    }
    const titleTop = topWithin(title, heading);
    const m = parseFloat(window.getComputedStyle(animation).marginTop);
    const toAnimationCentre = (heading.clientHeight - titleTop) + animation.clientHeight * .5 + m;
    offsetY = toAnimationCentre - title.clientHeight * scale / 2;
    // Flight scroll distance
    flight = toAnimationCentre - (paragraph.offsetHeight / 2 - (titleTop - paragraph.offsetTop));
  };

  const adjustTitle = () => {
    let span = document.createElement('span');
    let text = document.createTextNode(dupe.innerText);
    span.classList.add('products__duplicate');
    span.appendChild(text);
    dupe.append(span);
  };

  adjustTitle();
  calculateOffsets();
  // Before every refresh, resize included
  ScrollTrigger.addEventListener('refreshInit', calculateOffsets);

  reveal(products);

  // 1. Heading pins and greys out. Reparented: the later .products pin would break a nested one
  const headingPin = softPin(heading, () => `+=${HEADING_PIN()}`, {
    anchor: 'center', shift: HEADING_SHIFT, reparent: true, content: paragraph,
  });
  const headingShift = prefersReducedMotion ? 0 : HEADING_SHIFT;

  // Fades out by halfway to the top
  gsap.fromTo(paragraph, { color: 'rgba(255, 255, 255, 1)' }, {
    color: 'rgba(255, 255, 255, 0)',
    ease: 'none',
    scrollTrigger: {
      start: () => headingPin.start,
      end: () => headingPin.end + window.innerHeight * .25 - headingShift,
      scrub: true,
    },
  });

  // 2. The copy flies to the screenshots
  const LANDING = () => window.innerHeight * .6; // flight while the section is pinned
  const HOLD = () => window.innerHeight * .1;    // pause after landing
  const screensCentred = () => headingPin.end + flight - headingShift;

  gsap.to('.products__duplicate', {
    scrollTrigger: {
      start: () => headingPin.end,
      end: () => screensCentred() + LANDING(),
      scrub: true,
      invalidateOnRefresh: true,
    },
    color: 'rgba(255, 255, 255, .3)',
    scale: scale,
    x: () => offsetX,
    y: () => offsetY,
    ease: 'power1.inOut',
  });

  // 3. Section pin; own variable, added to the heading's --pin-shift
  const PRODUCTS_SHIFT = 80;
  const productsShift = prefersReducedMotion ? 0 : PRODUCTS_SHIFT;
  softPin(products, () => screensCentred() + productsShift * 3 + LANDING() + HOLD(), {
    start: shift => () => screensCentred() - shift,
    shift: PRODUCTS_SHIFT,
    property: '--products-pin-shift',
  });

  // Screenshots; explicit range: triggers inside a pin miss its length
  parallax(animation, '--screens-parallax', '15px', '-15px', {
    start: () => screensCentred() - (window.innerHeight + animation.offsetHeight) / 2,
    end: () => screensCentred() + productsShift + LANDING() + HOLD() + (window.innerHeight + animation.offsetHeight) / 2,
  });
};

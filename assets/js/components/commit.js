// Commit: pinned card stack that switches cards with the scroll, progress bar.

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { reveal, softPin } from '../core/motion.js';

// ms, = $card-switch
const CARD_SWITCH = 400;
// Cards pass each other (`ease` at 50%)
const CARD_CROSS = CARD_SWITCH * .293;

export const initCommit = () => {
  const commit = document.querySelector('.commit');
  const cards = commit.querySelector('.cards');
  const cardEls = [...cards.querySelectorAll('.cards__card')];
  let current = 0;
  let swapTimer;

  // z-order: front, middle, the rest behind
  const setDepth = (front, middle) => cardEls.forEach((el, i) => {
    el.style.zIndex = i + 1 === front ? 3 : i + 1 === middle ? 2 : 1;
  });

  // The outgoing card stays in front until CARD_CROSS
  const setCard = (n) => {
    if (n === current) return;
    const previous = current;
    current = n;
    cards.setAttribute('data-card', n);
    clearTimeout(swapTimer);
    if (!previous) return setDepth(n, 0);
    setDepth(previous, n);
    swapTimer = setTimeout(() => setDepth(n, previous), CARD_CROSS);
  };

  reveal(commit, () => {
    cards.classList.add('is-revealed');
    setCard(1);
    setTimeout(() => cards.setAttribute('data-loading', false), CARD_SWITCH);
  });

  ScrollTrigger.create({
    trigger: '.commit',
    start: '30% top',
    end: '130% top',
    onEnter: () => setCard(2),
    onLeaveBack: () => setCard(1)
  });

  ScrollTrigger.create({
    trigger: '.commit',
    start: '130% top',
    end: '200% top',
    onEnter: () => setCard(3),
    onLeaveBack: () => setCard(2)
  });

  // The shift goes on the elements that use it
  const pin = softPin(commit, '200% top', { content: [commit.querySelector('.commit__content'), commit.querySelector('.commit__dots')] });

  // Progress bar over the pin
  gsap.fromTo(cards.querySelector('.cards__fill'), { '--cards-progress': 0 }, {
    '--cards-progress': 1,
    ease: 'none',
    scrollTrigger: { start: () => pin.start, end: () => pin.end, scrub: true },
  });
};

// Hero: logo video, content parallax, unlocks the page after the intro.

import gsap from 'gsap';
import { doc, isMobile, prefersReducedMotion } from '../core/env.js';
import { PARALLAX_SCRUB } from '../core/motion.js';

export const initHero = () => {
  const hero = document.querySelector('.hero');
  const logo = hero.querySelector('.hero__logo');
  const video = logo.querySelector('video');

  // The video may already be playing
  const showLogo = () => logo.classList.add('loaded');
  if (!video.paused) showLogo();
  else video.addEventListener('play', showLogo, { once: true });

  const onResize = () => {
    doc.style.setProperty('--page-height', `${window.innerHeight}px`);
  }

  if (!isMobile) {
    onResize();
    window.addEventListener('resize', onResize);
  }

  // Content lags slightly behind
  if (!prefersReducedMotion) gsap.to('.hero__content', {
    y: () => hero.offsetHeight * .12,
    ease: 'none',
    scrollTrigger: {
      trigger: hero,
      start: 'top top',
      end: 'bottom top',
      scrub: PARALLAX_SCRUB,
      invalidateOnRefresh: true,
    },
  });

  document.body.classList.add('inited');
  document.body.classList.remove('locked');
};

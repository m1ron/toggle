// Entry point: smooth scroll (Lenis on the GSAP ticker) and the init order of all blocks.

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

import './core/start.js'; // first: GSAP setup, scroll reset, deep link
import { isMobile, prefersReducedMotion } from './core/env.js';
import { initLoader } from './layout/loader.js';
import { initStars } from './layout/stars.js';
import { initAnchors } from './layout/anchors.js';
import { initMenu } from './layout/menu.js';
import { initFooter } from './layout/footer.js';
import { initHero } from './components/hero.js';
import { initAbout } from './components/about.js';
import { initSuccess } from './components/success.js';
import { initCommit } from './components/commit.js';
import { initProducts } from './components/products.js';
import { initTeam } from './components/team.js';
import { initJoin } from './components/join.js';
import { initContacts } from './components/contacts.js';

// Order matters: each pin shifts the triggers created after it
function initApp() {
  if (isMobile) {
    document.body.classList.add('is-mobile');
  }

  // On the GSAP ticker: scroll and ScrollTrigger update in the same frame. Native wheel for reduced motion
  const lenis = new Lenis({
    duration: 1.8,
    wheelMultiplier: .85,
    smoothWheel: !prefersReducedMotion,
  });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  initFooter(lenis); // changes the page height, so before any ScrollTrigger is measured
  initStars(lenis);
  const navigate = initAnchors(lenis);
  initMenu();
  initHero();
  initAbout();
  initSuccess();
  initCommit();
  initProducts();
  initTeam();
  initJoin();
  initContacts();

  return { navigate };
}

document.addEventListener('DOMContentLoaded', () => {
  initLoader(initApp);
});

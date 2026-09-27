// Environment: GSAP setup, scroll reset with deep-link capture,
// the mobile and reduced-motion flags.

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Always open at the top; a deep link is scrolled to after the intro
ScrollTrigger.clearScrollMemory('manual');
export const initialHash = location.hash;
if (initialHash) history.replaceState(null, '', location.pathname + location.search);
window.scrollTo(0, 0);

export const doc = document.documentElement;
export const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  // iPadOS 13+ reports itself as a Mac
  || (/Macintosh/.test(navigator.userAgent) && navigator.maxTouchPoints > 1);

export const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

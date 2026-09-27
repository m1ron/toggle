// Home page start: GSAP setup, always open at the top, capture a deep link
// (scrolled to after the intro, see loader.js).

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Set through ScrollTrigger, which otherwise restores its remembered 'auto'
ScrollTrigger.clearScrollMemory('manual');
export const initialHash = location.hash;
if (initialHash) history.replaceState(null, '', location.pathname + location.search);
window.scrollTo(0, 0);

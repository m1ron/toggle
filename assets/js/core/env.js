// Environment flags: the root element, touch devices, reduced motion. No side effects,
// so the legal pages can use it too.

export const doc = document.documentElement;
export const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  // iPadOS 13+ reports itself as a Mac
  || (/Macintosh/.test(navigator.userAgent) && navigator.maxTouchPoints > 1);

export const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

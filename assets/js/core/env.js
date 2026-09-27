// Environment flags: the root element, reduced motion. No side effects, so the legal pages can use it too.

export const doc = document.documentElement;

export const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

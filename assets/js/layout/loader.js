// Loader: waits for fonts and first-screen images, shows progress,
// then builds the page underneath and fades it in.

import gsap from 'gsap';
import { doc, initialHash, prefersReducedMotion } from '../core/env.js';
import { wait } from '../core/utils.js';

// Keeps decoded images from being garbage collected
const preloadedImages = [];

// Minimum fill time, s
const LOADER_MIN_DURATION = prefersReducedMotion ? .3 : 1.6;

// Show the site anyway if requests stall, ms
const LOADER_TIMEOUT = 10000;

// `start` (initApp) builds the page under the loader and returns { navigate }
export const initLoader = (start) => {
  const loader = document.querySelector('.loader');
  const percent = loader.querySelector('.loader__percent');
  const bar = loader.querySelector('.loader__progress div');

  // Backgrounds in use at this viewport and eager <img>s
  const getImageUrls = () => {
    const urls = new Set();
    for (const el of document.querySelectorAll('body *')) {
      for (const pseudo of [null, '::before', '::after']) {
        // image-set(): the first (AVIF) candidate only
        const value = getComputedStyle(el, pseudo).backgroundImage.replace(/image-set\((url\("[^"]+"\))[^()]*(?:\([^()]*\)[^()]*)*\)/g, '$1');
        for (const [, url] of value.matchAll(/url\("([^"]+)"\)/g)) {
          if (!url.startsWith('data:')) urls.add(url);
        }
      }
    }
    for (const img of document.querySelectorAll('img:not([loading="lazy"])')) {
      urls.add(img.currentSrc || img.src); // the <picture> source picked for this screen
    }
    return [...urls];
  };

  // Decode up front, not mid-scroll (max 1s: decode() can stall)
  const loadImage = (src) => new Promise((resolve) => {
    const image = new Image();
    image.onload = () => {
      image.decode().then(resolve, resolve);
      setTimeout(resolve, 1000);
    };
    image.onerror = image.onabort = resolve;
    image.src = src;
    preloadedImages.push(image);
  });

  // Wait for the first screen only, then release the deferred artwork
  const critical = getImageUrls();
  let loaded = 0; // share of settled critical images, 0..1
  let restStarted = false;
  const loadRest = () => {
    if (restStarted) return;
    restStarted = true;
    doc.classList.remove('defer-bg');
    requestAnimationFrame(() => getImageUrls().filter(src => !critical.includes(src)).forEach(loadImage));
  };
  Promise.all(critical.map(src => loadImage(src).then(() => {
    loaded += 1 / critical.length;
  }))).then(loadRest);
  setTimeout(() => {
    loaded = 1;
    loadRest();
  }, LOADER_TIMEOUT);

  // Hide the loader, then fade the page in
  const finish = async () => {
    window.scrollTo(0, 0);
    const { navigate } = start();
    await wait(300);
    loader.classList.add('done');
    await wait(600);
    loader.classList.add('hidden');
    document.body.classList.remove('loading');
    document.body.classList.add('revealing');
    // Longest hero entrance + margin
    await wait(600 + 1800 + 200);
    document.body.classList.remove('revealing');

    // Deep link: scroll there like a menu click
    if (initialHash) navigate(initialHash);
  };

  // Shown progress follows the real one, no faster than LOADER_MIN_DURATION
  const ease = gsap.parseEase('power1.inOut');
  let startTime = null;
  let shown = 0;
  let shownPercent = -1;

  const tick = (time, deltaTime) => {
    startTime ??= time;
    const timeLimit = ease(Math.min((time - startTime) / LOADER_MIN_DURATION, 1));
    const target = Math.min(loaded > .999 ? 1 : loaded, timeLimit);

    // Frame-rate independent easing
    shown += (target - shown) * (1 - Math.pow(.85, deltaTime / 16.67));
    if (target - shown < .002) shown = target;

    bar.style.transform = `scaleX(${shown})`;
    const p = Math.round(shown * 100);
    if (p !== shownPercent) {
      shownPercent = p;
      percent.innerText = p + '%';
    }

    if (shown === 1) {
      gsap.ticker.remove(tick);
      finish();
    }
  };
  gsap.ticker.add(tick);
};

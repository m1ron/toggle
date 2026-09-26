import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

const doc = document.documentElement;
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  // iPadOS 13+ reports itself as a Mac
  || (/Macintosh/.test(navigator.userAgent) && navigator.maxTouchPoints > 1);

// Users who asked the OS for less motion get no parallax, no soft pins and a short intro
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Repeat visits get a shorter intro (the flag lives in this browser only)
const isRepeatVisit = (() => {
  try {
    const visited = localStorage.getItem('toggle-visited') === '1';
    localStorage.setItem('toggle-visited', '1');
    return visited;
  } catch {
    return false;
  }
})();

// Section entrances start when the section top passes the lower quarter of the viewport
const REVEAL_START = 'top 75%';

const debounce = (fn, delay = 150) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
};

// Fires only when the viewport width changes (ignores mobile address bar show/hide)
const onWidthResize = (fn) => {
  let width = window.innerWidth;
  window.addEventListener('resize', debounce(() => {
    if (window.innerWidth === width) return;
    width = window.innerWidth;
    fn();
  }));
};

// Keeps preloaded images alive so their decoded bitmaps are not garbage collected
const preloadedImages = [];

// Minimum time the progress bar takes to fill, so the loader is visible even on fast connections
const LOADER_MIN_DURATION = prefersReducedMotion ? .3 : isRepeatVisit ? .6 : 1.6; // s

// Safety net for stalled requests (e.g. a bad mobile connection): show the site anyway
const LOADER_TIMEOUT = 10000; // ms

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const initLoader = () => {
  const loader = document.querySelector('.loader');
  const percent = loader.querySelector('.loader__percent');
  const bar = loader.querySelector('.loader__progress div');

  // Everything the page shows at the current viewport size: CSS backgrounds
  // (resolved through media queries, so phones get the mobile variants) and eager <img>s
  const getImageUrls = () => {
    const urls = new Set();
    for (const el of document.querySelectorAll('body *')) {
      for (const pseudo of [null, '::before', '::after']) {
        for (const [, url] of getComputedStyle(el, pseudo).backgroundImage.matchAll(/url\("([^"]+)"\)/g)) {
          if (!url.startsWith('data:')) urls.add(url);
        }
      }
    }
    for (const img of document.querySelectorAll('img:not([loading="lazy"])')) {
      urls.add(img.src);
    }
    return [...urls];
  };

  // Download and decode up front, so sections don't decode big bitmaps mid-scroll.
  // decode() can stall (e.g. in a background tab), so don't wait for it longer than a second.
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

  const images = getImageUrls();
  let loaded = 0; // share of settled images, 0..1
  images.forEach(src => loadImage(src).then(() => {
    loaded += 1 / images.length;
  }));
  // Treat loading as complete after the timeout: the bar eases to 100% and the page shows as usual
  setTimeout(() => {
    loaded = 1;
  }, LOADER_TIMEOUT);

  // Hide the loader, then fade the page in
  const finish = async () => {
    initApp(); // runs while the loader still covers the page
    document.body.classList.toggle('revisit', isRepeatVisit);
    await wait(isRepeatVisit ? 150 : 300);
    loader.classList.add('done');
    await wait(600);
    loader.classList.add('hidden');
    document.body.classList.remove('loading');
    document.body.classList.add('revealing');
    // Longest hero entrance: button delay + $duration-intro (see hero.scss), plus a margin
    await wait((isRepeatVisit ? 400 : 600) + 1600 + 200);
    document.body.classList.remove('revealing');
  };

  // The displayed progress follows the real one, but never faster than LOADER_MIN_DURATION allows
  const ease = gsap.parseEase('power1.inOut');
  let startTime = null;
  let shown = 0;
  let shownPercent = -1;

  const tick = (time, deltaTime) => {
    startTime ??= time;
    const timeLimit = ease(Math.min((time - startTime) / LOADER_MIN_DURATION, 1));
    const target = Math.min(loaded > .999 ? 1 : loaded, timeLimit);

    // Frame rate independent easing towards the target
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

// Wraps every character of the text into its own span
const wrapChars = (el, text) => {
  const spans = text.split('').map((char) => {
    const span = document.createElement('span');
    span.textContent = char;
    return span;
  });
  el.replaceChildren(...spans);
  return spans;
};

const splitToLines = (el) => {
  if (!el.dataset.text) {
    el.dataset.text = el.innerText;
  }
  const text = el.dataset.text;
  const spans = wrapChars(el, text);

  const lines = [];
  let begin = 0;
  let top = spans[0].offsetTop;
  spans.forEach((span, i) => {
    if (span.offsetTop > top) {
      lines.push(text.substring(begin, i));
      begin = i;
      top = span.offsetTop;
    }
  });
  lines.push(text.substring(begin));

  el.replaceChildren(...lines.map(line => line.trim()).filter(Boolean).map((line) => {
    const div = document.createElement('div');
    div.textContent = line;
    return div;
  }));
};

const splitToLetters = (el) => {
  wrapChars(el, el.innerText);
};

// Height of the stars.svg tile (keep in sync with $stars-tile in _var.scss)
const STARS_TILE = 1441;

const initParallax = (lenis) => {
  if (prefersReducedMotion) return;
  const layer = document.querySelector('.stars__layer');
  const speed = .15;
  const onScroll = ({ scroll }) => {
    // The layer is fixed to the viewport; shift it within one tile so the pattern stays seamless
    layer.style.transform = `translate3d(0, ${-(scroll * speed % STARS_TILE)}px, 0)`;
  };
  onScroll(lenis);
  lenis.on('scroll', onScroll);
};

// Smooth scroll to in-page anchors via Lenis
const initAnchors = (lenis) => {
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href^="#"]');
    if (!link || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

    const hash = link.getAttribute('href');
    const target = hash.length > 1 && document.getElementById(hash.slice(1));
    if (!target) return;

    e.preventDefault();
    // Long jumps need a gentle start as well as a soft stop, and more time the further they go
    const distance = Math.abs(target.getBoundingClientRect().top);
    lenis.scrollTo(target, {
      duration: Math.min(1.4 + distance / 3500, 3),
      easing: t => t < .5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2, // easeInOutCubic
      immediate: prefersReducedMotion,
    });
    history.pushState(null, '', hash);
  });
};

const initMenu = () => {
  const menu = document.querySelector('.header__menu');
  const toggle = menu.querySelector('.header__menu-toggle');

  const open = () => {
    menu.classList.add('visible');
    setTimeout(() => {
      menu.classList.add('active');
    }, 50);
  };

  const close = () => {
    menu.classList.remove('active');
    setTimeout(() => {
      menu.classList.remove('visible');
    }, 400);
  };

  toggle.addEventListener('click', () => {
    menu.classList.contains('active') ? close() : open();
  });

  // Close the mobile menu after navigating to a section
  menu.addEventListener('click', (e) => {
    if (e.target.closest('a') && menu.classList.contains('active')) {
      close();
    }
  });
};

const initHero = () => {
  const hero = document.querySelector('.hero');
  const logo = hero.querySelector('.hero__logo');
  const video = logo.querySelector('video');

  video.addEventListener('play', () => {
    logo.classList.add('loaded');
  });

  const onResize = () => {
    doc.style.setProperty('--page-height', `${window.innerHeight}px`);
  }

  if (!isMobile) {
    onResize();
    window.addEventListener('resize', onResize);
  }

  // Barely-there parallax: the content lags slightly behind while the hero scrolls away
  if (!prefersReducedMotion) gsap.to('.hero__content', {
    y: () => hero.offsetHeight * .12,
    ease: 'none',
    scrollTrigger: {
      trigger: hero,
      start: 'top top',
      end: 'bottom top',
      scrub: true,
      invalidateOnRefresh: true,
    },
  });

  document.body.classList.add('inited');
  document.body.classList.remove('locked');
};

const initAbout = () => {
  const about = document.querySelector('.about');
  const p = about.querySelector('.about__text');

  splitToLines(p);
  onWidthResize(() => splitToLines(p));

  // Barely-there parallax for the background glow (::before), starts from its design position
  if (!prefersReducedMotion) gsap.to(about, {
    '--about-parallax': '100px',
    ease: 'none',
    scrollTrigger: {
      trigger: about,
      start: 'top bottom',
      end: 'bottom top',
      scrub: true,
    },
  });

  ScrollTrigger.create({
    trigger: '.about',
    start: REVEAL_START,
    onEnter: () => {
      about.classList.add('animated');
      setTimeout(() => {
        about.classList.add('done')
      }, 1000);
    }
  });
}

// Pin with eased entry and exit: instead of stopping dead, the section content keeps moving
// and decelerates into place (and later accelerates out) over a short stretch of scroll.
// The content is shifted through the --pin-shift variable (see .success / .commit styles).
const SOFT_PIN_SHIFT = prefersReducedMotion ? 0 : 100; // px the content travels during each ramp

const softPin = (section, end) => {
  const shift = SOFT_PIN_SHIFT;
  // A ramp twice as long as the shift makes power2 easing start/end at exactly the scroll speed
  const ramp = shift * 2;

  const pin = ScrollTrigger.create({
    trigger: section,
    start: `top ${shift}px`,
    end,
    pin: true,
  });
  if (!shift) return pin; // reduced motion: a plain pin

  // The content ends 2 × shift higher than the section box, pull the next section up to match
  section.style.marginBottom = `${-2 * shift}px`;

  gsap.fromTo(section, { '--pin-shift': '0px' }, {
    '--pin-shift': `${-shift}px`,
    ease: 'power2.out',
    scrollTrigger: { start: () => pin.start, end: () => pin.start + ramp, scrub: true },
  });
  gsap.fromTo(section, { '--pin-shift': `${-shift}px` }, {
    '--pin-shift': `${-2 * shift}px`,
    ease: 'power2.in',
    immediateRender: false,
    scrollTrigger: { start: () => pin.end - ramp, end: () => pin.end, scrub: true },
  });

  return pin;
};

const initSuccess = () => {
  const success = document.querySelector('.success');
  const title = success.querySelector('.success__title');

  splitToLetters(title);

  ScrollTrigger.create({
    trigger: '.success',
    start: REVEAL_START,
    onEnter: self => {
      self.trigger.classList.add('animated');
    },
  });

  const pin = softPin(success, '150% top');

  // Barely-there parallax: the background artwork drifts while the title stays put,
  // passing its design position exactly in the middle of the pinned stretch
  if (!prefersReducedMotion) gsap.fromTo(success, { '--success-drift': '40px' }, {
    '--success-drift': '-40px',
    ease: 'none',
    scrollTrigger: { start: () => pin.start, end: () => pin.end, scrub: true },
  });

  // Letters light up while pinned. Positions are taken from the pin itself: a trigger on the pinned
  // element that starts after the pin would otherwise be pushed below the whole pinned stretch.
  // Same range as before the soft pin: from 'top top' to '147.5% top'.
  ScrollTrigger.create({
    start: () => pin.start + SOFT_PIN_SHIFT,
    end: () => pin.start + SOFT_PIN_SHIFT + success.offsetHeight * 1.475,
    onUpdate: self => {
      title.setAttribute('data-progress', Math.floor(self.progress * 100));
    }
  });
}

// Card switch duration in ms, matches $card-switch in commit.scss.
// Cards pass each other halfway through, that's when their depth order is swapped.
const CARD_SWITCH = 600;

const initCommit = () => {
  const commit = document.querySelector('.commit');
  const cards = commit.querySelector('.cards');
  let delayTimer;

  // Switches the visible card; `reverse` is true when scrolling back up
  const setCard = (n, reverse = false) => {
    clearTimeout(delayTimer);
    cards.setAttribute('data-card', n);
    cards.setAttribute('data-reverse', reverse);
    cards.setAttribute('data-delayed', !reverse);
    delayTimer = setTimeout(() => {
      cards.setAttribute('data-delayed', reverse);
    }, CARD_SWITCH / 2);
  };

  ScrollTrigger.create({
    trigger: '.commit',
    start: REVEAL_START,
    onEnter: () => {
      commit.classList.add('animated');
      setCard(1);
      setTimeout(() => {
        cards.setAttribute('data-loading', false);
      }, CARD_SWITCH);
    }
  });

  ScrollTrigger.create({
    trigger: '.commit',
    start: '30% top',
    end: '130% top',
    onEnter: () => setCard(2),
    onLeaveBack: () => setCard(1, true)
  });

  ScrollTrigger.create({
    trigger: '.commit',
    start: '130% top',
    end: '200% top',
    onEnter: () => setCard(3),
    onLeaveBack: () => setCard(2, true)
  });

  softPin(commit, '200% top');
};

const initProducts = () => {
  const products = document.querySelector('.products');
  const heading = products.querySelector('.products__heading');
  const title = products.querySelector('.products__title');
  const dupe = title.children[0];
  const animation = products.querySelector('.products__animation');
  const wrapper = document.querySelector('.wrapper');

  let offsetX = 0, offsetY = 0, aniY = 0, startPin = 0, endPin = 0;
  const scale = 2.25;

  const calculateOffsets = () => {
    offsetX = 0;
    if (window.innerWidth >= 540) {
      offsetX = (window.innerWidth - dupe.clientWidth * scale) / 2 - title.offsetLeft - heading.offsetLeft - wrapper.offsetLeft - 20;
    }
    let m = +window.getComputedStyle(animation).marginTop.replace('px', '');
    offsetY = ((heading.clientHeight - title.offsetTop) + animation.clientHeight * .50 + m - title.clientHeight * scale / 2);
    aniY = ((heading.clientHeight - title.offsetTop) + animation.clientHeight * .50 + m);
    startPin = offsetY + title.clientHeight * scale / 2 + title.offsetTop;
    endPin = startPin + window.innerHeight / 2.5;
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
  // Recalculate before every ScrollTrigger refresh (fires on resize too)
  ScrollTrigger.addEventListener('refreshInit', calculateOffsets);

  ScrollTrigger.create({
    trigger: '.products',
    start: REVEAL_START,
    onEnter: self => {
      self.trigger.classList.add('animated');
    },
  });

  gsap.to('.products__heading', {
    scrollTrigger: {
      trigger: '.products__heading p',
      start: 'top center',
      end: '150% center',
      scrub: true,
    },
    color: 'rgba(255, 255, 255, 0)'
  });

  gsap.to('.products__duplicate', {
    scrollTrigger: {
      trigger: '.products__heading p',
      start: 'center 50%',
      end: () => aniY + ' 50%',
      scrub: true,
      invalidateOnRefresh: true,
      id: 'scrub',
    },
    color: 'rgba(255, 255, 255, .3)',
    scale: scale,
    x: () => offsetX,
    y: () => offsetY,
    ease: 'none'
  });

  ScrollTrigger.create({
    trigger: '.products',
    start: () => startPin + ' 50%',
    end: () => endPin + ' 50%',
    pin: true,
    id: 'pin',
  });
}

const initTeam = () => {
  const team = document.querySelector('.team');
  const p = team.querySelector('.team__text');

  // Pause the orbit animations while the section is out of view
  ScrollTrigger.create({
    trigger: '.team',
    start: 'top bottom',
    end: 'bottom top',
    onToggle: self => team.classList.toggle('offscreen', !self.isActive)
  });

  ScrollTrigger.create({
    trigger: '.team',
    start: REVEAL_START,
    onEnter: self => {
      self.trigger.classList.add('animated');
    },
  });

  splitToLines(p);
  onWidthResize(() => splitToLines(p));
}

const initJoin = () => {
  ScrollTrigger.create({
    trigger: '.join',
    start: REVEAL_START,
    onEnter: self => {
      self.trigger.classList.add('animated');
    },
  });
}

const initContacts = () => {
  const contacts = document.querySelector('.contacts');
  const copy = contacts.querySelector('.contacts__copy');
  const email = contacts.querySelector('.contacts__email').innerText;

  let resetTimer;

  copy.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(email);
    } catch (err) {
      console.error('Failed to copy: ', err);
      return;
    }
    copy.textContent = 'Copied';
    clearTimeout(resetTimer);
    resetTimer = setTimeout(() => {
      copy.textContent = 'Copy';
    }, 2000);
  });

  ScrollTrigger.create({
    trigger: '.contacts',
    start: REVEAL_START,
    onEnter: self => {
      self.trigger.classList.add('animated');
    },
  });
}

function initApp() {
  if (isMobile) {
    document.body.classList.add('mobile');
  }

  // Drive Lenis from the GSAP ticker so scrolling and ScrollTrigger update in the same frame
  // Every wheel step glides for 1.5s with Lenis' default easeOutExpo: quick response, long soft stop
  const lenis = new Lenis({ duration: 1.5 });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  initParallax(lenis);
  initAnchors(lenis);
  initMenu();
  initHero();
  initAbout();
  initSuccess();
  initCommit();
  initProducts();
  initTeam();
  initJoin();
  initContacts();
}

document.addEventListener('DOMContentLoaded', () => {
  initLoader();
});
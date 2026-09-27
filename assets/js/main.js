import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

// Always open at the top: the intro, section entrances and pins are built to be played from the start.
// A deep link (/#contacts) is kept and scrolled to after the intro instead of jumping there on load.
// (set through ScrollTrigger, which otherwise restores its remembered 'auto')
ScrollTrigger.clearScrollMemory('manual');
const initialHash = location.hash;
if (initialHash) history.replaceState(null, '', location.pathname + location.search);
window.scrollTo(0, 0);

const doc = document.documentElement;
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  // iPadOS 13+ reports itself as a Mac
  || (/Macintosh/.test(navigator.userAgent) && navigator.maxTouchPoints > 1);

// Users who asked the OS for less motion get no parallax, no soft pins and a short intro
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Parallax layers catch up with the scroll over this many seconds instead of following it 1:1
const PARALLAX_SCRUB = .8;

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
const LOADER_MIN_DURATION = prefersReducedMotion ? .3 : 1.6; // s

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
    window.scrollTo(0, 0);
    const { navigate } = initApp(); // runs while the loader still covers the page
    await wait(300);
    loader.classList.add('done');
    await wait(600);
    loader.classList.add('hidden');
    document.body.classList.remove('loading');
    document.body.classList.add('revealing');
    // Longest hero entrance: button delay + $duration-intro (see hero.scss), plus a margin
    await wait(600 + 1800 + 200);
    document.body.classList.remove('revealing');

    // Deep link: now that the intro has played, travel to the section like a menu click would
    if (initialHash) navigate(initialHash);
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

// In-page anchor navigation: a steady, fairly slow scroll so the section animations play out on the way.
// Speed profile is a trapezoid: ease in, constant NAV_SPEED, ease out; duration follows the distance.
const NAV_SPEED = 1200;   // px/s
const NAV_EASE_IN = .6;   // s
const NAV_EASE_OUT = .9;  // s

// Normalised position for a trapezoid speed profile (ramp fractions `a` and `b` of the duration, a + b <= 1)
const trapezoid = (a, b) => {
  const peak = 1 / (1 - (a + b) / 2);
  return (t) => {
    if (t < a) return peak * t * t / (2 * a);
    if (t <= 1 - b) return peak * (a / 2 + t - a);
    return 1 - peak * (1 - t) ** 2 / (2 * b);
  };
};

const initAnchors = (lenis) => {
  let navigating = false;
  let activeLink = null;
  let endTimer;

  const finish = () => {
    navigating = false;
    clearTimeout(endTimer);
    document.body.classList.remove('is-navigating');
    // The clicked link keeps its hover look during the scroll, then fades back (hover transition)
    if (activeLink) {
      activeLink.classList.remove('is-active');
      activeLink.blur(); // :focus looks the same as :hover
      activeLink = null;
    }
    window.removeEventListener('wheel', finish);
    window.removeEventListener('touchstart', finish);
  };

  // Scrolls to the section of `hash`; `link` keeps its hover look on the way (defaults to the menu item)
  const navigate = (hash, link = document.querySelector(`.header__menu-nav a[href="${hash}"]`)) => {
    const target = hash.length > 1 && document.getElementById(hash.slice(1));
    // Other links are disabled until this scroll is over
    if (!target || navigating) return;

    const distance = Math.abs(target.getBoundingClientRect().top);
    // Full ramps + cruise at NAV_SPEED; short hops that never reach it turn into a softer triangle
    const ramps = NAV_EASE_IN + NAV_EASE_OUT;
    const duration = Math.max(distance / NAV_SPEED + ramps / 2, ramps);

    navigating = true;
    document.body.classList.add('is-navigating');
    activeLink = link;
    link?.classList.add('is-active');
    // The user taking over (wheel / touch) interrupts the scroll, give the menu back right away
    window.addEventListener('wheel', finish, { passive: true });
    window.addEventListener('touchstart', finish, { passive: true });
    endTimer = setTimeout(finish, (duration + .2) * 1000); // safety net if onComplete never fires

    lenis.scrollTo(target, {
      duration,
      easing: trapezoid(NAV_EASE_IN / duration, NAV_EASE_OUT / duration),
      immediate: prefersReducedMotion,
      onComplete: finish,
    });
    history.pushState(null, '', hash);
  };

  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href^="#"]');
    if (!link || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

    const hash = link.getAttribute('href');
    if (hash.length < 2 || !document.getElementById(hash.slice(1))) return;

    e.preventDefault();
    navigate(hash, link);
  });

  return navigate;
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
      scrub: PARALLAX_SCRUB,
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
      scrub: PARALLAX_SCRUB,
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
const SOFT_PIN_SHIFT = prefersReducedMotion ? 0 : 140; // px the content travels during each ramp

// `anchor: 'center'` pins when the section centre reaches the viewport centre (default: its top at the top).
// `start` (shift => scroll position) overrides the anchor for pins that begin at a computed point.
// `reparent` moves the element to <body> while pinned, for pins inside another pinned (transformed) element;
// then `content` (a child) should carry the shift, because unpinning restores the pinned element's inline styles.
// `property` names the CSS variable that carries the shift (distinct names let nested pins add up).
const softPin = (section, end, {
  anchor = 'top', start, shift: shiftOption = SOFT_PIN_SHIFT, reparent = false, content = section, property = '--pin-shift',
} = {}) => {
  const shift = prefersReducedMotion ? 0 : shiftOption;
  // A ramp twice as long as the shift makes quadratic easing (GSAP's power1) start/end at exactly the scroll speed
  const ramp = shift * 2;

  // The content ends 2 × shift higher than the section box, pull the next section up to match.
  // Must be set before the pin is created: ScrollTrigger moves the margins onto the pin spacer.
  if (shift) section.style.marginBottom = `${-2 * shift}px`;

  const pin = ScrollTrigger.create({
    trigger: section,
    start: start ? start(shift) : anchor === 'center' ? `center center+=${shift}` : `top ${shift}px`,
    end,
    pin: true,
    pinReparent: reparent,
  });
  if (!shift) return pin; // reduced motion: a plain pin

  gsap.fromTo(content, { [property]: '0px' }, {
    [property]: `${-shift}px`,
    ease: 'power1.out',
    scrollTrigger: { start: () => pin.start, end: () => pin.start + ramp, scrub: true },
  });
  gsap.fromTo(content, { [property]: `${-shift}px` }, {
    [property]: `${-2 * shift}px`,
    ease: 'power1.in',
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
  if (!prefersReducedMotion) gsap.fromTo(success, { '--success-drift': '20px' }, {
    '--success-drift': '-20px',
    ease: 'none',
    scrollTrigger: { start: () => pin.start, end: () => pin.end, scrub: PARALLAX_SCRUB },
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

// Card switch duration in ms, matches $card-switch in commit.scss
const CARD_SWITCH = 400;
// When the two cards are the same size: 50% progress of the CSS `ease` curve is reached at 29.3% of the time
const CARD_CROSS = CARD_SWITCH * .293;

const initCommit = () => {
  const commit = document.querySelector('.commit');
  const cards = commit.querySelector('.cards');
  const cardEls = [...cards.querySelectorAll('.cards__card')];
  let current = 0;
  let swapTimer;

  // Depth order: [front card, middle card], the remaining one stays at the back
  const setDepth = (front, middle) => cardEls.forEach((el, i) => {
    el.style.zIndex = i + 1 === front ? 3 : i + 1 === middle ? 2 : 1;
  });

  // Switches the visible card. The outgoing card stays in front until both cards are the same size,
  // i.e. when they pass each other (CARD_CROSS), then the incoming one comes forward. The third card
  // only moves from one side to the other behind them.
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
    onLeaveBack: () => setCard(1)
  });

  ScrollTrigger.create({
    trigger: '.commit',
    start: '130% top',
    end: '200% top',
    onEnter: () => setCard(3),
    onLeaveBack: () => setCard(2)
  });

  const pin = softPin(commit, '200% top');

  // The progress bar fills at a constant pace over the whole pinned stretch
  gsap.fromTo(cards, { '--cards-progress': 0 }, {
    '--cards-progress': 1,
    ease: 'none',
    scrollTrigger: { start: () => pin.start, end: () => pin.end, scrub: true },
  });
};

const initProducts = () => {
  const products = document.querySelector('.products');
  const heading = products.querySelector('.products__heading');
  const paragraph = heading.querySelector('p');
  const title = products.querySelector('.products__title');
  const dupe = title.children[0];
  const animation = products.querySelector('.products__animation');

  // How long the heading stays pinned at the centre while its text greys out
  const HEADING_PIN = () => window.innerHeight * 1.45;
  const HEADING_SHIFT = 80; // soft pin ramps for the heading

  let offsetX = 0, offsetY = 0, flight = 0;
  const scale = 2.25;

  // Offset of an element inside an ancestor, whatever offsetParent is in between
  // (the paragraph's transform makes it the offsetParent of the title)
  const topWithin = (el, ancestor) => {
    let top = 0;
    for (let e = el; e && e !== ancestor; e = e.offsetParent) top += e.offsetTop;
    return top;
  };

  // Where the white "Our mobile applications" copy flies to: centred, over the middle of the screenshots
  const calculateOffsets = () => {
    offsetX = 0;
    if (window.innerWidth >= 540) {
      offsetX = (window.innerWidth - dupe.clientWidth * scale) / 2 - dupe.getBoundingClientRect().left;
    }
    const titleTop = topWithin(title, heading);
    const m = parseFloat(window.getComputedStyle(animation).marginTop);
    const toAnimationCentre = (heading.clientHeight - titleTop) + animation.clientHeight * .5 + m;
    offsetY = toAnimationCentre - title.clientHeight * scale / 2;
    // Distance from the paragraph centre to the screenshots' centre: how far to scroll during the flight
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
  // Recalculate before every ScrollTrigger refresh (fires on resize too)
  ScrollTrigger.addEventListener('refreshInit', calculateOffsets);

  ScrollTrigger.create({
    trigger: '.products',
    start: REVEAL_START,
    onEnter: self => {
      self.trigger.classList.add('animated');
    },
  });

  // 1. The heading pins at the screen centre and its text greys out, the white copy stays put
  // Reparented: .products itself gets pinned later, and its transform would break a nested fixed pin
  const headingPin = softPin(heading, () => `+=${HEADING_PIN()}`, {
    anchor: 'center', shift: HEADING_SHIFT, reparent: true, content: paragraph,
  });
  const headingShift = prefersReducedMotion ? 0 : HEADING_SHIFT;

  // One even fade from the moment it pins until it's halfway from the centre to the top of the screen
  // (the exit ramp has already moved the text up by headingShift when the pin ends)
  gsap.fromTo(paragraph, { color: 'rgba(255, 255, 255, 1)' }, {
    color: 'rgba(255, 255, 255, 0)',
    ease: 'none',
    scrollTrigger: {
      start: () => headingPin.start,
      end: () => headingPin.end + window.innerHeight * .25 - headingShift,
      scrub: true,
    },
  });

  // 2. Once the grey heading moves on, the white copy flies down to the screenshots. It is still on its way
  // when the screenshots reach the centre: the section pins there and the copy lands during the pin.
  const LANDING = () => window.innerHeight * .6; // extra flight while the section is pinned
  const HOLD = () => window.innerHeight * .1;    // short pause after landing before moving on
  const screensCentred = () => headingPin.end + flight - headingShift;

  gsap.to('.products__duplicate', {
    scrollTrigger: {
      start: () => headingPin.end,
      end: () => screensCentred() + LANDING(),
      scrub: true,
      invalidateOnRefresh: true,
      id: 'scrub',
    },
    color: 'rgba(255, 255, 255, .3)',
    scale: scale,
    x: () => offsetX,
    y: () => offsetY,
    ease: 'power1.inOut', // eases away from the heading and settles softly onto the screenshots
  });

  // 3. The section pins (soft entry and exit) while the copy lands, then leaves almost right away.
  // Its own variable: the paragraph (with the white copy) adds it to the heading's --pin-shift.
  const PRODUCTS_SHIFT = 80;
  const productsShift = prefersReducedMotion ? 0 : PRODUCTS_SHIFT;
  softPin(products, () => screensCentred() + productsShift * 3 + LANDING() + HOLD(), {
    start: shift => () => screensCentred() - shift,
    shift: PRODUCTS_SHIFT,
    property: '--products-pin-shift',
  });

  // Barely-there parallax for the screenshots: the centre phone drifts ±15px, the side ones twice as much
  if (!prefersReducedMotion) gsap.fromTo(animation, { '--screens-parallax': '15px' }, {
    '--screens-parallax': '-15px',
    ease: 'none',
    // From the block's top entering at the bottom to its bottom leaving at the top, pinned stretch included.
    // Explicit positions: triggers inside a pinned section don't get the pin length right on their own.
    scrollTrigger: {
      start: () => screensCentred() - (window.innerHeight + animation.offsetHeight) / 2,
      end: () => screensCentred() + productsShift * 3 + LANDING() + HOLD()
        + (window.innerHeight + animation.offsetHeight) / 2 - productsShift * 2,
      scrub: PARALLAX_SCRUB,
    },
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
  // Barely-there parallax for the glow inside the card. It only ever sinks below the bottom edge
  // (where it gets clipped) and rises to its design position: never above it, so no gap opens underneath
  if (!prefersReducedMotion) gsap.fromTo('.join', { '--join-parallax': '25px' }, {
    '--join-parallax': '0px',
    ease: 'none',
    scrollTrigger: {
      trigger: '.join',
      start: 'top bottom',
      end: 'bottom top',
      scrub: PARALLAX_SCRUB,
    },
  });

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
  const emailField = contacts.querySelector('.contacts__email');
  const email = emailField.innerText;

  let resetTimer;

  // Both the Copy button and the email field copy the address
  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(email);
    } catch (err) {
      console.error('Failed to copy: ', err);
      return;
    }
    copy.classList.add('is-copied');
    clearTimeout(resetTimer);
    resetTimer = setTimeout(() => {
      copy.classList.remove('is-copied');
    }, 2000);
  };
  copy.addEventListener('click', copyEmail);
  emailField.addEventListener('click', copyEmail);

  // The ray: grows and brightens from the section entering until it's fully in view
  if (!prefersReducedMotion) gsap.fromTo(contacts, { '--contacts-parallax': 0 }, {
    '--contacts-parallax': 1,
    ease: 'none',
    scrollTrigger: { trigger: contacts, start: 'top bottom', end: 'bottom bottom', scrub: PARALLAX_SCRUB },
  });

  // The glows follow the mouse a little while the section is on screen (mouse devices only)
  if (!prefersReducedMotion && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    const toX = gsap.quickTo(contacts, '--pointer-x', { duration: 1.2, ease: 'power3.out' });
    const toY = gsap.quickTo(contacts, '--pointer-y', { duration: 1.2, ease: 'power3.out' });
    const inView = ScrollTrigger.create({ trigger: contacts, start: 'top bottom', end: 'max' });
    window.addEventListener('mousemove', (e) => {
      if (!inView.isActive) return;
      toX(e.clientX / window.innerWidth * 2 - 1);
      toY(e.clientY / window.innerHeight * 2 - 1);
    }, { passive: true });
  }

  // Footer artwork fades in with a slight zoom while the footer is uncovered.
  // Here rather than in initFooter: the trigger has to be created after the pins above it.
  if (!prefersReducedMotion) gsap.fromTo('.footer', { '--footer-reveal': 0 }, {
    '--footer-reveal': 1,
    ease: 'none',
    scrollTrigger: { trigger: contacts, start: 'bottom bottom', end: 'max', scrub: PARALLAX_SCRUB },
  });

  // The horizon glow at the bottom rises into place from a bit before the footer shows to the end of the page
  if (!prefersReducedMotion) gsap.fromTo(contacts, { '--contacts-arc': 0 }, {
    '--contacts-arc': 1,
    ease: 'none',
    scrollTrigger: { trigger: contacts, start: 'bottom bottom+=300', end: 'max', scrub: PARALLAX_SCRUB },
  });

  ScrollTrigger.create({
    trigger: '.contacts',
    start: REVEAL_START,
    onEnter: self => {
      self.trigger.classList.add('animated');
    },
  });
}

// The footer sits fixed under the page and is uncovered as the page scrolls away.
// Only when it fits the screen, otherwise its lower part could never be reached.
const initFooter = () => {
  const footer = document.querySelector('.footer');
  const update = () => {
    document.body.classList.toggle('footer-reveal', footer.offsetHeight <= window.innerHeight);
    doc.style.setProperty('--footer-height', `${footer.offsetHeight}px`);
  };
  update();
  onWidthResize(() => {
    update();
    ScrollTrigger.refresh();
  });
};

function initApp() {
  if (isMobile) {
    document.body.classList.add('mobile');
  }

  // Drive Lenis from the GSAP ticker so scrolling and ScrollTrigger update in the same frame
  // Every wheel step glides for 1.8s with Lenis' default easeOutExpo: quick response, long soft stop;
  // a slightly shorter step per wheel notch makes it feel softer still
  const lenis = new Lenis({ duration: 1.8, wheelMultiplier: .85 });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  initFooter(); // changes the page height, so before any ScrollTrigger is measured
  initParallax(lenis);
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
  initLoader();
});
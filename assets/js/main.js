import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

const doc = document.documentElement;
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  // iPadOS 13+ reports itself as a Mac
  || (/Macintosh/.test(navigator.userAgent) && navigator.maxTouchPoints > 1);

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

const initLoader = () => {
  const loader = document.querySelector('.loader');
  const percent = loader.querySelector('.loader__percent');
  const bar = loader.querySelector('.loader__progress div');

  // Resolved (hashed) URLs of the images used as section backgrounds
  const urls = import.meta.glob('../img/*.{png,webp,svg}', { eager: true, query: '?url', import: 'default' });
  const images = [
    'logo.png',
    'logo-mobile.png',
    'stars.svg',
    'swirl.webp',
    'galaxy.png',
    'ray.webp',
    'about.webp',
    'blackhole.webp',
    'footer.webp',
    'dots.svg',
    'card.webp',
    'eclipse.svg'
  ].map(name => urls[`../img/${name}`]);

  let settled = 0;
  const onSettled = () => {
    const p = Math.floor(++settled / images.length * 100);
    percent.innerText = p + '%';
    bar.style.width = p + '%';
  };

  const loadImage = (src) => new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = resolve;
    image.onerror = image.onabort = reject;
    image.src = src;
  }).finally(onSettled);

  // Failed images must not block the app
  Promise.allSettled(images.map(loadImage)).then(() => {
    initApp();
    setTimeout(() => {
      loader.classList.add('done');
      setTimeout(() => {
        loader.classList.add('hidden');
      }, 800);
    }, 200);
  });
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

const initParallax = (lenis) => {
  const speed = .15;
  const onScroll = ({ scroll }) => {
    doc.style.setProperty('--parallax-offset', `-${scroll * speed}px`);
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
    lenis.scrollTo(target);
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

  document.body.classList.add('inited');
  document.body.classList.remove('locked');
};

const initAbout = () => {
  const about = document.querySelector('.about');
  const p = about.querySelector('.about__text');

  splitToLines(p);
  onWidthResize(() => splitToLines(p));

  ScrollTrigger.create({
    trigger: '.about',
    start: '20% bottom',
    onEnter: () => {
      about.classList.add('animated');
      setTimeout(() => {
        about.classList.add('done')
      }, 1000);
    }
  });
}

const initSuccess = () => {
  const success = document.querySelector('.success');
  const title = success.querySelector('.success__title');

  splitToLetters(title);

  ScrollTrigger.create({
    trigger: '.success',
    start: '20% center',
    onEnter: self => {
      self.trigger.classList.add('animated');
    },
  });

  ScrollTrigger.create({
    trigger: '.success',
    start: 'top top',
    end: '150% top',
    pin: true,
  });

  ScrollTrigger.create({
    trigger: '.success',
    start: 'top top',
    end: '147.5% top',
    onUpdate: self => {
      title.setAttribute('data-progress', Math.floor(self.progress * 100));
    }
  });
}

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
    }, 200);
  };

  ScrollTrigger.create({
    trigger: '.commit',
    start: '20% center',
    onEnter: () => {
      commit.classList.add('animated');
      setCard(1);
      setTimeout(() => {
        cards.setAttribute('data-loading', false);
      }, 400);
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

  ScrollTrigger.create({
    trigger: '.commit',
    start: 'top top',
    end: '200% top',
    pin: true
  });
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
    start: '25% center',
    onEnter: self => {
      self.trigger.classList.add('animated');
    },
    onLeaveBack: self => {
      self.trigger.classList.remove('animated');
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

  ScrollTrigger.create({
    trigger: '.team',
    start: '20% center',
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
    start: '15% center',
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
    start: '25% center',
    onEnter: self => {
      self.trigger.classList.add('animated');
    },
  });
}

function initApp() {
  if (isMobile) {
    document.body.classList.add('mobile');
  }

  // Initialize Lenis
  const lenis = new Lenis({ autoRaf: true, });
  lenis.on('scroll', ScrollTrigger.update);

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
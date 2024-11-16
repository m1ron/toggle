const doc = document.documentElement;
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);


const splitToLines = (p) => {
  let text = p.innerText;
  let arr = text.split('');
  p.innerHTML = '';

  let s, t, i;

  for (i = 0; i < arr.length; i++) {
    s = document.createElement('span');
    t = document.createTextNode(arr[i]);
    s.appendChild(t);
    p.append(s);
  }

  let lines = [];

  let spans = p.querySelectorAll('span'), current = spans[0].offsetTop, begin = 0, end = 0;
  for (i = 0; i < spans.length; i++) {
    if ((spans[i].offsetTop > current) || (i === spans.length - 1)) {
      end = i;
      if (i === spans.length - 1) {
        end = spans.length;
      }
      lines.push(text.substring(begin, end).trim());
      current = spans[i].offsetTop;
      begin = i;
    }
  }

  p.innerHTML = '';
  for (i = 0; i < lines.length; i++) {
    s = document.createElement('div');
    t = document.createTextNode(lines[i]);
    s.appendChild(t);
    p.append(s);
  }
};

const splitToLetters = (p) => {
  let text = p.innerText;
  let arr = text.split('');
  p.innerHTML = '';

  let s, t, i;

  for (i = 0; i < arr.length; i++) {
    s = document.createElement('span');
    t = document.createTextNode(arr[i]);
    s.appendChild(t);
    p.append(s);
  }
}

async function copyContent(s) {
  try {
    await navigator.clipboard.writeText(s);
    console.log('Content copied to clipboard');
  } catch (err) {
    console.error('Failed to copy: ', err);
  }
}

const scrollAnimation = () => {
  let elements = document.querySelectorAll('[data-animation]');

  const elementIn = (el, end = 1) => {
    const elementTop = el.getBoundingClientRect().top;
    return (elementTop <= (window.innerHeight || doc.clientHeight) / end);
  };

  const onScroll = () => {
    elements.forEach((el, index) => {
      if (elementIn(el, el.dataset.offset)) {
        el.classList.add('animated');
        setTimeout(() => {
          const event = new Event('animate');
          el.dispatchEvent(event);
        }, 50);
        elements = [].slice.call(elements, 1);
      }
    })
  }

  setTimeout(() => {
    onScroll();
    window.addEventListener('scroll', onScroll);
  }, 200);
};

const initParallax = () => {
  const speed = .15;
  const onScroll = () => {
    doc.style.setProperty('--parallax-offset', `-${window.pageYOffset * speed}px`);
  }
  onScroll();
  window.addEventListener('scroll', onScroll);
};

const initMenu = () => {
  const header = document.querySelector('.header');
  const menu = header.querySelector('.header__menu');
  const toggle = menu.querySelector('.header__menu-toggle');
  const nav = menu.querySelector('.header__menu-nav');

  const onClick = () => {
    menu.classList.toggle('active');
  };

  toggle.addEventListener('click', onClick);
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
};

const initAbout = () => {
  const about = document.querySelector('.about');
  const p = about.querySelector('.about__text');

  const onResize = () => {
    splitToLines(p);
  };

  ScrollTrigger.create({
    trigger: '.about', start: '20% bottom', onEnter: () => {
      about.classList.add('animated');
      setTimeout(function () {
        about.classList.add('done')
      }, 1000);
    }
  });

  window.addEventListener('resize', onResize, true);
  onResize();
}

const initSuccess = () => {
  const success = document.querySelector('.success');
  const title = success.querySelector('.success__title');

  splitToLetters(title);

  ScrollTrigger.create({
    trigger: '.success',
    start: '20% center',
    onEnter: () => {
      success.classList.add('animated');
    },
    //markers: {startColor: 'red', endColor: 'red'},
  });

  ScrollTrigger.create({
    trigger: '.success',
    start: 'top top',
    end: 'bottom 35%',
    pin: true,
    //markers: {startColor: 'yellow', endColor: 'yellow'},
  });

  ScrollTrigger.create({
    trigger: '.success',
    start: 'top top',
    end: 'bottom 25%',
    scrub: true,
    onUpdate: self => {
      title.setAttribute('data-progress', Math.floor(self.progress * 100));
    },
    //markers: {startColor: 'green', endColor: 'green'},
  });
}

const initCommit = () => {
  const commit = document.querySelector('.commit');
  const cards = commit.querySelector('.cards');

  /*
  const onAnimate = () => {
    let i = 1;
    setTimeout(() => {
      cards.setAttribute('data-card', i);
      setInterval(function () {
        i++;
        cards.setAttribute('data-card', i);
        if (i === 3) {
          i = 0;
        }
      }, 3000);
    }, 400);
  };
  commit.addEventListener('animate', onAnimate);
   */

  ScrollTrigger.create({
    trigger: '.commit',
    start: '20% center',
    onEnter: () => {
      commit.classList.add('animated');
      setTimeout(() => {
        cards.setAttribute('data-card', 1);
      }, 400);
    },
    //markers: {startColor: 'red', endColor: 'red'},
  });

  ScrollTrigger.create({
    trigger: '.commit',
    start: '30% top',
    end: '100% top',
    scrub: true,
    onEnter: self => {
      cards.setAttribute('data-card', 2);
    },
    onLeaveBack: self => {
      cards.setAttribute('data-card', 1);
    },
    //markers: {startColor: 'green', endColor: 'green'},
  });

  ScrollTrigger.create({
    trigger: '.commit',
    start: '100% top',
    end: '150% top',
    scrub: true,
    onUpdate: self => {
      cards.setAttribute('data-card', 3);
    },
    onLeaveBack: self => {
      cards.setAttribute('data-card', 2);
    },
    //markers: {startColor: 'red', endColor: 'red'},
  });

  ScrollTrigger.create({
    trigger: '.commit',
    start: 'top top',
    end: '150% top',
    pin: true,
    //markers: {startColor: 'yellow', endColor: 'yellow'},
  });
}

const initTeam = () => {
  const team = document.querySelector('.team');
  const p = team.querySelector('.team__text');

  const onResize = () => {
    splitToLines(p);
  };

  window.addEventListener('resize', onResize, true);
  onResize();
}

const initContacts = () => {
  const contacts = document.querySelector('.contacts');
  const copy = contacts.querySelector('.contacts__copy');
  const email = contacts.querySelector('.contacts__email').innerText;

  copy.addEventListener('click', () => {
    copyContent(email);
    return false;
  });
}


document.addEventListener('DOMContentLoaded', () => {
  if (isMobile) {
    document.body.classList.add('mobile');
  }

  // Initialize GSAP
  gsap.registerPlugin(ScrollTrigger);

  // Initialize Lenis
  const lenis = new Lenis({ autoRaf: true, });

  scrollAnimation();
  initParallax();
  initMenu();
  initHero();
  initAbout();
  initSuccess();
  initCommit();
  initTeam();
  initContacts();
});
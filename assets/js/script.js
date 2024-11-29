const doc = document.documentElement;
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

const initLoader = () => {
  function getAsyncLoadingImageList(imageSourceList) {
    const totalCount = imageSourceList.length;
    let successCount = 0;
    let failureCount = 0;

    function loadImage(src) {
      return new Promise((resolve, reject) => {
        const image = new Image();

        image.onload = function () {
          resolve({
            image,
            counts: {
              total: totalCount,
              success: ++successCount,
              failure: failureCount
            },
            success: true,
          });
        };
        image.onerror = image.onabort = function () {
          reject({
            image,
            counts: {
              total: totalCount,
              success: successCount,
              failure: ++failureCount
            },
            success: false,
          });
        };

        image.src = 'assets/img/' + src;
      });
    }

    // return list of *image loading* promises.
    return imageSourceList.map(src => loadImage(src));
  }

  function renderImageLoadProgress(imageLoadData) {
    let p = 0;
    let a = Math.floor(imageLoadData.counts.success / imageLoadData.counts.total * 100);
    if (a > 0) {
      p = a;
    }
    percent.innerText = p + '%';
    div.style.width = p + '%';
    if (imageLoadData.counts.success === imageLoadData.counts.total) {
      initApp();
      setTimeout(function () {
        loader.classList.add('done');
        setTimeout(function () {
          loader.classList.add('hidden');
        }, 800);
      }, 200);
    }
  }

  const loader = document.querySelector('.loader');
  const percent = loader.querySelector('.loader__percent');
  const div = loader.querySelector('.loader__progress div');

  const imageSourceList = [
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
  ];

  getAsyncLoadingImageList(imageSourceList).forEach(promise =>
    promise
      .then(renderImageLoadProgress)
      .catch(renderImageLoadProgress)
  );
}

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
    if (menu.classList.contains('active')) {
      menu.classList.remove('active');
      setTimeout(() => {
        menu.classList.remove('visible');
      }, 400)
    } else {
      menu.classList.add('visible');
      setTimeout(() => {
        menu.classList.add('active');
      }, 50)
    }
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
  document.body.classList.remove('locked');
};

const initAbout = () => {
  const about = document.querySelector('.about');
  const p = about.querySelector('.about__text');

  const onResize = () => {
    splitToLines(p);
  };
  window.addEventListener('resize', onResize, true);
  onResize();

  gsap.to('.about', {
    scrollTrigger: {
      trigger: '.about',
      start: '20% bottom',
      onEnter: () => {
        about.classList.add('animated');
        setTimeout(() => {
          about.classList.add('done')
        }, 1000);
      }
    }
  });
}

const initSuccess = () => {
  const success = document.querySelector('.success');
  const title = success.querySelector('.success__title');

  splitToLetters(title);

  gsap.to('.success', {
    scrollTrigger: {
      trigger: '.success',
      start: '20% center',
      onEnter: self => {
        self.trigger.classList.add('animated');
      },
    }
  });

  gsap.to('.success', {
    scrollTrigger: {
      trigger: '.success',
      start: 'top top',
      end: '150% top',
      pin: true,
    }
  });

  gsap.to('.success', {
    scrollTrigger: {
      trigger: '.success',
      start: 'top top',
      end: '145% top',
      scrub: true,
      onUpdate: self => {
        title.setAttribute('data-progress', Math.floor(self.progress * 100));
      }
    }
  });
}

const initCommit = () => {
  const commit = document.querySelector('.commit');
  const cards = commit.querySelector('.cards');

  gsap.to('.commit', {
    scrollTrigger: {
      trigger: '.commit',
      start: '20% center',
      onEnter: () => {
        commit.classList.add('animated');
        cards.setAttribute('data-card', 1);
        cards.setAttribute('data-reverse', false);
        cards.setAttribute('data-delayed', true);
        setTimeout(() => {
          cards.setAttribute('data-delayed', false);
        }, 200);
        setTimeout(() => {
          cards.setAttribute('data-loading', false);
        }, 400);
      }
    }
  });

  gsap.to('.commit', {
    scrollTrigger: {
      trigger: '.commit',
      start: '30% top',
      end: '130% top',
      scrub: .2,
      onEnter: () => {
        cards.setAttribute('data-card', 2);
        cards.setAttribute('data-reverse', false);
        cards.setAttribute('data-delayed', true);
        setTimeout(() => {
          cards.setAttribute('data-delayed', false);
        }, 200);
      },
      onLeaveBack: () => {
        cards.setAttribute('data-card', 1);
        cards.setAttribute('data-reverse', true);
        cards.setAttribute('data-delayed', false);
        setTimeout(() => {
          cards.setAttribute('data-delayed', true);
        }, 200);
      }
    }
  });

  gsap.to('.commit', {
    scrollTrigger: {
      trigger: '.commit',
      start: '130% top',
      end: '200% top',
      scrub: .2,
      onEnter: () => {
        cards.setAttribute('data-card', 3);
        cards.setAttribute('data-reverse', false);
        cards.setAttribute('data-delayed', true);
        setTimeout(() => {
          cards.setAttribute('data-delayed', false);
        }, 200);
      },
      onLeaveBack: () => {
        cards.setAttribute('data-card', 2);
        cards.setAttribute('data-reverse', true);
        cards.setAttribute('data-delayed', false);
        setTimeout(() => {
          cards.setAttribute('data-delayed', true);
        }, 200);
      }
    }
  });

  gsap.to('.commit', {
    scrollTrigger: {
      trigger: '.commit',
      start: 'top top',
      end: '200% top',
      pin: true
    }
  });
}

const initProducts = () => {
  const products = document.querySelector('.products');
  const heading = products.querySelector('.products__heading');
  const title = products.querySelector('.products__title');
  const dupe = title.children[0];
  const animation = products.querySelector('.products__animation');
  const wrapper = document.querySelector('.wrapper');

  let offsetX = 0, offsetY = 0;
  const scale = 2.25;

  const calculateOffsets = () => {
    offsetX = 0;
    if (window.innerWidth >= 540) {
      offsetX = (window.innerWidth - dupe.clientWidth * scale) / 2 - title.offsetLeft - heading.offsetLeft - wrapper.offsetLeft - 20;
    }
    let m = +window.getComputedStyle(animation).marginTop.replace('px', '');
    offsetY = ((heading.clientHeight - title.offsetTop) + animation.clientHeight / 2 + m - title.clientHeight * scale / 2);
    offset2 = offsetY + window.innerHeight / 2.5;
    //console.log(offsetY, offset2);
  };

  const adjustTitle = () => {
    let span = document.createElement('span');
    let text = document.createTextNode(dupe.innerText);
    span.classList.add('products__duplicate');
    span.appendChild(text);
    dupe.append(span);
  };

  const onResize = () => {
    calculateOffsets();
  };

  adjustTitle();
  window.addEventListener('resize', onResize, true);
  onResize();

  gsap.to('.products', {
    scrollTrigger: {
      trigger: '.products',
      start: '25% center',
      onEnter: self => {
        self.trigger.classList.add('animated');
      },
      onLeaveBack: self => {
        self.trigger.classList.remove('animated');
      },
    }
  });

  gsap.to('.products__heading', {
    scrollTrigger: {
      trigger: '.products__heading p',
      start: 'top center',
      end: '150% center',
      scrub: true,
      id: 'heading',
      //markers: true
    },
    color: 'rgba(255, 255, 255, 0)'
  });

  gsap.to('.products__duplicate', {
    scrollTrigger: {
      trigger: '.products__heading p',
      start: 'top center',
      end: offsetY + ' center',
      scrub: true,
      id: 'scrub',
      //markers: { startColor: 'red', endColor: 'red' }
    },
    color: 'rgba(255, 255, 255, .3)',
    scale: scale,
    x: offsetX,
    y: offsetY,
    ease: 'none'
  });

  gsap.to('.products', {
    scrollTrigger: {
      trigger: '.products',
      start: offsetY + title.offsetTop + ' center',
      end: offset2 + ' center',
      pin: true,
      id: 'pin',
      //markers: { startColor: 'white', endColor: 'white' }
    }
  });
}

const initTeam = () => {
  const team = document.querySelector('.team');
  const p = team.querySelector('.team__text');

  const onResize = () => {
    splitToLines(p);
  };

  gsap.to('.team', {
    scrollTrigger: {
      trigger: '.team',
      start: '20% center',
      onEnter: self => {
        self.trigger.classList.add('animated');
      },
    }
  });

  window.addEventListener('resize', onResize, true);
  onResize();
}

const initJoin = () => {
  gsap.to('.join', {
    scrollTrigger: {
      trigger: '.join',
      start: '15% center',
      onEnter: self => {
        self.trigger.classList.add('animated');
      },
    }
  });
}

const initContacts = () => {
  const contacts = document.querySelector('.contacts');
  const copy = contacts.querySelector('.contacts__copy');
  const email = contacts.querySelector('.contacts__email').innerText;

  copy.addEventListener('click', () => {
    copyContent(email);
    return false;
  });

  gsap.to('.contacts', {
    scrollTrigger: {
      trigger: '.contacts',
      start: '25% center',
      onEnter: self => {
        self.trigger.classList.add('animated');
      },
    }
  });
}

function initApp() {
  if (isMobile) {
    document.body.classList.add('mobile');
  }

  // Initialize GSAP
  gsap.registerPlugin(ScrollTrigger);

  // Initialize Lenis
  const lenis = new Lenis({ autoRaf: true, });

  initParallax();
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
const doc = document.documentElement;
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

const adjustHeight = () => {
  const onResize = () => {
    doc.style.setProperty('--page-height', `${window.innerHeight}px`);
  }

  if (!isMobile) {
    onResize();
    window.addEventListener('resize', onResize);
  }
};

const initAbout = () => {
  const about = document.querySelector('.about');
  const p = about.querySelector('.about__text');

  const onResize = () => {
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

  window.addEventListener('resize', onResize, true);
  onResize();
}

const initSuccess = () => {
  const success = document.querySelector('.success');
  const p = success.querySelector('.success__title');

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

const starsParallax = () => {
  const stars = document.querySelector('.stars');
  const speed = .25;
  const onScroll = () => {
    doc.style.setProperty('--parallax-offset', `-${window.pageYOffset * speed}px`);
  }
  onScroll();
  window.addEventListener('scroll', onScroll)
};

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

const initCommit = () => {
  const commit = document.querySelector('.commit');
  const cards = commit.querySelector('.cards');

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
    }, 500);
  };

  commit.addEventListener('animate', onAnimate);
}

document.addEventListener('DOMContentLoaded', () => {
  document.body.classList.add('inited');
  if (isMobile) {
    document.body.classList.add('mobile');
  }
  adjustHeight();
  initAbout();
  initSuccess();
  initCommit();
  starsParallax();
  scrollAnimation();
});
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
  const elements = document.querySelectorAll('[data-animation]');

  const onScroll = () => {
    elements.forEach((el) => {
      if (elementIn(el, el.dataset.offset)) {
        startAnimation(el);
      }
    })
  }

  const elementIn = (el, end = 1) => {
    const elementTop = el.getBoundingClientRect().top;
    return (elementTop <= (window.innerHeight || doc.clientHeight) / end);
  };

  const startAnimation = (el) => {
    el.classList.add('animated');
  };

  onScroll();
  window.addEventListener('scroll', onScroll);
};

document.addEventListener('DOMContentLoaded', () => {
  document.body.classList.add('inited');
  if (isMobile) {
    document.body.classList.add('mobile');
  }
  adjustHeight();
  starsParallax();
  scrollAnimation();
});
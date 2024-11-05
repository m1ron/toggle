const adjustHeight = () => {
  const doc = document.documentElement;
  const pageHeight = () => {
    doc.style.setProperty('--page-height', `${window.innerHeight}px`);
  }
  window.addEventListener('resize', pageHeight);
  pageHeight();
};

const initStars = () => {
  const stars = document.querySelector('.stars');
  let scroll = window.pageYOffset;
  let speed = 0.25;

  const pageScroll = () => {
    scroll = window.pageYOffset;
    stars.style.backgroundPositionY = `-${scroll * speed}px`;
  }

  window.addEventListener('scroll', pageScroll)
  pageScroll();
};

document.addEventListener("DOMContentLoaded", () => {
  adjustHeight();
  initStars();
  document.body.classList.add('inited');
});
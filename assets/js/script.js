const adjustHeight = () => {
  const doc = document.documentElement;
  const pageHeight = () => {
    doc.style.setProperty('--page-height', `${window.innerHeight}px`);
  }
  window.addEventListener('resize', pageHeight);
  pageHeight();
};

document.addEventListener("DOMContentLoaded", () => {
  adjustHeight();
  document.body.classList.add('inited');
});
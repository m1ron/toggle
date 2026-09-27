// Small helpers: debounce, width-only resize listener, promise-based wait.

const debounce = (fn, delay = 150) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
};

// Width changes only (ignores the mobile address bar)
export const onWidthResize = (fn) => {
  let width = window.innerWidth;
  window.addEventListener('resize', debounce(() => {
    if (window.innerWidth === width) return;
    width = window.innerWidth;
    fn();
  }));
};

export const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Text splitting for the animations: into lines (fade in one by one) or letters (light up in turn).

// One span per character
const wrapChars = (el, text, className) => {
  const spans = text.split('').map((char) => {
    const span = document.createElement('span');
    if (className) span.className = className;
    span.textContent = char;
    return span;
  });
  el.replaceChildren(...spans);
  return spans;
};

// `className`: the BEM element class of each line / letter
export const splitToLines = (el, className) => {
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
    div.className = className;
    div.textContent = line;
    return div;
  }));
};

export const splitToLetters = (el, className) => {
  wrapChars(el, el.innerText, className);
};

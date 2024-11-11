/** Zenscroll 4.0.2 * https://github.com/zengabor/zenscroll/ **/
!function(t,e){"function"==typeof define&&define.amd?define([],e()):"object"==typeof module&&module.exports?module.exports=e():function n(){document&&document.body?t.zenscroll=e():setTimeout(n,9)}()}(this,function(){"use strict";var t=function(t){return t&&"getComputedStyle"in window&&"smooth"===window.getComputedStyle(t)["scroll-behavior"]};if("undefined"==typeof window||!("document"in window))return{};var e=function(e,n,o){n=n||999,o||0===o||(o=9);var i,r=function(t){i=t},u=function(){clearTimeout(i),r(0)},c=function(t){return Math.max(0,e.getTopOf(t)-o)},a=function(o,i,c){if(u(),0===i||i&&i<0||t(e.body))e.toY(o),c&&c();else{var a=e.getY(),f=Math.max(0,o)-a,s=(new Date).getTime();i=i||Math.min(Math.abs(f),n),function t(){r(setTimeout(function(){var n=Math.min(1,((new Date).getTime()-s)/i),o=Math.max(0,Math.floor(a+f*(n<.5?2*n*n:n*(4-2*n)-1)));e.toY(o),n<1&&e.getHeight()+o<e.body.scrollHeight?t():(setTimeout(u,99),c&&c())},9))}()}},f=function(t,e,n){a(c(t),e,n)},s=function(t,n,i){var r=t.getBoundingClientRect().height,u=e.getTopOf(t)+r,s=e.getHeight(),l=e.getY(),d=l+s;c(t)<l||r+o>s?f(t,n,i):u+o>d?a(u-s+o,n,i):i&&i()},l=function(t,n,o,i){a(Math.max(0,e.getTopOf(t)-e.getHeight()/2+(o||t.getBoundingClientRect().height/2)),n,i)};return{setup:function(t,e){return(0===t||t)&&(n=t),(0===e||e)&&(o=e),{defaultDuration:n,edgeOffset:o}},to:f,toY:a,intoView:s,center:l,stop:u,moving:function(){return!!i},getY:e.getY,getTopOf:e.getTopOf}},n=document.documentElement,o=function(){return window.scrollY||n.scrollTop},i=e({body:document.scrollingElement||document.body,toY:function(t){window.scrollTo(0,t)},getY:o,getHeight:function(){return window.innerHeight||n.clientHeight},getTopOf:function(t){return t.getBoundingClientRect().top+o()-n.offsetTop}});if(i.createScroller=function(t,o,i){return e({body:t,toY:function(e){t.scrollTop=e},getY:function(){return t.scrollTop},getHeight:function(){return Math.min(t.clientHeight,window.innerHeight||n.clientHeight)},getTopOf:function(t){return t.offsetTop}},o,i)},"addEventListener"in window&&!window.noZensmooth&&!t(document.body)){var r="history"in window&&"pushState"in history,u=r&&"scrollRestoration"in history;u&&(history.scrollRestoration="auto"),window.addEventListener("load",function(){u&&(setTimeout(function(){history.scrollRestoration="manual"},9),window.addEventListener("popstate",function(t){t.state&&"zenscrollY"in t.state&&i.toY(t.state.zenscrollY)},!1)),window.location.hash&&setTimeout(function(){var t=i.setup().edgeOffset;if(t){var e=document.getElementById(window.location.href.split("#")[1]);if(e){var n=Math.max(0,i.getTopOf(e)-t),o=i.getY()-n;0<=o&&o<9&&window.scrollTo(0,n)}}},9)},!1);var c=new RegExp("(^|\\s)noZensmooth(\\s|$)");window.addEventListener("click",function(t){for(var e=t.target;e&&"A"!==e.tagName;)e=e.parentNode;if(!(!e||1!==t.which||t.shiftKey||t.metaKey||t.ctrlKey||t.altKey)){if(u){var n=history.state&&"object"==typeof history.state?history.state:{};n.zenscrollY=i.getY();try{history.replaceState(n,"")}catch(t){}}var o=e.getAttribute("href")||"";if(0===o.indexOf("#")&&!c.test(e.className)){var a=0,f=document.getElementById(o.substring(1));if("#"!==o){if(!f)return;a=i.getTopOf(f)}t.preventDefault();var s=function(){window.location=o},l=i.setup().edgeOffset;l&&(a=Math.max(0,a-l),r&&(s=function(){history.pushState({},"",o)})),i.toY(a,null,s)}}},!1)}return i});

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
  document.body.classList.add('inited');
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

const initAbout = () => {
  const about = document.querySelector('.about');
  const p = about.querySelector('.about__text');

  const onResize = () => {
    splitToLines(p);
  };

  const onAnimate = () => {
    setTimeout(function () {
      about.classList.add('done')
    }, 1000);
  };

  about.addEventListener('animate', onAnimate);
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
    }, 400);
  };

  commit.addEventListener('animate', onAnimate);
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

document.addEventListener('DOMContentLoaded', () => {
  if (isMobile) {
    document.body.classList.add('mobile');
  }
  adjustHeight();
  starsParallax();
  scrollAnimation();
  initAbout();
  initSuccess();
  initCommit();
  initTeam();
});
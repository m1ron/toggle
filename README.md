# toggle apps — landing page

Live: [toggleapps.sergeymiron.com](https://toggleapps.sergeymiron.com/) · Client site: [toggleapps.io](https://toggleapps.io/)

![toggle apps — Think Smart. Make Simple](public/og-image.jpg)

The marketing site for toggle apps, built from their Figma design. It's one long scroll story: pinned sections, a card stack that changes as you scroll, the headline flying onto the app screenshots, parallax glows. I also rebuilt the Privacy Policy and Terms pages in the same style and added a 404.

Plain HTML, SCSS and JavaScript on Vite, with GSAP ScrollTrigger for the scroll animations and Lenis for smooth scrolling. No framework. It scores 99–100 in Lighthouse on phones and desktop and has been checked in Chrome, Safari, Firefox, on iPhone and iPad.

## Running it

Node 20.19+ or 22.12+.

```bash
npm install
npm run dev       # http://localhost:5180
npm run build     # static site in dist/
npm run preview   # the built site at http://localhost:4180
```

## Where things are

The pages are `index.html`, `privacy-policy/`, `terms-of-service/` and `404.html`. Scripts and styles are split the same way in `assets/js` and `assets/scss`: `core` for shared helpers and variables, `layout` for the header, footer and loader, `components` for the page sections, one file per section. Every file starts with a line or two on what it does. Class names follow BEM.

## Worth knowing before you change things

- The order of the `init…()` calls in `main.js` matters: each pinned section shifts the scroll positions of everything created after it.
- Scroll effects work by GSAP setting a CSS variable on the element that uses it. Set it on that element directly, never on a parent or a `::before`/`::after`: Safari doesn't update values that come through inheritance.
- The loader waits only for the first screen. Large backgrounds further down load afterwards; if you add one, add it to the `html.is-bg-deferred` list in `core/_base.scss`.
- The email address isn't in the HTML as text (spam protection). It sits base64-encoded in `data-email` and the script decodes it.
- The build inlines the CSS into each page, so there's no separate stylesheet request.

## Hosting

The demo runs on Cloudflare Pages and rebuilds on every push to `main`: build command `npm run build`, output folder `dist`, with `NODE_VERSION=22` and `SITE_URL=https://toggleapps.sergeymiron.com` set in the project (`SITE_URL` fills in the social preview links). Any static host will do; `public/_headers` sets long-term caching for `/assets/`.

---

This is a portfolio copy of the client's site. The design, texts, images and brand belong to toggle apps sp. z o.o.; the code is here for reference only.

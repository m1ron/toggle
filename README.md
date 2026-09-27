# toggle apps — landing page

Single-page marketing website for [toggle apps](https://toggleapps.io/), built from a Figma design: a scroll-driven story with pinned sections, parallax and reveal animations.

![toggle apps — Think Smart. Make Simple](public/og-image.jpg)

**Lighthouse:** Performance 99 on mobile and 100 on desktop, 100 in Accessibility, Best Practices and SEO.

## Tech stack
- [Vite](https://vite.dev/) — dev server and build
- SCSS, autoprefixer via PostCSS
- [GSAP](https://gsap.com/) with ScrollTrigger — pins, scrubbed parallax, section triggers
- [Lenis](https://lenis.darkroom.engineering/) — smooth scroll, driven by the GSAP ticker so scrolling and ScrollTrigger update in the same frame
- Vanilla JS, no framework

## Getting started
Requires Node.js 20.19+ or 22.12+ (Vite 8).

```bash
npm install
npm run dev       # http://localhost:5180
npm run build     # static site in dist/
npm run preview   # serves dist/ at http://localhost:4180
```

## Project structure
```
index.html                  the whole page markup
assets/js/
  main.js                   entry: Lenis, init order
  core/                     env, utils, motion helpers (reveal, parallax, softPin), text splitting
  layout/                   loader, header (menu, anchor scroll), stars, footer
  components/               one module per page section
assets/scss/
  style.scss                entry
  core/                     variables, motion tokens, mixins, breakpoints, fonts, base styles
  layout/                   loader, header, main, stars, wrapper, footer
  components/               one file per page section, same names as in js/
  vendor/                   normalize, lenis
assets/img, assets/fonts    processed and hashed by Vite
public/                     copied as is: favicons, og-image.jpg, robots.txt
```

## Animation techniques
- **Soft pins.** Sections don't stop dead when they pin: the pin starts a little early and the content eases in and out over quadratic ramps (`softPin`), so scrolling feels continuous.
- **Scroll-scrubbed CSS variables.** GSAP animates custom properties (`--about-parallax`, `--cards-progress`, …) and CSS turns them into transforms, opacity and glows. Registered `@property` values give smooth hover transitions too.
- **Section reveals.** A section gets `.animated` when it reaches the lower quarter of the viewport. The entrance itself is CSS, using shared motion tokens.
- **Anchor navigation.** Menu links scroll at a constant speed with a gentle start and stop. Input is locked during the scroll and the clicked link stays highlighted until arrival.
- **Fixed footer reveal.** The footer sits under the page and is uncovered as the last section scrolls away.

## Performance
- **Loader.** The page stays hidden until the fonts and first-screen images are loaded and decoded, then fades in. Artwork below the fold (`html.defer-bg`) is requested only after that.
- **Inline CSS.** The build puts the whole stylesheet (~14 KB gzipped) into a `<style>` in `index.html` (`inlineCssPlugin` in `vite.config.js`), so there's no render-blocking request. JS stays external: it doesn't block rendering and is cached.
- **Images.** Large backgrounds are AVIF with a WebP/PNG fallback (`bg-image` mixin). Screenshots and cards are WebP with 2x/3x `srcset`. Logos and team avatars are WebP, and each screen downloads only its own header logo.
- **Fonts.** Inter is subset to the characters in use (5 KB). Both fonts are preloaded.

## Accessibility
- Semantic landmarks, a logical heading order, alt texts, and real `<button>`s for the menu and Copy.
- Keyboard focus shows the same effects as hover. Tabbing into the fixed footer scrolls it into view.
- **Reduced motion.** With `prefers-reduced-motion`, reveals become plain fades, looping animations and parallax are off, pins lose their soft ramps, anchor jumps are instant and the wheel scrolls natively.
- Works without JS: the loader is skipped and the page is shown as is.

## Email protection
The address isn't in the markup. `data-email` holds it base64-encoded and `initContacts` decodes it, similar to Cloudflare Email Obfuscation on the production site. Without JS the page shows `hello [at] toggleapps.io`.

## Browser support
The last 2 versions of evergreen browsers (`browserslist` in `package.json`). The minimum supported width is 320px.

## Deploy
Any static hosting works: deploy the `dist/` folder.

- Set `SITE_URL` (e.g. `https://example.com`) in the hosting build environment. It's used for the absolute Open Graph URLs (`og:url`, `og:image`); without it those tags are omitted.
- Recommended: long-term caching (`Cache-Control: public, max-age=31536000, immutable`) for `/assets/*`; the file names there contain content hashes.

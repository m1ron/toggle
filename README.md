# Toggle

Single-page marketing website for [toggle apps](https://toggleapps.io/): a scroll-driven story with pinned sections, parallax and reveal animations.

## Tech stack
- Vite
- SCSS (autoprefixer via PostCSS)
- GSAP with ScrollTrigger
- Lenis (smooth scroll, driven by the GSAP ticker)

## Install
`npm install`

## Dev mode
`npm run dev` — http://localhost:5180

## Build
`npm run build` — outputs the static site to `dist/`

## Preview the build
`npm run preview` — http://localhost:4180

## Project structure
- `index.html` — the whole page markup
- `assets/js/main.js` — loader, smooth scroll and every section's animation (`init*` functions)
- `assets/scss/` — `_var.scss` holds breakpoints, motion tokens and mixins; `layout/` and `section/` hold one file per block
- `assets/img/`, `assets/fonts/` — processed and hashed by Vite
- `public/` — copied as is (favicons, `og-image.jpg`, `robots.txt`)

## How it works
- **Loader.** The page stays hidden until the fonts and first-screen images are loaded and decoded. Artwork below the fold (`html.defer-bg`) is requested only after that.
- **Inline CSS.** The build puts the whole stylesheet into a `<style>` in `index.html` (`inlineCssPlugin` in `vite.config.js`), so there's no render-blocking request.
- **Images.** Large backgrounds are AVIF with a WebP/PNG fallback (`bg-image` mixin). Screenshots and logos are WebP.
- **Email.** The address isn't in the markup: `data-email` holds it base64-encoded, and `initContacts` decodes it (spam protection, similar to Cloudflare Email Obfuscation). Without JS the page shows `hello [at] toggleapps.io`.
- **Reduced motion.** With `prefers-reduced-motion`, reveals become plain fades, looping animations and parallax are off, pins lose their soft ramps, anchor jumps are instant and the wheel scrolls natively.
- **Accessibility.** Keyboard focus shows the same effects as hover. Tabbing into the fixed footer scrolls to the bottom so it's visible.

## Deploy
Any static hosting works: deploy the `dist/` folder.

Set `SITE_URL` (e.g. `https://example.com`) in the hosting build environment.
It is used for the absolute Open Graph URLs (`og:url`, `og:image`); without it those tags are omitted.

Recommended: long-term caching (`Cache-Control: public, max-age=31536000, immutable`) for `/assets/*`; the file names there contain content hashes.

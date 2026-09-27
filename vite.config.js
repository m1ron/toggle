import { defineConfig } from 'vite';

// Public URL of the deployed site (set on the hosting platform), used for Open Graph tags.
// Without it the tags that need an absolute URL (and the og:image details) are dropped.
const siteUrl = (process.env.SITE_URL || '').replace(/\/$/, '');

const siteUrlPlugin = {
  name: 'site-url',
  transformIndexHtml: (html) => siteUrl
    ? html.replaceAll('%SITE_URL%', siteUrl)
    : html.replace(/^.*(%SITE_URL%|og:image:).*\n/gm, ''),
};

// Each page's stylesheet goes inline (~14 KB gzipped): no render-blocking request.
// A "critical" subset isn't worth it here: the entire page is in the markup, so it would be ~80% of the file anyway.
// Pages may share a stylesheet (privacy / terms), so the files are removed only once all pages are done.
const inlined = new Set();
const inlineCssPlugin = {
  name: 'inline-css',
  apply: 'build',
  enforce: 'post',
  transformIndexHtml(html, { bundle }) {
    return html.replace(/<link rel="stylesheet"[^>]*href="\/([^"]+\.css)"[^>]*>/g, (link, fileName) => {
      const asset = bundle[fileName];
      if (!asset) return link;
      inlined.add(fileName);
      return `<style>${asset.source}</style>`;
    });
  },
  generateBundle: {
    order: 'post',
    handler(options, bundle) {
      for (const fileName of inlined) delete bundle[fileName];
    },
  },
};

export default defineConfig({
  plugins: [siteUrlPlugin, inlineCssPlugin],
  // Several pages: missing addresses get a 404 (404.html) instead of the landing page
  appType: 'mpa',
  server: {
    host: true,
    port: 5180,
    strictPort: true,
  },
  preview: {
    port: 4180,
    strictPort: true,
  },
  css: {
    devSourcemap: true,
  },
  build: {
    rollupOptions: {
      input: {
        main: 'index.html',
        privacy: 'privacy-policy/index.html',
        terms: 'terms-of-service/index.html',
        notFound: '404.html',
      },
    },
  },
});

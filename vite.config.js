import { defineConfig } from 'vite';

// Public URL of the deployed site (set on the hosting platform), used for Open Graph tags.
// Without it the tags that need an absolute URL are dropped instead of pointing nowhere.
const siteUrl = (process.env.SITE_URL || '').replace(/\/$/, '');

const siteUrlPlugin = {
  name: 'site-url',
  transformIndexHtml: (html) => siteUrl
    ? html.replaceAll('%SITE_URL%', siteUrl)
    : html.replace(/^.*%SITE_URL%.*\n/gm, ''),
};

// The whole stylesheet (~14 KB gzipped) goes inline: no render-blocking request.
// A "critical" subset isn't worth it here: the entire page is in the markup, so it would be ~80% of the file anyway.
const inlineCssPlugin = {
  name: 'inline-css',
  apply: 'build',
  enforce: 'post',
  transformIndexHtml(html, { bundle }) {
    return html.replace(/<link rel="stylesheet"[^>]*href="\/([^"]+\.css)"[^>]*>/g, (link, fileName) => {
      const asset = bundle[fileName];
      if (!asset) return link;
      delete bundle[fileName];
      return `<style>${asset.source}</style>`;
    });
  },
};

export default defineConfig({
  plugins: [siteUrlPlugin, inlineCssPlugin],
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
});

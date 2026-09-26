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

export default defineConfig({
  plugins: [siteUrlPlugin],
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

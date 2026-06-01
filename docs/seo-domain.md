# SEO Domain Placeholders

The SEO metadata currently uses `https://example.com` as the production-domain placeholder.

Before deploying to production, replace that domain in:

- `index.html`
- `public/robots.txt`
- `public/sitemap.xml`

Only public routes should be listed in `public/sitemap.xml`. Keep protected app routes such as `/dashboard`, `/shop`, `/profile`, `/map`, `/lesson`, and `/battle` out of the sitemap unless they become public pages.

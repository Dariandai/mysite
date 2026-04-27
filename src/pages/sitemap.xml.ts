import type { APIRoute } from 'astro';

const pages = [
  { url: '', changefreq: 'weekly', priority: 1.0 },
  { url: 'about', changefreq: 'monthly', priority: 0.8 },
  { url: 'blog', changefreq: 'weekly', priority: 0.9 },
  { url: 'portfolio', changefreq: 'monthly', priority: 0.9 },
  { url: 'share', changefreq: 'monthly', priority: 0.7 },
  { url: 'blog/brain-science', changefreq: 'monthly', priority: 0.6 },
  { url: 'blog/luo-yonghao-liu-qian', changefreq: 'monthly', priority: 0.6 },
  { url: 'blog/local-ai', changefreq: 'monthly', priority: 0.6 },
  { url: 'blog/digital-garden', changefreq: 'monthly', priority: 0.6 },
  { url: 'portfolio/project-alpha', changefreq: 'monthly', priority: 0.7 },
  { url: 'portfolio/system-ui', changefreq: 'monthly', priority: 0.7 },
];

export const GET: APIRoute = () => {
  const today = new Date().toISOString().split('T')[0];
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages
  .map(
    (page) => `  <url>
    <loc>https://dar1an.dpdns.org/${page.url}</loc>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
    <lastmod>${today}</lastmod>
  </url>`,
  )
  .join('\n')}
</urlset>`;

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};

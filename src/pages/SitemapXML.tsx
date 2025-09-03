import { useEffect } from "react";
import { useArticles, useCategories } from "@/hooks/use-articles";

export default function SitemapXML() {
  const { data: articlesData } = useArticles(undefined, 1, 1000); // Get many articles for sitemap
  const { data: categories } = useCategories();

  useEffect(() => {
    if (articlesData?.articles && categories) {
      const sitemapXml = generateSitemap(articlesData.articles, categories);
      
      // Replace the current page with the sitemap
      window.location.replace(`data:application/xml;charset=utf-8,${encodeURIComponent(sitemapXml)}`);
    }
  }, [articlesData, categories]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Generating Sitemap...</h1>
        <p className="text-muted-foreground">
          Please wait while we generate your sitemap.
        </p>
      </div>
    </div>
  );
}

function generateSitemap(articles: any[], categories: any[]) {
  const baseUrl = window.location.origin;
  const currentDate = new Date().toISOString().split('T')[0];

  // Homepage
  let urlEntries = `
  <url>
    <loc>${baseUrl}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>`;

  // Category pages
  categories.forEach(category => {
    urlEntries += `
  <url>
    <loc>${baseUrl}/category/${category.slug}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>`;
  });

  // Article pages
  articles.forEach(article => {
    const lastmod = article.updated_at ? new Date(article.updated_at).toISOString().split('T')[0] : currentDate;
    urlEntries += `
  <url>
    <loc>${baseUrl}/article/${article.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`;
  });

  // RSS Feed
  urlEntries += `
  <url>
    <loc>${baseUrl}/rss</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.5</priority>
  </url>`;

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>`;
}
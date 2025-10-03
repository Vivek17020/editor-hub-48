import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Use environment variables without VITE_ prefix for serverless functions
    const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing Supabase configuration', { supabaseUrl: !!supabaseUrl, supabaseKey: !!supabaseKey });
      throw new Error('Missing Supabase configuration');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch recent articles (last 2 days for Google News)
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

    const { data: articles, error } = await supabase
      .from('articles')
      .select(`
        id,
        title,
        slug,
        excerpt,
        published,
        published_at,
        created_at,
        image_url,
        tags,
        categories (
          name
        )
      `)
      .eq('published', true)
      .gte('published_at', twoDaysAgo.toISOString())
      .order('published_at', { ascending: false });

    if (error) {
      console.error('Error fetching articles:', error);
      throw error;
    }

    const newsSitemapXml = generateNewsSitemap(articles || []);

    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
    res.status(200).send(newsSitemapXml);
  } catch (error) {
    console.error('News sitemap generation error:', error);
    res.status(500).json({ error: 'Failed to generate news sitemap' });
  }
}

function generateNewsSitemap(articles) {
  const baseUrl = "https://thebulletinbriefs.in";
  
  const urlEntries = articles.map(article => {
    const publishDate = article.published_at ? new Date(article.published_at) : new Date(article.created_at);
    const formattedDate = publishDate.toISOString();
    const categoryName = article.categories?.name || 'news';
    const keywords = article.tags?.join(', ') || categoryName;
    
    return `  <url>
    <loc>${baseUrl}/article/${article.slug}</loc>
    <news:news>
      <news:publication>
        <news:name>TheBulletinBriefs</news:name>
        <news:language>en</news:language>
      </news:publication>
      <news:publication_date>${formattedDate}</news:publication_date>
      <news:title><![CDATA[${article.title}]]></news:title>
      <news:keywords><![CDATA[${keywords}]]></news:keywords>
    </news:news>
    <image:image>
      <image:loc>${article.image_url || `${baseUrl}/og-image.jpg`}</image:loc>
      <image:title><![CDATA[${article.title}]]></image:title>
      <image:caption><![CDATA[${article.excerpt || article.title}]]></image:caption>
    </image:image>
    <lastmod>${formattedDate}</lastmod>
    <changefreq>hourly</changefreq>
    <priority>0.9</priority>
  </url>`;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urlEntries}
</urlset>`;
}

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { articleId } = await req.json();
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Fetch the article
    const { data: article, error } = await supabaseClient
      .from("articles")
      .select("slug")
      .eq("id", articleId)
      .eq("published", true)
      .single();

    if (error || !article) {
      console.error('Article not found:', error);
      throw new Error('Article not found');
    }

    const baseUrl = "https://thebulletinbriefs.in";
    const articleUrl = `${baseUrl}/article/${article.slug}`;
    const sitemapUrl = `${baseUrl}/sitemap.xml`;

    // 1. Ping Google's sitemap service
    try {
      await fetch(`https://www.google.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`);
      console.log('Google sitemap ping sent');
    } catch (err) {
      console.error('Google ping failed:', err);
    }

    // 2. Submit to IndexNow (Bing, Yandex, etc.)
    try {
      await fetch('https://api.indexnow.org/indexnow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          host: 'thebulletinbriefs.in',
          key: 'e5d4c3b2a1f0e9d8c7b6a5f4e3d2c1b0',
          keyLocation: `${baseUrl}/e5d4c3b2a1f0e9d8c7b6a5f4e3d2c1b0.txt`,
          urlList: [articleUrl]
        })
      });
      console.log('IndexNow submission sent');
    } catch (err) {
      console.error('IndexNow submission failed:', err);
    }

    // 3. Ping Bing directly
    try {
      await fetch(`https://www.bing.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`);
      console.log('Bing sitemap ping sent');
    } catch (err) {
      console.error('Bing ping failed:', err);
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Search engines notified' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Notify search engines error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to notify search engines' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

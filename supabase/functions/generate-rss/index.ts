import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.81.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch all published articles from both languages
    const { data: articles, error } = await supabase
      .from('articles')
      .select('*')
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error fetching articles:', error);
      throw error;
    }

    const baseUrl = 'https://www.weedmadrid.com';
    const buildDate = new Date().toUTCString();

    // Generate RSS feed XML
    const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" 
     xmlns:content="http://purl.org/rss/1.0/modules/content/"
     xmlns:dc="http://purl.org/dc/elements/1.1/"
     xmlns:atom="http://www.w3.org/2005/Atom"
     xmlns:media="http://search.yahoo.com/mrss/">
  <channel>
    <title>Weed Madrid - Cannabis Clubs Guide</title>
    <link>${baseUrl}</link>
    <description>Expert guides on Madrid cannabis clubs, legal information, and tourism tips for cannabis enthusiasts visiting Spain</description>
    <language>en</language>
    <lastBuildDate>${buildDate}</lastBuildDate>
    <atom:link href="${baseUrl}/api/rss" rel="self" type="application/rss+xml"/>
    <image>
      <url>${baseUrl}/logo.png</url>
      <title>Weed Madrid</title>
      <link>${baseUrl}</link>
    </image>
    <copyright>Copyright ${new Date().getFullYear()} Weed Madrid. All rights reserved.</copyright>
    <managingEditor>info@weedmadrid.com (Weed Madrid Editorial Team)</managingEditor>
    <webMaster>info@weedmadrid.com (Weed Madrid Tech Team)</webMaster>
    <category>Travel</category>
    <category>Cannabis</category>
    <category>Madrid</category>
    <category>Tourism</category>
${articles?.map(article => {
  const languagePrefix = article.language === 'es' ? '/es' : '';
  const articleUrl = `${baseUrl}${languagePrefix}/guide/${article.slug}`;
  const pubDate = new Date(article.published_at).toUTCString();
  
  // Clean markdown for description (remove markdown syntax)
  const cleanDescription = (article.excerpt || article.seo_description || '')
    .replace(/[#*_\[\]()]/g, '')
    .substring(0, 300);
  
  return `    <item>
      <title><![CDATA[${article.title}]]></title>
      <link>${articleUrl}</link>
      <guid isPermaLink="true">${articleUrl}</guid>
      <description><![CDATA[${cleanDescription}]]></description>
      <pubDate>${pubDate}</pubDate>
      <dc:creator><![CDATA[${article.author_name}]]></dc:creator>
      <category><![CDATA[${article.category}]]></category>
      ${article.tags?.map((tag: string) => `<category><![CDATA[${tag}]]></category>`).join('\n      ') || ''}
      ${article.cover_image_url ? `<media:content url="${article.cover_image_url}" medium="image" type="image/jpeg">
        <media:title type="plain">${article.title}</media:title>
      </media:content>` : ''}
      <content:encoded><![CDATA[
        ${article.cover_image_url ? `<img src="${article.cover_image_url}" alt="${article.title}" style="max-width: 100%; height: auto; margin-bottom: 1rem;" />` : ''}
        <p><strong>${article.subtitle || ''}</strong></p>
        <p>${cleanDescription}</p>
        <p><a href="${articleUrl}">Read full article on Weed Madrid</a></p>
      ]]></content:encoded>
    </item>`;
}).join('\n')}
  </channel>
</rss>`;

    return new Response(rssXml, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/rss+xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    console.error('Error generating RSS feed:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
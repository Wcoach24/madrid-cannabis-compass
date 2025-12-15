import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { contentType, contentId, targetLanguage, sourceLanguage = 'en' } = await req.json();
    
    if (!contentType || !contentId || !targetLanguage) {
      throw new Error('Missing required fields: contentType, contentId, targetLanguage');
    }

    // Get Lovable API key
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Fetch source content from Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const tableName = contentType === 'article' ? 'articles' : 'faq';
    const fetchResponse = await fetch(`${supabaseUrl}/rest/v1/${tableName}?id=eq.${contentId}&select=*`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
      },
    });

    const sourceData = await fetchResponse.json();
    if (!sourceData || sourceData.length === 0) {
      throw new Error(`Content not found: ${contentType} ${contentId}`);
    }

    const source = sourceData[0];

    // Build translation prompt based on content type
    let systemPrompt = '';
    let userPrompt = '';

    if (contentType === 'article') {
      systemPrompt = `You are a professional translator specializing in cannabis industry content. Translate the following article from ${sourceLanguage.toUpperCase()} to ${targetLanguage.toUpperCase()}.

CRITICAL REQUIREMENTS:
- Maintain markdown formatting exactly
- Keep all headers, lists, and formatting
- Translate naturally, not word-for-word
- Use appropriate cultural references for ${targetLanguage}
- Maintain SEO-friendly language
- Keep legal disclaimers accurate
- DO NOT translate proper nouns (club names, place names, "Madrid")
- Maintain the professional, educational tone

Return ONLY the translated markdown body. No explanations.`;

      userPrompt = `Title: ${source.title}
Subtitle: ${source.subtitle || ''}
Body:
${source.body_markdown}`;

    } else if (contentType === 'faq') {
      systemPrompt = `You are a professional translator specializing in cannabis industry content. Translate this FAQ from ${sourceLanguage.toUpperCase()} to ${targetLanguage.toUpperCase()}.

CRITICAL REQUIREMENTS:
- Translate question and answer naturally
- Maintain markdown formatting in answer
- Use culturally appropriate phrasing
- Keep legal information accurate
- Return as JSON: { "question": "...", "answer": "..." }`;

      userPrompt = `Question: ${source.question}
Answer: ${source.answer_markdown}`;
    }

    // Call Lovable AI API for translation
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.3,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      throw new Error(`AI API error: ${aiResponse.status} - ${errorText}`);
    }

    const aiData = await aiResponse.json();
    const translatedContent = aiData.choices[0].message.content;

    // Build data for upsert - only language as base (status/published_at only for articles)
    let upsertData: any = {
      language: targetLanguage,
    };

    let slug = '';

    if (contentType === 'article') {
      // Generate slug for target language - use base slug without language suffix
      const baseSlug = source.slug.replace(/-(en|es|de|fr|it)$/, '');
      slug = `${baseSlug}-${targetLanguage}`;
      
      upsertData = {
        ...upsertData,
        status: 'published',
        published_at: new Date().toISOString(),
        title: translatedContent.split('\n')[0].replace('# ', ''),
        slug,
        body_markdown: translatedContent,
        excerpt: source.excerpt,
        subtitle: source.subtitle,
        category: source.category,
        author_name: source.author_name,
        author_bio: source.author_bio,
        seo_title: source.seo_title,
        seo_description: source.seo_description,
        cover_image_url: source.cover_image_url,
        tags: source.tags,
        is_featured: source.is_featured,
      };
    } else if (contentType === 'faq') {
      // Clean the response - remove markdown code blocks if present
      let cleanedContent = translatedContent.trim();
      if (cleanedContent.startsWith('```json')) {
        cleanedContent = cleanedContent.slice(7);
      } else if (cleanedContent.startsWith('```')) {
        cleanedContent = cleanedContent.slice(3);
      }
      if (cleanedContent.endsWith('```')) {
        cleanedContent = cleanedContent.slice(0, -3);
      }
      cleanedContent = cleanedContent.trim();
      
      const faqData = JSON.parse(cleanedContent);
      const baseSlug = source.slug.replace(/-(en|es|de|fr|it)$/, '');
      slug = `${baseSlug}-${targetLanguage}`;
      
      // FAQ table doesn't have status or published_at columns
      upsertData = {
        language: targetLanguage,
        question: faqData.question,
        answer_markdown: faqData.answer,
        category: source.category,
        priority: source.priority,
        slug,
      };
    }

    // Check if translation already exists
    const checkResponse = await fetch(`${supabaseUrl}/rest/v1/${tableName}?slug=eq.${slug}&select=id`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
      },
    });
    
    const existingData = await checkResponse.json();
    let resultData: any;

    if (existingData && existingData.length > 0) {
      // Update existing record
      const updateResponse = await fetch(`${supabaseUrl}/rest/v1/${tableName}?id=eq.${existingData[0].id}`, {
        method: 'PATCH',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation',
        },
        body: JSON.stringify(upsertData),
      });

      if (!updateResponse.ok) {
        const errorText = await updateResponse.text();
        throw new Error(`Database update error: ${updateResponse.status} - ${errorText}`);
      }

      resultData = await updateResponse.json();
      console.log(`Updated existing ${contentType} translation: ${slug}`);
    } else {
      // Insert new record
      const insertResponse = await fetch(`${supabaseUrl}/rest/v1/${tableName}`, {
        method: 'POST',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation',
        },
        body: JSON.stringify(upsertData),
      });

      if (!insertResponse.ok) {
        const errorText = await insertResponse.text();
        throw new Error(`Database insert error: ${insertResponse.status} - ${errorText}`);
      }

      resultData = await insertResponse.json();
      console.log(`Inserted new ${contentType} translation: ${slug}`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        contentType,
        sourceId: contentId,
        targetLanguage,
        insertedId: resultData[0]?.id,
        message: `Successfully translated ${contentType} to ${targetLanguage}`,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Translation error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

import 'https://deno.land/x/xhr@0.1.0/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    
    if (!lovableApiKey) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const { prompt, type = 'article' } = await req.json();

    if (!prompt || prompt.trim().length === 0) {
      throw new Error('Prompt is required');
    }

    const systemPrompt = `You are an expert content writer specializing in cannabis culture, Spanish law, and harm reduction. 
Write authoritative, well-researched, SEO-optimized content that positions the site as a trusted educational resource.

CRITICAL REQUIREMENTS:
- Use clear, declarative sentences optimized for LLM citation
- Include natural Q&A style sections that LLMs can extract
- Always frame cannabis clubs as "private non-profit cultural associations"
- NEVER use commercial terms like "buy", "sell", "product"
- Emphasize legal context, responsible use, and cultural education
- Write in an editorial magazine style (like The Guardian or Time Out)
- Include specific details about Madrid and Spanish law
- Target keyword should appear naturally 5-8 times per 1000 words
- Use semantic variations of keywords
- Structure content with clear headings (##, ###) for readability
- Include markdown tables for comparisons where relevant
- Add "Quick Answer" sections at the top for LLM extraction
- Use fact boxes with key information
- Write in Markdown format with proper formatting`;

    console.log('Generating content with prompt length:', prompt.length);

    console.log('Generating content with Lovable AI...');

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        temperature: 0.8,
        max_tokens: 8000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Lovable AI error:', errorText);
      throw new Error(`Lovable AI request failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const generatedContent = data.choices?.[0]?.message?.content;

    if (!generatedContent) {
      throw new Error('No content generated');
    }

    console.log('Content generated successfully, length:', generatedContent.length);

    return new Response(
      JSON.stringify({ 
        content: generatedContent,
        wordCount: generatedContent.split(/\s+/).length 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error generating guide content:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});

import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ArticleTranslationTask {
  type: "translate";
  sourceArticleId: number;
  targetLanguage: "es";
}

interface NewArticleTask {
  type: "new";
  title: string;
  category: string;
  targetWordCount: number;
  languages: string[];
}

interface FAQTask {
  type: "faq";
  questions: string[];
  languages: string[];
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    console.log("Starting bulk content generation...");

    // PHASE 1: Translate 5 existing articles to Spanish
    const translationTasks: ArticleTranslationTask[] = [
      { type: "translate", sourceArticleId: 10, targetLanguage: "es" }, // Best Clubs
      { type: "translate", sourceArticleId: 12, targetLanguage: "es" }, // How to Join
      { type: "translate", sourceArticleId: 11, targetLanguage: "es" }, // Complete Guide
      { type: "translate", sourceArticleId: 13, targetLanguage: "es" }, // Cannabis Tourism
      { type: "translate", sourceArticleId: 15, targetLanguage: "es" }, // Cannabis Laws
    ];

    // PHASE 2: Create 3 new pillar articles (EN + ES)
    const newArticleTasks: NewArticleTask[] = [
      {
        type: "new",
        title: "Cannabis Club Near Me Madrid: District Guide",
        category: "Guide",
        targetWordCount: 2000,
        languages: ["en", "es"]
      },
      {
        type: "new",
        title: "Cannabis Club Madrid for Tourists: Complete 2025 Guide",
        category: "Guide",
        targetWordCount: 1800,
        languages: ["en", "es"]
      },
      {
        type: "new",
        title: "Best Weed Clubs Madrid: Top 10 Rated for 2025",
        category: "Guide",
        targetWordCount: 2000,
        languages: ["en", "es"]
      }
    ];

    // PHASE 3: Expand FAQ to 30 entries (15 new in EN + ES)
    const newFAQQuestions = [
      "Where is the closest cannabis club to Gran Vía?",
      "Where is the closest cannabis club to Puerta del Sol?",
      "Can American tourists join cannabis clubs in Madrid?",
      "Can British tourists join cannabis clubs in Madrid?",
      "Which is the best cannabis club in Madrid for tourists?",
      "Which is the safest cannabis club in Madrid?",
      "Which cannabis clubs in Madrid are open late?",
      "Do I need to speak Spanish to join a cannabis club?",
      "How long does the invitation process take?",
      "Can I visit multiple cannabis clubs in Madrid?",
      "What happens if I lose my invitation code?",
      "Are cannabis clubs in Madrid safe for solo travelers?",
      "Can I bring a friend who doesn't consume cannabis?",
      "What types of cannabis products are available at Madrid clubs?",
      "Do cannabis clubs in Madrid accept credit cards?"
    ];

    const results = {
      translations: [] as any[],
      newArticles: [] as any[],
      newFAQs: [] as any[],
      errors: [] as any[]
    };

    // PHASE 1: Process translations
    console.log("Phase 1: Translating 5 articles to Spanish...");
    for (const task of translationTasks) {
      try {
        const { data: sourceArticle } = await supabase
          .from("articles")
          .select("*")
          .eq("id", task.sourceArticleId)
          .single();

        if (!sourceArticle) {
          throw new Error(`Source article ${task.sourceArticleId} not found`);
        }

        console.log(`Translating: ${sourceArticle.title}`);

        const translationPrompt = `You are a professional translator specializing in cannabis tourism content. 

Translate the following article from English to Spanish. Maintain the same structure, tone, and SEO optimization.

IMPORTANT:
- Keep all markdown formatting intact
- Translate the title, subtitle, excerpt, body, and SEO fields
- Use natural, fluent Spanish appropriate for international tourists
- Maintain keyword density for SEO ("cannabis club madrid", "club de cannabis madrid")
- Keep legal terminology accurate

Original Article:
Title: ${sourceArticle.title}
Subtitle: ${sourceArticle.subtitle || ""}
Excerpt: ${sourceArticle.excerpt || ""}
Body: ${sourceArticle.body_markdown}

SEO Title: ${sourceArticle.seo_title || ""}
SEO Description: ${sourceArticle.seo_description || ""}

Return ONLY a JSON object with these fields:
{
  "title": "translated title",
  "subtitle": "translated subtitle",
  "excerpt": "translated excerpt",
  "body_markdown": "translated markdown body",
  "seo_title": "translated SEO title (max 60 chars)",
  "seo_description": "translated SEO description (max 160 chars)",
  "slug": "url-friendly-spanish-slug"
}`;

        const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "openai/gpt-5",
            messages: [
              { role: "system", content: "You are a professional translator. Return only valid JSON." },
              { role: "user", content: translationPrompt }
            ],
          }),
        });

        if (!aiResponse.ok) {
          throw new Error(`AI API error: ${aiResponse.status}`);
        }

        const aiData = await aiResponse.json();
        let contentText = aiData.choices?.[0]?.message?.content;
        
        if (!contentText) {
          throw new Error('No content in AI response');
        }

        // Remove markdown code blocks if present
        contentText = contentText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        
        const translatedContent = JSON.parse(contentText);

        // Insert Spanish translation
        const { data: insertedArticle, error: insertError } = await supabase
          .from("articles")
          .insert({
            title: translatedContent.title,
            subtitle: translatedContent.subtitle,
            excerpt: translatedContent.excerpt,
            body_markdown: translatedContent.body_markdown,
            slug: translatedContent.slug,
            seo_title: translatedContent.seo_title,
            seo_description: translatedContent.seo_description,
            language: "es",
            category: sourceArticle.category,
            author_name: sourceArticle.author_name,
            author_bio: sourceArticle.author_bio,
            cover_image_url: sourceArticle.cover_image_url,
            tags: sourceArticle.tags,
            is_featured: sourceArticle.is_featured,
            status: "published",
            published_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (insertError) throw insertError;

        results.translations.push({
          original: sourceArticle.title,
          translated: translatedContent.title,
          slug: translatedContent.slug
        });

        console.log(`✓ Translated: ${translatedContent.title}`);
      } catch (error) {
        console.error(`Error translating article ${task.sourceArticleId}:`, error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        results.errors.push({ task: `translate-${task.sourceArticleId}`, error: errorMessage });
      }
    }

    // PHASE 2: Create new articles
    console.log("Phase 2: Creating 3 new pillar articles (EN + ES)...");
    for (const task of newArticleTasks) {
      for (const lang of task.languages) {
        try {
          console.log(`Generating: ${task.title} (${lang})`);

          const articlePrompt = `You are an expert content writer specializing in cannabis tourism and SEO.

Create a comprehensive, SEO-optimized article with the following specifications:

Title: ${task.title}
Language: ${lang === "en" ? "English" : "Spanish"}
Target Word Count: ${task.targetWordCount}
Category: ${task.category}

Requirements:
- Write in ${lang === "en" ? "English" : "Spanish"}
- Create a compelling, informative article optimized for Google search
- Include H2 and H3 headings (using ## and ###)
- Add Quick Answer boxes, fact boxes, and comparison tables where appropriate
- Optimize for keywords: "cannabis club madrid", "weed club madrid", "best cannabis clubs"
- Include practical advice for tourists
- Mention legal framework and safety
- Write in an engaging, authoritative tone
- Use markdown formatting
- Include internal linking suggestions (mark as [link text](/suggested-page))

Return ONLY a JSON object with these fields:
{
  "title": "article title",
  "subtitle": "compelling subtitle",
  "excerpt": "150-200 char summary",
  "body_markdown": "full markdown article content",
  "seo_title": "SEO-optimized title (max 60 chars)",
  "seo_description": "SEO description (max 160 chars)",
  "slug": "url-friendly-slug",
  "tags": ["tag1", "tag2", "tag3"]
}`;

          const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${LOVABLE_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "openai/gpt-5",
              messages: [
                { role: "system", content: "You are an expert SEO content writer. Return only valid JSON." },
                { role: "user", content: articlePrompt }
              ],
            }),
          });

          if (!aiResponse.ok) {
            throw new Error(`AI API error: ${aiResponse.status}`);
          }

          const aiData = await aiResponse.json();
          let contentText = aiData.choices?.[0]?.message?.content;
          
          if (!contentText) {
            throw new Error('No content in AI response');
          }

          // Remove markdown code blocks if present
          contentText = contentText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
          
          const articleContent = JSON.parse(contentText);

          // Insert article
          const { data: insertedArticle, error: insertError } = await supabase
            .from("articles")
            .insert({
              title: articleContent.title,
              subtitle: articleContent.subtitle,
              excerpt: articleContent.excerpt,
              body_markdown: articleContent.body_markdown,
              slug: articleContent.slug,
              seo_title: articleContent.seo_title,
              seo_description: articleContent.seo_description,
              language: lang,
              category: task.category,
              author_name: "Weed Madrid Editorial Team",
              author_bio: "Expert team specializing in cannabis tourism and Spanish cannabis legislation.",
              cover_image_url: "/images/articles/default-hero.jpg",
              tags: articleContent.tags,
              is_featured: true,
              status: "published",
              published_at: new Date().toISOString(),
            })
            .select()
            .single();

          if (insertError) throw insertError;

          results.newArticles.push({
            title: articleContent.title,
            slug: articleContent.slug,
            language: lang
          });

          console.log(`✓ Created: ${articleContent.title} (${lang})`);
        } catch (error) {
          console.error(`Error creating article ${task.title} (${lang}):`, error);
          const errorMessage = error instanceof Error ? error.message : String(error);
          results.errors.push({ task: `new-${task.title}-${lang}`, error: errorMessage });
        }
      }
    }

    // PHASE 3: Create FAQ entries
    console.log("Phase 3: Creating 15 new FAQ entries (EN + ES)...");
    for (const question of newFAQQuestions) {
      for (const lang of ["en", "es"]) {
        try {
          console.log(`Generating FAQ: ${question} (${lang})`);

          const faqPrompt = `You are a cannabis tourism expert. Answer this FAQ question in ${lang === "en" ? "English" : "Spanish"}.

Question: ${question}

Requirements:
- Write in ${lang === "en" ? "English" : "Spanish"}
- Provide a clear, informative answer (150-300 words)
- Use markdown formatting
- Be factually accurate about Spanish cannabis law
- Include practical advice for tourists
- Use a helpful, authoritative tone
- Optimize for voice search and AI assistants

Return ONLY a JSON object:
{
  "question": "the question in ${lang === "en" ? "English" : "Spanish"}",
  "answer": "the answer in markdown",
  "category": "category (legal, membership, tourist, safety, or general)",
  "slug": "url-friendly-slug"
}`;

          const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${LOVABLE_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "google/gemini-2.5-flash",
              messages: [
                { role: "system", content: "You are an expert FAQ writer. Return only valid JSON." },
                { role: "user", content: faqPrompt }
              ],
            }),
          });

          if (!aiResponse.ok) {
            throw new Error(`AI API error: ${aiResponse.status}`);
          }

          const aiData = await aiResponse.json();
          let contentText = aiData.choices?.[0]?.message?.content;
          
          if (!contentText) {
            throw new Error('No content in AI response');
          }

          // Remove markdown code blocks if present
          contentText = contentText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
          
          const faqContent = JSON.parse(contentText);

          // Insert FAQ
          const { error: insertError } = await supabase
            .from("faq")
            .insert({
              question: faqContent.question,
              answer_markdown: faqContent.answer,
              slug: faqContent.slug,
              category: faqContent.category,
              language: lang,
              priority: 100,
            });

          if (insertError) throw insertError;

          results.newFAQs.push({
            question: faqContent.question,
            language: lang
          });

          console.log(`✓ Created FAQ: ${faqContent.question.substring(0, 50)}... (${lang})`);
        } catch (error) {
          console.error(`Error creating FAQ ${question} (${lang}):`, error);
          const errorMessage = error instanceof Error ? error.message : String(error);
          results.errors.push({ task: `faq-${question}-${lang}`, error: errorMessage });
        }
      }
    }

    console.log("Bulk content generation complete!");
    console.log(`Translations: ${results.translations.length}`);
    console.log(`New Articles: ${results.newArticles.length}`);
    console.log(`New FAQs: ${results.newFAQs.length}`);
    console.log(`Errors: ${results.errors.length}`);

    return new Response(JSON.stringify({
      success: true,
      summary: {
        translations: results.translations.length,
        newArticles: results.newArticles.length,
        newFAQs: results.newFAQs.length,
        errors: results.errors.length
      },
      details: results
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Bulk generation error:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;
    return new Response(JSON.stringify({ 
      error: errorMessage,
      stack: errorStack 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

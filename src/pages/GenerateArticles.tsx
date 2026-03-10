import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { BookOpen, Loader2 } from "lucide-react";

const PILLAR_ARTICLES = [
  {
    slug: "best-cannabis-clubs-madrid",
    title: "Best Cannabis Clubs in Madrid 2025: Complete Guide & Rankings",
    category: "guide",
    prompt: `Write a comprehensive 2000+ word SEO-optimized article titled "Best Cannabis Clubs in Madrid 2025: Complete Guide & Rankings".

Structure with these sections:
1. Quick Answer (2-3 sentences for LLM citation)
2. Introduction (why this guide matters, what makes a club "best")
3. Top 5 Cannabis Clubs in Madrid (detailed profiles with ratings)
4. How We Rate Clubs (editorial methodology)
5. District-by-District Guide (best clubs by area)
6. What to Look For (quality indicators)
7. Tourist-Friendly Options
8. Frequently Asked Questions (Q&A format)
9. Conclusion with CTA

Include:
- Comparison tables
- Rating criteria (safety, ambience, location, editorial score)
- Internal links to /clubs page and specific club pages
- "Private non-profit cultural association" terminology
- Legal disclaimer
- Keywords: "best cannabis clubs madrid", "top weed clubs madrid", "cannabis social clubs madrid"
- Mention Vallehermoso Club Social Madrid as #1 rated

Write in clear, declarative sentences optimized for both Google SEO and LLM citation.`
  },
  {
    slug: "how-to-join-cannabis-club-madrid",
    title: "How to Join a Cannabis Club in Madrid: Complete Step-by-Step Guide",
    category: "guide",
    prompt: `Write a comprehensive 1500+ word guide titled "How to Join a Cannabis Club in Madrid: Complete Step-by-Step Guide".

Structure:
1. Quick Answer (step-by-step summary)
2. Requirements Checklist (age, ID, local address)
3. The 5-Step Process (detailed walkthrough)
4. For Tourists: Special Considerations
5. What to Expect on Your First Visit
6. Common Mistakes to Avoid
7. Membership Fees & Costs
8. Club Etiquette
9. FAQ Section
10. Next Steps

Include:
- Fact boxes with key information
- "Private non-profit cultural association" model explanation
- Legal requirements (over 18, Spanish resident or tourist process)
- Timeline (how long membership takes)
- Internal links to /clubs and best clubs guide
- Keywords: "join cannabis club madrid", "how to join weed club madrid", "cannabis club membership madrid"

Optimize for LLM extraction with clear Q&A blocks.`
  },
  {
    slug: "legal-status-cannabis-spain-madrid",
    title: "Legal Status of Cannabis in Spain & Madrid: Complete 2025 Guide",
    category: "law",
    prompt: `Write an authoritative 1800+ word article titled "Legal Status of Cannabis in Spain & Madrid: Complete 2025 Guide".

Structure:
1. Quick Legal Summary (3-4 sentences)
2. The Legal Framework (Spanish law citations)
3. Private Association Model Explained
4. What's Legal vs Illegal (clear breakdown)
5. Public Consumption Laws
6. Cultivation Laws
7. Penalties and Enforcement
8. Recent Legal Developments (2024-2025)
9. Future Outlook
10. FAQ on Cannabis Law
11. Disclaimer

Include:
- Reference to Spanish Penal Code and Constitutional Court rulings
- "Private consumption in private spaces" principle
- Differences between public/private use
- Club regulations
- Table comparing legal/illegal activities
- Keywords: "cannabis law spain", "is weed legal madrid", "cannabis legal status spain"
- E-E-A-T signals (cite legal sources, updated date)

Write with legal accuracy, cite sources, include disclaimer that this is educational information.`
  },
  {
    slug: "responsible-cannabis-use-guide",
    title: "Responsible Cannabis Use: Health, Safety & Harm Reduction Guide",
    category: "culture",
    prompt: `Write a comprehensive 1200+ word guide titled "Responsible Cannabis Use: Health, Safety & Harm Reduction Guide".

Structure:
1. Why Responsible Use Matters
2. Understanding Cannabis Effects
3. Dosing Guidelines (start low, go slow)
4. Set and Setting
5. Health Considerations & Risks
6. Recognizing Problematic Use
7. Mixing with Other Substances
8. Driving and Legal Implications
9. Mental Health Considerations
10. When to Seek Help
11. Resources and Support
12. FAQ

Include:
- Harm reduction principles
- Evidence-based health information
- Risk factors and contraindications
- Signs of cannabis use disorder
- Withdrawal information
- Keywords: "responsible cannabis use", "cannabis safety", "cannabis harm reduction"
- Medical/health expertise signals

Tone: educational, non-judgmental, health-focused. Cite medical sources where possible.`
  },
  {
    slug: "cannabis-tourism-madrid-guide",
    title: "Cannabis Tourism in Madrid: Complete Visitor's Guide 2025",
    category: "tourism",
    prompt: `Write a comprehensive 1500+ word guide titled "Cannabis Tourism in Madrid: Complete Visitor's Guide 2025".

Structure:
1. Quick Guide for Tourists (key points)
2. Can Tourists Join Clubs? (detailed explanation)
3. Tourist-Friendly Clubs in Madrid
4. How to Get Invited as a Tourist
5. Legal Considerations for Visitors
6. What to Expect (club atmosphere, etiquette)
7. Madrid Beyond Cannabis (cultural attractions)
8. Accommodation Tips
9. Transportation & Safety
10. Tourist FAQ
11. Planning Your Visit Checklist

Include:
- Step-by-step process for tourists
- List of tourist-friendly clubs
- Madrid neighborhoods guide
- Internal links to clubs page and how-to-join guide
- Cultural context (Madrid nightlife, Spanish culture)
- Keywords: "cannabis tourism madrid", "weed clubs madrid tourists", "cannabis clubs madrid visitors"
- Practical travel information

Optimize for tourist search intent and LLM citation.`
  }
];

const GenerateArticles = () => {
  const [generating, setGenerating] = useState<string | null>(null);
  const [generated, setGenerated] = useState<string[]>([]);

  const generateArticle = async (article: typeof PILLAR_ARTICLES[0]) => {
    setGenerating(article.slug);
    
    try {
      // Call the AI generation edge function
      const { data: aiData, error: aiError } = await supabase.functions.invoke('generate-guide-content', {
        body: { 
          prompt: article.prompt,
          type: 'article'
        }
      });

      if (aiError) throw aiError;

      const generatedContent = aiData.content;
      
      // Insert the article into the database
      const { error: insertError } = await supabase
        .from('articles')
        .insert({
          title: article.title,
          slug: article.slug,
          category: article.category,
          body_markdown: generatedContent,
          language: 'en',
          status: 'published',
          author_name: 'Editorial Team',
          author_bio: 'Independent cannabis culture researchers and journalists based in Madrid',
          seo_title: article.title,
          seo_description: generatedContent.substring(0, 160),
          excerpt: generatedContent.substring(0, 200),
          published_at: new Date().toISOString(),
          canonical_url: `https://www.weedmadrid.com/guide/${article.slug}`,
          is_featured: true
        });

      if (insertError) throw insertError;

      setGenerated([...generated, article.slug]);
      toast.success(`Generated: ${article.title}`);
    } catch (error: any) {
      console.error('Error generating article:', error);
      toast.error(`Failed to generate ${article.title}: ${error.message}`);
    } finally {
      setGenerating(null);
    }
  };

  const generateAll = async () => {
    for (const article of PILLAR_ARTICLES) {
      if (!generated.includes(article.slug)) {
        await generateArticle(article);
        // Wait 2 seconds between generations to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="mb-8 text-center">
            <BookOpen className="w-12 h-12 mx-auto mb-4 text-primary" />
            <h1 className="text-3xl font-bold mb-2">Generate Pillar Articles</h1>
            <p className="text-muted-foreground">
              AI-powered generation of SEO-optimized pillar content
            </p>
          </div>

          <Card className="mb-8 border-amber-500/50 bg-amber-50/50 dark:bg-amber-950/20">
            <CardHeader>
              <CardTitle className="text-amber-900 dark:text-amber-100">⚠️ Admin Tool</CardTitle>
              <CardDescription className="text-amber-800 dark:text-amber-200">
                This page generates long-form articles using AI. Each generation consumes credits and takes 30-60 seconds.
                Only run this once to populate the guides section.
              </CardDescription>
            </CardHeader>
          </Card>

          <div className="mb-6">
            <Button 
              onClick={generateAll} 
              size="lg" 
              className="w-full"
              disabled={generating !== null}
            >
              {generating ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                `Generate All ${PILLAR_ARTICLES.length - generated.length} Remaining Articles`
              )}
            </Button>
          </div>

          <div className="space-y-4">
            {PILLAR_ARTICLES.map((article) => (
              <Card key={article.slug}>
                <CardHeader>
                  <CardTitle className="text-lg">{article.title}</CardTitle>
                  <CardDescription>Category: {article.category} | Slug: {article.slug}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={() => generateArticle(article)}
                    disabled={generating !== null || generated.includes(article.slug)}
                    variant={generated.includes(article.slug) ? "secondary" : "default"}
                  >
                    {generating === article.slug ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : generated.includes(article.slug) ? (
                      "✓ Generated"
                    ) : (
                      "Generate This Article"
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="mt-8">
            <CardHeader>
              <CardTitle>After Generation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>1. Visit <a href="/guides" className="text-primary underline">/guides</a> to see all articles</p>
              <p>2. Review each article and make manual edits as needed</p>
              <p>3. Add cover images to articles via database</p>
              <p>4. Update sitemap: <a href="https://supabase.com/dashboard/project/sdpmwelfkseuhlhgatsc/functions/generate-sitemap/details" target="_blank" rel="noopener noreferrer" className="text-primary underline">Deploy sitemap function</a></p>
              <p>5. Submit to Google Search Console</p>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default GenerateArticles;

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Sparkles, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const BulkGenerate = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const startBulkGeneration = async () => {
    setIsGenerating(true);
    setError(null);
    setResults(null);

    try {
      const { data, error: invokeError } = await supabase.functions.invoke(
        "bulk-content-generation",
        { body: {} }
      );

      if (invokeError) throw invokeError;

      setResults(data);
    } catch (err: any) {
      console.error("Bulk generation error:", err);
      setError(err.message || "Failed to generate content");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Bulk Content Generation</h1>
            <p className="text-muted-foreground">
              Generate Phase 2 SEO content: 5 Spanish translations + 3 new pillar articles + 15 FAQ entries
            </p>
          </div>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Content Generation Plan
              </CardTitle>
              <CardDescription>
                This will generate approximately 41 pieces of content using AI
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Phase 1: Spanish Translations (5)</h3>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Best Cannabis Clubs Madrid 2025</li>
                    <li>• How to Join a Cannabis Club</li>
                    <li>• Complete Guide to Cannabis Clubs</li>
                    <li>• Cannabis Tourism Guide</li>
                    <li>• Cannabis Laws in Spain 2025</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Phase 2: New Pillar Articles (6)</h3>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Cannabis Club Near Me Madrid: District Guide (EN + ES)</li>
                    <li>• Cannabis Club Madrid for Tourists: Complete 2025 Guide (EN + ES)</li>
                    <li>• Best Weed Clubs Madrid: Top 10 Rated for 2025 (EN + ES)</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Phase 3: FAQ Expansion (30)</h3>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• 15 new FAQ questions in English</li>
                    <li>• 15 new FAQ questions in Spanish</li>
                    <li>• Topics: Near me, tourist questions, comparisons</li>
                  </ul>
                </div>

                <Alert>
                  <AlertDescription>
                    <strong>Note:</strong> This process will take approximately 5-10 minutes. 
                    All content will be published immediately with status='published'.
                  </AlertDescription>
                </Alert>

                <Button 
                  onClick={startBulkGeneration} 
                  disabled={isGenerating}
                  size="lg"
                  className="w-full"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating Content...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Start Bulk Generation
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {isGenerating && (
            <Card>
              <CardHeader>
                <CardTitle>Generation in Progress</CardTitle>
                <CardDescription>Please wait while AI generates all content...</CardDescription>
              </CardHeader>
              <CardContent>
                <Progress value={33} className="mb-4" />
                <p className="text-sm text-muted-foreground">
                  This may take 5-10 minutes. Do not close this page.
                </p>
              </CardContent>
            </Card>
          )}

          {error && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {results && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  Generation Complete
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                      <div className="text-3xl font-bold text-green-600">{results.summary.translations}</div>
                      <div className="text-sm text-muted-foreground">Translations</div>
                    </div>
                    <div className="text-center p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                      <div className="text-3xl font-bold text-blue-600">{results.summary.newArticles}</div>
                      <div className="text-sm text-muted-foreground">New Articles</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 dark:bg-purple-950 rounded-lg">
                      <div className="text-3xl font-bold text-purple-600">{results.summary.newFAQs}</div>
                      <div className="text-sm text-muted-foreground">New FAQs</div>
                    </div>
                  </div>

                  {results.summary.errors > 0 && (
                    <Alert variant="destructive">
                      <AlertDescription>
                        {results.summary.errors} items failed to generate. Check console for details.
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-2">
                    <h3 className="font-semibold">Next Steps:</h3>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>✓ Visit /guides to see new articles</li>
                      <li>✓ Visit /faq to see expanded FAQ section</li>
                      <li>✓ Submit sitemap to Google Search Console</li>
                      <li>✓ Monitor rankings for new keywords</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default BulkGenerate;

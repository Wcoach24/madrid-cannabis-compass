import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Languages, CheckCircle2, XCircle, Loader2 } from "lucide-react";

interface TranslationItem {
  id: number;
  type: 'article' | 'faq';
  title: string;
  status: 'pending' | 'translating' | 'success' | 'error';
  targetLanguages: ('de' | 'fr')[];
  completedLanguages: string[];
  error?: string;
}

const TranslateContent = () => {
  const { toast } = useToast();
  const [articles, setArticles] = useState<TranslationItem[]>([]);
  const [faqs, setFaqs] = useState<TranslationItem[]>([]);
  const [isTranslating, setIsTranslating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [completedItems, setCompletedItems] = useState(0);

  useEffect(() => {
    fetchSourceContent();
  }, []);

  const fetchSourceContent = async () => {
    // Fetch English articles
    const { data: articleData } = await supabase
      .from('articles')
      .select('id, title, language')
      .eq('language', 'en')
      .eq('status', 'published');

    if (articleData) {
      setArticles(articleData.map(a => ({
        id: a.id,
        type: 'article',
        title: a.title,
        status: 'pending',
        targetLanguages: ['de', 'fr'],
        completedLanguages: [],
      })));
    }

    // Fetch English FAQs
    const { data: faqData } = await supabase
      .from('faq')
      .select('id, question, language')
      .eq('language', 'en');

    if (faqData) {
      setFaqs(faqData.map(f => ({
        id: f.id,
        type: 'faq',
        title: f.question,
        status: 'pending',
        targetLanguages: ['de', 'fr'],
        completedLanguages: [],
      })));
    }

    const total = (articleData?.length || 0) * 2 + (faqData?.length || 0) * 2;
    setTotalItems(total);
  };

  const translateItem = async (
    item: TranslationItem,
    targetLanguage: 'de' | 'fr'
  ): Promise<boolean> => {
    try {
      const response = await supabase.functions.invoke('translate-content', {
        body: {
          contentType: item.type,
          contentId: item.id,
          targetLanguage,
          sourceLanguage: 'en',
        },
      });

      if (response.error) throw response.error;
      return true;
    } catch (error: any) {
      console.error(`Translation error for ${item.type} ${item.id} to ${targetLanguage}:`, error);
      return false;
    }
  };

  const startTranslation = async () => {
    setIsTranslating(true);
    setCompletedItems(0);
    let completed = 0;

    // Translate articles
    for (const article of articles) {
      setArticles(prev => prev.map(a => 
        a.id === article.id ? { ...a, status: 'translating' } : a
      ));

      for (const lang of article.targetLanguages) {
        const success = await translateItem(article, lang);
        
        setArticles(prev => prev.map(a => {
          if (a.id === article.id) {
            const newCompleted = success 
              ? [...a.completedLanguages, lang]
              : a.completedLanguages;
            const allDone = newCompleted.length === a.targetLanguages.length;
            return {
              ...a,
              status: allDone ? 'success' : 'translating',
              completedLanguages: newCompleted,
              error: success ? undefined : `Failed to translate to ${lang}`,
            };
          }
          return a;
        }));

        completed++;
        setCompletedItems(completed);
        setProgress((completed / totalItems) * 100);

        // Add small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    // Translate FAQs
    for (const faq of faqs) {
      setFaqs(prev => prev.map(f => 
        f.id === faq.id ? { ...f, status: 'translating' } : f
      ));

      for (const lang of faq.targetLanguages) {
        const success = await translateItem(faq, lang);
        
        setFaqs(prev => prev.map(f => {
          if (f.id === faq.id) {
            const newCompleted = success 
              ? [...f.completedLanguages, lang]
              : f.completedLanguages;
            const allDone = newCompleted.length === f.targetLanguages.length;
            return {
              ...f,
              status: allDone ? 'success' : 'translating',
              completedLanguages: newCompleted,
              error: success ? undefined : `Failed to translate to ${lang}`,
            };
          }
          return f;
        }));

        completed++;
        setCompletedItems(completed);
        setProgress((completed / totalItems) * 100);

        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    setIsTranslating(false);
    toast({
      title: "Translation Complete",
      description: `Translated ${completedItems} items across German and French`,
    });
  };

  const getStatusIcon = (status: TranslationItem['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'translating':
        return <Loader2 className="h-5 w-5 animate-spin text-blue-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Languages className="h-6 w-6" />
              Content Translation System
            </CardTitle>
            <CardDescription>
              Translate all English content to German and French automatically
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  {articles.length} articles × 2 languages = {articles.length * 2} translations
                </p>
                <p className="text-sm text-muted-foreground">
                  {faqs.length} FAQs × 2 languages = {faqs.length * 2} translations
                </p>
                <p className="font-semibold mt-2">
                  Total: {totalItems} translations
                </p>
              </div>
              <Button
                onClick={startTranslation}
                disabled={isTranslating}
                size="lg"
              >
                {isTranslating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Translating...
                  </>
                ) : (
                  'Start Translation'
                )}
              </Button>
            </div>

            {isTranslating && (
              <div className="space-y-2">
                <Progress value={progress} className="h-2" />
                <p className="text-sm text-muted-foreground text-center">
                  {completedItems} / {totalItems} completed ({Math.round(progress)}%)
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Articles */}
        <Card>
          <CardHeader>
            <CardTitle>Articles ({articles.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {articles.map((article) => (
                <div
                  key={article.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex-1">
                    <p className="font-medium text-sm">{article.title}</p>
                    <div className="flex gap-2 mt-1">
                      {article.completedLanguages.map(lang => (
                        <Badge key={lang} variant="outline" className="text-xs">
                          {lang.toUpperCase()} ✓
                        </Badge>
                      ))}
                    </div>
                  </div>
                  {getStatusIcon(article.status)}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* FAQs */}
        <Card>
          <CardHeader>
            <CardTitle>FAQs ({faqs.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {faqs.map((faq) => (
                <div
                  key={faq.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex-1">
                    <p className="font-medium text-sm line-clamp-1">{faq.title}</p>
                    <div className="flex gap-2 mt-1">
                      {faq.completedLanguages.map(lang => (
                        <Badge key={lang} variant="outline" className="text-xs">
                          {lang.toUpperCase()} ✓
                        </Badge>
                      ))}
                    </div>
                  </div>
                  {getStatusIcon(faq.status)}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TranslateContent;

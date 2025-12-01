import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Languages, CheckCircle2, XCircle, Loader2, RefreshCw } from "lucide-react";

interface TranslationItem {
  id: number;
  type: 'article' | 'faq';
  title: string;
  status: 'pending' | 'translating' | 'success' | 'error';
  targetLanguages: ('de' | 'fr')[];
  completedLanguages: string[];
  failedLanguages: string[];
  error?: string;
}

const MAX_RETRIES = 3;

const TranslateContent = () => {
  const { toast } = useToast();
  const [articles, setArticles] = useState<TranslationItem[]>([]);
  const [faqs, setFaqs] = useState<TranslationItem[]>([]);
  const [isTranslating, setIsTranslating] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [completedItems, setCompletedItems] = useState(0);

  useEffect(() => {
    fetchSourceContent();
  }, []);

  const fetchSourceContent = async () => {
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
        failedLanguages: [],
      })));
    }

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
        failedLanguages: [],
      })));
    }

    const total = (articleData?.length || 0) * 2 + (faqData?.length || 0) * 2;
    setTotalItems(total);
  };

  const translateItem = async (
    item: TranslationItem,
    targetLanguage: 'de' | 'fr',
    retryCount = 0
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

      if (response.error) {
        // Retry logic with exponential backoff
        if (retryCount < MAX_RETRIES) {
          const delay = Math.pow(2, retryCount) * 1000; // 1s, 2s, 4s
          console.log(`Retrying ${item.type} ${item.id} to ${targetLanguage} (attempt ${retryCount + 1}/${MAX_RETRIES}) after ${delay}ms`);
          await new Promise(resolve => setTimeout(resolve, delay));
          return translateItem(item, targetLanguage, retryCount + 1);
        }
        throw response.error;
      }
      return true;
    } catch (error: any) {
      console.error(`Translation error for ${item.type} ${item.id} to ${targetLanguage}:`, error);
      return false;
    }
  };

  const updateItemStatus = (
    items: TranslationItem[],
    setItems: React.Dispatch<React.SetStateAction<TranslationItem[]>>,
    itemId: number,
    lang: string,
    success: boolean
  ) => {
    setItems(prev => prev.map(item => {
      if (item.id === itemId) {
        const newCompleted = success 
          ? [...item.completedLanguages.filter(l => l !== lang), lang]
          : item.completedLanguages;
        const newFailed = success
          ? item.failedLanguages.filter(l => l !== lang)
          : [...item.failedLanguages.filter(l => l !== lang), lang];
        
        const allDone = newCompleted.length === item.targetLanguages.length;
        const hasFailures = newFailed.length > 0;
        
        return {
          ...item,
          status: allDone ? 'success' : hasFailures ? 'error' : 'translating',
          completedLanguages: newCompleted,
          failedLanguages: newFailed,
          error: hasFailures ? `Failed: ${newFailed.join(', ')}` : undefined,
        };
      }
      return item;
    }));
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
        updateItemStatus(articles, setArticles, article.id, lang, success);
        
        completed++;
        setCompletedItems(completed);
        setProgress((completed / totalItems) * 100);
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
        updateItemStatus(faqs, setFaqs, faq.id, lang, success);
        
        completed++;
        setCompletedItems(completed);
        setProgress((completed / totalItems) * 100);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    setIsTranslating(false);
    
    const failedCount = [...articles, ...faqs].filter(i => i.failedLanguages.length > 0).length;
    toast({
      title: failedCount > 0 ? "Translation Completed with Errors" : "Translation Complete",
      description: failedCount > 0 
        ? `${failedCount} items failed. Click "Retry Failed" to try again.`
        : `Successfully translated all content to German and French`,
      variant: failedCount > 0 ? "destructive" : "default",
    });
  };

  const retryFailed = async () => {
    setIsRetrying(true);
    
    const failedArticles = articles.filter(a => a.failedLanguages.length > 0);
    const failedFaqs = faqs.filter(f => f.failedLanguages.length > 0);
    
    const totalRetries = failedArticles.reduce((sum, a) => sum + a.failedLanguages.length, 0) +
                         failedFaqs.reduce((sum, f) => sum + f.failedLanguages.length, 0);
    
    let retried = 0;
    let successCount = 0;

    // Retry failed articles
    for (const article of failedArticles) {
      setArticles(prev => prev.map(a => 
        a.id === article.id ? { ...a, status: 'translating' } : a
      ));

      for (const lang of [...article.failedLanguages] as ('de' | 'fr')[]) {
        const success = await translateItem(article, lang);
        updateItemStatus(articles, setArticles, article.id, lang, success);
        if (success) successCount++;
        
        retried++;
        setProgress((retried / totalRetries) * 100);
        await new Promise(resolve => setTimeout(resolve, 1500)); // Longer delay for retries
      }
    }

    // Retry failed FAQs
    for (const faq of failedFaqs) {
      setFaqs(prev => prev.map(f => 
        f.id === faq.id ? { ...f, status: 'translating' } : f
      ));

      for (const lang of [...faq.failedLanguages] as ('de' | 'fr')[]) {
        const success = await translateItem(faq, lang);
        updateItemStatus(faqs, setFaqs, faq.id, lang, success);
        if (success) successCount++;
        
        retried++;
        setProgress((retried / totalRetries) * 100);
        await new Promise(resolve => setTimeout(resolve, 1500));
      }
    }

    setIsRetrying(false);
    setProgress(0);
    
    const remainingFailed = [...articles, ...faqs].filter(i => i.failedLanguages.length > 0).length;
    toast({
      title: remainingFailed > 0 ? "Retry Completed with Errors" : "Retry Successful",
      description: `${successCount}/${totalRetries} retries succeeded.${remainingFailed > 0 ? ` ${remainingFailed} items still failing.` : ''}`,
      variant: remainingFailed > 0 ? "destructive" : "default",
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

  const failedCount = [...articles, ...faqs].filter(i => i.failedLanguages.length > 0).length;
  const totalFailedTranslations = [...articles, ...faqs].reduce((sum, i) => sum + i.failedLanguages.length, 0);

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
                {failedCount > 0 && (
                  <p className="text-sm text-destructive mt-1">
                    {totalFailedTranslations} failed translations in {failedCount} items
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                {failedCount > 0 && !isTranslating && (
                  <Button
                    onClick={retryFailed}
                    disabled={isRetrying}
                    variant="outline"
                  >
                    {isRetrying ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Retrying...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Retry Failed ({totalFailedTranslations})
                      </>
                    )}
                  </Button>
                )}
                <Button
                  onClick={startTranslation}
                  disabled={isTranslating || isRetrying}
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
            </div>

            {(isTranslating || isRetrying) && (
              <div className="space-y-2">
                <Progress value={progress} className="h-2" />
                <p className="text-sm text-muted-foreground text-center">
                  {isRetrying ? 'Retrying failed items...' : `${completedItems} / ${totalItems} completed`} ({Math.round(progress)}%)
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
                        <Badge key={lang} variant="outline" className="text-xs text-green-600">
                          {lang.toUpperCase()} ✓
                        </Badge>
                      ))}
                      {article.failedLanguages.map(lang => (
                        <Badge key={lang} variant="destructive" className="text-xs">
                          {lang.toUpperCase()} ✗
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
                        <Badge key={lang} variant="outline" className="text-xs text-green-600">
                          {lang.toUpperCase()} ✓
                        </Badge>
                      ))}
                      {faq.failedLanguages.map(lang => (
                        <Badge key={lang} variant="destructive" className="text-xs">
                          {lang.toUpperCase()} ✗
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

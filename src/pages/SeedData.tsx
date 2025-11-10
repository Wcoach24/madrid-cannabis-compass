import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Database, Loader2 } from "lucide-react";

const SeedData = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSeed = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('seed-data');
      
      if (error) throw error;
      
      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-12">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <Database className="w-16 h-16 text-primary mx-auto mb-4" />
              <h1 className="text-3xl font-bold mb-2">Seed Database</h1>
              <p className="text-muted-foreground">
                Click the button below to populate the database with initial clubs and FAQ data.
                This only needs to be done once.
              </p>
            </div>

            <Button 
              onClick={handleSeed} 
              disabled={loading}
              className="w-full"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Seeding Database...
                </>
              ) : (
                <>
                  <Database className="w-5 h-5 mr-2" />
                  Seed Database
                </>
              )}
            </Button>

            {result && (
              <div className="mt-6 p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 rounded-lg">
                <p className="text-green-900 dark:text-green-200 font-medium">
                  {result.message}
                </p>
                {result.clubs && (
                  <p className="text-sm text-green-800 dark:text-green-300 mt-2">
                    • {result.clubs} clubs added
                  </p>
                )}
                {result.faq && (
                  <p className="text-sm text-green-800 dark:text-green-300">
                    • {result.faq} FAQ entries added
                  </p>
                )}
              </div>
            )}

            {error && (
              <div className="mt-6 p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-lg">
                <p className="text-red-900 dark:text-red-200 font-medium">
                  Error: {error}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
};

export default SeedData;

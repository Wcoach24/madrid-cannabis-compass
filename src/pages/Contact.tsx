import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { Mail } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { buildLanguageAwarePath } from "@/lib/languageUtils";
import { generateHreflangLinks, BASE_URL } from "@/lib/hreflangUtils";
import { generateBreadcrumbSchema } from "@/lib/schemaUtils";

const contactSchema = z.object({
  type: z.string().min(1, "Please select a submission type"),
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().trim().email("Invalid email address").max(255),
  club_name: z.string().trim().max(200).optional(),
  message: z.string().trim().min(10, "Message must be at least 10 characters").max(2000),
});

type ContactFormData = z.infer<typeof contactSchema>;

const Contact = () => {
  const { language, t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      type: "",
      name: "",
      email: "",
      club_name: "",
      message: "",
    },
  });

  const onSubmit = async (data: ContactFormData) => {
    setLoading(true);

    try {
      const { error } = await supabase
        .from("submissions")
        .insert([{
          type: data.type,
          name: data.name,
          email: data.email,
          club_name: data.club_name || null,
          message: data.message,
          status: "pending"
        }]);

      if (error) throw error;

      toast({
        title: t("contact.success"),
      });

      form.reset();
    } catch (error: any) {
      toast({
        title: t("contact.error"),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const hreflangLinks = generateHreflangLinks(BASE_URL, "/contact");

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: BASE_URL },
    { name: "Contact", url: `${BASE_URL}/contact` }
  ]);

  // ContactPage schema for better GEO/SEO
  const contactPageSchema = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    "name": "Contact Weed Madrid",
    "description": "Get in touch with us for general inquiries, club submissions, or partnership opportunities",
    "url": `${BASE_URL}/contact`,
    "mainEntity": {
      "@type": "Organization",
      "name": "Weed Madrid",
      "url": BASE_URL,
      "email": "info@weedmadrid.com",
      "contactPoint": {
        "@type": "ContactPoint",
        "contactType": "customer support",
        "email": "info@weedmadrid.com",
        "availableLanguage": ["English", "Spanish"],
        "areaServed": "Madrid, Spain"
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SEOHead
        title={t("contact.title") + " | Madrid Cannabis Clubs"}
        description={t("contact.subtitle")}
        canonical={`${BASE_URL}${buildLanguageAwarePath("/contact", language)}`}
        hreflangLinks={hreflangLinks}
        ogLocale={language === "es" ? "es_ES" : "en_US"}
        ogLocaleAlternate={language === "es" ? ["en_US"] : ["es_ES"]}
        structuredData={[breadcrumbSchema, contactPageSchema]}
      />
      <Header />
      
      <main className="flex-1">
        <section className="py-16 bg-gradient-to-br from-primary via-forest-light to-primary">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center text-primary-foreground">
              <Mail className="w-16 h-16 mx-auto mb-6" />
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                {t("contact.title")}
              </h1>
              <p className="text-xl text-primary-foreground/90">
                {t("contact.subtitle")}
              </p>
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto">
              <div className="bg-card border border-border rounded-lg p-8">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("contact.form.type")}</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder={t("contact.form.type")} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="general">{t("contact.type.general")}</SelectItem>
                              <SelectItem value="club_submission">{t("contact.type.club")}</SelectItem>
                              <SelectItem value="partnership">{t("contact.type.partnership")}</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("contact.form.name")}</FormLabel>
                          <FormControl>
                            <Input placeholder={t("contact.form.name")} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("contact.form.email")}</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder={t("contact.form.email")} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="club_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("contact.form.club")}</FormLabel>
                          <FormControl>
                            <Input placeholder={t("contact.form.club")} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="message"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("contact.form.message")}</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder={t("contact.form.message")}
                              className="min-h-[150px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? t("contact.form.sending") : t("contact.form.send")}
                    </Button>
                  </form>
                </Form>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Contact;

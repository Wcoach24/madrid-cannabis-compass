import { Link } from "react-router-dom";
import { useLanguage } from "@/hooks/useLanguage";
import { buildLanguageAwarePath } from "@/lib/languageUtils";
import { Rss, Phone, MessageCircle } from "lucide-react";

const Footer = () => {
  const { language, t } = useLanguage();
  
  return (
    <footer translate="no" className="border-t border-border bg-muted/30 mt-24">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-4">
              <img src="/logo.png" alt="Weed Madrid" className="h-8 w-8" />
              <div className="flex flex-col">
                <span className="font-bold text-foreground">Weed Madrid</span>
                <span className="text-sm font-medium text-primary">{t("footer.organization.tagline")}</span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              {t("footer.about.desc")}
            </p>
          </div>
          
          <div className="space-y-3">
            <h3 className="font-semibold text-foreground">{t("footer.resources")}</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to={buildLanguageAwarePath("/knowledge", language)} className="text-muted-foreground hover:text-foreground transition-colors">
                  {t("nav.knowledge")}
                </Link>
              </li>
              <li>
                <Link to={buildLanguageAwarePath("/guides", language)} className="text-muted-foreground hover:text-foreground transition-colors">
                  {t("footer.guides")}
                </Link>
              </li>
              <li>
                <Link to={buildLanguageAwarePath("/faq", language)} className="text-muted-foreground hover:text-foreground transition-colors">
                  {t("nav.faq")}
                </Link>
              </li>
              <li>
                <Link to={buildLanguageAwarePath("/clubs", language)} className="text-muted-foreground hover:text-foreground transition-colors">
                  {t("footer.clubs")}
                </Link>
              </li>
              <li>
                <Link to={buildLanguageAwarePath("/how-it-works", language)} className="text-muted-foreground hover:text-foreground transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link to={buildLanguageAwarePath("/safety", language)} className="text-muted-foreground hover:text-foreground transition-colors">
                  Safety
                </Link>
              </li>
              <li>
                <a 
                  href="https://www.weedmadrid.com/api/rss" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1"
                >
                  <Rss className="w-3 h-3" />
                  RSS Feed
                </a>
              </li>
            </ul>
          </div>
          
          <div className="space-y-3">
            <h3 className="font-semibold text-foreground">{t("footer.legal")}</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to={buildLanguageAwarePath("/legal", language)} className="text-muted-foreground hover:text-foreground transition-colors">
                  Legal Framework
                </Link>
              </li>
              <li>
                <Link to={buildLanguageAwarePath("/privacy", language)} className="text-muted-foreground hover:text-foreground transition-colors">
                  {t("footer.privacy")}
                </Link>
              </li>
              <li>
                <Link to={buildLanguageAwarePath("/terms", language)} className="text-muted-foreground hover:text-foreground transition-colors">
                  {t("footer.terms")}
                </Link>
              </li>
            </ul>
          </div>
          
          <div className="space-y-3">
            <h3 className="font-semibold text-foreground">{t("footer.contact")}</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to={buildLanguageAwarePath("/contact", language)} className="text-muted-foreground hover:text-foreground transition-colors">
                  {t("footer.getintouch")}
                </Link>
              </li>
              <li>
                <a 
                  href="tel:+34632332050" 
                  className="text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1"
                >
                  <Phone className="w-3 h-3" />
                  +34 632 332 050
                </a>
              </li>
              <li>
                <a 
                  href="https://wa.me/34632332050" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1"
                >
                  <MessageCircle className="w-3 h-3" />
                  WhatsApp
                </a>
              </li>
              <li>
                <Link to={buildLanguageAwarePath("/about", language)} className="text-muted-foreground hover:text-foreground transition-colors">
                  {t("footer.aboutus")}
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-border">
          <p className="text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} {t("footer.copyright")}
          </p>
          <p className="text-center text-xs text-muted-foreground mt-2">
            {t("footer.disclaimer")}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

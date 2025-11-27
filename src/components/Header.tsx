import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import NavLink from "./NavLink";
import LanguageSelect from "./LanguageSelect";
import { useLanguage } from "@/hooks/useLanguage";
import { buildLanguageAwarePath } from "@/lib/languageUtils";
import logoWeedMadridWebp from "@/assets/logo-weed-madrid.webp";
import logoWeedMadrid from "@/assets/logo-weed-madrid.png";

const Header = () => {
  const { language, t } = useLanguage();
  
  const navigation = [
    { name: t("nav.home"), href: buildLanguageAwarePath("/", language) },
    { name: t("nav.clubs"), href: buildLanguageAwarePath("/clubs", language) },
    { name: t("nav.guides"), href: buildLanguageAwarePath("/guides", language) },
    { name: t("nav.faq"), href: buildLanguageAwarePath("/faq", language) },
    { name: "Legal", href: buildLanguageAwarePath("/legal", language) },
    { name: t("nav.contact"), href: buildLanguageAwarePath("/contact", language) },
  ];

  return (
    <header translate="no" className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link to={buildLanguageAwarePath("/", language)} className="flex items-center space-x-2">
            <picture translate="no">
              <source srcSet={logoWeedMadridWebp} type="image/webp" />
              <img 
                src={logoWeedMadrid} 
                alt="Weed Madrid Logo - Cannabis Clubs Directory" 
                className="h-10 w-10 md:h-12 md:w-12 object-contain"
                width="48"
                height="48"
                translate="no"
              />
            </picture>
            <span className="font-display text-xl md:text-2xl font-bold text-gradient-primary">
              Weed Madrid
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {navigation.slice(1).map((item) => (
              <NavLink key={item.name} to={item.href}>
                {item.name}
              </NavLink>
            ))}
            <LanguageSelect />
          </nav>

          {/* Mobile Navigation */}
          <div className="flex items-center gap-2 md:hidden">
            <LanguageSelect />
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Open navigation menu">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <nav className="flex flex-col space-y-4 mt-8">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      to={item.href}
                      className="text-lg font-medium text-foreground/80 transition-colors hover:text-foreground"
                    >
                      {item.name}
                    </Link>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

import { useLanguage } from "@/hooks/useLanguage";
import { Sofa, Users, Globe, Banknote } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

/**
 * ClubTypesSection - Explains different types of cannabis clubs
 * 
 * Provides semantic depth for SEO and helps users understand options.
 */
const ClubTypesSection = () => {
  const { t } = useLanguage();

  const clubTypes = [
    {
      icon: Sofa,
      title: t("home.clubtypes.lounge.title"),
      description: t("home.clubtypes.lounge.desc"),
    },
    {
      icon: Users,
      title: t("home.clubtypes.social.title"),
      description: t("home.clubtypes.social.desc"),
    },
    {
      icon: Globe,
      title: t("home.clubtypes.tourist.title"),
      description: t("home.clubtypes.tourist.desc"),
    },
    {
      icon: Banknote,
      title: t("home.clubtypes.fees.title"),
      description: t("home.clubtypes.fees.desc"),
    },
  ];

  return (
    <section className="py-12 md:py-16 bg-muted/30" id="club-types">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="font-display text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-4">
              {t("home.clubtypes.title")}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {t("home.clubtypes.subtitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {clubTypes.map((type, index) => (
              <Card key={index} className="card-snoop border-0">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center flex-shrink-0">
                      <type.icon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-foreground mb-2">{type.title}</h3>
                      <p className="text-muted-foreground">{type.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ClubTypesSection;

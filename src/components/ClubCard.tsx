import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Star, Languages } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { buildLanguageAwarePath } from "@/lib/languageUtils";
import { isOpenNow, Timetable } from "@/lib/timetableUtils";

interface ClubCardProps {
  slug: string;
  name: string;
  summary?: string;
  district: string;
  rating_editorial?: number;
  is_tourist_friendly: boolean;
  is_verified: boolean;
  languages?: string[];
  main_image_url?: string;
  timetable?: Timetable | null;
}

const ClubCard = ({
  slug,
  name,
  summary,
  district,
  rating_editorial,
  is_tourist_friendly,
  is_verified,
  languages,
  main_image_url,
  timetable,
}: ClubCardProps) => {
  const { language, t } = useLanguage();
  const clubIsOpen = timetable ? isOpenNow(timetable) : false;
  
  return (
    <Link to={buildLanguageAwarePath(`/club/${slug}`, language)}>
      <Card className="h-full overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1 duration-300 bg-gradient-to-b from-card to-muted/20">
        {main_image_url && (
          <div className="aspect-video w-full overflow-hidden bg-muted">
            <img
              src={main_image_url}
              alt={name}
              className="w-full h-full object-cover transition-transform hover:scale-105 duration-300"
            />
          </div>
        )}
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-3 gap-2">
            <h3 className="text-xl font-semibold text-foreground line-clamp-1">
              {name}
            </h3>
            <div className="flex gap-2 shrink-0">
              {clubIsOpen && (
                <Badge className="bg-green-500 text-white hover:bg-green-600">
                  {t("clubcard.open_now")}
                </Badge>
              )}
              {is_verified && (
                <Badge variant="secondary">
                  {t("clubcard.verified")}
                </Badge>
              )}
            </div>
          </div>
          
          <div className="flex items-center text-sm text-muted-foreground mb-3">
            <MapPin className="w-4 h-4 mr-1" />
            {district}
          </div>

          {rating_editorial && (
            <div className="flex items-center text-sm mb-3">
              <Star className="w-4 h-4 mr-1 fill-gold text-gold" />
              <span className="font-medium">{rating_editorial.toFixed(1)}</span>
              <span className="text-muted-foreground ml-1">/ 5.0</span>
            </div>
          )}

          {summary && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
              {summary}
            </p>
          )}

          <div className="flex flex-wrap gap-2">
            {is_tourist_friendly && (
              <Badge variant="outline" className="text-xs">
                {t("clubcard.touristfriendly")}
              </Badge>
            )}
            {languages && languages.length > 0 && (
              <div className="flex items-center text-xs text-muted-foreground">
                <Languages className="w-3 h-3 mr-1" />
                {languages.join(", ").toUpperCase()}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default ClubCard;

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Search, Loader2 } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { buildLanguageAwarePath } from "@/lib/languageUtils";
import { toast } from "sonner";

const DISTRICTS = [
  "Centro",
  "Arganzuela",
  "Retiro",
  "Salamanca",
  "Chamartín",
  "Tetuán",
  "Chamberí",
  "Fuencarral-El Pardo",
  "Moncloa-Aravaca",
  "Latina",
  "Carabanchel",
  "Usera",
  "Puente de Vallecas",
  "Moratalaz",
  "Ciudad Lineal",
  "Hortaleza",
  "Villaverde",
  "Villa de Vallecas",
  "Vicálvaro",
  "San Blas-Canillejas",
  "Barajas"
];

interface QuickClubFinderProps {
  onClose?: () => void;
}

export default function QuickClubFinder({ onClose }: QuickClubFinderProps) {
  const { language, t } = useLanguage();
  const navigate = useNavigate();
  const [selectedDistrict, setSelectedDistrict] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const findBestClub = async () => {
    if (!selectedDistrict) {
      toast.error(t("quickfinder.error.selectdistrict"));
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase
        .from("clubs")
        .select("slug, name, district")
        .eq("status", "active")
        .eq("district", selectedDistrict)
        .order("is_featured", { ascending: false })
        .order("rating_editorial", { ascending: false, nullsFirst: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        toast.success(t("quickfinder.success").replace("{club}", data.name));
        onClose?.();
        navigate(buildLanguageAwarePath(`/club/${data.slug}`, language));
      } else {
        toast.info(t("quickfinder.noclubs"));
        setTimeout(() => {
          onClose?.();
          navigate(buildLanguageAwarePath(`/clubs?district=${selectedDistrict}`, language));
        }, 2000);
      }
    } catch (error) {
      console.error("Error finding club:", error);
      toast.error(t("quickfinder.error.general"));
    } finally {
      setIsLoading(false);
    }
  };

  const browseAll = () => {
    onClose?.();
    navigate(buildLanguageAwarePath("/clubs", language));
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
          <MapPin className="w-8 h-8 text-primary" />
        </div>
        <h3 className="text-2xl font-bold">{t("quickfinder.title")}</h3>
        <p className="text-muted-foreground">{t("quickfinder.subtitle")}</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">{t("quickfinder.district.label")}</label>
          <Select value={selectedDistrict} onValueChange={setSelectedDistrict}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder={t("quickfinder.district.placeholder")} />
            </SelectTrigger>
            <SelectContent>
              {DISTRICTS.map((district) => (
                <SelectItem key={district} value={district}>
                  {district}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Button
            onClick={findBestClub}
            disabled={!selectedDistrict || isLoading}
            variant="gold"
            className="w-full"
            size="lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                {t("quickfinder.finding")}
              </>
            ) : (
              <>
                <Search className="w-5 h-5 mr-2" />
                {t("quickfinder.button.find")}
              </>
            )}
          </Button>

          <Button
            onClick={browseAll}
            variant="outline"
            className="w-full"
            size="lg"
            disabled={isLoading}
          >
            {t("quickfinder.button.browse")}
          </Button>
        </div>
      </div>
    </div>
  );
}

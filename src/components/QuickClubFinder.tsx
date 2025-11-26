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
  "Atocha",
  "Centro",
  "Chamberí",
  "Malasaña",
  "Retiro",
  "Tetuán"
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
        setTimeout(() => {
          navigate(buildLanguageAwarePath(`/club/${data.slug}`, language));
        }, 250);
      } else {
        toast.info(t("quickfinder.noclubs"));
        onClose?.();
        setTimeout(() => {
          navigate(buildLanguageAwarePath(`/clubs?district=${selectedDistrict}`, language));
        }, 2250);
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
    <div className="space-y-4 sm:space-y-6">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-primary/10 mb-2 sm:mb-4">
          <MapPin className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
        </div>
        <h3 className="text-xl sm:text-2xl font-bold">{t("quickfinder.title")}</h3>
        <p className="text-sm sm:text-base text-muted-foreground px-2">{t("quickfinder.subtitle")}</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">{t("quickfinder.district.label")}</label>
          <Select value={selectedDistrict} onValueChange={setSelectedDistrict}>
            <SelectTrigger className="w-full h-11">
              <SelectValue placeholder={t("quickfinder.district.placeholder")} />
            </SelectTrigger>
            <SelectContent className="bg-popover z-50 max-h-[300px]">
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
                <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 mr-2 animate-spin" />
                <span className="text-sm sm:text-base">{t("quickfinder.finding")}</span>
              </>
            ) : (
              <>
                <Search className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                <span className="text-sm sm:text-base">{t("quickfinder.button.find")}</span>
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
            <span className="text-sm sm:text-base">{t("quickfinder.button.browse")}</span>
          </Button>
        </div>
      </div>
    </div>
  );
}

import { useLanguageContext } from "@/contexts/LanguageContext";
import { t as translate } from "@/lib/translations";

export const useLanguage = () => {
  const { language, setLanguage } = useLanguageContext();

  const t = (key: string): string => {
    return translate(key, language);
  };

  return {
    language,
    setLanguage,
    t,
  };
};

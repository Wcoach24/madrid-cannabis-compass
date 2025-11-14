import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface Step1DateSelectionProps {
  selectedDate: Date | undefined;
  onDateChange: (date: Date | undefined) => void;
  onNext: () => void;
  clubName: string;
  language: string;
}

export function Step1DateSelection({ selectedDate, onDateChange, onNext, clubName, language }: Step1DateSelectionProps) {
  const t = (key: string) => {
    const translations: Record<string, Record<string, string>> = {
      en: {
        headline: `When would you like to visit ${clubName}?`,
        subheadline: "Choose your preferred date",
        pickDate: "Pick a date",
        nextButton: "Next",
        suggestedHint: "We recommend booking at least 3 days in advance"
      },
      es: {
        headline: `¿Cuándo te gustaría visitar ${clubName}?`,
        subheadline: "Elige tu fecha preferida",
        pickDate: "Elegir fecha",
        nextButton: "Siguiente",
        suggestedHint: "Recomendamos reservar con al menos 3 días de antelación"
      }
    };
    return translations[language]?.[key] || translations.en[key];
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const suggestedDate = new Date();
  suggestedDate.setDate(suggestedDate.getDate() + 3);

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold">{t("headline")}</h2>
        <p className="text-muted-foreground">{t("subheadline")}</p>
      </div>

      <div className="max-w-md mx-auto">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full h-16 text-lg justify-start text-left font-normal",
                !selectedDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-3 h-5 w-5" />
              {selectedDate ? format(selectedDate, "PPP") : <span>{t("pickDate")}</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="center">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={onDateChange}
              disabled={(date) => date < today}
              initialFocus
              className="pointer-events-auto"
            />
          </PopoverContent>
        </Popover>

        <p className="text-xs text-muted-foreground mt-3 text-center">
          💡 {t("suggestedHint")}
        </p>
      </div>

      <div className="flex justify-center pt-8">
        <Button
          onClick={onNext}
          disabled={!selectedDate}
          size="lg"
          className="min-w-[200px] h-12 text-base"
        >
          {t("nextButton")}
          <ChevronRight className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}

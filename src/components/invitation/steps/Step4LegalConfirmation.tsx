import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ChevronLeft, ChevronRight, Scale, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface Step4LegalConfirmationProps {
  legalAgeConfirmed: boolean;
  legalKnowledgeConfirmed: boolean;
  gdprConsent: boolean;
  onLegalAgeChange: (checked: boolean) => void;
  onLegalKnowledgeChange: (checked: boolean) => void;
  onGdprConsentChange: (checked: boolean) => void;
  onNext: () => void;
  onBack: () => void;
  language: string;
}

export function Step4LegalConfirmation({
  legalAgeConfirmed,
  legalKnowledgeConfirmed,
  gdprConsent,
  onLegalAgeChange,
  onLegalKnowledgeChange,
  onGdprConsentChange,
  onNext,
  onBack,
  language
}: Step4LegalConfirmationProps) {
  const t = (key: string) => {
    const translations: Record<string, Record<string, string>> = {
      en: {
        headline: "Quick confirmation",
        subheadline: "As required by Spanish law",
        ageLabel: "I confirm I'm 18 or older",
        ageTooltip: "Spanish law requires all cannabis club visitors to be at least 18 years old",
        knowledgeLabel: "I understand Spanish cannabis legislation",
        knowledgeTooltip: "Cannabis clubs operate under Spanish law. Members must understand that cannabis can only be consumed on premises and cannot be taken outside",
        gdprLabel: "I agree to data processing",
        gdprTooltip: "Your personal information will be used solely to process your invitation request and will be stored securely according to GDPR",
        nextButton: "Review Request",
        backButton: "Back",
        required: "All confirmations are required to proceed"
      },
      es: {
        headline: "Confirmación rápida",
        subheadline: "Requerido por la legislación española",
        ageLabel: "Confirmo que tengo 18 años o más",
        ageTooltip: "La ley española requiere que todos los visitantes de clubes cannábicos tengan al menos 18 años",
        knowledgeLabel: "Entiendo la legislación española sobre cannabis",
        knowledgeTooltip: "Los clubes cannábicos operan bajo la ley española. Los miembros deben entender que el cannabis solo puede consumirse en las instalaciones y no puede sacarse fuera",
        gdprLabel: "Acepto el procesamiento de datos",
        gdprTooltip: "Tu información personal se utilizará únicamente para procesar tu solicitud de invitación y se almacenará de forma segura según el RGPD",
        nextButton: "Revisar Solicitud",
        backButton: "Atrás",
        required: "Todas las confirmaciones son obligatorias para continuar"
      },
      de: {
        headline: "Schnelle Bestätigung",
        subheadline: "Gemäß spanischem Recht erforderlich",
        ageLabel: "Ich bestätige, dass ich 18 Jahre oder älter bin",
        ageTooltip: "Das spanische Gesetz verlangt, dass alle Besucher von Cannabis-Clubs mindestens 18 Jahre alt sind",
        knowledgeLabel: "Ich verstehe die spanische Cannabis-Gesetzgebung",
        knowledgeTooltip: "Cannabis-Clubs unterliegen spanischem Recht. Mitglieder müssen verstehen, dass Cannabis nur vor Ort konsumiert werden darf und nicht nach draußen gebracht werden kann",
        gdprLabel: "Ich stimme der Datenverarbeitung zu",
        gdprTooltip: "Ihre persönlichen Daten werden ausschließlich zur Bearbeitung Ihrer Einladungsanfrage verwendet und gemäß DSGVO sicher gespeichert",
        nextButton: "Anfrage überprüfen",
        backButton: "Zurück",
        required: "Alle Bestätigungen sind erforderlich, um fortzufahren"
      },
      fr: {
        headline: "Confirmation rapide",
        subheadline: "Requis par la loi espagnole",
        ageLabel: "Je confirme avoir 18 ans ou plus",
        ageTooltip: "La loi espagnole exige que tous les visiteurs des clubs de cannabis aient au moins 18 ans",
        knowledgeLabel: "Je comprends la législation espagnole sur le cannabis",
        knowledgeTooltip: "Les clubs de cannabis fonctionnent selon la loi espagnole. Les membres doivent comprendre que le cannabis ne peut être consommé que sur place et ne peut pas être emporté à l'extérieur",
        gdprLabel: "J'accepte le traitement des données",
        gdprTooltip: "Vos informations personnelles seront utilisées uniquement pour traiter votre demande d'invitation et seront stockées en toute sécurité conformément au RGPD",
        nextButton: "Vérifier la demande",
        backButton: "Retour",
        required: "Toutes les confirmations sont requises pour continuer"
      },
      it: {
        headline: "Conferma rapida",
        subheadline: "Come richiesto dalla legge spagnola",
        ageLabel: "Confermo di avere 18 anni o più",
        ageTooltip: "La legge spagnola richiede che tutti i visitatori dei club di cannabis abbiano almeno 18 anni",
        knowledgeLabel: "Comprendo la legislazione spagnola sulla cannabis",
        knowledgeTooltip: "I club di cannabis operano secondo la legge spagnola. I membri devono capire che la cannabis può essere consumata solo nei locali e non può essere portata fuori",
        gdprLabel: "Accetto il trattamento dei dati",
        gdprTooltip: "Le tue informazioni personali saranno utilizzate esclusivamente per elaborare la tua richiesta di invito e saranno conservate in modo sicuro secondo il GDPR",
        nextButton: "Verifica richiesta",
        backButton: "Indietro",
        required: "Tutte le conferme sono necessarie per procedere"
      }
    };
    return translations[language]?.[key] || translations.en[key];
  };

  const isValid = legalAgeConfirmed && legalKnowledgeConfirmed && gdprConsent;

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Scale className="h-6 w-6 text-primary" />
          <h2 className="text-3xl font-bold">{t("headline")}</h2>
        </div>
        <p className="text-sm text-muted-foreground">{t("subheadline")}</p>
      </div>

      <div className="max-w-md mx-auto">
        <TooltipProvider>
          <div className="bg-muted/30 rounded-lg p-6 space-y-6">
            {/* Age Confirmation */}
            <div className="flex items-start space-x-3">
              <Checkbox
                id="age"
                checked={legalAgeConfirmed}
                onCheckedChange={onLegalAgeChange}
                className="mt-1"
              />
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <Label htmlFor="age" className="text-base font-medium cursor-pointer">
                    {t("ageLabel")}
                  </Label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p className="text-sm">{t("ageTooltip")}</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
            </div>

            {/* Knowledge Confirmation */}
            <div className="flex items-start space-x-3">
              <Checkbox
                id="knowledge"
                checked={legalKnowledgeConfirmed}
                onCheckedChange={onLegalKnowledgeChange}
                className="mt-1"
              />
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <Label htmlFor="knowledge" className="text-base font-medium cursor-pointer">
                    {t("knowledgeLabel")}
                  </Label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p className="text-sm">{t("knowledgeTooltip")}</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
            </div>

            {/* GDPR Consent */}
            <div className="flex items-start space-x-3">
              <Checkbox
                id="gdpr"
                checked={gdprConsent}
                onCheckedChange={onGdprConsentChange}
                className="mt-1"
              />
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <Label htmlFor="gdpr" className="text-base font-medium cursor-pointer">
                    {t("gdprLabel")}
                  </Label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p className="text-sm">{t("gdprTooltip")}</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
            </div>
          </div>

          {!isValid && (
            <p className="text-xs text-muted-foreground text-center mt-4">
              {t("required")}
            </p>
          )}
        </TooltipProvider>
      </div>

      <div className="flex justify-between pt-8">
        <Button
          onClick={onBack}
          variant="outline"
          size="lg"
          className="min-w-[120px]"
        >
          <ChevronLeft className="mr-2 h-5 w-5" />
          {t("backButton")}
        </Button>
        <Button
          onClick={onNext}
          disabled={!isValid}
          size="lg"
          className="min-w-[160px]"
        >
          {t("nextButton")}
          <ChevronRight className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ChevronLeft, ChevronRight, Plus, Minus, User } from "lucide-react";
import { useState } from "react";

interface Step2VisitorInfoProps {
  visitorCount: number;
  visitorFirstNames: string[];
  visitorLastNames: string[];
  notes: string;
  onVisitorCountChange: (count: number) => void;
  onVisitorFirstNameChange: (index: number, name: string) => void;
  onVisitorLastNameChange: (index: number, name: string) => void;
  onNotesChange: (notes: string) => void;
  onNext: () => void;
  onBack: () => void;
  language: string;
}

const translations: Record<string, Record<string, string>> = {
  en: {
    headline: "Great! Who will be joining?",
    subheadline: "Tell us about your group",
    visitorCountLabel: "Number of visitors",
    firstName: "First name",
    lastName: "Last name",
    yourFirstName: "Your first name",
    yourLastName: "Your last name",
    guestName: "Guest",
    addMessage: "+ Add a message (optional)",
    notesPlaceholder: "Any dietary restrictions, special requests, or questions?",
    notesLabel: "Additional notes",
    nextButton: "Next",
    backButton: "Back",
    justMe: "Just me",
    people: "people"
  },
  es: {
    headline: "¡Genial! ¿Quién vendrá?",
    subheadline: "Cuéntanos sobre tu grupo",
    visitorCountLabel: "Número de visitantes",
    firstName: "Nombre",
    lastName: "Apellido",
    yourFirstName: "Tu nombre",
    yourLastName: "Tu apellido",
    guestName: "Invitado",
    addMessage: "+ Añadir mensaje (opcional)",
    notesPlaceholder: "¿Alguna restricción alimentaria, solicitud especial o pregunta?",
    notesLabel: "Notas adicionales",
    nextButton: "Siguiente",
    backButton: "Atrás",
    justMe: "Solo yo",
    people: "personas"
  },
  de: {
    headline: "Großartig! Wer wird dabei sein?",
    subheadline: "Erzählen Sie uns von Ihrer Gruppe",
    visitorCountLabel: "Anzahl der Besucher",
    firstName: "Vorname",
    lastName: "Nachname",
    yourFirstName: "Ihr Vorname",
    yourLastName: "Ihr Nachname",
    guestName: "Gast",
    addMessage: "+ Nachricht hinzufügen (optional)",
    notesPlaceholder: "Diätetische Einschränkungen, besondere Wünsche oder Fragen?",
    notesLabel: "Zusätzliche Anmerkungen",
    nextButton: "Weiter",
    backButton: "Zurück",
    justMe: "Nur ich",
    people: "Personen"
  },
  fr: {
    headline: "Super! Qui sera présent?",
    subheadline: "Parlez-nous de votre groupe",
    visitorCountLabel: "Nombre de visiteurs",
    firstName: "Prénom",
    lastName: "Nom",
    yourFirstName: "Votre prénom",
    yourLastName: "Votre nom",
    guestName: "Invité",
    addMessage: "+ Ajouter un message (optionnel)",
    notesPlaceholder: "Restrictions alimentaires, demandes spéciales ou questions?",
    notesLabel: "Notes supplémentaires",
    nextButton: "Suivant",
    backButton: "Retour",
    justMe: "Juste moi",
    people: "personnes"
  },
  it: {
    headline: "Ottimo! Chi parteciperà?",
    subheadline: "Parlaci del tuo gruppo",
    visitorCountLabel: "Numero di visitatori",
    firstName: "Nome",
    lastName: "Cognome",
    yourFirstName: "Il tuo nome",
    yourLastName: "Il tuo cognome",
    guestName: "Ospite",
    addMessage: "+ Aggiungi un messaggio (opzionale)",
    notesPlaceholder: "Restrizioni alimentari, richieste speciali o domande?",
    notesLabel: "Note aggiuntive",
    nextButton: "Avanti",
    backButton: "Indietro",
    justMe: "Solo io",
    people: "persone"
  }
};

export function Step2VisitorInfo({
  visitorCount,
  visitorFirstNames,
  visitorLastNames,
  notes,
  onVisitorCountChange,
  onVisitorFirstNameChange,
  onVisitorLastNameChange,
  onNotesChange,
  onNext,
  onBack,
  language
}: Step2VisitorInfoProps) {
  const [showNotes, setShowNotes] = useState(notes.length > 0);

  const t = (key: string) => translations[language]?.[key] || translations.en[key];

  const handleCountChange = (delta: number) => {
    const newCount = Math.max(1, Math.min(10, visitorCount + delta));
    onVisitorCountChange(newCount);
  };

  const isValid = Array.from({ length: visitorCount }, (_, i) =>
    (visitorFirstNames[i] || "").trim().length > 0 &&
    (visitorLastNames[i] || "").trim().length > 0
  ).every(Boolean);

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold">{t("headline")}</h2>
        <p className="text-muted-foreground">{t("subheadline")}</p>
      </div>

      <div className="max-w-md mx-auto space-y-6">
        {/* Visitor Count Selector */}
        <div className="space-y-3">
          <Label className="text-base">{t("visitorCountLabel")}</Label>
          <div className="flex items-center justify-center gap-4">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-12 w-12"
              onClick={() => handleCountChange(-1)}
              disabled={visitorCount <= 1}
            >
              <Minus className="h-5 w-5" />
            </Button>
            <div className="text-center min-w-[120px]">
              <div className="text-4xl font-bold">{visitorCount}</div>
              <div className="text-sm text-muted-foreground">
                {visitorCount === 1 ? t("justMe") : t("people")}
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-12 w-12"
              onClick={() => handleCountChange(1)}
              disabled={visitorCount >= 10}
            >
              <Plus className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Visitor Names */}
        <div className="space-y-4">
          {Array.from({ length: visitorCount }, (_, i) => (
            <div key={i} className="space-y-2 animate-scale-in">
              <Label className="text-sm font-medium">
                {i === 0 ? t("firstName") : `${t("guestName")} ${i + 1}`}
              </Label>
              <div className="grid grid-cols-2 gap-3">
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={visitorFirstNames[i] || ""}
                    onChange={(e) => onVisitorFirstNameChange(i, e.target.value)}
                    placeholder={i === 0 ? t("yourFirstName") : t("firstName")}
                    className="pl-10"
                  />
                </div>
                <Input
                  value={visitorLastNames[i] || ""}
                  onChange={(e) => onVisitorLastNameChange(i, e.target.value)}
                  placeholder={i === 0 ? t("yourLastName") : t("lastName")}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Optional Notes */}
        {!showNotes ? (
          <button
            type="button"
            onClick={() => setShowNotes(true)}
            className="text-sm text-primary hover:underline"
          >
            {t("addMessage")}
          </button>
        ) : (
          <div className="space-y-2 animate-scale-in">
            <Label htmlFor="notes">{t("notesLabel")}</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => onNotesChange(e.target.value)}
              placeholder={t("notesPlaceholder")}
              className="min-h-[100px]"
            />
          </div>
        )}
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
          className="min-w-[120px]"
        >
          {t("nextButton")}
          <ChevronRight className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}

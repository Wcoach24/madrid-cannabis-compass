import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, Calendar, Users, Mail, Phone, Edit, Send } from "lucide-react";
import { format } from "date-fns";

interface Step5ReviewProps {
  visitDate: Date;
  visitorCount: number;
  visitorNames: string[];
  email: string;
  phone: string;
  notes: string;
  onEdit: (step: number) => void;
  onSubmit: () => void;
  onBack: () => void;
  isSubmitting: boolean;
  language: string;
}

export function Step5Review({
  visitDate,
  visitorCount,
  visitorNames,
  email,
  phone,
  notes,
  onEdit,
  onSubmit,
  onBack,
  isSubmitting,
  language
}: Step5ReviewProps) {
  const t = (key: string) => {
    const translations: Record<string, Record<string, string>> = {
      en: {
        headline: "You're all set!",
        subheadline: "Review your invitation request before submitting",
        visitDateLabel: "Visit Date",
        visitorsLabel: "Visitors",
        contactLabel: "Contact Information",
        notesLabel: "Additional Notes",
        edit: "Edit",
        submitButton: "Send My Invitation Request",
        submitting: "Sending...",
        backButton: "Back",
        responseTime: "We'll review and get back to you within 24 hours",
        people: "people"
      },
      es: {
        headline: "¡Todo listo!",
        subheadline: "Revisa tu solicitud de invitación antes de enviarla",
        visitDateLabel: "Fecha de Visita",
        visitorsLabel: "Visitantes",
        contactLabel: "Información de Contacto",
        notesLabel: "Notas Adicionales",
        edit: "Editar",
        submitButton: "Enviar Mi Solicitud de Invitación",
        submitting: "Enviando...",
        backButton: "Atrás",
        responseTime: "Revisaremos tu solicitud y te responderemos en 24 horas",
        people: "personas"
      }
    };
    return translations[language]?.[key] || translations.en[key];
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold">{t("headline")}</h2>
        <p className="text-muted-foreground">{t("subheadline")}</p>
      </div>

      <div className="max-w-md mx-auto space-y-4">
        {/* Visit Date */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1">
                <Calendar className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">{t("visitDateLabel")}</p>
                  <p className="font-medium">{format(visitDate, "PPP")}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(1)}
                className="text-primary hover:text-primary/80"
              >
                <Edit className="h-4 w-4 mr-1" />
                {t("edit")}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Visitors */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1">
                <Users className="h-5 w-5 text-primary mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">{t("visitorsLabel")}</p>
                  <p className="font-medium mb-2">
                    {visitorCount} {visitorCount === 1 ? "person" : t("people")}
                  </p>
                  <ul className="space-y-1">
                    {visitorNames.slice(0, visitorCount).map((name, i) => (
                      <li key={i} className="text-sm text-muted-foreground">
                        {i + 1}. {name}
                      </li>
                    ))}
                  </ul>
                  {notes && (
                    <div className="mt-3 pt-3 border-t">
                      <p className="text-xs text-muted-foreground mb-1">{t("notesLabel")}</p>
                      <p className="text-sm">{notes}</p>
                    </div>
                  )}
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(2)}
                className="text-primary hover:text-primary/80"
              >
                <Edit className="h-4 w-4 mr-1" />
                {t("edit")}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Contact */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1">
                <Mail className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">{t("contactLabel")}</p>
                  <p className="font-medium">{email}</p>
                  <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                    <Phone className="h-3 w-3" />
                    {phone}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(3)}
                className="text-primary hover:text-primary/80"
              >
                <Edit className="h-4 w-4 mr-1" />
                {t("edit")}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Response Time */}
        <div className="bg-muted/50 rounded-lg p-4 text-center">
          <p className="text-sm text-muted-foreground">{t("responseTime")}</p>
        </div>
      </div>

      <div className="flex justify-between pt-8">
        <Button
          onClick={onBack}
          variant="outline"
          size="lg"
          className="min-w-[120px]"
          disabled={isSubmitting}
        >
          <ChevronLeft className="mr-2 h-5 w-5" />
          {t("backButton")}
        </Button>
        <Button
          onClick={onSubmit}
          disabled={isSubmitting}
          size="lg"
          className="min-w-[200px] bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
        >
          {isSubmitting ? (
            <>
              <span className="animate-pulse">{t("submitting")}</span>
            </>
          ) : (
            <>
              <Send className="mr-2 h-5 w-5" />
              {t("submitButton")}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

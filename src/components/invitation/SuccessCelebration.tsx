import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, ArrowLeft, Building2, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";
import { buildLanguageAwarePath } from "@/lib/languageUtils";
import { Language } from "@/lib/translations";

interface SuccessCelebrationProps {
  visitorName: string;
  clubName: string;
  clubSlug: string;
  language: Language;
}

export function SuccessCelebration({ visitorName, clubName, clubSlug, language }: SuccessCelebrationProps) {
  const t = (key: string) => {
    const translations: Record<string, Record<string, string>> = {
      en: {
        title: "Request Sent Successfully!",
        message: "We've received your invitation request and will review it shortly.",
        spamWarning: "Don't see the email? Check your spam/junk folder!",
        nextSteps: "What happens next?",
        step1: "We'll review your request within 24 hours",
        step2: "You'll receive an email with the decision",
        step3: "If approved, you'll get instructions to visit the club",
        returnToClub: "Back to Club Details",
        browseClubs: "Browse Other Clubs"
      },
      es: {
        title: "¡Solicitud Enviada con Éxito!",
        message: "Hemos recibido tu solicitud de invitación y la revisaremos en breve.",
        spamWarning: "¿No ves el correo? ¡Revisa tu carpeta de spam/correo no deseado!",
        nextSteps: "¿Qué sigue ahora?",
        step1: "Revisaremos tu solicitud en 24 horas",
        step2: "Recibirás un correo con la decisión",
        step3: "Si se aprueba, recibirás instrucciones para visitar el club",
        returnToClub: "Volver a Detalles del Club",
        browseClubs: "Explorar Otros Clubes"
      },
      de: {
        title: "Anfrage erfolgreich gesendet!",
        message: "Wir haben Ihre Einladungsanfrage erhalten und werden sie in Kürze prüfen.",
        spamWarning: "E-Mail nicht gefunden? Überprüfen Sie Ihren Spam-Ordner!",
        nextSteps: "Was passiert als nächstes?",
        step1: "Wir prüfen Ihre Anfrage innerhalb von 24 Stunden",
        step2: "Sie erhalten eine E-Mail mit der Entscheidung",
        step3: "Bei Genehmigung erhalten Sie Anweisungen für den Clubbesuch",
        returnToClub: "Zurück zu Club-Details",
        browseClubs: "Andere Clubs durchsuchen"
      },
      fr: {
        title: "Demande envoyée avec succès !",
        message: "Nous avons reçu votre demande d'invitation et l'examinerons sous peu.",
        spamWarning: "Vous ne voyez pas l'e-mail ? Vérifiez votre dossier spam !",
        nextSteps: "Que se passe-t-il ensuite ?",
        step1: "Nous examinerons votre demande dans les 24 heures",
        step2: "Vous recevrez un e-mail avec la décision",
        step3: "Si approuvé, vous recevrez des instructions pour visiter le club",
        returnToClub: "Retour aux détails du club",
        browseClubs: "Parcourir d'autres clubs"
      },
      it: {
        title: "Richiesta inviata con successo!",
        message: "Abbiamo ricevuto la tua richiesta di invito e la esamineremo a breve.",
        spamWarning: "Non vedi l'email? Controlla la cartella spam!",
        nextSteps: "Cosa succede dopo?",
        step1: "Esamineremo la tua richiesta entro 24 ore",
        step2: "Riceverai un'email con la decisione",
        step3: "Se approvato, riceverai istruzioni per visitare il club",
        returnToClub: "Torna ai dettagli del club",
        browseClubs: "Sfoglia altri club"
      }
    };
    return translations[language]?.[key] || translations.en[key];
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center animate-fade-in">
      <div className="max-w-2xl mx-auto px-4 text-center">
        {/* Success Icon with Animation */}
        <div className="mb-6 animate-scale-in">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-primary/10 mb-4">
            <CheckCircle2 className="w-12 h-12 text-primary" />
          </div>
        </div>

        {/* Main Message */}
        <div className="space-y-4 mb-6">
          <h1 className="text-4xl font-bold">
            {t("title")}
          </h1>
          <p className="text-xl text-muted-foreground">
            Thanks, {visitorName}! {t("message")}
          </p>
        </div>

        {/* Spam Warning */}
        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-8 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-500 flex-shrink-0 mt-0.5" />
          <p className="text-amber-800 dark:text-amber-200 text-sm font-medium text-left">
            {t("spamWarning")}
          </p>
        </div>

        {/* Next Steps Card */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">{t("nextSteps")}</h2>
            <div className="space-y-4 text-left">
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                  1
                </div>
                <p className="text-muted-foreground pt-1">{t("step1")}</p>
              </div>
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                  2
                </div>
                <p className="text-muted-foreground pt-1">{t("step2")}</p>
              </div>
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                  3
                </div>
                <p className="text-muted-foreground pt-1">{t("step3")}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild variant="outline" size="lg">
            <Link to={buildLanguageAwarePath(`/clubs/${clubSlug}`, language)}>
              <ArrowLeft className="mr-2 h-5 w-5" />
              {t("returnToClub")}
            </Link>
          </Button>
          <Button asChild size="lg">
            <Link to={buildLanguageAwarePath("/clubs", language)}>
              <Building2 className="mr-2 h-5 w-5" />
              {t("browseClubs")}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

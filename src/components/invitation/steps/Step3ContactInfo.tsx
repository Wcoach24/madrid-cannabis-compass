import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronLeft, ChevronRight, Mail, Phone, Check } from "lucide-react";
import { useState } from "react";

interface Step3ContactInfoProps {
  email: string;
  phone: string;
  onEmailChange: (email: string) => void;
  onPhoneChange: (phone: string) => void;
  onNext: () => void;
  onBack: () => void;
  language: string;
}

export function Step3ContactInfo({
  email,
  phone,
  onEmailChange,
  onPhoneChange,
  onNext,
  onBack,
  language
}: Step3ContactInfoProps) {
  const [emailTouched, setEmailTouched] = useState(false);
  const [phoneTouched, setPhoneTouched] = useState(false);

  const t = (key: string) => {
    const translations: Record<string, Record<string, string>> = {
      en: {
        headline: "Almost there! How should we contact you?",
        subheadline: "We'll send confirmation details here",
        emailLabel: "Email address",
        emailPlaceholder: "your@email.com",
        emailHint: "We'll send confirmation here",
        phoneLabel: "Phone number",
        phonePlaceholder: "+34 600 000 000",
        phoneHint: "Include country code (e.g., +34 for Spain)",
        privacyNote: "🔒 Your information is secure and never shared",
        nextButton: "Next",
        backButton: "Back",
        emailInvalid: "Please enter a valid email address",
        phoneInvalid: "Please enter a valid phone number (9-15 digits)"
      },
      es: {
        headline: "¡Casi listo! ¿Cómo podemos contactarte?",
        subheadline: "Enviaremos los detalles de confirmación aquí",
        emailLabel: "Correo electrónico",
        emailPlaceholder: "tu@email.com",
        emailHint: "Enviaremos la confirmación aquí",
        phoneLabel: "Número de teléfono",
        phonePlaceholder: "+34 600 000 000",
        phoneHint: "Incluye el código de país (ej: +34 para España)",
        privacyNote: "🔒 Tu información es segura y nunca se comparte",
        nextButton: "Siguiente",
        backButton: "Atrás",
        emailInvalid: "Por favor, introduce un correo electrónico válido",
        phoneInvalid: "Por favor, introduce un número de teléfono válido (9-15 dígitos)"
      },
      de: {
        headline: "Fast geschafft! Wie können wir Sie kontaktieren?",
        subheadline: "Wir senden die Bestätigungsdetails hierher",
        emailLabel: "E-Mail-Adresse",
        emailPlaceholder: "ihre@email.com",
        emailHint: "Wir senden die Bestätigung hierher",
        phoneLabel: "Telefonnummer",
        phonePlaceholder: "+49 170 000 0000",
        phoneHint: "Ländervorwahl angeben (z.B. +49 für Deutschland)",
        privacyNote: "🔒 Ihre Daten sind sicher und werden niemals weitergegeben",
        nextButton: "Weiter",
        backButton: "Zurück",
        emailInvalid: "Bitte geben Sie eine gültige E-Mail-Adresse ein",
        phoneInvalid: "Bitte geben Sie eine gültige Telefonnummer ein (9-15 Ziffern)"
      },
      fr: {
        headline: "Presque terminé! Comment pouvons-nous vous contacter?",
        subheadline: "Nous enverrons les détails de confirmation ici",
        emailLabel: "Adresse e-mail",
        emailPlaceholder: "votre@email.com",
        emailHint: "Nous enverrons la confirmation ici",
        phoneLabel: "Numéro de téléphone",
        phonePlaceholder: "+33 6 00 00 00 00",
        phoneHint: "Incluez l'indicatif du pays (ex: +33 pour la France)",
        privacyNote: "🔒 Vos informations sont sécurisées et jamais partagées",
        nextButton: "Suivant",
        backButton: "Retour",
        emailInvalid: "Veuillez entrer une adresse e-mail valide",
        phoneInvalid: "Veuillez entrer un numéro de téléphone valide (9-15 chiffres)"
      },
      it: {
        headline: "Ci siamo quasi! Come possiamo contattarti?",
        subheadline: "Invieremo i dettagli di conferma qui",
        emailLabel: "Indirizzo email",
        emailPlaceholder: "tua@email.com",
        emailHint: "Invieremo la conferma qui",
        phoneLabel: "Numero di telefono",
        phonePlaceholder: "+39 333 000 0000",
        phoneHint: "Includi il prefisso internazionale (es: +39 per l'Italia)",
        privacyNote: "🔒 Le tue informazioni sono sicure e mai condivise",
        nextButton: "Avanti",
        backButton: "Indietro",
        emailInvalid: "Inserisci un indirizzo email valido",
        phoneInvalid: "Inserisci un numero di telefono valido (9-15 cifre)"
      }
    };
    return translations[language]?.[key] || translations.en[key];
  };

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^\+?[0-9]{9,15}$/;

  const isEmailValid = emailRegex.test(email);
  const isPhoneValid = phoneRegex.test(phone);

  const isValid = isEmailValid && isPhoneValid;

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold">{t("headline")}</h2>
        <p className="text-muted-foreground">{t("subheadline")}</p>
      </div>

      <div className="max-w-md mx-auto space-y-6">
        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email" className="text-base">{t("emailLabel")}</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => onEmailChange(e.target.value)}
              onBlur={() => setEmailTouched(true)}
              placeholder={t("emailPlaceholder")}
              className="pl-10 pr-10"
            />
            {isEmailValid && emailTouched && (
              <Check className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />
            )}
          </div>
          <p className="text-xs text-muted-foreground">{t("emailHint")}</p>
          {emailTouched && !isEmailValid && email.length > 0 && (
            <p className="text-xs text-destructive">{t("emailInvalid")}</p>
          )}
        </div>

        {/* Phone */}
        <div className="space-y-2">
          <Label htmlFor="phone" className="text-base">{t("phoneLabel")}</Label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => onPhoneChange(e.target.value)}
              onBlur={() => setPhoneTouched(true)}
              placeholder={t("phonePlaceholder")}
              className="pl-10 pr-10"
            />
            {isPhoneValid && phoneTouched && (
              <Check className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />
            )}
          </div>
          <p className="text-xs text-muted-foreground">{t("phoneHint")}</p>
          {phoneTouched && !isPhoneValid && phone.length > 0 && (
            <p className="text-xs text-destructive">{t("phoneInvalid")}</p>
          )}
        </div>

        {/* Privacy Note */}
        <div className="bg-muted/50 rounded-lg p-4 text-center">
          <p className="text-sm text-muted-foreground">{t("privacyNote")}</p>
        </div>
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

import { CheckCircle, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Language } from "@/lib/translations";

interface AlreadySubmittedMessageProps {
  invitationCode: string | null;
  language: Language;
  onRequestNew: () => void;
}

export function AlreadySubmittedMessage({ 
  invitationCode, 
  language, 
  onRequestNew 
}: AlreadySubmittedMessageProps) {
  const isSpanish = language === 'es';

  return (
    <Card className="max-w-lg mx-auto">
      <CardContent className="p-8 text-center">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-green-500" />
        </div>
        
        <h2 className="text-2xl font-bold mb-3">
          {isSpanish ? "¡Ya Tienes una Invitación!" : "You've Already Submitted!"}
        </h2>
        
        <p className="text-muted-foreground mb-6">
          {isSpanish 
            ? "Revisa tu correo electrónico para encontrar tu código de invitación. Si no lo recibiste, contáctanos por WhatsApp."
            : "Check your email for your invitation code. If you didn't receive it, contact us via WhatsApp."}
        </p>

        {invitationCode && (
          <div className="mb-6 p-4 bg-primary/10 rounded-lg border border-primary/20">
            <p className="text-sm text-muted-foreground mb-1">
              {isSpanish ? "Tu código de invitación:" : "Your invitation code:"}
            </p>
            <p className="text-2xl font-mono font-bold text-primary">
              {invitationCode}
            </p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild className="bg-green-600 hover:bg-green-700">
            <a href="https://wa.me/34632332050" target="_blank" rel="noopener noreferrer">
              <MessageCircle className="w-4 h-4 mr-2" />
              {isSpanish ? "Contactar por WhatsApp" : "Contact via WhatsApp"}
            </a>
          </Button>
          
          <Button variant="outline" onClick={onRequestNew}>
            {isSpanish ? "Solicitar Nueva Invitación" : "Request New Invitation"}
          </Button>
        </div>

        <p className="text-xs text-muted-foreground mt-6">
          {isSpanish 
            ? "Puedes solicitar una nueva invitación después de 1 hora."
            : "You can request a new invitation after 1 hour."}
        </p>
      </CardContent>
    </Card>
  );
}

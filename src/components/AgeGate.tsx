import { useState, useEffect } from "react";
import { useLanguage } from "@/hooks/useLanguage";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, AlertTriangle } from "lucide-react";

const AgeGate = () => {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const ageVerified = localStorage.getItem('weedmadrid_age_verified');
    if (!ageVerified) {
      // Small delay to let the page load first
      const timer = setTimeout(() => setIsOpen(true), 500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleConfirm = () => {
    localStorage.setItem('weedmadrid_age_verified', 'true');
    setIsOpen(false);
  };

  const handleDeny = () => {
    window.location.href = 'https://www.google.com';
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent 
        className="sm:max-w-md border-primary/30 bg-background/95 backdrop-blur-sm"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Shield className="w-8 h-8 text-primary" />
            </div>
          </div>
          <DialogTitle className="text-2xl font-bold text-center">
            {t('ageGate.title')}
          </DialogTitle>
          <DialogDescription className="text-center text-base pt-2">
            {t('ageGate.description')}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 pt-4">
          <div className="bg-muted/50 rounded-lg p-4 text-center">
            <Badge variant="outline" className="mb-2">
              <AlertTriangle className="w-3 h-3 mr-1" />
              {t('ageGate.legalNotice')}
            </Badge>
            <p className="text-sm text-muted-foreground">
              {t('ageGate.disclaimer')}
            </p>
          </div>
          
          <div className="flex flex-col gap-3">
            <Button 
              onClick={handleConfirm}
              className="w-full text-lg py-6"
              size="lg"
            >
              {t('ageGate.confirm')}
            </Button>
            <Button 
              onClick={handleDeny}
              variant="outline"
              className="w-full"
            >
              {t('ageGate.deny')}
            </Button>
          </div>
          
          <p className="text-xs text-muted-foreground text-center">
            {t('ageGate.privacyNote')}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AgeGate;

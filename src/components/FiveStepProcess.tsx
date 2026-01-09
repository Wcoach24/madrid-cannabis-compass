import { useLanguage } from "@/hooks/useLanguage";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, FileText, Mail, MapPin, Smile } from "lucide-react";

const FiveStepProcess = () => {
  const { t } = useLanguage();

  const steps = [
    {
      number: 1,
      icon: Search,
      title: t('process.step1.title'),
      description: t('process.step1.description'),
      color: "text-blue-500",
      bgColor: "bg-blue-500/10"
    },
    {
      number: 2,
      icon: FileText,
      title: t('process.step2.title'),
      description: t('process.step2.description'),
      color: "text-purple-500",
      bgColor: "bg-purple-500/10"
    },
    {
      number: 3,
      icon: Mail,
      title: t('process.step3.title'),
      description: t('process.step3.description'),
      color: "text-green-500",
      bgColor: "bg-green-500/10"
    },
    {
      number: 4,
      icon: MapPin,
      title: t('process.step4.title'),
      description: t('process.step4.description'),
      color: "text-orange-500",
      bgColor: "bg-orange-500/10"
    },
    {
      number: 5,
      icon: Smile,
      title: t('process.step5.title'),
      description: t('process.step5.description'),
      color: "text-primary",
      bgColor: "bg-primary/10"
    }
  ];

  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-4">
            {t('process.badge')}
          </Badge>
          <p className="text-3xl md:text-4xl font-bold mb-4" role="heading" aria-level={2}>
            {t('process.title')}
          </p>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {t('process.subtitle')}
          </p>
        </div>

        {/* Desktop: Horizontal Steps */}
        <div className="hidden lg:block">
          <div className="flex items-start justify-between relative">
            {/* Connector Line */}
            <div className="absolute top-10 left-[10%] right-[10%] h-0.5 bg-border" />
            
            {steps.map((step, index) => (
              <div key={index} className="flex flex-col items-center w-1/5 relative z-10">
                <div className={`w-20 h-20 rounded-full ${step.bgColor} flex items-center justify-center mb-4 border-4 border-background shadow-lg`}>
                  <step.icon className={`w-8 h-8 ${step.color}`} />
                </div>
                <Badge variant="secondary" className="mb-2">
                  {t('process.stepLabel')} {step.number}
                </Badge>
                <h3 className="font-semibold text-center mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground text-center px-2">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile/Tablet: Vertical Cards */}
        <div className="lg:hidden grid gap-4 md:grid-cols-2">
          {steps.map((step, index) => (
            <Card key={index} className="overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className={`w-14 h-14 rounded-full ${step.bgColor} flex items-center justify-center flex-shrink-0`}>
                    <step.icon className={`w-6 h-6 ${step.color}`} />
                  </div>
                  <div>
                    <Badge variant="secondary" className="mb-2">
                      {t('process.stepLabel')} {step.number}
                    </Badge>
                    <h3 className="font-semibold mb-1">{step.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {step.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Time indicator */}
        <div className="text-center mt-10">
          <Badge variant="outline" className="text-base px-6 py-2">
            ⏱️ {t('process.timeEstimate')}
          </Badge>
        </div>
      </div>
    </section>
  );
};

export default FiveStepProcess;

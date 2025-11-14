import { useEffect, useState } from "react";
import { Clock, Users, CheckCircle } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

interface HeroMetricsProps {
  spotsRemaining?: number;
  nextAvailability?: string;
  avgApprovalTime?: string;
}

export const HeroMetrics = ({
  spotsRemaining = 127,
  nextAvailability = "Tomorrow",
  avgApprovalTime = "24h",
}: HeroMetricsProps) => {
  const [count, setCount] = useState(0);
  const { t } = useLanguage();

  // Animated counter for spots remaining
  useEffect(() => {
    if (count < spotsRemaining) {
      const timer = setTimeout(() => setCount(count + 1), 10);
      return () => clearTimeout(timer);
    }
  }, [count, spotsRemaining]);

  return (
    <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 mt-6">
      <div className="flex items-center gap-2 bg-background/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
        <Users className="h-4 w-4 text-white" />
        <span className="text-white font-semibold text-sm">
          <span className="text-lg font-bold">{count}</span> {t("club.spotsLeft")}
        </span>
      </div>

      <div className="flex items-center gap-2 bg-background/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
        <Clock className="h-4 w-4 text-white" />
        <span className="text-white text-sm">
          {t("club.nextAvailability")}: <span className="font-semibold">{nextAvailability}</span>
        </span>
      </div>

      <div className="flex items-center gap-2 bg-background/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
        <CheckCircle className="h-4 w-4 text-white" />
        <span className="text-white text-sm">
          {t("club.avgApproval")}: <span className="font-semibold">{avgApprovalTime}</span>
        </span>
      </div>
    </div>
  );
};

import { forwardRef } from "react";
import { Users, Building2, Clock } from "lucide-react";

interface StatsCounterProps {
  memberCount: number;
  clubCount: number;
}

const StatsCounter = forwardRef<HTMLDivElement, StatsCounterProps>(
  ({ memberCount, clubCount }, ref) => {
    return (
      <section ref={ref} className="py-16 md:py-20 bg-black relative overflow-hidden">
        {/* Background glow effect */}
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
        </div>
        
            <div className="container mx-auto px-4 relative z-10">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8 max-w-5xl mx-auto">
                {/* Members Counter */}
                <div className="text-center card-snoop p-6 md:p-8 rounded-2xl">
                  <Users className="w-10 h-10 md:w-12 md:h-12 text-primary mx-auto mb-3 md:mb-4" />
                  <div className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-gradient-gold mb-2 text-glow">
                    {memberCount.toLocaleString()}+
                  </div>
                  <p className="text-lg md:text-xl text-muted-foreground font-luxury">Happy Members</p>
                </div>

                {/* Clubs Counter */}
                <div className="text-center card-snoop p-6 md:p-8 rounded-2xl">
                  <Building2 className="w-10 h-10 md:w-12 md:h-12 text-primary mx-auto mb-3 md:mb-4" />
                  <div className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-gradient-gold mb-2 text-glow">
                    {clubCount}+
                  </div>
                  <p className="text-lg md:text-xl text-muted-foreground font-luxury">Verified Clubs</p>
                </div>

                {/* Same-Day Access */}
                <div className="text-center card-snoop p-6 md:p-8 rounded-2xl sm:col-span-2 md:col-span-1">
                  <Clock className="w-10 h-10 md:w-12 md:h-12 text-primary mx-auto mb-3 md:mb-4" />
                  <div className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-gradient-gold mb-2 text-glow">
                    24h
                  </div>
                  <p className="text-lg md:text-xl text-muted-foreground font-luxury">Same-Day Access</p>
                </div>
              </div>
            </div>
      </section>
    );
  }
);

StatsCounter.displayName = "StatsCounter";

export default StatsCounter;

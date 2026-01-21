import { Button } from "@/components/ui/button";
import { ArrowRight, Zap, MapPin, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";

const MinimalHero = () => {
  const navigate = useNavigate();

  return (
    <section className="relative pt-4 pb-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Delivery Info Bar */}
        <div className="flex items-center gap-6 mb-6">
          <div className="flex items-center gap-2 text-sm">
            <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center">
              <Clock className="w-4 h-4 text-green-600" />
            </div>
            <div>
              <p className="font-semibold text-foreground">Delivery in 30-45 min</p>
              <p className="text-xs text-muted-foreground">From partner stores</p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-sm">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <MapPin className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-foreground">12+ Stores</p>
              <p className="text-xs text-muted-foreground">Comparing prices</p>
            </div>
          </div>
        </div>

        {/* Main Hero Card */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary to-orange-400 p-6 sm:p-8 text-primary-foreground">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
          </div>

          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-sm text-sm font-medium mb-4">
                <Zap className="w-4 h-4" />
                Save up to 40% on groceries
              </div>
              <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight mb-3">
                Compare. Save. Order.
              </h1>
              <p className="text-white/90 text-lg max-w-md mx-auto lg:mx-0">
                Best prices from D-Mart, BigBasket, Zepto & local Kirana stores in one place.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                size="lg" 
                className="bg-white text-primary hover:bg-white/90 font-semibold shadow-lg"
                onClick={() => navigate('/onboarding')}
              >
                Plan Monthly Groceries
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="relative z-10 flex items-center justify-center lg:justify-start gap-8 mt-8 pt-6 border-t border-white/20">
            <div className="text-center">
              <p className="text-2xl sm:text-3xl font-bold">10K+</p>
              <p className="text-xs text-white/70">Happy Users</p>
            </div>
            <div className="text-center">
              <p className="text-2xl sm:text-3xl font-bold">₹2.5L+</p>
              <p className="text-xs text-white/70">Saved Daily</p>
            </div>
            <div className="text-center">
              <p className="text-2xl sm:text-3xl font-bold">50K+</p>
              <p className="text-xs text-white/70">Products</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MinimalHero;

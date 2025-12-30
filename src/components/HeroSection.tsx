import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, TrendingDown, Users, Truck, Zap, Star, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import heroImage from "@/assets/hero-groceries.jpg";

const HeroSection = () => {
  const navigate = useNavigate();

  const stats = [
    { icon: Users, value: "10K+", label: "Happy Families" },
    { icon: TrendingDown, value: "30%", label: "Avg Savings" },
    { icon: Truck, value: "500+", label: "Daily Deliveries" },
  ];

  const features = [
    { icon: Zap, text: "Lightning fast delivery" },
    { icon: Star, text: "Best prices guaranteed" },
    { icon: ShieldCheck, text: "Fresh & quality assured" },
  ];

  return (
    <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/5 to-transparent" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-accent/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/4 w-32 h-32 bg-primary/20 rounded-full blur-2xl animate-pulse-soft" />
      </div>

      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Content */}
          <div className="space-y-8 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-medium text-sm border border-primary/20">
              <Sparkles className="w-4 h-4" />
              <span>AI-Powered Smart Shopping</span>
            </div>

            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-[1.1] tracking-tight">
              Shop Smarter,{" "}
              <span className="text-gradient">Save Bigger</span>{" "}
              with Flash Kart
            </h1>

            <p className="text-lg sm:text-xl text-muted-foreground max-w-lg leading-relaxed">
              Compare prices across 12+ stores, get AI-powered recommendations, 
              and save up to 30% on your monthly groceries. Fast, fresh, and affordable.
            </p>

            {/* Quick Features */}
            <div className="flex flex-wrap gap-4">
              {features.map((feature) => (
                <div key={feature.text} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <feature.icon className="w-4 h-4 text-primary" />
                  <span>{feature.text}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="hero" size="lg" className="group" onClick={() => navigate('/shop')}>
                Start Shopping
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button variant="outline" size="lg" onClick={() => navigate('/auth')}>
                Sign In to Save Lists
              </Button>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-8 pt-8 border-t border-border">
              {stats.map((stat) => (
                <div key={stat.label} className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                    <stat.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <div className="font-display text-2xl font-bold text-gradient">{stat.value}</div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Hero Image */}
          <div className="relative animate-scale-in" style={{ animationDelay: "0.2s" }}>
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-border/50">
              <img
                src={heroImage}
                alt="Fresh groceries including vegetables, fruits, and bread"
                className="w-full h-auto object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/20 to-transparent" />
            </div>

            {/* Floating Cards */}
            <div className="absolute -bottom-6 -left-6 bg-card rounded-2xl p-4 shadow-soft animate-float border border-border">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full gradient-hero flex items-center justify-center">
                  <TrendingDown className="w-6 h-6 text-primary-foreground" />
                </div>
                <div>
                  <div className="font-semibold text-foreground">Save ₹2,500</div>
                  <div className="text-xs text-muted-foreground">This month</div>
                </div>
              </div>
            </div>

            <div className="absolute -top-4 -right-4 bg-card rounded-2xl p-4 shadow-soft animate-float border border-border" style={{ animationDelay: "1s" }}>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full gradient-accent flex items-center justify-center">
                  <Zap className="w-6 h-6 text-accent-foreground" />
                </div>
                <div>
                  <div className="font-semibold text-foreground">Flash Deals</div>
                  <div className="text-xs text-muted-foreground">Live now!</div>
                </div>
              </div>
            </div>

            <div className="absolute top-1/2 -right-8 bg-primary text-primary-foreground rounded-full px-4 py-2 shadow-glow animate-bounce-subtle">
              <span className="text-sm font-bold">Up to 30% OFF</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
import { ArrowRight, Sparkles, TrendingDown, Truck, BadgeCheck, Timer, Flame, BarChart3, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const HeroSectionNew = () => {
  const navigate = useNavigate();

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-accent/5 pt-8 pb-16">
      {/* Background decorations */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl translate-y-1/2" />
      
      <div className="relative max-w-7xl mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="space-y-6">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
              <Flame className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">New Year Sale Live!</span>
              <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">40% OFF</span>
            </div>

            {/* Headline */}
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-foreground">
              India's Smartest{' '}
              <span className="text-gradient">Grocery Shopping</span>{' '}
              Platform
            </h1>

            {/* Description */}
            <p className="text-lg text-muted-foreground max-w-lg">
              Compare prices from 12+ stores, order from local Kiranas, and save ₹500-₹2000 every month with AI-powered shopping.
            </p>

            {/* Quick stats */}
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2 text-sm">
                <BadgeCheck className="w-4 h-4 text-green-600" />
                <span className="text-muted-foreground">Verified Prices</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Timer className="w-4 h-4 text-primary" />
                <span className="text-muted-foreground">Real-time Updates</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Truck className="w-4 h-4 text-accent" />
                <span className="text-muted-foreground">Free Delivery ₹2500+</span>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <Button variant="hero" size="lg" className="group" onClick={() => navigate('/onboarding')}>
                <Sparkles className="w-5 h-5 mr-2" />
                Start AI Planning
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button variant="outline" size="lg">
                Learn How It Works
              </Button>
            </div>

            {/* Stats */}
            <div className="flex gap-8 pt-6 border-t border-border/50">
              <div>
                <p className="font-display text-3xl font-bold text-primary">12+</p>
                <p className="text-sm text-muted-foreground">Stores Tracked</p>
              </div>
              <div>
                <p className="font-display text-3xl font-bold text-accent">40%</p>
                <p className="text-sm text-muted-foreground">Max Savings</p>
              </div>
              <div>
                <p className="font-display text-3xl font-bold text-foreground">10K+</p>
                <p className="text-sm text-muted-foreground">Happy Families</p>
              </div>
            </div>
          </div>

          {/* Visual Cards */}
          <div className="relative hidden lg:block">
            <div className="relative">
              {/* Main card - Compare */}
              <div className="bg-card rounded-3xl p-8 shadow-xl border border-border/50 mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 rounded-xl bg-blue-500/10">
                    <BarChart3 className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground">Compare Prices</h3>
                    <p className="text-sm text-muted-foreground">Track across retail giants</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {['D-Mart', 'BigBasket', 'Zepto'].map((store) => (
                    <div key={store} className="p-3 rounded-xl bg-muted/50 text-center">
                      <p className="text-xs text-muted-foreground">{store}</p>
                      <p className="font-bold text-foreground">₹{Math.floor(Math.random() * 50) + 80}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Secondary card - Order */}
              <div className="bg-card rounded-3xl p-8 shadow-xl border border-border/50 ml-12">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 rounded-xl bg-primary/10">
                    <ShoppingBag className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground">Order from Kirana</h3>
                    <p className="text-sm text-muted-foreground">Local verified partners</p>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🏠</span>
                    <span className="text-sm font-medium text-foreground">Sharma Store</span>
                  </div>
                  <span className="text-xs bg-green-500/10 text-green-600 px-2 py-1 rounded-full">30 min</span>
                </div>
              </div>

              {/* Floating elements */}
              <div className="absolute -top-4 right-8 bg-primary text-primary-foreground rounded-full px-4 py-2 shadow-glow animate-bounce-subtle">
                <span className="text-sm font-bold">Save up to 40%</span>
              </div>
              <div className="absolute bottom-1/3 -left-4 bg-green-500 text-white rounded-full px-3 py-1.5 shadow-lg animate-bounce-subtle" style={{ animationDelay: '0.5s' }}>
                <span className="text-xs font-bold flex items-center gap-1">
                  <Truck className="w-3 h-3" /> Free Delivery
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSectionNew;

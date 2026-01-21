import { ShoppingBag, Truck, Clock, Star, BadgeCheck, MapPin, Store, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const KIRANA_STORES = [
  { 
    name: 'Sharma General Store', 
    logo: '🏠', 
    rating: 4.8, 
    deliveryTime: '30 min',
    minOrder: 200,
    freeDelivery: 500,
    verified: true
  },
  { 
    name: 'Gupta Kirana & More', 
    logo: '🛍️', 
    rating: 4.6, 
    deliveryTime: '45 min',
    minOrder: 150,
    freeDelivery: 400,
    verified: true
  },
  { 
    name: 'Patel Super Mart', 
    logo: '🏪', 
    rating: 4.9, 
    deliveryTime: '25 min',
    minOrder: 100,
    freeDelivery: 300,
    verified: true
  },
  { 
    name: 'Krishna Provisions', 
    logo: '🛒', 
    rating: 4.7, 
    deliveryTime: '35 min',
    minOrder: 200,
    freeDelivery: 450,
    verified: true
  },
];

interface KiranaOrderSectionProps {
  onOrderClick?: () => void;
}

const KiranaOrderSection = ({ onOrderClick }: KiranaOrderSectionProps) => {
  return (
    <section className="relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
      <div className="absolute top-1/2 right-0 w-80 h-80 bg-primary/10 rounded-full blur-3xl -translate-y-1/2" />
      <div className="absolute bottom-0 left-1/4 w-64 h-64 bg-accent/10 rounded-full blur-3xl" />
      
      <div className="relative py-16 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-medium text-sm mb-4 border border-primary/20">
              <ShoppingBag className="w-4 h-4" />
              <span>Order & Delivery Available</span>
            </div>
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4 text-foreground">
              Order from <span className="text-gradient">Trusted Kirana Partners</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Place orders directly with our verified local Kirana partners. Get doorstep delivery with the best prices and personal service.
            </p>
          </div>

          {/* Kirana Store Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
            {KIRANA_STORES.map((store) => (
              <div
                key={store.name}
                className="group relative bg-card rounded-2xl border border-border/50 hover:border-primary/30 hover:shadow-xl transition-all duration-300 overflow-hidden"
              >
                {/* Header with gradient */}
                <div className="h-2 gradient-hero" />
                
                <div className="p-5">
                  {/* Store info */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-xl">
                        {store.logo}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h3 className="font-semibold text-foreground text-sm">{store.name}</h3>
                          {store.verified && (
                            <BadgeCheck className="w-4 h-4 text-primary" />
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          <span className="font-medium text-foreground">{store.rating}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        Delivery
                      </span>
                      <span className="font-medium text-foreground">{store.deliveryTime}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Min order</span>
                      <span className="font-medium text-foreground">₹{store.minOrder}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground flex items-center gap-1.5">
                        <Truck className="w-3.5 h-3.5" />
                        Free delivery
                      </span>
                      <span className="font-medium text-green-600 dark:text-green-400">₹{store.freeDelivery}+</span>
                    </div>
                  </div>

                  {/* Order button */}
                  <Button 
                    variant="outline" 
                    className="w-full group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all"
                    size="sm"
                  >
                    Order Now
                    <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-0.5 transition-transform" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Benefits */}
          <div className="grid md:grid-cols-4 gap-4 mb-10">
            <div className="flex flex-col items-center text-center p-5 bg-card/50 rounded-xl border border-border/50 backdrop-blur-sm">
              <div className="p-3 rounded-full bg-primary/10 mb-3">
                <Truck className="w-5 h-5 text-primary" />
              </div>
              <h4 className="font-semibold text-sm text-foreground mb-1">Free Bulk Delivery</h4>
              <p className="text-xs text-muted-foreground">On orders ₹2500+</p>
            </div>
            <div className="flex flex-col items-center text-center p-5 bg-card/50 rounded-xl border border-border/50 backdrop-blur-sm">
              <div className="p-3 rounded-full bg-green-500/10 mb-3">
                <BadgeCheck className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <h4 className="font-semibold text-sm text-foreground mb-1">Verified Partners</h4>
              <p className="text-xs text-muted-foreground">Background checked</p>
            </div>
            <div className="flex flex-col items-center text-center p-5 bg-card/50 rounded-xl border border-border/50 backdrop-blur-sm">
              <div className="p-3 rounded-full bg-accent/10 mb-3">
                <MapPin className="w-5 h-5 text-accent" />
              </div>
              <h4 className="font-semibold text-sm text-foreground mb-1">Local Support</h4>
              <p className="text-xs text-muted-foreground">Shop from your area</p>
            </div>
            <div className="flex flex-col items-center text-center p-5 bg-card/50 rounded-xl border border-border/50 backdrop-blur-sm">
              <div className="p-3 rounded-full bg-amber-500/10 mb-3">
                <Star className="w-5 h-5 text-amber-500" />
              </div>
              <h4 className="font-semibold text-sm text-foreground mb-1">Best Prices</h4>
              <p className="text-xs text-muted-foreground">Match retail prices</p>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center">
            <Button variant="hero" size="lg" className="gap-2" onClick={onOrderClick}>
              <Store className="w-5 h-5" />
              Browse All Partner Stores
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default KiranaOrderSection;

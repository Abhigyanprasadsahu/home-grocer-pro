import { TrendingDown, Store, ExternalLink, BarChart3, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

const RETAIL_STORES = [
  { name: 'D-Mart', logo: '🏪', color: 'bg-blue-500', savings: 'Up to 25%' },
  { name: 'BigBasket', logo: '🛒', color: 'bg-green-500', savings: 'Up to 20%' },
  { name: 'Zepto', logo: '⚡', color: 'bg-purple-500', savings: 'Up to 15%' },
  { name: 'Blinkit', logo: '🚀', color: 'bg-yellow-500', savings: 'Up to 18%' },
  { name: 'Reliance Fresh', logo: '🍃', color: 'bg-emerald-500', savings: 'Up to 22%' },
  { name: 'JioMart', logo: '📦', color: 'bg-indigo-500', savings: 'Up to 20%' },
];

interface PriceComparisonSectionProps {
  onCompareClick?: () => void;
}

const PriceComparisonSection = ({ onCompareClick }: PriceComparisonSectionProps) => {
  return (
    <section className="relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-background to-purple-50/50 dark:from-blue-950/20 dark:via-background dark:to-purple-950/20" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl" />
      
      <div className="relative py-16 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 font-medium text-sm mb-4 border border-blue-500/20">
              <BarChart3 className="w-4 h-4" />
              <span>Real-Time Price Intelligence</span>
            </div>
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4 text-foreground">
              Compare Prices from <span className="text-blue-600 dark:text-blue-400">Retail Giants</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              We track prices from India's top retail chains in real-time. Browse, compare, and discover the best deals across 12+ stores.
            </p>
          </div>

          {/* Store Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-10">
            {RETAIL_STORES.map((store) => (
              <div
                key={store.name}
                className="group relative bg-card rounded-2xl p-5 border border-border/50 hover:border-blue-500/30 hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden"
              >
                {/* Hover gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <div className="relative">
                  <div className={`w-14 h-14 rounded-xl ${store.color} flex items-center justify-center text-2xl mb-3 shadow-md group-hover:scale-110 transition-transform`}>
                    {store.logo}
                  </div>
                  <h3 className="font-semibold text-foreground mb-1">{store.name}</h3>
                  <p className="text-xs text-green-600 dark:text-green-400 font-medium">{store.savings} off</p>
                </div>
                
                {/* External link indicator */}
                <ExternalLink className="absolute top-3 right-3 w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            ))}
          </div>

          {/* Features Row */}
          <div className="grid md:grid-cols-3 gap-6 mb-10">
            <div className="flex items-start gap-4 p-5 bg-card/50 rounded-xl border border-border/50 backdrop-blur-sm">
              <div className="p-3 rounded-lg bg-blue-500/10">
                <TrendingDown className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-1">Price Tracking</h4>
                <p className="text-sm text-muted-foreground">Live price updates every 30 seconds from all stores</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-5 bg-card/50 rounded-xl border border-border/50 backdrop-blur-sm">
              <div className="p-3 rounded-lg bg-purple-500/10">
                <BarChart3 className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-1">Price History</h4>
                <p className="text-sm text-muted-foreground">See price trends and buy at the best time</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-5 bg-card/50 rounded-xl border border-border/50 backdrop-blur-sm">
              <div className="p-3 rounded-lg bg-green-500/10">
                <Zap className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-1">Instant Alerts</h4>
                <p className="text-sm text-muted-foreground">Get notified when prices drop on your favorites</p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-muted/50 rounded-full text-sm text-muted-foreground mb-4">
              <Store className="w-4 h-4" />
              <span>Comparison only — we don't sell these products directly</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PriceComparisonSection;

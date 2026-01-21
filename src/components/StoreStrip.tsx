import { Store, TrendingDown, Truck, BadgeCheck } from 'lucide-react';

const stores = [
  { name: 'D-Mart', logo: '🛒', tag: 'Lowest Prices', color: 'bg-blue-500' },
  { name: 'BigBasket', logo: '🧺', tag: 'Wide Range', color: 'bg-green-500' },
  { name: 'Zepto', logo: '⚡', tag: '10 min', color: 'bg-purple-500' },
  { name: 'Blinkit', logo: '🟡', tag: '15 min', color: 'bg-yellow-500' },
  { name: 'JioMart', logo: '🔵', tag: 'Bulk Deals', color: 'bg-blue-600' },
  { name: 'Kirana', logo: '🏪', tag: 'Local Trust', color: 'bg-orange-500' },
];

const StoreStrip = () => {
  return (
    <section className="py-3 border-y border-border/50 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
          <div className="flex items-center gap-2 pr-4 border-r border-border/50 shrink-0">
            <TrendingDown className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-foreground whitespace-nowrap">Comparing</span>
          </div>
          
          {stores.map((store) => (
            <div
              key={store.name}
              className="flex items-center gap-2 px-3 py-1.5 bg-card rounded-full border border-border/50 shrink-0 hover:border-primary/30 transition-colors cursor-pointer group"
            >
              <span className="text-lg">{store.logo}</span>
              <div className="hidden sm:block">
                <p className="text-xs font-medium text-foreground leading-tight">{store.name}</p>
                <p className="text-[10px] text-muted-foreground">{store.tag}</p>
              </div>
            </div>
          ))}
          
          <div className="flex items-center gap-1.5 px-3 py-1.5 text-muted-foreground shrink-0">
            <BadgeCheck className="w-4 h-4 text-green-500" />
            <span className="text-xs">All verified</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StoreStrip;

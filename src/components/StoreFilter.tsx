import { StoreSummary } from '@/hooks/useLivePrices';
import { cn } from '@/lib/utils';
import { Eye, ShoppingBag, Info } from 'lucide-react';

interface StoreFilterProps {
  stores: StoreSummary[];
  selectedStores: string[];
  onStoreToggle: (storeId: string) => void;
}

// Big retail stores - for price comparison only
const COMPARISON_ONLY_STORES = ['dmart', 'reliance', 'bigbazaar', 'more', 'spencer'];

const StoreFilter = ({ stores, selectedStores, onStoreToggle }: StoreFilterProps) => {
  if (stores.length === 0) {
    return (
      <div className="flex flex-wrap items-center gap-2 p-4 bg-card rounded-xl border border-border/50">
        <span className="text-sm text-muted-foreground">Loading stores...</span>
      </div>
    );
  }

  const isComparisonOnly = (storeName: string) => {
    return COMPARISON_ONLY_STORES.some(s => 
      storeName.toLowerCase().includes(s) || 
      storeName.toLowerCase().replace(/[\s-]/g, '').includes(s)
    );
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2 p-4 bg-card rounded-xl border border-border/50">
        <span className="text-sm font-medium text-muted-foreground mr-2">Compare Prices:</span>
        {stores.map((store) => {
          const comparisonOnly = isComparisonOnly(store.name);
          return (
            <button
              key={store.id}
              onClick={() => onStoreToggle(store.id)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all relative",
                selectedStores.includes(store.id)
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
              style={selectedStores.includes(store.id) ? { backgroundColor: store.color } : {}}
              title={comparisonOnly ? 'Price comparison only - Order from Kirana partners' : 'Available for ordering'}
            >
              {comparisonOnly && (
                <Eye className="w-3 h-3 opacity-70" />
              )}
              <span>{store.logo}</span>
              <span className="hidden sm:inline">{store.name}</span>
              <span className="text-xs opacity-70">({store.availableProducts})</span>
            </button>
          );
        })}
        {selectedStores.length > 0 && (
          <button
            onClick={() => selectedStores.forEach(s => onStoreToggle(s))}
            className="text-xs text-primary hover:underline ml-2"
          >
            Clear all
          </button>
        )}
      </div>
      
      {/* Info Banner */}
      <div className="flex items-start gap-2 px-4 py-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
        <Info className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
        <div className="text-xs text-amber-700">
          <span className="font-semibold">How it works:</span> We compare prices from D-Mart, Reliance, BigBasket & major stores to find you the best deals. 
          Your order is fulfilled by our <span className="font-medium">trusted Kirana partners</span> who match these prices and deliver to your doorstep!
        </div>
      </div>
    </div>
  );
};

export default StoreFilter;

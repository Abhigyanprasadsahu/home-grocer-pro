import { StoreSummary } from '@/hooks/useLivePrices';
import { cn } from '@/lib/utils';
import { Eye, ShoppingBag, Info } from 'lucide-react';

interface StoreFilterProps {
  stores: StoreSummary[];
  selectedStores: string[];
  onStoreToggle: (storeId: string) => void;
}

// Big retail stores - for price comparison only (can't tie up for ordering)
const COMPARISON_ONLY_STORES = ['dmart', 'd-mart', 'reliance', 'bigbazaar', 'big bazaar', 'more', 'spencer', 'blinkit', 'zepto', 'bigbasket', 'jiomart', 'amazon', 'flipkart'];

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

  // Separate stores into comparison-only and order-enabled
  const comparisonStores = stores.filter(s => isComparisonOnly(s.name));
  const orderableStores = stores.filter(s => !isComparisonOnly(s.name));

  return (
    <div className="space-y-3">
      {/* Comparison-Only Stores */}
      <div className="p-4 bg-card rounded-xl border border-border/50">
        <div className="flex items-center gap-2 mb-3">
          <Eye className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium text-muted-foreground">Compare Prices From:</span>
          <span className="text-xs bg-amber-500/10 text-amber-600 px-2 py-0.5 rounded-full">View Only</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {comparisonStores.map((store) => (
            <button
              key={store.id}
              onClick={() => onStoreToggle(store.id)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all",
                selectedStores.includes(store.id)
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
              style={selectedStores.includes(store.id) ? { backgroundColor: store.color } : {}}
              title="Price comparison only - Cannot order from this store"
            >
              <Eye className="w-3 h-3 opacity-70" />
              <span>{store.logo}</span>
              <span className="hidden sm:inline">{store.name}</span>
              <span className="text-xs opacity-70">({store.availableProducts})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Order-Enabled Kirana Stores */}
      {orderableStores.length > 0 && (
        <div className="p-4 bg-card rounded-xl border border-green-500/30">
          <div className="flex items-center gap-2 mb-3">
            <ShoppingBag className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-foreground">Order From Kirana Partners:</span>
            <span className="text-xs bg-green-500/10 text-green-600 px-2 py-0.5 rounded-full">Order Available</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {orderableStores.map((store) => (
              <button
                key={store.id}
                onClick={() => onStoreToggle(store.id)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all border",
                  selectedStores.includes(store.id)
                    ? "bg-green-600 text-white shadow-md border-green-600"
                    : "bg-green-50 text-green-700 hover:bg-green-100 border-green-200 dark:bg-green-950/30 dark:text-green-400 dark:border-green-800"
                )}
                title="Available for ordering"
              >
                <ShoppingBag className="w-3 h-3" />
                <span>{store.logo}</span>
                <span className="hidden sm:inline">{store.name}</span>
                <span className="text-xs opacity-70">({store.availableProducts})</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {selectedStores.length > 0 && (
        <button
          onClick={() => selectedStores.forEach(s => onStoreToggle(s))}
          className="text-xs text-primary hover:underline"
        >
          Clear all filters
        </button>
      )}
      
      {/* Info Banner */}
      <div className="flex items-start gap-2 px-4 py-3 bg-primary/5 border border-primary/20 rounded-xl">
        <Info className="w-4 h-4 text-primary mt-0.5 shrink-0" />
        <div className="text-xs text-muted-foreground">
          <span className="font-semibold text-foreground">How it works:</span> We compare prices from D-Mart, Reliance, Blinkit, Zepto & major stores. 
          Your order is fulfilled by our <span className="font-medium text-green-600">trusted Kirana partners</span> who match or beat these prices!
        </div>
      </div>
    </div>
  );
};

export default StoreFilter;

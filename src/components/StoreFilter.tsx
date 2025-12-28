import { StoreSummary } from '@/hooks/useLivePrices';
import { cn } from '@/lib/utils';

interface StoreFilterProps {
  stores: StoreSummary[];
  selectedStores: string[];
  onStoreToggle: (storeId: string) => void;
}

const StoreFilter = ({ stores, selectedStores, onStoreToggle }: StoreFilterProps) => {
  if (stores.length === 0) {
    return (
      <div className="flex flex-wrap items-center gap-2 p-4 bg-card rounded-xl border border-border/50">
        <span className="text-sm text-muted-foreground">Loading stores...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2 p-4 bg-card rounded-xl border border-border/50">
      <span className="text-sm font-medium text-muted-foreground mr-2">Filter by Store:</span>
      {stores.map((store) => (
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
        >
          <span>{store.logo}</span>
          <span className="hidden sm:inline">{store.name}</span>
          <span className="text-xs opacity-70">({store.availableProducts})</span>
        </button>
      ))}
      {selectedStores.length > 0 && (
        <button
          onClick={() => selectedStores.forEach(s => onStoreToggle(s))}
          className="text-xs text-primary hover:underline ml-2"
        >
          Clear all
        </button>
      )}
    </div>
  );
};

export default StoreFilter;

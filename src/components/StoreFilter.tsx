import { stores } from '@/data/products';
import { cn } from '@/lib/utils';

interface StoreFilterProps {
  selectedStores: string[];
  onStoreToggle: (store: string) => void;
}

const StoreFilter = ({ selectedStores, onStoreToggle }: StoreFilterProps) => {
  return (
    <div className="flex flex-wrap items-center gap-2 p-4 bg-card rounded-xl border border-border/50">
      <span className="text-sm font-medium text-muted-foreground mr-2">Filter by Store:</span>
      {stores.map((store) => (
        <button
          key={store.id}
          onClick={() => onStoreToggle(store.name)}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all",
            selectedStores.includes(store.name)
              ? `${store.color} text-white shadow-md`
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          )}
        >
          <span>{store.logo}</span>
          <span className="hidden sm:inline">{store.name}</span>
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

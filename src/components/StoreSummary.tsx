import { LiveProduct, StoreSummary as StoreSummaryType } from '@/hooks/useLivePrices';
import { ShoppingCart, TrendingDown, Package } from 'lucide-react';

interface CartItem {
  product: LiveProduct;
  quantity: number;
}

interface StoreSummaryProps {
  cart: CartItem[];
  stores: StoreSummaryType[];
}

const StoreSummary = ({ cart, stores }: StoreSummaryProps) => {
  if (cart.length === 0 || stores.length === 0) return null;

  // Calculate totals per store
  const storeAnalysis = stores.map(store => {
    let total = 0;
    let availableItems = 0;
    let unavailableItems: string[] = [];

    cart.forEach(({ product, quantity }) => {
      const storePrice = product.storePrices.find(sp => sp.storeId === store.id);
      if (storePrice) {
        if (storePrice.available) {
          total += storePrice.price * quantity;
          availableItems++;
        } else {
          unavailableItems.push(product.name);
        }
      }
    });

    return {
      ...store,
      total: Math.round(total),
      availableItems,
      unavailableItems,
      allAvailable: unavailableItems.length === 0,
    };
  }).sort((a, b) => {
    // Prioritize stores with all items, then by price
    if (a.allAvailable && !b.allAvailable) return -1;
    if (!a.allAvailable && b.allAvailable) return 1;
    return a.total - b.total;
  });

  const bestStore = storeAnalysis[0];
  const mrpTotal = Math.round(cart.reduce((sum, { product, quantity }) => {
    return sum + product.priceRange.max * quantity;
  }, 0));

  return (
    <div className="bg-card rounded-xl border border-border p-4">
      <h3 className="font-semibold text-foreground flex items-center gap-2 mb-4">
        <ShoppingCart className="h-5 w-5 text-primary" />
        Smart Store Comparison
      </h3>

      {/* Best Option Highlight */}
      {bestStore && (
        <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 mb-4">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">{bestStore.logo}</span>
            <div>
              <p className="font-semibold text-primary">{bestStore.name}</p>
              <p className="text-xs text-muted-foreground">Best choice for your cart</p>
            </div>
          </div>
          <div className="flex items-center justify-between mt-2">
            <span className="text-2xl font-bold text-primary">₹{bestStore.total}</span>
            <div className="flex items-center gap-1 text-primary text-sm">
              <TrendingDown className="h-4 w-4" />
              Save ₹{mrpTotal - bestStore.total}
            </div>
          </div>
          {!bestStore.allAvailable && (
            <p className="text-xs text-amber-600 mt-2">
              ⚠️ {bestStore.unavailableItems.length} item(s) unavailable
            </p>
          )}
        </div>
      )}

      {/* All Stores Comparison */}
      <div className="space-y-2">
        {storeAnalysis.slice(1, 4).map(store => (
          <div 
            key={store.id}
            className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
          >
            <div className="flex items-center gap-2">
              <span className="text-lg">{store.logo}</span>
              <div>
                <p className="text-sm font-medium">{store.name}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Package className="h-3 w-3" />
                  {store.availableItems}/{cart.length} items
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="font-semibold">₹{store.total}</p>
              <p className="text-xs text-muted-foreground">
                +₹{store.total - bestStore.total} more
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* MRP Comparison */}
      <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-sm">
        <span className="text-muted-foreground">MRP Total:</span>
        <span className="line-through text-muted-foreground">₹{mrpTotal}</span>
      </div>
    </div>
  );
};

export default StoreSummary;

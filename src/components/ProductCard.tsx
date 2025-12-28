import { Plus, Minus, TrendingDown, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LiveProduct } from '@/hooks/useLivePrices';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface ProductCardProps {
  product: LiveProduct;
  quantity: number;
  onAdd: () => void;
  onRemove: () => void;
  selectedStores: string[];
}

const ProductCard = ({ product, quantity, onAdd, onRemove, selectedStores }: ProductCardProps) => {
  const [showPrices, setShowPrices] = useState(false);
  
  const maxPrice = product.priceRange.max;
  const bestPrice = product.bestPrice || maxPrice;
  const savings = maxPrice - bestPrice;
  const savingsPercent = maxPrice > 0 ? Math.round((savings / maxPrice) * 100) : 0;
  
  // Filter prices by selected stores
  const filteredPrices = selectedStores.length > 0
    ? product.storePrices.filter(sp => selectedStores.includes(sp.storeId))
    : product.storePrices;
  
  const sortedPrices = [...filteredPrices].sort((a, b) => {
    if (a.available && !b.available) return -1;
    if (!a.available && b.available) return 1;
    return a.price - b.price;
  });

  const cheapestAvailable = sortedPrices.find(sp => sp.available);
  const displayPrice = cheapestAvailable?.price || bestPrice;
  const displayStore = cheapestAvailable?.storeName || product.bestStore || 'N/A';

  return (
    <div className="group bg-card rounded-xl border border-border/50 overflow-hidden hover:shadow-soft transition-all duration-300">
      {/* Image */}
      <div className="relative aspect-square bg-secondary/30 p-4 flex items-center justify-center">
        {savingsPercent >= 10 && (
          <span className="absolute top-2 left-2 px-2 py-0.5 bg-accent text-accent-foreground text-xs font-bold rounded flex items-center gap-1">
            <TrendingDown className="h-3 w-3" />
            {savingsPercent}% OFF
          </span>
        )}
        {quantity > 0 && (
          <div className="absolute top-2 right-2 bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">
            {quantity}
          </div>
        )}
        <span className="text-5xl">{product.image}</span>
      </div>

      {/* Details */}
      <div className="p-3 space-y-2">
        <div className="min-h-[40px]">
          <h3 className="font-medium text-sm leading-tight line-clamp-2">{product.name}</h3>
          <p className="text-xs text-muted-foreground">{product.unit}</p>
        </div>

        {/* Price Display */}
        <div className="flex items-baseline gap-2">
          <span className="font-bold text-lg text-primary">₹{displayPrice.toFixed(0)}</span>
          {savingsPercent > 0 && (
            <span className="text-xs text-muted-foreground line-through">₹{maxPrice.toFixed(0)}</span>
          )}
        </div>
        
        {/* Best Store Badge */}
        <div className="flex items-center gap-1">
          <span className="text-xs text-muted-foreground">Best at</span>
          <span className="text-xs font-medium text-primary">{displayStore}</span>
        </div>

        {/* Compare Prices Button */}
        <button
          onClick={() => setShowPrices(!showPrices)}
          className="w-full text-xs text-center text-primary hover:underline py-1"
        >
          {showPrices ? 'Hide prices' : `Compare ${sortedPrices.length} stores`}
        </button>

        {/* Store Prices Dropdown */}
        {showPrices && (
          <div className="space-y-1.5 max-h-40 overflow-y-auto">
            {sortedPrices.map((sp) => (
              <div 
                key={sp.storeId}
                className={cn(
                  "flex items-center justify-between text-xs p-2 rounded-lg",
                  sp.available ? "bg-muted" : "bg-muted/50 opacity-60"
                )}
              >
                <div className="flex items-center gap-2">
                  <span>{sp.storeLogo}</span>
                  <div>
                    <span className="font-medium truncate block">{sp.storeName}</span>
                    {sp.discount > 0 && (
                      <span className="text-green-600 text-[10px]">{sp.discount.toFixed(0)}% off</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <span className={cn(
                      "font-bold block",
                      sp === cheapestAvailable && "text-primary"
                    )}>
                      ₹{sp.price.toFixed(0)}
                    </span>
                    {sp.originalPrice > sp.price && (
                      <span className="text-[10px] text-muted-foreground line-through">
                        ₹{sp.originalPrice.toFixed(0)}
                      </span>
                    )}
                  </div>
                  {sp.available ? (
                    <Check className="h-3 w-3 text-green-500 flex-shrink-0" />
                  ) : (
                    <X className="h-3 w-3 text-destructive flex-shrink-0" />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add/Remove Controls */}
        <div className="pt-1">
          {quantity === 0 ? (
            <Button
              size="sm"
              variant="outline"
              className="w-full h-8 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
              onClick={onAdd}
            >
              <Plus className="w-4 h-4 mr-1" />
              Add
            </Button>
          ) : (
            <div className="flex items-center justify-between bg-primary rounded-lg">
              <button
                onClick={onRemove}
                className="p-1.5 text-primary-foreground hover:bg-primary-foreground/10 rounded-l-lg transition-colors"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="px-2 text-sm font-bold text-primary-foreground min-w-[24px] text-center">
                {quantity}
              </span>
              <button
                onClick={onAdd}
                className="p-1.5 text-primary-foreground hover:bg-primary-foreground/10 rounded-r-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;

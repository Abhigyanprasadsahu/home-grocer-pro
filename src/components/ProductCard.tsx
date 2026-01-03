import { Plus, Minus, TrendingDown, Check, X, Store, Star, Clock, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LiveProduct } from '@/hooks/useLivePrices';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useWishlist } from '@/hooks/useWishlist';

interface ProductCardProps {
  product: LiveProduct;
  quantity: number;
  onAdd: () => void;
  onRemove: () => void;
  selectedStores: string[];
}

const ProductCard = ({ product, quantity, onAdd, onRemove, selectedStores }: ProductCardProps) => {
  const [showPrices, setShowPrices] = useState(false);
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  
  const inWishlist = isInWishlist(product.id);
  
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
  const displayStoreRating = cheapestAvailable?.rating || 4.0;

  const handleWishlistToggle = () => {
    if (inWishlist) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product.id, displayPrice);
    }
  };

  return (
    <div className="group bg-card rounded-xl border border-border/50 overflow-hidden hover:shadow-lg hover:border-primary/30 transition-all duration-300 hover:-translate-y-0.5">
      {/* Image */}
      <div className="relative aspect-square bg-gradient-to-br from-secondary/50 to-secondary/20 p-4 flex items-center justify-center">
        {savingsPercent >= 10 && (
          <span className="absolute top-2 left-2 px-2.5 py-1 bg-gradient-to-r from-accent to-accent/80 text-accent-foreground text-xs font-bold rounded-full flex items-center gap-1 shadow-sm">
            <TrendingDown className="h-3 w-3" />
            {savingsPercent}% OFF
          </span>
        )}
        
        {/* Wishlist Button */}
        <button
          onClick={handleWishlistToggle}
          className={cn(
            "absolute top-2 right-2 p-2 rounded-full transition-all duration-200 shadow-sm",
            inWishlist 
              ? "bg-red-500 text-white hover:bg-red-600" 
              : "bg-white/90 text-muted-foreground hover:bg-white hover:text-red-500"
          )}
        >
          <Heart className={cn("w-4 h-4", inWishlist && "fill-current")} />
        </button>
        
        {quantity > 0 && (
          <div className="absolute bottom-2 right-2 bg-primary text-primary-foreground w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shadow-md ring-2 ring-background">
            {quantity}
          </div>
        )}
        <span className="text-6xl drop-shadow-sm group-hover:scale-110 transition-transform duration-300">{product.image}</span>
      </div>

      {/* Details */}
      <div className="p-3 space-y-2.5">
        <div className="min-h-[44px]">
          <h3 className="font-semibold text-sm leading-tight line-clamp-2 text-foreground">{product.name}</h3>
          <p className="text-xs text-muted-foreground mt-0.5">per {product.unit}</p>
        </div>

        {/* Price Display */}
        <div className="flex items-end gap-2">
          <span className="font-bold text-xl text-foreground">₹{displayPrice.toFixed(0)}</span>
          {savingsPercent > 0 && (
            <span className="text-xs text-muted-foreground line-through pb-0.5">₹{maxPrice.toFixed(0)}</span>
          )}
          {savingsPercent >= 5 && (
            <span className="text-xs font-medium text-green-600 pb-0.5">Save ₹{savings.toFixed(0)}</span>
          )}
        </div>
        
        {/* Best Store Badge */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 bg-muted/50 px-2 py-1 rounded-full">
            <Store className="h-3 w-3 text-primary" />
            <span className="text-xs font-medium text-foreground">{displayStore}</span>
          </div>
          <div className="flex items-center gap-0.5 text-xs">
            <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
            <span className="text-muted-foreground">{displayStoreRating.toFixed(1)}</span>
          </div>
        </div>

        {/* Available Stores Info */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Live prices
          </span>
          <span>{product.availableStores} of {product.totalStores} stores</span>
        </div>

        {/* Compare Prices Button */}
        <button
          onClick={() => setShowPrices(!showPrices)}
          className="w-full text-xs font-medium text-center text-primary hover:text-primary/80 py-1.5 bg-primary/5 rounded-lg hover:bg-primary/10 transition-colors"
        >
          {showPrices ? 'Hide prices ▲' : `Compare ${sortedPrices.length} stores ▼`}
        </button>

        {/* Store Prices Dropdown */}
        {showPrices && (
          <div className="space-y-1.5 max-h-48 overflow-y-auto scrollbar-thin">
            {sortedPrices.map((sp, index) => (
              <div 
                key={sp.storeId}
                className={cn(
                  "flex items-center justify-between text-xs p-2.5 rounded-lg border transition-colors",
                  sp.available 
                    ? index === 0 ? "bg-green-50 border-green-200 dark:bg-green-950/30 dark:border-green-900" : "bg-muted/50 border-transparent"
                    : "bg-muted/30 opacity-50 border-transparent"
                )}
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">{sp.storeLogo}</span>
                  <div>
                    <span className="font-medium text-foreground block">{sp.storeName}</span>
                    <div className="flex items-center gap-2">
                      {sp.discount > 0 && (
                        <span className="text-green-600 text-[10px] font-medium">{sp.discount.toFixed(0)}% off</span>
                      )}
                      <span className="text-[10px] text-muted-foreground">
                        Min ₹{sp.minOrder}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <span className={cn(
                      "font-bold block text-sm",
                      index === 0 && sp.available ? "text-green-600" : "text-foreground"
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
                    <div className="w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center">
                      <Check className="h-3 w-3 text-green-600" />
                    </div>
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-red-100 dark:bg-red-900/50 flex items-center justify-center">
                      <X className="h-3 w-3 text-red-500" />
                    </div>
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
              className="w-full h-9 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-sm"
              onClick={onAdd}
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Add to Cart
            </Button>
          ) : (
            <div className="flex items-center justify-between bg-primary rounded-lg shadow-sm overflow-hidden">
              <button
                onClick={onRemove}
                className="p-2 text-primary-foreground hover:bg-white/20 transition-colors"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="px-4 text-sm font-bold text-primary-foreground">
                {quantity}
              </span>
              <button
                onClick={onAdd}
                className="p-2 text-primary-foreground hover:bg-white/20 transition-colors"
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

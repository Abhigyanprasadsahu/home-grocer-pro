import { Plus, Minus, TrendingDown, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LiveProduct } from '@/hooks/useLivePrices';
import { cn } from '@/lib/utils';
import { useWishlist } from '@/hooks/useWishlist';

interface ProductCardMinimalProps {
  product: LiveProduct;
  quantity: number;
  onAdd: () => void;
  onRemove: () => void;
}

const ProductCardMinimal = ({ product, quantity, onAdd, onRemove }: ProductCardMinimalProps) => {
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  
  const inWishlist = isInWishlist(product.id);
  
  const maxPrice = product.priceRange.max;
  const bestPrice = product.bestPrice || maxPrice;
  const savings = maxPrice - bestPrice;
  const savingsPercent = maxPrice > 0 ? Math.round((savings / maxPrice) * 100) : 0;

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (inWishlist) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product.id, bestPrice);
    }
  };

  // Generate realistic product image gradient based on category
  const getCategoryGradient = () => {
    const gradients: Record<string, string> = {
      vegetables: 'from-green-50 to-emerald-100',
      fruits: 'from-orange-50 to-amber-100',
      dairy: 'from-blue-50 to-sky-100',
      grains: 'from-amber-50 to-yellow-100',
      snacks: 'from-red-50 to-rose-100',
      beverages: 'from-cyan-50 to-teal-100',
      essentials: 'from-purple-50 to-violet-100',
    };
    return gradients[product.category] || 'from-gray-50 to-slate-100';
  };

  return (
    <div className="group bg-card rounded-2xl border border-border/40 overflow-hidden hover:shadow-xl hover:border-primary/20 transition-all duration-300 relative">
      {/* Discount Badge */}
      {savingsPercent >= 10 && (
        <div className="absolute top-3 left-3 z-10">
          <span className="px-2 py-1 bg-accent text-accent-foreground text-[10px] font-bold rounded-md shadow-sm flex items-center gap-1">
            <TrendingDown className="h-2.5 w-2.5" />
            {savingsPercent}% OFF
          </span>
        </div>
      )}
      
      {/* Wishlist Button */}
      <button
        onClick={handleWishlistToggle}
        className={cn(
          "absolute top-3 right-3 z-10 p-1.5 rounded-full transition-all duration-200 shadow-sm",
          inWishlist 
            ? "bg-red-500 text-white" 
            : "bg-white/80 text-muted-foreground hover:text-red-500 backdrop-blur-sm"
        )}
      >
        <Heart className={cn("w-3.5 h-3.5", inWishlist && "fill-current")} />
      </button>

      {/* Product Image Area */}
      <div className={cn(
        "relative aspect-square bg-gradient-to-br p-4 flex items-center justify-center overflow-hidden",
        getCategoryGradient()
      )}>
        {/* Realistic product representation */}
        <div className="relative w-full h-full flex items-center justify-center">
          <span className="text-6xl sm:text-7xl drop-shadow-md group-hover:scale-110 transition-transform duration-300 select-none">
            {product.image}
          </span>
          
          {/* Subtle shine effect */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>

        {/* Quantity Badge */}
        {quantity > 0 && (
          <div className="absolute bottom-2 right-2 bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shadow-lg ring-2 ring-background">
            {quantity}
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-3 space-y-2">
        {/* Delivery Time */}
        <div className="flex items-center gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          <span className="text-[10px] text-muted-foreground font-medium">10-15 mins</span>
        </div>

        {/* Name & Unit */}
        <div>
          <h3 className="font-semibold text-sm leading-tight line-clamp-2 text-foreground group-hover:text-primary transition-colors">
            {product.name}
          </h3>
          <p className="text-[11px] text-muted-foreground mt-0.5">{product.unit}</p>
        </div>

        {/* Price Row */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-baseline gap-1.5">
            <span className="font-bold text-lg text-foreground">₹{bestPrice.toFixed(0)}</span>
            {savingsPercent > 0 && (
              <span className="text-xs text-muted-foreground line-through">₹{maxPrice.toFixed(0)}</span>
            )}
          </div>
        </div>

        {/* Add Button */}
        <div className="pt-1">
          {quantity === 0 ? (
            <Button
              size="sm"
              variant="outline"
              className="w-full h-9 text-primary border-primary/30 hover:bg-primary hover:text-primary-foreground font-semibold transition-all"
              onClick={onAdd}
            >
              ADD
            </Button>
          ) : (
            <div className="flex items-center justify-between bg-primary rounded-lg overflow-hidden shadow-sm h-9">
              <button
                onClick={onRemove}
                className="px-3 h-full text-primary-foreground hover:bg-white/20 transition-colors flex items-center justify-center"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="text-sm font-bold text-primary-foreground min-w-[32px] text-center">
                {quantity}
              </span>
              <button
                onClick={onAdd}
                className="px-3 h-full text-primary-foreground hover:bg-white/20 transition-colors flex items-center justify-center"
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

export default ProductCardMinimal;

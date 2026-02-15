import { Plus, Minus, TrendingDown, Heart, Zap, Clock, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LiveProduct } from '@/hooks/useLivePrices';
import { cn } from '@/lib/utils';
import { useWishlist } from '@/hooks/useWishlist';
import { useState } from 'react';

interface ProductCardMinimalProps {
  product: LiveProduct;
  quantity: number;
  onAdd: () => void;
  onRemove: () => void;
}

const ProductCardMinimal = ({ product, quantity, onAdd, onRemove }: ProductCardMinimalProps) => {
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const [isHovered, setIsHovered] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  
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

  const handleAdd = () => {
    onAdd();
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 600);
  };

  // Generate realistic product image gradient based on category
  const getCategoryStyles = () => {
    const styles: Record<string, { gradient: string; glow: string; accent: string }> = {
      vegetables: { 
        gradient: 'from-emerald-50 via-green-50 to-teal-50', 
        glow: 'shadow-emerald-200/50',
        accent: 'bg-emerald-500'
      },
      fruits: { 
        gradient: 'from-orange-50 via-amber-50 to-yellow-50', 
        glow: 'shadow-orange-200/50',
        accent: 'bg-orange-500'
      },
      dairy: { 
        gradient: 'from-sky-50 via-blue-50 to-indigo-50', 
        glow: 'shadow-sky-200/50',
        accent: 'bg-sky-500'
      },
      grains: { 
        gradient: 'from-amber-50 via-yellow-50 to-orange-50', 
        glow: 'shadow-amber-200/50',
        accent: 'bg-amber-500'
      },
      snacks: { 
        gradient: 'from-rose-50 via-pink-50 to-red-50', 
        glow: 'shadow-rose-200/50',
        accent: 'bg-rose-500'
      },
      beverages: { 
        gradient: 'from-cyan-50 via-teal-50 to-emerald-50', 
        glow: 'shadow-cyan-200/50',
        accent: 'bg-cyan-500'
      },
      essentials: { 
        gradient: 'from-violet-50 via-purple-50 to-fuchsia-50', 
        glow: 'shadow-violet-200/50',
        accent: 'bg-violet-500'
      },
    };
    return styles[product.category] || { gradient: 'from-gray-50 to-slate-100', glow: 'shadow-gray-200/50', accent: 'bg-gray-500' };
  };

  const categoryStyles = getCategoryStyles();
  const isPopular = savingsPercent >= 15;
  const isBestSeller = product.availableStores >= 5;

  return (
    <div 
      className={cn(
        "group bg-card rounded-2xl border overflow-hidden transition-all duration-500 relative",
        "hover:shadow-2xl hover:-translate-y-1",
        isHovered ? "border-primary/40 shadow-xl" : "border-border/40",
        justAdded && "ring-2 ring-primary ring-offset-2 ring-offset-background"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Top Badges Row */}
      <div className="absolute top-2.5 left-2.5 right-2.5 z-10 flex items-start justify-between">
        <div className="flex flex-col gap-1.5">
          {/* Discount Badge */}
          {savingsPercent >= 10 && (
            <span className="px-2 py-1 bg-gradient-to-r from-accent to-accent/80 text-accent-foreground text-[10px] font-bold rounded-lg shadow-md flex items-center gap-1 backdrop-blur-sm">
              <TrendingDown className="h-2.5 w-2.5" />
              {savingsPercent}% OFF
            </span>
          )}
          
          {/* Best Seller Badge */}
          {isBestSeller && !savingsPercent && (
            <span className="px-2 py-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[9px] font-bold rounded-lg shadow-md flex items-center gap-1">
              <Star className="h-2.5 w-2.5 fill-current" />
              BESTSELLER
            </span>
          )}
          
          {/* Express Badge */}
          {isPopular && (
            <span className="px-2 py-1 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground text-[9px] font-bold rounded-lg shadow-md flex items-center gap-1">
              <Zap className="h-2.5 w-2.5" />
              EXPRESS
            </span>
          )}
        </div>
        
        {/* Wishlist Button */}
        <button
          onClick={handleWishlistToggle}
          className={cn(
            "p-2 rounded-full transition-all duration-300 shadow-lg backdrop-blur-sm",
            "hover:scale-110 active:scale-95",
            inWishlist 
              ? "bg-red-500 text-white shadow-red-500/30" 
              : "bg-white/90 text-muted-foreground hover:text-red-500 hover:bg-white"
          )}
        >
          <Heart className={cn(
            "w-3.5 h-3.5 transition-transform duration-300",
            inWishlist && "fill-current scale-110"
          )} />
        </button>
      </div>

      {/* Product Image Area */}
      <div className={cn(
        "relative aspect-square bg-gradient-to-br p-4 flex items-center justify-center overflow-hidden",
        categoryStyles.gradient
      )}>
        {/* Decorative Elements */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 right-0 w-20 h-20 bg-white/40 rounded-full -translate-y-1/2 translate-x-1/2 blur-xl" />
          <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/30 rounded-full translate-y-1/2 -translate-x-1/2 blur-xl" />
        </div>
        
        {/* Product Emoji with Enhanced Effects */}
        <div className="relative w-full h-full flex items-center justify-center">
          <div className={cn(
            "absolute inset-0 flex items-center justify-center transition-all duration-500",
            isHovered && "scale-105"
          )}>
            {product.image && (product.image.startsWith('http') || product.image.startsWith('/')) ? (
              <img 
                src={product.image}
                alt={product.name}
                className={cn(
                  "w-full h-full object-cover transition-all duration-500",
                  isHovered && "transform scale-105"
                )}
                loading="lazy"
              />
            ) : (
              <span className={cn(
                "text-6xl sm:text-7xl select-none transition-all duration-500 drop-shadow-lg",
                isHovered && "transform -translate-y-1"
              )}>
                {product.image}
              </span>
            )}
          </div>
          
          {/* Shine sweep effect */}
          <div className={cn(
            "absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -skew-x-12",
            "transition-transform duration-700 ease-out",
            isHovered ? "translate-x-full" : "-translate-x-full"
          )} />
        </div>

        {/* Quantity Badge with Animation */}
        {quantity > 0 && (
          <div className={cn(
            "absolute bottom-2 right-2 bg-primary text-primary-foreground w-7 h-7 rounded-full",
            "flex items-center justify-center text-xs font-bold shadow-lg",
            "ring-2 ring-background transition-all duration-300",
            justAdded && "animate-scale-in"
          )}>
            {quantity}
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-3 space-y-2.5 relative">
        {/* Subtle top border glow */}
        <div className={cn(
          "absolute top-0 left-4 right-4 h-px transition-opacity duration-300",
          "bg-gradient-to-r from-transparent via-primary/30 to-transparent",
          isHovered ? "opacity-100" : "opacity-0"
        )} />
        
        {/* Delivery Time with Animation */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 bg-muted/50 px-2 py-1 rounded-full">
            <div className="relative">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
              <div className="absolute inset-0 w-1.5 h-1.5 rounded-full bg-green-500 animate-ping opacity-75" />
            </div>
            <Clock className="w-3 h-3 text-muted-foreground" />
            <span className="text-[10px] text-muted-foreground font-medium">8-12 mins</span>
          </div>
          
          {/* Store count indicator */}
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <div className="flex -space-x-1">
              {[...Array(Math.min(3, product.availableStores))].map((_, i) => (
                <div 
                  key={i} 
                  className={cn(
                    "w-4 h-4 rounded-full border-2 border-background text-[8px] flex items-center justify-center",
                    i === 0 ? "bg-primary/20" : i === 1 ? "bg-accent/20" : "bg-muted"
                  )}
                >
                  🏪
                </div>
              ))}
            </div>
            <span>+{product.availableStores}</span>
          </div>
        </div>

        {/* Name & Unit */}
        <div>
          <h3 className={cn(
            "font-semibold text-sm leading-tight line-clamp-2 transition-colors duration-300",
            isHovered ? "text-primary" : "text-foreground"
          )}>
            {product.name}
          </h3>
          <p className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-1">
            <span className="w-1 h-1 rounded-full bg-muted-foreground/50" />
            {product.unit}
          </p>
        </div>

        {/* Price Row with Enhanced Styling */}
        <div className="flex items-end justify-between pt-1">
          <div className="flex items-baseline gap-2">
            <span className={cn(
              "font-bold text-xl transition-all duration-300",
              isHovered ? "text-primary scale-105" : "text-foreground"
            )}>
              ₹{bestPrice.toFixed(0)}
            </span>
            {savingsPercent > 0 && (
              <div className="flex flex-col">
                <span className="text-[10px] text-muted-foreground line-through leading-none">
                  ₹{maxPrice.toFixed(0)}
                </span>
                <span className="text-[9px] text-primary font-semibold leading-none mt-0.5">
                  Save ₹{savings.toFixed(0)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Add Button with Enhanced Interactions */}
        <div className="pt-1">
          {quantity === 0 ? (
            <Button
              size="sm"
              variant="outline"
              className={cn(
                "w-full h-10 font-bold text-sm transition-all duration-300 overflow-hidden relative",
                "border-2 border-primary/40 text-primary",
                "hover:bg-primary hover:text-primary-foreground hover:border-primary",
                "hover:shadow-lg hover:shadow-primary/20",
                "active:scale-[0.98]",
                "group/btn"
              )}
              onClick={handleAdd}
            >
              <span className="relative z-10 flex items-center gap-1.5">
                <Plus className="w-4 h-4 transition-transform group-hover/btn:rotate-90 duration-300" />
                ADD
              </span>
              <div className="absolute inset-0 bg-primary scale-x-0 group-hover/btn:scale-x-100 transition-transform duration-300 origin-left" />
            </Button>
          ) : (
            <div className={cn(
              "flex items-center justify-between rounded-xl overflow-hidden shadow-lg h-10",
              "bg-gradient-to-r from-primary via-primary to-primary/90"
            )}>
              <button
                onClick={onRemove}
                className="px-4 h-full text-primary-foreground hover:bg-white/20 transition-all flex items-center justify-center active:scale-90"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="text-sm font-bold text-primary-foreground min-w-[40px] text-center">
                {quantity}
              </span>
              <button
                onClick={handleAdd}
                className="px-4 h-full text-primary-foreground hover:bg-white/20 transition-all flex items-center justify-center active:scale-90"
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

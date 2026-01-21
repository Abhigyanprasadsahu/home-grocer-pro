import { ShoppingCart, Search, Zap, MapPin, ChevronDown, Mic, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';

interface MinimalShopHeaderProps {
  cartCount: number;
  onCartClick: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onAddressClick: () => void;
}

const MinimalShopHeader = ({
  cartCount,
  onCartClick,
  searchQuery,
  onSearchChange,
  onAddressClick,
}: MinimalShopHeaderProps) => {
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [cartBounce, setCartBounce] = useState(false);
  const [prevCartCount, setPrevCartCount] = useState(cartCount);

  // Animate cart when count changes
  useEffect(() => {
    if (cartCount !== prevCartCount && cartCount > prevCartCount) {
      setCartBounce(true);
      setTimeout(() => setCartBounce(false), 500);
    }
    setPrevCartCount(cartCount);
  }, [cartCount, prevCartCount]);

  const placeholders = [
    "Search for atta, dal, oil...",
    "Try 'fresh vegetables'",
    "Search 'milk & dairy'",
    "Find 'snacks & beverages'"
  ];

  const [placeholderIndex, setPlaceholderIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % placeholders.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-2xl border-b border-border/30">
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background/90 pointer-events-none" />
      
      <div className="relative max-w-7xl mx-auto">
        {/* Top Row - Logo & Cart */}
        <div className="flex items-center justify-between px-4 py-3">
          {/* Logo & Location */}
          <div className="flex items-center gap-4">
            {/* Logo with hover effect */}
            <div className="flex items-center gap-2.5 group cursor-pointer">
              <div className="relative">
                <div className={cn(
                  "w-10 h-10 rounded-xl gradient-hero flex items-center justify-center",
                  "shadow-lg shadow-primary/20 transition-all duration-300",
                  "group-hover:shadow-xl group-hover:shadow-primary/30 group-hover:scale-105"
                )}>
                  <Zap className="w-5 h-5 text-primary-foreground" />
                </div>
                {/* Pulse ring */}
                <div className="absolute inset-0 rounded-xl bg-primary/20 animate-ping opacity-0 group-hover:opacity-30" />
              </div>
              <div className="hidden sm:block">
                <span className="font-display font-bold text-xl text-foreground tracking-tight">
                  Flash<span className="text-primary">Cart</span>
                </span>
              </div>
            </div>
            
            <div className="h-8 w-px bg-gradient-to-b from-transparent via-border to-transparent hidden sm:block" />
            
            {/* Delivery Location with animation */}
            <button 
              onClick={onAddressClick}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-300",
                "hover:bg-muted/80 hover:shadow-sm active:scale-95",
                "border border-transparent hover:border-border/50"
              )}
            >
              <div className="relative">
                <MapPin className="w-4 h-4 text-primary" />
                <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-green-500 rounded-full border border-background" />
              </div>
              <div className="text-left hidden md:block">
                <p className="text-[10px] text-muted-foreground leading-none font-medium">Deliver to</p>
                <p className="text-xs font-bold text-foreground flex items-center gap-1 mt-0.5">
                  Mumbai, 400001
                  <ChevronDown className="w-3 h-3 text-muted-foreground" />
                </p>
              </div>
            </button>
          </div>

          {/* Cart Button with bounce animation */}
          <Button
            variant="outline"
            size="sm"
            onClick={onCartClick}
            className={cn(
              "relative gap-2 font-bold transition-all duration-300 h-10 px-4",
              "hover:shadow-lg active:scale-95",
              cartCount > 0 
                ? "bg-gradient-to-r from-primary to-primary/90 text-primary-foreground hover:from-primary/90 hover:to-primary border-primary shadow-lg shadow-primary/20" 
                : "hover:border-primary/50",
              cartBounce && "animate-scale-in"
            )}
          >
            <div className="relative">
              <ShoppingCart className={cn(
                "w-4 h-4 transition-transform duration-300",
                cartBounce && "scale-125"
              )} />
              {cartCount > 0 && (
                <div className="absolute -top-1.5 -right-1.5 w-2 h-2 bg-accent rounded-full animate-pulse" />
              )}
            </div>
            <span className="hidden sm:inline">Cart</span>
            {cartCount > 0 && (
              <span className={cn(
                "min-w-[22px] h-[22px] rounded-full flex items-center justify-center text-xs font-bold",
                "bg-primary-foreground text-primary transition-all duration-300",
                cartBounce && "scale-125"
              )}>
                {cartCount}
              </span>
            )}
          </Button>
        </div>

        {/* Search Bar with enhanced styling */}
        <div className="px-4 pb-4">
          <div className={cn(
            "relative transition-all duration-300 rounded-2xl",
            isSearchFocused && "ring-2 ring-primary/30 ring-offset-2 ring-offset-background shadow-lg shadow-primary/10"
          )}>
            {/* Search icon with animation */}
            <div className={cn(
              "absolute left-4 top-1/2 -translate-y-1/2 transition-all duration-300",
              isSearchFocused ? "text-primary scale-110" : "text-muted-foreground"
            )}>
              <Search className="w-4 h-4" />
            </div>
            
            <Input
              type="text"
              placeholder={placeholders[placeholderIndex]}
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              className={cn(
                "w-full pl-11 pr-20 h-12 bg-muted/40 border-border/50 rounded-2xl text-sm",
                "placeholder:text-muted-foreground/70 transition-all duration-300",
                "focus-visible:ring-0 focus-visible:border-primary/50 focus-visible:bg-muted/60",
                "hover:bg-muted/50 hover:border-border"
              )}
            />
            
            {/* Right side icons */}
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="p-1.5 rounded-full hover:bg-muted transition-colors"
                >
                  <X className="w-3.5 h-3.5 text-muted-foreground" />
                </button>
              )}
              <div className="h-5 w-px bg-border" />
              <button className="p-1.5 rounded-full hover:bg-primary/10 transition-colors group">
                <Mic className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </button>
            </div>
          </div>
          
          {/* Quick search tags */}
          <div className="flex items-center gap-2 mt-3 overflow-x-auto scrollbar-hide">
            <span className="text-[10px] text-muted-foreground font-medium shrink-0">Popular:</span>
            {['Milk', 'Bread', 'Eggs', 'Rice', 'Oil'].map((tag) => (
              <button
                key={tag}
                onClick={() => onSearchChange(tag)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-[11px] font-medium shrink-0 transition-all duration-200",
                  "bg-muted/50 text-muted-foreground hover:bg-primary/10 hover:text-primary",
                  "border border-transparent hover:border-primary/20",
                  "active:scale-95"
                )}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
};

export default MinimalShopHeader;

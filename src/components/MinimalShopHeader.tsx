import { ShoppingCart, Search, Zap, MapPin, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

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
  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-xl border-b border-border/50">
      <div className="max-w-7xl mx-auto">
        {/* Top Row - Logo & Cart */}
        <div className="flex items-center justify-between px-4 py-3">
          {/* Logo & Location */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl gradient-hero flex items-center justify-center shadow-sm">
                <Zap className="w-5 h-5 text-primary-foreground" />
              </div>
              <div className="hidden sm:block">
                <span className="font-display font-bold text-lg text-foreground">Flash Cart</span>
              </div>
            </div>
            
            <div className="h-6 w-px bg-border hidden sm:block" />
            
            {/* Delivery Location */}
            <button 
              onClick={onAddressClick}
              className="flex items-center gap-1.5 hover:bg-muted px-2 py-1.5 rounded-lg transition-colors"
            >
              <MapPin className="w-4 h-4 text-primary" />
              <div className="text-left hidden md:block">
                <p className="text-[10px] text-muted-foreground leading-none">Deliver to</p>
                <p className="text-xs font-semibold text-foreground flex items-center gap-0.5">
                  Mumbai, 400001
                  <ChevronDown className="w-3 h-3" />
                </p>
              </div>
            </button>
          </div>

          {/* Cart Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={onCartClick}
            className={cn(
              "relative gap-2 font-semibold transition-all",
              cartCount > 0 && "bg-primary text-primary-foreground hover:bg-primary/90 border-primary"
            )}
          >
            <ShoppingCart className="w-4 h-4" />
            <span className="hidden sm:inline">Cart</span>
            {cartCount > 0 && (
              <span className={cn(
                "min-w-[20px] h-5 rounded-full flex items-center justify-center text-xs font-bold",
                "bg-primary-foreground text-primary"
              )}>
                {cartCount}
              </span>
            )}
          </Button>
        </div>

        {/* Search Bar */}
        <div className="px-4 pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search for atta, dal, oil, fruits..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 h-11 bg-muted/50 border-0 rounded-xl text-sm placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-primary"
            />
          </div>
        </div>
      </div>
    </header>
  );
};

export default MinimalShopHeader;

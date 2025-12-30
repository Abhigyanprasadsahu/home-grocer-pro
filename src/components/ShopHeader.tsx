import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Zap, Search, ShoppingCart, MapPin, User, 
  ChevronDown, Clock, Sparkles, Truck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';

interface ShopHeaderProps {
  cartCount: number;
  onCartClick: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const ShopHeader = ({ cartCount, onCartClick, searchQuery, onSearchChange }: ShopHeaderProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [location] = useState('Bangalore, 560001');

  return (
    <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-md border-b border-border shadow-soft">
      <div className="max-w-7xl mx-auto">
        {/* Top promotional banner */}
        <div className="bg-primary/10 px-4 py-1.5 text-center">
          <p className="text-xs font-medium text-primary flex items-center justify-center gap-2">
            <Truck className="w-3 h-3" />
            Free delivery on orders above ₹500 • Same day delivery available
          </p>
        </div>

        {/* Main Header */}
        <div className="flex items-center justify-between px-4 py-3 gap-4">
          {/* Logo & Location */}
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-xl gradient-hero flex items-center justify-center shadow-glow group-hover:scale-105 transition-transform">
                <Zap className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="text-xl font-display font-bold text-gradient hidden sm:block">
                Flash Kart
              </span>
            </Link>

            <button className="hidden md:flex items-center gap-2 px-3 py-2 bg-secondary/50 rounded-lg hover:bg-secondary transition-colors border border-border/50">
              <MapPin className="w-4 h-4 text-primary" />
              <div className="text-left">
                <p className="text-xs text-muted-foreground">Deliver to</p>
                <p className="text-sm font-medium flex items-center gap-1">
                  {location}
                  <ChevronDown className="w-3 h-3" />
                </p>
              </div>
            </button>
          </div>

          {/* Search */}
          <div className="flex-1 max-w-xl">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search for groceries, fruits, vegetables..."
                className="pl-10 pr-4 h-11 bg-secondary/50 border-border/50 focus-visible:ring-primary rounded-xl"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {user ? (
              <Button 
                variant="ghost" 
                size="sm" 
                className="hidden sm:flex"
                onClick={() => navigate('/dashboard')}
              >
                <Sparkles className="w-4 h-4 mr-2 text-primary" />
                My Plans
              </Button>
            ) : (
              <Button 
                variant="ghost" 
                size="sm" 
                className="hidden sm:flex"
                onClick={() => navigate('/auth')}
              >
                <User className="w-4 h-4 mr-2" />
                Login
              </Button>
            )}

            <Button
              variant="outline"
              className="relative border-primary/30 hover:border-primary hover:bg-primary/5"
              onClick={onCartClick}
            >
              <ShoppingCart className="w-5 h-5 text-primary" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 w-5 h-5 bg-primary text-primary-foreground text-xs font-bold rounded-full flex items-center justify-center animate-bounce-subtle">
                  {cartCount}
                </span>
              )}
              <span className="ml-2 hidden sm:inline">Cart</span>
            </Button>
          </div>
        </div>

        {/* Quick Info Bar */}
        <div className="px-4 pb-2 flex items-center justify-between">
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-accent" />
              <span className="text-foreground font-medium">30-45 mins</span> delivery
            </span>
            <span className="hidden sm:flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-primary" />
              AI-powered recommendations
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Compare prices from</span>
            <span className="text-xs font-semibold text-primary">12+ stores</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default ShopHeader;
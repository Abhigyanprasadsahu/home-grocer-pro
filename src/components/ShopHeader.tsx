import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Leaf, Search, ShoppingCart, MapPin, User, 
  ChevronDown, Clock, Sparkles 
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
    <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto">
        {/* Top Bar */}
        <div className="flex items-center justify-between px-4 py-3 gap-4">
          {/* Logo & Location */}
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl gradient-hero flex items-center justify-center shadow-glow">
                <Leaf className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="text-xl font-display font-bold text-foreground hidden sm:block">
                GROCERA
              </span>
            </Link>

            <button className="hidden md:flex items-center gap-2 px-3 py-2 bg-secondary/50 rounded-lg hover:bg-secondary transition-colors">
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
                className="pl-10 pr-4 h-11 bg-secondary/50 border-0 focus-visible:ring-primary"
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
              className="relative"
              onClick={onCartClick}
            >
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 w-5 h-5 bg-accent text-accent-foreground text-xs font-bold rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
              <span className="ml-2 hidden sm:inline">Cart</span>
            </Button>
          </div>
        </div>

        {/* Delivery Banner */}
        <div className="px-4 pb-2">
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-primary" />
              Delivery in 30-45 mins
            </span>
            <span className="hidden sm:block">•</span>
            <span className="hidden sm:block">Free delivery on orders above ₹500</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default ShopHeader;

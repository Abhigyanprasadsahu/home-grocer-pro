import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Percent, TrendingDown, Sparkles, AlertCircle, ArrowRight, RefreshCw } from 'lucide-react';

interface Deal {
  productName: string;
  originalPrice: number;
  dealPrice: number;
  savings: number;
  savingsPercent: number;
  store: string;
  expiresIn: string;
  category: string;
  quality: 'hot' | 'good' | 'normal';
}

interface AIDealFinderProps {
  isOpen: boolean;
  onClose: () => void;
  onAddToCart?: (productName: string) => void;
}

const AIDealFinder = ({ isOpen, onClose, onAddToCart }: AIDealFinderProps) => {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [budget, setBudget] = useState('');
  const [error, setError] = useState('');

  const categories = ['all', 'vegetables', 'fruits', 'dairy', 'grains', 'snacks', 'beverages'];

  const findDeals = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      // Simulate AI processing delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Mock deals data - in production this would come from the AI edge function
      const mockDeals: Deal[] = [
        { productName: 'Fresh Tomatoes 1kg', originalPrice: 50, dealPrice: 35, savings: 15, savingsPercent: 30, store: 'Sharma Kirana', expiresIn: '2h left', category: 'vegetables', quality: 'hot' },
        { productName: 'Amul Butter 500g', originalPrice: 280, dealPrice: 245, savings: 35, savingsPercent: 12, store: 'Fresh Mart Kirana', expiresIn: '5h left', category: 'dairy', quality: 'good' },
        { productName: 'Basmati Rice 5kg', originalPrice: 650, dealPrice: 520, savings: 130, savingsPercent: 20, store: 'City Grocers', expiresIn: '1d left', category: 'grains', quality: 'hot' },
        { productName: 'Fresh Bananas 1kg', originalPrice: 60, dealPrice: 45, savings: 15, savingsPercent: 25, store: 'Patel Provision', expiresIn: '8h left', category: 'fruits', quality: 'good' },
        { productName: 'Maggi Noodles 12pk', originalPrice: 180, dealPrice: 155, savings: 25, savingsPercent: 14, store: 'City Grocers', expiresIn: '3d left', category: 'snacks', quality: 'normal' },
        { productName: 'Tata Tea Gold 1kg', originalPrice: 520, dealPrice: 440, savings: 80, savingsPercent: 15, store: 'Sharma Kirana', expiresIn: '2d left', category: 'beverages', quality: 'good' },
        { productName: 'Onions 2kg', originalPrice: 80, dealPrice: 55, savings: 25, savingsPercent: 31, store: 'Fresh Mart Kirana', expiresIn: '4h left', category: 'vegetables', quality: 'hot' },
        { productName: 'Aashirvaad Atta 10kg', originalPrice: 550, dealPrice: 465, savings: 85, savingsPercent: 15, store: 'Patel Provision', expiresIn: '1d left', category: 'grains', quality: 'good' },
      ];

      let filtered = selectedCategory === 'all' 
        ? mockDeals 
        : mockDeals.filter(d => d.category === selectedCategory);
      
      // Filter by budget if set
      if (budget && !isNaN(parseFloat(budget))) {
        const maxBudget = parseFloat(budget);
        filtered = filtered.filter(d => d.dealPrice <= maxBudget);
      }
      
      // Sort by savings percentage
      filtered.sort((a, b) => b.savingsPercent - a.savingsPercent);
      
      setDeals(filtered);
    } catch (err: unknown) {
      setError('Failed to find deals. Please try again.');
      console.error('Deal finder error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      findDeals();
    }
  }, [isOpen, selectedCategory]);

  const getQualityBadge = (quality: Deal['quality']) => {
    switch (quality) {
      case 'hot':
        return <span className="px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full animate-pulse">🔥 HOT</span>;
      case 'good':
        return <span className="px-2 py-0.5 bg-amber-500 text-white text-xs font-bold rounded-full">⭐ GOOD</span>;
      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-display">
            <div className="p-2 rounded-lg bg-green-500/10">
              <Percent className="w-5 h-5 text-green-600" />
            </div>
            AI Deal Finder
            <span className="ml-auto text-xs font-normal text-muted-foreground bg-primary/10 px-2 py-1 rounded-full">
              Powered by AI
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Category Filters */}
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 text-sm rounded-full transition-all ${
                  selectedCategory === cat
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary hover:bg-secondary/80'
                }`}
              >
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>

          {/* Budget Filter */}
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="Max price per item (optional)"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              className="max-w-[200px]"
            />
            <Button onClick={findDeals} disabled={isLoading}>
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              <span className="ml-1">Find Deals</span>
            </Button>
          </div>

          {/* Error */}
          {error && (
            <div className="p-3 bg-destructive/10 text-destructive rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          {/* Loading */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">AI is finding best deals for you...</p>
            </div>
          )}

          {/* Deals Grid */}
          {!isLoading && deals.length > 0 && (
            <div className="grid gap-3">
              {deals.map((deal, index) => (
                <div
                  key={index}
                  className="p-4 bg-card border border-border rounded-xl hover:border-primary/30 hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h4 className="font-semibold">{deal.productName}</h4>
                        {getQualityBadge(deal.quality)}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        from <span className="text-foreground font-medium">{deal.store}</span>
                      </p>
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="text-lg font-bold text-green-600">₹{deal.dealPrice}</span>
                        <span className="text-sm text-muted-foreground line-through">₹{deal.originalPrice}</span>
                        <span className="px-2 py-0.5 bg-green-500/10 text-green-600 text-xs font-semibold rounded-full">
                          Save ₹{deal.savings} ({deal.savingsPercent}%)
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-amber-600 font-medium mb-2">{deal.expiresIn}</p>
                      <Button 
                        size="sm" 
                        variant="hero"
                        onClick={() => onAddToCart?.(deal.productName)}
                      >
                        Add to Cart
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!isLoading && deals.length === 0 && !error && (
            <div className="text-center py-12">
              <TrendingDown className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No deals found matching your criteria</p>
              <Button variant="outline" onClick={() => { setSelectedCategory('all'); setBudget(''); }} className="mt-4">
                View All Deals
              </Button>
            </div>
          )}

          {/* Bulk Order Note */}
          <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg">
            <p className="text-xs text-primary">
              <strong>💡 Bulk Savings:</strong> Order above ₹2500 for FREE delivery and extra discounts on bulk items!
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AIDealFinder;

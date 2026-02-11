import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Percent, TrendingDown, AlertCircle, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Deal {
  productName: string;
  originalPrice: number;
  dealPrice: number;
  savings: number;
  savingsPercent: number;
  store: string;
  storeLogo: string;
  category: string;
  quality: 'hot' | 'good' | 'normal';
  productId: string;
  storeId: string;
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

  const categories = ['all', 'Vegetables', 'Fruits', 'Dairy', 'Grains', 'Snacks', 'Beverages', 'Meat', 'Spices'];

  const findDeals = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        toast.error('Please sign in to find deals.');
        setIsLoading(false);
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-deal-finder`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          category: selectedCategory,
          maxPrice: budget ? parseFloat(budget) : undefined,
        }),
      });

      if (response.status === 401) {
        toast.error('Please sign in to use this feature.');
        return;
      }

      if (!response.ok) throw new Error('Failed to find deals');

      const data = await response.json();
      setDeals(data.deals || []);
    } catch (err) {
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
              Live Deals
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
                {cat === 'all' ? 'All' : cat}
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
              <p className="text-muted-foreground">Finding best deals across all stores...</p>
            </div>
          )}

          {/* Deals Grid */}
          {!isLoading && deals.length > 0 && (
            <div className="grid gap-3">
              {deals.map((deal, index) => (
                <div
                  key={`${deal.productId}-${deal.storeId}-${index}`}
                  className="p-4 bg-card border border-border rounded-xl hover:border-primary/30 hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h4 className="font-semibold">{deal.productName}</h4>
                        {getQualityBadge(deal.quality)}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {deal.storeLogo} from <span className="text-foreground font-medium">{deal.store}</span>
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

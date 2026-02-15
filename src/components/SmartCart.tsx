import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Sparkles, TrendingDown, Store, ArrowRight, Loader2, RefreshCw, Heart, Bell, Zap, Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface WishlistDeal {
  id: string;
  productId: string;
  productName: string;
  productImage: string | null;
  category: string;
  unit: string;
  targetPrice: number | null;
  priceWhenAdded: number;
  currentBestPrice: number;
  bestStoreName: string;
  bestStoreId: string;
  allStorePrices: {
    storeName: string;
    price: number;
    discount: number;
  }[];
  savingsPercent: number;
  isDealActive: boolean;
}

interface SmartCartProps {
  isOpen: boolean;
  onClose: () => void;
  onAddToCart?: (product: any) => void;
}

const SmartCart = ({ isOpen, onClose, onAddToCart }: SmartCartProps) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [deals, setDeals] = useState<WishlistDeal[]>([]);
  const [filter, setFilter] = useState<'all' | 'deals' | 'lowest'>('deals');

  const fetchDeals = async () => {
    if (!user) return;
    setIsLoading(true);

    try {
      // Fetch wishlist items with product info
      const { data: wishlistItems, error: wError } = await supabase
        .from('wishlist')
        .select('id, product_id, target_price, price_when_added, notify_on_drop')
        .eq('user_id', user.id);

      if (wError) throw wError;
      if (!wishlistItems || wishlistItems.length === 0) {
        setDeals([]);
        setIsLoading(false);
        return;
      }

      const productIds = wishlistItems.map(w => w.product_id);

      // Fetch products and store prices in parallel
      const [productsRes, pricesRes, storesRes] = await Promise.all([
        supabase.from('products').select('*').in('id', productIds),
        supabase.from('store_prices').select('*').in('product_id', productIds).eq('is_available', true),
        supabase.from('stores').select('*'),
      ]);

      if (productsRes.error) throw productsRes.error;
      if (pricesRes.error) throw pricesRes.error;
      if (storesRes.error) throw storesRes.error;

      const products = productsRes.data || [];
      const prices = pricesRes.data || [];
      const stores = storesRes.data || [];

      const storeMap = new Map(stores.map(s => [s.id, s]));

      const dealItems: WishlistDeal[] = wishlistItems.map(wi => {
        const product = products.find(p => p.id === wi.product_id);
        const productPrices = prices
          .filter(p => p.product_id === wi.product_id)
          .sort((a, b) => a.current_price - b.current_price);

        const bestPrice = productPrices[0];
        const bestStore = bestPrice ? storeMap.get(bestPrice.store_id) : null;

        const currentBestPrice = bestPrice?.current_price || wi.price_when_added;
        const savingsPercent = wi.price_when_added > 0
          ? Math.round(((wi.price_when_added - currentBestPrice) / wi.price_when_added) * 100)
          : 0;

        const isDealActive = wi.target_price
          ? currentBestPrice <= wi.target_price
          : savingsPercent >= 5;

        return {
          id: wi.id,
          productId: wi.product_id,
          productName: product?.name || 'Unknown Product',
          productImage: product?.image_url || null,
          category: product?.category || '',
          unit: product?.unit || 'kg',
          targetPrice: wi.target_price,
          priceWhenAdded: wi.price_when_added,
          currentBestPrice,
          bestStoreName: bestStore?.name || 'Unknown Store',
          bestStoreId: bestPrice?.store_id || '',
          allStorePrices: productPrices.map(pp => {
            const store = storeMap.get(pp.store_id);
            return {
              storeName: store?.name || 'Unknown',
              price: pp.current_price,
              discount: pp.discount_percent || 0,
            };
          }),
          savingsPercent,
          isDealActive,
        };
      });

      // Sort: deals first, then by savings
      dealItems.sort((a, b) => {
        if (a.isDealActive && !b.isDealActive) return -1;
        if (!a.isDealActive && b.isDealActive) return 1;
        return b.savingsPercent - a.savingsPercent;
      });

      setDeals(dealItems);
    } catch (err) {
      console.error('SmartCart error:', err);
      toast.error('Failed to load deals');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && user) {
      fetchDeals();
    }
  }, [isOpen, user]);

  const filteredDeals = deals.filter(d => {
    if (filter === 'deals') return d.isDealActive;
    if (filter === 'lowest') return d.savingsPercent > 0;
    return true;
  });

  const totalSavings = filteredDeals.reduce((sum, d) => {
    return sum + Math.max(0, d.priceWhenAdded - d.currentBestPrice);
  }, 0);

  const activeDealsCount = deals.filter(d => d.isDealActive).length;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-display">
            <div className="p-2 rounded-lg bg-primary/10">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            Smart Cart
            {activeDealsCount > 0 && (
              <span className="ml-2 px-2.5 py-0.5 text-xs font-bold bg-green-500/10 text-green-600 rounded-full animate-pulse">
                {activeDealsCount} Deal{activeDealsCount > 1 ? 's' : ''} Active!
              </span>
            )}
          </DialogTitle>
        </DialogHeader>

        {!user ? (
          <div className="text-center py-12">
            <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="font-semibold text-foreground">Login to use Smart Cart</p>
            <p className="text-sm text-muted-foreground mt-1">Add items to your wishlist and we'll track the best prices for you</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* How it works */}
            <div className="p-3 bg-primary/5 border border-primary/10 rounded-xl">
              <p className="text-xs text-muted-foreground">
                <strong className="text-foreground">💡 How Smart Cart works:</strong> Items you save to your Wishlist are automatically tracked. When prices drop to their lowest or hit your target price, they appear here so you never miss a deal.
              </p>
            </div>

            {/* Filter tabs */}
            <div className="flex gap-2">
              {[
                { key: 'deals' as const, label: 'Active Deals', icon: Zap },
                { key: 'lowest' as const, label: 'Price Drops', icon: TrendingDown },
                { key: 'all' as const, label: 'All Tracked', icon: Heart },
              ].map(tab => (
                <Button
                  key={tab.key}
                  variant={filter === tab.key ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter(tab.key)}
                  className="flex-1"
                >
                  <tab.icon className="w-4 h-4 mr-1" />
                  {tab.label}
                </Button>
              ))}
            </div>

            {/* Savings summary */}
            {filteredDeals.length > 0 && (
              <div className="flex items-center justify-between p-3 bg-green-500/10 rounded-xl border border-green-500/20">
                <div className="flex items-center gap-2">
                  <TrendingDown className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-semibold text-green-700">
                    Potential Savings: ₹{Math.round(totalSavings)}
                  </span>
                </div>
                <Button variant="ghost" size="sm" onClick={fetchDeals}>
                  <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
                </Button>
              </div>
            )}

            {/* Loading */}
            {isLoading && (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground text-sm">Scanning prices across all stores...</p>
              </div>
            )}

            {/* Deals list */}
            {!isLoading && filteredDeals.length > 0 && (
              <div className="space-y-3">
                {filteredDeals.map((deal) => (
                  <div
                    key={deal.id}
                    className={cn(
                      "p-4 rounded-xl border-2 transition-all",
                      deal.isDealActive
                        ? "border-green-500/30 bg-green-500/5"
                        : "border-border"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      {/* Product image */}
                      <div className="w-14 h-14 rounded-xl bg-muted flex items-center justify-center overflow-hidden shrink-0">
                        {deal.productImage ? (
                          <img src={deal.productImage} alt={deal.productName} className="w-full h-full object-cover" />
                        ) : (
                          <ShoppingCart className="w-6 h-6 text-muted-foreground" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h4 className="font-semibold text-foreground text-sm truncate">{deal.productName}</h4>
                            <p className="text-xs text-muted-foreground">{deal.category} • {deal.unit}</p>
                          </div>
                          {deal.isDealActive && (
                            <span className="px-2 py-0.5 bg-green-500 text-white text-[10px] font-bold rounded-full whitespace-nowrap flex items-center gap-1">
                              <Zap className="w-3 h-3" /> DEAL
                            </span>
                          )}
                        </div>

                        {/* Prices */}
                        <div className="flex items-center gap-3 mt-2">
                          <span className="text-lg font-bold text-foreground">₹{deal.currentBestPrice}</span>
                          {deal.priceWhenAdded > deal.currentBestPrice && (
                            <span className="text-sm text-muted-foreground line-through">₹{deal.priceWhenAdded}</span>
                          )}
                          {deal.savingsPercent > 0 && (
                            <span className="text-xs font-semibold text-green-600 bg-green-500/10 px-1.5 py-0.5 rounded">
                              {deal.savingsPercent}% off
                            </span>
                          )}
                        </div>

                        {/* Best store */}
                        <div className="flex items-center gap-1.5 mt-1.5">
                          <Store className="w-3 h-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">Best at <strong className="text-foreground">{deal.bestStoreName}</strong></span>
                          {deal.targetPrice && (
                            <span className="text-xs text-muted-foreground ml-2">
                              • Target: ₹{deal.targetPrice}
                              {deal.currentBestPrice <= deal.targetPrice && (
                                <Check className="w-3 h-3 inline ml-0.5 text-green-500" />
                              )}
                            </span>
                          )}
                        </div>

                        {/* Store comparison (top 3) */}
                        {deal.allStorePrices.length > 1 && (
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {deal.allStorePrices.slice(0, 3).map((sp, i) => (
                              <span
                                key={i}
                                className={cn(
                                  "text-[10px] px-2 py-0.5 rounded-full border",
                                  i === 0
                                    ? "bg-green-500/10 border-green-500/20 text-green-700 font-semibold"
                                    : "bg-muted border-border text-muted-foreground"
                                )}
                              >
                                {sp.storeName}: ₹{sp.price}
                              </span>
                            ))}
                            {deal.allStorePrices.length > 3 && (
                              <span className="text-[10px] px-2 py-0.5 text-muted-foreground">
                                +{deal.allStorePrices.length - 3} more
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Empty states */}
            {!isLoading && filteredDeals.length === 0 && deals.length > 0 && (
              <div className="text-center py-10">
                <Bell className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <p className="font-semibold text-foreground">No active deals right now</p>
                <p className="text-sm text-muted-foreground mt-1">We'll notify you when prices drop on your tracked items</p>
                <Button variant="outline" size="sm" className="mt-3" onClick={() => setFilter('all')}>
                  View All Tracked Items
                </Button>
              </div>
            )}

            {!isLoading && deals.length === 0 && (
              <div className="text-center py-10">
                <Heart className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <p className="font-semibold text-foreground">No items in your wishlist yet</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Add items to your Wishlist from the shop, and Smart Cart will automatically track the best prices across all Kirana partners.
                </p>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default SmartCart;

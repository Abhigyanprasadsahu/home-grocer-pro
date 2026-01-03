import { useState, useEffect } from 'react';
import { Heart, Bell, BellOff, Trash2, TrendingDown, X, ArrowLeft, Sparkles } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useWishlist } from '@/hooks/useWishlist';
import { useLivePrices, LiveProduct } from '@/hooks/useLivePrices';
import { cn } from '@/lib/utils';

interface WishlistProps {
  isOpen: boolean;
  onClose: () => void;
  onAddToCart?: (product: LiveProduct) => void;
}

const Wishlist = ({ isOpen, onClose, onAddToCart }: WishlistProps) => {
  const { wishlistItems, isLoading, removeFromWishlist, updateTargetPrice } = useWishlist();
  const { products } = useLivePrices({});
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
  const [targetPriceInput, setTargetPriceInput] = useState('');

  // Get full product details for wishlist items
  const wishlistProducts = wishlistItems.map((item) => {
    const product = products.find((p) => p.id === item.productId);
    return {
      ...item,
      product,
    };
  }).filter((item) => item.product);

  // Check for price drops
  const priceDropItems = wishlistProducts.filter((item) => {
    if (!item.product) return false;
    const currentPrice = item.product.bestPrice || item.product.priceRange.min;
    return currentPrice < item.priceWhenAdded;
  });

  const handleUpdateTargetPrice = async (productId: string) => {
    const price = parseFloat(targetPriceInput);
    if (!isNaN(price) && price > 0) {
      await updateTargetPrice(productId, price);
      setEditingPriceId(null);
      setTargetPriceInput('');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-red-500 fill-red-500" />
            My Wishlist
            {wishlistItems.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {wishlistItems.length} items
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
          {/* Price Drop Alerts */}
          {priceDropItems.length > 0 && (
            <div className="bg-gradient-to-r from-green-500/10 to-green-500/5 border border-green-500/20 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <TrendingDown className="w-5 h-5 text-green-600" />
                <h3 className="font-semibold text-green-700 dark:text-green-400">Price Drops! 🎉</h3>
              </div>
              <div className="space-y-2">
                {priceDropItems.slice(0, 3).map((item) => {
                  const currentPrice = item.product!.bestPrice || item.product!.priceRange.min;
                  const savings = item.priceWhenAdded - currentPrice;
                  const savingsPercent = Math.round((savings / item.priceWhenAdded) * 100);
                  
                  return (
                    <div key={item.id} className="flex items-center justify-between bg-white/50 dark:bg-black/20 rounded-lg p-2">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{item.product!.image}</span>
                        <div>
                          <p className="text-sm font-medium">{item.product!.name}</p>
                          <p className="text-xs text-green-600">
                            Down {savingsPercent}% • Save ₹{savings.toFixed(0)}
                          </p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => onAddToCart?.(item.product!)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Buy Now
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="text-center py-8">
              <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-3" />
              <p className="text-muted-foreground">Loading wishlist...</p>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && wishlistItems.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                <Heart className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Your wishlist is empty</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Save products you like and we'll notify you when prices drop!
              </p>
              <Button variant="outline" onClick={onClose}>
                Start Shopping
              </Button>
            </div>
          )}

          {/* Wishlist Items */}
          {!isLoading && wishlistProducts.length > 0 && (
            <div className="space-y-3">
              {wishlistProducts.map((item) => {
                if (!item.product) return null;
                
                const currentPrice = item.product.bestPrice || item.product.priceRange.min;
                const priceDiff = currentPrice - item.priceWhenAdded;
                const isPriceDown = priceDiff < 0;
                const isPriceUp = priceDiff > 0;
                const atTargetPrice = item.targetPrice && currentPrice <= item.targetPrice;

                return (
                  <div
                    key={item.id}
                    className={cn(
                      "border rounded-xl p-4 transition-all",
                      atTargetPrice
                        ? "border-green-500 bg-green-50/50 dark:bg-green-950/20"
                        : "border-border"
                    )}
                  >
                    <div className="flex gap-3">
                      {/* Product Image */}
                      <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-3xl">{item.product.image}</span>
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h4 className="font-medium text-sm line-clamp-1">{item.product.name}</h4>
                            <p className="text-xs text-muted-foreground">
                              {item.product.bestStore || 'Multiple stores'}
                            </p>
                          </div>
                          <button
                            onClick={() => removeFromWishlist(item.productId)}
                            className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Price Info */}
                        <div className="flex items-center gap-2 mt-2">
                          <span className="font-bold text-lg">₹{currentPrice.toFixed(0)}</span>
                          {isPriceDown && (
                            <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                              <TrendingDown className="w-3 h-3 mr-1" />
                              ₹{Math.abs(priceDiff).toFixed(0)} down
                            </Badge>
                          )}
                          {isPriceUp && (
                            <Badge variant="secondary" className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                              ₹{priceDiff.toFixed(0)} up
                            </Badge>
                          )}
                          {atTargetPrice && (
                            <Badge className="bg-green-600">
                              <Sparkles className="w-3 h-3 mr-1" />
                              Target reached!
                            </Badge>
                          )}
                        </div>

                        {/* Target Price */}
                        <div className="mt-3 flex items-center gap-2">
                          {editingPriceId === item.productId ? (
                            <div className="flex items-center gap-2 flex-1">
                              <Input
                                type="number"
                                placeholder="Target price"
                                value={targetPriceInput}
                                onChange={(e) => setTargetPriceInput(e.target.value)}
                                className="h-8 text-sm w-24"
                              />
                              <Button
                                size="sm"
                                onClick={() => handleUpdateTargetPrice(item.productId)}
                                className="h-8"
                              >
                                Set
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  setEditingPriceId(null);
                                  setTargetPriceInput('');
                                }}
                                className="h-8"
                              >
                                Cancel
                              </Button>
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                setEditingPriceId(item.productId);
                                setTargetPriceInput(item.targetPrice?.toString() || '');
                              }}
                              className="text-xs text-primary hover:underline flex items-center gap-1"
                            >
                              <Bell className="w-3 h-3" />
                              {item.targetPrice
                                ? `Alert at ₹${item.targetPrice}`
                                : 'Set price alert'}
                            </button>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="mt-3 flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => onAddToCart?.(item.product!)}
                            className="flex-1 h-8"
                          >
                            Add to Cart
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default Wishlist;

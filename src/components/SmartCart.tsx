import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Sparkles, TrendingDown, Store, ArrowRight, Loader2, RefreshCw, MapPin, Clock, Truck } from 'lucide-react';
import { LiveProduct } from '@/hooks/useLivePrices';

interface CartItem {
  product: LiveProduct;
  quantity: number;
}

interface StoreOption {
  storeId: string;
  storeName: string;
  storeType: 'kirana' | 'supermarket';
  totalPrice: number;
  savings: number;
  itemsAvailable: number;
  totalItems: number;
  deliveryTime: string;
  deliveryFee: number;
  rating: number;
}

interface SmartCartProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
}

const SmartCart = ({ isOpen, onClose, cartItems }: SmartCartProps) => {
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [storeOptions, setStoreOptions] = useState<StoreOption[]>([]);
  const [selectedStore, setSelectedStore] = useState<string | null>(null);
  const [optimizationMode, setOptimizationMode] = useState<'price' | 'time' | 'availability'>('price');

  const optimizeCart = async () => {
    setIsOptimizing(true);
    
    // Simulate AI optimization
    await new Promise(resolve => setTimeout(resolve, 1500));

    const totalMRP = cartItems.reduce((sum, item) => 
      sum + ((item.product.priceRange?.max || item.product.bestPrice || 0) * item.quantity), 0
    );

    // Generate store options - Kirana stores for ordering
    const mockStoreOptions: StoreOption[] = [
      {
        storeId: 'kirana-1',
        storeName: 'Sharma General Store',
        storeType: 'kirana',
        totalPrice: totalMRP * 0.82,
        savings: totalMRP * 0.18,
        itemsAvailable: cartItems.length,
        totalItems: cartItems.length,
        deliveryTime: '45 mins',
        deliveryFee: 0,
        rating: 4.6,
      },
      {
        storeId: 'kirana-2',
        storeName: 'Fresh Mart Kirana',
        storeType: 'kirana',
        totalPrice: totalMRP * 0.85,
        savings: totalMRP * 0.15,
        itemsAvailable: cartItems.length,
        totalItems: cartItems.length,
        deliveryTime: '30 mins',
        deliveryFee: 20,
        rating: 4.8,
      },
      {
        storeId: 'kirana-3',
        storeName: 'City Grocers',
        storeType: 'kirana',
        totalPrice: totalMRP * 0.88,
        savings: totalMRP * 0.12,
        itemsAvailable: cartItems.length - 1,
        totalItems: cartItems.length,
        deliveryTime: '60 mins',
        deliveryFee: 0,
        rating: 4.4,
      },
      {
        storeId: 'kirana-4',
        storeName: 'Patel Provision Store',
        storeType: 'kirana',
        totalPrice: totalMRP * 0.80,
        savings: totalMRP * 0.20,
        itemsAvailable: cartItems.length,
        totalItems: cartItems.length,
        deliveryTime: '50 mins',
        deliveryFee: 0,
        rating: 4.5,
      },
    ];

    // Sort based on optimization mode
    let sorted = [...mockStoreOptions];
    switch (optimizationMode) {
      case 'price':
        sorted.sort((a, b) => (a.totalPrice + a.deliveryFee) - (b.totalPrice + b.deliveryFee));
        break;
      case 'time':
        sorted.sort((a, b) => parseInt(a.deliveryTime) - parseInt(b.deliveryTime));
        break;
      case 'availability':
        sorted.sort((a, b) => b.itemsAvailable - a.itemsAvailable);
        break;
    }

    setStoreOptions(sorted);
    setSelectedStore(sorted[0]?.storeId || null);
    setIsOptimizing(false);
  };

  useEffect(() => {
    if (isOpen && cartItems.length > 0) {
      optimizeCart();
    }
  }, [isOpen, cartItems, optimizationMode]);

  const selectedStoreData = storeOptions.find(s => s.storeId === selectedStore);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-display">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <ShoppingCart className="w-5 h-5 text-blue-600" />
            </div>
            Smart Cart Optimizer
            <span className="ml-auto text-xs font-normal text-muted-foreground bg-primary/10 px-2 py-1 rounded-full">
              AI Powered
            </span>
          </DialogTitle>
        </DialogHeader>

        {cartItems.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingCart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Your cart is empty</p>
            <p className="text-sm text-muted-foreground">Add items to see smart recommendations</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Optimization Mode */}
            <div className="flex gap-2">
              <Button
                variant={optimizationMode === 'price' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setOptimizationMode('price')}
                className="flex-1"
              >
                <TrendingDown className="w-4 h-4 mr-1" />
                Lowest Price
              </Button>
              <Button
                variant={optimizationMode === 'time' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setOptimizationMode('time')}
                className="flex-1"
              >
                <Clock className="w-4 h-4 mr-1" />
                Fastest
              </Button>
              <Button
                variant={optimizationMode === 'availability' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setOptimizationMode('availability')}
                className="flex-1"
              >
                <Store className="w-4 h-4 mr-1" />
                All Items
              </Button>
            </div>

            {/* Cart Summary */}
            <div className="p-4 bg-secondary/50 rounded-xl">
              <h4 className="font-semibold mb-2">Your Cart ({cartItems.length} items)</h4>
              <div className="space-y-1 text-sm max-h-[120px] overflow-y-auto">
                {cartItems.map((item, index) => (
                  <div key={index} className="flex justify-between">
                    <span className="text-muted-foreground">{item.product.name} × {item.quantity}</span>
                    <span>₹{((item.product.bestPrice || 0) * item.quantity).toFixed(0)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Loading */}
            {isOptimizing && (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">AI is finding the best store for you...</p>
              </div>
            )}

            {/* Store Options */}
            {!isOptimizing && storeOptions.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold">Recommended Stores</h4>
                  <Button variant="ghost" size="sm" onClick={optimizeCart}>
                    <RefreshCw className="w-4 h-4 mr-1" />
                    Refresh
                  </Button>
                </div>

                {storeOptions.map((store, index) => (
                  <div
                    key={store.storeId}
                    onClick={() => setSelectedStore(store.storeId)}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      selectedStore === store.storeId
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/30'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {index === 0 && (
                            <span className="px-2 py-0.5 bg-primary text-primary-foreground text-xs font-bold rounded-full">
                              BEST
                            </span>
                          )}
                          <h5 className="font-semibold">{store.storeName}</h5>
                          <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
                            Kirana Partner
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {store.deliveryTime}
                          </span>
                          <span className="flex items-center gap-1">
                            <Truck className="w-3 h-3" />
                            {store.deliveryFee === 0 ? 'Free' : `₹${store.deliveryFee}`}
                          </span>
                          <span>⭐ {store.rating}</span>
                          <span className={store.itemsAvailable === store.totalItems ? 'text-green-600' : 'text-amber-600'}>
                            {store.itemsAvailable}/{store.totalItems} items
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold">₹{(store.totalPrice + store.deliveryFee).toFixed(0)}</p>
                        <p className="text-xs text-green-600 font-medium">Save ₹{store.savings.toFixed(0)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Price Comparison Note */}
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
              <p className="text-xs text-amber-700">
                <strong>💡 Price Comparison:</strong> We compare prices from D-Mart, Big Bazaar, Reliance & supermarkets to find you the best deals, then route your order to trusted kirana partners for delivery.
              </p>
            </div>

            {/* Place Order Button */}
            {selectedStoreData && (
              <Button variant="hero" className="w-full h-12 text-base" onClick={onClose}>
                Order from {selectedStoreData.storeName}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default SmartCart;

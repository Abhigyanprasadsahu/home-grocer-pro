import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Sparkles, TrendingDown, Store, ArrowRight, Loader2, RefreshCw, Clock, Truck, Info } from 'lucide-react';
import { LiveProduct, StoreSummary } from '@/hooks/useLivePrices';

interface CartItem {
  product: LiveProduct;
  quantity: number;
}

interface StoreComparison {
  storeId: string;
  storeName: string;
  storeLogo: string;
  storeColor: string;
  storeType: 'retail' | 'kirana';
  totalPrice: number;
  savings: number;
  itemsAvailable: number;
  totalItems: number;
  deliveryTime: string;
  deliveryFee: number;
  rating: number;
  canOrder: boolean;
}

interface SmartCartProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  stores?: StoreSummary[];
}

// Retail stores (price comparison only)
const RETAIL_STORES = ['dmart', 'bigbasket', 'reliance', 'more'];

const SmartCart = ({ isOpen, onClose, cartItems, stores = [] }: SmartCartProps) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [storeComparisons, setStoreComparisons] = useState<StoreComparison[]>([]);
  const [selectedStore, setSelectedStore] = useState<string | null>(null);
  const [sortMode, setSortMode] = useState<'price' | 'time' | 'availability'>('price');

  const analyzeCart = async () => {
    setIsAnalyzing(true);
    
    // Simulate AI analysis
    await new Promise(resolve => setTimeout(resolve, 1200));

    const totalMRP = cartItems.reduce((sum, item) => 
      sum + ((item.product.priceRange?.max || item.product.bestPrice || 0) * item.quantity), 0
    );

    // Generate store comparisons from actual cart data and mock stores
    const comparisons: StoreComparison[] = [];

    // Add retail stores (price comparison only - can't order)
    const retailStoresData = [
      { id: 'dmart', name: 'D-Mart', logo: '🏪', color: '#1e88e5', discount: 0.15, deliveryTime: 'N/A', rating: 4.3 },
      { id: 'bigbazaar', name: 'Big Bazaar', logo: '🛒', color: '#e53935', discount: 0.12, deliveryTime: 'N/A', rating: 4.1 },
      { id: 'reliance', name: 'Reliance Fresh', logo: '🏬', color: '#43a047', discount: 0.10, deliveryTime: 'N/A', rating: 4.2 },
      { id: 'more', name: 'More Supermarket', logo: '🛍️', color: '#fb8c00', discount: 0.08, deliveryTime: 'N/A', rating: 4.0 },
    ];

    retailStoresData.forEach((store) => {
      const price = totalMRP * (1 - store.discount);
      comparisons.push({
        storeId: store.id,
        storeName: store.name,
        storeLogo: store.logo,
        storeColor: store.color,
        storeType: 'retail',
        totalPrice: Math.round(price),
        savings: Math.round(totalMRP - price),
        itemsAvailable: cartItems.length,
        totalItems: cartItems.length,
        deliveryTime: store.deliveryTime,
        deliveryFee: 0,
        rating: store.rating,
        canOrder: false, // Can't order from retail stores
      });
    });

    // Add Kirana stores (can order from these)
    const kiranaStoresData = [
      { id: 'kirana-1', name: 'Sharma General Store', logo: '🏠', color: '#7c4dff', discount: 0.18, deliveryTime: '45 min', deliveryFee: 0, rating: 4.6 },
      { id: 'kirana-2', name: 'Fresh Mart Kirana', logo: '🏡', color: '#00bcd4', discount: 0.16, deliveryTime: '30 min', deliveryFee: 20, rating: 4.8 },
      { id: 'kirana-3', name: 'City Grocers', logo: '🏘️', color: '#4caf50', discount: 0.14, deliveryTime: '60 min', deliveryFee: 0, rating: 4.4 },
      { id: 'kirana-4', name: 'Patel Provision Store', logo: '🪴', color: '#ff5722', discount: 0.20, deliveryTime: '50 min', deliveryFee: 0, rating: 4.5 },
    ];

    kiranaStoresData.forEach((store) => {
      const price = totalMRP * (1 - store.discount);
      const available = Math.random() > 0.2 ? cartItems.length : cartItems.length - 1;
      comparisons.push({
        storeId: store.id,
        storeName: store.name,
        storeLogo: store.logo,
        storeColor: store.color,
        storeType: 'kirana',
        totalPrice: Math.round(price),
        savings: Math.round(totalMRP - price),
        itemsAvailable: available,
        totalItems: cartItems.length,
        deliveryTime: store.deliveryTime,
        deliveryFee: store.deliveryFee,
        rating: store.rating,
        canOrder: true, // Can order from Kirana stores
      });
    });

    // Sort based on mode
    let sorted = [...comparisons];
    switch (sortMode) {
      case 'price':
        sorted.sort((a, b) => (a.totalPrice + a.deliveryFee) - (b.totalPrice + b.deliveryFee));
        break;
      case 'time':
        sorted = sorted.filter(s => s.canOrder).sort((a, b) => parseInt(a.deliveryTime) - parseInt(b.deliveryTime));
        break;
      case 'availability':
        sorted.sort((a, b) => b.itemsAvailable - a.itemsAvailable);
        break;
    }

    setStoreComparisons(sorted);
    // Auto-select best orderable store
    const bestOrderable = sorted.find(s => s.canOrder);
    setSelectedStore(bestOrderable?.storeId || null);
    setIsAnalyzing(false);
  };

  useEffect(() => {
    if (isOpen && cartItems.length > 0) {
      analyzeCart();
    }
  }, [isOpen, cartItems, sortMode]);

  const selectedStoreData = storeComparisons.find(s => s.storeId === selectedStore);
  const totalMRP = cartItems.reduce((sum, item) => 
    sum + ((item.product.priceRange?.max || item.product.bestPrice || 0) * item.quantity), 0
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-display">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <ShoppingCart className="w-5 h-5 text-blue-600" />
            </div>
            Smart Cart - Price Comparison
            <span className="ml-auto text-xs font-normal text-muted-foreground bg-primary/10 px-2 py-1 rounded-full">
              AI Powered
            </span>
          </DialogTitle>
        </DialogHeader>

        {cartItems.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingCart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Your cart is empty</p>
            <p className="text-sm text-muted-foreground">Add items to compare prices across stores</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Sort Mode */}
            <div className="flex gap-2">
              <Button
                variant={sortMode === 'price' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSortMode('price')}
                className="flex-1"
              >
                <TrendingDown className="w-4 h-4 mr-1" />
                Lowest Price
              </Button>
              <Button
                variant={sortMode === 'time' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSortMode('time')}
                className="flex-1"
              >
                <Clock className="w-4 h-4 mr-1" />
                Fastest Delivery
              </Button>
              <Button
                variant={sortMode === 'availability' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSortMode('availability')}
                className="flex-1"
              >
                <Store className="w-4 h-4 mr-1" />
                All Items
              </Button>
            </div>

            {/* Cart Summary */}
            <div className="p-4 bg-secondary/50 rounded-xl">
              <h4 className="font-semibold mb-2">Your Cart ({cartItems.length} items)</h4>
              <div className="space-y-1 text-sm max-h-[100px] overflow-y-auto">
                {cartItems.map((item, index) => (
                  <div key={index} className="flex justify-between">
                    <span className="text-muted-foreground">{item.product.name} × {item.quantity}</span>
                    <span>₹{((item.product.bestPrice || 0) * item.quantity).toFixed(0)}</span>
                  </div>
                ))}
              </div>
              <div className="mt-2 pt-2 border-t border-border flex justify-between font-semibold">
                <span>MRP Total:</span>
                <span className="line-through text-muted-foreground">₹{Math.round(totalMRP)}</span>
              </div>
            </div>

            {/* Loading */}
            {isAnalyzing && (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">AI is comparing prices across all stores...</p>
              </div>
            )}

            {/* Store Comparisons */}
            {!isAnalyzing && storeComparisons.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold">Store Price Comparison</h4>
                  <Button variant="ghost" size="sm" onClick={analyzeCart}>
                    <RefreshCw className="w-4 h-4 mr-1" />
                    Refresh
                  </Button>
                </div>

                {storeComparisons.map((store, index) => (
                  <div
                    key={store.storeId}
                    onClick={() => store.canOrder && setSelectedStore(store.storeId)}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      store.canOrder ? 'cursor-pointer' : 'cursor-default opacity-80'
                    } ${
                      selectedStore === store.storeId
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/30'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          {index === 0 && (
                            <span className="px-2 py-0.5 bg-primary text-primary-foreground text-xs font-bold rounded-full">
                              BEST PRICE
                            </span>
                          )}
                          <span className="text-lg">{store.storeLogo}</span>
                          <h5 className="font-semibold">{store.storeName}</h5>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            store.storeType === 'retail' 
                              ? 'bg-blue-500/10 text-blue-600'
                              : 'bg-green-500/10 text-green-600'
                          }`}>
                            {store.storeType === 'retail' ? 'Retail Store' : 'Kirana Partner'}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {store.deliveryTime}
                          </span>
                          {store.canOrder && (
                            <span className="flex items-center gap-1">
                              <Truck className="w-3 h-3" />
                              {store.deliveryFee === 0 ? 'Free' : `₹${store.deliveryFee}`}
                            </span>
                          )}
                          <span>⭐ {store.rating}</span>
                          <span className={store.itemsAvailable === store.totalItems ? 'text-green-600' : 'text-amber-600'}>
                            {store.itemsAvailable}/{store.totalItems} items
                          </span>
                        </div>
                        {!store.canOrder && (
                          <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
                            <Info className="w-3 h-3" />
                            Price comparison only - visit store or order from Kirana partners
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold">₹{store.totalPrice + store.deliveryFee}</p>
                        <p className="text-xs text-green-600 font-medium">Save ₹{store.savings}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Info Note */}
            <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <p className="text-xs text-blue-700">
                <strong>💡 How it works:</strong> We compare prices from D-Mart, Big Bazaar, Reliance & other retail stores. Order is fulfilled by our trusted Kirana partners who match or beat these prices.
              </p>
            </div>

            {/* Place Order Button */}
            {selectedStoreData && selectedStoreData.canOrder && (
              <Button variant="hero" className="w-full h-12 text-base" onClick={onClose}>
                Order from {selectedStoreData.storeName} - ₹{selectedStoreData.totalPrice + selectedStoreData.deliveryFee}
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

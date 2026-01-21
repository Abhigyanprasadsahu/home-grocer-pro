import { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { Zap, Clock, RefreshCw, Truck, Shield, Gift, Timer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import MinimalShopHeader from '@/components/MinimalShopHeader';
import MinimalCategoryNav from '@/components/MinimalCategoryNav';
import ProductCardMinimal from '@/components/ProductCardMinimal';
import CartSidebar from '@/components/CartSidebar';
import FloatingUtilityBar from '@/components/FloatingUtilityBar';
import AIChatbot from '@/components/AIChatbot';
import AIRecipeFinder from '@/components/AIRecipeFinder';
import AIRecipeVideo from '@/components/AIRecipeVideo';
import AIDealFinder from '@/components/AIDealFinder';
import AIPriceAlerts from '@/components/AIPriceAlerts';
import SmartCart from '@/components/SmartCart';
import DeliveryAddressManager from '@/components/DeliveryAddressManager';
import Wishlist from '@/components/Wishlist';
import { useLivePrices, LiveProduct } from '@/hooks/useLivePrices';
import { useAuth } from '@/hooks/useAuth';
import { Skeleton } from '@/components/ui/skeleton';

interface CartItem {
  product: LiveProduct;
  quantity: number;
}

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<Map<string, CartItem>>(new Map());
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedStores, setSelectedStores] = useState<string[]>([]);
  const [isRecipeFinderOpen, setIsRecipeFinderOpen] = useState(false);
  const [isDealFinderOpen, setIsDealFinderOpen] = useState(false);
  const [isPriceAlertsOpen, setIsPriceAlertsOpen] = useState(false);
  const [isSmartCartOpen, setIsSmartCartOpen] = useState(false);
  const [isAddressManagerOpen, setIsAddressManagerOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isRecipeVideoOpen, setIsRecipeVideoOpen] = useState(false);

  const { products, stores, isLoading, error, lastUpdated, refresh } = useLivePrices({
    category: activeCategory,
    autoRefresh: true,
    refreshInterval: 30,
  });

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });
  }, [products, searchQuery]);

  const addToCart = (product: LiveProduct) => {
    setCart((prev) => {
      const newCart = new Map(prev);
      const existing = newCart.get(product.id);
      if (existing) {
        newCart.set(product.id, { ...existing, quantity: existing.quantity + 1 });
      } else {
        newCart.set(product.id, { product, quantity: 1 });
      }
      return newCart;
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => {
      const newCart = new Map(prev);
      const existing = newCart.get(productId);
      if (existing && existing.quantity > 1) {
        newCart.set(productId, { ...existing, quantity: existing.quantity - 1 });
      } else {
        newCart.delete(productId);
      }
      return newCart;
    });
  };

  const updateCartQuantity = (productId: string, delta: number) => {
    if (delta > 0) {
      const product = products.find((p) => p.id === productId);
      if (product) addToCart(product);
    } else {
      removeFromCart(productId);
    }
  };

  const handleStoreToggle = (storeId: string) => {
    setSelectedStores((prev) =>
      prev.includes(storeId) ? prev.filter((s) => s !== storeId) : [...prev, storeId]
    );
  };

  const cartCount = Array.from(cart.values()).reduce((sum, item) => sum + item.quantity, 0);
  const cartItems = Array.from(cart.values());

  const formatLastUpdated = () => {
    if (!lastUpdated) return '';
    const date = new Date(lastUpdated);
    return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      <Helmet>
        <title>Flash Cart - Grocery Delivery in 10 Minutes</title>
        <meta name="description" content="Order groceries online. Get fresh vegetables, fruits, dairy and more delivered in 10 minutes. Best prices guaranteed." />
      </Helmet>

      <div className="min-h-screen bg-background">
        <MinimalShopHeader
          cartCount={cartCount}
          onCartClick={() => setIsCartOpen(true)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onAddressClick={() => setIsAddressManagerOpen(true)}
        />

        <main className="max-w-7xl mx-auto px-4 py-4 space-y-5 pb-32">
          {/* Delivery Banner */}
          <div className="flex items-center gap-4 px-4 py-3 bg-gradient-to-r from-primary/5 to-accent/5 rounded-2xl border border-primary/10">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Timer className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-xs font-semibold text-foreground">Delivery in 10-15 mins</p>
                <p className="text-[10px] text-muted-foreground">Free delivery on orders above ₹199</p>
              </div>
            </div>
            <div className="h-8 w-px bg-border" />
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs text-muted-foreground">
                Live prices • Updated {formatLastUpdated() || 'just now'}
              </span>
              <button
                onClick={refresh}
                disabled={isLoading}
                className="ml-2 p-1 hover:bg-muted rounded transition-colors"
              >
                <RefreshCw className={`w-3 h-3 text-muted-foreground ${isLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Category Navigation */}
          <MinimalCategoryNav 
            activeCategory={activeCategory} 
            onCategoryChange={setActiveCategory} 
          />

          {/* Loading State */}
          {isLoading && products.length === 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="bg-card rounded-2xl border border-border/50 overflow-hidden">
                  <Skeleton className="aspect-square" />
                  <div className="p-3 space-y-2">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                    <Skeleton className="h-9 w-full rounded-lg" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="text-center py-12 bg-destructive/10 rounded-2xl">
              <p className="text-destructive font-medium">{error}</p>
              <Button variant="outline" onClick={refresh} className="mt-4">
                Try Again
              </Button>
            </div>
          )}

          {/* Products Grid - Clean, Blinkit-style */}
          {!isLoading && (
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-foreground">
                  {activeCategory === 'All' ? 'Buy it again' : activeCategory}
                </h2>
                <span className="text-xs text-muted-foreground">{filteredProducts.length} items</span>
              </div>

              {filteredProducts.length === 0 ? (
                <div className="text-center py-16">
                  <p className="text-muted-foreground">No products found</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                  {filteredProducts.map((product) => (
                    <ProductCardMinimal
                      key={product.id}
                      product={product}
                      quantity={cart.get(product.id)?.quantity || 0}
                      onAdd={() => addToCart(product)}
                      onRemove={() => removeFromCart(product.id)}
                    />
                  ))}
                </div>
              )}
            </section>
          )}

          {/* Trust Footer */}
          <section className="grid grid-cols-3 gap-3 pt-6">
            <div className="flex flex-col items-center text-center p-3 bg-card rounded-xl border border-border/50">
              <Truck className="w-5 h-5 text-primary mb-1.5" />
              <p className="text-xs font-medium text-foreground">Free Delivery</p>
              <p className="text-[10px] text-muted-foreground">₹199+</p>
            </div>
            <div className="flex flex-col items-center text-center p-3 bg-card rounded-xl border border-border/50">
              <Shield className="w-5 h-5 text-green-600 mb-1.5" />
              <p className="text-xs font-medium text-foreground">100% Fresh</p>
              <p className="text-[10px] text-muted-foreground">Guaranteed</p>
            </div>
            <div className="flex flex-col items-center text-center p-3 bg-card rounded-xl border border-border/50">
              <Gift className="w-5 h-5 text-accent mb-1.5" />
              <p className="text-xs font-medium text-foreground">Best Prices</p>
              <p className="text-[10px] text-muted-foreground">Price match</p>
            </div>
          </section>
        </main>

        {/* Floating Utility Bar - Compare, Kirana, AI Tools */}
        <FloatingUtilityBar
          stores={stores}
          selectedStores={selectedStores}
          onStoreToggle={handleStoreToggle}
          onOpenRecipeFinder={() => setIsRecipeFinderOpen(true)}
          onOpenRecipeVideo={() => setIsRecipeVideoOpen(true)}
          onOpenDealFinder={() => setIsDealFinderOpen(true)}
          onOpenPriceAlerts={() => setIsPriceAlertsOpen(true)}
          onOpenSmartCart={() => setIsSmartCartOpen(true)}
          onOpenWishlist={() => setIsWishlistOpen(true)}
          onOpenAddressManager={() => setIsAddressManagerOpen(true)}
        />

        {/* Cart Sidebar */}
        <CartSidebar
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          items={cartItems}
          onUpdateQuantity={updateCartQuantity}
          onRemove={(productId) => {
            setCart((prev) => {
              const newCart = new Map(prev);
              newCart.delete(productId);
              return newCart;
            });
          }}
        />

        {/* AI Chatbot */}
        <AIChatbot 
          cart={cartItems.map(item => ({
            name: item.product.name,
            quantity: item.quantity,
            price: item.product.bestPrice || item.product.priceRange.min
          }))}
        />

        {/* Modals */}
        <AIRecipeFinder 
          isOpen={isRecipeFinderOpen} 
          onClose={() => setIsRecipeFinderOpen(false)}
          initialIngredients={cartItems.map(item => item.product.name)}
        />

        <AIDealFinder 
          isOpen={isDealFinderOpen} 
          onClose={() => setIsDealFinderOpen(false)}
          onAddToCart={(productName) => {
            const product = products.find(p => p.name.toLowerCase().includes(productName.toLowerCase()));
            if (product) addToCart(product);
          }}
        />

        <AIPriceAlerts 
          isOpen={isPriceAlertsOpen} 
          onClose={() => setIsPriceAlertsOpen(false)}
        />

        <SmartCart 
          isOpen={isSmartCartOpen} 
          onClose={() => setIsSmartCartOpen(false)}
          cartItems={cartItems}
          stores={stores}
        />

        <DeliveryAddressManager 
          isOpen={isAddressManagerOpen} 
          onClose={() => setIsAddressManagerOpen(false)}
        />

        <Wishlist 
          isOpen={isWishlistOpen} 
          onClose={() => setIsWishlistOpen(false)}
          onAddToCart={addToCart}
        />

        <AIRecipeVideo 
          isOpen={isRecipeVideoOpen} 
          onClose={() => setIsRecipeVideoOpen(false)}
          recipe={{
            name: "Butter Chicken",
            ingredients: ["Chicken 500g", "Butter 100g", "Tomato puree", "Cream", "Garam masala", "Kasuri methi"],
            steps: ["Marinate chicken", "Cook in butter", "Add tomato puree", "Simmer with spices", "Finish with cream"],
            cuisine: "North Indian",
            prepTime: 15,
            cookTime: 30,
          }}
        />
      </div>
    </>
  );
};

export default Index;

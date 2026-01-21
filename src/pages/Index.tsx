import { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { RefreshCw, Clock, Percent } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import ShopHeader from '@/components/ShopHeader';
import ProductCard from '@/components/ProductCard';
import CartSidebar from '@/components/CartSidebar';
import StoreFilter from '@/components/StoreFilter';
import StoreSummary from '@/components/StoreSummary';
import AIChatbot from '@/components/AIChatbot';
import AIRecipeFinder from '@/components/AIRecipeFinder';
import AIRecipeVideo from '@/components/AIRecipeVideo';
import AIDealFinder from '@/components/AIDealFinder';
import AIPriceAlerts from '@/components/AIPriceAlerts';
import SmartCart from '@/components/SmartCart';
import DeliveryAddressManager from '@/components/DeliveryAddressManager';
import Wishlist from '@/components/Wishlist';
import MinimalHero from '@/components/MinimalHero';
import StoreStrip from '@/components/StoreStrip';
import QuickCategories from '@/components/QuickCategories';
import QuickAccessDock from '@/components/QuickAccessDock';
import MinimalFooter from '@/components/MinimalFooter';
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

  const dealsProducts = useMemo(() => {
    return products
      .filter((p) => {
        if (!p.bestPrice || !p.priceRange.max) return false;
        const savings = ((p.priceRange.max - p.bestPrice) / p.priceRange.max) * 100;
        return savings >= 10;
      })
      .slice(0, 8);
  }, [products]);

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
        <title>Flash Cart - Compare Prices Across 12+ Stores | Order from Local Kiranas</title>
        <meta name="description" content="Compare grocery prices across D-Mart, BigBasket, Zepto and order from trusted local Kirana partners. Save up to 40% with AI-powered shopping." />
      </Helmet>

      <div className="min-h-screen bg-background pb-24">
        <ShopHeader
          cartCount={cartCount}
          onCartClick={() => setIsCartOpen(true)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onAddressClick={() => setIsAddressManagerOpen(true)}
        />

        {/* Hero */}
        <MinimalHero />

        {/* Store Strip */}
        <StoreStrip />

        {/* Categories */}
        <QuickCategories 
          activeCategory={activeCategory} 
          onCategoryChange={setActiveCategory} 
        />

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 py-4 space-y-8">
          {/* Live Price Status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-sm font-medium text-foreground">Live Prices</span>
              </div>
              {lastUpdated && (
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatLastUpdated()}
                </span>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={refresh}
              disabled={isLoading}
              className="text-muted-foreground hover:text-primary h-8"
            >
              <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>

          {/* Store Filter */}
          <StoreFilter 
            stores={stores}
            selectedStores={selectedStores} 
            onStoreToggle={handleStoreToggle} 
          />

          {/* Cart Summary */}
          {cartItems.length > 0 && <StoreSummary cart={cartItems} stores={stores} />}

          {/* Loading */}
          {isLoading && products.length === 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="bg-card rounded-2xl border border-border/50 p-3">
                  <Skeleton className="aspect-square rounded-xl mb-2" />
                  <Skeleton className="h-3 w-3/4 mb-1.5" />
                  <Skeleton className="h-2.5 w-1/2 mb-2" />
                  <Skeleton className="h-5 w-1/3" />
                </div>
              ))}
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="text-center py-8 bg-destructive/10 rounded-2xl">
              <p className="text-destructive font-medium text-sm">{error}</p>
              <Button variant="outline" size="sm" onClick={refresh} className="mt-3">
                Try Again
              </Button>
            </div>
          )}

          {/* Deals Section */}
          {!isLoading && dealsProducts.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-green-500/10 flex items-center justify-center">
                  <Percent className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <h2 className="font-display font-bold text-lg text-foreground">Best Deals</h2>
                  <p className="text-xs text-muted-foreground">Prices lower than usual</p>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                {dealsProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    quantity={cart.get(product.id)?.quantity || 0}
                    onAdd={() => addToCart(product)}
                    onRemove={() => removeFromCart(product.id)}
                    selectedStores={selectedStores}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Products Grid */}
          {!isLoading && (
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-display font-bold text-lg text-foreground">
                  {activeCategory === 'All' ? 'All Products' : activeCategory}
                </h2>
                <span className="text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
                  {filteredProducts.length} items
                </span>
              </div>

              {filteredProducts.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground text-sm">No products found</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                  {filteredProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      quantity={cart.get(product.id)?.quantity || 0}
                      onAdd={() => addToCart(product)}
                      onRemove={() => removeFromCart(product.id)}
                      selectedStores={selectedStores}
                    />
                  ))}
                </div>
              )}
            </section>
          )}
        </main>

        {/* Footer */}
        <MinimalFooter />

        {/* Floating Dock */}
        <QuickAccessDock
          onRecipeFinderClick={() => setIsRecipeFinderOpen(true)}
          onPriceAlertsClick={() => setIsPriceAlertsOpen(true)}
          onDealFinderClick={() => setIsDealFinderOpen(true)}
          onSmartCartClick={() => setIsSmartCartOpen(true)}
          onWishlistClick={() => setIsWishlistOpen(true)}
          onRecipeVideoClick={() => setIsRecipeVideoOpen(true)}
          onPlannerClick={() => navigate(user ? '/dashboard' : '/auth')}
        />

        {/* Modals */}
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

        <AIChatbot 
          cart={cartItems.map(item => ({
            name: item.product.name,
            quantity: item.quantity,
            price: item.product.bestPrice || item.product.priceRange.min
          }))}
        />

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

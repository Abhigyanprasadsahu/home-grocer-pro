import { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { Zap, Clock, RefreshCw, Truck, Shield, Gift, Timer, Sparkles, Star, TrendingUp, Flame } from 'lucide-react';
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
import AIGroceryPlanner from '@/components/AIGroceryPlanner';
import PromoCarousel from '@/components/PromoCarousel';
import { useLivePrices, LiveProduct } from '@/hooks/useLivePrices';
import { useAuth } from '@/hooks/useAuth';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';

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
  const [isAIPlannerOpen, setIsAIPlannerOpen] = useState(false);

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

  // Stats for display
  const totalSavings = filteredProducts.reduce((acc, p) => {
    const savings = (p.priceRange.max - (p.bestPrice || p.priceRange.max));
    return acc + savings;
  }, 0);

  return (
    <>
      <Helmet>
        <title>Flash Cart - Grocery Delivery in 10 Minutes</title>
        <meta name="description" content="Order groceries online. Get fresh vegetables, fruits, dairy and more delivered in 10 minutes. Best prices guaranteed." />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
        <MinimalShopHeader
          cartCount={cartCount}
          onCartClick={() => setIsCartOpen(true)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onAddressClick={() => setIsAddressManagerOpen(true)}
        />

        <main className="max-w-7xl mx-auto px-4 py-4 space-y-6 pb-36">
          {/* Promotional Carousel */}
          <div id="products-section">
            <PromoCarousel onCategorySelect={setActiveCategory} />
          </div>

          {/* Premium Delivery Banner */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary/10 via-accent/5 to-primary/10 border border-primary/20">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-accent/10 rounded-full blur-2xl" />
            
            <div className="relative flex flex-wrap items-center justify-between gap-4 px-5 py-4">
              <div className="flex items-center gap-4">
                {/* Animated Timer */}
                <div className="relative">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/30">
                    <Timer className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-background flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                  </div>
                </div>
                
                <div>
                  <p className="text-sm font-bold text-foreground flex items-center gap-2">
                    Delivery in 8-12 mins
                    <span className="px-2 py-0.5 text-[10px] bg-green-500/10 text-green-600 rounded-full font-semibold">FAST</span>
                  </p>
                  <p className="text-xs text-muted-foreground">Free delivery on orders ₹100+ • Bulk orders ₹5000+ get free van delivery</p>
                </div>
              </div>
              
              <div className="hidden sm:flex items-center gap-6">
                {/* Live Price Indicator */}
                <div className="flex items-center gap-2 px-3 py-2 bg-background/80 rounded-xl backdrop-blur-sm">
                  <div className="relative">
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                    <div className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-green-500 animate-ping opacity-50" />
                  </div>
                  <span className="text-xs font-medium text-foreground">Live Prices</span>
                  <span className="text-[10px] text-muted-foreground">
                    {formatLastUpdated() || 'Just now'}
                  </span>
                  <button
                    onClick={refresh}
                    disabled={isLoading}
                    className="p-1 hover:bg-muted rounded-lg transition-colors"
                  >
                    <RefreshCw className={cn("w-3.5 h-3.5 text-primary", isLoading && "animate-spin")} />
                  </button>
                </div>
                
                {/* Savings indicator */}
                <div className="flex items-center gap-2 px-3 py-2 bg-accent/10 rounded-xl">
                  <TrendingUp className="w-4 h-4 text-accent" />
                  <span className="text-xs font-semibold text-foreground">Save up to 40%</span>
                </div>
              </div>
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
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                    {activeCategory === 'All' ? (
                      <>
                        <Flame className="w-5 h-5 text-primary" />
                        Popular right now
                      </>
                    ) : (
                      <>
                        Fresh {activeCategory}
                      </>
                    )}
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {filteredProducts.length} items • Updated live
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-muted-foreground hidden sm:inline">Sort by:</span>
                  <select className="text-xs bg-muted/50 border-0 rounded-lg px-2 py-1.5 text-foreground font-medium focus:ring-1 focus:ring-primary">
                    <option>Popularity</option>
                    <option>Price: Low to High</option>
                    <option>Price: High to Low</option>
                    <option>Discount</option>
                  </select>
                </div>
              </div>

              {filteredProducts.length === 0 ? (
                <div className="text-center py-20 bg-muted/30 rounded-3xl">
                  <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-4xl">🔍</span>
                  </div>
                  <p className="font-semibold text-foreground">No products found</p>
                  <p className="text-sm text-muted-foreground mt-1">Try a different search or category</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {filteredProducts.map((product, index) => (
                    <div 
                      key={product.id}
                      className="animate-fade-in"
                      style={{ animationDelay: `${Math.min(index * 30, 300)}ms` }}
                    >
                      <ProductCardMinimal
                        product={product}
                        quantity={cart.get(product.id)?.quantity || 0}
                        onAdd={() => addToCart(product)}
                        onRemove={() => removeFromCart(product.id)}
                      />
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* Premium Trust Footer */}
          <section className="pt-8">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { icon: Truck, label: 'Free Delivery', desc: 'On all orders ₹100+', color: 'text-primary', bg: 'bg-primary/10' },
                { icon: Shield, label: '100% Fresh', desc: 'Quality guaranteed', color: 'text-green-600', bg: 'bg-green-500/10' },
                { icon: Gift, label: 'Best Prices', desc: 'Price match promise', color: 'text-accent', bg: 'bg-accent/10' },
                { icon: Star, label: '4.9 Rating', desc: '10K+ happy families', color: 'text-amber-500', bg: 'bg-amber-500/10' },
              ].map((item, index) => (
                <div 
                  key={item.label}
                  className={cn(
                    "flex flex-col items-center text-center p-5 bg-card rounded-2xl border border-border/50",
                    "hover:shadow-lg hover:border-primary/20 hover:-translate-y-1 transition-all duration-300",
                    "group cursor-default"
                  )}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center mb-3 transition-all duration-300",
                    "group-hover:scale-110 group-hover:shadow-lg",
                    item.bg
                  )}>
                    <item.icon className={cn("w-6 h-6", item.color)} />
                  </div>
                  <p className="text-sm font-bold text-foreground">{item.label}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{item.desc}</p>
                </div>
              ))}
            </div>
            
            {/* App promo banner */}
            <div className="mt-6 p-5 bg-gradient-to-r from-primary/5 via-primary/10 to-accent/5 rounded-2xl border border-primary/20 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl gradient-hero flex items-center justify-center shadow-lg shadow-primary/20">
                  <Zap className="w-7 h-7 text-primary-foreground" />
                </div>
                <div>
                  <p className="font-bold text-foreground">Get ₹100 off on your first order!</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
                    <Sparkles className="w-3 h-3 text-primary" />
                    Use code <span className="font-bold text-primary">FLASH100</span> at checkout
                  </p>
                </div>
              </div>
              <Button variant="hero" size="sm" className="hidden sm:flex gap-1">
                <Zap className="w-4 h-4" />
                Claim Now
              </Button>
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
          onOpenAIPlanner={() => setIsAIPlannerOpen(true)}
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

        {/* AI Grocery Planner Modal */}
        {isAIPlannerOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center">
            {/* Backdrop */}
            <div 
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setIsAIPlannerOpen(false)}
            />
            {/* Modal Content */}
            <div className="relative z-10 w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-background rounded-2xl shadow-2xl border border-border mx-4">
              <AIGroceryPlanner 
                household={{
                  id: 'guest',
                  name: 'My Household',
                  family_size: 4,
                  adults: 2,
                  children: 2,
                  monthly_budget: 15000,
                  diet_preferences: ['vegetarian'],
                }}
                onClose={() => setIsAIPlannerOpen(false)}
                onPlanGenerated={() => {
                  setIsAIPlannerOpen(false);
                }}
              />
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Index;

import { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { Zap, TrendingUp, Percent, Sparkles, RefreshCw, Clock, Gift, Shield, Truck, Users, ShoppingCart, MapPin, BadgeCheck, Timer, Flame, ChefHat } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import ShopHeader from '@/components/ShopHeader';
import CategoryNav from '@/components/CategoryNav';
import ProductCard from '@/components/ProductCard';
import CartSidebar from '@/components/CartSidebar';
import StoreFilter from '@/components/StoreFilter';
import StoreSummary from '@/components/StoreSummary';
import AIChatbot from '@/components/AIChatbot';
import AIRecipeFinder from '@/components/AIRecipeFinder';
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
      .slice(0, 6);
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
        <title>Flash Kart - Compare Prices Across 12+ Stores</title>
        <meta name="description" content="Compare grocery prices across D-Mart, BigBasket, Zepto and more. Find the best deals and save up to 30% on your groceries." />
      </Helmet>

      <div className="min-h-screen bg-background">
        <ShopHeader
          cartCount={cartCount}
          onCartClick={() => setIsCartOpen(true)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
          {/* Hero Banner with Stats */}
          <div className="gradient-hero rounded-2xl p-6 md:p-8 text-primary-foreground relative overflow-hidden">
            <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute left-10 bottom-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2" />
            <div className="absolute right-20 bottom-10 w-20 h-20 bg-white/5 rounded-full" />
            <div className="relative z-10">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <Flame className="w-5 h-5 text-amber-300" />
                    <span className="text-sm font-medium bg-white/20 px-3 py-1 rounded-full">🔥 New Year Sale Live!</span>
                  </div>
                  <h1 className="text-2xl md:text-3xl lg:text-4xl font-display font-bold mb-3">
                    India's Smartest Grocery Shopping
                  </h1>
                  <p className="text-primary-foreground/90 max-w-lg text-sm md:text-base">
                    Compare real-time prices from D-Mart, BigBasket, Zepto & 10+ stores. Save ₹500-₹2000 every month!
                  </p>
                  <div className="flex items-center gap-4 mt-4">
                    <div className="flex items-center gap-1.5 text-sm">
                      <BadgeCheck className="w-4 h-4 text-green-300" />
                      <span>Verified Prices</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-sm">
                      <Timer className="w-4 h-4 text-amber-300" />
                      <span>Updated every 30 sec</span>
                    </div>
                  </div>
                </div>
                
                {/* AI Features Highlight */}
                <div className="flex gap-4 lg:gap-6">
                  <div className="text-center px-4 py-3 bg-white/15 rounded-xl backdrop-blur-sm border border-white/10">
                    <div className="flex justify-center mb-1">
                      <Sparkles className="w-5 h-5 text-amber-300" />
                    </div>
                    <p className="text-xs text-primary-foreground/80">AI Shopping</p>
                  </div>
                  <div className="text-center px-4 py-3 bg-white/15 rounded-xl backdrop-blur-sm border border-white/10">
                    <div className="flex justify-center mb-1">
                      <Zap className="w-5 h-5 text-green-300" />
                    </div>
                    <p className="text-xs text-primary-foreground/80">Smart Deals</p>
                  </div>
                  <div className="text-center px-4 py-3 bg-white/15 rounded-xl backdrop-blur-sm border border-white/10">
                    <div className="flex justify-center mb-1">
                      <TrendingUp className="w-5 h-5 text-blue-300" />
                    </div>
                    <p className="text-xs text-primary-foreground/80">Price Tracking</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* AI Powered Banner */}
          <div className="flex items-center justify-center gap-6 py-3 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 rounded-xl border border-primary/20">
            <div className="flex items-center gap-2 text-sm">
              <Sparkles className="w-4 h-4 text-primary animate-pulse" />
              <span className="text-muted-foreground">Powered by <strong className="text-foreground">Gemini AI</strong> & <strong className="text-foreground">GPT-5</strong></span>
            </div>
            <div className="hidden sm:flex items-center gap-1.5 text-sm">
              <MapPin className="w-4 h-4 text-primary" />
              <span className="text-muted-foreground">Delivering to <strong className="text-foreground">Mumbai, Delhi, Bangalore</strong> & more</span>
            </div>
          </div>

          {/* Live Price Status Bar */}
          <div className="flex items-center justify-between p-3 bg-card rounded-lg border border-border/50">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-sm font-medium text-green-600">Live Prices</span>
              </div>
              {lastUpdated && (
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Updated {formatLastUpdated()}
                </span>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={refresh}
              disabled={isLoading}
              className="text-primary"
            >
              <RefreshCw className={`w-4 h-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>

          {/* Store Filter */}
          <StoreFilter 
            stores={stores}
            selectedStores={selectedStores} 
            onStoreToggle={handleStoreToggle} 
          />

          {/* AI-Powered Quick Action Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              onClick={() => navigate(user ? '/dashboard' : '/auth')}
              className="flex items-center gap-3 p-4 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl border border-primary/20 hover:border-primary/40 hover:shadow-lg transition-all group text-left"
            >
              <div className="p-2.5 rounded-lg bg-primary/20 group-hover:bg-primary/30 transition-colors">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-foreground">AI Planner</p>
                <p className="text-xs text-muted-foreground">Smart grocery lists</p>
              </div>
            </button>
            <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-accent/10 to-accent/5 rounded-xl border border-accent/20 hover:shadow-md transition-all">
              <div className="p-2.5 rounded-lg bg-accent/20">
                <TrendingUp className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="font-semibold text-foreground">AI Price Alerts</p>
                <p className="text-xs text-muted-foreground">Smart notifications</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-green-500/10 to-green-500/5 rounded-xl border border-green-500/20 hover:shadow-md transition-all">
              <div className="p-2.5 rounded-lg bg-green-500/20">
                <Percent className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="font-semibold text-foreground">AI Deal Finder</p>
                <p className="text-xs text-muted-foreground">Best prices found</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-blue-500/10 to-blue-500/5 rounded-xl border border-blue-500/20 hover:shadow-md transition-all">
              <div className="p-2.5 rounded-lg bg-blue-500/20">
                <ShoppingCart className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="font-semibold text-foreground">Smart Cart</p>
                <p className="text-xs text-muted-foreground">AI optimized</p>
              </div>
            </div>
          </div>

          {/* Store Summary for Cart */}
          {cartItems.length > 0 && <StoreSummary cart={cartItems} stores={stores} />}

          {/* Loading State */}
          {isLoading && products.length === 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="bg-card rounded-xl border border-border/50 p-4">
                  <Skeleton className="aspect-square rounded-lg mb-3" />
                  <Skeleton className="h-4 w-3/4 mb-2" />
                  <Skeleton className="h-3 w-1/2 mb-3" />
                  <Skeleton className="h-6 w-1/3" />
                </div>
              ))}
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="text-center py-12 bg-destructive/10 rounded-xl">
              <p className="text-destructive font-medium">{error}</p>
              <Button variant="outline" onClick={refresh} className="mt-4">
                Try Again
              </Button>
            </div>
          )}

          {/* Deals Section */}
          {!isLoading && dealsProducts.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-display font-bold flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                    <Percent className="w-4 h-4 text-accent" />
                  </span>
                  Best Deals Today
                </h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
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

          {/* Categories */}
          <section>
            <h2 className="text-xl font-display font-bold mb-4">Shop by Category</h2>
            <CategoryNav activeCategory={activeCategory} onCategoryChange={setActiveCategory} />
          </section>

          {/* Products Grid */}
          {!isLoading && (
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-display font-bold">
                  {activeCategory === 'All' ? 'All Products' : activeCategory}
                </h2>
                <span className="text-sm text-muted-foreground">{filteredProducts.length} items</span>
              </div>

              {filteredProducts.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No products found</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
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
        {/* AI Recipe Finder Card */}
        <section className="py-4">
          <div 
            onClick={() => setIsRecipeFinderOpen(true)}
            className="p-6 bg-gradient-to-r from-accent/10 via-primary/5 to-accent/10 rounded-2xl border border-accent/20 cursor-pointer hover:shadow-lg transition-all group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-accent/20 group-hover:bg-accent/30 transition-colors">
                  <ChefHat className="w-8 h-8 text-accent" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-lg mb-1">AI Recipe Finder</h3>
                  <p className="text-sm text-muted-foreground">Tell us what ingredients you have and get personalized recipes instantly</p>
                </div>
              </div>
              <Button variant="hero" className="hidden sm:flex gap-2">
                <Sparkles className="w-4 h-4" />
                Find Recipes
              </Button>
            </div>
          </div>
        </section>

        {/* Trust Badges */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4 py-6">
          <div className="flex flex-col items-center text-center p-4 bg-card rounded-xl border border-border/50 hover:shadow-md transition-all">
            <div className="p-3 rounded-full bg-primary/10 mb-3">
              <Truck className="w-6 h-6 text-primary" />
            </div>
            <p className="font-semibold text-sm">Free Delivery</p>
            <p className="text-xs text-muted-foreground">On orders ₹500+</p>
          </div>
          <div className="flex flex-col items-center text-center p-4 bg-card rounded-xl border border-border/50 hover:shadow-md transition-all">
            <div className="p-3 rounded-full bg-green-500/10 mb-3">
              <Shield className="w-6 h-6 text-green-600" />
            </div>
            <p className="font-semibold text-sm">100% Fresh</p>
            <p className="text-xs text-muted-foreground">Quality guaranteed</p>
          </div>
          <div className="flex flex-col items-center text-center p-4 bg-card rounded-xl border border-border/50 hover:shadow-md transition-all">
            <div className="p-3 rounded-full bg-accent/10 mb-3">
              <Gift className="w-6 h-6 text-accent" />
            </div>
            <p className="font-semibold text-sm">Best Prices</p>
            <p className="text-xs text-muted-foreground">Lowest guaranteed</p>
          </div>
          <div className="flex flex-col items-center text-center p-4 bg-card rounded-xl border border-border/50 hover:shadow-md transition-all">
            <div className="p-3 rounded-full bg-blue-500/10 mb-3">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
            <p className="font-semibold text-sm">10 Min Delivery</p>
            <p className="text-xs text-muted-foreground">Select stores</p>
          </div>
        </section>
        </main>

        {/* Footer */}
        <footer className="border-t border-border mt-12 py-8 bg-card/50">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid md:grid-cols-4 gap-8 mb-8">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Zap className="w-5 h-5 text-primary" />
                  <span className="font-display font-bold text-lg text-foreground">Flash Kart</span>
                </div>
                <p className="text-sm text-muted-foreground">India's smartest grocery price comparison platform. Save money on every purchase.</p>
              </div>
              <div>
                <h4 className="font-semibold mb-3 text-foreground">Quick Links</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li><a href="#" className="hover:text-foreground transition-colors">How it works</a></li>
                  <li><a href="#" className="hover:text-foreground transition-colors">Partner Stores</a></li>
                  <li><a href="#" className="hover:text-foreground transition-colors">Download App</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-3 text-foreground">Support</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li><a href="#" className="hover:text-foreground transition-colors">Help Center</a></li>
                  <li><a href="#" className="hover:text-foreground transition-colors">Contact Us</a></li>
                  <li><a href="#" className="hover:text-foreground transition-colors">FAQs</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-3 text-foreground">Legal</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li><a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a></li>
                  <li><a href="#" className="hover:text-foreground transition-colors">Terms of Service</a></li>
                  <li><a href="#" className="hover:text-foreground transition-colors">Refund Policy</a></li>
                </ul>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-border text-sm text-muted-foreground">
              <span>© 2026 Flash Kart. All rights reserved.</span>
              <span className="flex items-center gap-1">Made with 🧡 in India</span>
            </div>
          </div>
        </footer>

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

        {/* AI Recipe Finder Modal */}
        <AIRecipeFinder 
          isOpen={isRecipeFinderOpen} 
          onClose={() => setIsRecipeFinderOpen(false)}
          initialIngredients={cartItems.map(item => item.product.name)}
        />
      </div>
    </>
  );
};

export default Index;

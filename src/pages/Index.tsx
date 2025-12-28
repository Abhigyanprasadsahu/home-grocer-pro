import { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { Zap, TrendingUp, Percent, ArrowRight, Sparkles, RefreshCw, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import ShopHeader from '@/components/ShopHeader';
import CategoryNav from '@/components/CategoryNav';
import ProductCard from '@/components/ProductCard';
import CartSidebar from '@/components/CartSidebar';
import StoreFilter from '@/components/StoreFilter';
import StoreSummary from '@/components/StoreSummary';
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
        <title>GROCERA - Compare Prices Across D-Mart, Reliance & More</title>
        <meta name="description" content="Compare grocery prices across D-Mart, Reliance Fresh, Big Bazaar and more. Find the best deals and save money on your monthly groceries." />
      </Helmet>

      <div className="min-h-screen bg-background">
        <ShopHeader
          cartCount={cartCount}
          onCartClick={() => setIsCartOpen(true)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
          {/* AI Planning Banner */}
          <div className="gradient-hero rounded-2xl p-6 text-primary-foreground relative overflow-hidden">
            <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-5 h-5" />
                  <span className="text-sm font-medium opacity-90">AI-Powered Planning</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-display font-bold mb-2">
                  Smart Monthly Grocery Plans
                </h2>
                <p className="text-primary-foreground/80 max-w-lg">
                  Get personalized grocery lists based on your family size, diet, and budget. Save up to 20% every month.
                </p>
              </div>
              <Button
                size="lg"
                className="bg-white text-primary hover:bg-white/90 shadow-lg"
                onClick={() => navigate(user ? '/dashboard' : '/auth')}
              >
                {user ? 'Go to Dashboard' : 'Get Started Free'}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
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

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-4 bg-card rounded-xl border border-border/50">
              <div className="p-2 rounded-lg bg-primary/10">
                <Zap className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stores.length}</p>
                <p className="text-xs text-muted-foreground">Stores Compared</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-card rounded-xl border border-border/50">
              <div className="p-2 rounded-lg bg-accent/10">
                <Percent className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {stores.length > 0 
                    ? Math.round(stores.reduce((acc, s) => acc + s.avgDiscount, 0) / stores.length)
                    : 0}%
                </p>
                <p className="text-xs text-muted-foreground">Avg. Savings</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-card rounded-xl border border-border/50">
              <div className="p-2 rounded-lg bg-green-500/10">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{products.length}+</p>
                <p className="text-xs text-muted-foreground">Products</p>
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
        </main>

        {/* Simple Footer */}
        <footer className="border-t border-border mt-12 py-6">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <p>© 2024 GROCERA. All rights reserved.</p>
            <div className="flex gap-4">
              <a href="#" className="hover:text-foreground">Terms</a>
              <a href="#" className="hover:text-foreground">Privacy</a>
              <a href="#" className="hover:text-foreground">Support</a>
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
      </div>
    </>
  );
};

export default Index;

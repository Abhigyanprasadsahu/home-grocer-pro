import { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { Zap, RefreshCw, Clock, Percent } from 'lucide-react';
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
import AIRecipeVideo from '@/components/AIRecipeVideo';
import AIDealFinder from '@/components/AIDealFinder';
import AIPriceAlerts from '@/components/AIPriceAlerts';
import SmartCart from '@/components/SmartCart';
import DeliveryAddressManager from '@/components/DeliveryAddressManager';
import Wishlist from '@/components/Wishlist';
import HeroSectionNew from '@/components/HeroSectionNew';
import PriceComparisonSection from '@/components/PriceComparisonSection';
import KiranaOrderSection from '@/components/KiranaOrderSection';
import AIToolsSection from '@/components/AIToolsSection';
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
        <title>Flash Cart - Compare Prices Across 12+ Stores | Order from Local Kiranas</title>
        <meta name="description" content="Compare grocery prices across D-Mart, BigBasket, Zepto and order from trusted local Kirana partners. Save up to 40% with AI-powered shopping." />
      </Helmet>

      <div className="min-h-screen bg-background">
        <ShopHeader
          cartCount={cartCount}
          onCartClick={() => setIsCartOpen(true)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onAddressClick={() => setIsAddressManagerOpen(true)}
        />

        {/* Hero Section */}
        <HeroSectionNew />

        {/* Price Comparison Section */}
        <PriceComparisonSection />

        {/* Kirana Order Section */}
        <KiranaOrderSection />

        {/* AI Tools Section */}
        <AIToolsSection
          onRecipeFinderClick={() => setIsRecipeFinderOpen(true)}
          onPriceAlertsClick={() => setIsPriceAlertsOpen(true)}
          onDealFinderClick={() => setIsDealFinderOpen(true)}
          onSmartCartClick={() => setIsSmartCartOpen(true)}
          onWishlistClick={() => setIsWishlistOpen(true)}
          onRecipeVideoClick={() => setIsRecipeVideoOpen(true)}
          onPlannerClick={() => navigate(user ? '/dashboard' : '/auth')}
        />

        {/* Product Catalog Section */}
        <section className="bg-muted/30 py-16">
          <div className="max-w-7xl mx-auto px-4 space-y-6">
            {/* Section Header */}
            <div className="text-center mb-8">
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-4 text-foreground">
                Browse & Compare <span className="text-gradient">All Products</span>
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Explore our complete catalog with live prices from multiple stores
              </p>
            </div>

            {/* Live Price Status Bar */}
            <div className="flex items-center justify-between p-4 bg-card rounded-xl border border-border/50 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-sm font-semibold text-green-600">Live Prices</span>
                </div>
                {lastUpdated && (
                  <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    Updated {formatLastUpdated()}
                  </span>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={refresh}
                disabled={isLoading}
                className="text-primary hover:text-primary"
              >
                <RefreshCw className={`w-4 h-4 mr-1.5 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh Prices
              </Button>
            </div>

            {/* Store Filter */}
            <StoreFilter 
              stores={stores}
              selectedStores={selectedStores} 
              onStoreToggle={handleStoreToggle} 
            />

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
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-display font-bold flex items-center gap-2 text-foreground">
                    <span className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                      <Percent className="w-4 h-4 text-accent" />
                    </span>
                    Best Deals Today
                  </h3>
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
              </div>
            )}

            {/* Categories */}
            <div className="space-y-4">
              <h3 className="text-xl font-display font-bold text-foreground">Shop by Category</h3>
              <CategoryNav activeCategory={activeCategory} onCategoryChange={setActiveCategory} />
            </div>

            {/* Products Grid */}
            {!isLoading && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-display font-bold text-foreground">
                    {activeCategory === 'All' ? 'All Products' : activeCategory}
                  </h3>
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
              </div>
            )}
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-border py-12 bg-card/50">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid md:grid-cols-4 gap-8 mb-8">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-2 rounded-lg gradient-hero">
                    <Zap className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <span className="font-display font-bold text-xl text-foreground">Flash Cart</span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  India's smartest grocery platform. Compare prices, order from local Kiranas, and save money on every purchase.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-4 text-foreground">Quick Links</h4>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li><a href="#" className="hover:text-foreground transition-colors">How it works</a></li>
                  <li><a href="#" className="hover:text-foreground transition-colors">Partner Stores</a></li>
                  <li><a href="#" className="hover:text-foreground transition-colors">Download App</a></li>
                  <li><a href="#" className="hover:text-foreground transition-colors">Become a Partner</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-4 text-foreground">Support</h4>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li><a href="#" className="hover:text-foreground transition-colors">Help Center</a></li>
                  <li><a href="#" className="hover:text-foreground transition-colors">Contact Us</a></li>
                  <li><a href="#" className="hover:text-foreground transition-colors">FAQs</a></li>
                  <li><a href="#" className="hover:text-foreground transition-colors">Feedback</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-4 text-foreground">Legal</h4>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li><a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a></li>
                  <li><a href="#" className="hover:text-foreground transition-colors">Terms of Service</a></li>
                  <li><a href="#" className="hover:text-foreground transition-colors">Refund Policy</a></li>
                  <li><a href="#" className="hover:text-foreground transition-colors">Cookies</a></li>
                </ul>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t border-border text-sm text-muted-foreground">
              <span>© 2026 Flash Cart. All rights reserved.</span>
              <span className="flex items-center gap-1">Made with 🧡 in India</span>
            </div>
          </div>
        </footer>

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

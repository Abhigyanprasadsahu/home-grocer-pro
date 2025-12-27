import { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { Zap, TrendingUp, Percent, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import ShopHeader from '@/components/ShopHeader';
import CategoryNav from '@/components/CategoryNav';
import ProductCard, { Product } from '@/components/ProductCard';
import CartSidebar from '@/components/CartSidebar';
import { products } from '@/data/products';
import { useAuth } from '@/hooks/useAuth';

interface CartItem {
  product: Product;
  quantity: number;
}

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<Map<string, CartItem>>(new Map());
  const [isCartOpen, setIsCartOpen] = useState(false);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesCategory = activeCategory === 'all' || product.category === activeCategory;
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  const discountedProducts = useMemo(() => {
    return products.filter((p) => p.discount).slice(0, 6);
  }, []);

  const addToCart = (product: Product) => {
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

  const cartCount = Array.from(cart.values()).reduce((sum, item) => sum + item.quantity, 0);
  const cartItems = Array.from(cart.values());

  return (
    <>
      <Helmet>
        <title>GROCERA - Fresh Groceries Delivered in 30 Minutes</title>
        <meta name="description" content="Order fresh groceries, fruits, vegetables, dairy, and essentials online. Fast delivery in 30-45 minutes. Best prices guaranteed." />
      </Helmet>

      <div className="min-h-screen bg-background">
        <ShopHeader
          cartCount={cartCount}
          onCartClick={() => setIsCartOpen(true)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        <main className="max-w-7xl mx-auto px-4 py-6 space-y-8">
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

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-4 bg-card rounded-xl border border-border/50">
              <div className="p-2 rounded-lg bg-primary/10">
                <Zap className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">30 min</p>
                <p className="text-xs text-muted-foreground">Fast Delivery</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-card rounded-xl border border-border/50">
              <div className="p-2 rounded-lg bg-accent/10">
                <Percent className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold">20%</p>
                <p className="text-xs text-muted-foreground">Avg. Savings</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-card rounded-xl border border-border/50">
              <div className="p-2 rounded-lg bg-green-500/10">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">5000+</p>
                <p className="text-xs text-muted-foreground">Products</p>
              </div>
            </div>
          </div>

          {/* Deals Section */}
          {discountedProducts.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-display font-bold flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                    <Percent className="w-4 h-4 text-accent" />
                  </span>
                  Today's Deals
                </h2>
                <Button variant="ghost" size="sm">
                  View All <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {discountedProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    quantity={cart.get(product.id)?.quantity || 0}
                    onAdd={() => addToCart(product)}
                    onRemove={() => removeFromCart(product.id)}
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
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-display font-bold">
                {activeCategory === 'all' ? 'All Products' : activeCategory.charAt(0).toUpperCase() + activeCategory.slice(1)}
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
                  />
                ))}
              </div>
            )}
          </section>
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

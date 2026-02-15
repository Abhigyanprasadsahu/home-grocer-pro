import { useState, useMemo } from 'react';
import { Package, Truck, TrendingDown, ShieldCheck, Users, ArrowRight, Plus, Minus, ShoppingCart, Check, Star, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { LiveProduct } from '@/hooks/useLivePrices';

interface BulkOrderSectionProps {
  products: LiveProduct[];
  cart: Map<string, { product: LiveProduct; quantity: number }>;
  onAddToCart: (product: LiveProduct) => void;
  onRemoveFromCart: (productId: string) => void;
}

// Bulk-friendly products with minimum quantities
const bulkCategories = [
  { id: 'all', label: 'All Bulk', emoji: '📦' },
  { id: 'grains', label: 'Grains & Pulses', emoji: '🌾' },
  { id: 'essentials', label: 'Essentials', emoji: '🧂' },
  { id: 'dairy', label: 'Dairy', emoji: '🥛' },
  { id: 'snacks', label: 'Snacks', emoji: '🍪' },
  { id: 'beverages', label: 'Beverages', emoji: '☕' },
];

const BULK_QUANTITIES = [5, 10, 15, 20, 25];

const BulkOrderSection = ({ products, cart, onAddToCart, onRemoveFromCart }: BulkOrderSectionProps) => {
  const [activeBulkCategory, setActiveBulkCategory] = useState('all');

  const bulkProducts = useMemo(() => {
    return products.filter(p => {
      if (activeBulkCategory === 'all') return true;
      return p.category.toLowerCase() === activeBulkCategory;
    });
  }, [products, activeBulkCategory]);

  const cartTotal = useMemo(() => {
    return Array.from(cart.values()).reduce((sum, item) => {
      return sum + (item.product.bestPrice || item.product.priceRange.min) * item.quantity;
    }, 0);
  }, [cart]);

  const remainingForFreeDelivery = Math.max(0, 5000 - cartTotal);
  const freeDeliveryProgress = Math.min(100, (cartTotal / 5000) * 100);

  const addBulkQuantity = (product: LiveProduct, qty: number) => {
    for (let i = 0; i < qty; i++) {
      onAddToCart(product);
    }
  };

  return (
    <section className="py-8 space-y-8">
      {/* Bulk Order Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-green-600 via-emerald-600 to-teal-700 text-white p-8 md:p-10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/3" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-4 max-w-xl">
            <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
              <Truck className="w-3 h-3 mr-1" /> Free Van Delivery on ₹5,000+
            </Badge>
            <h2 className="font-display text-3xl md:text-4xl font-bold leading-tight">
              Bulk Order Hub
            </h2>
            <p className="text-white/80 text-lg">
              Save up to <span className="font-bold text-yellow-300">40%</span> on monthly groceries. 
              Order in bulk from local Kirana stores with free scheduled delivery.
            </p>
            <div className="flex flex-wrap gap-4 text-sm">
              {[
                { icon: TrendingDown, text: 'Wholesale prices' },
                { icon: Truck, text: 'Free van delivery' },
                { icon: ShieldCheck, text: 'Quality assured' },
                { icon: Users, text: 'For families & communities' },
              ].map(item => (
                <span key={item.text} className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full">
                  <item.icon className="w-3.5 h-3.5" />
                  {item.text}
                </span>
              ))}
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/20 w-full md:w-auto md:min-w-[280px]">
            <div className="text-center space-y-3">
              <p className="text-sm font-medium text-white/70">Free Delivery Progress</p>
              <div className="relative h-3 bg-white/20 rounded-full overflow-hidden">
                <div 
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-yellow-400 to-yellow-300 rounded-full transition-all duration-500"
                  style={{ width: `${freeDeliveryProgress}%` }}
                />
              </div>
              <p className="text-2xl font-bold">₹{cartTotal.toLocaleString()}<span className="text-sm font-normal text-white/60"> / ₹5,000</span></p>
              {remainingForFreeDelivery > 0 ? (
                <p className="text-sm text-yellow-300">Add ₹{remainingForFreeDelivery.toLocaleString()} more for free delivery</p>
              ) : (
                <p className="text-sm text-yellow-300 flex items-center justify-center gap-1">
                  <Check className="w-4 h-4" /> Free delivery unlocked! 🎉
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bulk Savings Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { title: 'Monthly Ration', desc: 'Rice, atta, dal, oil - all at wholesale prices', savings: '₹800-1200', emoji: '🌾', color: 'from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-amber-200 dark:border-amber-800' },
          { title: 'Family Pack', desc: 'Complete groceries for a family of 4', savings: '₹1500-2000', emoji: '👨‍👩‍👧‍👦', color: 'from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800' },
          { title: 'Community Order', desc: 'Group orders for societies & offices', savings: '₹3000-5000', emoji: '🏘️', color: 'from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800' },
          { title: 'Institution Pack', desc: 'For hostels, PGs & canteens', savings: '₹5000+', emoji: '🏫', color: 'from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200 dark:border-purple-800' },
        ].map(pack => (
          <div key={pack.title} className={cn("p-4 rounded-2xl border bg-gradient-to-br transition-all hover:shadow-lg hover:-translate-y-1", pack.color)}>
            <span className="text-3xl">{pack.emoji}</span>
            <h4 className="font-bold text-foreground mt-2">{pack.title}</h4>
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{pack.desc}</p>
            <p className="text-sm font-bold text-green-600 mt-2">Save {pack.savings}</p>
          </div>
        ))}
      </div>

      {/* Delivery Info Strip */}
      <div className="flex flex-wrap items-center justify-center gap-6 py-4 px-6 bg-secondary/50 rounded-2xl border border-border/50">
        <div className="flex items-center gap-2 text-sm">
          <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
            <Truck className="w-4 h-4 text-green-600" />
          </div>
          <div>
            <p className="font-semibold text-foreground">Free Van Delivery</p>
            <p className="text-xs text-muted-foreground">On orders ₹5,000+</p>
          </div>
        </div>
        <div className="w-px h-8 bg-border hidden sm:block" />
        <div className="flex items-center gap-2 text-sm">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Package className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="font-semibold text-foreground">Scheduled Delivery</p>
            <p className="text-xs text-muted-foreground">Choose your time slot</p>
          </div>
        </div>
        <div className="w-px h-8 bg-border hidden sm:block" />
        <div className="flex items-center gap-2 text-sm">
          <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
            <Users className="w-4 h-4 text-accent" />
          </div>
          <div>
            <p className="font-semibold text-foreground">Helper Included</p>
            <p className="text-xs text-muted-foreground">For heavy item unloading</p>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {bulkCategories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveBulkCategory(cat.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-xl whitespace-nowrap transition-all text-sm font-medium",
              activeBulkCategory === cat.id
                ? "bg-foreground text-background shadow-lg"
                : "bg-secondary/50 text-muted-foreground hover:bg-secondary"
            )}
          >
            <span>{cat.emoji}</span>
            {cat.label}
          </button>
        ))}
      </div>

      {/* Bulk Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {bulkProducts.map(product => {
          const cartItem = cart.get(product.id);
          const quantity = cartItem?.quantity || 0;
          const unitPrice = product.bestPrice || product.priceRange.min;
          const bulkPrice = unitPrice * 0.85; // 15% bulk discount
          const savings = (unitPrice - bulkPrice).toFixed(0);

          return (
            <div 
              key={product.id}
              className="bg-card rounded-2xl border border-border/50 p-4 hover:shadow-lg hover:border-primary/20 transition-all group"
            >
              <div className="flex gap-4">
                {/* Product Image */}
                <div className="w-24 h-24 rounded-xl overflow-hidden bg-muted shrink-0">
                  <img 
                    src={product.image || `https://images.unsplash.com/photo-1542838132-92c53300491e?w=400`} 
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                    onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400'; }}
                  />
                </div>

                {/* Product Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-semibold text-foreground text-sm line-clamp-1">{product.name}</h4>
                      <p className="text-xs text-muted-foreground">{product.unit}</p>
                    </div>
                    {Number(savings) > 0 && (
                      <Badge className="bg-green-500/10 text-green-600 border-green-500/20 text-[10px] shrink-0">
                        Save ₹{savings}
                      </Badge>
                    )}
                  </div>

                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-lg font-bold text-foreground">₹{bulkPrice.toFixed(0)}</span>
                    <span className="text-xs text-muted-foreground line-through">₹{unitPrice}</span>
                    <span className="text-[10px] text-green-600 font-medium">bulk price</span>
                  </div>

                  {/* Bulk Quick-Add Buttons */}
                  <div className="flex items-center gap-2 mt-3">
                    {quantity === 0 ? (
                      <div className="flex gap-1.5 flex-wrap">
                        {BULK_QUANTITIES.slice(0, 3).map(qty => (
                          <button
                            key={qty}
                            onClick={() => addBulkQuantity(product, qty)}
                            className="px-3 py-1.5 text-xs font-semibold bg-primary/10 text-primary rounded-lg hover:bg-primary hover:text-primary-foreground transition-all"
                          >
                            +{qty}
                          </button>
                        ))}
                        <button
                          onClick={() => onAddToCart(product)}
                          className="px-3 py-1.5 text-xs font-semibold bg-secondary text-foreground rounded-lg hover:bg-primary hover:text-primary-foreground transition-all"
                        >
                          +1
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 w-full">
                        <div className="flex items-center gap-1 bg-primary/10 rounded-lg">
                          <button 
                            onClick={() => onRemoveFromCart(product.id)}
                            className="p-1.5 hover:bg-primary/20 rounded-lg transition-colors"
                          >
                            <Minus className="w-3.5 h-3.5 text-primary" />
                          </button>
                          <span className="w-10 text-center text-sm font-bold text-primary">{quantity}</span>
                          <button 
                            onClick={() => onAddToCart(product)}
                            className="p-1.5 hover:bg-primary/20 rounded-lg transition-colors"
                          >
                            <Plus className="w-3.5 h-3.5 text-primary" />
                          </button>
                        </div>
                        <span className="text-xs text-muted-foreground ml-auto">
                          = ₹{(bulkPrice * quantity).toFixed(0)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {bulkProducts.length === 0 && (
        <div className="text-center py-16 bg-muted/30 rounded-3xl">
          <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <p className="font-semibold text-foreground">No products in this category</p>
          <p className="text-sm text-muted-foreground mt-1">Try selecting a different category</p>
        </div>
      )}

      {/* Bottom CTA */}
      <div className="p-6 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 rounded-2xl border border-primary/20 text-center">
        <h3 className="font-display font-bold text-xl text-foreground">💡 Zero Inventory Model</h3>
        <p className="text-sm text-muted-foreground mt-2 max-w-xl mx-auto">
          We source directly from local Kirana stores — fresher products, no warehousing costs, 
          and you're supporting local businesses with every order!
        </p>
      </div>
    </section>
  );
};

export default BulkOrderSection;

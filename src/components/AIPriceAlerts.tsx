import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Bell, BellOff, TrendingDown, Plus, Trash2, Sparkles, AlertCircle, Check, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface PriceAlert {
  id: string;
  productName: string;
  targetPrice: number;
  currentPrice: number;
  isActive: boolean;
  triggered: boolean;
  productId: string;
}

interface AIPriceAlertsProps {
  isOpen: boolean;
  onClose: () => void;
}

const AIPriceAlerts = ({ isOpen, onClose }: AIPriceAlertsProps) => {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [newProductName, setNewProductName] = useState('');
  const [newTargetPrice, setNewTargetPrice] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  // Fetch wishlist items as price alerts
  const fetchAlerts = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const { data: wishlistItems, error } = await supabase
        .from('wishlist')
        .select('id, product_id, price_when_added, target_price, notify_on_drop')
        .eq('user_id', user.id);

      if (error) throw error;

      if (!wishlistItems?.length) {
        setAlerts([]);
        setIsLoading(false);
        return;
      }

      // Fetch product names
      const productIds = wishlistItems.map(w => w.product_id);
      const { data: products } = await supabase
        .from('products')
        .select('id, name')
        .in('id', productIds);

      // Fetch current best prices
      const { data: prices } = await supabase
        .from('store_prices')
        .select('product_id, current_price')
        .in('product_id', productIds)
        .eq('is_available', true);

      const productMap = new Map(products?.map(p => [p.id, p.name]) || []);
      
      // Get best current price per product
      const bestPrices = new Map<string, number>();
      for (const p of (prices || [])) {
        const current = bestPrices.get(p.product_id);
        if (!current || p.current_price < current) {
          bestPrices.set(p.product_id, p.current_price);
        }
      }

      const mapped: PriceAlert[] = wishlistItems.map(w => {
        const currentPrice = bestPrices.get(w.product_id) || w.price_when_added;
        const targetPrice = w.target_price || w.price_when_added * 0.85;
        return {
          id: w.id,
          productName: productMap.get(w.product_id) || 'Unknown Product',
          targetPrice,
          currentPrice,
          isActive: w.notify_on_drop ?? true,
          triggered: currentPrice <= targetPrice,
          productId: w.product_id,
        };
      });

      setAlerts(mapped);
    } catch (err) {
      console.error('Error fetching alerts:', err);
      toast.error('Failed to load price alerts');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && user) {
      fetchAlerts();
    }
  }, [isOpen, user]);

  const toggleAlert = async (id: string) => {
    const alert = alerts.find(a => a.id === id);
    if (!alert) return;

    const newActive = !alert.isActive;
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, isActive: newActive } : a));

    const { error } = await supabase
      .from('wishlist')
      .update({ notify_on_drop: newActive })
      .eq('id', id);

    if (error) {
      toast.error('Failed to update alert');
      setAlerts(prev => prev.map(a => a.id === id ? { ...a, isActive: !newActive } : a));
    }
  };

  const deleteAlert = async (id: string) => {
    const { error } = await supabase
      .from('wishlist')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Failed to delete alert');
      return;
    }

    setAlerts(prev => prev.filter(a => a.id !== id));
    toast.success('Alert deleted');
  };

  const addAlert = async () => {
    if (!newProductName.trim() || !newTargetPrice || !user) {
      toast.error('Please fill in all fields');
      return;
    }

    // Find matching product
    const { data: matchedProducts } = await supabase
      .from('products')
      .select('id, name')
      .ilike('name', `%${newProductName.trim()}%`)
      .limit(1);

    if (!matchedProducts?.length) {
      toast.error('Product not found. Try a different name.');
      return;
    }

    const product = matchedProducts[0];
    const targetPrice = parseFloat(newTargetPrice);

    // Get current price
    const { data: prices } = await supabase
      .from('store_prices')
      .select('current_price')
      .eq('product_id', product.id)
      .eq('is_available', true)
      .order('current_price', { ascending: true })
      .limit(1);

    const currentPrice = prices?.[0]?.current_price || targetPrice * 1.2;

    const { error } = await supabase
      .from('wishlist')
      .insert({
        user_id: user.id,
        product_id: product.id,
        price_when_added: currentPrice,
        target_price: targetPrice,
        notify_on_drop: true,
      });

    if (error) {
      if (error.code === '23505') {
        toast.error('This product is already in your alerts');
      } else {
        toast.error('Failed to create alert');
      }
      return;
    }

    setNewProductName('');
    setNewTargetPrice('');
    setShowAddForm(false);
    toast.success('Price alert created!');
    fetchAlerts();
  };

  const triggeredAlerts = alerts.filter(a => a.triggered && a.isActive);
  const activeAlerts = alerts.filter(a => !a.triggered && a.isActive);
  const inactiveAlerts = alerts.filter(a => !a.isActive);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-display">
            <div className="p-2 rounded-lg bg-accent/10">
              <Bell className="w-5 h-5 text-accent" />
            </div>
            AI Price Alerts
            <span className="ml-auto text-xs font-normal text-muted-foreground bg-primary/10 px-2 py-1 rounded-full">
              Live Tracking
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {isLoading ? (
            <div className="flex flex-col items-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">Loading your price alerts...</p>
            </div>
          ) : (
            <>
              {/* Add New Alert Button */}
              {!showAddForm ? (
                <Button onClick={() => setShowAddForm(true)} className="w-full" variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Create New Price Alert
                </Button>
              ) : (
                <div className="p-4 bg-secondary/50 rounded-xl space-y-4">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    New Price Alert
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="productName">Product Name</Label>
                      <Input
                        id="productName"
                        placeholder="e.g., Amul Butter, Rice, Tomatoes..."
                        value={newProductName}
                        onChange={(e) => setNewProductName(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="targetPrice">Target Price (₹)</Label>
                      <Input
                        id="targetPrice"
                        type="number"
                        placeholder="e.g., 240"
                        value={newTargetPrice}
                        onChange={(e) => setNewTargetPrice(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={addAlert} variant="hero" className="flex-1">
                      Create Alert
                    </Button>
                    <Button onClick={() => setShowAddForm(false)} variant="ghost">
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {/* Triggered Alerts */}
              {triggeredAlerts.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-green-600 flex items-center gap-2">
                    <Check className="w-4 h-4" />
                    Price Dropped! ({triggeredAlerts.length})
                  </h4>
                  {triggeredAlerts.map(alert => (
                    <div key={alert.id} className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
                      <div className="flex items-center justify-between">
                        <div>
                          <h5 className="font-semibold text-green-700">{alert.productName}</h5>
                          <p className="text-sm text-green-600">
                            Now ₹{alert.currentPrice.toFixed(0)} (Target: ₹{alert.targetPrice.toFixed(0)})
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => deleteAlert(alert.id)}
                            className="p-1.5 hover:bg-destructive/10 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Active Alerts */}
              {activeAlerts.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-muted-foreground">
                    Watching ({activeAlerts.length})
                  </h4>
                  {activeAlerts.map(alert => (
                    <div key={alert.id} className="p-4 bg-card border border-border rounded-xl">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex-1">
                          <h5 className="font-semibold">{alert.productName}</h5>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>Current: ₹{alert.currentPrice.toFixed(0)}</span>
                            <TrendingDown className="w-3 h-3 text-primary" />
                            <span className="text-primary font-medium">Target: ₹{alert.targetPrice.toFixed(0)}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={alert.isActive}
                            onCheckedChange={() => toggleAlert(alert.id)}
                          />
                          <button
                            onClick={() => deleteAlert(alert.id)}
                            className="p-1.5 hover:bg-destructive/10 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Inactive Alerts */}
              {inactiveAlerts.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                    <BellOff className="w-4 h-4" />
                    Paused ({inactiveAlerts.length})
                  </h4>
                  {inactiveAlerts.map(alert => (
                    <div key={alert.id} className="p-4 bg-secondary/30 border border-border/50 rounded-xl opacity-60">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <h5 className="font-medium">{alert.productName}</h5>
                          <p className="text-sm text-muted-foreground">Target: ₹{alert.targetPrice.toFixed(0)}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={alert.isActive}
                            onCheckedChange={() => toggleAlert(alert.id)}
                          />
                          <button
                            onClick={() => deleteAlert(alert.id)}
                            className="p-1.5 hover:bg-destructive/10 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Empty State */}
              {alerts.length === 0 && !isLoading && (
                <div className="text-center py-12">
                  <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-2">No price alerts yet</p>
                  <p className="text-sm text-muted-foreground">Create an alert to get notified when prices drop</p>
                </div>
              )}
            </>
          )}

          {/* Info */}
          <div className="p-3 bg-primary/5 rounded-lg flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-primary mt-0.5" />
            <p className="text-xs text-muted-foreground">
              Price alerts track real prices across all partner stores. Add items to your wishlist to monitor price drops.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AIPriceAlerts;

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { RefreshCw, Plus, Trash2, Clock, Calendar, Loader2, Milk, Carrot, Egg, Coffee, Package } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface Subscription {
  id: string;
  product_name: string;
  quantity: number;
  frequency: string;
  preferred_time: string;
  is_active: boolean;
  next_delivery: string | null;
}

interface AutoOrderSubscriptionProps {
  isOpen: boolean;
  onClose: () => void;
}

const frequencyOptions = [
  { value: 'daily', label: 'Daily', icon: '📅' },
  { value: 'alternate', label: 'Alternate Days', icon: '🔄' },
  { value: 'weekly', label: 'Weekly', icon: '📆' },
  { value: 'biweekly', label: 'Bi-Weekly', icon: '🗓️' },
  { value: 'monthly', label: 'Monthly', icon: '📋' },
];

const suggestedProducts = [
  { name: 'Milk 500ml', icon: Milk, category: 'dairy' },
  { name: 'Fresh Vegetables', icon: Carrot, category: 'vegetables' },
  { name: 'Eggs 6 pack', icon: Egg, category: 'dairy' },
  { name: 'Bread Loaf', icon: Package, category: 'bakery' },
  { name: 'Coffee Powder', icon: Coffee, category: 'beverages' },
];

const AutoOrderSubscription = ({ isOpen, onClose }: AutoOrderSubscriptionProps) => {
  const { user } = useAuth();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newProduct, setNewProduct] = useState('');
  const [newQuantity, setNewQuantity] = useState(1);
  const [newFrequency, setNewFrequency] = useState('daily');
  const [newTime, setNewTime] = useState('08:00');

  useEffect(() => {
    if (isOpen && user) {
      fetchSubscriptions();
    }
  }, [isOpen, user]);

  const fetchSubscriptions = async () => {
    if (!user) return;
    setIsLoading(true);

    try {
      const { data, error } = await supabase
        .from('auto_subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSubscriptions(data || []);
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addSubscription = async () => {
    if (!user || !newProduct.trim()) {
      toast.error('Please enter a product name');
      return;
    }

    try {
      const nextDelivery = new Date();
      if (newFrequency === 'daily' || newFrequency === 'alternate') {
        nextDelivery.setDate(nextDelivery.getDate() + 1);
      } else if (newFrequency === 'weekly') {
        nextDelivery.setDate(nextDelivery.getDate() + 7);
      } else if (newFrequency === 'biweekly') {
        nextDelivery.setDate(nextDelivery.getDate() + 14);
      } else {
        nextDelivery.setMonth(nextDelivery.getMonth() + 1);
      }

      const { error } = await supabase
        .from('auto_subscriptions')
        .insert({
          user_id: user.id,
          product_name: newProduct,
          quantity: newQuantity,
          frequency: newFrequency,
          preferred_time: newTime,
          next_delivery: nextDelivery.toISOString().split('T')[0],
        });

      if (error) throw error;

      toast.success(`Auto-order set for ${newProduct}! 🔄`);
      setNewProduct('');
      setNewQuantity(1);
      setNewFrequency('daily');
      setShowAddForm(false);
      fetchSubscriptions();
    } catch (error) {
      console.error('Error adding subscription:', error);
      toast.error('Failed to create subscription');
    }
  };

  const toggleSubscription = async (id: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('auto_subscriptions')
        .update({ is_active: !isActive })
        .eq('id', id);

      if (error) throw error;
      fetchSubscriptions();
      toast.success(isActive ? 'Subscription paused' : 'Subscription activated');
    } catch (error) {
      console.error('Error toggling subscription:', error);
    }
  };

  const deleteSubscription = async (id: string) => {
    try {
      const { error } = await supabase
        .from('auto_subscriptions')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchSubscriptions();
      toast.success('Subscription removed');
    } catch (error) {
      console.error('Error deleting subscription:', error);
    }
  };

  const getFrequencyLabel = (freq: string) => {
    return frequencyOptions.find(f => f.value === freq)?.label || freq;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-display">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <RefreshCw className="w-5 h-5 text-blue-600" />
            </div>
            Auto-Order Subscriptions
            <span className="ml-auto text-xs font-normal text-muted-foreground bg-green-500/10 px-2 py-1 rounded-full text-green-600">
              Never run out!
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Info Banner */}
          <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <p className="text-sm text-blue-700">
              <strong>🔄 Auto-Order:</strong> Set up recurring orders for daily essentials like milk, bread, vegetables. Perfect for busy professionals!
            </p>
          </div>

          {/* Add New Button */}
          {!showAddForm ? (
            <Button onClick={() => setShowAddForm(true)} className="w-full" variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Add Auto-Order Item
            </Button>
          ) : (
            <div className="p-4 bg-secondary/50 rounded-xl space-y-4">
              <h4 className="font-semibold">New Auto-Order</h4>
              
              {/* Quick Suggestions */}
              <div className="flex flex-wrap gap-2">
                {suggestedProducts.map((product) => (
                  <button
                    key={product.name}
                    onClick={() => setNewProduct(product.name)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-all ${
                      newProduct === product.name
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary hover:bg-secondary/80'
                    }`}
                  >
                    <product.icon className="w-3.5 h-3.5" />
                    {product.name}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <Label>Product Name</Label>
                  <Input
                    placeholder="e.g., Amul Milk 500ml"
                    value={newProduct}
                    onChange={(e) => setNewProduct(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Quantity</Label>
                  <Input
                    type="number"
                    min={1}
                    value={newQuantity}
                    onChange={(e) => setNewQuantity(parseInt(e.target.value) || 1)}
                  />
                </div>
                <div>
                  <Label>Delivery Time</Label>
                  <Select value={newTime} onValueChange={setNewTime}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="06:00">6:00 AM</SelectItem>
                      <SelectItem value="08:00">8:00 AM</SelectItem>
                      <SelectItem value="10:00">10:00 AM</SelectItem>
                      <SelectItem value="18:00">6:00 PM</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2">
                  <Label>Frequency</Label>
                  <div className="grid grid-cols-3 gap-2 mt-1">
                    {frequencyOptions.slice(0, 3).map((freq) => (
                      <button
                        key={freq.value}
                        onClick={() => setNewFrequency(freq.value)}
                        className={`p-2 rounded-lg text-center text-sm transition-all ${
                          newFrequency === freq.value
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-secondary hover:bg-secondary/80'
                        }`}
                      >
                        <span className="text-lg">{freq.icon}</span>
                        <p className="text-xs mt-1">{freq.label}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={addSubscription} variant="hero" className="flex-1">
                  Create Auto-Order
                </Button>
                <Button onClick={() => setShowAddForm(false)} variant="ghost">
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Loading */}
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          )}

          {/* Subscriptions List */}
          {!isLoading && subscriptions.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-semibold text-sm text-muted-foreground">
                Active Subscriptions ({subscriptions.filter(s => s.is_active).length})
              </h4>
              {subscriptions.map((sub) => (
                <div
                  key={sub.id}
                  className={`p-4 rounded-xl border transition-all ${
                    sub.is_active
                      ? 'bg-card border-border'
                      : 'bg-secondary/30 border-border/50 opacity-60'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <h5 className="font-semibold">{sub.product_name}</h5>
                      <div className="flex flex-wrap items-center gap-2 mt-1 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Package className="w-3 h-3" />
                          Qty: {sub.quantity}
                        </span>
                        <span className="flex items-center gap-1">
                          <RefreshCw className="w-3 h-3" />
                          {getFrequencyLabel(sub.frequency)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {sub.preferred_time}
                        </span>
                      </div>
                      {sub.next_delivery && sub.is_active && (
                        <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Next: {new Date(sub.next_delivery).toLocaleDateString('en-IN', { 
                            weekday: 'short', 
                            day: 'numeric', 
                            month: 'short' 
                          })}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={sub.is_active}
                        onCheckedChange={() => toggleSubscription(sub.id, sub.is_active)}
                      />
                      <button
                        onClick={() => deleteSubscription(sub.id)}
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
          {!isLoading && subscriptions.length === 0 && !showAddForm && (
            <div className="text-center py-8">
              <RefreshCw className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-2">No auto-orders yet</p>
              <p className="text-sm text-muted-foreground">
                Set up recurring orders for daily essentials
              </p>
            </div>
          )}

          {/* Delivery Info */}
          <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
            <p className="text-xs text-green-700">
              <strong>🚴 Delivery:</strong> Small orders (&lt;₹200) via bike. Orders &gt;₹2500 get FREE van delivery!
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AutoOrderSubscription;

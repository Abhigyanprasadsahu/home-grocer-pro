import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Bell, BellOff, TrendingDown, Plus, Trash2, Sparkles, AlertCircle, Check } from 'lucide-react';
import { toast } from 'sonner';

interface PriceAlert {
  id: string;
  productName: string;
  targetPrice: number;
  currentPrice: number;
  isActive: boolean;
  createdAt: Date;
  triggered?: boolean;
}

interface AIPriceAlertsProps {
  isOpen: boolean;
  onClose: () => void;
}

const AIPriceAlerts = ({ isOpen, onClose }: AIPriceAlertsProps) => {
  const [alerts, setAlerts] = useState<PriceAlert[]>([
    { id: '1', productName: 'Amul Butter 500g', targetPrice: 240, currentPrice: 280, isActive: true, createdAt: new Date(), triggered: false },
    { id: '2', productName: 'Basmati Rice 5kg', targetPrice: 500, currentPrice: 520, isActive: true, createdAt: new Date(), triggered: false },
    { id: '3', productName: 'Olive Oil 1L', targetPrice: 600, currentPrice: 580, isActive: true, createdAt: new Date(), triggered: true },
  ]);
  const [newProductName, setNewProductName] = useState('');
  const [newTargetPrice, setNewTargetPrice] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  const addAlert = () => {
    if (!newProductName.trim() || !newTargetPrice) {
      toast.error('Please fill in all fields');
      return;
    }

    const newAlert: PriceAlert = {
      id: Date.now().toString(),
      productName: newProductName,
      targetPrice: parseFloat(newTargetPrice),
      currentPrice: parseFloat(newTargetPrice) * (1 + Math.random() * 0.3), // Simulated current price
      isActive: true,
      createdAt: new Date(),
      triggered: false,
    };

    setAlerts(prev => [newAlert, ...prev]);
    setNewProductName('');
    setNewTargetPrice('');
    setShowAddForm(false);
    toast.success('Price alert created! AI will notify you when price drops.');
  };

  const toggleAlert = (id: string) => {
    setAlerts(prev => 
      prev.map(alert => 
        alert.id === id ? { ...alert, isActive: !alert.isActive } : alert
      )
    );
  };

  const deleteAlert = (id: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
    toast.success('Alert deleted');
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
              Powered by GPT-5
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
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
                    placeholder="e.g., Amul Butter 500g"
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
                        Now ₹{alert.currentPrice.toFixed(0)} (Target: ₹{alert.targetPrice})
                      </p>
                    </div>
                    <Button size="sm" variant="hero">Buy Now</Button>
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
                        <span className="text-primary font-medium">Target: ₹{alert.targetPrice}</span>
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
                      <p className="text-sm text-muted-foreground">Target: ₹{alert.targetPrice}</p>
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
          {alerts.length === 0 && (
            <div className="text-center py-12">
              <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-2">No price alerts yet</p>
              <p className="text-sm text-muted-foreground">Create an alert to get notified when prices drop</p>
            </div>
          )}

          {/* Info */}
          <div className="p-3 bg-primary/5 rounded-lg flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-primary mt-0.5" />
            <p className="text-xs text-muted-foreground">
              AI monitors prices across all partner stores and notifies you via app notification when your target price is reached.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AIPriceAlerts;

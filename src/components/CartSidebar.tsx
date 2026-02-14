import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, X, Trash2, Plus, Minus, ArrowRight, Truck, Store, Clock, Zap, CheckCircle2, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LiveProduct } from '@/hooks/useLivePrices';
import { cn } from '@/lib/utils';

interface CartItem {
  product: LiveProduct;
  quantity: number;
}

interface DeliverySlot {
  id: string;
  time: string;
  label: string;
  price: number;
  isExpress?: boolean;
}

const deliverySlots: DeliverySlot[] = [
  { id: '1', time: '2-4 PM', label: 'Today', price: 0 },
  { id: '2', time: '6-8 PM', label: 'Today', price: 0 },
  { id: '3', time: '9-11 AM', label: 'Tomorrow', price: 0 },
  { id: '4', time: '30 min', label: 'Express', price: 49, isExpress: true },
];

const pickupLocations = [
  { id: 'p1', name: 'Sharma General Store', distance: '1.2 km', readyIn: '45 min' },
  { id: 'p2', name: 'Fresh Mart Kirana', distance: '0.8 km', readyIn: '20 min' },
  { id: 'p3', name: 'City Grocers', distance: '1.5 km', readyIn: '30 min' },
];

// Delivery pricing constants
const BULK_FREE_DELIVERY_THRESHOLD = 5000;
const SMALL_ORDER_FREE_THRESHOLD = 100;

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (productId: string, delta: number) => void;
  onRemove: (productId: string) => void;
}

const CartSidebar = ({ isOpen, onClose, items, onUpdateQuantity, onRemove }: CartSidebarProps) => {
  const navigate = useNavigate();
  const [showDelivery, setShowDelivery] = useState(false);
  const [deliveryType, setDeliveryType] = useState<'delivery' | 'pickup'>('delivery');
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [selectedPickup, setSelectedPickup] = useState<string | null>(null);

  const subtotal = items.reduce((sum, item) => {
    const price = item.product.bestPrice || item.product.priceRange.min;
    return sum + price * item.quantity;
  }, 0);
  const mrpTotal = items.reduce((sum, item) => sum + item.product.priceRange.max * item.quantity, 0);
  const savings = mrpTotal - subtotal;
  
  // Bulk order: free delivery above ₹2500, otherwise ₹100 delivery fee
  const isBulkOrder = subtotal >= BULK_FREE_DELIVERY_THRESHOLD;
  const selectedSlotData = deliverySlots.find(s => s.id === selectedSlot);
  
  // Calculate delivery fee based on order size
  const getDeliveryFee = () => {
    if (deliveryType === 'pickup') return 0;
    if (selectedSlotData?.isExpress) return selectedSlotData.price; // Express always costs
    if (subtotal >= SMALL_ORDER_FREE_THRESHOLD) return 0; // Free delivery for orders ₹100+
    return 30; // Small delivery fee for orders under ₹100
  };
  
  const deliveryFee = getDeliveryFee();
  const total = subtotal + deliveryFee;
  const amountForFreeDelivery = BULK_FREE_DELIVERY_THRESHOLD - subtotal;

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      {/* Sidebar */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-card border-l border-border z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-primary" />
            <h2 className="font-display font-bold text-lg">Your Cart</h2>
            <span className="px-2 py-0.5 bg-primary/10 text-primary text-sm font-medium rounded-full">
              {items.reduce((sum, item) => sum + item.quantity, 0)} items
            </span>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-secondary rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Bulk Order Banner */}
        {items.length > 0 && !isBulkOrder && (
          <div className="px-4 py-2 bg-primary/10 border-b border-primary/20">
            <p className="text-xs text-primary font-medium flex items-center gap-2">
              <Package className="w-4 h-4" />
              Add ₹{Math.round(amountForFreeDelivery)} more for FREE delivery (Bulk Order)
            </p>
          </div>
        )}
        
        {items.length > 0 && isBulkOrder && (
          <div className="px-4 py-2 bg-green-500/10 border-b border-green-500/20">
            <p className="text-xs text-green-600 font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              🎉 Bulk Order - You get FREE delivery!
            </p>
          </div>
        )}

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {items.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
              <p className="text-muted-foreground">Your cart is empty</p>
              <p className="text-sm text-muted-foreground/70">Add items to get started</p>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.product.id} className="flex gap-3 p-3 bg-secondary/30 rounded-lg">
                <div className="w-16 h-16 bg-card rounded-lg flex items-center justify-center text-3xl">
                  {item.product.image}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm line-clamp-1">{item.product.name}</h4>
                  <p className="text-xs text-muted-foreground">{item.product.unit}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="font-bold">₹{((item.product.bestPrice || item.product.priceRange.min) * item.quantity).toFixed(0)}</span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onUpdateQuantity(item.product.id, -1)}
                        className="p-1 bg-card border border-border rounded hover:bg-secondary transition-colors"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-2 text-sm font-medium">{item.quantity}</span>
                      <button
                        onClick={() => onUpdateQuantity(item.product.id, 1)}
                        className="p-1 bg-card border border-border rounded hover:bg-secondary transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => onRemove(item.product.id)}
                        className="p-1 ml-1 text-destructive hover:bg-destructive/10 rounded transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-border p-4 space-y-3">
            {savings > 0 && (
              <div className="flex items-center justify-between text-sm text-green-600 bg-green-500/10 p-2 rounded-lg">
                <span>You're saving</span>
                <span className="font-bold">₹{savings.toFixed(0)}</span>
              </div>
            )}

            {/* Delivery Options Toggle */}
            {!showDelivery ? (
              <>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>₹{subtotal.toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Delivery</span>
                    <span className={deliveryFee === 0 ? 'text-green-600 font-medium' : 'text-foreground'}>
                      {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}
                    </span>
                  </div>
                  {!isBulkOrder && (
                    <p className="text-xs text-muted-foreground bg-secondary/50 p-2 rounded">
                      💡 Add ₹{Math.round(amountForFreeDelivery)} more for FREE bulk delivery
                    </p>
                  )}
                </div>
                <div className="flex justify-between font-bold text-lg pt-2 border-t border-border">
                  <span>Total</span>
                  <span>₹{total.toFixed(0)}</span>
                </div>
                <Button className="w-full" size="lg" onClick={() => setShowDelivery(true)}>
                  Choose Delivery
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </>
            ) : (
              <div className="space-y-4">
                {/* Back button */}
                <button 
                  onClick={() => setShowDelivery(false)}
                  className="text-sm text-primary hover:underline"
                >
                  ← Back to cart
                </button>

                {/* Delivery Type Toggle */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setDeliveryType('delivery')}
                    className={cn(
                      "flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all text-sm font-medium",
                      deliveryType === 'delivery'
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    <Truck className="w-4 h-4" />
                    Delivery
                  </button>
                  <button
                    onClick={() => setDeliveryType('pickup')}
                    className={cn(
                      "flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all text-sm font-medium",
                      deliveryType === 'pickup'
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    <Store className="w-4 h-4" />
                    Pickup
                  </button>
                </div>

                {/* Delivery Slots */}
                {deliveryType === 'delivery' && (
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground">Select slot</p>
                    <div className="grid grid-cols-2 gap-2">
                      {deliverySlots.map((slot) => (
                        <button
                          key={slot.id}
                          onClick={() => setSelectedSlot(slot.id)}
                          className={cn(
                            "p-3 rounded-xl border-2 transition-all text-left relative",
                            selectedSlot === slot.id
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/50"
                          )}
                        >
                          {slot.isExpress && (
                            <Zap className="absolute top-2 right-2 w-3 h-3 text-accent" />
                          )}
                          <div className="flex items-center gap-1 mb-0.5">
                            <Clock className="w-3 h-3 text-muted-foreground" />
                            <span className="text-sm font-semibold">{slot.time}</span>
                          </div>
                          <p className="text-xs text-muted-foreground">{slot.label}</p>
                          <p className="text-xs font-medium text-primary mt-1">
                            {slot.isExpress 
                              ? `₹${slot.price}` 
                              : (subtotal >= SMALL_ORDER_FREE_THRESHOLD ? 'FREE' : '₹30')
                            }
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Pickup Locations */}
                {deliveryType === 'pickup' && (
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground">Pickup from Kirana Partner</p>
                    {pickupLocations.map((location) => (
                      <button
                        key={location.id}
                        onClick={() => setSelectedPickup(location.id)}
                        className={cn(
                          "w-full p-3 rounded-xl border-2 transition-all text-left flex items-center gap-3",
                          selectedPickup === location.id
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        )}
                      >
                        <Store className="w-4 h-4 text-muted-foreground" />
                        <div className="flex-1">
                          <p className="text-sm font-semibold">{location.name}</p>
                          <p className="text-xs text-muted-foreground">{location.distance}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-medium text-green-600">{location.readyIn}</p>
                          <p className="text-xs text-muted-foreground">Free</p>
                        </div>
                        {selectedPickup === location.id && (
                          <CheckCircle2 className="w-4 h-4 text-primary" />
                        )}
                      </button>
                    ))}
                  </div>
                )}

                {/* Order Summary */}
                <div className="space-y-2 text-sm pt-2 border-t border-border">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>₹{subtotal.toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      {deliveryType === 'delivery' ? 'Delivery' : 'Pickup'}
                    </span>
                    <span className={deliveryFee === 0 ? 'text-green-600 font-medium' : ''}>
                      {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}
                    </span>
                  </div>
                  <div className="flex justify-between font-bold text-lg pt-2 border-t border-border">
                    <span>Total</span>
                    <span>₹{total.toFixed(0)}</span>
                  </div>
                </div>

                <Button 
                  className="w-full" 
                  size="lg"
                  disabled={(deliveryType === 'delivery' && !selectedSlot) || (deliveryType === 'pickup' && !selectedPickup)}
                  onClick={() => {
                    const cartItemsData = items.map(item => ({
                      productId: item.product.id,
                      name: item.product.name,
                      image: item.product.image,
                      unit: item.product.unit,
                      quantity: item.quantity,
                      unitPrice: item.product.bestPrice || item.product.priceRange.min,
                      totalPrice: (item.product.bestPrice || item.product.priceRange.min) * item.quantity,
                      storeName: item.product.bestStore || undefined,
                    }));
                    onClose();
                    navigate('/checkout', { state: { cartItems: cartItemsData, subtotal } });
                  }}
                >
                  Place Order
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default CartSidebar;

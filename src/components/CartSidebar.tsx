import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { ShoppingCart, X, Trash2, Plus, Minus, ArrowRight, Truck, Store, Clock, Zap, CheckCircle2, Package, MapPin, ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LiveProduct } from '@/hooks/useLivePrices';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

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

const SMALL_ORDER_FREE_THRESHOLD = 100;
const BULK_FREE_DELIVERY_THRESHOLD = 5000;

type CartStep = 'cart' | 'address' | 'delivery' | 'summary';

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (productId: string, delta: number) => void;
  onRemove: (productId: string) => void;
}

const CartSidebar = ({ isOpen, onClose, items, onUpdateQuantity, onRemove }: CartSidebarProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [step, setStep] = useState<CartStep>('cart');
  const [addresses, setAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({ full_name: '', phone: '', address_line1: '', address_line2: '', city: 'Bangalore', pincode: '' });
  const [deliveryType, setDeliveryType] = useState<'delivery' | 'pickup'>('delivery');
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [selectedPickup, setSelectedPickup] = useState<string | null>(null);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [orderConfirmed, setOrderConfirmed] = useState<{ orderNumber: string } | null>(null);
  const [loadingAddresses, setLoadingAddresses] = useState(false);

  const subtotal = items.reduce((sum, item) => {
    const price = item.product.bestPrice || item.product.priceRange.min;
    return sum + price * item.quantity;
  }, 0);
  const mrpTotal = items.reduce((sum, item) => sum + item.product.priceRange.max * item.quantity, 0);
  const savings = mrpTotal - subtotal;
  const isBulkOrder = subtotal >= BULK_FREE_DELIVERY_THRESHOLD;

  const selectedSlotData = deliverySlots.find(s => s.id === selectedSlot);
  const getDeliveryFee = () => {
    if (deliveryType === 'pickup') return 0;
    if (selectedSlotData?.isExpress) return selectedSlotData.price;
    if (subtotal >= SMALL_ORDER_FREE_THRESHOLD) return 0;
    return 30;
  };
  const deliveryFee = getDeliveryFee();
  const total = subtotal + deliveryFee;

  useEffect(() => {
    if (step === 'cart') {
      setOrderConfirmed(null);
    }
  }, [step]);

  const fetchAddresses = async () => {
    if (!user) return;
    setLoadingAddresses(true);
    const { data } = await supabase
      .from('delivery_addresses')
      .select('*')
      .eq('user_id', user.id)
      .order('is_default', { ascending: false });
    if (data) {
      setAddresses(data);
      const defaultAddr = data.find((a: any) => a.is_default);
      if (defaultAddr) setSelectedAddressId(defaultAddr.id);
      else if (data.length > 0) setSelectedAddressId(data[0].id);
      if (data.length === 0) setShowAddAddress(true);
    }
    setLoadingAddresses(false);
  };

  const handleAddAddress = async () => {
    if (!user) return;
    if (!newAddress.full_name || !newAddress.phone || !newAddress.address_line1 || !newAddress.pincode) {
      toast.error('Please fill all required fields');
      return;
    }
    const { data, error } = await supabase
      .from('delivery_addresses')
      .insert({ ...newAddress, user_id: user.id, is_default: addresses.length === 0, label: 'Home' })
      .select()
      .single();
    if (error) { toast.error('Failed to save address'); return; }
    setAddresses(prev => [...prev, data]);
    setSelectedAddressId(data.id);
    setShowAddAddress(false);
    setNewAddress({ full_name: '', phone: '', address_line1: '', address_line2: '', city: 'Bangalore', pincode: '' });
    toast.success('Address saved!');
  };

  const handleProceedToAddress = () => {
    if (!user) {
      toast.error('Please sign in to place an order');
      onClose();
      navigate('/auth');
      return;
    }
    fetchAddresses();
    setStep('address');
  };

  const placeOrder = async () => {
    if (!user) return;
    setIsPlacingOrder(true);
    try {
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([{
          user_id: user.id,
          order_number: 'TEMP',
          status: 'confirmed' as const,
          delivery_type: deliveryType as 'delivery' | 'pickup',
          delivery_address_id: deliveryType === 'delivery' ? selectedAddressId : null,
          delivery_slot: deliveryType === 'delivery' ? (selectedSlotData?.label + ' ' + selectedSlotData?.time) : null,
          pickup_location: deliveryType === 'pickup' ? pickupLocations.find(p => p.id === selectedPickup)?.name : null,
          subtotal,
          delivery_fee: deliveryFee,
          total,
          estimated_delivery: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
        }])
        .select()
        .single();

      if (orderError) throw orderError;

      const orderItems = items.map(item => ({
        order_id: order.id,
        user_id: user.id,
        product_id: item.product.id || null,
        product_name: item.product.name,
        product_image: item.product.image,
        quantity: item.quantity,
        unit: item.product.unit,
        unit_price: item.product.bestPrice || item.product.priceRange.min,
        total_price: (item.product.bestPrice || item.product.priceRange.min) * item.quantity,
        store_name: item.product.bestStore || null,
      }));

      const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
      if (itemsError) throw itemsError;

      setOrderConfirmed({ orderNumber: order.order_number });
      // Clear cart items
      items.forEach(item => onRemove(item.product.id));
      toast.success('Order placed successfully! 🎉');
    } catch (err: any) {
      toast.error('Failed to place order: ' + err.message);
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const selectedAddress = addresses.find(a => a.id === selectedAddressId);

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40" onClick={onClose} />

      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-card border-l border-border z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            {step !== 'cart' && !orderConfirmed && (
              <button onClick={() => {
                if (step === 'address') setStep('cart');
                else if (step === 'delivery') setStep('address');
                else if (step === 'summary') setStep('delivery');
              }} className="p-1.5 hover:bg-secondary rounded-lg transition-colors">
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <ShoppingCart className="w-5 h-5 text-primary" />
            <h2 className="font-display font-bold text-lg">
              {orderConfirmed ? 'Order Confirmed!' :
                step === 'cart' ? 'Your Cart' :
                step === 'address' ? 'Select Address' :
                step === 'delivery' ? 'Delivery Options' : 'Order Summary'}
            </h2>
            {step === 'cart' && (
              <span className="px-2 py-0.5 bg-primary/10 text-primary text-sm font-medium rounded-full">
                {items.reduce((sum, item) => sum + item.quantity, 0)}
              </span>
            )}
          </div>
          <button onClick={() => { onClose(); setStep('cart'); setOrderConfirmed(null); }} className="p-2 hover:bg-secondary rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Indicator */}
        {step !== 'cart' && !orderConfirmed && (
          <div className="px-4 py-2 border-b border-border">
            <div className="flex items-center gap-1">
              {(['address', 'delivery', 'summary'] as CartStep[]).map((s, i) => (
                <div key={s} className="flex items-center gap-1 flex-1">
                  <div className={cn("w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                    step === s ? "bg-primary text-primary-foreground" :
                    (['address', 'delivery', 'summary'].indexOf(step) > i) ? "bg-green-500 text-white" :
                    "bg-muted text-muted-foreground"
                  )}>{i + 1}</div>
                  <span className="text-xs capitalize hidden sm:inline">{s}</span>
                  {i < 2 && <div className="flex-1 h-0.5 bg-muted rounded" />}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {/* ORDER CONFIRMED */}
          {orderConfirmed && (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 mx-auto bg-green-500/10 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Order Placed!</h3>
                <p className="text-sm text-muted-foreground mt-1">Your order has been confirmed</p>
              </div>
              <div className="bg-muted/50 rounded-xl p-4">
                <p className="text-xs text-muted-foreground">Order Number</p>
                <p className="text-lg font-bold text-primary">{orderConfirmed.orderNumber}</p>
              </div>
              <div className="space-y-2">
                <Button className="w-full" onClick={() => { onClose(); setStep('cart'); setOrderConfirmed(null); navigate('/orders'); }}>
                  <Package className="w-4 h-4 mr-2" /> Track Order
                </Button>
                <Button variant="outline" className="w-full" onClick={() => { onClose(); setStep('cart'); setOrderConfirmed(null); }}>
                  Continue Shopping
                </Button>
              </div>
            </div>
          )}

          {/* STEP: CART */}
          {step === 'cart' && !orderConfirmed && (
            <>
              {items.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
                  <p className="text-muted-foreground">Your cart is empty</p>
                  <p className="text-sm text-muted-foreground/70">Add items to get started</p>
                </div>
              ) : (
                <>
                  {isBulkOrder && (
                    <div className="p-2 bg-green-500/10 rounded-lg">
                      <p className="text-xs text-green-600 font-medium flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" /> 🎉 Bulk Order - FREE delivery!
                      </p>
                    </div>
                  )}
                  {!isBulkOrder && (
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <p className="text-xs text-primary font-medium flex items-center gap-2">
                        <Package className="w-4 h-4" />
                        Add ₹{Math.round(BULK_FREE_DELIVERY_THRESHOLD - subtotal)} more for FREE bulk delivery
                      </p>
                    </div>
                  )}
                  {items.map((item) => (
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
                            <button onClick={() => onUpdateQuantity(item.product.id, -1)} className="p-1 bg-card border border-border rounded hover:bg-secondary transition-colors">
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="px-2 text-sm font-medium">{item.quantity}</span>
                            <button onClick={() => onUpdateQuantity(item.product.id, 1)} className="p-1 bg-card border border-border rounded hover:bg-secondary transition-colors">
                              <Plus className="w-3 h-3" />
                            </button>
                            <button onClick={() => onRemove(item.product.id)} className="p-1 ml-1 text-destructive hover:bg-destructive/10 rounded transition-colors">
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </>
          )}

          {/* STEP: ADDRESS */}
          {step === 'address' && !orderConfirmed && (
            <div className="space-y-3">
              <h3 className="font-semibold flex items-center gap-2"><MapPin className="w-4 h-4 text-primary" /> Delivery Address</h3>
              {loadingAddresses ? (
                <div className="flex items-center justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
              ) : (
                <>
                  {addresses.map((addr: any) => (
                    <button key={addr.id} onClick={() => setSelectedAddressId(addr.id)}
                      className={cn("w-full p-3 rounded-xl border-2 text-left transition-all",
                        selectedAddressId === addr.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/50")}>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold">{addr.label}</span>
                        {selectedAddressId === addr.id && <CheckCircle2 className="w-4 h-4 text-primary" />}
                      </div>
                      <p className="text-xs mt-1">{addr.full_name} • {addr.phone}</p>
                      <p className="text-xs text-muted-foreground">{addr.address_line1}, {addr.city} - {addr.pincode}</p>
                    </button>
                  ))}

                  {showAddAddress ? (
                    <div className="space-y-2 p-3 border border-border rounded-xl">
                      <p className="text-sm font-semibold">Add New Address</p>
                      <div className="grid grid-cols-2 gap-2">
                        <div><Label className="text-xs">Full Name</Label><Input className="h-8 text-sm" value={newAddress.full_name} onChange={e => setNewAddress(p => ({ ...p, full_name: e.target.value }))} placeholder="John Doe" /></div>
                        <div><Label className="text-xs">Phone</Label><Input className="h-8 text-sm" value={newAddress.phone} onChange={e => setNewAddress(p => ({ ...p, phone: e.target.value }))} placeholder="9876543210" /></div>
                      </div>
                      <div><Label className="text-xs">Address</Label><Input className="h-8 text-sm" value={newAddress.address_line1} onChange={e => setNewAddress(p => ({ ...p, address_line1: e.target.value }))} placeholder="House/Flat, Street" /></div>
                      <div className="grid grid-cols-2 gap-2">
                        <div><Label className="text-xs">City</Label><Input className="h-8 text-sm" value={newAddress.city} onChange={e => setNewAddress(p => ({ ...p, city: e.target.value }))} /></div>
                        <div><Label className="text-xs">Pincode</Label><Input className="h-8 text-sm" value={newAddress.pincode} onChange={e => setNewAddress(p => ({ ...p, pincode: e.target.value }))} placeholder="560001" maxLength={6} /></div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={handleAddAddress} className="flex-1">Save</Button>
                        <Button size="sm" variant="outline" onClick={() => setShowAddAddress(false)}>Cancel</Button>
                      </div>
                    </div>
                  ) : (
                    <Button variant="outline" size="sm" className="w-full" onClick={() => setShowAddAddress(true)}>
                      <Plus className="w-4 h-4 mr-1" /> Add New Address
                    </Button>
                  )}
                </>
              )}
            </div>
          )}

          {/* STEP: DELIVERY */}
          {step === 'delivery' && !orderConfirmed && (
            <div className="space-y-3">
              {/* Selected address preview */}
              {selectedAddress && deliveryType === 'delivery' && (
                <div className="p-3 bg-secondary/30 rounded-lg flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-primary mt-0.5" />
                  <div>
                    <p className="text-xs font-medium">{selectedAddress.full_name}</p>
                    <p className="text-xs text-muted-foreground">{selectedAddress.address_line1}, {selectedAddress.city}</p>
                  </div>
                  <button onClick={() => setStep('address')} className="ml-auto text-xs text-primary hover:underline">Change</button>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => setDeliveryType('delivery')}
                  className={cn("flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all text-sm font-medium",
                    deliveryType === 'delivery' ? "border-primary bg-primary/5 text-primary" : "border-border hover:border-primary/50")}>
                  <Truck className="w-4 h-4" /> Delivery
                </button>
                <button onClick={() => setDeliveryType('pickup')}
                  className={cn("flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all text-sm font-medium",
                    deliveryType === 'pickup' ? "border-primary bg-primary/5 text-primary" : "border-border hover:border-primary/50")}>
                  <Store className="w-4 h-4" /> Pickup
                </button>
              </div>

              {deliveryType === 'delivery' && (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">Select delivery slot</p>
                  <div className="grid grid-cols-2 gap-2">
                    {deliverySlots.map((slot) => (
                      <button key={slot.id} onClick={() => setSelectedSlot(slot.id)}
                        className={cn("p-3 rounded-xl border-2 transition-all text-left relative",
                          selectedSlot === slot.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/50")}>
                        {slot.isExpress && <Zap className="absolute top-2 right-2 w-3 h-3 text-accent" />}
                        <div className="flex items-center gap-1 mb-0.5">
                          <Clock className="w-3 h-3 text-muted-foreground" />
                          <span className="text-sm font-semibold">{slot.time}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{slot.label}</p>
                        <p className="text-xs font-medium text-primary mt-1">
                          {slot.isExpress ? `₹${slot.price}` : (subtotal >= SMALL_ORDER_FREE_THRESHOLD ? 'FREE' : '₹30')}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {deliveryType === 'pickup' && (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">Pickup from Kirana Partner</p>
                  {pickupLocations.map((location) => (
                    <button key={location.id} onClick={() => setSelectedPickup(location.id)}
                      className={cn("w-full p-3 rounded-xl border-2 transition-all text-left flex items-center gap-3",
                        selectedPickup === location.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/50")}>
                      <Store className="w-4 h-4 text-muted-foreground" />
                      <div className="flex-1">
                        <p className="text-sm font-semibold">{location.name}</p>
                        <p className="text-xs text-muted-foreground">{location.distance}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-medium text-green-600">{location.readyIn}</p>
                        <p className="text-xs text-muted-foreground">Free</p>
                      </div>
                      {selectedPickup === location.id && <CheckCircle2 className="w-4 h-4 text-primary" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* STEP: SUMMARY */}
          {step === 'summary' && !orderConfirmed && (
            <div className="space-y-3">
              <h3 className="font-semibold text-sm">Order Summary</h3>
              {/* Address/Pickup info */}
              {deliveryType === 'delivery' && selectedAddress && (
                <div className="p-3 bg-secondary/30 rounded-lg">
                  <p className="text-xs font-medium flex items-center gap-1"><MapPin className="w-3 h-3 text-primary" /> {selectedAddress.full_name}</p>
                  <p className="text-xs text-muted-foreground">{selectedAddress.address_line1}, {selectedAddress.city} - {selectedAddress.pincode}</p>
                  <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1"><Clock className="w-3 h-3" /> {selectedSlotData?.label} {selectedSlotData?.time}</p>
                </div>
              )}
              {deliveryType === 'pickup' && (
                <div className="p-3 bg-secondary/30 rounded-lg">
                  <p className="text-xs font-medium flex items-center gap-1"><Store className="w-3 h-3 text-primary" /> {pickupLocations.find(p => p.id === selectedPickup)?.name}</p>
                  <p className="text-xs text-muted-foreground">Ready in {pickupLocations.find(p => p.id === selectedPickup)?.readyIn}</p>
                </div>
              )}

              {/* Items */}
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.product.id} className="flex items-center gap-2 py-1.5 border-b border-border last:border-0">
                    <span className="text-xl">{item.product.image}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">{item.product.name}</p>
                      <p className="text-xs text-muted-foreground">{item.quantity} × ₹{(item.product.bestPrice || item.product.priceRange.min).toFixed(0)}</p>
                    </div>
                    <span className="text-sm font-semibold">₹{((item.product.bestPrice || item.product.priceRange.min) * item.quantity).toFixed(0)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {!orderConfirmed && items.length > 0 && (
          <div className="border-t border-border p-4 space-y-3">
            {savings > 0 && step === 'cart' && (
              <div className="flex items-center justify-between text-sm text-green-600 bg-green-500/10 p-2 rounded-lg">
                <span>You're saving</span>
                <span className="font-bold">₹{savings.toFixed(0)}</span>
              </div>
            )}

            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>₹{subtotal.toFixed(0)}</span>
              </div>
              {(step === 'delivery' || step === 'summary') && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{deliveryType === 'delivery' ? 'Delivery' : 'Pickup'}</span>
                  <span className={deliveryFee === 0 ? 'text-green-600 font-medium' : ''}>
                    {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}
                  </span>
                </div>
              )}
              <div className="flex justify-between font-bold text-base pt-1.5 border-t border-border">
                <span>Total</span>
                <span>₹{total.toFixed(0)}</span>
              </div>
            </div>

            {step === 'cart' && (
              <Button className="w-full" size="lg" onClick={handleProceedToAddress}>
                Proceed to Order <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
            {step === 'address' && (
              <Button className="w-full" size="lg" disabled={!selectedAddressId} onClick={() => setStep('delivery')}>
                Choose Delivery <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
            {step === 'delivery' && (
              <Button className="w-full" size="lg"
                disabled={(deliveryType === 'delivery' && !selectedSlot) || (deliveryType === 'pickup' && !selectedPickup)}
                onClick={() => setStep('summary')}>
                Review Order <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
            {step === 'summary' && (
              <Button className="w-full" size="lg" disabled={isPlacingOrder} onClick={placeOrder}>
                {isPlacingOrder ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Placing Order...</> : <>Place Order - ₹{total.toFixed(0)} <ArrowRight className="w-4 h-4 ml-2" /></>}
              </Button>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default CartSidebar;

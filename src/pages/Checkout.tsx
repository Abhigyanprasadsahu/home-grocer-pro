import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { ArrowLeft, MapPin, Plus, Truck, Store, Clock, Zap, CheckCircle2, CreditCard, ShieldCheck, Package } from 'lucide-react';
import { cn } from '@/lib/utils';
import { z } from 'zod';

const addressSchema = z.object({
  full_name: z.string().trim().min(2, 'Name is required').max(100),
  phone: z.string().trim().min(10, 'Valid phone required').max(15),
  address_line1: z.string().trim().min(5, 'Address is required').max(200),
  address_line2: z.string().max(200).optional(),
  city: z.string().trim().min(2).max(100),
  pincode: z.string().trim().min(6, 'Valid pincode required').max(6),
});

interface CartItemData {
  productId: string;
  name: string;
  image: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  storeName?: string;
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

type CheckoutStep = 'address' | 'delivery' | 'payment' | 'confirmation';

const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading } = useAuth();

  const cartItems: CartItemData[] = location.state?.cartItems || [];
  const subtotal: number = location.state?.subtotal || 0;

  const [step, setStep] = useState<CheckoutStep>('address');
  const [addresses, setAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({ full_name: '', phone: '', address_line1: '', address_line2: '', city: 'Bangalore', pincode: '' });
  const [deliveryType, setDeliveryType] = useState<'delivery' | 'pickup'>('delivery');
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [selectedPickup, setSelectedPickup] = useState<string | null>(null);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [orderResult, setOrderResult] = useState<{ orderNumber: string; orderId: string } | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
      return;
    }
    if (cartItems.length === 0 && !orderResult) {
      navigate('/');
      return;
    }
    if (user) fetchAddresses();
  }, [user, loading]);

  const fetchAddresses = async () => {
    const { data } = await supabase
      .from('delivery_addresses')
      .select('*')
      .eq('user_id', user!.id)
      .order('is_default', { ascending: false });
    if (data) {
      setAddresses(data);
      const defaultAddr = data.find((a: any) => a.is_default);
      if (defaultAddr) setSelectedAddressId(defaultAddr.id);
      else if (data.length > 0) setSelectedAddressId(data[0].id);
      if (data.length === 0) setShowAddAddress(true);
    }
  };

  const handleAddAddress = async () => {
    const result = addressSchema.safeParse(newAddress);
    if (!result.success) {
      toast.error(result.error.errors[0].message);
      return;
    }
    const { data, error } = await supabase
      .from('delivery_addresses')
      .insert({ ...newAddress, user_id: user!.id, is_default: addresses.length === 0, label: 'Home' })
      .select()
      .single();
    if (error) { toast.error('Failed to save address'); return; }
    setAddresses(prev => [...prev, data]);
    setSelectedAddressId(data.id);
    setShowAddAddress(false);
    setNewAddress({ full_name: '', phone: '', address_line1: '', address_line2: '', city: 'Bangalore', pincode: '' });
    toast.success('Address saved!');
  };

  const selectedSlotData = deliverySlots.find(s => s.id === selectedSlot);
  const getDeliveryFee = () => {
    if (deliveryType === 'pickup') return 0;
    if (selectedSlotData?.isExpress) return selectedSlotData.price;
    if (subtotal >= 100) return 0;
    return 30;
  };
  const deliveryFee = getDeliveryFee();
  const total = subtotal + deliveryFee;

  const placeOrder = async () => {
    if (!user) return;
    setIsPlacingOrder(true);
    try {
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([{
          user_id: user.id,
          order_number: 'TEMP', // trigger replaces this
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

      const orderItems = cartItems.map(item => ({
        order_id: order.id,
        user_id: user.id,
        product_id: item.productId || null,
        product_name: item.name,
        product_image: item.image,
        quantity: item.quantity,
        unit: item.unit,
        unit_price: item.unitPrice,
        total_price: item.totalPrice,
        store_name: item.storeName || null,
      }));

      const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
      if (itemsError) throw itemsError;

      setOrderResult({ orderNumber: order.order_number, orderId: order.id });
      setStep('confirmation');
      toast.success('Order placed successfully! 🎉');
    } catch (err: any) {
      toast.error('Failed to place order: ' + err.message);
    } finally {
      setIsPlacingOrder(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;

  if (step === 'confirmation' && orderResult) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <CardContent className="p-8 space-y-6">
            <div className="w-20 h-20 mx-auto bg-green-500/10 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">Order Confirmed!</h2>
              <p className="text-muted-foreground mt-2">Your order has been placed successfully</p>
            </div>
            <div className="bg-muted/50 rounded-xl p-4 space-y-2">
              <p className="text-sm text-muted-foreground">Order Number</p>
              <p className="text-xl font-bold text-primary">{orderResult.orderNumber}</p>
              <p className="text-sm text-muted-foreground">Total: ₹{total.toFixed(0)}</p>
            </div>
            <div className="space-y-3">
              <Button className="w-full" onClick={() => navigate('/orders')}>
                <Package className="w-4 h-4 mr-2" />
                Track Order
              </Button>
              <Button variant="outline" className="w-full" onClick={() => navigate('/')}>
                Continue Shopping
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-secondary rounded-lg"><ArrowLeft className="w-5 h-5" /></button>
          <h1 className="text-xl font-bold">Checkout</h1>
          <div className="ml-auto flex items-center gap-1 text-xs text-muted-foreground">
            <ShieldCheck className="w-4 h-4 text-green-600" />
            Secure Checkout
          </div>
        </div>
        {/* Steps */}
        <div className="max-w-3xl mx-auto px-4 pb-3">
          <div className="flex items-center gap-2">
            {(['address', 'delivery', 'payment'] as CheckoutStep[]).map((s, i) => (
              <div key={s} className="flex items-center gap-2 flex-1">
                <div className={cn("w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold",
                  step === s ? "bg-primary text-primary-foreground" :
                  (['address', 'delivery', 'payment'].indexOf(step) > i) ? "bg-green-500 text-white" :
                  "bg-muted text-muted-foreground"
                )}>{i + 1}</div>
                <span className="text-xs font-medium capitalize hidden sm:inline">{s}</span>
                {i < 2 && <div className="flex-1 h-0.5 bg-muted rounded" />}
              </div>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {/* STEP 1: Address */}
        {step === 'address' && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold flex items-center gap-2"><MapPin className="w-5 h-5 text-primary" />Delivery Address</h2>
            {addresses.map((addr: any) => (
              <button key={addr.id} onClick={() => setSelectedAddressId(addr.id)}
                className={cn("w-full p-4 rounded-xl border-2 text-left transition-all",
                  selectedAddressId === addr.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/50")}>
                <div className="flex items-center justify-between">
                  <span className="font-semibold">{addr.label}</span>
                  {selectedAddressId === addr.id && <CheckCircle2 className="w-5 h-5 text-primary" />}
                </div>
                <p className="text-sm mt-1">{addr.full_name} • {addr.phone}</p>
                <p className="text-sm text-muted-foreground">{addr.address_line1}, {addr.city} - {addr.pincode}</p>
              </button>
            ))}
            {showAddAddress ? (
              <Card>
                <CardHeader><CardTitle className="text-base">Add New Address</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label>Full Name</Label><Input value={newAddress.full_name} onChange={e => setNewAddress(p => ({ ...p, full_name: e.target.value }))} placeholder="John Doe" /></div>
                    <div><Label>Phone</Label><Input value={newAddress.phone} onChange={e => setNewAddress(p => ({ ...p, phone: e.target.value }))} placeholder="9876543210" /></div>
                  </div>
                  <div><Label>Address Line 1</Label><Input value={newAddress.address_line1} onChange={e => setNewAddress(p => ({ ...p, address_line1: e.target.value }))} placeholder="House/Flat, Street" /></div>
                  <div><Label>Address Line 2 (Optional)</Label><Input value={newAddress.address_line2} onChange={e => setNewAddress(p => ({ ...p, address_line2: e.target.value }))} placeholder="Landmark" /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label>City</Label><Input value={newAddress.city} onChange={e => setNewAddress(p => ({ ...p, city: e.target.value }))} /></div>
                    <div><Label>Pincode</Label><Input value={newAddress.pincode} onChange={e => setNewAddress(p => ({ ...p, pincode: e.target.value }))} placeholder="560001" maxLength={6} /></div>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleAddAddress} className="flex-1">Save Address</Button>
                    <Button variant="outline" onClick={() => setShowAddAddress(false)}>Cancel</Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Button variant="outline" className="w-full" onClick={() => setShowAddAddress(true)}>
                <Plus className="w-4 h-4 mr-2" />Add New Address
              </Button>
            )}
            <Button className="w-full" size="lg" disabled={!selectedAddressId} onClick={() => setStep('delivery')}>
              Continue to Delivery
            </Button>
          </div>
        )}

        {/* STEP 2: Delivery */}
        {step === 'delivery' && (
          <div className="space-y-4">
            <button onClick={() => setStep('address')} className="text-sm text-primary hover:underline">← Change address</button>
            <h2 className="text-lg font-bold flex items-center gap-2"><Truck className="w-5 h-5 text-primary" />Delivery Method</h2>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => setDeliveryType('delivery')}
                className={cn("p-4 rounded-xl border-2 transition-all flex items-center justify-center gap-2 font-medium",
                  deliveryType === 'delivery' ? "border-primary bg-primary/5 text-primary" : "border-border")}>
                <Truck className="w-5 h-5" />Home Delivery
              </button>
              <button onClick={() => setDeliveryType('pickup')}
                className={cn("p-4 rounded-xl border-2 transition-all flex items-center justify-center gap-2 font-medium",
                  deliveryType === 'pickup' ? "border-primary bg-primary/5 text-primary" : "border-border")}>
                <Store className="w-5 h-5" />Store Pickup
              </button>
            </div>
            {deliveryType === 'delivery' && (
              <div className="grid grid-cols-2 gap-3">
                {deliverySlots.map(slot => (
                  <button key={slot.id} onClick={() => setSelectedSlot(slot.id)}
                    className={cn("p-4 rounded-xl border-2 text-left relative transition-all",
                      selectedSlot === slot.id ? "border-primary bg-primary/5" : "border-border")}>
                    {slot.isExpress && <Zap className="absolute top-2 right-2 w-4 h-4 text-accent" />}
                    <div className="flex items-center gap-1.5 mb-1"><Clock className="w-4 h-4 text-muted-foreground" /><span className="font-semibold">{slot.time}</span></div>
                    <p className="text-sm text-muted-foreground">{slot.label}</p>
                    <p className="text-sm font-medium text-primary mt-1">{slot.isExpress ? `₹${slot.price}` : (subtotal >= 100 ? 'FREE' : '₹30')}</p>
                  </button>
                ))}
              </div>
            )}
            {deliveryType === 'pickup' && (
              <div className="space-y-3">
                {pickupLocations.map(loc => (
                  <button key={loc.id} onClick={() => setSelectedPickup(loc.id)}
                    className={cn("w-full p-4 rounded-xl border-2 text-left flex items-center gap-3 transition-all",
                      selectedPickup === loc.id ? "border-primary bg-primary/5" : "border-border")}>
                    <Store className="w-5 h-5 text-muted-foreground" />
                    <div className="flex-1"><p className="font-semibold">{loc.name}</p><p className="text-xs text-muted-foreground">{loc.distance}</p></div>
                    <div className="text-right"><p className="text-xs font-medium text-green-600">{loc.readyIn}</p><p className="text-xs text-muted-foreground">Free</p></div>
                    {selectedPickup === loc.id && <CheckCircle2 className="w-5 h-5 text-primary" />}
                  </button>
                ))}
              </div>
            )}
            <Button className="w-full" size="lg"
              disabled={(deliveryType === 'delivery' && !selectedSlot) || (deliveryType === 'pickup' && !selectedPickup)}
              onClick={() => setStep('payment')}>
              Continue to Payment
            </Button>
          </div>
        )}

        {/* STEP 3: Payment & Order Summary */}
        {step === 'payment' && (
          <div className="space-y-4">
            <button onClick={() => setStep('delivery')} className="text-sm text-primary hover:underline">← Change delivery</button>
            <h2 className="text-lg font-bold flex items-center gap-2"><CreditCard className="w-5 h-5 text-primary" />Order Summary</h2>
            <Card>
              <CardContent className="p-4 space-y-3">
                {cartItems.map((item, i) => (
                  <div key={i} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
                    <span className="text-2xl">{item.image}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.name}</p>
                      <p className="text-xs text-muted-foreground">{item.quantity} × ₹{item.unitPrice.toFixed(0)}</p>
                    </div>
                    <span className="font-semibold">₹{item.totalPrice.toFixed(0)}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>₹{subtotal.toFixed(0)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Delivery Fee</span>
                  <span className={deliveryFee === 0 ? 'text-green-600 font-medium' : ''}>{deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}</span></div>
                <div className="flex justify-between font-bold text-lg pt-2 border-t border-border"><span>Total</span><span className="text-primary">₹{total.toFixed(0)}</span></div>
              </CardContent>
            </Card>
            {/* COD / Payment */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3 p-3 bg-green-500/10 rounded-xl border border-green-500/20">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="font-medium text-sm">Cash on Delivery</p>
                    <p className="text-xs text-muted-foreground">Pay when you receive your order</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Button className="w-full" size="lg" onClick={placeOrder} disabled={isPlacingOrder}>
              {isPlacingOrder ? 'Placing Order...' : `Place Order • ₹${total.toFixed(0)}`}
            </Button>
          </div>
        )}
      </main>
    </div>
  );
};

export default Checkout;

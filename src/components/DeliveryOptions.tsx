import { useState } from 'react';
import { Truck, Store, Clock, MapPin, CheckCircle2, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface DeliverySlot {
  id: string;
  time: string;
  label: string;
  price: number;
  isExpress?: boolean;
}

interface DeliveryOptionsProps {
  subtotal: number;
  onDeliverySelect: (option: { type: 'delivery' | 'pickup'; slot?: DeliverySlot; address?: string }) => void;
}

const deliverySlots: DeliverySlot[] = [
  { id: '1', time: '2-4 PM', label: 'Today', price: 0, isExpress: false },
  { id: '2', time: '6-8 PM', label: 'Today', price: 0, isExpress: false },
  { id: '3', time: '9-11 AM', label: 'Tomorrow', price: 0, isExpress: false },
  { id: '4', time: '30 min', label: 'Express', price: 49, isExpress: true },
];

const pickupLocations = [
  { id: 'p1', name: 'D-Mart Koramangala', distance: '1.2 km', readyIn: '45 min' },
  { id: 'p2', name: 'BigBasket Hub HSR', distance: '2.5 km', readyIn: '30 min' },
  { id: 'p3', name: 'Zepto Dark Store', distance: '0.8 km', readyIn: '15 min' },
];

const DeliveryOptions = ({ subtotal, onDeliverySelect }: DeliveryOptionsProps) => {
  const [selectedType, setSelectedType] = useState<'delivery' | 'pickup'>('delivery');
  const [selectedSlot, setSelectedSlot] = useState<DeliverySlot | null>(null);
  const [selectedPickup, setSelectedPickup] = useState<string | null>(null);

  const freeDeliveryThreshold = 500;
  const isFreeDelivery = subtotal >= freeDeliveryThreshold;

  const handleConfirm = () => {
    if (selectedType === 'delivery' && selectedSlot) {
      onDeliverySelect({ type: 'delivery', slot: selectedSlot });
    } else if (selectedType === 'pickup' && selectedPickup) {
      onDeliverySelect({ type: 'pickup', address: selectedPickup });
    }
  };

  return (
    <div className="bg-card rounded-2xl border border-border p-6 space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-primary/10">
          <Truck className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="font-display font-bold text-lg">Delivery Options</h3>
          <p className="text-sm text-muted-foreground">Choose how you want your groceries</p>
        </div>
      </div>

      {/* Delivery Type Toggle */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => setSelectedType('delivery')}
          className={cn(
            "flex items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all",
            selectedType === 'delivery'
              ? "border-primary bg-primary/5 text-primary"
              : "border-border hover:border-primary/50"
          )}
        >
          <Truck className="w-5 h-5" />
          <span className="font-semibold">Home Delivery</span>
        </button>
        <button
          onClick={() => setSelectedType('pickup')}
          className={cn(
            "flex items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all",
            selectedType === 'pickup'
              ? "border-primary bg-primary/5 text-primary"
              : "border-border hover:border-primary/50"
          )}
        >
          <Store className="w-5 h-5" />
          <span className="font-semibold">Store Pickup</span>
        </button>
      </div>

      {/* Delivery Content */}
      {selectedType === 'delivery' && (
        <div className="space-y-4">
          {/* Free Delivery Progress */}
          {!isFreeDelivery && (
            <div className="bg-accent/10 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-accent">Add ₹{freeDeliveryThreshold - subtotal} for FREE delivery</span>
                <span className="text-xs text-muted-foreground">₹{subtotal}/₹{freeDeliveryThreshold}</span>
              </div>
              <div className="h-2 bg-background rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-primary to-accent transition-all"
                  style={{ width: `${Math.min((subtotal / freeDeliveryThreshold) * 100, 100)}%` }}
                />
              </div>
            </div>
          )}

          {/* Delivery Address */}
          <div className="flex items-center gap-3 p-3 bg-secondary/30 rounded-xl">
            <MapPin className="w-5 h-5 text-primary" />
            <div className="flex-1">
              <p className="text-sm font-medium">Delivering to</p>
              <p className="text-xs text-muted-foreground">123 Main Street, Koramangala, Bangalore</p>
            </div>
            <Button variant="ghost" size="sm" className="text-primary">Change</Button>
          </div>

          {/* Delivery Slots */}
          <div className="space-y-2">
            <p className="text-sm font-medium">Select delivery slot</p>
            <div className="grid grid-cols-2 gap-3">
              {deliverySlots.map((slot) => (
                <button
                  key={slot.id}
                  onClick={() => setSelectedSlot(slot)}
                  className={cn(
                    "p-4 rounded-xl border-2 transition-all text-left relative",
                    selectedSlot?.id === slot.id
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  )}
                >
                  {slot.isExpress && (
                    <span className="absolute top-2 right-2 px-2 py-0.5 bg-accent text-accent-foreground text-xs font-bold rounded-full flex items-center gap-1">
                      <Zap className="w-3 h-3" /> Express
                    </span>
                  )}
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span className="font-semibold">{slot.time}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{slot.label}</p>
                  <p className="text-sm font-medium text-primary mt-1">
                    {slot.price === 0 && isFreeDelivery ? 'FREE' : slot.price === 0 ? '₹30' : `₹${slot.price}`}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Pickup Content */}
      {selectedType === 'pickup' && (
        <div className="space-y-3">
          <p className="text-sm font-medium">Nearby pickup locations</p>
          {pickupLocations.map((location) => (
            <button
              key={location.id}
              onClick={() => setSelectedPickup(location.id)}
              className={cn(
                "w-full p-4 rounded-xl border-2 transition-all text-left flex items-center gap-4",
                selectedPickup === location.id
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              )}
            >
              <div className="p-2.5 rounded-lg bg-secondary">
                <Store className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <p className="font-semibold">{location.name}</p>
                <p className="text-sm text-muted-foreground">{location.distance} away</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-green-600">Ready in {location.readyIn}</p>
                <p className="text-xs text-muted-foreground">No delivery fee</p>
              </div>
              {selectedPickup === location.id && (
                <CheckCircle2 className="w-5 h-5 text-primary" />
              )}
            </button>
          ))}
        </div>
      )}

      {/* Confirm Button */}
      <Button 
        className="w-full" 
        size="lg"
        disabled={(selectedType === 'delivery' && !selectedSlot) || (selectedType === 'pickup' && !selectedPickup)}
        onClick={handleConfirm}
      >
        {selectedType === 'delivery' ? 'Confirm Delivery Slot' : 'Confirm Pickup Location'}
      </Button>
    </div>
  );
};

export default DeliveryOptions;

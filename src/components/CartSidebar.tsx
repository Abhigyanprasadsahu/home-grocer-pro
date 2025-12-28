import { ShoppingCart, X, Trash2, Plus, Minus, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LiveProduct } from '@/hooks/useLivePrices';

interface CartItem {
  product: LiveProduct;
  quantity: number;
}

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (productId: string, delta: number) => void;
  onRemove: (productId: string) => void;
}

const CartSidebar = ({ isOpen, onClose, items, onUpdateQuantity, onRemove }: CartSidebarProps) => {
  const subtotal = items.reduce((sum, item) => {
    const price = item.product.bestPrice || item.product.priceRange.min;
    return sum + price * item.quantity;
  }, 0);
  const mrpTotal = items.reduce((sum, item) => sum + item.product.priceRange.max * item.quantity, 0);
  const savings = mrpTotal - subtotal;
  const deliveryFee = subtotal > 500 ? 0 : 30;
  const total = subtotal + deliveryFee;

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
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>₹{subtotal.toFixed(0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Delivery</span>
                <span className={deliveryFee === 0 ? 'text-green-600' : ''}>
                  {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}
                </span>
              </div>
              {deliveryFee > 0 && (
                <p className="text-xs text-muted-foreground">
                  Add ₹{(500 - subtotal).toFixed(0)} more for free delivery
                </p>
              )}
            </div>
            <div className="flex justify-between font-bold text-lg pt-2 border-t border-border">
              <span>Total</span>
              <span>₹{total.toFixed(0)}</span>
            </div>
            <Button className="w-full" size="lg">
              Proceed to Checkout
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}
      </div>
    </>
  );
};

export default CartSidebar;

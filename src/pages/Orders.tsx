import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Package, Truck, CheckCircle2, Clock, MapPin, ShoppingBag } from 'lucide-react';
import { cn } from '@/lib/utils';

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  pending: { label: 'Pending', color: 'text-amber-600 bg-amber-500/10', icon: Clock },
  confirmed: { label: 'Confirmed', color: 'text-blue-600 bg-blue-500/10', icon: CheckCircle2 },
  preparing: { label: 'Preparing', color: 'text-purple-600 bg-purple-500/10', icon: Package },
  out_for_delivery: { label: 'Out for Delivery', color: 'text-primary bg-primary/10', icon: Truck },
  delivered: { label: 'Delivered', color: 'text-green-600 bg-green-500/10', icon: CheckCircle2 },
  cancelled: { label: 'Cancelled', color: 'text-destructive bg-destructive/10', icon: Clock },
};

const Orders = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [orderItems, setOrderItems] = useState<Record<string, any[]>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) { navigate('/auth'); return; }
    if (user) fetchOrders();
  }, [user, loading]);

  const fetchOrders = async () => {
    const { data } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false });
    if (data) {
      setOrders(data);
      // Fetch items for all orders
      const { data: items } = await supabase
        .from('order_items')
        .select('*')
        .in('order_id', data.map(o => o.id));
      if (items) {
        const grouped: Record<string, any[]> = {};
        items.forEach(item => {
          if (!grouped[item.order_id]) grouped[item.order_id] = [];
          grouped[item.order_id].push(item);
        });
        setOrderItems(grouped);
      }
    }
    setIsLoading(false);
  };

  if (loading || isLoading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-4">
          <button onClick={() => navigate('/')} className="p-2 hover:bg-secondary rounded-lg"><ArrowLeft className="w-5 h-5" /></button>
          <h1 className="text-xl font-bold">My Orders</h1>
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-4 py-6 space-y-4">
        {orders.length === 0 ? (
          <div className="text-center py-16">
            <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
            <h3 className="text-lg font-semibold">No orders yet</h3>
            <p className="text-muted-foreground mt-1">Start shopping to see your orders here</p>
            <Button className="mt-4" onClick={() => navigate('/')}>Browse Products</Button>
          </div>
        ) : (
          orders.map(order => {
            const config = statusConfig[order.status] || statusConfig.pending;
            const StatusIcon = config.icon;
            const items = orderItems[order.id] || [];
            return (
              <Card key={order.id} className="overflow-hidden">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-primary">{order.order_number}</p>
                      <p className="text-xs text-muted-foreground">{new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                    <div className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold", config.color)}>
                      <StatusIcon className="w-3.5 h-3.5" />
                      {config.label}
                    </div>
                  </div>
                  {/* Items preview */}
                  <div className="flex items-center gap-2 overflow-x-auto py-1">
                    {items.slice(0, 5).map((item: any) => (
                      <div key={item.id} className="flex-shrink-0 w-10 h-10 bg-muted rounded-lg flex items-center justify-center text-lg" title={item.product_name}>
                        {item.product_image || '📦'}
                      </div>
                    ))}
                    {items.length > 5 && <span className="text-xs text-muted-foreground ml-1">+{items.length - 5} more</span>}
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-border">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      {order.delivery_type === 'delivery' ? <Truck className="w-4 h-4" /> : <MapPin className="w-4 h-4" />}
                      <span>{order.delivery_type === 'delivery' ? order.delivery_slot : order.pickup_location}</span>
                    </div>
                    <span className="font-bold">₹{Number(order.total).toFixed(0)}</span>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </main>
    </div>
  );
};

export default Orders;

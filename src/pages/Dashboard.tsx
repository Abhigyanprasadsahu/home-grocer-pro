import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { 
  Leaf, LogOut, ShoppingCart, TrendingDown, Apple, Calendar,
  Plus, Sparkles, ChevronRight, Edit3, Trash2, Check, Home
} from 'lucide-react';
import AIGroceryPlanner from '@/components/AIGroceryPlanner';

interface Household {
  id: string;
  name: string;
  family_size: number;
  monthly_budget: number;
  diet_preferences: string[];
}

interface GroceryList {
  id: string;
  name: string;
  month: number;
  year: number;
  status: string;
  total_cost: number;
  estimated_savings: number;
  nutrition_score: number;
  ai_generated: boolean;
}

interface GroceryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  estimated_price: number;
  is_purchased: boolean;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, loading, signOut } = useAuth();
  const [household, setHousehold] = useState<Household | null>(null);
  const [groceryLists, setGroceryLists] = useState<GroceryList[]>([]);
  const [activeList, setActiveList] = useState<GroceryList | null>(null);
  const [groceryItems, setGroceryItems] = useState<GroceryItem[]>([]);
  const [showPlanner, setShowPlanner] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
      return;
    }
    if (user) {
      fetchData();
    }
  }, [user, loading, navigate]);

  const fetchData = async () => {
    if (!user) return;
    
    try {
      // Check onboarding status
      const { data: profile } = await supabase
        .from('profiles')
        .select('onboarding_completed')
        .eq('id', user.id)
        .maybeSingle();

      if (!profile?.onboarding_completed) {
        navigate('/onboarding');
        return;
      }

      // Fetch household
      const { data: householdData } = await supabase
        .from('households')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (householdData) {
        setHousehold(householdData);
      }

      // Fetch grocery lists
      const { data: listsData } = await supabase
        .from('grocery_lists')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (listsData) {
        setGroceryLists(listsData);
        if (listsData.length > 0) {
          setActiveList(listsData[0]);
          fetchItems(listsData[0].id);
        }
      }
    } catch (error: any) {
      toast.error('Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchItems = async (listId: string) => {
    const { data } = await supabase
      .from('grocery_items')
      .select('*')
      .eq('list_id', listId)
      .order('category', { ascending: true });

    if (data) {
      setGroceryItems(data);
    }
  };

  const toggleItemPurchased = async (itemId: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('grocery_items')
      .update({ is_purchased: !currentStatus })
      .eq('id', itemId);

    if (!error) {
      setGroceryItems(prev => 
        prev.map(item => 
          item.id === itemId ? { ...item, is_purchased: !currentStatus } : item
        )
      );
    }
  };

  const deleteItem = async (itemId: string) => {
    const { error } = await supabase
      .from('grocery_items')
      .delete()
      .eq('id', itemId);

    if (!error) {
      setGroceryItems(prev => prev.filter(item => item.id !== itemId));
      toast.success('Item removed');
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handlePlanGenerated = () => {
    setShowPlanner(false);
    fetchData();
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const totalCost = groceryItems.reduce((sum, item) => sum + (item.estimated_price || 0), 0);
  const purchasedItems = groceryItems.filter(item => item.is_purchased).length;
  const progressPercent = groceryItems.length > 0 ? (purchasedItems / groceryItems.length) * 100 : 0;

  // Group items by category
  const itemsByCategory = groceryItems.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, GroceryItem[]>);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="p-2 hover:bg-secondary rounded-lg transition-colors" title="Back to Home">
              <Home className="w-5 h-5 text-muted-foreground hover:text-primary" />
            </Link>
            <div className="w-10 h-10 rounded-xl gradient-hero flex items-center justify-center">
              <Leaf className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-display font-bold text-foreground">FLASH KART</h1>
              <p className="text-xs text-muted-foreground">{household?.name || 'Dashboard'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate('/')}>
              <ShoppingCart className="w-4 h-4 mr-2" />
              Shop
            </Button>
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="shadow-card">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-primary/10">
                <ShoppingCart className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">This Month</p>
                <p className="text-2xl font-bold">₹{totalCost.toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-card">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-green-500/10">
                <TrendingDown className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Savings</p>
                <p className="text-2xl font-bold">₹{activeList?.estimated_savings?.toLocaleString() || 0}</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-card">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-accent/10">
                <Apple className="w-6 h-6 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Nutrition Score</p>
                <p className="text-2xl font-bold">{activeList?.nutrition_score || 0}/100</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-card">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-blue-500/10">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Budget Left</p>
                <p className="text-2xl font-bold">₹{((household?.monthly_budget || 0) - totalCost).toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Progress Bar */}
        {groceryItems.length > 0 && (
          <Card className="shadow-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Shopping Progress</span>
                <span className="text-sm text-muted-foreground">{purchasedItems}/{groceryItems.length} items</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full gradient-hero transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Grocery List */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-display font-bold">
                {activeList?.name || 'Your Grocery List'}
              </h2>
              <Button variant="hero" onClick={() => setShowPlanner(true)}>
                <Sparkles className="w-4 h-4 mr-2" />
                AI Planner
              </Button>
            </div>

            {groceryItems.length === 0 ? (
              <Card className="shadow-card">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                    <ShoppingCart className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">No grocery list yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Use our AI planner to create a personalized grocery list
                  </p>
                  <Button variant="hero" onClick={() => setShowPlanner(true)}>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate with AI
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {Object.entries(itemsByCategory).map(([category, items]) => (
                  <Card key={category} className="shadow-card">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                        {category}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {items.map(item => (
                        <div 
                          key={item.id}
                          className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                            item.is_purchased ? 'bg-primary/5' : 'bg-muted/50 hover:bg-muted'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => toggleItemPurchased(item.id, item.is_purchased)}
                              className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                                item.is_purchased
                                  ? 'bg-primary border-primary'
                                  : 'border-muted-foreground hover:border-primary'
                              }`}
                            >
                              {item.is_purchased && <Check className="w-4 h-4 text-primary-foreground" />}
                            </button>
                            <div>
                              <p className={`font-medium ${item.is_purchased ? 'line-through text-muted-foreground' : ''}`}>
                                {item.name}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {item.quantity} {item.unit}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-medium">₹{item.estimated_price?.toLocaleString()}</span>
                            <button
                              onClick={() => deleteItem(item.id)}
                              className="p-1 hover:text-destructive transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start" onClick={() => setShowPlanner(true)}>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate New Plan
                  <ChevronRight className="w-4 h-4 ml-auto" />
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Item Manually
                  <ChevronRight className="w-4 h-4 ml-auto" />
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Edit3 className="w-4 h-4 mr-2" />
                  Edit Household
                  <ChevronRight className="w-4 h-4 ml-auto" />
                </Button>
              </CardContent>
            </Card>

            {household && (
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="text-lg">Household Info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Family Size</span>
                    <span className="font-medium">{household.family_size} members</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Monthly Budget</span>
                    <span className="font-medium">₹{household.monthly_budget?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Diet</span>
                    <span className="font-medium capitalize">
                      {household.diet_preferences?.join(', ').replace(/_/g, ' ')}
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>

      {/* AI Planner Modal */}
      {showPlanner && household && (
        <AIGroceryPlanner
          household={household}
          onClose={() => setShowPlanner(false)}
          onPlanGenerated={handlePlanGenerated}
        />
      )}
    </div>
  );
};

export default Dashboard;

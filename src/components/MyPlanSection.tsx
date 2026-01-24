import { useState, useEffect } from 'react';
import { 
  CalendarDays, Users, IndianRupee, Salad, ChevronRight, 
  Sparkles, TrendingUp, ShoppingBag, Settings, LogIn, Plus,
  Leaf, Baby, User, UserCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface Household {
  id: string;
  name: string;
  family_size: number;
  adults: number;
  children: number;
  elderly: number;
  monthly_budget: number;
  diet_preferences: string[];
  special_requirements?: string;
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

interface MyPlanSectionProps {
  onOpenPlanner: () => void;
}

const MyPlanSection = ({ onOpenPlanner }: MyPlanSectionProps) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [household, setHousehold] = useState<Household | null>(null);
  const [groceryLists, setGroceryLists] = useState<GroceryList[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUserData();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  const fetchUserData = async () => {
    if (!user) return;
    
    try {
      // Fetch household
      const { data: householdData } = await supabase
        .from('households')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (householdData) {
        setHousehold({
          id: householdData.id,
          name: householdData.name,
          family_size: householdData.family_size,
          adults: householdData.adults,
          children: householdData.children,
          elderly: householdData.elderly,
          monthly_budget: householdData.monthly_budget || 5000,
          diet_preferences: householdData.diet_preferences || [],
          special_requirements: householdData.special_requirements || undefined,
        });
      }

      // Fetch grocery lists
      const { data: listsData } = await supabase
        .from('grocery_lists')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(3);

      if (listsData) {
        setGroceryLists(listsData);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getMonthName = (month: number) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[month - 1] || 'Unknown';
  };

  // Not logged in state
  if (!loading && !user) {
    return (
      <section className="py-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/5 via-accent/5 to-primary/10 border border-primary/20 p-6 sm:p-8">
          {/* Background decorations */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-accent/10 rounded-full blur-2xl" />
          
          <div className="relative z-10 flex flex-col lg:flex-row items-center gap-6 lg:gap-10">
            {/* Icon */}
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/30 shrink-0">
              <CalendarDays className="w-10 h-10 text-primary-foreground" />
            </div>
            
            {/* Content */}
            <div className="flex-1 text-center lg:text-left">
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-2">
                Your Personal Grocery Planner
              </h2>
              <p className="text-muted-foreground max-w-lg mb-4">
                Login to create AI-powered monthly grocery plans based on your family size, budget, and dietary preferences.
              </p>
              
              <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
                <Button 
                  variant="hero" 
                  size="lg" 
                  className="gap-2"
                  onClick={() => navigate('/auth')}
                >
                  <LogIn className="w-5 h-5" />
                  Login to Plan
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  onClick={() => navigate('/onboarding')}
                >
                  Get Started Free
                </Button>
              </div>
            </div>
            
            {/* Features preview */}
            <div className="hidden xl:flex flex-col gap-3">
              {[
                { icon: Sparkles, text: 'AI-Powered Planning' },
                { icon: TrendingUp, text: 'Save up to 40%' },
                { icon: Salad, text: 'Nutrition Optimized' },
              ].map((feature) => (
                <div 
                  key={feature.text}
                  className="flex items-center gap-2 px-4 py-2 bg-background/80 rounded-xl border border-border/50"
                >
                  <feature.icon className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-foreground">{feature.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <section className="py-8">
        <div className="rounded-3xl bg-card border border-border/50 p-6 animate-pulse">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 rounded-2xl bg-muted" />
            <div className="space-y-2">
              <div className="w-40 h-5 bg-muted rounded" />
              <div className="w-24 h-4 bg-muted rounded" />
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-20 bg-muted rounded-xl" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Logged in - No household yet
  if (!household) {
    return (
      <section className="py-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-accent/5 via-primary/5 to-accent/10 border border-accent/20 p-6 sm:p-8">
          <div className="absolute top-0 right-0 w-40 h-40 bg-accent/10 rounded-full blur-3xl" />
          
          <div className="relative z-10 flex flex-col sm:flex-row items-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent to-accent/80 flex items-center justify-center shadow-lg">
              <Plus className="w-8 h-8 text-accent-foreground" />
            </div>
            
            <div className="flex-1 text-center sm:text-left">
              <h3 className="font-display text-xl font-bold text-foreground mb-1">
                Set Up Your Household
              </h3>
              <p className="text-muted-foreground text-sm mb-4">
                Complete your profile to get personalized grocery plans and savings recommendations.
              </p>
              <Button 
                variant="default" 
                className="gap-2"
                onClick={() => navigate('/onboarding')}
              >
                <Settings className="w-4 h-4" />
                Complete Setup
              </Button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Logged in with household
  return (
    <section className="py-8 space-y-6">
      {/* My Plan Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
            <CalendarDays className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h2 className="font-display text-xl font-bold text-foreground">My Plan</h2>
            <p className="text-xs text-muted-foreground">{household.name}</p>
          </div>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          className="gap-1.5"
          onClick={() => navigate('/dashboard')}
        >
          <Settings className="w-4 h-4" />
          <span className="hidden sm:inline">Manage</span>
        </Button>
      </div>

      {/* Household Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-card rounded-2xl border border-border/50 p-4 hover:border-primary/30 transition-colors">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-primary" />
            <span className="text-xs text-muted-foreground">Family</span>
          </div>
          <p className="font-bold text-lg text-foreground">{household.family_size} members</p>
          <div className="flex items-center gap-2 mt-1 text-[10px] text-muted-foreground">
            {household.adults > 0 && (
              <span className="flex items-center gap-0.5">
                <User className="w-3 h-3" /> {household.adults}
              </span>
            )}
            {household.children > 0 && (
              <span className="flex items-center gap-0.5">
                <Baby className="w-3 h-3" /> {household.children}
              </span>
            )}
            {household.elderly > 0 && (
              <span className="flex items-center gap-0.5">
                <UserCircle className="w-3 h-3" /> {household.elderly}
              </span>
            )}
          </div>
        </div>

        <div className="bg-card rounded-2xl border border-border/50 p-4 hover:border-primary/30 transition-colors">
          <div className="flex items-center gap-2 mb-2">
            <IndianRupee className="w-4 h-4 text-green-500" />
            <span className="text-xs text-muted-foreground">Budget</span>
          </div>
          <p className="font-bold text-lg text-foreground">₹{household.monthly_budget.toLocaleString()}</p>
          <p className="text-[10px] text-muted-foreground mt-1">per month</p>
        </div>

        <div className="bg-card rounded-2xl border border-border/50 p-4 hover:border-primary/30 transition-colors">
          <div className="flex items-center gap-2 mb-2">
            <Leaf className="w-4 h-4 text-emerald-500" />
            <span className="text-xs text-muted-foreground">Diet</span>
          </div>
          <p className="font-bold text-sm text-foreground capitalize">
            {household.diet_preferences?.[0] || 'Flexible'}
          </p>
          {household.diet_preferences?.length > 1 && (
            <p className="text-[10px] text-muted-foreground mt-1">
              +{household.diet_preferences.length - 1} more
            </p>
          )}
        </div>

        <button 
          onClick={onOpenPlanner}
          className={cn(
            "bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl border-2 border-dashed border-primary/30",
            "p-4 hover:border-primary/50 hover:from-primary/15 hover:to-accent/15 transition-all",
            "flex flex-col items-center justify-center gap-2 group"
          )}
        >
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <span className="text-xs font-semibold text-primary">Generate Plan</span>
        </button>
      </div>

      {/* Recent Grocery Lists */}
      {groceryLists.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-muted-foreground" />
              Recent Lists
            </h3>
            <Button variant="ghost" size="sm" className="text-xs" onClick={() => navigate('/dashboard')}>
              View All
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
          
          <div className="grid gap-2">
            {groceryLists.map((list) => (
              <button
                key={list.id}
                onClick={() => navigate('/dashboard')}
                className={cn(
                  "w-full flex items-center justify-between p-4 bg-card rounded-xl border border-border/50",
                  "hover:border-primary/30 hover:shadow-md transition-all group"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center",
                    list.ai_generated 
                      ? "bg-gradient-to-br from-primary/20 to-accent/20" 
                      : "bg-muted"
                  )}>
                    {list.ai_generated ? (
                      <Sparkles className="w-5 h-5 text-primary" />
                    ) : (
                      <ShoppingBag className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-foreground text-sm">{list.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {getMonthName(list.month)} {list.year} • ₹{list.total_cost?.toLocaleString() || 0}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {list.estimated_savings > 0 && (
                    <span className="text-xs font-medium text-green-600 bg-green-500/10 px-2 py-1 rounded-full">
                      Save ₹{list.estimated_savings}
                    </span>
                  )}
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Empty state for no lists */}
      {groceryLists.length === 0 && (
        <div className="text-center py-8 bg-muted/30 rounded-2xl">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
            <ShoppingBag className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="font-semibold text-foreground mb-1">No grocery plans yet</p>
          <p className="text-sm text-muted-foreground mb-4">Create your first AI-powered grocery plan</p>
          <Button variant="default" onClick={onOpenPlanner} className="gap-2">
            <Sparkles className="w-4 h-4" />
            Generate My First Plan
          </Button>
        </div>
      )}
    </section>
  );
};

export default MyPlanSection;

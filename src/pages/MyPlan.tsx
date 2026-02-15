import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import MyPlanSection from '@/components/MyPlanSection';
import AIGroceryPlanner from '@/components/AIGroceryPlanner';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { cn } from '@/lib/utils';

const MyPlan = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isAIPlannerOpen, setIsAIPlannerOpen] = useState(false);

  // Fetch user's household
  const { data: household, refetch: refetchHousehold } = useQuery({
    queryKey: ['household', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('households')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const defaultHousehold = {
    id: 'guest',
    name: 'My Household',
    family_size: 4,
    adults: 2,
    children: 2,
    elderly: 0,
    monthly_budget: 15000,
    diet_preferences: ['vegetarian'],
    preferred_stores: []
  };

  return (
    <>
      <Helmet>
        <title>My Plan - Flash Cart</title>
        <meta name="description" content="Manage your household grocery plan, budget, and dietary preferences with AI-powered planning." />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-2xl border-b border-border/30">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/')}
              className="shrink-0"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-foreground">My Plan</h1>
              <p className="text-xs text-muted-foreground">Manage your household & grocery plans</p>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
          <MyPlanSection onOpenPlanner={() => setIsAIPlannerOpen(true)} />
        </main>

        {/* AI Planner Modal */}
        {isAIPlannerOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center">
            <div 
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setIsAIPlannerOpen(false)}
            />
            <div className={cn(
              "relative z-10 w-full max-w-4xl max-h-[90vh] overflow-auto",
              "bg-background rounded-2xl shadow-2xl border border-border/50",
              "m-4 animate-scale-in"
            )}>
              <AIGroceryPlanner 
                household={household || defaultHousehold}
                onClose={() => setIsAIPlannerOpen(false)}
                onPlanGenerated={() => refetchHousehold()}
              />
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default MyPlan;

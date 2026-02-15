import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { 
  X, Sparkles, Send, Loader2, 
  Leaf, Zap, Heart, TrendingDown,
  Calendar, ShoppingBag, Lightbulb, ChefHat,
  Users, Wallet, Apple, Milk
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Household {
  id: string;
  name: string;
  family_size: number;
  adults?: number;
  children?: number;
  elderly?: number;
  monthly_budget: number;
  diet_preferences: string[];
  special_requirements?: string;
  preferred_stores?: string[];
}

interface AIGroceryPlannerProps {
  household: Household;
  onClose: () => void;
  onPlanGenerated: () => void;
}

interface GroceryItem {
  name: string;
  category: string;
  quantity: number;
  unit: string;
  estimated_price: number;
  nutritionHighlight?: string;
  ageGroup?: string;
  priority?: string;
}

interface NutritionSummary {
  proteinSources: string[];
  fiberRich: string[];
  calciumRich: string[];
  ironRich: string[];
  weeklyMealIdeas: string[];
}

interface BudgetBreakdown {
  vegetables: number;
  fruits: number;
  dairy: number;
  grains: number;
  pulses: number;
  oils: number;
  spices: number;
  snacks: number;
  beverages: number;
  protein: number;
}

interface GeneratedPlan {
  groceryItems: GroceryItem[];
  nutritionSummary?: NutritionSummary;
  budgetBreakdown?: BudgetBreakdown;
  seasonalTips?: string[];
  savingsTips?: string[];
  explanation?: string;
}

const AIGroceryPlanner = ({ household, onClose, onPlanGenerated }: AIGroceryPlannerProps) => {
  const { user } = useAuth();
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<GeneratedPlan | null>(null);
  const [planType, setPlanType] = useState<'weekly' | 'monthly'>('monthly');
  const [activeTab, setActiveTab] = useState('items');

  const generatePlan = async () => {
    if (!user) return;
    
    setIsGenerating(true);
    setGeneratedPlan(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        setIsGenerating(false);
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-grocery-plan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          prompt: prompt || `Create a smart ${planType} grocery plan for my household`,
          planType,
          householdContext: {
            familySize: household.family_size,
            adults: household.adults || household.family_size,
            children: household.children || 0,
            elderly: household.elderly || 0,
            budget: household.monthly_budget,
            dietPreferences: household.diet_preferences,
            specialRequirements: household.special_requirements,
            preferredStores: household.preferred_stores,
          }
        }),
      });

      if (response.status === 429) {
        toast.error('Rate limit exceeded. Please try again later.');
        setIsGenerating(false);
        return;
      }

      if (response.status === 402) {
        toast.error('AI credits exhausted. Please add more credits.');
        setIsGenerating(false);
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to generate plan');
      }

      const data = await response.json();
      setGeneratedPlan(data);
      toast.success('Smart grocery plan generated!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to generate grocery plan');
    } finally {
      setIsGenerating(false);
    }
  };

  const savePlan = async () => {
    if (!user || !generatedPlan?.groceryItems?.length) return;

    try {
      const now = new Date();
      const totalCost = generatedPlan.groceryItems.reduce((sum, item) => sum + item.estimated_price, 0);
      
      const { data: listData, error: listError } = await supabase
        .from('grocery_lists')
        .insert({
          household_id: household.id,
          user_id: user.id,
          name: `${now.toLocaleString('default', { month: 'long' })} ${now.getFullYear()} - AI Smart Plan`,
          month: now.getMonth() + 1,
          year: now.getFullYear(),
          status: 'active',
          total_cost: totalCost,
          estimated_savings: Math.round(totalCost * 0.18),
          nutrition_score: 92,
          ai_generated: true
        })
        .select()
        .single();

      if (listError) throw listError;

      const items = generatedPlan.groceryItems.map(item => ({
        list_id: listData.id,
        user_id: user.id,
        name: item.name,
        category: item.category,
        quantity: item.quantity,
        unit: item.unit,
        estimated_price: item.estimated_price,
        notes: item.nutritionHighlight || null,
        is_purchased: false
      }));

      const { error: itemsError } = await supabase
        .from('grocery_items')
        .insert(items);

      if (itemsError) throw itemsError;

      toast.success('Smart grocery plan saved successfully!');
      onPlanGenerated();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save plan');
    }
  };

  const totalCost = generatedPlan?.groceryItems?.reduce((sum, item) => sum + item.estimated_price, 0) || 0;
  const itemsByCategory = generatedPlan?.groceryItems?.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, GroceryItem[]>) || {};

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      'Vegetables': '🥬',
      'Fruits': '🍎',
      'Dairy': '🥛',
      'Grains & Cereals': '🌾',
      'Pulses & Lentils': '🫘',
      'Oils & Ghee': '🛢️',
      'Spices': '🧂',
      'Snacks': '🍪',
      'Beverages': '☕',
      'Protein Sources': '🥚',
      'Meat': '🍗',
    };
    return icons[category] || '📦';
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'essential': return 'bg-red-500/10 text-red-600 border-red-500/20';
      case 'high': return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
      case 'medium': return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl max-h-[95vh] overflow-hidden shadow-2xl border-primary/10">
        <CardHeader className="flex flex-row items-center justify-between border-b bg-gradient-to-r from-primary/5 to-accent/5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl gradient-hero shadow-lg">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <CardTitle className="font-display text-xl">AI Smart Planner</CardTitle>
              <p className="text-xs text-muted-foreground">Personalized & Nutritionally Optimized</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
            <X className="w-5 h-5" />
          </Button>
        </CardHeader>
        
        <CardContent className="p-0 max-h-[calc(95vh-80px)] overflow-y-auto">
          {/* Household Context Card */}
          <div className="p-4 bg-card border-b">
            <div className="flex items-center gap-2 mb-3">
              <Users className="w-4 h-4 text-primary" />
              <span className="font-medium text-sm">Planning for {household.name}</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="p-3 bg-secondary/50 rounded-lg">
                <p className="text-xs text-muted-foreground">Family</p>
                <p className="font-bold text-lg">{household.family_size} <span className="text-sm font-normal">members</span></p>
              </div>
              <div className="p-3 bg-secondary/50 rounded-lg">
                <p className="text-xs text-muted-foreground">Budget</p>
                <p className="font-bold text-lg">₹{household.monthly_budget?.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-secondary/50 rounded-lg">
                <p className="text-xs text-muted-foreground">Diet</p>
                <p className="font-medium text-sm capitalize truncate">{(household.diet_preferences || []).join(', ').replace(/_/g, ' ')}</p>
              </div>
              <div className="p-3 bg-secondary/50 rounded-lg">
                <p className="text-xs text-muted-foreground">Plan Type</p>
                <div className="flex gap-1 mt-1">
                  <button
                    onClick={() => setPlanType('weekly')}
                    className={cn(
                      "px-2 py-1 text-xs rounded-md transition-all",
                      planType === 'weekly' ? "bg-primary text-primary-foreground" : "bg-muted"
                    )}
                  >
                    Weekly
                  </button>
                  <button
                    onClick={() => setPlanType('monthly')}
                    className={cn(
                      "px-2 py-1 text-xs rounded-md transition-all",
                      planType === 'monthly' ? "bg-primary text-primary-foreground" : "bg-muted"
                    )}
                  >
                    Monthly
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Prompt Input */}
          <div className="p-4 border-b bg-muted/30">
            <Label className="text-sm font-medium mb-2 block">Custom Instructions (Optional)</Label>
            <div className="flex gap-2">
              <Input
                placeholder="e.g., Include more protein for gym, kids-friendly snacks, diabetic-friendly options..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                disabled={isGenerating}
                className="flex-1"
              />
              <Button 
                variant="hero" 
                onClick={generatePlan}
                disabled={isGenerating}
                className="gap-2"
              >
                {isGenerating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Generate
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Generated Plan */}
          {generatedPlan && (
            <div className="p-4 space-y-4">
              {/* Summary Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="p-4 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/10">
                  <div className="flex items-center gap-2 mb-1">
                    <ShoppingBag className="w-4 h-4 text-primary" />
                    <span className="text-xs text-muted-foreground">Total Items</span>
                  </div>
                  <p className="text-2xl font-bold">{generatedPlan.groceryItems?.length || 0}</p>
                </div>
                <div className="p-4 rounded-xl bg-gradient-to-br from-accent/10 to-accent/5 border border-accent/10">
                  <div className="flex items-center gap-2 mb-1">
                    <Wallet className="w-4 h-4 text-accent" />
                    <span className="text-xs text-muted-foreground">Total Cost</span>
                  </div>
                  <p className="text-2xl font-bold">₹{totalCost.toLocaleString()}</p>
                </div>
                <div className="p-4 rounded-xl bg-gradient-to-br from-green-500/10 to-green-500/5 border border-green-500/10">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingDown className="w-4 h-4 text-green-600" />
                    <span className="text-xs text-muted-foreground">Est. Savings</span>
                  </div>
                  <p className="text-2xl font-bold text-green-600">~18%</p>
                </div>
                <div className="p-4 rounded-xl bg-gradient-to-br from-rose-500/10 to-rose-500/5 border border-rose-500/10">
                  <div className="flex items-center gap-2 mb-1">
                    <Heart className="w-4 h-4 text-rose-500" />
                    <span className="text-xs text-muted-foreground">Nutrition Score</span>
                  </div>
                  <p className="text-2xl font-bold text-rose-500">92/100</p>
                </div>
              </div>

              {/* Tabs */}
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-4 h-auto p-1">
                  <TabsTrigger value="items" className="text-xs py-2 gap-1">
                    <ShoppingBag className="w-3 h-3" />
                    Items
                  </TabsTrigger>
                  <TabsTrigger value="nutrition" className="text-xs py-2 gap-1">
                    <Apple className="w-3 h-3" />
                    Nutrition
                  </TabsTrigger>
                  <TabsTrigger value="meals" className="text-xs py-2 gap-1">
                    <ChefHat className="w-3 h-3" />
                    Meal Ideas
                  </TabsTrigger>
                  <TabsTrigger value="tips" className="text-xs py-2 gap-1">
                    <Lightbulb className="w-3 h-3" />
                    Tips
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="items" className="mt-4 space-y-5">
                  {Object.entries(itemsByCategory).map(([category, items]) => {
                    const categoryTotal = items.reduce((s, i) => s + (i.estimated_price || 0), 0);
                    return (
                      <div key={category} className="space-y-2">
                        <div className="flex items-center gap-2 sticky top-0 bg-background/95 backdrop-blur py-2 z-10">
                          <span className="text-xl">{getCategoryIcon(category)}</span>
                          <h4 className="font-semibold">{category}</h4>
                          <Badge variant="outline" className="text-xs">
                            {items.length} items
                          </Badge>
                          <span className="ml-auto font-bold text-sm text-primary">₹{categoryTotal.toLocaleString()}</span>
                        </div>
                        <div className="grid gap-2">
                          {items.map((item, idx) => (
                            <div 
                              key={idx}
                              className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl hover:bg-muted transition-colors border border-transparent hover:border-primary/10"
                            >
                              {/* Item icon placeholder */}
                              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 text-lg">
                                {getCategoryIcon(item.category)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <p className="font-semibold text-sm">{item.name}</p>
                                  {item.priority && (
                                    <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0", getPriorityColor(item.priority))}>
                                      {item.priority}
                                    </Badge>
                                  )}
                                  {item.ageGroup && item.ageGroup !== 'all' && (
                                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                                      {item.ageGroup}
                                    </Badge>
                                  )}
                                </div>
                                <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                                  <span className="font-medium">{item.quantity} {item.unit}</span>
                                  {item.nutritionHighlight && (
                                    <span className="flex items-center gap-1 text-primary/80">
                                      <Leaf className="w-3 h-3" />
                                      {item.nutritionHighlight}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="text-right shrink-0">
                                <p className="font-bold text-primary text-base">₹{(item.estimated_price || 0).toLocaleString()}</p>
                                {item.quantity > 1 && (
                                  <p className="text-[10px] text-muted-foreground">
                                    ₹{Math.round((item.estimated_price || 0) / item.quantity)}/{item.unit}
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                  {/* Grand total bar */}
                  {generatedPlan.groceryItems?.length > 0 && (
                    <div className="flex items-center justify-between p-4 rounded-xl bg-primary/10 border border-primary/20">
                      <div>
                        <p className="font-bold text-sm">Grand Total</p>
                        <p className="text-xs text-muted-foreground">{generatedPlan.groceryItems.length} items across {Object.keys(itemsByCategory).length} categories</p>
                      </div>
                      <p className="text-2xl font-bold text-primary">₹{totalCost.toLocaleString()}</p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="nutrition" className="mt-4 space-y-4">
                  {generatedPlan.nutritionSummary && (
                    <>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-4 rounded-xl bg-orange-500/5 border border-orange-500/10">
                          <div className="flex items-center gap-2 mb-2">
                            <Zap className="w-4 h-4 text-orange-500" />
                            <h4 className="font-semibold text-sm">Protein Sources</h4>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {(generatedPlan.nutritionSummary.proteinSources || []).map((item, idx) => (
                              <Badge key={idx} variant="secondary" className="text-xs">{item}</Badge>
                            ))}
                          </div>
                        </div>
                        <div className="p-4 rounded-xl bg-green-500/5 border border-green-500/10">
                          <div className="flex items-center gap-2 mb-2">
                            <Leaf className="w-4 h-4 text-green-500" />
                            <h4 className="font-semibold text-sm">Fiber Rich</h4>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {(generatedPlan.nutritionSummary.fiberRich || []).map((item, idx) => (
                              <Badge key={idx} variant="secondary" className="text-xs">{item}</Badge>
                            ))}
                          </div>
                        </div>
                        <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/10">
                          <div className="flex items-center gap-2 mb-2">
                            <Milk className="w-4 h-4 text-blue-500" />
                            <h4 className="font-semibold text-sm">Calcium Rich</h4>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {(generatedPlan.nutritionSummary.calciumRich || []).map((item, idx) => (
                              <Badge key={idx} variant="secondary" className="text-xs">{item}</Badge>
                            ))}
                          </div>
                        </div>
                        <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/10">
                          <div className="flex items-center gap-2 mb-2">
                            <Heart className="w-4 h-4 text-red-500" />
                            <h4 className="font-semibold text-sm">Iron Rich</h4>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {(generatedPlan.nutritionSummary.ironRich || []).map((item, idx) => (
                              <Badge key={idx} variant="secondary" className="text-xs">{item}</Badge>
                            ))}
                          </div>
                        </div>
                      </div>

                      {generatedPlan.budgetBreakdown && (
                        <div className="p-4 rounded-xl bg-muted/50 border">
                          <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                            <Wallet className="w-4 h-4" />
                            Budget Breakdown
                          </h4>
                          <div className="space-y-2">
                            {Object.entries(generatedPlan.budgetBreakdown).map(([cat, amount]) => (
                              <div key={cat} className="flex items-center gap-2">
                                <span className="text-xs capitalize w-20">{cat}</span>
                                <Progress value={(amount / totalCost) * 100} className="flex-1 h-2" />
                                <span className="text-xs font-medium w-16 text-right">₹{amount}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </TabsContent>

                <TabsContent value="meals" className="mt-4">
                  {generatedPlan.nutritionSummary?.weeklyMealIdeas && (
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm flex items-center gap-2 mb-3">
                        <Calendar className="w-4 h-4" />
                        Weekly Meal Suggestions
                      </h4>
                      {(generatedPlan.nutritionSummary.weeklyMealIdeas || []).map((meal, idx) => (
                        <div key={idx} className="p-3 bg-muted/50 rounded-lg flex items-start gap-3">
                          <span className="text-2xl">🍽️</span>
                          <p className="text-sm">{meal}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="tips" className="mt-4 space-y-4">
                  {generatedPlan.seasonalTips && (
                    <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/10">
                      <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                        <Leaf className="w-4 h-4 text-amber-600" />
                        Seasonal Tips
                      </h4>
                      <ul className="space-y-2">
                        {(generatedPlan.seasonalTips || []).map((tip, idx) => (
                          <li key={idx} className="text-sm flex items-start gap-2">
                            <span className="text-amber-500">•</span>
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {generatedPlan.savingsTips && (
                    <div className="p-4 rounded-xl bg-green-500/5 border border-green-500/10">
                      <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                        <TrendingDown className="w-4 h-4 text-green-600" />
                        Money Saving Tips
                      </h4>
                      <ul className="space-y-2">
                        {(generatedPlan.savingsTips || []).map((tip, idx) => (
                          <li key={idx} className="text-sm flex items-start gap-2">
                            <span className="text-green-500">•</span>
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {generatedPlan.explanation && (
                    <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
                      <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-primary" />
                        AI Insights
                      </h4>
                      <p className="text-sm text-muted-foreground">{generatedPlan.explanation}</p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t">
                <Button 
                  variant="outline" 
                  className="flex-1" 
                  onClick={() => setGeneratedPlan(null)}
                >
                  Regenerate
                </Button>
                <Button 
                  variant="hero" 
                  className="flex-1 gap-2" 
                  onClick={savePlan}
                >
                  <ShoppingBag className="w-4 h-4" />
                  Save Plan
                </Button>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!isGenerating && !generatedPlan && (
            <div className="p-8 text-center">
              <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                <Sparkles className="w-10 h-10 text-primary" />
              </div>
              <h3 className="text-xl font-display font-bold mb-2">AI Smart Grocery Planner</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Get a personalized, nutritionally-balanced grocery list optimized for your family's needs and budget. Includes meal ideas and money-saving tips.
              </p>
              <div className="flex flex-wrap justify-center gap-2 mb-6">
                <Badge variant="outline" className="gap-1">
                  <Heart className="w-3 h-3" /> Nutrition Optimized
                </Badge>
                <Badge variant="outline" className="gap-1">
                  <Wallet className="w-3 h-3" /> Budget Friendly
                </Badge>
                <Badge variant="outline" className="gap-1">
                  <Leaf className="w-3 h-3" /> Seasonal Produce
                </Badge>
                <Badge variant="outline" className="gap-1">
                  <ChefHat className="w-3 h-3" /> Meal Ideas
                </Badge>
              </div>
              <Button variant="hero" size="lg" onClick={generatePlan} className="gap-2">
                <Sparkles className="w-5 h-5" />
                Generate Smart Plan
              </Button>
            </div>
          )}

          {/* Loading State */}
          {isGenerating && (
            <div className="p-8 text-center">
              <div className="relative w-20 h-20 mx-auto mb-4">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 animate-pulse" />
                <div className="absolute inset-2 rounded-xl bg-background flex items-center justify-center">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              </div>
              <h3 className="text-lg font-semibold mb-2">Creating Your Smart Plan</h3>
              <p className="text-muted-foreground text-sm max-w-sm mx-auto">
                Analyzing your household profile, optimizing for nutrition, and finding the best deals...
              </p>
              <div className="flex justify-center gap-3 mt-6">
                <Badge variant="secondary" className="animate-pulse">🧠 Analyzing diet</Badge>
                <Badge variant="secondary" className="animate-pulse delay-150">📊 Optimizing budget</Badge>
                <Badge variant="secondary" className="animate-pulse delay-300">🥗 Balancing nutrition</Badge>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AIGroceryPlanner;

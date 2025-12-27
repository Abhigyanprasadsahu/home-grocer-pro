import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { X, Sparkles, Send, Loader2 } from 'lucide-react';

interface Household {
  id: string;
  name: string;
  family_size: number;
  monthly_budget: number;
  diet_preferences: string[];
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
}

const AIGroceryPlanner = ({ household, onClose, onPlanGenerated }: AIGroceryPlannerProps) => {
  const { user } = useAuth();
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<GroceryItem[]>([]);
  const [streamedText, setStreamedText] = useState('');

  const generatePlan = async () => {
    if (!user) return;
    
    setIsGenerating(true);
    setStreamedText('');
    setGeneratedPlan([]);

    const systemContext = `Family size: ${household.family_size}, Budget: ₹${household.monthly_budget}/month, Diet: ${household.diet_preferences?.join(', ')}`;
    const userPrompt = prompt || `Create a comprehensive monthly grocery list for my household. ${systemContext}`;

    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-grocery-plan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          prompt: userPrompt,
          householdContext: {
            familySize: household.family_size,
            budget: household.monthly_budget,
            dietPreferences: household.diet_preferences,
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
      
      if (data.groceryItems && Array.isArray(data.groceryItems)) {
        setGeneratedPlan(data.groceryItems);
        setStreamedText(data.explanation || 'Grocery plan generated successfully!');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to generate grocery plan');
    } finally {
      setIsGenerating(false);
    }
  };

  const savePlan = async () => {
    if (!user || generatedPlan.length === 0) return;

    try {
      const now = new Date();
      const totalCost = generatedPlan.reduce((sum, item) => sum + item.estimated_price, 0);
      
      // Create grocery list
      const { data: listData, error: listError } = await supabase
        .from('grocery_lists')
        .insert({
          household_id: household.id,
          user_id: user.id,
          name: `${now.toLocaleString('default', { month: 'long' })} ${now.getFullYear()} Plan`,
          month: now.getMonth() + 1,
          year: now.getFullYear(),
          status: 'active',
          total_cost: totalCost,
          estimated_savings: Math.round(totalCost * 0.15), // Estimated 15% savings
          nutrition_score: 85,
          ai_generated: true
        })
        .select()
        .single();

      if (listError) throw listError;

      // Insert grocery items
      const items = generatedPlan.map(item => ({
        list_id: listData.id,
        user_id: user.id,
        name: item.name,
        category: item.category,
        quantity: item.quantity,
        unit: item.unit,
        estimated_price: item.estimated_price,
        is_purchased: false
      }));

      const { error: itemsError } = await supabase
        .from('grocery_items')
        .insert(items);

      if (itemsError) throw itemsError;

      toast.success('Grocery plan saved successfully!');
      onPlanGenerated();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save plan');
    }
  };

  const totalCost = generatedPlan.reduce((sum, item) => sum + item.estimated_price, 0);

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-soft">
        <CardHeader className="flex flex-row items-center justify-between border-b">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg gradient-hero">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <CardTitle className="font-display">AI Grocery Planner</CardTitle>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </CardHeader>
        
        <CardContent className="p-6 space-y-6 max-h-[calc(90vh-80px)] overflow-y-auto">
          {/* Context Info */}
          <div className="p-4 bg-secondary/50 rounded-lg text-sm">
            <p className="font-medium mb-2">Planning for {household.name}</p>
            <div className="flex flex-wrap gap-4 text-muted-foreground">
              <span>{household.family_size} members</span>
              <span>₹{household.monthly_budget?.toLocaleString()} budget</span>
              <span className="capitalize">{household.diet_preferences?.join(', ').replace(/_/g, ' ')}</span>
            </div>
          </div>

          {/* Prompt Input */}
          <div className="space-y-2">
            <Label>Custom Request (Optional)</Label>
            <div className="flex gap-2">
              <Input
                placeholder="e.g., Focus on high-protein items, include snacks for kids..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                disabled={isGenerating}
              />
              <Button 
                variant="hero" 
                onClick={generatePlan}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Streaming Text */}
          {streamedText && (
            <div className="p-4 bg-primary/5 rounded-lg">
              <p className="text-sm">{streamedText}</p>
            </div>
          )}

          {/* Generated Plan */}
          {generatedPlan.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Generated Grocery List</h3>
                <span className="text-sm font-medium text-primary">
                  Total: ₹{totalCost.toLocaleString()}
                </span>
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto">
                {generatedPlan.map((item, index) => (
                  <div 
                    key={index}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.quantity} {item.unit} • {item.category}
                      </p>
                    </div>
                    <span className="font-medium">₹{item.estimated_price}</span>
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setGeneratedPlan([])}>
                  Regenerate
                </Button>
                <Button variant="hero" className="flex-1" onClick={savePlan}>
                  Save Plan
                </Button>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!isGenerating && generatedPlan.length === 0 && !streamedText && (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Ready to Generate</h3>
              <p className="text-muted-foreground mb-4">
                Click the button above to generate a personalized grocery list
              </p>
              <Button variant="hero" onClick={generatePlan}>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Plan
              </Button>
            </div>
          )}

          {/* Loading State */}
          {isGenerating && generatedPlan.length === 0 && (
            <div className="text-center py-8">
              <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin text-primary" />
              <p className="text-muted-foreground">Generating your personalized grocery plan...</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AIGroceryPlanner;

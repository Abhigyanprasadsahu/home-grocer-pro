import { useState } from 'react';
import { X, Sparkles, ChefHat, Clock, Users, Loader2, Plus, Trash2, Utensils, Flame, Apple } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface Recipe {
  name: string;
  cuisine: string;
  prepTime: number;
  cookTime: number;
  servings: number;
  difficulty: string;
  ingredients: string[];
  steps: string[];
  nutritionPerServing?: {
    calories: number;
    protein: string;
    carbs: string;
    fat: string;
  };
  tips?: string[];
  pairsWith?: string[];
}

interface RecipeResponse {
  recipes: Recipe[];
  shoppingList?: string[];
}

interface AIRecipeFinderProps {
  isOpen: boolean;
  onClose: () => void;
  initialIngredients?: string[];
}

const cuisineOptions = [
  { value: 'any', label: 'Any Cuisine' },
  { value: 'north-indian', label: 'North Indian' },
  { value: 'south-indian', label: 'South Indian' },
  { value: 'gujarati', label: 'Gujarati' },
  { value: 'punjabi', label: 'Punjabi' },
  { value: 'bengali', label: 'Bengali' },
  { value: 'indo-chinese', label: 'Indo-Chinese' },
  { value: 'continental', label: 'Continental' },
];

const dietOptions = [
  { value: 'vegetarian', label: 'Vegetarian' },
  { value: 'vegan', label: 'Vegan' },
  { value: 'non-vegetarian', label: 'Non-Vegetarian' },
  { value: 'eggetarian', label: 'Eggetarian' },
  { value: 'jain', label: 'Jain' },
];

const commonIngredients = [
  'Onion', 'Tomato', 'Potato', 'Rice', 'Dal', 'Paneer', 'Chicken', 
  'Eggs', 'Milk', 'Curd', 'Ginger', 'Garlic', 'Green Chilli'
];

const AIRecipeFinder = ({ isOpen, onClose, initialIngredients = [] }: AIRecipeFinderProps) => {
  const [ingredients, setIngredients] = useState<string[]>(initialIngredients);
  const [newIngredient, setNewIngredient] = useState('');
  const [cuisine, setCuisine] = useState('any');
  const [diet, setDiet] = useState<string[]>([]);
  const [maxTime, setMaxTime] = useState<number | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [shoppingList, setShoppingList] = useState<string[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  const addIngredient = () => {
    if (newIngredient.trim() && !ingredients.includes(newIngredient.trim())) {
      setIngredients([...ingredients, newIngredient.trim()]);
      setNewIngredient('');
    }
  };

  const removeIngredient = (ingredient: string) => {
    setIngredients(ingredients.filter(i => i !== ingredient));
  };

  const toggleDiet = (value: string) => {
    setDiet(prev => 
      prev.includes(value) ? prev.filter(d => d !== value) : [...prev, value]
    );
  };

  const findRecipes = async () => {
    if (ingredients.length < 2) {
      toast.error('Please add at least 2 ingredients');
      return;
    }

    setIsLoading(true);
    setRecipes([]);
    setShoppingList([]);

    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-recipe-suggestions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          ingredients,
          cuisine: cuisine !== 'any' ? cuisine : undefined,
          dietaryPreferences: diet.length > 0 ? diet : undefined,
          maxTime,
        }),
      });

      if (response.status === 429) {
        toast.error('Too many requests. Please try again in a moment.');
        return;
      }

      if (response.status === 402) {
        toast.error('Service temporarily unavailable.');
        return;
      }

      if (!response.ok) throw new Error('Failed to get recipes');

      const data: RecipeResponse = await response.json();
      setRecipes(data.recipes || []);
      setShoppingList(data.shoppingList || []);
      toast.success(`Found ${data.recipes?.length || 0} recipes!`);
    } catch (error) {
      console.error('Recipe finder error:', error);
      toast.error('Failed to find recipes. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return 'bg-green-500/10 text-green-600 border-green-500/20';
      case 'medium': return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
      case 'hard': return 'bg-red-500/10 text-red-600 border-red-500/20';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl max-h-[95vh] bg-card rounded-2xl shadow-2xl border border-border overflow-hidden flex flex-col">
        {/* Header */}
        <div className="gradient-hero p-4 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <ChefHat className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold">AI Recipe Finder</h3>
              <p className="text-xs text-white/70">Powered by Gemini AI</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-white hover:bg-white/10">
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {!selectedRecipe ? (
            <>
              {/* Ingredient Input */}
              <div className="space-y-3">
                <label className="text-sm font-medium">What ingredients do you have?</label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add an ingredient..."
                    value={newIngredient}
                    onChange={(e) => setNewIngredient(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addIngredient()}
                    className="flex-1"
                  />
                  <Button onClick={addIngredient} size="icon">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                {/* Quick Add */}
                <div className="flex flex-wrap gap-1.5">
                  {commonIngredients.filter(i => !ingredients.includes(i)).slice(0, 8).map(ing => (
                    <button
                      key={ing}
                      onClick={() => setIngredients([...ingredients, ing])}
                      className="px-2 py-1 text-xs bg-secondary hover:bg-secondary/80 rounded-md transition-colors"
                    >
                      + {ing}
                    </button>
                  ))}
                </div>

                {/* Selected Ingredients */}
                {ingredients.length > 0 && (
                  <div className="flex flex-wrap gap-2 p-3 bg-muted/50 rounded-lg">
                    {ingredients.map(ing => (
                      <Badge key={ing} variant="secondary" className="gap-1 pr-1">
                        {ing}
                        <button onClick={() => removeIngredient(ing)} className="ml-1 hover:text-destructive">
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Filters */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Cuisine</label>
                  <Select value={cuisine} onValueChange={setCuisine}>
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {cuisineOptions.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Max Time (mins)</label>
                  <Input
                    type="number"
                    placeholder="e.g., 30"
                    value={maxTime || ''}
                    onChange={(e) => setMaxTime(e.target.value ? parseInt(e.target.value) : undefined)}
                    className="h-9"
                  />
                </div>
                <div className="space-y-1.5 col-span-2 md:col-span-1">
                  <label className="text-xs font-medium text-muted-foreground">Dietary</label>
                  <div className="flex flex-wrap gap-1">
                    {dietOptions.map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => toggleDiet(opt.value)}
                        className={cn(
                          "px-2 py-1 text-xs rounded-md border transition-colors",
                          diet.includes(opt.value) 
                            ? "bg-primary text-primary-foreground border-primary" 
                            : "bg-secondary border-border"
                        )}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Find Button */}
              <Button 
                onClick={findRecipes} 
                disabled={isLoading || ingredients.length < 2}
                className="w-full gap-2"
                variant="hero"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Finding recipes...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Find Recipes with AI
                  </>
                )}
              </Button>

              {/* Results */}
              {recipes.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Utensils className="w-4 h-4 text-primary" />
                    Recipes Found ({recipes.length})
                  </h4>
                  <div className="grid gap-3">
                    {recipes.map((recipe, idx) => (
                      <Card 
                        key={idx} 
                        className="cursor-pointer hover:border-primary/50 transition-colors"
                        onClick={() => setSelectedRecipe(recipe)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                              <h5 className="font-semibold mb-1">{recipe.name}</h5>
                              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {recipe.prepTime + recipe.cookTime} mins
                                </span>
                                <span className="flex items-center gap-1">
                                  <Users className="w-3 h-3" />
                                  {recipe.servings} servings
                                </span>
                                <Badge variant="outline" className="text-[10px]">{recipe.cuisine}</Badge>
                              </div>
                            </div>
                            <Badge className={cn("text-xs", getDifficultyColor(recipe.difficulty))}>
                              {recipe.difficulty}
                            </Badge>
                          </div>
                          {recipe.nutritionPerServing && (
                            <div className="flex gap-3 mt-3 pt-3 border-t text-xs">
                              <span className="flex items-center gap-1">
                                <Flame className="w-3 h-3 text-orange-500" />
                                {recipe.nutritionPerServing.calories} cal
                              </span>
                              <span>Protein: {recipe.nutritionPerServing.protein}</span>
                              <span>Carbs: {recipe.nutritionPerServing.carbs}</span>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Shopping List */}
              {shoppingList.length > 0 && (
                <div className="p-4 bg-accent/5 rounded-xl border border-accent/20">
                  <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                    <Apple className="w-4 h-4 text-accent" />
                    Missing Ingredients
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {shoppingList.map((item, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {item}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            /* Recipe Detail View */
            <div className="space-y-4">
              <button 
                onClick={() => setSelectedRecipe(null)}
                className="text-sm text-primary hover:underline"
              >
                ← Back to recipes
              </button>

              <div>
                <h3 className="text-xl font-display font-bold mb-2">{selectedRecipe.name}</h3>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline">{selectedRecipe.cuisine}</Badge>
                  <Badge className={getDifficultyColor(selectedRecipe.difficulty)}>
                    {selectedRecipe.difficulty}
                  </Badge>
                  <span className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    {selectedRecipe.prepTime + selectedRecipe.cookTime} mins
                  </span>
                  <span className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Users className="w-3 h-3" />
                    {selectedRecipe.servings} servings
                  </span>
                </div>
              </div>

              {/* Nutrition */}
              {selectedRecipe.nutritionPerServing && (
                <div className="grid grid-cols-4 gap-2">
                  <div className="p-3 bg-orange-500/5 rounded-lg text-center">
                    <p className="text-lg font-bold text-orange-600">{selectedRecipe.nutritionPerServing.calories}</p>
                    <p className="text-xs text-muted-foreground">Calories</p>
                  </div>
                  <div className="p-3 bg-blue-500/5 rounded-lg text-center">
                    <p className="text-lg font-bold text-blue-600">{selectedRecipe.nutritionPerServing.protein}</p>
                    <p className="text-xs text-muted-foreground">Protein</p>
                  </div>
                  <div className="p-3 bg-amber-500/5 rounded-lg text-center">
                    <p className="text-lg font-bold text-amber-600">{selectedRecipe.nutritionPerServing.carbs}</p>
                    <p className="text-xs text-muted-foreground">Carbs</p>
                  </div>
                  <div className="p-3 bg-green-500/5 rounded-lg text-center">
                    <p className="text-lg font-bold text-green-600">{selectedRecipe.nutritionPerServing.fat}</p>
                    <p className="text-xs text-muted-foreground">Fat</p>
                  </div>
                </div>
              )}

              {/* Ingredients */}
              <div className="p-4 bg-muted/50 rounded-xl">
                <h4 className="font-semibold mb-2">Ingredients</h4>
                <ul className="grid grid-cols-2 gap-1.5 text-sm">
                  {selectedRecipe.ingredients.map((ing, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                      {ing}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Steps */}
              <div>
                <h4 className="font-semibold mb-2">Instructions</h4>
                <ol className="space-y-3">
                  {selectedRecipe.steps.map((step, idx) => (
                    <li key={idx} className="flex gap-3">
                      <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-sm font-bold flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <p className="text-sm pt-0.5">{step}</p>
                    </li>
                  ))}
                </ol>
              </div>

              {/* Tips */}
              {selectedRecipe.tips && selectedRecipe.tips.length > 0 && (
                <div className="p-4 bg-primary/5 rounded-xl border border-primary/10">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    Pro Tips
                  </h4>
                  <ul className="space-y-1.5 text-sm">
                    {selectedRecipe.tips.map((tip, idx) => (
                      <li key={idx}>• {tip}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Pairs With */}
              {selectedRecipe.pairsWith && selectedRecipe.pairsWith.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Pairs Well With</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedRecipe.pairsWith.map((item, idx) => (
                      <Badge key={idx} variant="secondary">{item}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIRecipeFinder;

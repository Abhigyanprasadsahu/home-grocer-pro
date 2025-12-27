import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { 
  Leaf, Users, Baby, User, UserCheck, 
  Salad, Beef, Egg, Dumbbell, Heart, 
  Store, ArrowRight, ArrowLeft, Sparkles 
} from 'lucide-react';

type DietPreference = 'vegetarian' | 'non_vegetarian' | 'vegan' | 'eggetarian' | 'high_protein' | 'low_carb' | 'diabetic_friendly' | 'keto';

const DIET_OPTIONS: { value: DietPreference; label: string; icon: React.ReactNode }[] = [
  { value: 'vegetarian', label: 'Vegetarian', icon: <Salad className="w-5 h-5" /> },
  { value: 'non_vegetarian', label: 'Non-Vegetarian', icon: <Beef className="w-5 h-5" /> },
  { value: 'vegan', label: 'Vegan', icon: <Leaf className="w-5 h-5" /> },
  { value: 'eggetarian', label: 'Eggetarian', icon: <Egg className="w-5 h-5" /> },
  { value: 'high_protein', label: 'High Protein', icon: <Dumbbell className="w-5 h-5" /> },
  { value: 'low_carb', label: 'Low Carb', icon: <Heart className="w-5 h-5" /> },
  { value: 'diabetic_friendly', label: 'Diabetic Friendly', icon: <Heart className="w-5 h-5" /> },
  { value: 'keto', label: 'Keto', icon: <Dumbbell className="w-5 h-5" /> },
];

const STORE_OPTIONS = [
  'D-Mart', 'Reliance Fresh', 'Big Bazaar', 'More Supermarket', 
  'Spencer\'s', 'Star Bazaar', 'Nature\'s Basket', 'Local Kirana'
];

const Onboarding = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    householdName: 'My Household',
    adults: 2,
    children: 0,
    elderly: 0,
    dietPreferences: ['vegetarian'] as DietPreference[],
    monthlyBudget: 5000,
    preferredStores: [] as string[],
    specialRequirements: ''
  });

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  const totalMembers = formData.adults + formData.children + formData.elderly;

  const handleDietToggle = (diet: DietPreference) => {
    setFormData(prev => ({
      ...prev,
      dietPreferences: prev.dietPreferences.includes(diet)
        ? prev.dietPreferences.filter(d => d !== diet)
        : [...prev.dietPreferences, diet]
    }));
  };

  const handleStoreToggle = (store: string) => {
    setFormData(prev => ({
      ...prev,
      preferredStores: prev.preferredStores.includes(store)
        ? prev.preferredStores.filter(s => s !== store)
        : [...prev.preferredStores, store]
    }));
  };

  const handleSubmit = async () => {
    if (!user) return;
    
    setIsSubmitting(true);
    try {
      // Create household
      const { error: householdError } = await supabase
        .from('households')
        .insert({
          user_id: user.id,
          name: formData.householdName,
          family_size: totalMembers,
          adults: formData.adults,
          children: formData.children,
          elderly: formData.elderly,
          diet_preferences: formData.dietPreferences,
          monthly_budget: formData.monthlyBudget,
          preferred_stores: formData.preferredStores,
          special_requirements: formData.specialRequirements || null
        });

      if (householdError) throw householdError;

      // Update profile as onboarding completed
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ onboarding_completed: true })
        .eq('id', user.id);

      if (profileError) throw profileError;

      toast.success('Household setup complete!');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'Failed to save household data');
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => {
    if (step === 1 && totalMembers < 1) {
      toast.error('Please add at least one family member');
      return;
    }
    if (step === 2 && formData.dietPreferences.length === 0) {
      toast.error('Please select at least one diet preference');
      return;
    }
    setStep(s => Math.min(s + 1, 4));
  };

  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-xl gradient-hero flex items-center justify-center">
              <Leaf className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-display font-bold text-foreground">GROCERA</span>
          </div>
          <h1 className="text-3xl font-display font-bold text-foreground">Set Up Your Household</h1>
          <p className="text-muted-foreground mt-2">Tell us about your family for personalized grocery planning</p>
        </div>

        {/* Progress */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2, 3, 4].map(s => (
            <div
              key={s}
              className={`h-2 w-16 rounded-full transition-colors ${
                s <= step ? 'bg-primary' : 'bg-muted'
              }`}
            />
          ))}
        </div>

        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="font-display">
              {step === 1 && 'Family Members'}
              {step === 2 && 'Diet Preferences'}
              {step === 3 && 'Budget & Stores'}
              {step === 4 && 'Review & Confirm'}
            </CardTitle>
            <CardDescription>
              {step === 1 && 'How many people are in your household?'}
              {step === 2 && 'What are your dietary preferences?'}
              {step === 3 && 'Set your budget and preferred stores'}
              {step === 4 && 'Review your household details'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Step 1: Family Members */}
            {step === 1 && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="household-name">Household Name</Label>
                  <Input
                    id="household-name"
                    value={formData.householdName}
                    onChange={(e) => setFormData(prev => ({ ...prev, householdName: e.target.value }))}
                    placeholder="My Household"
                  />
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <User className="w-4 h-4" /> Adults
                    </Label>
                    <Input
                      type="number"
                      min={0}
                      max={20}
                      value={formData.adults}
                      onChange={(e) => setFormData(prev => ({ ...prev, adults: parseInt(e.target.value) || 0 }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Baby className="w-4 h-4" /> Children
                    </Label>
                    <Input
                      type="number"
                      min={0}
                      max={20}
                      value={formData.children}
                      onChange={(e) => setFormData(prev => ({ ...prev, children: parseInt(e.target.value) || 0 }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <UserCheck className="w-4 h-4" /> Elderly
                    </Label>
                    <Input
                      type="number"
                      min={0}
                      max={20}
                      value={formData.elderly}
                      onChange={(e) => setFormData(prev => ({ ...prev, elderly: parseInt(e.target.value) || 0 }))}
                    />
                  </div>
                </div>

                <div className="p-4 bg-secondary/50 rounded-lg flex items-center gap-3">
                  <Users className="w-6 h-6 text-primary" />
                  <div>
                    <p className="font-medium">Total Family Size: {totalMembers}</p>
                    <p className="text-sm text-muted-foreground">We'll calculate quantities based on this</p>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Diet Preferences */}
            {step === 2 && (
              <div className="grid grid-cols-2 gap-3">
                {DIET_OPTIONS.map(diet => (
                  <div
                    key={diet.value}
                    onClick={() => handleDietToggle(diet.value)}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      formData.dietPreferences.includes(diet.value)
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        formData.dietPreferences.includes(diet.value)
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}>
                        {diet.icon}
                      </div>
                      <span className="font-medium">{diet.label}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Step 3: Budget & Stores */}
            {step === 3 && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="budget">Monthly Grocery Budget (₹)</Label>
                  <Input
                    id="budget"
                    type="number"
                    min={1000}
                    step={500}
                    value={formData.monthlyBudget}
                    onChange={(e) => setFormData(prev => ({ ...prev, monthlyBudget: parseInt(e.target.value) || 5000 }))}
                  />
                </div>

                <div className="space-y-3">
                  <Label className="flex items-center gap-2">
                    <Store className="w-4 h-4" /> Preferred Stores
                  </Label>
                  <div className="grid grid-cols-2 gap-2">
                    {STORE_OPTIONS.map(store => (
                      <div key={store} className="flex items-center space-x-2">
                        <Checkbox
                          id={store}
                          checked={formData.preferredStores.includes(store)}
                          onCheckedChange={() => handleStoreToggle(store)}
                        />
                        <Label htmlFor={store} className="text-sm font-normal cursor-pointer">
                          {store}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="requirements">Special Requirements (Optional)</Label>
                  <Input
                    id="requirements"
                    placeholder="e.g., Allergies, organic preference..."
                    value={formData.specialRequirements}
                    onChange={(e) => setFormData(prev => ({ ...prev, specialRequirements: e.target.value }))}
                  />
                </div>
              </div>
            )}

            {/* Step 4: Review */}
            {step === 4 && (
              <div className="space-y-4">
                <div className="p-4 bg-secondary/50 rounded-lg space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Household</span>
                    <span className="font-medium">{formData.householdName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Family Size</span>
                    <span className="font-medium">{totalMembers} members</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Diet</span>
                    <span className="font-medium">{formData.dietPreferences.join(', ')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Budget</span>
                    <span className="font-medium">₹{formData.monthlyBudget.toLocaleString()}/month</span>
                  </div>
                  {formData.preferredStores.length > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Stores</span>
                      <span className="font-medium">{formData.preferredStores.join(', ')}</span>
                    </div>
                  )}
                </div>

                <div className="p-4 bg-primary/10 rounded-lg flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium text-primary">AI-Powered Planning Ready</p>
                    <p className="text-sm text-muted-foreground">
                      Our AI will create personalized grocery lists based on your preferences
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex gap-3 pt-4">
              {step > 1 && (
                <Button variant="outline" onClick={prevStep} className="flex-1">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              )}
              {step < 4 ? (
                <Button onClick={nextStep} className="flex-1" variant="hero">
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button 
                  onClick={handleSubmit} 
                  className="flex-1" 
                  variant="hero"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Setting up...' : 'Complete Setup'}
                  <Sparkles className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Onboarding;

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Edit3, Users } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

type DietPreference = Database['public']['Enums']['diet_preference'];

interface Household {
  id: string;
  name: string;
  family_size: number;
  monthly_budget: number;
  diet_preferences: DietPreference[] | null;
}

interface EditHouseholdModalProps {
  household: Household;
  onClose: () => void;
  onUpdated: () => void;
}

const DIET_OPTIONS: { value: DietPreference; label: string }[] = [
  { value: 'vegetarian', label: 'Vegetarian' },
  { value: 'non_vegetarian', label: 'Non-Vegetarian' },
  { value: 'eggetarian', label: 'Eggetarian' },
  { value: 'vegan', label: 'Vegan' },
  { value: 'high_protein', label: 'High Protein' },
  { value: 'low_carb', label: 'Low Carb' },
  { value: 'diabetic_friendly', label: 'Diabetic Friendly' },
  { value: 'keto', label: 'Keto' },
];

const EditHouseholdModal = ({ household, onClose, onUpdated }: EditHouseholdModalProps) => {
  const [name, setName] = useState(household.name || '');
  const [familySize, setFamilySize] = useState(household.family_size?.toString() || '4');
  const [monthlyBudget, setMonthlyBudget] = useState(household.monthly_budget?.toString() || '15000');
  const [dietPreferences, setDietPreferences] = useState<DietPreference[]>(household.diet_preferences || []);
  const [isLoading, setIsLoading] = useState(false);

  const toggleDietPreference = (value: DietPreference) => {
    setDietPreferences(prev => 
      prev.includes(value) 
        ? prev.filter(p => p !== value)
        : [...prev, value]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error('Please enter a household name');
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('households')
        .update({
          name: name.trim(),
          family_size: parseInt(familySize) || 4,
          monthly_budget: parseInt(monthlyBudget) || 15000,
          diet_preferences: dietPreferences
        })
        .eq('id', household.id);

      if (error) throw error;

      toast.success('Household updated successfully!');
      onUpdated();
      onClose();
    } catch (error: any) {
      toast.error('Failed to update: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit3 className="w-5 h-5 text-primary" />
            Edit Household
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="name">Household Name</Label>
            <Input
              id="name"
              placeholder="e.g., Sharma Family"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="familySize" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Family Size
              </Label>
              <Input
                id="familySize"
                type="number"
                min="1"
                max="20"
                value={familySize}
                onChange={(e) => setFamilySize(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="budget">Monthly Budget (₹)</Label>
              <Input
                id="budget"
                type="number"
                min="1000"
                step="500"
                value={monthlyBudget}
                onChange={(e) => setMonthlyBudget(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label>Dietary Preferences</Label>
            <div className="grid grid-cols-2 gap-3">
              {DIET_OPTIONS.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={option.value}
                    checked={dietPreferences.includes(option.value)}
                    onCheckedChange={() => toggleDietPreference(option.value)}
                  />
                  <label
                    htmlFor={option.value}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    {option.label}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="hero" className="flex-1" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditHouseholdModal;

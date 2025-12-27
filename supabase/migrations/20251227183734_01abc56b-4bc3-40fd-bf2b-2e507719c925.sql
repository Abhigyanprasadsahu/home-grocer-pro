-- Create enum for diet preferences
CREATE TYPE public.diet_preference AS ENUM (
  'vegetarian', 'non_vegetarian', 'vegan', 'eggetarian', 
  'high_protein', 'low_carb', 'diabetic_friendly', 'keto'
);

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Trigger for new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'full_name');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create households table
CREATE TABLE public.households (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'My Household',
  family_size INTEGER NOT NULL DEFAULT 1,
  adults INTEGER NOT NULL DEFAULT 1,
  children INTEGER NOT NULL DEFAULT 0,
  elderly INTEGER NOT NULL DEFAULT 0,
  diet_preferences diet_preference[] DEFAULT ARRAY['vegetarian']::diet_preference[],
  monthly_budget DECIMAL(10,2) DEFAULT 5000.00,
  preferred_stores TEXT[] DEFAULT ARRAY[]::TEXT[],
  special_requirements TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.households ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own households" ON public.households
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own households" ON public.households
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own households" ON public.households
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own households" ON public.households
  FOR DELETE USING (auth.uid() = user_id);

-- Create grocery_lists table
CREATE TABLE public.grocery_lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  month INTEGER NOT NULL,
  year INTEGER NOT NULL,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'completed', 'cancelled')),
  total_cost DECIMAL(10,2) DEFAULT 0,
  estimated_savings DECIMAL(10,2) DEFAULT 0,
  nutrition_score INTEGER DEFAULT 0,
  ai_generated BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.grocery_lists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own grocery_lists" ON public.grocery_lists
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own grocery_lists" ON public.grocery_lists
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own grocery_lists" ON public.grocery_lists
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own grocery_lists" ON public.grocery_lists
  FOR DELETE USING (auth.uid() = user_id);

-- Create grocery_items table
CREATE TABLE public.grocery_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  list_id UUID NOT NULL REFERENCES public.grocery_lists(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  quantity DECIMAL(10,2) NOT NULL DEFAULT 1,
  unit TEXT NOT NULL DEFAULT 'kg',
  estimated_price DECIMAL(10,2),
  best_price DECIMAL(10,2),
  best_store TEXT,
  is_purchased BOOLEAN DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.grocery_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own grocery_items" ON public.grocery_items
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own grocery_items" ON public.grocery_items
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own grocery_items" ON public.grocery_items
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own grocery_items" ON public.grocery_items
  FOR DELETE USING (auth.uid() = user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Add triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_households_updated_at
  BEFORE UPDATE ON public.households
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_grocery_lists_updated_at
  BEFORE UPDATE ON public.grocery_lists
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_grocery_items_updated_at
  BEFORE UPDATE ON public.grocery_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
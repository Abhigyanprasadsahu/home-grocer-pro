-- Create auto_subscriptions table for recurring orders
CREATE TABLE public.auto_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  frequency TEXT NOT NULL CHECK (frequency IN ('daily', 'alternate', 'weekly', 'biweekly', 'monthly')),
  preferred_time TEXT DEFAULT '08:00',
  is_active BOOLEAN DEFAULT true,
  next_delivery DATE,
  last_delivered DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.auto_subscriptions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own subscriptions" 
ON public.auto_subscriptions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own subscriptions" 
ON public.auto_subscriptions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscriptions" 
ON public.auto_subscriptions 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own subscriptions" 
ON public.auto_subscriptions 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for timestamp updates
CREATE TRIGGER update_subscriptions_updated_at
BEFORE UPDATE ON public.auto_subscriptions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
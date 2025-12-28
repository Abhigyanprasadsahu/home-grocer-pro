-- Create stores table
CREATE TABLE public.stores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  logo_url TEXT,
  color TEXT,
  rating NUMERIC(2,1) DEFAULT 4.0,
  delivery_fee NUMERIC(10,2) DEFAULT 0,
  min_order NUMERIC(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create products table
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  unit TEXT NOT NULL DEFAULT 'kg',
  image_url TEXT,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create store_prices table for real-time pricing
CREATE TABLE public.store_prices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  base_price NUMERIC(10,2) NOT NULL,
  current_price NUMERIC(10,2) NOT NULL,
  discount_percent NUMERIC(5,2) DEFAULT 0,
  is_available BOOLEAN DEFAULT true,
  stock_level INTEGER DEFAULT 100,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(product_id, store_id)
);

-- Enable RLS
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_prices ENABLE ROW LEVEL SECURITY;

-- Public read access for all (shopping is public)
CREATE POLICY "Anyone can view stores" ON public.stores FOR SELECT USING (true);
CREATE POLICY "Anyone can view products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Anyone can view store_prices" ON public.store_prices FOR SELECT USING (true);

-- Insert stores
INSERT INTO public.stores (name, logo_url, color, rating, delivery_fee, min_order) VALUES
  ('D-Mart', '🏪', '#FF6B35', 4.5, 0, 500),
  ('Reliance Fresh', '🛒', '#0066B3', 4.3, 29, 300),
  ('Big Bazaar', '🏬', '#E31837', 4.2, 49, 400),
  ('More Supermarket', '🛍️', '#00A650', 4.0, 39, 250),
  ('Spencer''s', '🏪', '#8B0000', 4.1, 59, 350),
  ('Star Bazaar', '⭐', '#FFD700', 4.4, 0, 600);

-- Insert sample products
INSERT INTO public.products (name, category, unit, image_url) VALUES
  ('Basmati Rice', 'Staples', 'kg', '🍚'),
  ('Toor Dal', 'Staples', 'kg', '🫘'),
  ('Wheat Flour (Atta)', 'Staples', 'kg', '🌾'),
  ('Sugar', 'Staples', 'kg', '🧂'),
  ('Sunflower Oil', 'Staples', 'L', '🫒'),
  ('Onions', 'Vegetables', 'kg', '🧅'),
  ('Tomatoes', 'Vegetables', 'kg', '🍅'),
  ('Potatoes', 'Vegetables', 'kg', '🥔'),
  ('Cauliflower', 'Vegetables', 'piece', '🥦'),
  ('Spinach (Palak)', 'Vegetables', 'bunch', '🥬'),
  ('Bananas', 'Fruits', 'dozen', '🍌'),
  ('Apples', 'Fruits', 'kg', '🍎'),
  ('Mangoes', 'Fruits', 'kg', '🥭'),
  ('Oranges', 'Fruits', 'kg', '🍊'),
  ('Grapes', 'Fruits', 'kg', '🍇'),
  ('Milk', 'Dairy', 'L', '🥛'),
  ('Curd/Yogurt', 'Dairy', 'kg', '🥛'),
  ('Paneer', 'Dairy', 'kg', '🧀'),
  ('Butter', 'Dairy', 'g', '🧈'),
  ('Cheese Slices', 'Dairy', 'pack', '🧀'),
  ('Chicken', 'Meat', 'kg', '🍗'),
  ('Eggs', 'Meat', 'dozen', '🥚'),
  ('Fish (Rohu)', 'Meat', 'kg', '🐟'),
  ('Mutton', 'Meat', 'kg', '🥩'),
  ('Prawns', 'Meat', 'kg', '🦐'),
  ('Tea (Tata)', 'Beverages', 'g', '🍵'),
  ('Coffee (Nescafe)', 'Beverages', 'g', '☕'),
  ('Coca Cola', 'Beverages', 'L', '🥤'),
  ('Mango Juice', 'Beverages', 'L', '🧃'),
  ('Mineral Water', 'Beverages', 'L', '💧'),
  ('Maggi Noodles', 'Snacks', 'pack', '🍜'),
  ('Lays Chips', 'Snacks', 'pack', '🥔'),
  ('Marie Biscuits', 'Snacks', 'pack', '🍪'),
  ('Namkeen Mix', 'Snacks', 'g', '🥜'),
  ('Dark Chocolate', 'Snacks', 'bar', '🍫');

-- Generate store prices for all product-store combinations
INSERT INTO public.store_prices (product_id, store_id, base_price, current_price, discount_percent, is_available, stock_level)
SELECT 
  p.id as product_id,
  s.id as store_id,
  CASE p.category
    WHEN 'Staples' THEN 80 + (random() * 120)
    WHEN 'Vegetables' THEN 30 + (random() * 70)
    WHEN 'Fruits' THEN 60 + (random() * 140)
    WHEN 'Dairy' THEN 50 + (random() * 150)
    WHEN 'Meat' THEN 150 + (random() * 350)
    WHEN 'Beverages' THEN 40 + (random() * 160)
    WHEN 'Snacks' THEN 20 + (random() * 80)
    ELSE 50 + (random() * 100)
  END as base_price,
  CASE p.category
    WHEN 'Staples' THEN 80 + (random() * 120)
    WHEN 'Vegetables' THEN 30 + (random() * 70)
    WHEN 'Fruits' THEN 60 + (random() * 140)
    WHEN 'Dairy' THEN 50 + (random() * 150)
    WHEN 'Meat' THEN 150 + (random() * 350)
    WHEN 'Beverages' THEN 40 + (random() * 160)
    WHEN 'Snacks' THEN 20 + (random() * 80)
    ELSE 50 + (random() * 100)
  END as current_price,
  CASE WHEN random() > 0.7 THEN (random() * 25)::numeric(5,2) ELSE 0 END as discount_percent,
  random() > 0.1 as is_available,
  (random() * 100)::integer as stock_level
FROM public.products p
CROSS JOIN public.stores s;

-- Update current_price based on discount
UPDATE public.store_prices 
SET current_price = ROUND((base_price * (1 - discount_percent / 100))::numeric, 2);

-- Create function to simulate price fluctuations
CREATE OR REPLACE FUNCTION public.simulate_price_update()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Randomly update some prices (simulate market fluctuations)
  UPDATE public.store_prices
  SET 
    discount_percent = CASE 
      WHEN random() > 0.7 THEN LEAST(30, GREATEST(0, discount_percent + (random() * 10 - 5)))
      ELSE discount_percent 
    END,
    stock_level = GREATEST(0, LEAST(100, stock_level + (random() * 20 - 10)::integer)),
    is_available = CASE WHEN stock_level > 0 THEN true ELSE false END,
    last_updated = now()
  WHERE random() > 0.8;
  
  -- Update current prices based on new discounts
  UPDATE public.store_prices
  SET current_price = ROUND((base_price * (1 - discount_percent / 100))::numeric, 2);
END;
$$;

-- Add trigger for updated_at
CREATE TRIGGER update_stores_updated_at BEFORE UPDATE ON public.stores
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products  
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
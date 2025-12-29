-- Add more popular Indian grocery stores
INSERT INTO public.stores (name, logo_url, color, delivery_fee, min_order, rating) VALUES
  ('BigBasket', '🧺', '#84C225', 0, 400.00, 4.6),
  ('JioMart', '📦', '#0066FF', 0, 199.00, 4.4),
  ('Zepto', '⚡', '#7B61FF', 25.00, 99.00, 4.5),
  ('Blinkit', '🟡', '#FFD600', 35.00, 99.00, 4.3),
  ('Amazon Fresh', '📭', '#FF9900', 40.00, 299.00, 4.5),
  ('Nature''s Basket', '🌿', '#2E7D32', 49.00, 500.00, 4.2);

-- Add store prices for new stores
INSERT INTO public.store_prices (store_id, product_id, base_price, current_price, discount_percent, is_available, stock_level)
SELECT 
  s.id as store_id,
  p.id as product_id,
  CASE 
    WHEN s.name = 'BigBasket' THEN 45 + (random() * 200)
    WHEN s.name = 'JioMart' THEN 40 + (random() * 180)
    WHEN s.name = 'Zepto' THEN 50 + (random() * 220)
    WHEN s.name = 'Blinkit' THEN 48 + (random() * 210)
    WHEN s.name = 'Amazon Fresh' THEN 52 + (random() * 230)
    WHEN s.name = 'Nature''s Basket' THEN 60 + (random() * 250)
  END as base_price,
  CASE 
    WHEN s.name = 'BigBasket' THEN 40 + (random() * 180)
    WHEN s.name = 'JioMart' THEN 35 + (random() * 160)
    WHEN s.name = 'Zepto' THEN 45 + (random() * 200)
    WHEN s.name = 'Blinkit' THEN 43 + (random() * 190)
    WHEN s.name = 'Amazon Fresh' THEN 47 + (random() * 210)
    WHEN s.name = 'Nature''s Basket' THEN 55 + (random() * 230)
  END as current_price,
  CASE 
    WHEN random() > 0.7 THEN floor(random() * 20)::integer
    ELSE 0
  END as discount_percent,
  random() > 0.1 as is_available,
  floor(random() * 100)::integer as stock_level
FROM public.stores s
CROSS JOIN public.products p
WHERE s.name IN ('BigBasket', 'JioMart', 'Zepto', 'Blinkit', 'Amazon Fresh', 'Nature''s Basket');

-- Update product images with better emoji representations
UPDATE public.products SET image_url = '🥕' WHERE name ILIKE '%carrot%';
UPDATE public.products SET image_url = '🍅' WHERE name ILIKE '%tomato%';
UPDATE public.products SET image_url = '🧅' WHERE name ILIKE '%onion%';
UPDATE public.products SET image_url = '🥔' WHERE name ILIKE '%potato%';
UPDATE public.products SET image_url = '🫑' WHERE name ILIKE '%capsicum%' OR name ILIKE '%pepper%';
UPDATE public.products SET image_url = '🥒' WHERE name ILIKE '%cucumber%';
UPDATE public.products SET image_url = '🍎' WHERE name ILIKE '%apple%';
UPDATE public.products SET image_url = '🍌' WHERE name ILIKE '%banana%';
UPDATE public.products SET image_url = '🍊' WHERE name ILIKE '%orange%';
UPDATE public.products SET image_url = '🥭' WHERE name ILIKE '%mango%';
UPDATE public.products SET image_url = '🍇' WHERE name ILIKE '%grape%';
UPDATE public.products SET image_url = '🍈' WHERE name ILIKE '%melon%';
UPDATE public.products SET image_url = '🥛' WHERE name ILIKE '%milk%';
UPDATE public.products SET image_url = '🧀' WHERE name ILIKE '%cheese%' OR name ILIKE '%paneer%';
UPDATE public.products SET image_url = '🧈' WHERE name ILIKE '%butter%' OR name ILIKE '%ghee%';
UPDATE public.products SET image_url = '🥚' WHERE name ILIKE '%egg%';
UPDATE public.products SET image_url = '🍞' WHERE name ILIKE '%bread%';
UPDATE public.products SET image_url = '🍚' WHERE name ILIKE '%rice%';
UPDATE public.products SET image_url = '🫘' WHERE name ILIKE '%dal%' OR name ILIKE '%lentil%';
UPDATE public.products SET image_url = '🌾' WHERE name ILIKE '%wheat%' OR name ILIKE '%atta%' OR name ILIKE '%flour%';
UPDATE public.products SET image_url = '🍗' WHERE name ILIKE '%chicken%';
UPDATE public.products SET image_url = '🥩' WHERE name ILIKE '%mutton%' OR name ILIKE '%meat%';
UPDATE public.products SET image_url = '🐟' WHERE name ILIKE '%fish%';
UPDATE public.products SET image_url = '☕' WHERE name ILIKE '%coffee%' OR name ILIKE '%tea%';
UPDATE public.products SET image_url = '🥤' WHERE name ILIKE '%juice%' OR name ILIKE '%drink%';
UPDATE public.products SET image_url = '🍪' WHERE name ILIKE '%biscuit%' OR name ILIKE '%cookie%';
UPDATE public.products SET image_url = '🍫' WHERE name ILIKE '%chocolate%';
UPDATE public.products SET image_url = '🍿' WHERE name ILIKE '%snack%' OR name ILIKE '%chips%' OR name ILIKE '%namkeen%';
UPDATE public.products SET image_url = '🧂' WHERE name ILIKE '%salt%' OR name ILIKE '%spice%' OR name ILIKE '%masala%';
UPDATE public.products SET image_url = '🛢️' WHERE name ILIKE '%oil%';
UPDATE public.products SET image_url = '🍯' WHERE name ILIKE '%honey%' OR name ILIKE '%sugar%';
UPDATE public.products SET image_url = '🫚' WHERE name ILIKE '%ginger%';
UPDATE public.products SET image_url = '🧄' WHERE name ILIKE '%garlic%';
UPDATE public.products SET image_url = '🌶️' WHERE name ILIKE '%chili%' OR name ILIKE '%chilli%';
UPDATE public.products SET image_url = '🥬' WHERE name ILIKE '%cabbage%' OR name ILIKE '%spinach%' OR name ILIKE '%palak%';
UPDATE public.products SET image_url = '🍆' WHERE name ILIKE '%brinjal%' OR name ILIKE '%eggplant%';
UPDATE public.products SET image_url = '🥦' WHERE name ILIKE '%broccoli%' OR name ILIKE '%cauliflower%' OR name ILIKE '%gobhi%';
UPDATE public.products SET image_url = '🥜' WHERE name ILIKE '%peanut%' OR name ILIKE '%groundnut%' OR name ILIKE '%nut%';
UPDATE public.products SET image_url = '🫛' WHERE name ILIKE '%pea%' OR name ILIKE '%bean%';
UPDATE public.products SET image_url = '🍋' WHERE name ILIKE '%lemon%' OR name ILIKE '%lime%';
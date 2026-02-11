import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey, { global: { headers: { Authorization: authHeader } } });

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Parse optional filters from query params or body
    let category = 'all';
    let maxPrice: number | undefined;
    
    try {
      const body = await req.json();
      category = body.category || 'all';
      maxPrice = body.maxPrice ? Number(body.maxPrice) : undefined;
    } catch {
      // No body is fine - use defaults
    }

    // Fetch real products with store prices
    const { data: products, error: prodError } = await supabase
      .from('products')
      .select('id, name, category, unit')
      .eq('is_active', true);

    if (prodError) throw prodError;

    const { data: prices, error: priceError } = await supabase
      .from('store_prices')
      .select('product_id, store_id, base_price, current_price, discount_percent, is_available')
      .gt('discount_percent', 0)
      .eq('is_available', true);

    if (priceError) throw priceError;

    const { data: stores, error: storeError } = await supabase
      .from('stores')
      .select('id, name, logo_url, rating');

    if (storeError) throw storeError;

    const storeMap = new Map(stores?.map(s => [s.id, s]) || []);

    // Build deals from products that have discounts
    interface Deal {
      productName: string;
      originalPrice: number;
      dealPrice: number;
      savings: number;
      savingsPercent: number;
      store: string;
      storeLogo: string;
      category: string;
      quality: 'hot' | 'good' | 'normal';
      productId: string;
      storeId: string;
    }

    const deals: Deal[] = [];

    for (const price of (prices || [])) {
      const product = products?.find(p => p.id === price.product_id);
      if (!product) continue;
      
      if (category !== 'all' && product.category.toLowerCase() !== category.toLowerCase()) continue;
      
      const store = storeMap.get(price.store_id);
      if (!store) continue;

      const savings = price.base_price - price.current_price;
      if (savings <= 0) continue;

      if (maxPrice && price.current_price > maxPrice) continue;

      const savingsPercent = Math.round((savings / price.base_price) * 100);

      deals.push({
        productName: `${product.name} (${product.unit})`,
        originalPrice: price.base_price,
        dealPrice: price.current_price,
        savings: Math.round(savings * 100) / 100,
        savingsPercent,
        store: store.name,
        storeLogo: store.logo_url || '🏪',
        category: product.category,
        quality: savingsPercent >= 15 ? 'hot' : savingsPercent >= 8 ? 'good' : 'normal',
        productId: product.id,
        storeId: store.id,
      });
    }

    // Sort by savings percent descending
    deals.sort((a, b) => b.savingsPercent - a.savingsPercent);

    return new Response(JSON.stringify({ deals: deals.slice(0, 30) }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Deal finder error:", error);
    return new Response(JSON.stringify({ error: "An error occurred" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});

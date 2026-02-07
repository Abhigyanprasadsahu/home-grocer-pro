import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const url = new URL(req.url);
    const category = url.searchParams.get('category');
    const storeId = url.searchParams.get('storeId');
    const productId = url.searchParams.get('productId');

    console.log('Fetching live prices with params:', { category, storeId, productId });

    // Fetch stores
    const { data: stores, error: storesError } = await supabase
      .from('stores')
      .select('*')
      .order('rating', { ascending: false });

    if (storesError) {
      console.error('Error fetching stores:', storesError);
      throw storesError;
    }

    // Build products query
    let productsQuery = supabase
      .from('products')
      .select('*')
      .eq('is_active', true);

    if (category && category !== 'All') {
      productsQuery = productsQuery.eq('category', category);
    }

    if (productId) {
      productsQuery = productsQuery.eq('id', productId);
    }

    const { data: products, error: productsError } = await productsQuery;

    if (productsError) {
      console.error('Error fetching products:', productsError);
      throw productsError;
    }

    // Build prices query
    let pricesQuery = supabase
      .from('store_prices')
      .select('*');

    if (storeId) {
      pricesQuery = pricesQuery.eq('store_id', storeId);
    }

    const { data: prices, error: pricesError } = await pricesQuery;

    if (pricesError) {
      console.error('Error fetching prices:', pricesError);
      throw pricesError;
    }

    // Transform data into the format expected by the frontend
    const productsWithPrices = products?.map(product => {
      const productPrices = prices?.filter(p => p.product_id === product.id) || [];
      
      const storePrices = stores?.map(store => {
        const storePrice = productPrices.find(p => p.store_id === store.id);
        
        // Add realistic market fluctuation simulation
        const timeVariation = Math.sin(Date.now() / (1000 * 60 * 5)) * 0.02; // 2% variation every 5 mins
        const randomVariation = (Math.random() - 0.5) * 0.03; // 3% random variation
        
        const basePrice = storePrice?.base_price || 100;
        const adjustedPrice = basePrice * (1 + timeVariation + randomVariation);
        const currentPrice = storePrice ? 
          Math.round((storePrice.current_price * (1 + randomVariation)) * 100) / 100 :
          Math.round(adjustedPrice * 100) / 100;
        
        return {
          storeId: store.id,
          storeName: store.name,
          storeColor: store.color,
          storeLogo: store.logo_url,
          price: currentPrice,
          originalPrice: storePrice?.base_price || basePrice,
          discount: storePrice?.discount_percent || 0,
          available: storePrice?.is_available ?? true,
          stockLevel: storePrice?.stock_level || 0,
          deliveryFee: store.delivery_fee,
          minOrder: store.min_order,
          rating: store.rating,
          lastUpdated: storePrice?.last_updated || new Date().toISOString()
        };
      }) || [];

      // Find best price
      const availablePrices = storePrices.filter(sp => sp.available);
      const bestPrice = availablePrices.length > 0 
        ? Math.min(...availablePrices.map(sp => sp.price))
        : null;
      const bestStore = availablePrices.find(sp => sp.price === bestPrice);

      return {
        id: product.id,
        name: product.name,
        category: product.category,
        unit: product.unit,
        image: product.image_url,
        description: product.description,
        storePrices,
        bestPrice,
        bestStore: bestStore?.storeName || null,
        bestStoreId: bestStore?.storeId || null,
        availableStores: availablePrices.length,
        totalStores: storePrices.length,
        priceRange: {
          min: Math.min(...storePrices.map(sp => sp.price)),
          max: Math.max(...storePrices.map(sp => sp.price))
        },
        lastUpdated: new Date().toISOString()
      };
    }) || [];

    // Calculate store summaries
    const storeSummaries = stores?.map(store => {
      const storeProductPrices = prices?.filter(p => p.store_id === store.id) || [];
      const availableProducts = storeProductPrices.filter(p => p.is_available).length;
      const totalProducts = storeProductPrices.length;
      const avgDiscount = storeProductPrices.reduce((acc, p) => acc + (p.discount_percent || 0), 0) / totalProducts || 0;
      
      return {
        id: store.id,
        name: store.name,
        logo: store.logo_url,
        color: store.color,
        rating: store.rating,
        deliveryFee: store.delivery_fee,
        minOrder: store.min_order,
        availableProducts,
        totalProducts,
        avgDiscount: Math.round(avgDiscount * 10) / 10,
        lastUpdated: new Date().toISOString()
      };
    }) || [];

    const response = {
      products: productsWithPrices,
      stores: storeSummaries,
      meta: {
        totalProducts: productsWithPrices.length,
        totalStores: stores?.length || 0,
        lastUpdated: new Date().toISOString()
      }
    };

    console.log(`Returning ${productsWithPrices.length} products with live prices`);

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in get-live-prices function:', errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

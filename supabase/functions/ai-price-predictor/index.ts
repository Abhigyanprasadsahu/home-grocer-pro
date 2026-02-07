import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PricePredictRequest {
  productName: string;
  category: string;
  currentPrice: number;
  historicalPrices?: { date: string; price: number }[];
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authenticate the user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      console.error('Auth error:', claimsError);
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const userId = claimsData.claims.sub;
    console.log('Authenticated user:', userId);

    const { productName, category, currentPrice, historicalPrices } = await req.json() as PricePredictRequest;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const currentMonth = new Date().toLocaleString('default', { month: 'long' });
    const season = getSeason();

    const systemPrompt = `You are an expert in Indian grocery market price analysis. Analyze product prices and provide predictions.

CONTEXT:
- Current Month: ${currentMonth}
- Season: ${season}
- Category: ${category}

OUTPUT FORMAT (JSON):
{
  "prediction": {
    "trend": "up/down/stable",
    "confidence": 85,
    "expectedChange": "+5%/-10%/0%",
    "bestTimeToBuy": "Now/Wait 2 weeks/Next month",
    "reasoning": "Brief explanation"
  },
  "seasonalFactors": ["Festival season approaching", "Monsoon affects supply"],
  "alternatives": [
    {
      "name": "Alternative product",
      "priceComparison": "20% cheaper",
      "nutritionSimilarity": "Similar protein content"
    }
  ],
  "buyRecommendation": {
    "action": "Buy Now/Wait/Stock Up",
    "quantity": "1 week supply/2 kg/Monthly stock",
    "reason": "Why this recommendation"
  }
}`;

    const userPrompt = `Product: ${productName}
Current Price: ₹${currentPrice}
${historicalPrices?.length ? `Recent prices: ${historicalPrices.map(p => `${p.date}: ₹${p.price}`).join(", ")}` : ""}

Analyze this product's price and provide buying recommendations.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Too many requests." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Service unavailable." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error("AI service error");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";
    
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return new Response(JSON.stringify(parsed), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Failed to parse prediction" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Price prediction error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function getSeason(): string {
  const month = new Date().getMonth();
  if (month >= 2 && month <= 5) return "Summer";
  if (month >= 6 && month <= 9) return "Monsoon";
  return "Winter";
}

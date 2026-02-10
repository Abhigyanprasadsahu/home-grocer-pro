import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const MAX_STRING_LENGTH = 200;
const MAX_HISTORICAL_PRICES = 100;

function validateRequest(body: unknown): { productName: string; category: string; currentPrice: number; historicalPrices?: any[] } {
  if (!body || typeof body !== "object") throw new Error("Invalid request body");
  const { productName, category, currentPrice, historicalPrices } = body as any;
  if (typeof productName !== "string" || productName.length === 0 || productName.length > MAX_STRING_LENGTH) throw new Error("productName must be 1-200 characters");
  if (typeof category !== "string" || category.length === 0 || category.length > MAX_STRING_LENGTH) throw new Error("category must be 1-200 characters");
  const price = Number(currentPrice);
  if (isNaN(price) || price < 0 || price > 1000000) throw new Error("currentPrice must be 0-1000000");
  if (historicalPrices !== undefined) {
    if (!Array.isArray(historicalPrices) || historicalPrices.length > MAX_HISTORICAL_PRICES) throw new Error(`Maximum ${MAX_HISTORICAL_PRICES} historical prices`);
    for (const hp of historicalPrices) {
      if (!hp || typeof hp !== "object") throw new Error("Invalid historical price entry");
      if (typeof hp.date !== "string" || hp.date.length > 20) throw new Error("Invalid date");
      const p = Number(hp.price);
      if (isNaN(p) || p < 0 || p > 1000000) throw new Error("Invalid historical price");
    }
  }
  return { productName, category, currentPrice: price, historicalPrices };
}

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
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    let body: unknown;
    try { body = await req.json(); } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON" }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    let validated;
    try { validated = validateRequest(body); } catch (e) {
      return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Validation error" }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const { productName, category, currentPrice, historicalPrices } = validated;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const currentMonth = new Date().toLocaleString('default', { month: 'long' });
    const season = getSeason();

    const systemPrompt = `You are an expert in Indian grocery market price analysis. Analyze product prices and provide predictions.
CONTEXT: Current Month: ${currentMonth}, Season: ${season}, Category: ${category}
OUTPUT FORMAT (JSON): { "prediction": {...}, "seasonalFactors": [...], "alternatives": [...], "buyRecommendation": {...} }`;

    const userPrompt = `Product: ${productName}\nCurrent Price: ₹${currentPrice}\n${historicalPrices?.length ? `Recent prices: ${historicalPrices.slice(0, 20).map((p: any) => `${p.date}: ₹${p.price}`).join(", ")}` : ""}\n\nAnalyze this product's price.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: "google/gemini-2.5-flash", messages: [{ role: "system", content: systemPrompt }, { role: "user", content: userPrompt }] }),
    });

    if (!response.ok) {
      if (response.status === 429) return new Response(JSON.stringify({ error: "Too many requests." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (response.status === 402) return new Response(JSON.stringify({ error: "Service unavailable." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      throw new Error("AI service error");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return new Response(JSON.stringify(JSON.parse(jsonMatch[0])), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    return new Response(JSON.stringify({ error: "Failed to parse prediction" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    console.error("Price prediction error:", error);
    return new Response(JSON.stringify({ error: "An error occurred" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});

function getSeason(): string {
  const month = new Date().getMonth();
  if (month >= 2 && month <= 5) return "Summer";
  if (month >= 6 && month <= 9) return "Monsoon";
  return "Winter";
}

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const MAX_CART_ITEMS = 100;
const MAX_STRING_LENGTH = 200;

function validateRequest(body: unknown): { cartItems: any[]; familySize: number; dietaryGoals?: string[] } {
  if (!body || typeof body !== "object") throw new Error("Invalid request body");
  const { cartItems, familySize, dietaryGoals } = body as any;
  if (!Array.isArray(cartItems) || cartItems.length === 0) throw new Error("cartItems array is required");
  if (cartItems.length > MAX_CART_ITEMS) throw new Error(`Maximum ${MAX_CART_ITEMS} cart items allowed`);
  for (const item of cartItems) {
    if (!item || typeof item !== "object") throw new Error("Invalid cart item");
    if (typeof item.name !== "string" || item.name.length > MAX_STRING_LENGTH) throw new Error("Item name must be under 200 characters");
    if (typeof item.quantity !== "number" || item.quantity < 0 || item.quantity > 10000) throw new Error("Item quantity must be 0-10000");
    if (typeof item.category !== "string" || item.category.length > MAX_STRING_LENGTH) throw new Error("Item category must be under 200 characters");
  }
  const fs = Number(familySize);
  if (!Number.isInteger(fs) || fs < 1 || fs > 20) throw new Error("familySize must be 1-20");
  if (dietaryGoals !== undefined) {
    if (!Array.isArray(dietaryGoals) || dietaryGoals.length > 10) throw new Error("Maximum 10 dietary goals");
    for (const g of dietaryGoals) { if (typeof g !== "string" || g.length > MAX_STRING_LENGTH) throw new Error("Invalid dietary goal"); }
  }
  return { cartItems, familySize: fs, dietaryGoals };
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
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) {
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

    const { cartItems, familySize, dietaryGoals } = validated;
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) throw new Error("OPENAI_API_KEY is not configured");

    const systemPrompt = `You are an expert nutritionist specializing in Indian dietary patterns. Analyze grocery carts for nutritional balance.
OUTPUT FORMAT (JSON): { "overallScore": 85, "scoreBreakdown": {...}, "analysis": {...}, "recommendations": [...], "mealSuggestions": [...], "healthTips": [...] }`;

    const userPrompt = `Cart Items:\n${cartItems.map((item: any) => `- ${item.name} (${item.quantity}) - ${item.category}`).join("\n")}\n\nFamily Size: ${familySize} members\n${dietaryGoals?.length ? `Dietary Goals: ${dietaryGoals.join(", ")}` : ""}\n\nAnalyze this cart's nutritional value.`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: "gpt-4o-mini", messages: [{ role: "system", content: systemPrompt }, { role: "user", content: userPrompt }] }),
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
    return new Response(JSON.stringify({ error: "Failed to parse analysis" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    console.error("Nutrition analysis error:", error);
    return new Response(JSON.stringify({ error: "An error occurred" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const MAX_INGREDIENTS = 50;
const MAX_STRING_LENGTH = 200;

function validateRequest(body: unknown): { ingredients: string[]; cuisine?: string; dietaryPreferences?: string[]; maxTime?: number } {
  if (!body || typeof body !== "object") throw new Error("Invalid request body");
  const { ingredients, cuisine, dietaryPreferences, maxTime } = body as any;
  if (!Array.isArray(ingredients) || ingredients.length === 0) throw new Error("ingredients array is required");
  if (ingredients.length > MAX_INGREDIENTS) throw new Error(`Maximum ${MAX_INGREDIENTS} ingredients allowed`);
  for (const ing of ingredients) {
    if (typeof ing !== "string" || ing.length > MAX_STRING_LENGTH) throw new Error("Each ingredient must be a string under 200 characters");
  }
  if (cuisine !== undefined && (typeof cuisine !== "string" || cuisine.length > MAX_STRING_LENGTH)) throw new Error("cuisine must be a string under 200 characters");
  if (dietaryPreferences !== undefined) {
    if (!Array.isArray(dietaryPreferences) || dietaryPreferences.length > 10) throw new Error("Maximum 10 dietary preferences");
    for (const dp of dietaryPreferences) { if (typeof dp !== "string" || dp.length > MAX_STRING_LENGTH) throw new Error("Invalid dietary preference"); }
  }
  if (maxTime !== undefined) { const t = Number(maxTime); if (isNaN(t) || t < 1 || t > 1440) throw new Error("maxTime must be 1-1440 minutes"); }
  return { ingredients, cuisine, dietaryPreferences, maxTime };
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

    const { ingredients, cuisine, dietaryPreferences, maxTime } = validated;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `You are an expert Indian cuisine chef and nutritionist. Generate creative recipe suggestions based on available ingredients.

OUTPUT FORMAT (JSON):
{
  "recipes": [{ "name": "Recipe Name", "cuisine": "North Indian", "prepTime": 15, "cookTime": 30, "servings": 4, "difficulty": "Easy", "ingredients": ["ingredient 1"], "steps": ["Step 1"], "nutritionPerServing": { "calories": 250, "protein": "12g", "carbs": "30g", "fat": "8g" }, "tips": ["Tip"], "pairsWith": ["Raita"] }],
  "shoppingList": ["Missing ingredient 1"]
}

GUIDELINES: Suggest 3-5 recipes. Prioritize healthy, balanced meals. Include traditional Indian recipes.`;

    const userPrompt = `Available ingredients: ${ingredients.join(", ")}
${cuisine ? `Preferred cuisine: ${cuisine}` : ""}
${dietaryPreferences?.length ? `Dietary preferences: ${dietaryPreferences.join(", ")}` : ""}
${maxTime ? `Maximum cooking time: ${maxTime} minutes` : ""}

Generate recipe suggestions that make the best use of these ingredients.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: "google/gemini-2.5-flash", messages: [{ role: "system", content: systemPrompt }, { role: "user", content: userPrompt }] }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("OpenAI error:", response.status, errText);
      if (response.status === 429) return new Response(JSON.stringify({ error: "Too many requests." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      throw new Error("AI service error");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return new Response(JSON.stringify(JSON.parse(jsonMatch[0])), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    return new Response(JSON.stringify({ error: "Failed to parse recipes" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    console.error("Recipe suggestion error:", error);
    return new Response(JSON.stringify({ error: "An error occurred" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});

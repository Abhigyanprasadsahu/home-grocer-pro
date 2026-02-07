import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RecipeRequest {
  ingredients: string[];
  cuisine?: string;
  dietaryPreferences?: string[];
  maxTime?: number;
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

    const { ingredients, cuisine, dietaryPreferences, maxTime } = await req.json() as RecipeRequest;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are an expert Indian cuisine chef and nutritionist. Generate creative recipe suggestions based on available ingredients.

OUTPUT FORMAT (JSON):
{
  "recipes": [
    {
      "name": "Recipe Name",
      "cuisine": "North Indian/South Indian/etc",
      "prepTime": 15,
      "cookTime": 30,
      "servings": 4,
      "difficulty": "Easy/Medium/Hard",
      "ingredients": ["ingredient 1 with quantity", "ingredient 2"],
      "steps": ["Step 1", "Step 2"],
      "nutritionPerServing": {
        "calories": 250,
        "protein": "12g",
        "carbs": "30g",
        "fat": "8g"
      },
      "tips": ["Cooking tip 1", "Tip 2"],
      "pairsWith": ["Raita", "Rice"]
    }
  ],
  "shoppingList": ["Missing ingredient 1", "Optional ingredient 2"]
}

GUIDELINES:
- Suggest 3-5 recipes
- Prioritize healthy, balanced meals
- Include traditional Indian recipes
- Consider seasonal availability
- Add cooking tips for beginners`;

    const userPrompt = `Available ingredients: ${ingredients.join(", ")}
${cuisine ? `Preferred cuisine: ${cuisine}` : ""}
${dietaryPreferences?.length ? `Dietary preferences: ${dietaryPreferences.join(", ")}` : ""}
${maxTime ? `Maximum cooking time: ${maxTime} minutes` : ""}

Generate recipe suggestions that make the best use of these ingredients.`;

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
        return new Response(JSON.stringify({ error: "Too many requests. Please try again." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Service temporarily unavailable." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error("AI service error");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";
    
    // Parse JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return new Response(JSON.stringify(parsed), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Failed to parse recipes" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Recipe suggestion error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

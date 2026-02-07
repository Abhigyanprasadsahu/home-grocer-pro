import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SearchRequest {
  query: string;
  context?: {
    recentSearches?: string[];
    cartItems?: string[];
    preferences?: string[];
  };
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

    const { query, context } = await req.json() as SearchRequest;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are an intelligent grocery search assistant. Understand user intent and expand queries for better search results.

OUTPUT FORMAT (JSON):
{
  "interpretedQuery": "What the user is looking for",
  "searchTerms": ["primary term", "synonym 1", "related term"],
  "categories": ["Relevant category 1", "Category 2"],
  "suggestions": [
    {
      "type": "product",
      "name": "Product name",
      "reason": "Why suggested"
    },
    {
      "type": "recipe",
      "name": "Recipe name",
      "ingredients": ["key ingredients"]
    }
  ],
  "relatedSearches": ["related search 1", "related search 2"],
  "smartFilters": {
    "priceRange": "budget/mid/premium",
    "dietaryOptions": ["vegetarian", "organic"],
    "freshness": "fresh/frozen/canned"
  },
  "contextualTips": ["Seasonal availability note", "Best time to buy"]
}

EXAMPLES:
- "dinner ideas" → suggest recipes + ingredients
- "healthy breakfast" → cereals, oats, fruits, eggs
- "party snacks" → chips, dips, finger foods, beverages`;

    const userPrompt = `Search Query: "${query}"
${context?.recentSearches?.length ? `Recent searches: ${context.recentSearches.join(", ")}` : ""}
${context?.cartItems?.length ? `Cart items: ${context.cartItems.join(", ")}` : ""}
${context?.preferences?.length ? `User preferences: ${context.preferences.join(", ")}` : ""}

Understand and expand this search query.`;

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

    return new Response(JSON.stringify({ error: "Failed to parse search" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Smart search error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

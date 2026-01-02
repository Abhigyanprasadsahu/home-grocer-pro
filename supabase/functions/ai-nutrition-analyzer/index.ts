import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NutritionRequest {
  cartItems: { name: string; quantity: number; category: string }[];
  familySize: number;
  dietaryGoals?: string[];
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { cartItems, familySize, dietaryGoals } = await req.json() as NutritionRequest;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are an expert nutritionist specializing in Indian dietary patterns. Analyze grocery carts for nutritional balance.

OUTPUT FORMAT (JSON):
{
  "overallScore": 85,
  "scoreBreakdown": {
    "proteinBalance": 80,
    "fiberIntake": 90,
    "vitaminDiversity": 75,
    "mineralBalance": 85,
    "healthyFats": 70
  },
  "analysis": {
    "strengths": ["Good vegetable variety", "Adequate protein sources"],
    "improvements": ["Add more leafy greens", "Consider omega-3 sources"],
    "missingNutrients": ["Vitamin D", "Iron"]
  },
  "recommendations": [
    {
      "item": "Spinach",
      "reason": "Rich in iron and folate",
      "quantity": "500g weekly",
      "priority": "high"
    }
  ],
  "mealSuggestions": [
    {
      "meal": "Breakfast",
      "suggestion": "Oats with fruits and nuts",
      "nutrients": ["Fiber", "Protein", "Healthy fats"]
    }
  ],
  "weeklyMealPlan": {
    "monday": { "breakfast": "Poha with vegetables", "lunch": "Dal rice with salad", "dinner": "Roti sabzi" },
    "tuesday": { "breakfast": "Idli sambar", "lunch": "Rajma chawal", "dinner": "Mixed veg curry" }
  },
  "healthTips": ["Soak pulses overnight for better digestion", "Include seasonal fruits"]
}`;

    const userPrompt = `Cart Items:
${cartItems.map(item => `- ${item.name} (${item.quantity}) - ${item.category}`).join("\n")}

Family Size: ${familySize} members
${dietaryGoals?.length ? `Dietary Goals: ${dietaryGoals.join(", ")}` : ""}

Analyze this cart's nutritional value and provide recommendations.`;

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

    return new Response(JSON.stringify({ error: "Failed to parse analysis" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Nutrition analysis error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

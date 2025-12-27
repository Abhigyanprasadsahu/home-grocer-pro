import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, householdContext } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are an expert Indian grocery planner and nutritionist. Generate practical, budget-conscious grocery lists for Indian households.

CONTEXT:
- Family size: ${householdContext.familySize} members
- Monthly budget: ₹${householdContext.budget}
- Diet preferences: ${householdContext.dietPreferences?.join(', ') || 'vegetarian'}

REQUIREMENTS:
1. Generate a comprehensive monthly grocery list
2. Include all essential categories: Vegetables, Fruits, Dairy, Grains & Cereals, Pulses & Lentils, Oils & Ghee, Spices, Snacks, Beverages
3. Optimize quantities for the family size
4. Keep total within the budget
5. Consider seasonal availability and Indian preferences
6. Include both everyday items and monthly staples

You MUST respond with a valid JSON object in this exact format:
{
  "groceryItems": [
    { "name": "Rice (Basmati)", "category": "Grains & Cereals", "quantity": 5, "unit": "kg", "estimated_price": 450 },
    { "name": "Toor Dal", "category": "Pulses & Lentils", "quantity": 2, "unit": "kg", "estimated_price": 260 }
  ],
  "explanation": "Brief explanation of the plan"
}

Generate 25-40 items covering all essential categories. Prices should be realistic Indian market rates.`;

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
          { role: "user", content: prompt || "Create a complete monthly grocery plan for my household" },
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limits exceeded" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required" }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content in AI response");
    }

    // Parse the JSON from the response
    let parsedContent;
    try {
      // Try to extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedContent = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (parseError) {
      console.error("Parse error:", parseError, "Content:", content);
      // Return a fallback grocery list
      parsedContent = {
        groceryItems: [
          { name: "Rice (Basmati)", category: "Grains & Cereals", quantity: 5, unit: "kg", estimated_price: 450 },
          { name: "Wheat Flour (Atta)", category: "Grains & Cereals", quantity: 5, unit: "kg", estimated_price: 225 },
          { name: "Toor Dal", category: "Pulses & Lentils", quantity: 2, unit: "kg", estimated_price: 260 },
          { name: "Moong Dal", category: "Pulses & Lentils", quantity: 1, unit: "kg", estimated_price: 140 },
          { name: "Milk", category: "Dairy", quantity: 30, unit: "L", estimated_price: 1800 },
          { name: "Curd", category: "Dairy", quantity: 4, unit: "kg", estimated_price: 240 },
          { name: "Onions", category: "Vegetables", quantity: 5, unit: "kg", estimated_price: 200 },
          { name: "Tomatoes", category: "Vegetables", quantity: 4, unit: "kg", estimated_price: 160 },
          { name: "Potatoes", category: "Vegetables", quantity: 4, unit: "kg", estimated_price: 120 },
          { name: "Mixed Vegetables", category: "Vegetables", quantity: 8, unit: "kg", estimated_price: 400 },
          { name: "Bananas", category: "Fruits", quantity: 4, unit: "dozen", estimated_price: 200 },
          { name: "Apples", category: "Fruits", quantity: 2, unit: "kg", estimated_price: 300 },
          { name: "Cooking Oil", category: "Oils & Ghee", quantity: 2, unit: "L", estimated_price: 300 },
          { name: "Ghee", category: "Oils & Ghee", quantity: 500, unit: "g", estimated_price: 300 },
          { name: "Sugar", category: "Grains & Cereals", quantity: 2, unit: "kg", estimated_price: 90 },
          { name: "Tea", category: "Beverages", quantity: 500, unit: "g", estimated_price: 250 },
          { name: "Salt", category: "Spices", quantity: 1, unit: "kg", estimated_price: 25 },
          { name: "Turmeric", category: "Spices", quantity: 200, unit: "g", estimated_price: 60 },
          { name: "Red Chili Powder", category: "Spices", quantity: 200, unit: "g", estimated_price: 80 },
          { name: "Garam Masala", category: "Spices", quantity: 100, unit: "g", estimated_price: 70 },
        ],
        explanation: "Here's a balanced monthly grocery plan covering all essential categories for your household."
      };
    }

    return new Response(JSON.stringify(parsedContent), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in generate-grocery-plan:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

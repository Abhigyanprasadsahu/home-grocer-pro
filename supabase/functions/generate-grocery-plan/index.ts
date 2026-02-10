import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const MAX_PROMPT_LENGTH = 2000;
const VALID_PLAN_TYPES = ["monthly", "weekly", "biweekly"];

function validateRequest(body: unknown): { prompt: string; householdContext: any; planType: string } {
  if (!body || typeof body !== "object") throw new Error("Invalid request body");
  const { prompt, householdContext, planType = "monthly" } = body as any;
  if (prompt !== undefined && (typeof prompt !== "string" || prompt.length > MAX_PROMPT_LENGTH)) throw new Error(`Prompt must be under ${MAX_PROMPT_LENGTH} characters`);
  if (!householdContext || typeof householdContext !== "object") throw new Error("householdContext is required");
  const fs = Number(householdContext.familySize);
  if (!Number.isInteger(fs) || fs < 1 || fs > 20) throw new Error("familySize must be 1-20");
  const budget = Number(householdContext.budget);
  if (isNaN(budget) || budget < 0 || budget > 1000000) throw new Error("budget must be 0-1000000");
  if (householdContext.adults !== undefined) { const v = Number(householdContext.adults); if (!Number.isInteger(v) || v < 0 || v > 20) throw new Error("adults must be 0-20"); }
  if (householdContext.children !== undefined) { const v = Number(householdContext.children); if (!Number.isInteger(v) || v < 0 || v > 20) throw new Error("children must be 0-20"); }
  if (householdContext.elderly !== undefined) { const v = Number(householdContext.elderly); if (!Number.isInteger(v) || v < 0 || v > 20) throw new Error("elderly must be 0-20"); }
  if (householdContext.dietPreferences && (!Array.isArray(householdContext.dietPreferences) || householdContext.dietPreferences.length > 10)) throw new Error("Too many diet preferences");
  if (householdContext.specialRequirements && typeof householdContext.specialRequirements === "string" && householdContext.specialRequirements.length > 500) throw new Error("Special requirements too long");
  if (!VALID_PLAN_TYPES.includes(planType)) throw new Error(`planType must be one of: ${VALID_PLAN_TYPES.join(", ")}`);
  return { prompt: prompt || "", householdContext, planType };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let body: unknown;
    try { body = await req.json(); } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON" }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    let prompt, householdContext, planType;
    try { ({ prompt, householdContext, planType } = validateRequest(body)); } catch (e) {
      return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Validation error" }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const currentMonth = new Date().toLocaleString('default', { month: 'long' });
    const currentSeason = getSeason();
    
    const systemPrompt = `You are an advanced AI nutritionist and grocery planning expert specializing in Indian households. You create personalized, budget-optimized, and nutritionally balanced grocery plans.

HOUSEHOLD PROFILE:
- Total Family Size: ${householdContext.familySize} members
- Adults: ${householdContext.adults || householdContext.familySize}
- Children: ${householdContext.children || 0}
- Elderly: ${householdContext.elderly || 0}
- Monthly Budget: ₹${householdContext.budget}
- Diet Preferences: ${householdContext.dietPreferences?.join(', ') || 'vegetarian'}
- Special Requirements: ${householdContext.specialRequirements || 'None'}
- Preferred Stores: ${householdContext.preferredStores?.join(', ') || 'Any'}

CURRENT CONTEXT:
- Month: ${currentMonth}
- Season: ${currentSeason}
- Plan Type: ${planType}

You MUST respond with a valid JSON object with groceryItems, nutritionSummary, budgetBreakdown, seasonalTips, savingsTips, and explanation fields.
Generate 30-50 items covering all essential categories. Prices should be realistic Indian market rates for ${currentMonth}.`;

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
          { role: "user", content: prompt || `Create a smart ${planType} grocery plan optimized for my household.` },
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) return new Response(JSON.stringify({ error: "Rate limits exceeded" }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (response.status === 402) return new Response(JSON.stringify({ error: "Payment required" }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) throw new Error("No content in AI response");

    let parsedContent;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) { parsedContent = JSON.parse(jsonMatch[0]); } else { throw new Error("No JSON found"); }
    } catch {
      parsedContent = getFallbackPlan(householdContext);
    }

    return new Response(JSON.stringify(parsedContent), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in generate-grocery-plan:", error);
    return new Response(JSON.stringify({ error: "An error occurred" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function getSeason(): string {
  const month = new Date().getMonth();
  if (month >= 2 && month <= 5) return "Summer";
  if (month >= 6 && month <= 9) return "Monsoon";
  return "Winter";
}

function getFallbackPlan(householdContext: any) {
  const familySize = Math.min(Math.max(Number(householdContext.familySize) || 4, 1), 20);
  const budget = Math.min(Math.max(Number(householdContext.budget) || 10000, 0), 1000000);
  
  return {
    groceryItems: [
      { name: "Basmati Rice", category: "Grains & Cereals", quantity: Math.ceil(familySize * 1.5), unit: "kg", estimated_price: 450, nutritionHighlight: "Complex carbs", ageGroup: "all", priority: "essential" },
      { name: "Whole Wheat Atta", category: "Grains & Cereals", quantity: Math.ceil(familySize * 2), unit: "kg", estimated_price: 280, nutritionHighlight: "Fiber, B vitamins", ageGroup: "all", priority: "essential" },
      { name: "Toor Dal", category: "Pulses & Lentils", quantity: Math.ceil(familySize * 0.5), unit: "kg", estimated_price: 180, nutritionHighlight: "Protein, fiber", ageGroup: "all", priority: "essential" },
      { name: "Full Cream Milk", category: "Dairy", quantity: Math.ceil(familySize * 8), unit: "L", estimated_price: 480, nutritionHighlight: "Calcium, protein", ageGroup: "all", priority: "essential" },
      { name: "Fresh Onions", category: "Vegetables", quantity: Math.ceil(familySize * 1.5), unit: "kg", estimated_price: 80, nutritionHighlight: "Antioxidants", ageGroup: "all", priority: "essential" },
      { name: "Tomatoes", category: "Vegetables", quantity: Math.ceil(familySize * 1), unit: "kg", estimated_price: 60, nutritionHighlight: "Vitamin C", ageGroup: "all", priority: "essential" },
    ],
    nutritionSummary: { proteinSources: ["Dal", "Milk"], fiberRich: ["Whole Wheat"], calciumRich: ["Milk"], ironRich: ["Spinach"], weeklyMealIdeas: ["Dal Rice + Sabzi"] },
    budgetBreakdown: { vegetables: Math.round(budget * 0.15), fruits: Math.round(budget * 0.08), dairy: Math.round(budget * 0.20), grains: Math.round(budget * 0.15), pulses: Math.round(budget * 0.10), oils: Math.round(budget * 0.10), spices: Math.round(budget * 0.05), snacks: Math.round(budget * 0.05), beverages: Math.round(budget * 0.04), protein: Math.round(budget * 0.08) },
    seasonalTips: ["Buy seasonal vegetables for better prices"],
    savingsTips: ["Buy rice and atta in bulk for savings"],
    explanation: `Balanced ${familySize}-member family grocery plan optimized for nutrition and budget.`
  };
}

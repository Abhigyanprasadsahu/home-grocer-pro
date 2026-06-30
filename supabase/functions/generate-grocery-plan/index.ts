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
    const budgetNum = Number(householdContext.budget) || 10000;
    const targetSpend = Math.round(budgetNum * 0.95); // leave 5% buffer
    
    const systemPrompt = `You are an expert Indian household grocery planner. You MUST strictly respect the user's monthly budget.

HOUSEHOLD PROFILE:
- Family Size: ${householdContext.familySize} (Adults: ${householdContext.adults || householdContext.familySize}, Children: ${householdContext.children || 0}, Elderly: ${householdContext.elderly || 0})
- MONTHLY BUDGET: ₹${budgetNum} (HARD LIMIT — total of all estimated_price values MUST be ≤ ₹${targetSpend})
- Diet: ${householdContext.dietPreferences?.join(', ') || 'vegetarian'}
- Special Requirements: ${householdContext.specialRequirements || 'None'}
- Month: ${currentMonth} (${currentSeason})

CRITICAL BUDGET RULES:
1. SUM of all groceryItems[].estimated_price MUST be between ₹${Math.round(budgetNum * 0.85)} and ₹${targetSpend}.
2. If budget is low (<₹5000) → fewer items, prioritize staples (rice, atta, dal, oil, milk, basic vegetables).
3. If budget is high (>₹20000) → more variety, premium items, fruits, dry fruits, snacks.
4. Use REALISTIC current Indian market prices (₹/kg or ₹/L):
   - Basmati rice ₹80-120/kg, atta ₹40-50/kg, toor dal ₹140-180/kg, moong dal ₹120-160/kg
   - Milk ₹55-70/L, paneer ₹350-400/kg, curd ₹60-80/kg
   - Onion ₹30-50/kg, potato ₹25-40/kg, tomato ₹30-80/kg (seasonal)
   - Apple ₹150-220/kg, banana ₹50-70/dozen
   - Refined oil ₹130-160/L, ghee ₹550-700/kg
   - Sugar ₹45-55/kg, tea ₹400-600/kg

OUTPUT — respond with ONLY a valid JSON object (no markdown, no prose). Schema:
{
  "groceryItems": [
    { "name": string, "category": string, "quantity": number, "unit": string, "estimated_price": number (INR, integer), "nutritionHighlight": string, "priority": "essential"|"recommended"|"optional" }
  ],
  "nutritionSummary": { "proteinSources": string[], "fiberRich": string[], "calciumRich": string[], "ironRich": string[], "weeklyMealIdeas": string[] },
  "budgetBreakdown": { "vegetables": number, "fruits": number, "dairy": number, "grains": number, "pulses": number, "oils": number, "spices": number, "snacks": number, "beverages": number, "protein": number },
  "seasonalTips": string[],
  "savingsTips": string[],
  "explanation": string
}

estimated_price is REQUIRED on every item and MUST be a positive integer in INR. Double-check the sum before responding.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt || `Create a ${planType} grocery plan that fits within ₹${budgetNum}.` },
        ],
        temperature: 0.5,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) return new Response(JSON.stringify({ error: "Rate limits exceeded. Please try again in a moment." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (response.status === 402) {
        console.warn("AI gateway returned 402, using fallback plan");
        const fallback = getFallbackPlan(householdContext);
        return new Response(JSON.stringify(fallback), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
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

    // Normalize: ensure every item has a numeric estimated_price
    if (Array.isArray(parsedContent.groceryItems)) {
      parsedContent.groceryItems = parsedContent.groceryItems.map((it: any) => {
        const price = Number(
          it.estimated_price ?? it.estimatedPrice ?? it.price ?? it.cost ?? 0
        );
        return {
          name: String(it.name ?? "Item"),
          category: String(it.category ?? "Other"),
          quantity: Number(it.quantity) || 1,
          unit: String(it.unit ?? "pcs"),
          estimated_price: Number.isFinite(price) && price > 0 ? Math.round(price) : 50,
          nutritionHighlight: it.nutritionHighlight ?? it.nutrition ?? "",
          priority: it.priority ?? "recommended",
        };
      });

      // Budget enforcement: if AI overshoots, scale proportionally
      const total = parsedContent.groceryItems.reduce((s: number, i: any) => s + i.estimated_price, 0);
      if (total > targetSpend && total > 0) {
        const factor = targetSpend / total;
        parsedContent.groceryItems = parsedContent.groceryItems.map((i: any) => ({
          ...i,
          estimated_price: Math.max(10, Math.round(i.estimated_price * factor)),
        }));
      }
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

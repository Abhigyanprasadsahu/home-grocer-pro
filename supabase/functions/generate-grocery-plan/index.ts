import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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

    const { prompt, householdContext, planType = 'monthly' } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

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

ADVANCED REQUIREMENTS:
1. Generate a comprehensive ${planType} grocery list optimized for the family composition
2. Consider age-appropriate nutrition:
   - Children: Higher calcium, protein for growth, healthy snacks
   - Adults: Balanced macros, fiber, energy foods
   - Elderly: Easy-to-digest foods, calcium, fiber, low sodium
3. Include seasonal produce for freshness and cost savings
4. Balance across categories: Vegetables, Fruits, Dairy, Grains & Cereals, Pulses & Lentils, Oils & Ghee, Spices, Snacks, Beverages, Protein Sources
5. Optimize quantities based on family size and consumption patterns
6. Stay within budget while maximizing nutrition
7. Consider Indian cooking patterns (curries, rotis, rice, dal, etc.)
8. Include meal prep suggestions for the items

NUTRITIONAL GOALS:
- Protein: ~50-60g per adult/day, 30-40g per child
- Fiber: ~25-30g per adult/day
- Calcium: Especially for children and elderly
- Iron: Especially for women and children
- Vitamins: Through fresh fruits and vegetables

You MUST respond with a valid JSON object in this exact format:
{
  "groceryItems": [
    { 
      "name": "Rice (Basmati)", 
      "category": "Grains & Cereals", 
      "quantity": 5, 
      "unit": "kg", 
      "estimated_price": 450,
      "nutritionHighlight": "Complex carbs, energy",
      "ageGroup": "all",
      "priority": "essential"
    }
  ],
  "nutritionSummary": {
    "proteinSources": ["Dal", "Paneer", "Eggs"],
    "fiberRich": ["Vegetables", "Whole grains", "Fruits"],
    "calciumRich": ["Milk", "Curd", "Paneer"],
    "ironRich": ["Spinach", "Lentils", "Jaggery"],
    "weeklyMealIdeas": ["Monday: Dal Rice + Sabzi", "Tuesday: Roti + Paneer", "etc"]
  },
  "budgetBreakdown": {
    "vegetables": 1500,
    "fruits": 800,
    "dairy": 2000,
    "grains": 1200,
    "pulses": 600,
    "oils": 500,
    "spices": 300,
    "snacks": 400,
    "beverages": 300,
    "protein": 800
  },
  "seasonalTips": ["Tip 1", "Tip 2"],
  "savingsTips": ["Buy in bulk", "Seasonal produce is cheaper"],
  "explanation": "Detailed explanation of the plan with personalized insights"
}

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
          { role: "user", content: prompt || `Create a smart ${planType} grocery plan optimized for my household with nutritional balance and budget optimization.` },
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
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedContent = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (parseError) {
      console.error("Parse error:", parseError, "Content:", content);
      // Return an enhanced fallback grocery list
      parsedContent = getFallbackPlan(householdContext);
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

function getSeason(): string {
  const month = new Date().getMonth();
  if (month >= 2 && month <= 5) return "Summer";
  if (month >= 6 && month <= 9) return "Monsoon";
  return "Winter";
}

function getFallbackPlan(householdContext: any) {
  const familySize = householdContext.familySize || 4;
  const budget = householdContext.budget || 10000;
  
  return {
    groceryItems: [
      { name: "Basmati Rice", category: "Grains & Cereals", quantity: Math.ceil(familySize * 1.5), unit: "kg", estimated_price: 450, nutritionHighlight: "Complex carbs", ageGroup: "all", priority: "essential" },
      { name: "Whole Wheat Atta", category: "Grains & Cereals", quantity: Math.ceil(familySize * 2), unit: "kg", estimated_price: 280, nutritionHighlight: "Fiber, B vitamins", ageGroup: "all", priority: "essential" },
      { name: "Toor Dal", category: "Pulses & Lentils", quantity: Math.ceil(familySize * 0.5), unit: "kg", estimated_price: 180, nutritionHighlight: "Protein, fiber", ageGroup: "all", priority: "essential" },
      { name: "Moong Dal", category: "Pulses & Lentils", quantity: Math.ceil(familySize * 0.3), unit: "kg", estimated_price: 140, nutritionHighlight: "Easy to digest protein", ageGroup: "all", priority: "essential" },
      { name: "Chana Dal", category: "Pulses & Lentils", quantity: Math.ceil(familySize * 0.3), unit: "kg", estimated_price: 120, nutritionHighlight: "Protein, iron", ageGroup: "all", priority: "essential" },
      { name: "Full Cream Milk", category: "Dairy", quantity: Math.ceil(familySize * 8), unit: "L", estimated_price: 480, nutritionHighlight: "Calcium, protein", ageGroup: "all", priority: "essential" },
      { name: "Fresh Curd", category: "Dairy", quantity: Math.ceil(familySize * 2), unit: "kg", estimated_price: 180, nutritionHighlight: "Probiotics, calcium", ageGroup: "all", priority: "essential" },
      { name: "Paneer", category: "Dairy", quantity: Math.ceil(familySize * 0.3), unit: "kg", estimated_price: 360, nutritionHighlight: "High protein", ageGroup: "all", priority: "high" },
      { name: "Fresh Onions", category: "Vegetables", quantity: Math.ceil(familySize * 1.5), unit: "kg", estimated_price: 80, nutritionHighlight: "Antioxidants", ageGroup: "all", priority: "essential" },
      { name: "Tomatoes", category: "Vegetables", quantity: Math.ceil(familySize * 1), unit: "kg", estimated_price: 60, nutritionHighlight: "Vitamin C, lycopene", ageGroup: "all", priority: "essential" },
      { name: "Potatoes", category: "Vegetables", quantity: Math.ceil(familySize * 1.5), unit: "kg", estimated_price: 50, nutritionHighlight: "Energy, potassium", ageGroup: "all", priority: "essential" },
      { name: "Green Leafy (Palak/Methi)", category: "Vegetables", quantity: Math.ceil(familySize * 0.5), unit: "kg", estimated_price: 80, nutritionHighlight: "Iron, vitamins", ageGroup: "all", priority: "high" },
      { name: "Mixed Vegetables", category: "Vegetables", quantity: Math.ceil(familySize * 2), unit: "kg", estimated_price: 200, nutritionHighlight: "Various vitamins", ageGroup: "all", priority: "essential" },
      { name: "Bananas", category: "Fruits", quantity: Math.ceil(familySize * 3), unit: "dozen", estimated_price: 180, nutritionHighlight: "Potassium, energy", ageGroup: "all", priority: "high" },
      { name: "Seasonal Apples", category: "Fruits", quantity: Math.ceil(familySize * 0.5), unit: "kg", estimated_price: 200, nutritionHighlight: "Fiber, vitamins", ageGroup: "all", priority: "medium" },
      { name: "Oranges/Mosambi", category: "Fruits", quantity: Math.ceil(familySize * 0.5), unit: "kg", estimated_price: 120, nutritionHighlight: "Vitamin C", ageGroup: "all", priority: "medium" },
      { name: "Refined Sunflower Oil", category: "Oils & Ghee", quantity: 2, unit: "L", estimated_price: 320, nutritionHighlight: "Healthy fats", ageGroup: "all", priority: "essential" },
      { name: "Pure Desi Ghee", category: "Oils & Ghee", quantity: 500, unit: "g", estimated_price: 350, nutritionHighlight: "Good fats, flavor", ageGroup: "all", priority: "high" },
      { name: "Mustard Oil", category: "Oils & Ghee", quantity: 1, unit: "L", estimated_price: 180, nutritionHighlight: "Heart healthy", ageGroup: "all", priority: "medium" },
      { name: "Sugar", category: "Grains & Cereals", quantity: 2, unit: "kg", estimated_price: 90, nutritionHighlight: "Energy", ageGroup: "all", priority: "essential" },
      { name: "Tea (Premium)", category: "Beverages", quantity: 500, unit: "g", estimated_price: 280, nutritionHighlight: "Antioxidants", ageGroup: "adults", priority: "high" },
      { name: "Turmeric Powder", category: "Spices", quantity: 200, unit: "g", estimated_price: 60, nutritionHighlight: "Anti-inflammatory", ageGroup: "all", priority: "essential" },
      { name: "Red Chili Powder", category: "Spices", quantity: 200, unit: "g", estimated_price: 80, nutritionHighlight: "Metabolism boost", ageGroup: "adults", priority: "essential" },
      { name: "Garam Masala", category: "Spices", quantity: 100, unit: "g", estimated_price: 75, nutritionHighlight: "Digestive aid", ageGroup: "all", priority: "essential" },
      { name: "Cumin Seeds", category: "Spices", quantity: 100, unit: "g", estimated_price: 50, nutritionHighlight: "Digestion", ageGroup: "all", priority: "essential" },
      { name: "Salt (Iodized)", category: "Spices", quantity: 1, unit: "kg", estimated_price: 25, nutritionHighlight: "Iodine", ageGroup: "all", priority: "essential" },
      { name: "Biscuits (Whole Wheat)", category: "Snacks", quantity: 4, unit: "packs", estimated_price: 160, nutritionHighlight: "Fiber snack", ageGroup: "children", priority: "medium" },
      { name: "Roasted Chana", category: "Snacks", quantity: 500, unit: "g", estimated_price: 80, nutritionHighlight: "Protein snack", ageGroup: "all", priority: "medium" },
      { name: "Eggs (if non-veg)", category: "Protein Sources", quantity: 30, unit: "pcs", estimated_price: 240, nutritionHighlight: "Complete protein", ageGroup: "all", priority: "high" },
    ],
    nutritionSummary: {
      proteinSources: ["Toor Dal", "Moong Dal", "Paneer", "Milk", "Eggs"],
      fiberRich: ["Whole Wheat Atta", "Vegetables", "Fruits", "Pulses"],
      calciumRich: ["Milk", "Curd", "Paneer", "Green Leafy Vegetables"],
      ironRich: ["Spinach", "Lentils", "Whole grains"],
      weeklyMealIdeas: [
        "Monday: Dal Tadka + Rice + Palak Sabzi",
        "Tuesday: Paneer Bhurji + Roti + Salad",
        "Wednesday: Rajma Chawal + Raita",
        "Thursday: Aloo Gobi + Roti + Dal Fry",
        "Friday: Chole + Bhature/Puri + Lassi",
        "Saturday: Mixed Veg Pulao + Kadhi",
        "Sunday: Special Paneer Curry + Jeera Rice + Kheer"
      ]
    },
    budgetBreakdown: {
      vegetables: Math.round(budget * 0.15),
      fruits: Math.round(budget * 0.08),
      dairy: Math.round(budget * 0.20),
      grains: Math.round(budget * 0.15),
      pulses: Math.round(budget * 0.10),
      oils: Math.round(budget * 0.10),
      spices: Math.round(budget * 0.05),
      snacks: Math.round(budget * 0.05),
      beverages: Math.round(budget * 0.04),
      protein: Math.round(budget * 0.08)
    },
    seasonalTips: [
      "Buy seasonal vegetables for better prices and freshness",
      "Stock up on grains and pulses during festive sales",
      "Fresh fruits are cheaper when bought from local vendors"
    ],
    savingsTips: [
      "Buy rice and atta in bulk for 10-15% savings",
      "Compare prices across BigBasket, JioMart, and local stores",
      "Use loyalty programs for additional discounts",
      "Buy seasonal produce for 20-30% savings"
    ],
    explanation: `This is a balanced ${familySize}-member family grocery plan optimized for nutrition and budget. It includes essential proteins from dal and dairy, fiber from whole grains, vitamins from fresh produce, and healthy fats from quality oils. The plan covers all meal types from breakfast to dinner with variety throughout the week.`
  };
}

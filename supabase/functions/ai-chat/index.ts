import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

interface ChatRequest {
  messages: Message[];
  context?: {
    cart?: { name: string; quantity: number; price: number }[];
    recentProducts?: string[];
    userPreferences?: string[];
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, context } = await req.json() as ChatRequest;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build context-aware system prompt
    let systemPrompt = `You are Flash Kart's AI Shopping Assistant - a friendly, helpful grocery expert. Your personality is warm, efficient, and knowledgeable about Indian groceries and cooking.

CAPABILITIES:
- Suggest products based on user needs, recipes, or dietary preferences
- Provide cooking tips and recipe suggestions
- Help find deals and savings opportunities
- Answer questions about products, nutrition, and ingredients
- Assist with grocery planning and meal prep
- Recommend alternatives for out-of-stock items

GUIDELINES:
- Keep responses concise and actionable (2-3 sentences max unless asked for details)
- When suggesting products, mention specific items available in the store
- Proactively suggest deals and savings when relevant
- Use friendly, conversational Indian English
- Include emojis sparingly for warmth 🛒
- If asked about prices, refer to current deals and comparisons
- Always be helpful about dietary restrictions (vegetarian, vegan, gluten-free, etc.)

AVAILABLE PRODUCT CATEGORIES:
Fruits & Vegetables, Dairy & Eggs, Meat & Fish, Bakery, Beverages, Snacks, Grains & Pulses, Spices & Masalas, Personal Care, Cleaning Supplies`;

    // Add cart context if available
    if (context?.cart && context.cart.length > 0) {
      const cartSummary = context.cart.map(item => `${item.name} (${item.quantity})`).join(", ");
      const cartTotal = context.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      systemPrompt += `\n\nCURRENT CART: ${cartSummary}\nTotal: ₹${cartTotal}`;
    }

    // Add user preferences if available
    if (context?.userPreferences && context.userPreferences.length > 0) {
      systemPrompt += `\n\nUSER PREFERENCES: ${context.userPreferences.join(", ")}`;
    }

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
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Too many requests. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Service temporarily unavailable. Please try again later." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "AI service error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Chat error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

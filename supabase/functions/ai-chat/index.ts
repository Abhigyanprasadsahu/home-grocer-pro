import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const MAX_MESSAGES = 50;
const MAX_MESSAGE_LENGTH = 5000;
const MAX_CART_ITEMS = 100;

function validateChatRequest(body: unknown): { messages: any[]; context?: any } {
  if (!body || typeof body !== "object") throw new Error("Invalid request body");
  const { messages, context } = body as any;
  if (!Array.isArray(messages) || messages.length === 0) throw new Error("Messages array is required");
  if (messages.length > MAX_MESSAGES) throw new Error(`Maximum ${MAX_MESSAGES} messages allowed`);
  for (const msg of messages) {
    if (!msg.role || !["user", "assistant", "system"].includes(msg.role)) throw new Error("Invalid message role");
    if (typeof msg.content !== "string" || msg.content.length > MAX_MESSAGE_LENGTH) throw new Error(`Message content must be a string under ${MAX_MESSAGE_LENGTH} characters`);
  }
  if (context) {
    if (context.cart && (!Array.isArray(context.cart) || context.cart.length > MAX_CART_ITEMS)) throw new Error(`Cart must have at most ${MAX_CART_ITEMS} items`);
    if (context.recentProducts && (!Array.isArray(context.recentProducts) || context.recentProducts.length > 50)) throw new Error("Too many recent products");
    if (context.userPreferences && (!Array.isArray(context.userPreferences) || context.userPreferences.length > 20)) throw new Error("Too many preferences");
  }
  return { messages, context };
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

    const userId = user.id;

    let body: unknown;
    try { body = await req.json(); } catch { 
      return new Response(JSON.stringify({ error: "Invalid JSON" }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    let messages, context;
    try { ({ messages, context } = validateChatRequest(body)); } catch (e) {
      return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Validation error" }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

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

    if (context?.cart && context.cart.length > 0) {
      const cartSummary = context.cart.slice(0, 20).map((item: any) => `${String(item.name).substring(0, 50)} (${item.quantity})`).join(", ");
      const cartTotal = context.cart.reduce((sum: number, item: any) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 0), 0);
      systemPrompt += `\n\nCURRENT CART: ${cartSummary}\nTotal: ₹${cartTotal}`;
    }

    if (context?.userPreferences && context.userPreferences.length > 0) {
      systemPrompt += `\n\nUSER PREFERENCES: ${context.userPreferences.slice(0, 10).join(", ")}`;
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [{ role: "system", content: systemPrompt }, ...messages],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) return new Response(JSON.stringify({ error: "Too many requests." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (response.status === 402) return new Response(JSON.stringify({ error: "Service temporarily unavailable." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      return new Response(JSON.stringify({ error: "AI service error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Chat error:", error);
    return new Response(JSON.stringify({ error: "An error occurred" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

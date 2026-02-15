import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const MAX_STRING_LENGTH = 200;
const MAX_ARRAY_ITEMS = 50;

function validateRequest(body: unknown): { recipe: any } {
  if (!body || typeof body !== "object") throw new Error("Invalid request body");
  const { recipe } = body as any;
  if (!recipe || typeof recipe !== "object") throw new Error("recipe object is required");
  if (typeof recipe.name !== "string" || recipe.name.length === 0 || recipe.name.length > MAX_STRING_LENGTH) throw new Error("recipe.name must be 1-200 characters");
  if (!Array.isArray(recipe.ingredients) || recipe.ingredients.length === 0 || recipe.ingredients.length > MAX_ARRAY_ITEMS) throw new Error(`ingredients must have 1-${MAX_ARRAY_ITEMS} items`);
  if (!Array.isArray(recipe.steps) || recipe.steps.length === 0 || recipe.steps.length > MAX_ARRAY_ITEMS) throw new Error(`steps must have 1-${MAX_ARRAY_ITEMS} items`);
  for (const i of recipe.ingredients) { if (typeof i !== "string" || i.length > MAX_STRING_LENGTH) throw new Error("Invalid ingredient"); }
  for (const s of recipe.steps) { if (typeof s !== "string" || s.length > 1000) throw new Error("Each step must be under 1000 characters"); }
  if (typeof recipe.cuisine !== "string" || recipe.cuisine.length > MAX_STRING_LENGTH) throw new Error("Invalid cuisine");
  if (recipe.prepTime !== undefined) { const t = Number(recipe.prepTime); if (isNaN(t) || t < 0 || t > 1440) throw new Error("prepTime must be 0-1440"); }
  if (recipe.cookTime !== undefined) { const t = Number(recipe.cookTime); if (isNaN(t) || t < 0 || t > 1440) throw new Error("cookTime must be 0-1440"); }
  return { recipe };
}

interface Scene {
  timestamp: string;
  duration: number;
  visual: string;
  text: string;
  voiceover: string;
  imagePrompt: string;
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

    const { recipe } = validated;
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) throw new Error("OPENAI_API_KEY is not configured");
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    const systemPrompt = `You are a creative food content creator making 20-second recipe videos for Gen-Z audience.
Create a 4-scene video breakdown with specific, highly detailed image prompts for each scene.
Each imagePrompt MUST describe a photorealistic, professional food photography scene. Include: lighting style (warm golden hour, studio softbox, moody backlit), camera angle (overhead flat-lay, 45-degree, close-up macro), food styling details (steam rising, sauce dripping, garnish placement), background/surface (rustic wood table, marble counter, dark slate), and mood (cozy, vibrant, elegant).
OUTPUT FORMAT (JSON only, no markdown):
{ "title": "Catchy title", "hook": "Opening hook", "scenes": [{ "timestamp": "0:00-0:05", "duration": 5, "visual": "Description", "text": "On-screen text", "voiceover": "Narration", "imagePrompt": "Ultra-detailed photorealistic food photography prompt" }], "hashtags": ["#recipe"], "musicStyle": "upbeat lo-fi beats" }`;

    const userPrompt = `Create a 20-second recipe video for:
Recipe: ${recipe.name}
Cuisine: ${recipe.cuisine}
Ingredients: ${recipe.ingredients.slice(0, 20).join(', ')}
Steps: ${recipe.steps.slice(0, 10).join('. ')}
IMPORTANT: Make each imagePrompt hyper-realistic with professional food photography details. Think Bon Appétit magazine quality.`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: "gpt-4o-mini", messages: [{ role: "system", content: systemPrompt }, { role: "user", content: userPrompt }] }),
    });

    if (!response.ok) throw new Error("Failed to generate video script");

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Failed to parse video script");

    const parsed = JSON.parse(jsonMatch[0]);

    // Limit scenes to max 4 to prevent excessive API calls
    if (parsed.scenes && Array.isArray(parsed.scenes)) {
      parsed.scenes = parsed.scenes.slice(0, 4);
      
      const imagePromises = parsed.scenes.map(async (scene: Scene, idx: number) => {
        try {
          const imageResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
            method: "POST",
            headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
            body: JSON.stringify({
              model: "google/gemini-2.5-flash-image-preview",
              messages: [{ role: "user", content: `Generate a photorealistic, ultra high quality food photography image: ${scene.imagePrompt || `Professional food photography of ${recipe.name}, ${scene.visual}. Shot with a 50mm lens, warm directional lighting, shallow depth of field, styled on a rustic wooden surface.`}` }],
              modalities: ["image", "text"],
            }),
          });

          if (imageResponse.ok) {
            const imageData = await imageResponse.json();
            const imageUrl = imageData.choices?.[0]?.message?.images?.[0]?.image_url?.url;
            return { idx, url: imageUrl || null };
          }
          return { idx, url: null };
        } catch { return { idx, url: null }; }
      });

      const results = await Promise.all(imagePromises);
      results.forEach(({ idx, url }: { idx: number; url: string | null }) => {
        if (parsed.scenes[idx]) parsed.scenes[idx].image = url;
      });
    }

    return new Response(JSON.stringify({ ...parsed, totalDuration: 20, frameRate: "5fps equivalent" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Recipe video error:", error);
    return new Response(JSON.stringify({ error: "An error occurred" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});

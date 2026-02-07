import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface VideoRequest {
  recipe: {
    name: string;
    ingredients: string[];
    steps: string[];
    cuisine: string;
    prepTime: number;
    cookTime: number;
  };
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

    const { recipe } = await req.json() as VideoRequest;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Generating video script for:", recipe.name);

    // Generate a video script with image prompts for each scene
    const systemPrompt = `You are a creative food content creator making 20-second recipe videos for Gen-Z audience.

Create a 4-scene video breakdown with specific image prompts for each scene.

OUTPUT FORMAT (JSON only, no markdown):
{
  "title": "Catchy video title with emoji",
  "hook": "Opening hook text",
  "scenes": [
    {
      "timestamp": "0:00-0:05",
      "duration": 5,
      "visual": "Description of scene",
      "text": "On-screen text overlay",
      "voiceover": "What narrator says",
      "imagePrompt": "Detailed prompt for generating this scene image - be very specific about colors, composition, lighting, style"
    }
  ],
  "hashtags": ["#recipe", "#foodie"],
  "musicStyle": "upbeat lo-fi beats"
}

SCENE BREAKDOWN:
1. Hook Scene (0-5s): Catchy opening with the final dish teaser
2. Ingredients Scene (5-10s): All ingredients laid out beautifully
3. Cooking Scene (10-15s): Key cooking moment action shot
4. Reveal Scene (15-20s): Final plated dish beauty shot

IMAGE PROMPT GUIDELINES:
- Food photography style, warm lighting
- Vibrant colors, appetizing presentation
- Professional quality, Instagram-worthy
- Include specific details about plating and garnish`;

    const userPrompt = `Create a 20-second recipe video for:

Recipe: ${recipe.name}
Cuisine: ${recipe.cuisine}
Ingredients: ${recipe.ingredients.join(', ')}
Steps: ${recipe.steps.join('. ')}

Make each scene visually stunning and viral-worthy!`;

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
      console.error("Script generation failed:", response.status);
      throw new Error("Failed to generate video script");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";
    
    console.log("Script generated, parsing...");

    // Parse JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Failed to parse video script");
    }

    const parsed = JSON.parse(jsonMatch[0]);
    console.log("Generating images for", parsed.scenes?.length || 0, "scenes");

    // Generate images for each scene in parallel
    const sceneImages: string[] = [];
    
    if (parsed.scenes && Array.isArray(parsed.scenes)) {
      const imagePromises = parsed.scenes.map(async (scene: Scene, idx: number) => {
        try {
          console.log(`Generating image for scene ${idx + 1}:`, scene.imagePrompt?.substring(0, 50));
          
          const imageResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${LOVABLE_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "google/gemini-2.5-flash-image-preview",
              messages: [
                {
                  role: "user",
                  content: scene.imagePrompt || `Professional food photography of ${recipe.name}, ${scene.visual}, warm lighting, appetizing, Instagram-worthy`,
                },
              ],
              modalities: ["image", "text"],
            }),
          });

          if (imageResponse.ok) {
            const imageData = await imageResponse.json();
            const imageUrl = imageData.choices?.[0]?.message?.images?.[0]?.image_url?.url;
            console.log(`Scene ${idx + 1} image generated:`, imageUrl ? "success" : "no image");
            return { idx, url: imageUrl || null };
          }
          console.error(`Scene ${idx + 1} image failed:`, imageResponse.status);
          return { idx, url: null };
        } catch (err) {
          console.error(`Scene ${idx + 1} image error:`, err);
          return { idx, url: null };
        }
      });

      const results = await Promise.all(imagePromises);
      results.sort((a, b) => a.idx - b.idx);
      
      // Add images to scenes
      results.forEach(({ idx, url }) => {
        if (parsed.scenes[idx]) {
          parsed.scenes[idx].image = url;
        }
      });
    }

    console.log("Video generation complete");

    return new Response(JSON.stringify({
      ...parsed,
      totalDuration: 20,
      frameRate: "5fps equivalent",
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Recipe video error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

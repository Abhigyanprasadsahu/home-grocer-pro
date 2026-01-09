import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { recipe } = await req.json() as VideoRequest;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Generate a video script optimized for Gen-Z audience
    const systemPrompt = `You are a creative food content creator making 20-second recipe videos for Gen-Z audience on social media.

Create a video script with:
1. HOOK (0-3 sec): Catchy one-liner or visual hook
2. QUICK INGREDIENTS (3-8 sec): Fast visual of ingredients
3. COOKING MONTAGE (8-18 sec): Quick cuts showing key steps
4. REVEAL (18-20 sec): Final dish with call-to-action

OUTPUT FORMAT (JSON):
{
  "title": "Catchy video title with emoji",
  "hook": "Opening hook text/voiceover",
  "scenes": [
    {
      "timestamp": "0:00-0:03",
      "visual": "Description of what's on screen",
      "text": "On-screen text",
      "voiceover": "What narrator says",
      "music": "Beat description"
    }
  ],
  "thumbnail": "Description of ideal thumbnail",
  "hashtags": ["#recipe", "#foodie", "#cooking"],
  "generatedImage": "A detailed prompt to generate a beautiful hero image of the final dish"
}

STYLE GUIDELINES:
- Use trendy Gen-Z language and emojis
- Fast-paced, attention-grabbing
- Make it ASMR-friendly with good sounds
- Include trending audio cues
- Focus on visual satisfaction`;

    const userPrompt = `Create a 20-second recipe video script for:

Recipe: ${recipe.name}
Cuisine: ${recipe.cuisine}
Total Time: ${recipe.prepTime + recipe.cookTime} minutes

Ingredients:
${recipe.ingredients.join('\n')}

Steps:
${recipe.steps.map((s, i) => `${i + 1}. ${s}`).join('\n')}

Make it viral-worthy and satisfying to watch!`;

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
        return new Response(JSON.stringify({ error: "Too many requests. Please try again." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Service temporarily unavailable." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error("AI service error");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";
    
    // Parse JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      
      // Generate the hero image for the video thumbnail
      try {
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
                content: `Food photography style: ${parsed.generatedImage || `A beautiful, appetizing hero shot of ${recipe.name}, Indian cuisine, professional food photography, warm lighting, garnished, on a traditional plate`}`,
              },
            ],
            modalities: ["image", "text"],
          }),
        });

        if (imageResponse.ok) {
          const imageData = await imageResponse.json();
          const generatedImageUrl = imageData.choices?.[0]?.message?.images?.[0]?.image_url?.url;
          if (generatedImageUrl) {
            parsed.thumbnailImage = generatedImageUrl;
          }
        }
      } catch (imgError) {
        console.error("Image generation failed:", imgError);
      }

      return new Response(JSON.stringify(parsed), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Failed to generate video script" }), {
      status: 500,
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

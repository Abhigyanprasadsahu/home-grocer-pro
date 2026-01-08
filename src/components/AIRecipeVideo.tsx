import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Video, Play, Loader2, Sparkles, Clock, Hash, Image, Share2 } from 'lucide-react';
import { toast } from 'sonner';

interface VideoScene {
  timestamp: string;
  visual: string;
  text: string;
  voiceover: string;
  music: string;
}

interface VideoScript {
  title: string;
  hook: string;
  scenes: VideoScene[];
  thumbnail: string;
  thumbnailImage?: string;
  hashtags: string[];
}

interface Recipe {
  name: string;
  ingredients: string[];
  steps: string[];
  cuisine: string;
  prepTime: number;
  cookTime: number;
}

interface AIRecipeVideoProps {
  isOpen: boolean;
  onClose: () => void;
  recipe: Recipe | null;
}

const AIRecipeVideo = ({ isOpen, onClose, recipe }: AIRecipeVideoProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [videoScript, setVideoScript] = useState<VideoScript | null>(null);
  const [currentScene, setCurrentScene] = useState(0);

  const generateVideoScript = async () => {
    if (!recipe) return;
    
    setIsGenerating(true);
    setVideoScript(null);

    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-recipe-video`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ recipe }),
      });

      if (response.status === 429) {
        toast.error('Too many requests. Please try again in a moment.');
        return;
      }

      if (response.status === 402) {
        toast.error('Service temporarily unavailable.');
        return;
      }

      if (!response.ok) throw new Error('Failed to generate video');

      const data: VideoScript = await response.json();
      setVideoScript(data);
      toast.success('Video script generated! 🎬');
    } catch (error) {
      console.error('Video generation error:', error);
      toast.error('Failed to generate video script. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const playScene = () => {
    if (!videoScript) return;
    
    const interval = setInterval(() => {
      setCurrentScene(prev => {
        if (prev >= videoScript.scenes.length - 1) {
          clearInterval(interval);
          return 0;
        }
        return prev + 1;
      });
    }, 3500);
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-display">
            <div className="p-2 rounded-lg bg-gradient-to-br from-pink-500/20 to-purple-500/20">
              <Video className="w-5 h-5 text-pink-500" />
            </div>
            AI Recipe Video Maker
            <Badge variant="outline" className="ml-auto text-xs bg-gradient-to-r from-pink-500/10 to-purple-500/10 border-pink-500/30">
              Gen-Z Style 🔥
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {!recipe ? (
            <div className="text-center py-12">
              <Video className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Select a recipe to generate a 20-second video</p>
            </div>
          ) : (
            <>
              {/* Recipe Info */}
              <div className="p-4 bg-secondary/50 rounded-xl">
                <h4 className="font-semibold mb-1">{recipe.name}</h4>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <span>{recipe.cuisine}</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {recipe.prepTime + recipe.cookTime} mins
                  </span>
                </div>
              </div>

              {/* Generate Button */}
              {!videoScript && (
                <Button
                  onClick={generateVideoScript}
                  disabled={isGenerating}
                  variant="hero"
                  className="w-full h-12 gap-2 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Creating viral video script...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      Generate 20-Sec Video Script
                    </>
                  )}
                </Button>
              )}

              {/* Video Script Result */}
              {videoScript && (
                <div className="space-y-4">
                  {/* Title & Hook */}
                  <div className="p-4 bg-gradient-to-br from-pink-500/10 to-purple-500/10 rounded-xl border border-pink-500/20">
                    <h3 className="font-display font-bold text-lg mb-2">{videoScript.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      <strong>Hook:</strong> {videoScript.hook}
                    </p>
                  </div>

                  {/* Thumbnail Preview */}
                  {videoScript.thumbnailImage && (
                    <div className="relative rounded-xl overflow-hidden">
                      <img 
                        src={videoScript.thumbnailImage} 
                        alt="Video thumbnail" 
                        className="w-full h-48 object-cover"
                      />
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                        <button
                          onClick={playScene}
                          className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center hover:scale-110 transition-transform"
                        >
                          <Play className="w-8 h-8 text-pink-500 ml-1" />
                        </button>
                      </div>
                      <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/70 text-white text-xs rounded">
                        0:20
                      </div>
                    </div>
                  )}

                  {/* Scene Timeline */}
                  <div className="space-y-2">
                    <h4 className="font-semibold flex items-center gap-2">
                      <Image className="w-4 h-4" />
                      Scene Breakdown
                    </h4>
                    <div className="space-y-2 max-h-[200px] overflow-y-auto">
                      {videoScript.scenes.map((scene, idx) => (
                        <div
                          key={idx}
                          className={`p-3 rounded-lg border transition-all ${
                            currentScene === idx
                              ? 'bg-pink-500/10 border-pink-500/50'
                              : 'bg-card border-border'
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="text-xs">
                              {scene.timestamp}
                            </Badge>
                            <span className="text-xs text-muted-foreground">{scene.music}</span>
                          </div>
                          <p className="text-sm font-medium mb-1">{scene.visual}</p>
                          {scene.text && (
                            <p className="text-xs text-pink-500">📝 "{scene.text}"</p>
                          )}
                          {scene.voiceover && (
                            <p className="text-xs text-purple-500">🎙️ {scene.voiceover}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Hashtags */}
                  <div className="p-3 bg-secondary/50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Hash className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Trending Hashtags</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {videoScript.hashtags.map((tag, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Thumbnail Description */}
                  <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                    <p className="text-xs text-amber-700">
                      <strong>📸 Thumbnail Tip:</strong> {videoScript.thumbnail}
                    </p>
                  </div>

                  {/* Share Button */}
                  <Button variant="outline" className="w-full gap-2">
                    <Share2 className="w-4 h-4" />
                    Share Script to Create Video
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AIRecipeVideo;

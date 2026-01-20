import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Video, Play, Pause, Loader2, Sparkles, Clock, Hash, RotateCcw, Volume2, VolumeX, Plus, X, ChefHat, Edit3 } from 'lucide-react';
import { toast } from 'sonner';
import { Progress } from '@/components/ui/progress';

interface VideoScene {
  timestamp: string;
  duration: number;
  visual: string;
  text: string;
  voiceover: string;
  image?: string;
}

interface VideoScript {
  title: string;
  hook: string;
  scenes: VideoScene[];
  hashtags: string[];
  musicStyle: string;
  totalDuration: number;
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
  recipe?: Recipe | null;
}

const AIRecipeVideo = ({ isOpen, onClose, recipe: initialRecipe }: AIRecipeVideoProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [videoScript, setVideoScript] = useState<VideoScript | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentScene, setCurrentScene] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [showCustomForm, setShowCustomForm] = useState(!initialRecipe);
  const [sceneTransition, setSceneTransition] = useState(false);
  
  // Custom recipe form state
  const [customRecipe, setCustomRecipe] = useState<Recipe>({
    name: '',
    ingredients: [''],
    steps: [''],
    cuisine: '',
    prepTime: 15,
    cookTime: 30,
  });
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const progressRef = useRef<NodeJS.Timeout | null>(null);

  // Get the active recipe (custom or initial)
  const activeRecipe = showCustomForm ? customRecipe : initialRecipe;

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (progressRef.current) clearInterval(progressRef.current);
    };
  }, []);

  // Reset when dialog closes
  useEffect(() => {
    if (!isOpen) {
      setIsPlaying(false);
      setCurrentScene(0);
      setProgress(0);
      setSceneTransition(false);
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (progressRef.current) clearInterval(progressRef.current);
    }
  }, [isOpen]);

  // Handle form input changes
  const updateRecipeField = (field: keyof Recipe, value: string | number | string[]) => {
    setCustomRecipe(prev => ({ ...prev, [field]: value }));
  };

  const addIngredient = () => {
    setCustomRecipe(prev => ({ ...prev, ingredients: [...prev.ingredients, ''] }));
  };

  const removeIngredient = (index: number) => {
    setCustomRecipe(prev => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index)
    }));
  };

  const updateIngredient = (index: number, value: string) => {
    setCustomRecipe(prev => ({
      ...prev,
      ingredients: prev.ingredients.map((ing, i) => i === index ? value : ing)
    }));
  };

  const addStep = () => {
    setCustomRecipe(prev => ({ ...prev, steps: [...prev.steps, ''] }));
  };

  const removeStep = (index: number) => {
    setCustomRecipe(prev => ({
      ...prev,
      steps: prev.steps.filter((_, i) => i !== index)
    }));
  };

  const updateStep = (index: number, value: string) => {
    setCustomRecipe(prev => ({
      ...prev,
      steps: prev.steps.map((step, i) => i === index ? value : step)
    }));
  };

  const isFormValid = () => {
    return (
      customRecipe.name.trim() !== '' &&
      customRecipe.cuisine.trim() !== '' &&
      customRecipe.ingredients.some(i => i.trim() !== '') &&
      customRecipe.steps.some(s => s.trim() !== '')
    );
  };

  const generateVideoScript = async () => {
    const recipeToUse = showCustomForm ? customRecipe : initialRecipe;
    if (!recipeToUse) return;

    // Clean up empty ingredients and steps
    const cleanedRecipe = {
      ...recipeToUse,
      ingredients: recipeToUse.ingredients.filter(i => i.trim() !== ''),
      steps: recipeToUse.steps.filter(s => s.trim() !== ''),
    };
    
    setIsGenerating(true);
    setVideoScript(null);
    setCurrentScene(0);
    setProgress(0);

    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-recipe-video`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ recipe: cleanedRecipe }),
      });

      if (response.status === 429) {
        toast.error('Too many requests. Please try again in a moment.');
        return;
      }

      if (!response.ok) throw new Error('Failed to generate video');

      const data: VideoScript = await response.json();
      setVideoScript(data);
      toast.success('Cinematic video ready! Press play to watch 🎬');
    } catch (error) {
      console.error('Video generation error:', error);
      toast.error('Failed to generate video. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const playVideo = () => {
    if (!videoScript || videoScript.scenes.length === 0) return;
    
    setIsPlaying(true);
    if (progress === 0 || progress >= 100) {
      setCurrentScene(0);
      setProgress(0);
    }

    const totalDuration = 20000; // 20 seconds
    const sceneDuration = totalDuration / videoScript.scenes.length;
    
    // Progress bar update (smoother - 50ms intervals)
    progressRef.current = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          return 100;
        }
        return prev + (100 / (totalDuration / 50));
      });
    }, 50);

    // Scene transitions with cinematic effect
    let sceneIndex = currentScene;
    intervalRef.current = setInterval(() => {
      sceneIndex++;
      if (sceneIndex >= videoScript.scenes.length) {
        // Video finished
        if (intervalRef.current) clearInterval(intervalRef.current);
        if (progressRef.current) clearInterval(progressRef.current);
        setIsPlaying(false);
        setProgress(100);
      } else {
        // Trigger transition animation
        setSceneTransition(true);
        setTimeout(() => {
          setCurrentScene(sceneIndex);
          setSceneTransition(false);
        }, 300);
      }
    }, sceneDuration);
  };

  const pauseVideo = () => {
    setIsPlaying(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (progressRef.current) clearInterval(progressRef.current);
  };

  const restartVideo = () => {
    pauseVideo();
    setCurrentScene(0);
    setProgress(0);
    setTimeout(playVideo, 100);
  };

  const currentSceneData = videoScript?.scenes[currentScene];

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="p-4 pb-0">
          <DialogTitle className="flex items-center gap-2 text-xl font-display">
            <div className="p-2 rounded-lg bg-gradient-to-br from-pink-500/20 to-purple-500/20">
              <Video className="w-5 h-5 text-pink-500" />
            </div>
            AI Recipe Video Maker
            <Badge variant="outline" className="ml-auto text-xs bg-gradient-to-r from-pink-500/10 to-purple-500/10 border-pink-500/30">
              Cinematic 4K 🎬
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="p-4 space-y-4">
          {/* Toggle between custom form and preset recipe */}
          {initialRecipe && !videoScript && (
            <div className="flex gap-2">
              <Button
                variant={!showCustomForm ? "default" : "outline"}
                size="sm"
                onClick={() => setShowCustomForm(false)}
                className="flex-1"
              >
                <ChefHat className="w-4 h-4 mr-2" />
                Use Sample Recipe
              </Button>
              <Button
                variant={showCustomForm ? "default" : "outline"}
                size="sm"
                onClick={() => setShowCustomForm(true)}
                className="flex-1"
              >
                <Edit3 className="w-4 h-4 mr-2" />
                Custom Recipe
              </Button>
            </div>
          )}

          {/* Custom Recipe Form */}
          {showCustomForm && !videoScript && (
            <div className="space-y-4 p-4 bg-secondary/30 rounded-xl border border-border">
              <h4 className="font-semibold flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-primary" />
                Create Your Recipe
              </h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 sm:col-span-1">
                  <Label htmlFor="recipeName">Recipe Name *</Label>
                  <Input
                    id="recipeName"
                    placeholder="e.g., Spicy Garlic Noodles"
                    value={customRecipe.name}
                    onChange={(e) => updateRecipeField('name', e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <Label htmlFor="cuisine">Cuisine *</Label>
                  <Input
                    id="cuisine"
                    placeholder="e.g., Asian Fusion"
                    value={customRecipe.cuisine}
                    onChange={(e) => updateRecipeField('cuisine', e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="prepTime">Prep Time (mins)</Label>
                  <Input
                    id="prepTime"
                    type="number"
                    min={1}
                    value={customRecipe.prepTime}
                    onChange={(e) => updateRecipeField('prepTime', parseInt(e.target.value) || 0)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="cookTime">Cook Time (mins)</Label>
                  <Input
                    id="cookTime"
                    type="number"
                    min={1}
                    value={customRecipe.cookTime}
                    onChange={(e) => updateRecipeField('cookTime', parseInt(e.target.value) || 0)}
                    className="mt-1"
                  />
                </div>
              </div>

              {/* Ingredients */}
              <div>
                <Label className="flex items-center justify-between">
                  <span>Ingredients *</span>
                  <Button type="button" variant="ghost" size="sm" onClick={addIngredient}>
                    <Plus className="w-4 h-4 mr-1" /> Add
                  </Button>
                </Label>
                <div className="space-y-2 mt-1">
                  {customRecipe.ingredients.map((ingredient, idx) => (
                    <div key={idx} className="flex gap-2">
                      <Input
                        placeholder={`Ingredient ${idx + 1}`}
                        value={ingredient}
                        onChange={(e) => updateIngredient(idx, e.target.value)}
                      />
                      {customRecipe.ingredients.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeIngredient(idx)}
                          className="shrink-0"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Steps */}
              <div>
                <Label className="flex items-center justify-between">
                  <span>Cooking Steps *</span>
                  <Button type="button" variant="ghost" size="sm" onClick={addStep}>
                    <Plus className="w-4 h-4 mr-1" /> Add
                  </Button>
                </Label>
                <div className="space-y-2 mt-1">
                  {customRecipe.steps.map((step, idx) => (
                    <div key={idx} className="flex gap-2">
                      <Textarea
                        placeholder={`Step ${idx + 1}: Describe the action...`}
                        value={step}
                        onChange={(e) => updateStep(idx, e.target.value)}
                        rows={2}
                        className="min-h-[60px]"
                      />
                      {customRecipe.steps.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeStep(idx)}
                          className="shrink-0"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Recipe Info Display (for preset recipe) */}
          {!showCustomForm && activeRecipe && !videoScript && (
            <div className="p-4 bg-secondary/50 rounded-xl">
              <h4 className="font-semibold mb-1">{activeRecipe.name}</h4>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <span>{activeRecipe.cuisine}</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {activeRecipe.prepTime + activeRecipe.cookTime} mins
                </span>
              </div>
              <div className="mt-2 text-xs text-muted-foreground">
                <p><span className="font-medium">Ingredients:</span> {activeRecipe.ingredients.slice(0, 4).join(', ')}{activeRecipe.ingredients.length > 4 ? '...' : ''}</p>
              </div>
            </div>
          )}

          {/* Generate Button */}
          {!videoScript && (
            <Button
              onClick={generateVideoScript}
              disabled={isGenerating || (showCustomForm && !isFormValid())}
              className="w-full h-12 gap-2 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Creating cinematic video... (30-60 sec)
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Generate Cinematic Video
                </>
              )}
            </Button>
          )}

          {/* Cinematic Video Player */}
          {videoScript && (
            <div className="space-y-4">
              {/* Title */}
              <h3 className="font-display font-bold text-lg text-center">{videoScript.title}</h3>

              {/* Cinematic Video Display - 16:9 aspect ratio for more realistic feel */}
              <div className="relative aspect-video max-h-[450px] mx-auto bg-black rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10">
                {/* Film grain overlay for cinematic effect */}
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIj48ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iLjc1IiBzdGl0Y2hUaWxlcz0ic3RpdGNoIi8+PC9maWx0ZXI+PHJlY3Qgd2lkdGg9IjMwMCIgaGVpZ2h0PSIzMDAiIGZpbHRlcj0idXJsKCNhKSIgb3BhY2l0eT0iMC4wNSIvPjwvc3ZnPg==')] opacity-30 pointer-events-none z-10" />
                
                {/* Scene Image with transitions */}
                <div className={`absolute inset-0 transition-all duration-500 ease-in-out ${sceneTransition ? 'opacity-0 scale-105' : 'opacity-100 scale-100'}`}>
                  {currentSceneData?.image ? (
                    <img 
                      src={currentSceneData.image} 
                      alt={currentSceneData.visual}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
                      <div className="text-center p-6">
                        <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-3 animate-pulse">
                          <Video className="w-8 h-8 text-white/70" />
                        </div>
                        <p className="text-white/80 text-sm max-w-xs">{currentSceneData?.visual || 'Loading scene...'}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Cinematic letterbox bars */}
                <div className="absolute top-0 left-0 right-0 h-6 bg-gradient-to-b from-black to-transparent z-20" />
                <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-black to-transparent z-20" />

                {/* Overlay Content */}
                <div className="absolute inset-0 z-30">
                  {/* Top bar - cinematic style */}
                  <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                      <Badge className="bg-black/60 text-white border-0 backdrop-blur-sm text-xs">
                        Scene {currentScene + 1} of {videoScript.scenes.length}
                      </Badge>
                    </div>
                    <span className="bg-black/60 text-white/90 text-xs font-mono px-2 py-1 rounded backdrop-blur-sm">
                      {currentSceneData?.timestamp}
                    </span>
                  </div>

                  {/* Bottom content - cinematic lower third */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/90 via-black/60 to-transparent">
                    {currentSceneData?.text && (
                      <div className={`transition-all duration-500 ${sceneTransition ? 'translate-y-4 opacity-0' : 'translate-y-0 opacity-100'}`}>
                        <p className="text-white font-bold text-xl mb-2 drop-shadow-2xl tracking-wide">
                          {currentSceneData.text}
                        </p>
                      </div>
                    )}
                    {currentSceneData?.voiceover && !isMuted && (
                      <div className={`flex items-start gap-2 transition-all duration-500 delay-100 ${sceneTransition ? 'translate-y-4 opacity-0' : 'translate-y-0 opacity-100'}`}>
                        <span className="text-lg">🎙️</span>
                        <p className="text-white/80 text-sm italic leading-relaxed">
                          "{currentSceneData.voiceover}"
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Center Play Button (when not playing) */}
                  {!isPlaying && progress === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                      <button
                        onClick={playVideo}
                        className="w-24 h-24 rounded-full bg-white/95 flex items-center justify-center hover:scale-110 transition-all duration-300 shadow-2xl group"
                      >
                        <Play className="w-12 h-12 text-pink-500 ml-1 group-hover:text-pink-600 transition-colors" />
                      </button>
                    </div>
                  )}

                  {/* Replay button when finished */}
                  {!isPlaying && progress >= 100 && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                      <button
                        onClick={restartVideo}
                        className="w-24 h-24 rounded-full bg-white/95 flex items-center justify-center hover:scale-110 transition-all duration-300 shadow-2xl group"
                      >
                        <RotateCcw className="w-10 h-10 text-pink-500 group-hover:text-pink-600 transition-colors" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Cinematic Progress Bar */}
                <div className="absolute bottom-0 left-0 right-0 z-40">
                  <div className="h-1 bg-white/20">
                    <div 
                      className="h-full bg-gradient-to-r from-pink-500 to-purple-500 transition-all duration-100 ease-linear"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={restartVideo}
                  className="rounded-full h-10 w-10"
                >
                  <RotateCcw className="w-4 h-4" />
                </Button>
                
                <Button
                  onClick={isPlaying ? pauseVideo : playVideo}
                  className="rounded-full px-8 h-12 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 shadow-lg"
                >
                  {isPlaying ? (
                    <>
                      <Pause className="w-5 h-5 mr-2" />
                      Pause
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5 mr-2" />
                      {progress > 0 && progress < 100 ? 'Resume' : 'Play'}
                    </>
                  )}
                </Button>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setIsMuted(!isMuted)}
                  className="rounded-full h-10 w-10"
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </Button>
              </div>

              {/* Music Style */}
              <div className="text-center text-sm text-muted-foreground">
                🎵 {videoScript.musicStyle}
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

              {/* Generate New */}
              <Button 
                variant="outline" 
                onClick={() => {
                  setVideoScript(null);
                  setProgress(0);
                  setCurrentScene(0);
                }}
                className="w-full"
              >
                Create Another Video
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AIRecipeVideo;

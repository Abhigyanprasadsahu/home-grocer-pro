import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Video, Play, Pause, Loader2, Sparkles, Clock, Hash, RotateCcw, Volume2, VolumeX, Plus, X, ChefHat, Edit3, Utensils, Timer, Film, Clapperboard, Share2, Download, Heart } from 'lucide-react';
import { toast } from 'sonner';

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
  const [isLiked, setIsLiked] = useState(false);
  const [generationStep, setGenerationStep] = useState(0);
  
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

  const generationSteps = [
    { icon: '🎬', text: 'Analyzing recipe...' },
    { icon: '🎨', text: 'Creating visual scenes...' },
    { icon: '✨', text: 'Generating AI images...' },
    { icon: '🎵', text: 'Adding finishing touches...' },
  ];

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
      setGenerationStep(0);
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (progressRef.current) clearInterval(progressRef.current);
    }
  }, [isOpen]);

  // Animate generation steps
  useEffect(() => {
    if (isGenerating) {
      const stepInterval = setInterval(() => {
        setGenerationStep(prev => (prev + 1) % generationSteps.length);
      }, 3000);
      return () => clearInterval(stepInterval);
    }
  }, [isGenerating]);

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
    setGenerationStep(0);

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
      toast.success('Your cinematic video is ready! 🎬');
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
      <DialogContent className="max-w-3xl max-h-[92vh] overflow-y-auto p-0 bg-gradient-to-b from-background via-background to-secondary/20 border-border/50 shadow-2xl">
        {/* Premium Header */}
        <DialogHeader className="p-5 pb-0 border-b border-border/30">
          <DialogTitle className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl blur-lg opacity-40 animate-pulse" />
              <div className="relative p-2.5 rounded-xl bg-gradient-to-br from-pink-500/20 to-purple-600/20 border border-pink-500/20">
                <Clapperboard className="w-5 h-5 text-pink-500" />
              </div>
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-display font-semibold tracking-tight">AI Recipe Video Studio</h2>
              <p className="text-xs text-muted-foreground font-normal">Create stunning recipe videos in seconds</p>
            </div>
            <Badge className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 text-amber-600 border-amber-500/20 text-[10px] px-2 py-0.5 font-medium">
              ✨ PRO
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="p-5 space-y-5">
          {/* Toggle Tabs - Premium Style */}
          {initialRecipe && !videoScript && !isGenerating && (
            <div className="flex p-1 bg-secondary/50 rounded-xl border border-border/50">
              <button
                onClick={() => setShowCustomForm(false)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-all duration-300 ${
                  !showCustomForm 
                    ? 'bg-background text-foreground shadow-sm border border-border/50' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <ChefHat className="w-4 h-4" />
                Sample Recipe
              </button>
              <button
                onClick={() => setShowCustomForm(true)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-all duration-300 ${
                  showCustomForm 
                    ? 'bg-background text-foreground shadow-sm border border-border/50' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Edit3 className="w-4 h-4" />
                Custom Recipe
              </button>
            </div>
          )}

          {/* Custom Recipe Form - Premium Design */}
          {showCustomForm && !videoScript && !isGenerating && (
            <div className="space-y-5 p-5 bg-gradient-to-br from-secondary/30 to-secondary/10 rounded-2xl border border-border/50 backdrop-blur-sm">
              <div className="flex items-center gap-2 pb-3 border-b border-border/30">
                <div className="p-1.5 rounded-lg bg-primary/10">
                  <Utensils className="w-4 h-4 text-primary" />
                </div>
                <h4 className="font-semibold text-sm">Recipe Details</h4>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="recipeName" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Recipe Name</Label>
                  <Input
                    id="recipeName"
                    placeholder="e.g., Spicy Garlic Noodles"
                    value={customRecipe.name}
                    onChange={(e) => updateRecipeField('name', e.target.value)}
                    className="h-11 bg-background/50 border-border/50 focus:border-primary/50 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cuisine" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Cuisine Type</Label>
                  <Input
                    id="cuisine"
                    placeholder="e.g., Asian Fusion"
                    value={customRecipe.cuisine}
                    onChange={(e) => updateRecipeField('cuisine', e.target.value)}
                    className="h-11 bg-background/50 border-border/50 focus:border-primary/50 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="prepTime" className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <Timer className="w-3 h-3" /> Prep Time
                  </Label>
                  <div className="relative">
                    <Input
                      id="prepTime"
                      type="number"
                      min={1}
                      value={customRecipe.prepTime}
                      onChange={(e) => updateRecipeField('prepTime', parseInt(e.target.value) || 0)}
                      className="h-11 bg-background/50 border-border/50 pr-12"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">mins</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cookTime" className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <Clock className="w-3 h-3" /> Cook Time
                  </Label>
                  <div className="relative">
                    <Input
                      id="cookTime"
                      type="number"
                      min={1}
                      value={customRecipe.cookTime}
                      onChange={(e) => updateRecipeField('cookTime', parseInt(e.target.value) || 0)}
                      className="h-11 bg-background/50 border-border/50 pr-12"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">mins</span>
                  </div>
                </div>
              </div>

              {/* Ingredients */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Ingredients</Label>
                  <Button type="button" variant="ghost" size="sm" onClick={addIngredient} className="h-7 text-xs text-primary hover:text-primary hover:bg-primary/10">
                    <Plus className="w-3 h-3 mr-1" /> Add More
                  </Button>
                </div>
                <div className="space-y-2">
                  {customRecipe.ingredients.map((ingredient, idx) => (
                    <div key={idx} className="flex gap-2 group animate-fade-in">
                      <div className="flex items-center justify-center w-7 h-11 rounded-lg bg-secondary/50 text-xs font-medium text-muted-foreground shrink-0">
                        {idx + 1}
                      </div>
                      <Input
                        placeholder={`e.g., 2 cups of flour`}
                        value={ingredient}
                        onChange={(e) => updateIngredient(idx, e.target.value)}
                        className="h-11 bg-background/50 border-border/50 placeholder:text-muted-foreground/50"
                      />
                      {customRecipe.ingredients.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeIngredient(idx)}
                          className="shrink-0 h-11 w-11 text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Steps */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Cooking Steps</Label>
                  <Button type="button" variant="ghost" size="sm" onClick={addStep} className="h-7 text-xs text-primary hover:text-primary hover:bg-primary/10">
                    <Plus className="w-3 h-3 mr-1" /> Add Step
                  </Button>
                </div>
                <div className="space-y-2">
                  {customRecipe.steps.map((step, idx) => (
                    <div key={idx} className="flex gap-2 group animate-fade-in">
                      <div className="flex items-center justify-center w-7 h-[68px] rounded-lg bg-gradient-to-b from-primary/20 to-primary/10 text-xs font-bold text-primary shrink-0">
                        {idx + 1}
                      </div>
                      <Textarea
                        placeholder={`Describe step ${idx + 1}...`}
                        value={step}
                        onChange={(e) => updateStep(idx, e.target.value)}
                        rows={2}
                        className="min-h-[68px] bg-background/50 border-border/50 resize-none placeholder:text-muted-foreground/50"
                      />
                      {customRecipe.steps.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeStep(idx)}
                          className="shrink-0 h-[68px] w-11 text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity"
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
          {!showCustomForm && activeRecipe && !videoScript && !isGenerating && (
            <div className="p-5 bg-gradient-to-br from-secondary/30 to-secondary/10 rounded-2xl border border-border/50">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-orange-500/20 to-amber-500/20 flex items-center justify-center shrink-0">
                  <ChefHat className="w-7 h-7 text-orange-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-display font-semibold text-lg leading-tight">{activeRecipe.name}</h4>
                  <div className="flex items-center gap-3 mt-1.5">
                    <Badge variant="secondary" className="text-xs font-normal">{activeRecipe.cuisine}</Badge>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {activeRecipe.prepTime + activeRecipe.cookTime} mins total
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {activeRecipe.ingredients.slice(0, 5).map((ing, idx) => (
                      <span key={idx} className="text-[10px] px-2 py-0.5 rounded-full bg-background/80 border border-border/50 text-muted-foreground">
                        {ing}
                      </span>
                    ))}
                    {activeRecipe.ingredients.length > 5 && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                        +{activeRecipe.ingredients.length - 5} more
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Generation Loading State - Premium */}
          {isGenerating && (
            <div className="py-12 space-y-6">
              <div className="relative mx-auto w-24 h-24">
                <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full blur-xl opacity-40 animate-pulse" />
                <div className="relative w-full h-full rounded-full bg-gradient-to-br from-pink-500/20 to-purple-500/20 border border-pink-500/30 flex items-center justify-center">
                  <Film className="w-10 h-10 text-pink-500 animate-pulse" />
                </div>
                <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-pink-500 animate-spin" />
              </div>
              
              <div className="text-center space-y-2">
                <div className="flex items-center justify-center gap-2 text-lg font-medium">
                  <span className="text-2xl">{generationSteps[generationStep].icon}</span>
                  <span>{generationSteps[generationStep].text}</span>
                </div>
                <p className="text-sm text-muted-foreground">This may take 30-60 seconds</p>
              </div>

              <div className="flex justify-center gap-1.5">
                {generationSteps.map((_, idx) => (
                  <div
                    key={idx}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      idx === generationStep ? 'bg-pink-500 w-6' : 'bg-border'
                    }`}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Generate Button */}
          {!videoScript && !isGenerating && (
            <Button
              onClick={generateVideoScript}
              disabled={showCustomForm && !isFormValid()}
              className="w-full h-14 gap-3 text-base font-semibold bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 hover:from-pink-600 hover:via-purple-600 hover:to-indigo-600 text-white shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all duration-300 rounded-xl"
            >
              <Sparkles className="w-5 h-5" />
              Generate Cinematic Video
            </Button>
          )}

          {/* Cinematic Video Player - Premium */}
          {videoScript && (
            <div className="space-y-5 animate-fade-in">
              {/* Title */}
              <div className="text-center space-y-1">
                <h3 className="font-display font-bold text-xl">{videoScript.title}</h3>
                <p className="text-sm text-muted-foreground">{videoScript.hook}</p>
              </div>

              {/* Video Display - Cinema Quality */}
              <div className="relative aspect-video mx-auto bg-black rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/5">
                {/* Ambient glow */}
                <div className="absolute -inset-1 bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-indigo-500/20 rounded-2xl blur-xl opacity-50" />
                
                <div className="relative w-full h-full rounded-2xl overflow-hidden">
                  {/* Film grain overlay */}
                  <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIj48ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iLjc1IiBzdGl0Y2hUaWxlcz0ic3RpdGNoIi8+PC9maWx0ZXI+PHJlY3Qgd2lkdGg9IjMwMCIgaGVpZ2h0PSIzMDAiIGZpbHRlcj0idXJsKCNhKSIgb3BhY2l0eT0iMC4wNSIvPjwvc3ZnPg==')] opacity-20 pointer-events-none z-10" />
                  
                  {/* Scene Image with transitions */}
                  <div className={`absolute inset-0 transition-all duration-500 ease-out ${sceneTransition ? 'opacity-0 scale-110 blur-sm' : 'opacity-100 scale-100 blur-0'}`}>
                    {currentSceneData?.image ? (
                      <img 
                        src={currentSceneData.image} 
                        alt={currentSceneData.visual}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-slate-900 via-purple-900/50 to-slate-900 flex items-center justify-center">
                        <div className="text-center p-8 max-w-md">
                          <div className="w-20 h-20 rounded-2xl bg-white/5 backdrop-blur flex items-center justify-center mx-auto mb-4">
                            <Video className="w-10 h-10 text-white/60" />
                          </div>
                          <p className="text-white/70 text-sm leading-relaxed">{currentSceneData?.visual || 'Loading scene...'}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Cinematic vignette */}
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.3)_100%)] pointer-events-none z-20" />

                  {/* Overlay Content */}
                  <div className="absolute inset-0 z-30">
                    {/* Top bar */}
                    <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/60 to-transparent">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <div className="relative flex items-center gap-1.5 bg-black/40 backdrop-blur-sm rounded-full px-2.5 py-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                            <span className="text-[10px] font-medium text-white/90 uppercase tracking-wider">Live</span>
                          </div>
                          <Badge className="bg-white/10 backdrop-blur-sm text-white/90 border-0 text-[10px] font-medium">
                            Scene {currentScene + 1}/{videoScript.scenes.length}
                          </Badge>
                        </div>
                        <span className="bg-black/40 backdrop-blur-sm text-white/80 text-xs font-mono px-2.5 py-1 rounded-full">
                          {currentSceneData?.timestamp}
                        </span>
                      </div>
                    </div>

                    {/* Bottom content - cinematic lower third */}
                    <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black via-black/80 to-transparent">
                      <div className={`space-y-2 transition-all duration-500 ${sceneTransition ? 'translate-y-6 opacity-0' : 'translate-y-0 opacity-100'}`}>
                        {currentSceneData?.text && (
                          <p className="text-white font-bold text-xl leading-tight tracking-wide drop-shadow-lg">
                            {currentSceneData.text}
                          </p>
                        )}
                        {currentSceneData?.voiceover && !isMuted && (
                          <div className="flex items-start gap-2 max-w-lg">
                            <span className="text-lg shrink-0">🎙️</span>
                            <p className="text-white/70 text-sm italic leading-relaxed">
                              "{currentSceneData.voiceover}"
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Center Play Button (when not playing) */}
                    {!isPlaying && progress === 0 && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-[2px]">
                        <button
                          onClick={playVideo}
                          className="group relative w-28 h-28"
                        >
                          <div className="absolute inset-0 bg-white/20 rounded-full blur-xl group-hover:bg-white/30 transition-all" />
                          <div className="relative w-full h-full rounded-full bg-white/95 flex items-center justify-center shadow-2xl group-hover:scale-105 transition-transform duration-300">
                            <Play className="w-12 h-12 text-pink-500 ml-2" />
                          </div>
                        </button>
                      </div>
                    )}

                    {/* Replay button when finished */}
                    {!isPlaying && progress >= 100 && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                        <div className="text-center space-y-4">
                          <button
                            onClick={restartVideo}
                            className="group relative w-24 h-24 mx-auto"
                          >
                            <div className="absolute inset-0 bg-white/20 rounded-full blur-xl group-hover:bg-white/30 transition-all" />
                            <div className="relative w-full h-full rounded-full bg-white/95 flex items-center justify-center shadow-2xl group-hover:scale-105 transition-transform duration-300">
                              <RotateCcw className="w-10 h-10 text-pink-500" />
                            </div>
                          </button>
                          <p className="text-white/80 text-sm font-medium">Watch Again</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Scene timeline */}
                  <div className="absolute bottom-0 left-0 right-0 z-40 flex">
                    {videoScript.scenes.map((_, idx) => (
                      <div key={idx} className="flex-1 h-1 relative">
                        <div className="absolute inset-0 bg-white/20" />
                        <div 
                          className={`absolute inset-y-0 left-0 bg-gradient-to-r from-pink-500 to-purple-500 transition-all duration-100 ${
                            idx < currentScene ? 'w-full' : idx === currentScene ? '' : 'w-0'
                          }`}
                          style={idx === currentScene ? { 
                            width: `${((progress - (idx * (100 / videoScript.scenes.length))) / (100 / videoScript.scenes.length)) * 100}%` 
                          } : undefined}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Controls - Premium */}
              <div className="flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={restartVideo}
                  className="rounded-full h-11 w-11 border-border/50 hover:bg-secondary/80"
                >
                  <RotateCcw className="w-4 h-4" />
                </Button>
                
                <Button
                  onClick={isPlaying ? pauseVideo : playVideo}
                  className="rounded-full px-8 h-12 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 shadow-lg shadow-purple-500/25"
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
                  className="rounded-full h-11 w-11 border-border/50 hover:bg-secondary/80"
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </Button>
              </div>

              {/* Social Actions */}
              <div className="flex items-center justify-center gap-3">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setIsLiked(!isLiked)}
                  className={`rounded-full gap-2 ${isLiked ? 'text-red-500 border-red-500/30 bg-red-500/10' : ''}`}
                >
                  <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                  {isLiked ? 'Liked!' : 'Like'}
                </Button>
                <Button variant="outline" size="sm" className="rounded-full gap-2">
                  <Share2 className="w-4 h-4" />
                  Share
                </Button>
                <Button variant="outline" size="sm" className="rounded-full gap-2">
                  <Download className="w-4 h-4" />
                  Save
                </Button>
              </div>

              {/* Music & Info */}
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <span className="text-lg">🎵</span>
                <span>{videoScript.musicStyle}</span>
              </div>

              {/* Hashtags - Premium */}
              <div className="p-4 bg-secondary/30 rounded-xl border border-border/30">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-1 rounded bg-primary/10">
                    <Hash className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Trending Hashtags</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {videoScript.hashtags.map((tag, idx) => (
                    <span 
                      key={idx} 
                      className="text-xs px-2.5 py-1 rounded-full bg-background/80 border border-border/50 text-muted-foreground hover:text-foreground hover:border-primary/30 cursor-pointer transition-colors"
                    >
                      {tag}
                    </span>
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
                  setIsLiked(false);
                }}
                className="w-full h-11 rounded-xl border-dashed border-2 hover:border-primary/50 hover:bg-primary/5"
              >
                <Sparkles className="w-4 h-4 mr-2" />
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

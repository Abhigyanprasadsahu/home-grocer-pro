import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Video, Play, Pause, Loader2, Sparkles, Clock, Hash, RotateCcw, Volume2, VolumeX } from 'lucide-react';
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
  recipe: Recipe | null;
}

const AIRecipeVideo = ({ isOpen, onClose, recipe }: AIRecipeVideoProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [videoScript, setVideoScript] = useState<VideoScript | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentScene, setCurrentScene] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const progressRef = useRef<NodeJS.Timeout | null>(null);

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
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (progressRef.current) clearInterval(progressRef.current);
    }
  }, [isOpen]);

  const generateVideoScript = async () => {
    if (!recipe) return;
    
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
        body: JSON.stringify({ recipe }),
      });

      if (response.status === 429) {
        toast.error('Too many requests. Please try again in a moment.');
        return;
      }

      if (!response.ok) throw new Error('Failed to generate video');

      const data: VideoScript = await response.json();
      setVideoScript(data);
      toast.success('Video ready! Press play to watch 🎬');
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
    setCurrentScene(0);
    setProgress(0);

    const totalDuration = 20000; // 20 seconds
    const sceneDuration = totalDuration / videoScript.scenes.length;
    
    // Progress bar update
    progressRef.current = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          return 100;
        }
        return prev + (100 / (totalDuration / 100));
      });
    }, 100);

    // Scene transitions
    let sceneIndex = 0;
    intervalRef.current = setInterval(() => {
      sceneIndex++;
      if (sceneIndex >= videoScript.scenes.length) {
        // Video finished
        if (intervalRef.current) clearInterval(intervalRef.current);
        if (progressRef.current) clearInterval(progressRef.current);
        setIsPlaying(false);
        setProgress(100);
      } else {
        setCurrentScene(sceneIndex);
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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="p-4 pb-0">
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

        <div className="p-4 space-y-4">
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
                  className="w-full h-12 gap-2 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Creating AI video... (30-60 sec)
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      Generate 20-Sec Video
                    </>
                  )}
                </Button>
              )}

              {/* Video Player */}
              {videoScript && (
                <div className="space-y-4">
                  {/* Title */}
                  <h3 className="font-display font-bold text-lg text-center">{videoScript.title}</h3>

                  {/* Video Display Area */}
                  <div className="relative aspect-[9/16] max-h-[400px] mx-auto bg-black rounded-xl overflow-hidden">
                    {/* Scene Image */}
                    {currentSceneData?.image ? (
                      <img 
                        src={currentSceneData.image} 
                        alt={currentSceneData.visual}
                        className="w-full h-full object-cover transition-opacity duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-pink-900 to-purple-900 flex items-center justify-center">
                        <div className="text-center p-4">
                          <Video className="w-12 h-12 text-white/50 mx-auto mb-2" />
                          <p className="text-white/70 text-sm">{currentSceneData?.visual || 'Loading scene...'}</p>
                        </div>
                      </div>
                    )}

                    {/* Overlay Text */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30">
                      {/* Top - Scene indicator */}
                      <div className="absolute top-3 left-3 right-3 flex justify-between items-center">
                        <Badge className="bg-white/20 text-white border-0">
                          Scene {currentScene + 1}/{videoScript.scenes.length}
                        </Badge>
                        <span className="text-white/80 text-xs font-mono">
                          {currentSceneData?.timestamp}
                        </span>
                      </div>

                      {/* Bottom - Text overlay */}
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        {currentSceneData?.text && (
                          <p className="text-white font-bold text-lg mb-2 drop-shadow-lg animate-fade-in">
                            {currentSceneData.text}
                          </p>
                        )}
                        {currentSceneData?.voiceover && (
                          <p className="text-white/80 text-sm italic">
                            🎙️ "{currentSceneData.voiceover}"
                          </p>
                        )}
                      </div>

                      {/* Center Play Button (when not playing) */}
                      {!isPlaying && progress === 0 && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <button
                            onClick={playVideo}
                            className="w-20 h-20 rounded-full bg-white/90 flex items-center justify-center hover:scale-110 transition-transform shadow-2xl"
                          >
                            <Play className="w-10 h-10 text-pink-500 ml-1" />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Progress Bar */}
                    <div className="absolute bottom-0 left-0 right-0">
                      <Progress value={progress} className="h-1 rounded-none bg-white/20" />
                    </div>
                  </div>

                  {/* Controls */}
                  <div className="flex items-center justify-center gap-3">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={restartVideo}
                      className="rounded-full"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </Button>
                    
                    <Button
                      onClick={isPlaying ? pauseVideo : playVideo}
                      className="rounded-full px-8 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
                    >
                      {isPlaying ? (
                        <>
                          <Pause className="w-4 h-4 mr-2" />
                          Pause
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 mr-2" />
                          {progress > 0 ? 'Resume' : 'Play'}
                        </>
                      )}
                    </Button>

                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setIsMuted(!isMuted)}
                      className="rounded-full"
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
                    onClick={() => setVideoScript(null)}
                    className="w-full"
                  >
                    Generate New Video
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
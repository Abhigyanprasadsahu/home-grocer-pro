import { 
  Sparkles, 
  Bell, 
  Percent, 
  ShoppingCart, 
  Heart, 
  Video, 
  CalendarDays,
  Store,
  TrendingDown,
  ChefHat
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface QuickAccessDockProps {
  onRecipeFinderClick: () => void;
  onPriceAlertsClick: () => void;
  onDealFinderClick: () => void;
  onSmartCartClick: () => void;
  onWishlistClick: () => void;
  onRecipeVideoClick: () => void;
  onPlannerClick: () => void;
}

const QuickAccessDock = ({
  onRecipeFinderClick,
  onPriceAlertsClick,
  onDealFinderClick,
  onSmartCartClick,
  onWishlistClick,
  onRecipeVideoClick,
  onPlannerClick,
}: QuickAccessDockProps) => {
  const tools = [
    { 
      icon: CalendarDays, 
      label: 'AI Planner', 
      onClick: onPlannerClick,
      color: 'bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground',
      description: 'Monthly meal planning'
    },
    { 
      icon: ChefHat, 
      label: 'Recipes', 
      onClick: onRecipeFinderClick,
      color: 'bg-orange-500/10 text-orange-500 hover:bg-orange-500 hover:text-white',
      description: 'Find recipes'
    },
    { 
      icon: Percent, 
      label: 'Deals', 
      onClick: onDealFinderClick,
      color: 'bg-green-500/10 text-green-600 hover:bg-green-500 hover:text-white',
      description: 'Best deals today'
    },
    { 
      icon: Bell, 
      label: 'Alerts', 
      onClick: onPriceAlertsClick,
      color: 'bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white',
      description: 'Price drop alerts'
    },
    { 
      icon: ShoppingCart, 
      label: 'Smart Cart', 
      onClick: onSmartCartClick,
      color: 'bg-purple-500/10 text-purple-500 hover:bg-purple-500 hover:text-white',
      description: 'Optimize your cart'
    },
    { 
      icon: Heart, 
      label: 'Wishlist', 
      onClick: onWishlistClick,
      color: 'bg-pink-500/10 text-pink-500 hover:bg-pink-500 hover:text-white',
      description: 'Saved items'
    },
    { 
      icon: Video, 
      label: 'Video', 
      onClick: onRecipeVideoClick,
      color: 'bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white',
      description: 'Recipe videos'
    },
  ];

  return (
    <TooltipProvider delayDuration={100}>
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
        <div className="flex items-center gap-1.5 px-3 py-2.5 bg-card/95 backdrop-blur-xl rounded-2xl border border-border/50 shadow-2xl">
          {/* Branding */}
          <div className="hidden sm:flex items-center gap-2 pr-3 border-r border-border/50">
            <div className="w-8 h-8 rounded-xl gradient-hero flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="text-xs font-semibold text-muted-foreground">AI Tools</span>
          </div>

          {/* Tool Icons */}
          {tools.map((tool) => (
            <Tooltip key={tool.label}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={tool.onClick}
                  className={`w-11 h-11 rounded-xl transition-all duration-300 ${tool.color}`}
                >
                  <tool.icon className="w-5 h-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent 
                side="top" 
                className="bg-foreground text-background border-0 font-medium"
              >
                <p className="text-sm">{tool.label}</p>
                <p className="text-xs opacity-70">{tool.description}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      </div>
    </TooltipProvider>
  );
};

export default QuickAccessDock;

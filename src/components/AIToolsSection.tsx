import { Sparkles, Bell, Percent, ShoppingCart, Heart, Video, ChefHat, ArrowRight, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AIToolsSectionProps {
  onRecipeFinderClick: () => void;
  onPriceAlertsClick: () => void;
  onDealFinderClick: () => void;
  onSmartCartClick: () => void;
  onWishlistClick: () => void;
  onRecipeVideoClick: () => void;
  onPlannerClick: () => void;
}

const AIToolsSection = ({
  onRecipeFinderClick,
  onPriceAlertsClick,
  onDealFinderClick,
  onSmartCartClick,
  onWishlistClick,
  onRecipeVideoClick,
  onPlannerClick,
}: AIToolsSectionProps) => {
  const tools = [
    {
      icon: Sparkles,
      title: 'AI Grocery Planner',
      description: 'Smart monthly grocery lists optimized for your family',
      color: 'from-primary/20 to-primary/5',
      iconBg: 'bg-primary/20',
      iconColor: 'text-primary',
      onClick: onPlannerClick,
    },
    {
      icon: ChefHat,
      title: 'AI Recipe Finder',
      description: 'Get personalized recipes from your ingredients',
      color: 'from-accent/20 to-accent/5',
      iconBg: 'bg-accent/20',
      iconColor: 'text-accent',
      onClick: onRecipeFinderClick,
    },
    {
      icon: Bell,
      title: 'AI Price Alerts',
      description: 'Get notified when prices drop on your favorites',
      color: 'from-blue-500/20 to-blue-500/5',
      iconBg: 'bg-blue-500/20',
      iconColor: 'text-blue-600 dark:text-blue-400',
      onClick: onPriceAlertsClick,
    },
    {
      icon: Percent,
      title: 'AI Deal Finder',
      description: 'Discover the best deals across all stores',
      color: 'from-green-500/20 to-green-500/5',
      iconBg: 'bg-green-500/20',
      iconColor: 'text-green-600 dark:text-green-400',
      onClick: onDealFinderClick,
    },
    {
      icon: ShoppingCart,
      title: 'Smart Cart',
      description: 'AI-optimized cart for maximum savings',
      color: 'from-purple-500/20 to-purple-500/5',
      iconBg: 'bg-purple-500/20',
      iconColor: 'text-purple-600 dark:text-purple-400',
      onClick: onSmartCartClick,
    },
    {
      icon: Video,
      title: 'AI Recipe Video',
      description: 'Generate beautiful recipe videos instantly',
      color: 'from-pink-500/20 to-pink-500/5',
      iconBg: 'bg-pink-500/20',
      iconColor: 'text-pink-600 dark:text-pink-400',
      onClick: onRecipeVideoClick,
    },
  ];

  return (
    <section className="py-16 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/10 to-accent/10 text-primary font-medium text-sm mb-4 border border-primary/20">
            <Zap className="w-4 h-4" />
            <span>Powered by Gemini AI & GPT-5</span>
          </div>
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4 text-foreground">
            AI-Powered <span className="text-gradient">Shopping Tools</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Experience the future of grocery shopping with our intelligent AI tools designed to save you time and money.
          </p>
        </div>

        {/* Tools Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {tools.map((tool) => (
            <button
              key={tool.title}
              onClick={tool.onClick}
              className={`group relative text-left p-6 rounded-2xl border border-border/50 hover:border-primary/30 bg-gradient-to-br ${tool.color} hover:shadow-xl transition-all duration-300 overflow-hidden`}
            >
              {/* Shine effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              
              <div className="relative">
                <div className={`w-14 h-14 rounded-xl ${tool.iconBg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <tool.icon className={`w-7 h-7 ${tool.iconColor}`} />
                </div>
                <h3 className="font-display font-bold text-lg text-foreground mb-2">{tool.title}</h3>
                <p className="text-sm text-muted-foreground mb-4">{tool.description}</p>
                <div className="flex items-center gap-1 text-sm font-medium text-primary group-hover:gap-2 transition-all">
                  Try Now
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Wishlist CTA */}
        <div className="mt-8 text-center">
          <Button
            variant="outline"
            size="lg"
            onClick={onWishlistClick}
            className="gap-2"
          >
            <Heart className="w-5 h-5 text-red-500" />
            View My Wishlist
          </Button>
        </div>
      </div>
    </section>
  );
};

export default AIToolsSection;

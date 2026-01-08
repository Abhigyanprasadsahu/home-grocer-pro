import { Sparkles, Video, Bell, ShoppingCart, MessageSquare, TrendingDown, RefreshCw, Salad } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AIFeaturesShowcaseProps {
  onOpenRecipePlanner?: () => void;
  onOpenRecipeVideo?: () => void;
  onOpenAutoOrder?: () => void;
  onOpenDealFinder?: () => void;
  onOpenPriceAlerts?: () => void;
  onOpenSmartCart?: () => void;
  onOpenChatbot?: () => void;
}

const AIFeaturesShowcase = ({
  onOpenRecipePlanner,
  onOpenRecipeVideo,
  onOpenAutoOrder,
  onOpenDealFinder,
  onOpenPriceAlerts,
  onOpenSmartCart,
  onOpenChatbot,
}: AIFeaturesShowcaseProps) => {
  const features = [
    {
      icon: Salad,
      title: "AI Recipe Planner",
      description: "Plan monthly groceries based on protein, carbs, vitamins & nutrients. Get personalized meal plans.",
      action: "Plan Recipes",
      onClick: onOpenRecipePlanner,
      color: "from-green-500 to-emerald-500",
      badge: "Nutrition AI",
    },
    {
      icon: Video,
      title: "AI Recipe Video",
      description: "Generate 20-second recipe videos for Gen-Z. Quick, engaging cooking tutorials from your orders.",
      action: "Create Video",
      onClick: onOpenRecipeVideo,
      color: "from-pink-500 to-purple-500",
      badge: "New ✨",
    },
    {
      icon: RefreshCw,
      title: "Auto Ordering",
      description: "Set up recurring orders for daily essentials like milk, bread, vegetables. Perfect for busy professionals.",
      action: "Set Auto-Order",
      onClick: onOpenAutoOrder,
      color: "from-blue-500 to-cyan-500",
      badge: "Smart Subscription",
    },
    {
      icon: TrendingDown,
      title: "AI Deal Finder",
      description: "Find the best deals across local Kirana stores. AI scans prices to get you maximum savings.",
      action: "Find Deals",
      onClick: onOpenDealFinder,
      color: "from-amber-500 to-orange-500",
      badge: "Savings AI",
    },
    {
      icon: Bell,
      title: "AI Price Alerts",
      description: "Get notified when products near expiry go on discount. Never miss a deal at your local stores.",
      action: "Set Alerts",
      onClick: onOpenPriceAlerts,
      color: "from-red-500 to-rose-500",
      badge: "Smart Alerts",
    },
    {
      icon: ShoppingCart,
      title: "Smart Cart",
      description: "Compare your monthly grocery plan with D-Mart, Big Basket, Big Bazaar & local Kirana stores.",
      action: "Compare Prices",
      onClick: onOpenSmartCart,
      color: "from-indigo-500 to-violet-500",
      badge: "Price Comparison",
    },
    {
      icon: MessageSquare,
      title: "AI Chatbot",
      description: "Ask anything! Find products, get recommendations, track orders - all through natural conversation.",
      action: "Chat Now",
      onClick: onOpenChatbot,
      color: "from-teal-500 to-green-500",
      badge: "GPT-5 Powered",
    },
  ];

  return (
    <section id="ai-features" className="py-24 relative">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/2 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-medium text-sm mb-4">
            <Sparkles className="w-4 h-4" />
            <span>Powered by Gemini AI & GPT-5</span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold mt-4 mb-6">
            AI Features That{" "}
            <span className="text-gradient">Save You Time & Money</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            From recipe planning to price alerts, our AI handles the heavy lifting so you can focus on what matters.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="group relative bg-card rounded-2xl border border-border p-6 hover:border-primary/30 transition-all hover:shadow-xl overflow-hidden"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Gradient background on hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity`} />
              
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-[10px] font-semibold px-2 py-1 rounded-full bg-secondary text-muted-foreground">
                    {feature.badge}
                  </span>
                </div>

                <h3 className="font-display text-lg font-bold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                  {feature.description}
                </p>

                <Button
                  variant="outline"
                  size="sm"
                  className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                  onClick={feature.onClick}
                >
                  {feature.action}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AIFeaturesShowcase;

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Brain, 
  BarChart3, 
  Users, 
  Truck, 
  RefreshCw, 
  Shield,
  Store,
  Salad,
  Video,
  Bell,
  MessageSquare,
  Package
} from "lucide-react";

const FeaturesSection = () => {
  const features = [
    {
      icon: Brain,
      title: "AI Recipe Planner",
      description: "Plan monthly groceries based on protein, carbs, vitamins & nutrients. Get personalized nutrition-balanced lists.",
      gradient: "from-primary to-primary/60",
    },
    {
      icon: Video,
      title: "Recipe Video Maker",
      description: "Generate 20-second cooking videos for Gen-Z. Quick tutorials from ingredients you ordered.",
      gradient: "from-pink-500 to-purple-500",
    },
    {
      icon: RefreshCw,
      title: "Auto-Ordering",
      description: "Set up recurring orders for daily essentials like milk, bread, vegetables. Never run out!",
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      icon: BarChart3,
      title: "Price Comparison",
      description: "Compare prices across D-Mart, Big Basket, Big Bazaar and 12+ local Kirana stores instantly.",
      gradient: "from-accent to-accent/60",
    },
    {
      icon: Bell,
      title: "AI Price Alerts",
      description: "Get notified when products near expiry go on discount. Smart alerts from local Kirana stores.",
      gradient: "from-red-500 to-rose-500",
    },
    {
      icon: Truck,
      title: "Two-Tier Delivery",
      description: "Bulk orders (₹2500+) get free van delivery. Small orders via quick bike delivery.",
      gradient: "from-primary to-primary/60",
    },
    {
      icon: Store,
      title: "Kirana Partnership",
      description: "We partner with local Kirana stores - no inventory needed. Fresher products, supporting local business.",
      gradient: "from-accent to-primary",
    },
    {
      icon: Users,
      title: "Community Orders",
      description: "Apartments, PGs, hostels can combine orders for extra bulk savings. Group buying power!",
      gradient: "from-primary/60 to-accent/60",
    },
  ];

  return (
    <section id="features" className="py-24 relative">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/2 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-primary font-semibold text-sm uppercase tracking-wider">Platform Features</span>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold mt-4 mb-6">
            Everything for{" "}
            <span className="text-gradient">Smart Bulk Shopping</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            From AI planning to van delivery, Flash Cart transforms how you manage monthly household groceries.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card 
              key={feature.title} 
              variant="feature"
              className="group cursor-pointer"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardHeader>
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-7 h-7 text-primary-foreground" />
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;

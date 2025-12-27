import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Brain, 
  BarChart3, 
  Users, 
  Truck, 
  RefreshCw, 
  Shield,
  Store,
  Salad
} from "lucide-react";

const FeaturesSection = () => {
  const features = [
    {
      icon: Brain,
      title: "AI-Powered Planning",
      description: "Tell us your family size, dietary needs, and budget. Our AI creates optimized monthly grocery lists instantly.",
      gradient: "from-primary to-primary/60",
    },
    {
      icon: BarChart3,
      title: "Price Comparison",
      description: "Compare prices across D-Mart, Reliance, Big Bazaar, and more. Always get the best deals.",
      gradient: "from-accent to-accent/60",
    },
    {
      icon: Users,
      title: "Family Profiles",
      description: "Create profiles for children, adults, and elderly members. Get nutrition-balanced recommendations.",
      gradient: "from-primary to-accent",
    },
    {
      icon: Salad,
      title: "Diet Customization",
      description: "Vegetarian, high-protein, diabetic-friendly, or fitness-focused. We adapt to your lifestyle.",
      gradient: "from-primary/80 to-primary",
    },
    {
      icon: RefreshCw,
      title: "Auto-Repeat Orders",
      description: "Set up recurring monthly orders. We learn your patterns and optimize automatically.",
      gradient: "from-accent/80 to-accent",
    },
    {
      icon: Truck,
      title: "Bulk Delivery",
      description: "Van-based delivery for large orders. Or pick up from partner stores at your convenience.",
      gradient: "from-primary to-primary/60",
    },
    {
      icon: Store,
      title: "Multi-Store Sourcing",
      description: "One cart, multiple stores. We source from wherever gives you the best price and availability.",
      gradient: "from-accent to-primary",
    },
    {
      icon: Shield,
      title: "Community Orders",
      description: "Apartment societies and hostels can combine orders for extra savings on bulk purchases.",
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
          <span className="text-primary font-semibold text-sm uppercase tracking-wider">Features</span>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold mt-4 mb-6">
            Everything You Need for{" "}
            <span className="text-gradient">Smarter Shopping</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            From AI planning to bulk delivery, GROCERA transforms how you manage household groceries.
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

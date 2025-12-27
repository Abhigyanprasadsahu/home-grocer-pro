import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Star } from "lucide-react";

const PricingSection = () => {
  const plans = [
    {
      name: "Basic",
      price: "Free",
      period: "",
      description: "Perfect for trying out GROCERA",
      features: [
        "Basic grocery list creation",
        "Price comparison (2 stores)",
        "Standard delivery",
        "Email support",
      ],
      cta: "Get Started",
      variant: "outline" as const,
      popular: false,
    },
    {
      name: "Family",
      price: "₹199",
      period: "/month",
      description: "Best for regular families",
      features: [
        "AI-powered grocery planning",
        "Price comparison (all stores)",
        "Family profiles & diet plans",
        "Auto-repeat orders",
        "Priority delivery",
        "Chat support",
      ],
      cta: "Start Free Trial",
      variant: "hero" as const,
      popular: true,
    },
    {
      name: "Community",
      price: "₹499",
      period: "/month",
      description: "For apartments, hostels & PGs",
      features: [
        "Everything in Family",
        "Bulk order discounts",
        "Combined community orders",
        "Dedicated account manager",
        "API access",
        "Custom delivery schedule",
      ],
      cta: "Contact Sales",
      variant: "outline" as const,
      popular: false,
    },
  ];

  return (
    <section id="pricing" className="py-24 relative">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-primary font-semibold text-sm uppercase tracking-wider">Pricing</span>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold mt-4 mb-6">
            Plans That{" "}
            <span className="text-gradient">Fit Your Needs</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Start free, upgrade when you're ready. Cancel anytime.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <Card 
              key={plan.name} 
              variant="pricing"
              className={`relative ${plan.popular ? 'border-primary shadow-glow scale-105' : 'border-border'}`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full gradient-hero text-primary-foreground text-sm font-semibold flex items-center gap-1">
                  <Star className="w-4 h-4" />
                  Most Popular
                </div>
              )}

              <CardHeader className="text-center pb-2">
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <div className="mt-4">
                  <span className="font-display text-4xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>
                <CardDescription className="mt-2">{plan.description}</CardDescription>
              </CardHeader>

              <CardContent className="pt-6">
                <ul className="space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Check className="w-3 h-3 text-primary" />
                      </div>
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter>
                <Button variant={plan.variant} className="w-full" size="lg">
                  {plan.cta}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;

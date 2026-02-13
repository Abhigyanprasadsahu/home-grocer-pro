import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Star, Percent } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ScrollReveal, StaggerContainer, StaggerItem } from "@/components/motion/ScrollReveal";
import { motion } from "framer-motion";

const PricingSection = () => {
  const navigate = useNavigate();
  
  const plans = [
    {
      name: "Basic",
      price: "Free",
      period: "",
      description: "Perfect for trying Flash Cart",
      features: [
        "Basic grocery list creation",
        "Price comparison (3 stores)",
        "Standard delivery (₹30 fee)",
        "Community support",
      ],
      cta: "Get Started Free",
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
        "Price comparison (all 12+ stores)",
        "Auto-ordering subscriptions",
        "Recipe video generator",
        "Free delivery on ₹2500+",
        "Priority support",
        "Price drop alerts",
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
        "Bulk order discounts (extra 10%)",
        "Combined community orders",
        "Dedicated account manager",
        "Custom delivery schedule",
        "API access",
        "Priority van delivery",
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
        <ScrollReveal className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-primary font-semibold text-sm uppercase tracking-wider">Pricing</span>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold mt-4 mb-6">
            Plans That{" "}
            <span className="text-gradient">Fit Your Needs</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Start free, upgrade when you're ready. Cancel anytime. We earn 1-2% commission from Kirana partners.
          </p>
        </ScrollReveal>

        <StaggerContainer className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto" staggerDelay={0.15}>
          {plans.map((plan) => (
            <StaggerItem key={plan.name}>
              <motion.div whileHover={{ y: -8 }} transition={{ duration: 0.25 }}>
                <Card 
                  variant="pricing"
                  className={`relative h-full ${plan.popular ? 'border-primary shadow-glow scale-105' : 'border-border'}`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full gradient-hero text-primary-foreground text-sm font-semibold flex items-center gap-1">
                      <Star className="w-4 h-4" /> Most Popular
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
                    <Button 
                      variant={plan.variant} 
                      className="w-full" 
                      size="lg"
                      onClick={() => navigate('/onboarding')}
                    >
                      {plan.cta}
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            </StaggerItem>
          ))}
        </StaggerContainer>

        <ScrollReveal delay={0.3}>
          <div className="max-w-2xl mx-auto mt-12 p-4 bg-secondary/50 rounded-xl text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Percent className="w-5 h-5 text-primary" />
              <span className="font-semibold">Transparent Business Model</span>
            </div>
            <p className="text-sm text-muted-foreground">
              We earn 1-2% commission from our Kirana partner stores. No hidden fees, no markups on products. 
              You always get the actual store price!
            </p>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default PricingSection;

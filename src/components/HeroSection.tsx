import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, TrendingDown, Users, Truck, Zap, Star, ShieldCheck, Bike, Building, Package } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import heroImage from "@/assets/hero-groceries.jpg";

const HeroSection = () => {
  const navigate = useNavigate();

  const aiFeatures = [
    { icon: Sparkles, label: "AI Meal Planning" },
    { icon: TrendingDown, label: "Up to 40% Savings" },
    { icon: Users, label: "Family Optimized" },
  ];

  const features = [
    { icon: Truck, text: "Free van delivery on ₹2500+" },
    { icon: Bike, text: "Quick bike delivery for daily needs" },
    { icon: Building, text: "Community bulk discounts" },
  ];

  const stats = [
    { value: "12+", label: "Partner Stores" },
    { value: "40%", label: "Max Savings" },
    { value: "10K+", label: "Happy Families" },
  ];

  return (
    <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/5 to-transparent" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-accent/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/4 w-32 h-32 bg-primary/20 rounded-full blur-2xl animate-pulse-soft" />
      </div>

      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Content */}
          <motion.div
            className="space-y-8"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-medium text-sm border border-primary/20"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <Package className="w-4 h-4" />
              <span>India's #1 Bulk Grocery Platform</span>
            </motion.div>

            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-[1.1] tracking-tight">
              Bulk Order,{" "}
              <span className="text-gradient">Save Big</span>{" "}
              with Flash Cart
            </h1>

            <p className="text-lg sm:text-xl text-muted-foreground max-w-lg leading-relaxed">
              AI-powered monthly grocery planning. Compare prices from D-Mart, Big Basket & local Kirana stores. 
              Free van delivery on bulk orders ₹2500+.
            </p>

            {/* Quick Features */}
            <div className="flex flex-wrap gap-4">
              {features.map((feature, i) => (
                <motion.div
                  key={feature.text}
                  className="flex items-center gap-2 text-sm text-muted-foreground"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + i * 0.1, duration: 0.4 }}
                >
                  <feature.icon className="w-4 h-4 text-primary" />
                  <span>{feature.text}</span>
                </motion.div>
              ))}
            </div>

            <motion.div
              className="flex flex-col sm:flex-row gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              <Button variant="hero" size="lg" className="group" onClick={() => navigate('/onboarding')}>
                Plan Monthly Groceries
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button variant="outline" size="lg" onClick={() => navigate('/shop')}>
                Browse & Compare Prices
              </Button>
            </motion.div>

            {/* Stats */}
            <div className="flex gap-8 pt-8 border-t border-border">
              {stats.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 + i * 0.1, duration: 0.4 }}
                >
                  <p className="font-display text-3xl font-bold text-primary">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </motion.div>
              ))}
            </div>

            {/* AI Features */}
            <div className="flex flex-wrap gap-4">
              {aiFeatures.map((feature, i) => (
                <motion.div
                  key={feature.label}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1 + i * 0.1, duration: 0.4 }}
                  whileHover={{ scale: 1.05 }}
                >
                  <feature.icon className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-foreground">{feature.label}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Hero Image */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, x: 50, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-border/50">
              <img
                src={heroImage}
                alt="Fresh groceries including vegetables, fruits, and bread"
                className="w-full h-auto object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/20 to-transparent" />
            </div>

            {/* Floating Cards */}
            <motion.div
              className="absolute -bottom-6 -left-6 bg-card rounded-2xl p-4 shadow-soft border border-border"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 0.6 }}
              whileHover={{ y: -4, boxShadow: "0 20px 40px -10px rgba(0,0,0,0.15)" }}
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full gradient-hero flex items-center justify-center">
                  <Truck className="w-6 h-6 text-primary-foreground" />
                </div>
                <div>
                  <div className="font-semibold text-foreground">Bulk Delivery</div>
                  <div className="text-xs text-muted-foreground">Free on ₹2500+</div>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="absolute -top-4 -right-4 bg-card rounded-2xl p-4 shadow-soft border border-border"
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 0.6 }}
              whileHover={{ y: -4, boxShadow: "0 20px 40px -10px rgba(0,0,0,0.15)" }}
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full gradient-accent flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-accent-foreground" />
                </div>
                <div>
                  <div className="font-semibold text-foreground">AI Planning</div>
                  <div className="text-xs text-muted-foreground">Smart grocery lists</div>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="absolute top-1/2 -right-8 bg-primary text-primary-foreground rounded-full px-4 py-2 shadow-glow"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.4, duration: 0.5, type: "spring", stiffness: 200 }}
            >
              <span className="text-sm font-bold">Save up to 40%</span>
            </motion.div>

            <motion.div
              className="absolute bottom-1/4 -left-4 bg-primary text-primary-foreground rounded-full px-3 py-1.5 shadow-lg"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.6, duration: 0.5, type: "spring", stiffness: 200 }}
            >
              <span className="text-xs font-bold flex items-center gap-1">
                <Bike className="w-3 h-3" /> Quick Delivery
              </span>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;

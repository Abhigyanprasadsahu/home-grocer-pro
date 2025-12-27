import { ArrowRight } from "lucide-react";

const HowItWorksSection = () => {
  const steps = [
    {
      step: "01",
      title: "Tell Us About You",
      description: "Enter your family size, age groups, dietary preferences, and monthly budget. Our smart onboarding takes just 2 minutes.",
      color: "primary",
    },
    {
      step: "02",
      title: "Get AI Recommendations",
      description: "Our AI analyzes your inputs and generates a personalized monthly grocery list optimized for nutrition and budget.",
      color: "accent",
    },
    {
      step: "03",
      title: "Compare & Customize",
      description: "See prices across multiple stores. Add, remove, or substitute items. Chat with AI to refine your list further.",
      color: "primary",
    },
    {
      step: "04",
      title: "Schedule Delivery",
      description: "Choose van delivery or store pickup. Set up auto-repeat for hassle-free monthly groceries delivered to your door.",
      color: "accent",
    },
  ];

  return (
    <section id="how-it-works" className="py-24 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-primary font-semibold text-sm uppercase tracking-wider">How It Works</span>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold mt-4 mb-6">
            Smart Shopping in{" "}
            <span className="text-gradient">4 Simple Steps</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            From profile setup to doorstep delivery, we've made grocery planning effortless.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          {/* Connection Line */}
          <div className="hidden lg:block absolute top-16 left-[12%] right-[12%] h-0.5 bg-gradient-to-r from-primary via-accent to-primary opacity-20" />

          {steps.map((item, index) => (
            <div key={item.step} className="relative group">
              {/* Step Number */}
              <div className={`w-16 h-16 rounded-2xl ${item.color === 'primary' ? 'gradient-hero' : 'gradient-accent'} flex items-center justify-center mb-6 shadow-glow group-hover:scale-110 transition-transform duration-300 relative z-10`}>
                <span className="font-display text-xl font-bold text-primary-foreground">{item.step}</span>
              </div>

              {/* Arrow */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-8 -right-4 z-20">
                  <ArrowRight className="w-8 h-8 text-primary/30" />
                </div>
              )}

              <h3 className="font-display text-xl font-bold mb-3">{item.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;

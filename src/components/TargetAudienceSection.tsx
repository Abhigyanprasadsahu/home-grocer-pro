import { Users, Building, GraduationCap, Dumbbell, Home, Heart } from "lucide-react";

const TargetAudienceSection = () => {
  const audiences = [
    {
      icon: Dumbbell,
      title: "Diet & Fitness Focused",
      description: "High-protein, low-carb, keto-friendly grocery planning with nutrition tracking",
      stats: "Track macros & calories",
      color: "from-green-500 to-emerald-500",
    },
    {
      icon: Users,
      title: "Large Families",
      description: "Bulk ordering for 5+ members with customized nutrition for all age groups",
      stats: "Save up to 40% monthly",
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: Building,
      title: "Apartments & Societies",
      description: "Community bulk orders with shared delivery for maximum savings",
      stats: "Group discounts available",
      color: "from-purple-500 to-pink-500",
    },
    {
      icon: GraduationCap,
      title: "PG & Hostels",
      description: "Budget-friendly meal planning for students and working professionals",
      stats: "Starting ₹2000/month",
      color: "from-amber-500 to-orange-500",
    },
    {
      icon: Home,
      title: "Bachelors",
      description: "Auto-ordering daily essentials with zero hassle subscription",
      stats: "Auto-delivery available",
      color: "from-red-500 to-rose-500",
    },
    {
      icon: Heart,
      title: "Health Conscious",
      description: "Diabetic-friendly, organic, and specially curated health-focused groceries",
      stats: "Expert curated lists",
      color: "from-teal-500 to-cyan-500",
    },
  ];

  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-primary font-semibold text-sm uppercase tracking-wider">Who We Serve</span>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold mt-4 mb-6">
            Built for{" "}
            <span className="text-gradient">Every Indian Family</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            From fitness enthusiasts to large joint families, Flash Cart adapts to your unique grocery needs.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {audiences.map((audience, index) => (
            <div
              key={audience.title}
              className="group relative p-6 bg-card rounded-2xl border border-border hover:border-primary/30 transition-all hover:shadow-xl cursor-pointer overflow-hidden"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Gradient overlay on hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${audience.color} opacity-0 group-hover:opacity-5 transition-opacity`} />
              
              <div className="relative z-10">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${audience.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <audience.icon className="w-7 h-7 text-white" />
                </div>
                
                <h3 className="font-display text-xl font-bold mb-2">{audience.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                  {audience.description}
                </p>
                
                <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium">
                  {audience.stats}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TargetAudienceSection;

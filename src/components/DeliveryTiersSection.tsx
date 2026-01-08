import { Truck, Bike, Package, Clock, Check } from "lucide-react";

const DeliveryTiersSection = () => {
  const tiers = [
    {
      icon: Bike,
      title: "Quick Delivery",
      subtitle: "Small Orders",
      minOrder: "₹100+",
      freeAbove: "₹200",
      deliveryFee: "₹30",
      time: "30-45 mins",
      vehicle: "Bike 🏍️",
      features: [
        "Daily essentials",
        "Express delivery",
        "Real-time tracking",
        "Contactless option",
      ],
      color: "from-blue-500 to-cyan-500",
      popular: false,
    },
    {
      icon: Truck,
      title: "Bulk Delivery",
      subtitle: "Monthly Orders",
      minOrder: "₹2500+",
      freeAbove: "FREE",
      deliveryFee: "₹0",
      time: "Same day / Scheduled",
      vehicle: "Van / Tempo 🚚",
      features: [
        "Up to 40% savings",
        "Free van delivery",
        "Scheduled time slots",
        "Helper assistance",
        "Heavy items included",
      ],
      color: "from-green-500 to-emerald-500",
      popular: true,
    },
    {
      icon: Package,
      title: "Store Pickup",
      subtitle: "Self Collect",
      minOrder: "No minimum",
      freeAbove: "Always FREE",
      deliveryFee: "₹0",
      time: "Ready in 2 hours",
      vehicle: "Your choice 🚗",
      features: [
        "Extra 5% discount",
        "Quality check at store",
        "Flexible timing",
        "Multiple pickup points",
      ],
      color: "from-purple-500 to-pink-500",
      popular: false,
    },
  ];

  return (
    <section className="py-24 bg-secondary/30 relative">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-primary font-semibold text-sm uppercase tracking-wider">Delivery Options</span>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold mt-4 mb-6">
            Flexible Delivery{" "}
            <span className="text-gradient">For Every Order</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            From quick bike deliveries for daily needs to van service for monthly bulk orders - we've got you covered.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {tiers.map((tier) => (
            <div
              key={tier.title}
              className={`relative bg-card rounded-2xl border-2 p-6 transition-all hover:shadow-xl ${
                tier.popular ? 'border-primary shadow-glow scale-105' : 'border-border'
              }`}
            >
              {tier.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full gradient-hero text-primary-foreground text-sm font-semibold">
                  Most Popular
                </div>
              )}

              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${tier.color} flex items-center justify-center mb-4`}>
                <tier.icon className="w-8 h-8 text-white" />
              </div>

              <h3 className="font-display text-xl font-bold">{tier.title}</h3>
              <p className="text-sm text-muted-foreground mb-4">{tier.subtitle}</p>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between items-center py-2 border-b border-border">
                  <span className="text-sm text-muted-foreground">Min Order</span>
                  <span className="font-semibold">{tier.minOrder}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border">
                  <span className="text-sm text-muted-foreground">Free Above</span>
                  <span className="font-semibold text-green-600">{tier.freeAbove}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border">
                  <span className="text-sm text-muted-foreground">Delivery Fee</span>
                  <span className={tier.deliveryFee === "₹0" ? "font-semibold text-green-600" : "font-semibold"}>
                    {tier.deliveryFee}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Time
                  </span>
                  <span className="font-semibold">{tier.time}</span>
                </div>
              </div>

              <div className="p-3 bg-secondary/50 rounded-lg mb-4 text-center">
                <span className="text-lg">{tier.vehicle}</span>
              </div>

              <ul className="space-y-2">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm">
                    <div className="w-4 h-4 rounded-full bg-primary/10 flex items-center justify-center">
                      <Check className="w-3 h-3 text-primary" />
                    </div>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* No Inventory Note */}
        <div className="max-w-2xl mx-auto mt-12 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl text-center">
          <p className="text-amber-700">
            <strong>💡 Zero Inventory Model:</strong> We source directly from local Kirana stores - 
            fresher products, no warehousing costs, supporting local businesses!
          </p>
        </div>
      </div>
    </section>
  );
};

export default DeliveryTiersSection;

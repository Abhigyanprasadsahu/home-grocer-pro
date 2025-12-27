const PartnersSection = () => {
  const partners = [
    { name: "D-Mart", logo: "D" },
    { name: "Reliance Smart", logo: "R" },
    { name: "Big Bazaar", logo: "B" },
    { name: "More", logo: "M" },
    { name: "Spencer's", logo: "S" },
    { name: "Star Bazaar", logo: "★" },
  ];

  return (
    <section className="py-16 border-y border-border bg-secondary/20">
      <div className="container mx-auto px-4">
        <p className="text-center text-muted-foreground mb-8 font-medium">
          Trusted by leading retail partners across India
        </p>

        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16">
          {partners.map((partner) => (
            <div
              key={partner.name}
              className="flex items-center gap-3 text-muted-foreground/60 hover:text-foreground transition-colors group cursor-pointer"
            >
              <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center font-display text-xl font-bold group-hover:bg-primary/10 transition-colors">
                {partner.logo}
              </div>
              <span className="font-semibold text-lg hidden sm:block">{partner.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PartnersSection;

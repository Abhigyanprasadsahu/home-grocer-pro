import { motion } from "framer-motion";

const PartnersSection = () => {
  const retailers = [
    { name: "D-Mart", logo: "🏪" },
    { name: "Big Basket", logo: "🧺" },
    { name: "Big Bazaar", logo: "🛒" },
    { name: "Reliance Fresh", logo: "🏬" },
    { name: "More", logo: "🛍️" },
    { name: "Spencer's", logo: "🏢" },
  ];

  const kiranaPartners = [
    { name: "Sharma Kirana", logo: "🏠" },
    { name: "Patel Store", logo: "🏡" },
    { name: "Fresh Mart", logo: "🪴" },
    { name: "City Grocers", logo: "🏘️" },
    { name: "Gupta General", logo: "🏪" },
    { name: "12+ More", logo: "➕" },
  ];

  return (
    <section className="py-16 border-y border-border bg-secondary/20">
      <div className="container mx-auto px-4">
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-muted-foreground font-medium mb-2">
            Compare prices across retail giants
          </p>
          <div className="flex flex-wrap justify-center items-center gap-6 md:gap-10 mb-8">
            {retailers.map((partner, i) => (
              <motion.div
                key={partner.name}
                className="flex items-center gap-2 text-muted-foreground/60 hover:text-foreground transition-colors group cursor-pointer"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.4 }}
                whileHover={{ scale: 1.1 }}
              >
                <span className="text-2xl">{partner.logo}</span>
                <span className="font-semibold text-sm hidden sm:block">{partner.name}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <p className="text-primary font-medium mb-2">
            Order from trusted Kirana partners
          </p>
          <div className="flex flex-wrap justify-center items-center gap-6 md:gap-10">
            {kiranaPartners.map((partner, i) => (
              <motion.div
                key={partner.name}
                className="flex items-center gap-2 text-primary/60 hover:text-primary transition-colors group cursor-pointer"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 + i * 0.08, duration: 0.4 }}
                whileHover={{ scale: 1.1 }}
              >
                <span className="text-2xl">{partner.logo}</span>
                <span className="font-semibold text-sm hidden sm:block">{partner.name}</span>
              </motion.div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-4">
            We compare with retail stores, you order from local Kirana partners at matched or better prices
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default PartnersSection;

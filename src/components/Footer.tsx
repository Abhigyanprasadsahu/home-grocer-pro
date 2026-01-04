import { ShoppingBasket, Mail, Phone, MapPin } from "lucide-react";

const Footer = () => {
  const footerLinks = {
    Product: ["Features", "Pricing", "How It Works", "Partners"],
    Company: ["About Us", "Careers", "Blog", "Press"],
    Support: ["Help Center", "Contact Us", "FAQs", "Community"],
    Legal: ["Privacy Policy", "Terms of Service", "Cookie Policy"],
  };

  return (
    <footer id="about" className="bg-foreground text-background py-16">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 lg:grid-cols-6 gap-12 mb-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <a href="/" className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                <ShoppingBasket className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-display text-2xl font-bold">Flash Cart</span>
            </a>
            <p className="text-background/70 mb-6 leading-relaxed">
              India's smartest bulk and monthly grocery planning platform. 
              Save time, money, and effort with AI-powered shopping.
            </p>
            <div className="space-y-3 text-sm text-background/70">
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4" />
                <span>hello@flashkart.in</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4" />
                <span>+91 98765 43210</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4" />
                <span>Bangalore, India</span>
              </div>
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="font-display font-semibold mb-4">{category}</h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-background/70 hover:text-background transition-colors text-sm"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-background/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-background/60">
            © {new Date().getFullYear()} Flash Cart. All rights reserved.
          </p>
          <p className="text-sm text-background/60">
            Made with 💚 for smarter Indian households
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

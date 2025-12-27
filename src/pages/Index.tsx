import { Helmet } from "react-helmet-async";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import PartnersSection from "@/components/PartnersSection";
import FeaturesSection from "@/components/FeaturesSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import PricingSection from "@/components/PricingSection";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <>
      <Helmet>
        <title>GROCERA - Smart Bulk & Monthly Grocery Planning | AI-Powered Shopping</title>
        <meta
          name="description"
          content="Plan, compare, and save on monthly groceries with GROCERA. AI-powered recommendations tailored to your family's needs, diet preferences, and budget. Compare prices across D-Mart, Reliance, Big Bazaar & more."
        />
        <meta
          name="keywords"
          content="grocery planning, bulk grocery, monthly groceries, price comparison, AI grocery, family grocery, diet-based shopping, grocery delivery India"
        />
        <meta property="og:title" content="GROCERA - Smart Bulk & Monthly Grocery Planning" />
        <meta
          property="og:description"
          content="AI-powered grocery planning for Indian households. Save 30% on monthly groceries."
        />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="https://grocera.in" />
      </Helmet>

      <main className="min-h-screen">
        <Navbar />
        <HeroSection />
        <PartnersSection />
        <FeaturesSection />
        <HowItWorksSection />
        <PricingSection />
        <CTASection />
        <Footer />
      </main>
    </>
  );
};

export default Index;

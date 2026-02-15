import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import Navbar from '@/components/Navbar';
import HeroSection from '@/components/HeroSection';
import FeaturesSection from '@/components/FeaturesSection';
import AIFeaturesShowcase from '@/components/AIFeaturesShowcase';
import TargetAudienceSection from '@/components/TargetAudienceSection';
import DeliveryTiersSection from '@/components/DeliveryTiersSection';
import HowItWorksSection from '@/components/HowItWorksSection';
import PricingSection from '@/components/PricingSection';
import PartnersSection from '@/components/PartnersSection';
import CTASection from '@/components/CTASection';
import Footer from '@/components/Footer';
import AIChatbot from '@/components/AIChatbot';
import AIRecipeFinder from '@/components/AIRecipeFinder';
import AIRecipeVideo from '@/components/AIRecipeVideo';
import AIDealFinder from '@/components/AIDealFinder';
import AIPriceAlerts from '@/components/AIPriceAlerts';
import SmartCart from '@/components/SmartCart';
import AutoOrderSubscription from '@/components/AutoOrderSubscription';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const Landing = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [isRecipeFinderOpen, setIsRecipeFinderOpen] = useState(false);
  const [isRecipeVideoOpen, setIsRecipeVideoOpen] = useState(false);
  const [isAutoOrderOpen, setIsAutoOrderOpen] = useState(false);
  const [isDealFinderOpen, setIsDealFinderOpen] = useState(false);
  const [isPriceAlertsOpen, setIsPriceAlertsOpen] = useState(false);
  const [isSmartCartOpen, setIsSmartCartOpen] = useState(false);
  
  // Sample recipe for video demo
  const sampleRecipe = {
    name: "Butter Chicken",
    ingredients: ["Chicken 500g", "Butter 100g", "Tomato puree", "Cream", "Garam masala", "Kasuri methi"],
    steps: ["Marinate chicken", "Cook in butter", "Add tomato puree", "Simmer with spices", "Finish with cream"],
    cuisine: "North Indian",
    prepTime: 15,
    cookTime: 30,
  };

  const handleAIFeatureClick = (feature: string) => {
    if (!user && feature !== 'recipe') {
      navigate('/auth');
      return;
    }
    
    switch (feature) {
      case 'recipe':
        setIsRecipeFinderOpen(true);
        break;
      case 'video':
        setIsRecipeVideoOpen(true);
        break;
      case 'auto':
        setIsAutoOrderOpen(true);
        break;
      case 'deals':
        setIsDealFinderOpen(true);
        break;
      case 'alerts':
        setIsPriceAlertsOpen(true);
        break;
      case 'smart':
        setIsSmartCartOpen(true);
        break;
    }
  };

  return (
    <>
      <Helmet>
        <title>Flash Cart - India's #1 Bulk Grocery Platform | Save Up to 40%</title>
        <meta 
          name="description" 
          content="Order monthly groceries with AI-powered planning. Compare prices across D-Mart, Big Basket & local Kirana stores. Free van delivery for bulk orders. Save up to 40%!" 
        />
        <meta name="keywords" content="bulk grocery, monthly grocery, kirana, grocery delivery, price comparison, AI grocery planner, India" />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Navbar />
        <HeroSection />
        <PartnersSection />
        
        <AIFeaturesShowcase
          onOpenRecipePlanner={() => handleAIFeatureClick('recipe')}
          onOpenRecipeVideo={() => handleAIFeatureClick('video')}
          onOpenAutoOrder={() => handleAIFeatureClick('auto')}
          onOpenDealFinder={() => handleAIFeatureClick('deals')}
          onOpenPriceAlerts={() => handleAIFeatureClick('alerts')}
          onOpenSmartCart={() => handleAIFeatureClick('smart')}
        />
        
        <FeaturesSection />
        <TargetAudienceSection />
        <DeliveryTiersSection />
        <HowItWorksSection />
        <PricingSection />
        <CTASection />
        <Footer />
        
        {/* AI Chatbot - Always visible */}
        <AIChatbot />
        
        {/* Modals */}
        <AIRecipeFinder 
          isOpen={isRecipeFinderOpen} 
          onClose={() => setIsRecipeFinderOpen(false)} 
        />
        <AIRecipeVideo
          isOpen={isRecipeVideoOpen}
          onClose={() => setIsRecipeVideoOpen(false)}
          recipe={sampleRecipe}
        />
        <AutoOrderSubscription
          isOpen={isAutoOrderOpen}
          onClose={() => setIsAutoOrderOpen(false)}
        />
        <AIDealFinder
          isOpen={isDealFinderOpen}
          onClose={() => setIsDealFinderOpen(false)}
        />
        <AIPriceAlerts
          isOpen={isPriceAlertsOpen}
          onClose={() => setIsPriceAlertsOpen(false)}
        />
        <SmartCart
          isOpen={isSmartCartOpen}
          onClose={() => setIsSmartCartOpen(false)}
        />
      </div>
    </>
  );
};

export default Landing;

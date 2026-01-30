import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Zap, Percent, Gift, Clock, Truck, Package } from 'lucide-react';
import { cn } from '@/lib/utils';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface PromoBanner {
  id: string;
  title: string;
  subtitle: string;
  cta: string;
  gradient: string;
  icon: React.ReactNode;
  badge?: string;
  action: 'scroll' | 'navigate' | 'filter' | 'toast';
  target?: string;
  category?: string;
  toastMessage?: string;
}

const promoBanners: PromoBanner[] = [
  {
    id: '1',
    title: 'Flash Sale Live!',
    subtitle: 'Up to 50% off on daily essentials',
    cta: 'Shop Now',
    gradient: 'from-primary via-primary/90 to-emerald-600',
    icon: <Zap className="w-8 h-8" />,
    badge: 'Ends in 2h',
    action: 'scroll',
    target: 'products-section',
  },
  {
    id: '2',
    title: 'Bulk Order Savings',
    subtitle: 'Orders ₹5000+ get FREE van delivery + up to 40% off',
    cta: 'Order Bulk',
    gradient: 'from-green-600 via-emerald-600 to-teal-600',
    icon: <Package className="w-8 h-8" />,
    badge: 'Best Value',
    action: 'filter',
    category: 'Staples',
  },
  {
    id: '3',
    title: 'Weekend Special',
    subtitle: 'Buy 2 Get 1 Free on snacks & beverages',
    cta: 'Grab Deal',
    gradient: 'from-orange-500 via-amber-500 to-yellow-500',
    icon: <Gift className="w-8 h-8" />,
    badge: 'Limited Time',
    action: 'filter',
    category: 'Snacks',
  },
  {
    id: '4',
    title: 'Free Delivery',
    subtitle: 'On orders above ₹100 - No code needed',
    cta: 'Order Now',
    gradient: 'from-blue-600 via-indigo-600 to-violet-600',
    icon: <Truck className="w-8 h-8" />,
    action: 'scroll',
    target: 'products-section',
  },
  {
    id: '5',
    title: 'Member Exclusive',
    subtitle: 'Extra 15% off with FlashCart Prime',
    cta: 'Join Prime',
    gradient: 'from-rose-500 via-pink-500 to-fuchsia-500',
    icon: <Percent className="w-8 h-8" />,
    badge: 'New',
    action: 'navigate',
    target: '/my-plan',
  },
  {
    id: '6',
    title: 'Express Delivery',
    subtitle: 'Get groceries in 10 minutes flat',
    cta: 'Try Express',
    gradient: 'from-cyan-500 via-teal-500 to-emerald-500',
    icon: <Clock className="w-8 h-8" />,
    badge: 'Fast',
    action: 'toast',
    toastMessage: '⚡ Express delivery enabled! Your items will arrive in 10 minutes.',
  },
];

interface PromoCarouselProps {
  onCategorySelect?: (category: string) => void;
}

const PromoCarousel = ({ onCategorySelect }: PromoCarouselProps) => {
  const navigate = useNavigate();
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: 'start' },
    [Autoplay({ delay: 4000, stopOnInteraction: false })]
  );
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);
  const scrollTo = useCallback((index: number) => emblaApi?.scrollTo(index), [emblaApi]);

  const handleBannerClick = useCallback((banner: PromoBanner) => {
    switch (banner.action) {
      case 'scroll':
        if (banner.target) {
          const element = document.getElementById(banner.target);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }
        break;
      case 'navigate':
        if (banner.target) {
          navigate(banner.target);
        }
        break;
      case 'filter':
        if (banner.category && onCategorySelect) {
          onCategorySelect(banner.category);
          toast.success(`Showing ${banner.category} products`, {
            description: banner.subtitle,
          });
        }
        break;
      case 'toast':
        if (banner.toastMessage) {
          toast.success(banner.toastMessage);
        }
        break;
    }
  }, [navigate, onCategorySelect]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
    return () => {
      emblaApi.off('select', onSelect);
      emblaApi.off('reInit', onSelect);
    };
  }, [emblaApi, onSelect]);

  return (
    <section className="relative w-full overflow-hidden">
      {/* Carousel Container */}
      <div ref={emblaRef} className="overflow-hidden">
        <div className="flex">
          {promoBanners.map((banner) => (
            <div
              key={banner.id}
              className="flex-[0_0_100%] min-w-0 px-4 sm:px-0"
            >
              <div
                className={cn(
                  "relative overflow-hidden rounded-2xl sm:rounded-3xl mx-auto max-w-7xl",
                  "bg-gradient-to-r",
                  banner.gradient
                )}
              >
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
                  <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2" />
                  <div className="absolute inset-0" style={{
                    backgroundImage: `radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)`
                  }} />
                </div>

                {/* Content */}
                <div className="relative flex items-center justify-between p-5 sm:p-8 min-h-[140px] sm:min-h-[160px]">
                  <div className="flex items-center gap-4 sm:gap-6">
                    {/* Icon */}
                    <div className="hidden sm:flex items-center justify-center w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm text-white">
                      {banner.icon}
                    </div>

                    {/* Text */}
                    <div className="space-y-1 sm:space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">
                          {banner.title}
                        </h3>
                        {banner.badge && (
                          <span className="px-2 py-0.5 text-[10px] sm:text-xs font-bold bg-white/20 backdrop-blur-sm text-white rounded-full">
                            {banner.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-sm sm:text-base text-white/90 max-w-md">
                        {banner.subtitle}
                      </p>
                    </div>
                  </div>

                  {/* CTA Button */}
                  <button
                    onClick={() => handleBannerClick(banner)}
                    className={cn(
                      "shrink-0 px-5 sm:px-8 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl font-bold text-sm sm:text-base",
                      "bg-white text-gray-900 shadow-lg",
                      "hover:scale-105 active:scale-95 transition-all duration-200",
                      "hover:shadow-xl cursor-pointer"
                    )}
                  >
                    {banner.cta}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={scrollPrev}
        className={cn(
          "absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 z-10",
          "w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/90 backdrop-blur-sm shadow-lg",
          "flex items-center justify-center",
          "hover:bg-white hover:scale-110 active:scale-95 transition-all duration-200",
          "text-foreground"
        )}
      >
        <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
      </button>

      <button
        onClick={scrollNext}
        className={cn(
          "absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 z-10",
          "w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/90 backdrop-blur-sm shadow-lg",
          "flex items-center justify-center",
          "hover:bg-white hover:scale-110 active:scale-95 transition-all duration-200",
          "text-foreground"
        )}
      >
        <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
      </button>

      {/* Dots Indicator */}
      <div className="flex justify-center gap-2 mt-4">
        {promoBanners.map((_, index) => (
          <button
            key={index}
            onClick={() => scrollTo(index)}
            className={cn(
              "transition-all duration-300 rounded-full",
              selectedIndex === index
                ? "w-6 h-2 bg-primary"
                : "w-2 h-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
            )}
          />
        ))}
      </div>
    </section>
  );
};

export default PromoCarousel;

import { useState } from 'react';
import { 
  Scale, Store, Sparkles, Heart, Bell, Percent, ShoppingCart, 
  ChefHat, Video, MapPin, X, ChevronRight, Zap, Star, CalendarDays
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { StoreSummary } from '@/hooks/useLivePrices';

interface FloatingUtilityBarProps {
  stores: StoreSummary[];
  selectedStores: string[];
  onStoreToggle: (storeId: string) => void;
  onOpenRecipeFinder: () => void;
  onOpenRecipeVideo: () => void;
  onOpenDealFinder: () => void;
  onOpenPriceAlerts: () => void;
  onOpenSmartCart: () => void;
  onOpenWishlist: () => void;
  onOpenAddressManager: () => void;
  onOpenAIPlanner: () => void;
}

// Big retail stores - for price comparison only
const COMPARISON_ONLY_STORES = ['dmart', 'd-mart', 'reliance', 'bigbazaar', 'big bazaar', 'more', 'spencer', 'blinkit', 'zepto', 'bigbasket', 'jiomart', 'amazon', 'flipkart'];

const isComparisonOnly = (storeName: string) => {
  return COMPARISON_ONLY_STORES.some(s => 
    storeName.toLowerCase().includes(s) || 
    storeName.toLowerCase().replace(/[\s-]/g, '').includes(s)
  );
};

const FloatingUtilityBar = ({
  stores,
  selectedStores,
  onStoreToggle,
  onOpenRecipeFinder,
  onOpenRecipeVideo,
  onOpenDealFinder,
  onOpenPriceAlerts,
  onOpenSmartCart,
  onOpenWishlist,
  onOpenAddressManager,
  onOpenAIPlanner,
}: FloatingUtilityBarProps) => {
  const [activePanel, setActivePanel] = useState<'compare' | 'kirana' | 'ai' | null>(null);
  const [hoveredButton, setHoveredButton] = useState<string | null>(null);

  const comparisonStores = stores.filter(s => isComparisonOnly(s.name));
  const orderableStores = stores.filter(s => !isComparisonOnly(s.name));

  const togglePanel = (panel: 'compare' | 'kirana' | 'ai') => {
    setActivePanel(activePanel === panel ? null : panel);
  };

  const aiTools = [
    { icon: CalendarDays, label: 'AI Planner', desc: 'Monthly grocery plan', onClick: onOpenAIPlanner, color: 'text-primary', bg: 'bg-primary/10', hoverBg: 'hover:bg-primary/20', featured: true },
    { icon: ChefHat, label: 'Recipe Finder', desc: 'AI-powered recipes & meals', onClick: onOpenRecipeFinder, color: 'text-accent', bg: 'bg-accent/10', hoverBg: 'hover:bg-accent/20' },
    { icon: Video, label: 'Recipe Video', desc: 'Create cooking videos', onClick: onOpenRecipeVideo, color: 'text-pink-500', bg: 'bg-pink-500/10', hoverBg: 'hover:bg-pink-500/20' },
    { icon: Percent, label: 'Deal Finder', desc: 'Best price deals', onClick: onOpenDealFinder, color: 'text-green-500', bg: 'bg-green-500/10', hoverBg: 'hover:bg-green-500/20' },
    { icon: Bell, label: 'Price Alerts', desc: 'Get notified', onClick: onOpenPriceAlerts, color: 'text-amber-500', bg: 'bg-amber-500/10', hoverBg: 'hover:bg-amber-500/20' },
    { icon: ShoppingCart, label: 'Smart Cart', desc: 'Auto deal tracker', onClick: onOpenSmartCart, color: 'text-blue-500', bg: 'bg-blue-500/10', hoverBg: 'hover:bg-blue-500/20' },
    { icon: Heart, label: 'Wishlist', desc: 'Saved items', onClick: onOpenWishlist, color: 'text-red-500', bg: 'bg-red-500/10', hoverBg: 'hover:bg-red-500/20' },
  ];

  const floatingButtons = [
    { id: 'planner', icon: CalendarDays, label: 'Planner', onClick: onOpenAIPlanner, activeColor: 'bg-gradient-to-r from-primary to-accent', activeShadow: 'shadow-primary/30', featured: true },
    { id: 'ai', icon: Sparkles, label: 'AI Tools', activeColor: 'bg-gradient-to-r from-primary to-primary/80', activeShadow: 'shadow-primary/30' },
    { id: 'kirana', icon: Store, label: 'Kirana', activeColor: 'bg-gradient-to-r from-green-600 to-green-500', activeShadow: 'shadow-green-500/30', badge: orderableStores.length },
    { id: 'compare', icon: Scale, label: 'Compare', activeColor: 'bg-gradient-to-r from-amber-500 to-orange-500', activeShadow: 'shadow-amber-500/30', badge: selectedStores.length },
    { id: 'location', icon: MapPin, label: 'Location', onClick: onOpenAddressManager },
  ];

  return (
    <>
      {/* Floating Toolbar - Fixed Bottom Right */}
      <div className="fixed bottom-24 right-4 z-40 flex flex-col items-end gap-3">
        {floatingButtons.map((btn, index) => {
          const isActive = activePanel === btn.id;
          const isHovered = hoveredButton === btn.id;
          
          return (
            <button
              key={btn.id}
              onClick={() => btn.onClick ? btn.onClick() : togglePanel(btn.id as any)}
              onMouseEnter={() => setHoveredButton(btn.id)}
              onMouseLeave={() => setHoveredButton(null)}
              className={cn(
                "flex items-center gap-2.5 px-4 py-3 rounded-2xl transition-all duration-300",
                "shadow-lg hover:shadow-xl active:scale-95",
                "border backdrop-blur-sm",
                isActive
                  ? cn(btn.activeColor, "text-white border-transparent", btn.activeShadow, "shadow-xl scale-105")
                  : "bg-card/95 text-foreground border-border/50 hover:border-primary/30"
              )}
              style={{
                animationDelay: `${index * 100}ms`
              }}
            >
              <div className={cn(
                "transition-transform duration-300",
                (isActive || isHovered) && "scale-110"
              )}>
                <btn.icon className="w-5 h-5" />
              </div>
              
              <span className={cn(
                "text-sm font-semibold hidden sm:inline transition-all duration-300",
                isHovered && !isActive && "text-primary"
              )}>
                {btn.label}
              </span>
              
              {btn.badge !== undefined && btn.badge > 0 && (
                <span className={cn(
                  "min-w-[20px] h-5 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300",
                  isActive 
                    ? "bg-white/20 text-white" 
                    : "bg-primary/10 text-primary"
                )}>
                  {btn.badge}
                </span>
              )}
              
              {/* Tooltip on mobile */}
              {isHovered && (
                <div className="absolute right-full mr-3 px-2 py-1 bg-foreground text-background text-xs font-medium rounded-lg whitespace-nowrap sm:hidden">
                  {btn.label}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Slide-out Panels */}
      {activePanel && (
        <div className="fixed inset-0 z-50" onClick={() => setActivePanel(null)}>
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm animate-fade-in" />
          
          {/* Panel */}
          <div 
            className={cn(
              "absolute bottom-0 right-0 w-full max-w-md bg-card rounded-t-3xl shadow-2xl",
              "border-t border-x border-border/50 animate-slide-up overflow-hidden"
            )}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-12 h-1 rounded-full bg-muted-foreground/30" />
            </div>
            
            {/* Panel Header */}
            <div className="flex items-center justify-between px-5 pb-4 border-b border-border/50">
              <div className="flex items-center gap-4">
                {activePanel === 'compare' && (
                  <>
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 flex items-center justify-center shadow-sm">
                      <Scale className="w-6 h-6 text-amber-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-foreground">Compare Prices</h3>
                      <p className="text-xs text-muted-foreground">View prices from major stores</p>
                    </div>
                  </>
                )}
                {activePanel === 'kirana' && (
                  <>
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 flex items-center justify-center shadow-sm">
                      <Store className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-foreground">Kirana Partners</h3>
                      <p className="text-xs text-muted-foreground">Order from trusted local stores</p>
                    </div>
                  </>
                )}
                {activePanel === 'ai' && (
                  <>
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center shadow-sm">
                      <Sparkles className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-foreground">AI Tools</h3>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        Powered by <Zap className="w-3 h-3 text-primary" /> Gemini & GPT-5
                      </p>
                    </div>
                  </>
                )}
              </div>
              <button
                onClick={() => setActivePanel(null)}
                className="p-2.5 hover:bg-muted rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            {/* Panel Content */}
            <div className="p-5 max-h-[60vh] overflow-y-auto">
              {/* Compare Panel */}
              {activePanel === 'compare' && (
                <div className="space-y-2.5">
                  {comparisonStores.map((store, index) => (
                    <button
                      key={store.id}
                      onClick={() => onStoreToggle(store.id)}
                      className={cn(
                        "w-full flex items-center justify-between p-4 rounded-2xl transition-all duration-300",
                        "hover:scale-[1.02] active:scale-[0.98]",
                        selectedStores.includes(store.id)
                          ? "bg-gradient-to-r from-primary/10 to-primary/5 border-2 border-primary shadow-md"
                          : "bg-muted/30 border-2 border-transparent hover:bg-muted/50 hover:border-border"
                      )}
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="flex items-center gap-4">
                        <span className="text-3xl">{store.logo}</span>
                        <div className="text-left">
                          <p className="font-semibold text-foreground">{store.name}</p>
                          <p className="text-xs text-muted-foreground">{store.availableProducts} products available</p>
                        </div>
                      </div>
                      <div className={cn(
                        "w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all duration-300",
                        selectedStores.includes(store.id)
                          ? "bg-primary border-primary scale-110"
                          : "border-muted-foreground/30 hover:border-primary/50"
                      )}>
                        {selectedStores.includes(store.id) && (
                          <svg className="w-4 h-4 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                    </button>
                  ))}
                  <p className="text-xs text-muted-foreground text-center pt-3 flex items-center justify-center gap-2">
                    <span className="w-8 h-px bg-border" />
                    Compare prices only • Orders via Kirana
                    <span className="w-8 h-px bg-border" />
                  </p>
                </div>
              )}

              {/* Kirana Panel */}
              {activePanel === 'kirana' && (
                <div className="space-y-2.5">
                  {orderableStores.length > 0 ? (
                    orderableStores.map((store, index) => (
                      <button
                        key={store.id}
                        onClick={() => onStoreToggle(store.id)}
                        className={cn(
                          "w-full flex items-center justify-between p-4 rounded-2xl transition-all duration-300",
                          "hover:scale-[1.02] active:scale-[0.98]",
                          selectedStores.includes(store.id)
                            ? "bg-gradient-to-r from-green-100 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/20 border-2 border-green-500 shadow-md"
                            : "bg-muted/30 border-2 border-transparent hover:bg-muted/50 hover:border-green-200"
                        )}
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <div className="flex items-center gap-4">
                          <span className="text-3xl">{store.logo}</span>
                          <div className="text-left">
                            <p className="font-semibold text-foreground">{store.name}</p>
                            <p className="text-xs text-green-600 font-medium flex items-center gap-1">
                              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                              Ready to deliver
                            </p>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-muted-foreground" />
                      </button>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-20 h-20 rounded-3xl bg-muted/50 flex items-center justify-center mx-auto mb-4">
                        <Store className="w-10 h-10 text-muted-foreground" />
                      </div>
                      <p className="font-semibold text-foreground">Coming Soon!</p>
                      <p className="text-sm text-muted-foreground mt-1">No Kirana partners in your area yet</p>
                      <p className="text-xs text-primary mt-2">We're expanding rapidly 🚀</p>
                    </div>
                  )}
                </div>
              )}

              {/* AI Tools Panel */}
              {activePanel === 'ai' && (
                <div className="grid grid-cols-2 gap-3">
                  {aiTools.map((tool, index) => (
                    <button
                      key={tool.label}
                      onClick={() => {
                        tool.onClick();
                        setActivePanel(null);
                      }}
                      className={cn(
                        "flex flex-col items-center gap-3 p-5 rounded-2xl transition-all duration-300",
                        "hover:scale-105 active:scale-95",
                        tool.bg, tool.hoverBg,
                        "border border-transparent hover:border-current/10"
                      )}
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className={cn(
                        "w-14 h-14 rounded-2xl bg-background flex items-center justify-center",
                        "shadow-lg transition-all duration-300"
                      )}>
                        <tool.icon className={cn("w-7 h-7", tool.color)} />
                      </div>
                      <div className="text-center">
                        <span className="text-sm font-bold text-foreground block">{tool.label}</span>
                        <span className="text-[10px] text-muted-foreground">{tool.desc}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            {/* Panel Footer */}
            <div className="px-5 py-4 border-t border-border/50 bg-muted/30">
              <p className="text-[10px] text-center text-muted-foreground flex items-center justify-center gap-1">
                <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                4.9 rating • Trusted by 10K+ families
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FloatingUtilityBar;

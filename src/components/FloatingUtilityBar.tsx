import { useState } from 'react';
import { 
  Scale, Store, Sparkles, Heart, Bell, Percent, ShoppingCart, 
  ChefHat, Video, MapPin, X, ChevronRight
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
}: FloatingUtilityBarProps) => {
  const [activePanel, setActivePanel] = useState<'compare' | 'kirana' | 'ai' | null>(null);

  const comparisonStores = stores.filter(s => isComparisonOnly(s.name));
  const orderableStores = stores.filter(s => !isComparisonOnly(s.name));

  const togglePanel = (panel: 'compare' | 'kirana' | 'ai') => {
    setActivePanel(activePanel === panel ? null : panel);
  };

  const aiTools = [
    { icon: ChefHat, label: 'Recipe Finder', onClick: onOpenRecipeFinder, color: 'text-accent' },
    { icon: Video, label: 'Recipe Video', onClick: onOpenRecipeVideo, color: 'text-pink-500' },
    { icon: Percent, label: 'Deal Finder', onClick: onOpenDealFinder, color: 'text-green-500' },
    { icon: Bell, label: 'Price Alerts', onClick: onOpenPriceAlerts, color: 'text-amber-500' },
    { icon: ShoppingCart, label: 'Smart Cart', onClick: onOpenSmartCart, color: 'text-blue-500' },
    { icon: Heart, label: 'Wishlist', onClick: onOpenWishlist, color: 'text-red-500' },
  ];

  return (
    <>
      {/* Floating Toolbar - Fixed Bottom Right */}
      <div className="fixed bottom-20 right-4 z-40 flex flex-col items-end gap-2">
        {/* AI Tools Button */}
        <button
          onClick={() => togglePanel('ai')}
          className={cn(
            "flex items-center gap-2 px-4 py-3 rounded-full shadow-lg transition-all duration-300",
            activePanel === 'ai'
              ? "bg-primary text-primary-foreground scale-105"
              : "bg-card text-foreground hover:bg-primary/10 border border-border"
          )}
        >
          <Sparkles className="w-5 h-5" />
          <span className="text-sm font-medium hidden sm:inline">AI Tools</span>
        </button>

        {/* Kirana Partners Button */}
        <button
          onClick={() => togglePanel('kirana')}
          className={cn(
            "flex items-center gap-2 px-4 py-3 rounded-full shadow-lg transition-all duration-300",
            activePanel === 'kirana'
              ? "bg-green-600 text-white scale-105"
              : "bg-card text-foreground hover:bg-green-50 dark:hover:bg-green-950/30 border border-border"
          )}
        >
          <Store className="w-5 h-5" />
          <span className="text-sm font-medium hidden sm:inline">Order Kirana</span>
          {orderableStores.length > 0 && (
            <span className="w-5 h-5 rounded-full bg-green-500 text-white text-xs flex items-center justify-center">
              {orderableStores.length}
            </span>
          )}
        </button>

        {/* Compare Prices Button */}
        <button
          onClick={() => togglePanel('compare')}
          className={cn(
            "flex items-center gap-2 px-4 py-3 rounded-full shadow-lg transition-all duration-300",
            activePanel === 'compare'
              ? "bg-amber-500 text-white scale-105"
              : "bg-card text-foreground hover:bg-amber-50 dark:hover:bg-amber-950/30 border border-border"
          )}
        >
          <Scale className="w-5 h-5" />
          <span className="text-sm font-medium hidden sm:inline">Compare</span>
          {selectedStores.length > 0 && (
            <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
              {selectedStores.length}
            </span>
          )}
        </button>

        {/* Location Button */}
        <button
          onClick={onOpenAddressManager}
          className="flex items-center gap-2 px-4 py-3 rounded-full shadow-lg bg-card text-foreground hover:bg-muted border border-border transition-all"
        >
          <MapPin className="w-5 h-5 text-primary" />
          <span className="text-sm font-medium hidden sm:inline">Location</span>
        </button>
      </div>

      {/* Slide-out Panels */}
      {activePanel && (
        <div className="fixed inset-0 z-50" onClick={() => setActivePanel(null)}>
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />
          
          <div 
            className="absolute bottom-0 right-0 w-full max-w-sm bg-card rounded-t-3xl shadow-2xl border-t border-border animate-slide-up overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Panel Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-3">
                {activePanel === 'compare' && (
                  <>
                    <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                      <Scale className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">Compare Prices</h3>
                      <p className="text-xs text-muted-foreground">View prices from major stores</p>
                    </div>
                  </>
                )}
                {activePanel === 'kirana' && (
                  <>
                    <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                      <Store className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">Kirana Partners</h3>
                      <p className="text-xs text-muted-foreground">Order from trusted local stores</p>
                    </div>
                  </>
                )}
                {activePanel === 'ai' && (
                  <>
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">AI Tools</h3>
                      <p className="text-xs text-muted-foreground">Smart shopping assistants</p>
                    </div>
                  </>
                )}
              </div>
              <button
                onClick={() => setActivePanel(null)}
                className="p-2 hover:bg-muted rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            {/* Panel Content */}
            <div className="p-4 max-h-[60vh] overflow-y-auto">
              {/* Compare Panel */}
              {activePanel === 'compare' && (
                <div className="space-y-2">
                  {comparisonStores.map((store) => (
                    <button
                      key={store.id}
                      onClick={() => onStoreToggle(store.id)}
                      className={cn(
                        "w-full flex items-center justify-between p-3 rounded-xl transition-all",
                        selectedStores.includes(store.id)
                          ? "bg-primary/10 border-2 border-primary"
                          : "bg-muted/50 border-2 border-transparent hover:bg-muted"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{store.logo}</span>
                        <div className="text-left">
                          <p className="font-medium text-foreground">{store.name}</p>
                          <p className="text-xs text-muted-foreground">{store.availableProducts} products</p>
                        </div>
                      </div>
                      <div className={cn(
                        "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                        selectedStores.includes(store.id)
                          ? "bg-primary border-primary"
                          : "border-muted-foreground/30"
                      )}>
                        {selectedStores.includes(store.id) && (
                          <svg className="w-4 h-4 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                    </button>
                  ))}
                  <p className="text-xs text-muted-foreground text-center pt-2">
                    Compare prices only • Orders fulfilled by Kirana partners
                  </p>
                </div>
              )}

              {/* Kirana Panel */}
              {activePanel === 'kirana' && (
                <div className="space-y-2">
                  {orderableStores.length > 0 ? (
                    orderableStores.map((store) => (
                      <button
                        key={store.id}
                        onClick={() => onStoreToggle(store.id)}
                        className={cn(
                          "w-full flex items-center justify-between p-3 rounded-xl transition-all",
                          selectedStores.includes(store.id)
                            ? "bg-green-100 dark:bg-green-900/30 border-2 border-green-500"
                            : "bg-muted/50 border-2 border-transparent hover:bg-muted"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{store.logo}</span>
                          <div className="text-left">
                            <p className="font-medium text-foreground">{store.name}</p>
                            <p className="text-xs text-green-600">Ready to deliver</p>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-muted-foreground" />
                      </button>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <Store className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                      <p className="text-muted-foreground">No Kirana partners in your area yet</p>
                      <p className="text-xs text-muted-foreground mt-1">We're expanding soon!</p>
                    </div>
                  )}
                </div>
              )}

              {/* AI Tools Panel */}
              {activePanel === 'ai' && (
                <div className="grid grid-cols-2 gap-3">
                  {aiTools.map((tool) => (
                    <button
                      key={tool.label}
                      onClick={() => {
                        tool.onClick();
                        setActivePanel(null);
                      }}
                      className="flex flex-col items-center gap-2 p-4 rounded-xl bg-muted/50 hover:bg-muted transition-all hover:scale-105"
                    >
                      <div className="w-12 h-12 rounded-full bg-background flex items-center justify-center shadow-sm">
                        <tool.icon className={cn("w-6 h-6", tool.color)} />
                      </div>
                      <span className="text-sm font-medium text-foreground">{tool.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FloatingUtilityBar;

import { cn } from '@/lib/utils';
import { useState } from 'react';

interface MinimalCategoryNavProps {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

const categories = [
  { id: 'All', emoji: '🛒', label: 'All', gradient: 'from-primary/20 to-primary/10' },
  { id: 'vegetables', emoji: '🥬', label: 'Vegetables', gradient: 'from-emerald-100 to-green-50' },
  { id: 'fruits', emoji: '🍎', label: 'Fruits', gradient: 'from-orange-100 to-amber-50' },
  { id: 'dairy', emoji: '🥛', label: 'Dairy', gradient: 'from-sky-100 to-blue-50' },
  { id: 'grains', emoji: '🌾', label: 'Atta & Rice', gradient: 'from-amber-100 to-yellow-50' },
  { id: 'snacks', emoji: '🍿', label: 'Snacks', gradient: 'from-rose-100 to-pink-50' },
  { id: 'beverages', emoji: '☕', label: 'Beverages', gradient: 'from-cyan-100 to-teal-50' },
  { id: 'essentials', emoji: '🧂', label: 'Masala', gradient: 'from-violet-100 to-purple-50' },
];

const MinimalCategoryNav = ({ activeCategory, onCategoryChange }: MinimalCategoryNavProps) => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <div className="overflow-x-auto scrollbar-hide -mx-4 px-4">
      <div className="flex gap-3 min-w-max pb-2">
        {categories.map((category, index) => {
          const isActive = activeCategory === category.id;
          const isHovered = hoveredId === category.id;
          
          return (
            <button
              key={category.id}
              onClick={() => onCategoryChange(category.id)}
              onMouseEnter={() => setHoveredId(category.id)}
              onMouseLeave={() => setHoveredId(null)}
              className={cn(
                "relative flex flex-col items-center gap-2 px-5 py-3.5 rounded-2xl transition-all duration-300 min-w-[85px]",
                "hover:scale-105 active:scale-95",
                isActive
                  ? "bg-gradient-to-br shadow-lg scale-105"
                  : "bg-card hover:bg-muted border border-border/50 hover:border-primary/30 hover:shadow-md"
              )}
              style={{
                animationDelay: `${index * 50}ms`
              }}
            >
              {/* Active indicator glow */}
              {isActive && (
                <>
                  <div className={cn(
                    "absolute inset-0 rounded-2xl bg-gradient-to-br opacity-100",
                    category.gradient
                  )} />
                  <div className="absolute inset-0 rounded-2xl ring-2 ring-primary/50 ring-offset-2 ring-offset-background" />
                </>
              )}
              
              {/* Emoji with bounce effect */}
              <div className={cn(
                "relative z-10 transition-all duration-300",
                (isActive || isHovered) && "transform -translate-y-0.5"
              )}>
                <span className={cn(
                  "text-3xl block transition-transform duration-300",
                  (isActive || isHovered) && "scale-110"
                )}>
                  {category.emoji}
                </span>
                
                {/* Emoji shadow */}
                <div className={cn(
                  "absolute -bottom-1 left-1/2 -translate-x-1/2 w-6 h-1.5 bg-black/10 rounded-full blur-sm transition-all duration-300",
                  (isActive || isHovered) ? "w-8 opacity-30" : "opacity-20"
                )} />
              </div>
              
              {/* Label */}
              <span className={cn(
                "relative z-10 text-[11px] font-semibold whitespace-nowrap transition-all duration-300",
                isActive
                  ? "text-primary"
                  : isHovered
                    ? "text-foreground"
                    : "text-muted-foreground"
              )}>
                {category.label}
              </span>
              
              {/* Active dot indicator */}
              {isActive && (
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-primary shadow-lg shadow-primary/50" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default MinimalCategoryNav;

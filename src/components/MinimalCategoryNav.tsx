import { cn } from '@/lib/utils';

interface MinimalCategoryNavProps {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

const categories = [
  { id: 'All', emoji: '🛒', label: 'All' },
  { id: 'vegetables', emoji: '🥬', label: 'Vegetables' },
  { id: 'fruits', emoji: '🍎', label: 'Fruits' },
  { id: 'dairy', emoji: '🥛', label: 'Dairy' },
  { id: 'grains', emoji: '🌾', label: 'Atta & Rice' },
  { id: 'snacks', emoji: '🍿', label: 'Snacks' },
  { id: 'beverages', emoji: '☕', label: 'Beverages' },
  { id: 'essentials', emoji: '🧂', label: 'Masala' },
];

const MinimalCategoryNav = ({ activeCategory, onCategoryChange }: MinimalCategoryNavProps) => {
  return (
    <div className="overflow-x-auto scrollbar-hide -mx-4 px-4">
      <div className="flex gap-2 min-w-max pb-2">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onCategoryChange(category.id)}
            className={cn(
              "flex flex-col items-center gap-1.5 px-4 py-3 rounded-2xl transition-all duration-200 min-w-[80px]",
              activeCategory === category.id
                ? "bg-primary/10 border-2 border-primary shadow-sm"
                : "bg-card border-2 border-transparent hover:bg-muted"
            )}
          >
            <span className="text-2xl">{category.emoji}</span>
            <span className={cn(
              "text-[11px] font-medium whitespace-nowrap",
              activeCategory === category.id
                ? "text-primary"
                : "text-muted-foreground"
            )}>
              {category.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default MinimalCategoryNav;

import { Apple, Carrot, Milk, Wheat, Beef, Cookie, Coffee, Sparkles } from 'lucide-react';

const categories = [
  { id: 'fruits', name: 'Fruits', icon: Apple, color: 'bg-red-500/10 text-red-600' },
  { id: 'vegetables', name: 'Vegetables', icon: Carrot, color: 'bg-orange-500/10 text-orange-600' },
  { id: 'dairy', name: 'Dairy', icon: Milk, color: 'bg-blue-500/10 text-blue-600' },
  { id: 'grains', name: 'Grains', icon: Wheat, color: 'bg-amber-500/10 text-amber-600' },
  { id: 'meat', name: 'Meat & Fish', icon: Beef, color: 'bg-pink-500/10 text-pink-600' },
  { id: 'snacks', name: 'Snacks', icon: Cookie, color: 'bg-yellow-500/10 text-yellow-600' },
  { id: 'beverages', name: 'Beverages', icon: Coffee, color: 'bg-brown-500/10 text-amber-700' },
  { id: 'essentials', name: 'Essentials', icon: Sparkles, color: 'bg-primary/10 text-primary' },
];

interface CategoryNavProps {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

const CategoryNav = ({ activeCategory, onCategoryChange }: CategoryNavProps) => {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      <button
        onClick={() => onCategoryChange('all')}
        className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
          activeCategory === 'all'
            ? 'bg-primary text-primary-foreground'
            : 'bg-secondary hover:bg-secondary/80 text-foreground'
        }`}
      >
        All
      </button>
      {categories.map((cat) => {
        const Icon = cat.icon;
        return (
          <button
            key={cat.id}
            onClick={() => onCategoryChange(cat.id)}
            className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
              activeCategory === cat.id
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary hover:bg-secondary/80 text-foreground'
            }`}
          >
            <Icon className="w-4 h-4" />
            {cat.name}
          </button>
        );
      })}
    </div>
  );
};

export default CategoryNav;

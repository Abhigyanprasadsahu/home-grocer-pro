import { 
  Apple, 
  Milk, 
  Wheat, 
  Cookie, 
  Droplets, 
  Coffee, 
  Baby, 
  Sparkles,
  Beef,
  Salad
} from 'lucide-react';

interface QuickCategoriesProps {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

const categories = [
  { id: 'All', label: 'All', icon: Sparkles, color: 'bg-primary/10 text-primary' },
  { id: 'Fruits', label: 'Fruits', icon: Apple, color: 'bg-red-500/10 text-red-500' },
  { id: 'Vegetables', label: 'Veggies', icon: Salad, color: 'bg-green-500/10 text-green-600' },
  { id: 'Dairy', label: 'Dairy', icon: Milk, color: 'bg-blue-500/10 text-blue-500' },
  { id: 'Grains', label: 'Grains', icon: Wheat, color: 'bg-amber-500/10 text-amber-600' },
  { id: 'Meat', label: 'Meat', icon: Beef, color: 'bg-rose-500/10 text-rose-500' },
  { id: 'Snacks', label: 'Snacks', icon: Cookie, color: 'bg-orange-500/10 text-orange-500' },
  { id: 'Beverages', label: 'Drinks', icon: Coffee, color: 'bg-brown-500/10 text-yellow-700' },
  { id: 'Oils', label: 'Oils', icon: Droplets, color: 'bg-yellow-500/10 text-yellow-600' },
  { id: 'Baby', label: 'Baby', icon: Baby, color: 'bg-pink-500/10 text-pink-500' },
];

const QuickCategories = ({ activeCategory, onCategoryChange }: QuickCategoriesProps) => {
  return (
    <section className="py-4">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onCategoryChange(cat.id)}
              className={`flex flex-col items-center gap-2 px-4 py-3 rounded-2xl transition-all duration-200 min-w-[72px] ${
                activeCategory === cat.id
                  ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25 scale-105'
                  : 'bg-card hover:bg-muted border border-border/50'
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                activeCategory === cat.id 
                  ? 'bg-white/20' 
                  : cat.color
              }`}>
                <cat.icon className="w-5 h-5" />
              </div>
              <span className="text-xs font-medium whitespace-nowrap">{cat.label}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default QuickCategories;

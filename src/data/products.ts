export interface StorePrice {
  store: string;
  price: number;
  available: boolean;
  logo: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  image: string;
  unit: string;
  storePrices: StorePrice[];
  bestPrice: number;
  bestStore: string;
  mrp: number;
}

export const stores = [
  { id: 'dmart', name: 'D-Mart', logo: '🏪', color: 'bg-green-500' },
  { id: 'reliance', name: 'Reliance Fresh', logo: '🛒', color: 'bg-blue-500' },
  { id: 'bigbazaar', name: 'Big Bazaar', logo: '🏬', color: 'bg-orange-500' },
  { id: 'more', name: 'More Supermarket', logo: '🛍️', color: 'bg-purple-500' },
  { id: 'spencers', name: "Spencer's", logo: '🏢', color: 'bg-red-500' },
  { id: 'star', name: 'Star Bazaar', logo: '⭐', color: 'bg-yellow-500' },
];

// Seed for consistent random prices
const seededRandom = (seed: number) => {
  const x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
};

const generateStorePrices = (mrp: number, productSeed: number): StorePrice[] => {
  const discounts: Record<string, { min: number; max: number; availability: number }> = {
    'D-Mart': { min: 0.08, max: 0.20, availability: 0.95 },
    'Reliance Fresh': { min: 0.05, max: 0.15, availability: 0.90 },
    'Big Bazaar': { min: 0.06, max: 0.18, availability: 0.85 },
    'More Supermarket': { min: 0.03, max: 0.12, availability: 0.80 },
    "Spencer's": { min: 0.02, max: 0.10, availability: 0.88 },
    'Star Bazaar': { min: 0.04, max: 0.14, availability: 0.82 },
  };

  return stores.map((store, index) => {
    const discount = discounts[store.name];
    const seed = productSeed * 100 + index;
    const discountPercent = discount.min + seededRandom(seed) * (discount.max - discount.min);
    const price = Math.round(mrp * (1 - discountPercent));
    const available = seededRandom(seed + 50) < discount.availability;
    
    return {
      store: store.name,
      price,
      available,
      logo: store.logo,
    };
  });
};

const createProduct = (
  id: string,
  name: string,
  category: string,
  image: string,
  unit: string,
  mrp: number
): Product => {
  const productSeed = parseInt(id.replace(/\D/g, '') || '1', 10);
  const storePrices = generateStorePrices(mrp, productSeed);
  const availablePrices = storePrices.filter(sp => sp.available);
  const bestPriceStore = availablePrices.length > 0 
    ? availablePrices.reduce((a, b) => a.price < b.price ? a : b)
    : storePrices[0];

  return {
    id,
    name,
    category,
    image,
    unit,
    storePrices,
    bestPrice: bestPriceStore.price,
    bestStore: bestPriceStore.store,
    mrp,
  };
};

export const products: Product[] = [
  // Vegetables
  createProduct('v1', 'Fresh Tomatoes', 'vegetables', '🍅', '1 kg', 45),
  createProduct('v2', 'Onions', 'vegetables', '🧅', '1 kg', 35),
  createProduct('v3', 'Potatoes', 'vegetables', '🥔', '1 kg', 30),
  createProduct('v4', 'Green Capsicum', 'vegetables', '🫑', '500 g', 80),
  createProduct('v5', 'Carrots', 'vegetables', '🥕', '500 g', 50),
  createProduct('v6', 'Cauliflower', 'vegetables', '🥦', 'piece', 40),
  createProduct('v7', 'Fresh Spinach', 'vegetables', '🥬', '250 g', 25),
  createProduct('v8', 'Brinjal', 'vegetables', '🍆', '500 g', 45),
  
  // Fruits
  createProduct('f1', 'Fresh Bananas', 'fruits', '🍌', '1 dozen', 50),
  createProduct('f2', 'Red Apples (Shimla)', 'fruits', '🍎', '1 kg', 180),
  createProduct('f3', 'Fresh Oranges', 'fruits', '🍊', '1 kg', 80),
  createProduct('f4', 'Alphonso Mangoes', 'fruits', '🥭', '1 kg', 350),
  createProduct('f5', 'Grapes', 'fruits', '🍇', '500 g', 120),
  createProduct('f6', 'Pomegranate', 'fruits', '🫐', '1 kg', 160),
  createProduct('f7', 'Papaya', 'fruits', '🍈', '1 kg', 50),
  createProduct('f8', 'Watermelon', 'fruits', '🍉', '1 kg', 25),
  
  // Dairy
  createProduct('d1', 'Amul Taaza Milk', 'dairy', '🥛', '500 ml', 28),
  createProduct('d2', 'Fresh Paneer', 'dairy', '🧀', '200 g', 90),
  createProduct('d3', 'Amul Butter', 'dairy', '🧈', '100 g', 56),
  createProduct('d4', 'Greek Yogurt', 'dairy', '🍶', '400 g', 95),
  createProduct('d5', 'Cheese Slices', 'dairy', '🧀', '200 g', 150),
  createProduct('d6', 'Amul Ghee', 'dairy', '🫕', '500 ml', 350),
  
  // Grains & Pulses
  createProduct('g1', 'Basmati Rice', 'grains', '🍚', '1 kg', 180),
  createProduct('g2', 'Whole Wheat Atta', 'grains', '🌾', '5 kg', 250),
  createProduct('g3', 'Toor Dal', 'grains', '🫘', '1 kg', 160),
  createProduct('g4', 'Chana Dal', 'grains', '🫘', '1 kg', 120),
  createProduct('g5', 'Moong Dal', 'grains', '🫘', '1 kg', 140),
  createProduct('g6', 'Masoor Dal', 'grains', '🫘', '1 kg', 110),
  
  // Snacks
  createProduct('s1', 'Lays Classic Chips', 'snacks', '🍟', '52 g', 20),
  createProduct('s2', 'Parle-G Biscuits', 'snacks', '🍪', '800 g', 80),
  createProduct('s3', 'Mixed Dry Fruits', 'snacks', '🥜', '500 g', 550),
  createProduct('s4', 'Maggi Noodles', 'snacks', '🍜', '4 pack', 56),
  
  // Beverages
  createProduct('b1', 'Tata Tea Gold', 'beverages', '🍵', '500 g', 280),
  createProduct('b2', 'Nescafe Classic', 'beverages', '☕', '100 g', 220),
  createProduct('b3', 'Real Fruit Juice', 'beverages', '🧃', '1 L', 99),
  createProduct('b4', 'Coca Cola', 'beverages', '🥤', '2 L', 95),
  
  // Essentials
  createProduct('e1', 'Saffola Gold Oil', 'essentials', '🫒', '1 L', 175),
  createProduct('e2', 'Tata Salt', 'essentials', '🧂', '1 kg', 24),
  createProduct('e3', 'MDH Garam Masala', 'essentials', '🌶️', '100 g', 85),
  createProduct('e4', 'Sugar', 'essentials', '🍬', '1 kg', 55),
  createProduct('e5', 'Turmeric Powder', 'essentials', '🟡', '200 g', 60),
  createProduct('e6', 'Red Chilli Powder', 'essentials', '🌶️', '200 g', 70),
];

export const categories = [
  'all',
  'vegetables',
  'fruits', 
  'dairy',
  'grains',
  'snacks',
  'beverages',
  'essentials'
];

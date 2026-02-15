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
  createProduct('v1', 'Fresh Tomatoes', 'vegetables', 'https://images.unsplash.com/photo-1546470427-227c7e61c738?w=200', '1 kg', 45),
  createProduct('v2', 'Onions', 'vegetables', 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=200', '1 kg', 35),
  createProduct('v3', 'Potatoes', 'vegetables', 'https://images.unsplash.com/photo-1518977676601-b53f82bbe9e8?w=200', '1 kg', 30),
  createProduct('v4', 'Green Capsicum', 'vegetables', 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=200', '500 g', 80),
  createProduct('v5', 'Carrots', 'vegetables', 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=200', '500 g', 50),
  createProduct('v6', 'Cauliflower', 'vegetables', 'https://images.unsplash.com/photo-1568584711075-3d021a7c3ca3?w=200', 'piece', 40),
  createProduct('v7', 'Fresh Spinach', 'vegetables', 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=200', '250 g', 25),
  createProduct('v8', 'Brinjal', 'vegetables', 'https://images.unsplash.com/photo-1604977042946-1eecc30f269e?w=200', '500 g', 45),
  
  // Fruits
  createProduct('f1', 'Fresh Bananas', 'fruits', 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=200', '1 dozen', 50),
  createProduct('f2', 'Red Apples (Shimla)', 'fruits', 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=200', '1 kg', 180),
  createProduct('f3', 'Fresh Oranges', 'fruits', 'https://images.unsplash.com/photo-1547514701-42782101795e?w=200', '1 kg', 80),
  createProduct('f4', 'Alphonso Mangoes', 'fruits', 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=200', '1 kg', 350),
  createProduct('f5', 'Grapes', 'fruits', 'https://images.unsplash.com/photo-1537640538966-79f369143f8f?w=200', '500 g', 120),
  createProduct('f6', 'Pomegranate', 'fruits', 'https://images.unsplash.com/photo-1541344999736-4a22b0eb5e86?w=200', '1 kg', 160),
  createProduct('f7', 'Papaya', 'fruits', 'https://images.unsplash.com/photo-1517282009859-f000ec3b26fe?w=200', '1 kg', 50),
  createProduct('f8', 'Watermelon', 'fruits', 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=200', '1 kg', 25),
  
  // Dairy
  createProduct('d1', 'Amul Taaza Milk', 'dairy', 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=200', '500 ml', 28),
  createProduct('d2', 'Fresh Paneer', 'dairy', 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=200', '200 g', 90),
  createProduct('d3', 'Amul Butter', 'dairy', 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=200', '100 g', 56),
  createProduct('d4', 'Greek Yogurt', 'dairy', 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=200', '400 g', 95),
  createProduct('d5', 'Cheese Slices', 'dairy', 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=200', '200 g', 150),
  createProduct('d6', 'Amul Ghee', 'dairy', 'https://images.unsplash.com/photo-1631331607912-c76d9a3db315?w=200', '500 ml', 350),
  
  // Grains & Pulses
  createProduct('g1', 'Basmati Rice', 'grains', 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=200', '1 kg', 180),
  createProduct('g2', 'Whole Wheat Atta', 'grains', 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=200', '5 kg', 250),
  createProduct('g3', 'Toor Dal', 'grains', 'https://images.unsplash.com/photo-1585996746257-dc58166c7e1b?w=200', '1 kg', 160),
  createProduct('g4', 'Chana Dal', 'grains', 'https://images.unsplash.com/photo-1613758235402-745466bb7efe?w=200', '1 kg', 120),
  createProduct('g5', 'Moong Dal', 'grains', 'https://images.unsplash.com/photo-1612257416648-ee7a6c533549?w=200', '1 kg', 140),
  createProduct('g6', 'Masoor Dal', 'grains', 'https://images.unsplash.com/photo-1596560548464-f010549b84d7?w=200', '1 kg', 110),
  
  // Snacks
  createProduct('s1', 'Lays Classic Chips', 'snacks', 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=200', '52 g', 20),
  createProduct('s2', 'Parle-G Biscuits', 'snacks', 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=200', '800 g', 80),
  createProduct('s3', 'Mixed Dry Fruits', 'snacks', 'https://images.unsplash.com/photo-1508061253366-f7da158b6d46?w=200', '500 g', 550),
  createProduct('s4', 'Maggi Noodles', 'snacks', 'https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?w=200', '4 pack', 56),
  
  // Beverages
  createProduct('b1', 'Tata Tea Gold', 'beverages', 'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=200', '500 g', 280),
  createProduct('b2', 'Nescafe Classic', 'beverages', 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=200', '100 g', 220),
  createProduct('b3', 'Real Fruit Juice', 'beverages', 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=200', '1 L', 99),
  createProduct('b4', 'Coca Cola', 'beverages', 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=200', '2 L', 95),
  
  // Essentials
  createProduct('e1', 'Saffola Gold Oil', 'essentials', 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=200', '1 L', 175),
  createProduct('e2', 'Tata Salt', 'essentials', 'https://images.unsplash.com/photo-1518110925495-5fe2fda0442c?w=200', '1 kg', 24),
  createProduct('e3', 'MDH Garam Masala', 'essentials', 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=200', '100 g', 85),
  createProduct('e4', 'Sugar', 'essentials', 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=200', '1 kg', 55),
  createProduct('e5', 'Turmeric Powder', 'essentials', 'https://images.unsplash.com/photo-1615485500704-8e990f9900f7?w=200', '200 g', 60),
  createProduct('e6', 'Red Chilli Powder', 'essentials', 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=200', '200 g', 70),
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

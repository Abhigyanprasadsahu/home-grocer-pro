import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface StorePrice {
  storeId: string;
  storeName: string;
  storeColor: string;
  storeLogo: string;
  price: number;
  originalPrice: number;
  discount: number;
  available: boolean;
  stockLevel: number;
  deliveryFee: number;
  minOrder: number;
  rating: number;
  lastUpdated: string;
}

export interface LiveProduct {
  id: string;
  name: string;
  category: string;
  unit: string;
  image: string;
  description: string | null;
  storePrices: StorePrice[];
  bestPrice: number | null;
  bestStore: string | null;
  bestStoreId: string | null;
  availableStores: number;
  totalStores: number;
  priceRange: {
    min: number;
    max: number;
  };
  lastUpdated: string;
}

export interface StoreSummary {
  id: string;
  name: string;
  logo: string;
  color: string;
  rating: number;
  deliveryFee: number;
  minOrder: number;
  availableProducts: number;
  totalProducts: number;
  avgDiscount: number;
  lastUpdated: string;
}

interface LivePricesResponse {
  products: LiveProduct[];
  stores: StoreSummary[];
  meta: {
    totalProducts: number;
    totalStores: number;
    lastUpdated: string;
  };
}

interface UseLivePricesOptions {
  category?: string;
  storeId?: string;
  productId?: string;
  autoRefresh?: boolean;
  refreshInterval?: number; // in seconds
}

export function useLivePrices(options: UseLivePricesOptions = {}) {
  const [products, setProducts] = useState<LiveProduct[]>([]);
  const [stores, setStores] = useState<StoreSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const { toast } = useToast();

  const {
    category,
    storeId,
    productId,
    autoRefresh = true,
    refreshInterval = 30 // refresh every 30 seconds by default
  } = options;

  const fetchPrices = useCallback(async () => {
    try {
      setError(null);
      
      const params = new URLSearchParams();
      if (category && category !== 'All') params.append('category', category);
      if (storeId) params.append('storeId', storeId);
      if (productId) params.append('productId', productId);

      const queryString = params.toString();
      const url = queryString ? `?${queryString}` : '';
      
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-live-prices${url}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch live prices');
      }

      const result: LivePricesResponse = await response.json();
      
      setProducts(result.products);
      setStores(result.stores);
      setLastUpdated(result.meta.lastUpdated);
      setIsLoading(false);

    } catch (err) {
      console.error('Error fetching live prices:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch prices');
      setIsLoading(false);
    }
  }, [category, storeId, productId]);

  // Initial fetch
  useEffect(() => {
    fetchPrices();
  }, [fetchPrices]);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchPrices();
    }, refreshInterval * 1000);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, fetchPrices]);

  const refresh = useCallback(() => {
    setIsLoading(true);
    fetchPrices();
    toast({
      title: "Prices Updated",
      description: "Live prices have been refreshed",
    });
  }, [fetchPrices, toast]);

  return {
    products,
    stores,
    isLoading,
    error,
    lastUpdated,
    refresh,
  };
}

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export interface WishlistItem {
  id: string;
  productId: string;
  targetPrice: number | null;
  priceWhenAdded: number;
  notifyOnDrop: boolean;
  createdAt: string;
}

export const useWishlist = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchWishlist = useCallback(async () => {
    if (!user) {
      setWishlistItems([]);
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('wishlist')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setWishlistItems(
        data.map((item) => ({
          id: item.id,
          productId: item.product_id,
          targetPrice: item.target_price,
          priceWhenAdded: item.price_when_added,
          notifyOnDrop: item.notify_on_drop ?? true,
          createdAt: item.created_at,
        }))
      );
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const addToWishlist = async (productId: string, currentPrice: number, targetPrice?: number) => {
    if (!user) {
      toast({
        title: 'Login Required',
        description: 'Please login to add items to your wishlist',
        variant: 'destructive',
      });
      return false;
    }

    try {
      const { error } = await supabase.from('wishlist').insert({
        user_id: user.id,
        product_id: productId,
        price_when_added: currentPrice,
        target_price: targetPrice || null,
        notify_on_drop: true,
      });

      if (error) {
        if (error.code === '23505') {
          toast({
            title: 'Already in Wishlist',
            description: 'This product is already in your wishlist',
          });
          return false;
        }
        throw error;
      }

      toast({
        title: 'Added to Wishlist ❤️',
        description: 'We\'ll notify you when the price drops!',
      });

      fetchWishlist();
      return true;
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      toast({
        title: 'Error',
        description: 'Failed to add to wishlist',
        variant: 'destructive',
      });
      return false;
    }
  };

  const removeFromWishlist = async (productId: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('wishlist')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', productId);

      if (error) throw error;

      toast({
        title: 'Removed from Wishlist',
        description: 'Product removed from your wishlist',
      });

      fetchWishlist();
      return true;
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      return false;
    }
  };

  const updateTargetPrice = async (productId: string, targetPrice: number) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('wishlist')
        .update({ target_price: targetPrice })
        .eq('user_id', user.id)
        .eq('product_id', productId);

      if (error) throw error;

      toast({
        title: 'Target Price Updated',
        description: `We'll notify you when the price drops to ₹${targetPrice}`,
      });

      fetchWishlist();
      return true;
    } catch (error) {
      console.error('Error updating target price:', error);
      return false;
    }
  };

  const isInWishlist = (productId: string) => {
    return wishlistItems.some((item) => item.productId === productId);
  };

  const getWishlistItem = (productId: string) => {
    return wishlistItems.find((item) => item.productId === productId);
  };

  return {
    wishlistItems,
    isLoading,
    addToWishlist,
    removeFromWishlist,
    updateTargetPrice,
    isInWishlist,
    getWishlistItem,
    refetch: fetchWishlist,
  };
};

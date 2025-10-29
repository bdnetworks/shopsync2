
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import type { Product } from '@/lib/types';
import { useToast } from "@/hooks/use-toast";

interface WishlistContextType {
  wishlistItems: string[]; // Store only product IDs
  toggleWishlist: (product: Product) => void;
  isWishlisted: (productId: string) => boolean;
  wishlistCount: number;
  getProductDetails: (ids: string[]) => Promise<Product[]>;
  removeFromWishlist: (productId: string) => void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider = ({ children }: { children: ReactNode }) => {
  const [wishlistItems, setWishlistItems] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    setIsLoading(true);
    const storedWishlist = localStorage.getItem('wishlistItems');
    if (storedWishlist) {
      try {
        setWishlistItems(JSON.parse(storedWishlist));
      } catch (error) {
        console.error("Failed to parse wishlist items from localStorage", error);
        setWishlistItems([]);
      }
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (!isLoading) {
        try {
            localStorage.setItem('wishlistItems', JSON.stringify(wishlistItems));
        } catch (error) {
            console.error("Failed to save wishlist items to localStorage", error);
        }
    }
  }, [wishlistItems, isLoading]);

  const isWishlisted = useCallback((productId: string) => {
    return wishlistItems.includes(productId);
  }, [wishlistItems]);

  const toggleWishlist = (product: Product) => {
    setWishlistItems(prevItems => {
      const isInWishlist = prevItems.includes(product.id);
      if (isInWishlist) {
        toast({
          title: "Removed from Wishlist",
          description: `${product.name} has been removed from your wishlist.`,
          variant: "destructive",
        });
        return prevItems.filter(id => id !== product.id);
      } else {
        toast({
          title: "Added to Wishlist",
          description: `${product.name} has been added to your wishlist.`,
        });
        return [...prevItems, product.id];
      }
    });
  };
  
  const removeFromWishlist = (productId: string) => {
    setWishlistItems(prevItems => prevItems.filter(id => id !== productId));
     toast({
        title: "Item removed",
        description: `The item has been removed from your wishlist.`,
        variant: "destructive"
      });
  }

  const getProductDetails = async (ids: string[]): Promise<Product[]> => {
    // This is a mock function. In a real app, you'd fetch this from an API.
    // For now, we'll dynamically import the products library.
    const { getProducts } = await import('@/lib/products');
    const allProducts = await getProducts();
    return allProducts.filter(p => ids.includes(p.id));
  }

  const value = {
    wishlistItems,
    toggleWishlist,
    isWishlisted,
    wishlistCount: wishlistItems.length,
    getProductDetails,
    removeFromWishlist,
  };

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};

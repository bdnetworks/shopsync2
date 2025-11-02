
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { CartItem, Product, ShippingOption } from '@/lib/types';
import { useToast } from "@/hooks/use-toast";
import { getSiteConfig, MergedSiteConfig } from '@/config/site';

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: Product, quantity?: number, selectedColor?: string, selectedSize?: string) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  subtotal: number;
  itemCount: number;
  shippingFee: number;
  total: number;
  isCartLoading: boolean;
  setShippingOption: (option: ShippingOption) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartLoading, setIsCartLoading] = useState(true);
  const [siteConfig, setSiteConfig] = useState<MergedSiteConfig | null>(null);
  const { toast } = useToast();
  const [shippingFee, setShippingFee] = useState(0);
  const [shippingOption, setShippingOption] = useState<ShippingOption>('insideDhaka');

  useEffect(() => {
    const fetchConfig = async () => {
        const config = await getSiteConfig();
        setSiteConfig(config);
        setShippingFee(config.checkout.shippingFee.insideDhaka);
    }
    fetchConfig();
    
    setIsCartLoading(true);
    const storedCart = localStorage.getItem('cartItems');
    if (storedCart) {
      try {
        setCartItems(JSON.parse(storedCart));
      } catch (error) {
        console.error("Failed to parse cart items from localStorage", error);
        setCartItems([]);
      }
    }
    setIsCartLoading(false);
  }, []);

  useEffect(() => {
    if (!isCartLoading) {
        try {
            localStorage.setItem('cartItems', JSON.stringify(cartItems));
        } catch (error) {
            console.error("Failed to save cart items to localStorage", error);
        }
    }
  }, [cartItems, isCartLoading]);

  const handleSetShippingOption = (option: ShippingOption) => {
    if (!siteConfig) return;
    setShippingOption(option);
    const newShippingFee = option === 'insideDhaka' 
      ? siteConfig.checkout.shippingFee.insideDhaka 
      : siteConfig.checkout.shippingFee.outsideDhaka;
    setShippingFee(newShippingFee);
  }

  const addToCart = (product: Product, quantity: number = 1, selectedColor?: string, selectedSize?: string) => {
    setCartItems(prevItems => {
      const cartItemId = `${product.id}${selectedColor ? `-${selectedColor}`:''}${selectedSize ? `-${selectedSize}`:''}`;
      
      const existingItem = prevItems.find(item => 
          item.id === product.id && 
          item.selectedColor === selectedColor && 
          item.selectedSize === selectedSize
      );

      if (existingItem) {
        return prevItems.map(item =>
          item.id === product.id && item.selectedColor === selectedColor && item.selectedSize === selectedSize 
          ? { ...item, quantity: item.quantity + quantity } 
          : item
        );
      }
      
      const newItem: CartItem = { 
          ...product, 
          quantity,
          selectedColor,
          selectedSize,
          id: cartItemId 
      };
      return [...prevItems, newItem];
    });
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart.`,
    });
  };

  const removeFromCart = (cartItemId: string) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== cartItemId));
    toast({
        title: "Item removed",
        description: `The item has been removed from your cart.`,
        variant: "destructive"
      });
  };

  const updateQuantity = (cartItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === cartItemId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const subtotal = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  const itemCount = cartItems.reduce((count, item) => count + item.quantity, 0);
  const total = subtotal + shippingFee;

  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    subtotal,
    itemCount,
    shippingFee,
    total,
isCartLoading: isCartLoading || !siteConfig,
    setShippingOption: handleSetShippingOption,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

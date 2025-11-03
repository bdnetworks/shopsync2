
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { CartItem, Product, ShippingOption, Offer } from '@/lib/types';
import { useToast } from "@/hooks/use-toast";
import { getSiteConfig, MergedSiteConfig } from '@/config/site';
import { getOffers } from '@/lib/products';

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
  discount: number;
  appliedCoupon: Offer | null;
  applyCoupon: (code: string) => Promise<void>;
  removeCoupon: () => void;
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
  const [appliedCoupon, setAppliedCoupon] = useState<Offer | null>(null);
  const [discount, setDiscount] = useState(0);

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
    const storedCoupon = localStorage.getItem('appliedCoupon');
    if (storedCoupon) {
      try {
        setAppliedCoupon(JSON.parse(storedCoupon));
      } catch (e) {
        setAppliedCoupon(null);
      }
    }
    setIsCartLoading(false);
  }, []);

  useEffect(() => {
    if (!isCartLoading) {
        try {
            localStorage.setItem('cartItems', JSON.stringify(cartItems));
            if (appliedCoupon) {
              localStorage.setItem('appliedCoupon', JSON.stringify(appliedCoupon));
            } else {
              localStorage.removeItem('appliedCoupon');
            }
        } catch (error) {
            console.error("Failed to save cart items to localStorage", error);
        }
    }
  }, [cartItems, appliedCoupon, isCartLoading]);

  const subtotal = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);

  useEffect(() => {
    if (appliedCoupon) {
      const newDiscount = (subtotal * appliedCoupon.discountPercentage) / 100;
      setDiscount(newDiscount);
    } else {
      setDiscount(0);
    }
  }, [subtotal, appliedCoupon]);

  const handleSetShippingOption = (option: ShippingOption) => {
    if (!siteConfig) return;
    setShippingOption(option);
    const newShippingFee = option === 'insideDhaka' 
      ? siteConfig.checkout.shippingFee.insideDhaka 
      : siteConfig.checkout.shippingFee.outsideDhaka;
    setShippingFee(newShippingFee);
  }

  const applyCoupon = async (code: string) => {
    if (!code) {
      toast({ title: "Please enter a coupon code.", variant: "destructive" });
      return;
    }

    const allOffers = await getOffers();
    const matchingOffer = allOffers.find(offer => offer.couponCode.toLowerCase() === code.toLowerCase());

    if (matchingOffer) {
      setAppliedCoupon(matchingOffer);
      toast({
        title: "Coupon Applied!",
        description: `You've received a ${matchingOffer.discountPercentage}% discount.`,
      });
    } else {
      setAppliedCoupon(null);
      toast({
        title: "Invalid Coupon",
        description: "The coupon code you entered is not valid.",
        variant: "destructive",
      });
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setDiscount(0);
    toast({
      title: "Coupon Removed",
      description: "The discount has been removed from your order.",
    });
  };

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
    removeCoupon();
    localStorage.removeItem('appliedCoupon');
  };

  const itemCount = cartItems.reduce((count, item) => count + item.quantity, 0);
  const total = subtotal - discount + shippingFee;

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
    discount,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
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

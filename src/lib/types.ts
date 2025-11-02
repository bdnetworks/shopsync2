
import { z } from 'zod';

export type ProductCategory = 'Apparel' | 'Bags' | 'Footwear' | 'Accessories' | 'Products' | 'Laptop' | 'Gaming';

export type ShippingOption = 'insideDhaka' | 'outsideDhaka';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: ProductCategory;
  image: {
    id: string;
    src: string;
    alt: string;
    hint: string;
  };
  gallery?: string[];
  colors?: string[];
  sizes?: string[];
  brand?: string;
  tags?: string[];
  stock?: number;
  availability?: string;
  unit?: string; // Kept for compatibility if needed
}

export interface CartItem extends Product {
  quantity: number;
  selectedColor?: string;
  selectedSize?: string;
}

export interface FeaturedSection {
    title: string;
    categories: ProductCategory[];
    productCount: number;
}

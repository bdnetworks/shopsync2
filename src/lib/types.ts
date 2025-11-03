
import { z } from 'zod';

export type ProductCategory = 'Apparel' | 'Bags' | 'Footwear' | 'Accessories' | 'Products' | 'Laptop' | 'Gaming' | 'Products1' | 'Products2' | 'Products3';

export type ShippingOption = 'insideDhaka' | 'outsideDhaka';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: ProductCategory;
  image: {
    id:string;
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

export interface TopCategory {
    name: string;
    imageUrl: string;
    imageHint: string;
}

export interface FooterLink {
    name: string;
    href: string;
}

export interface FooterLinkSection {
    title: string;
    links: FooterLink[];
}

export interface Offer {
    id: string;
    title: string;
    description: string;
    couponCode: string;
    imageUrl: string;
    imageHint: string;
    discountPercentage: number;
}

export interface PaymentMethod {
    name: string;
    details: string;
}


export type SiteSettings = {
    [key: string]: string | number | undefined;
    name?: string;
    description?: string;
    logo?: string;
    banner?: string;
    phone?: string;
    email?: string;
    address?: string;
    socialMedia?: string;
    currency?: string;
    currencysymbol?: string;
    shippingInsideCity?: number;
    shippingOutsideCity?: number;
    topmenu?: string;
    headermenu?: string;
    Slider?: string;
    productCategories?: string;
};

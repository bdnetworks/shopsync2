
import { z } from 'zod';

export type ProductCategory = 'Apparel' | 'Bags' | 'Footwear' | 'Accessories';

export type ShippingOption = 'insideDhaka' | 'outsideDhaka';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: ProductCategory;
  unit?: string;
  image: {
    id: string;
    src: string;
    alt: string;
    hint: string;
  };
}

export interface CartItem extends Product {
  quantity: number;
}

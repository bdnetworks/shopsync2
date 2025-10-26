import { z } from 'zod';

export type ProductCategory = 'Apparel' | 'Bags' | 'Footwear' | 'Accessories';

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

export const SendOrderInputSchema = z.object({
  customerName: z.string().describe("Customer's full name"),
  customerEmail: z.string().describe("Customer's email address"),
  customerAddress: z.string().describe("Customer's full shipping address"),
  orderItems: z.string().describe("A comma-separated string of items in the order"),
  orderTotal: z.string().describe("The total cost of the order"),
});

export type SendOrderInput = z.infer<typeof SendOrderInputSchema>;

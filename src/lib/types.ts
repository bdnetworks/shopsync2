export type ProductCategory = 'Apparel' | 'Bags' | 'Footwear' | 'Accessories';

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
}

export interface CartItem extends Product {
  quantity: number;
}

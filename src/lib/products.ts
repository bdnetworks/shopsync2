import { PlaceHolderImages } from './placeholder-images';
import type { Product } from './types';

const products: Product[] = [
  {
    id: 'prod_001',
    name: 'Classic Cotton Tee',
    description: 'A timeless crewneck t-shirt made from 100% premium cotton. Perfect for everyday wear.',
    price: 29.99,
    category: 'Apparel',
    image: {
      id: 'product-1',
      src: PlaceHolderImages.find(p => p.id === 'product-1')?.imageUrl || '',
      alt: PlaceHolderImages.find(p => p.id === 'product-1')?.description || '',
      hint: PlaceHolderImages.find(p => p.id === 'product-1')?.imageHint || '',
    }
  },
  {
    id: 'prod_002',
    name: 'Urban Explorer Backpack',
    description: 'A durable and stylish backpack crafted from genuine leather, with multiple compartments for all your gear.',
    price: 149.99,
    category: 'Bags',
    image: {
      id: 'product-2',
      src: PlaceHolderImages.find(p => p.id === 'product-2')?.imageUrl || '',
      alt: PlaceHolderImages.find(p => p.id === 'product-2')?.description || '',
      hint: PlaceHolderImages.find(p => p.id === 'product-2')?.imageHint || '',
    }
  },
  {
    id: 'prod_003',
    name: 'Retro Canvas High-Tops',
    description: 'Iconic high-top sneakers with a durable canvas upper and a comfortable cushioned sole.',
    price: 79.99,
    category: 'Footwear',
    image: {
      id: 'product-3',
      src: PlaceHolderImages.find(p => p.id === 'product-3')?.imageUrl || '',
      alt: PlaceHolderImages.find(p => p.id === 'product-3')?.description || '',
      hint: PlaceHolderImages.find(p => p.id === 'product-3')?.imageHint || '',
    }
  },
  {
    id: 'prod_004',
    name: 'Chronograph Steel Watch',
    description: 'A sophisticated timepiece with a stainless steel band and a multi-function chronograph dial.',
    price: 299.99,
    category: 'Accessories',
    image: {
      id: 'product-4',
      src: PlaceHolderImages.find(p => p.id === 'product-4')?.imageUrl || '',
      alt: PlaceHolderImages.find(p => p.id === 'product-4')?.description || '',
      hint: PlaceHolderImages.find(p => p.id === 'product-4')?.imageHint || '',
    }
  },
  {
    id: 'prod_005',
    name: 'Cozy Knit Scarf',
    description: 'Stay warm with this soft, oversized wool-blend scarf. A perfect accessory for chilly days.',
    price: 49.99,
    category: 'Accessories',
    image: {
      id: 'product-5',
      src: PlaceHolderImages.find(p => p.id === 'product-5')?.imageUrl || '',
      alt: PlaceHolderImages.find(p => p.id === 'product-5')?.description || '',
      hint: PlaceHolderImages.find(p => p.id === 'product-5')?.imageHint || '',
    }
  },
  {
    id: 'prod_006',
    name: 'Minimalist Leather Wallet',
    description: 'A sleek and slim bifold wallet made from full-grain leather, designed to hold your essentials.',
    price: 69.99,
    category: 'Accessories',
    image: {
      id: 'product-6',
      src: PlaceHolderImages.find(p => p.id === 'product-6')?.imageUrl || '',
      alt: PlaceHolderImages.find(p => p.id === 'product-6')?.description || '',
      hint: PlaceHolderImages.find(p => p.id === 'product-6')?.imageHint || '',
    }
  },
  {
    id: 'prod_007',
    name: 'Aviator Sunglasses',
    description: 'Classic aviator frames with polarized lenses for maximum UV protection and style.',
    price: 129.99,
    category: 'Accessories',
    image: {
      id: 'product-7',
      src: PlaceHolderImages.find(p => p.id === 'product-7')?.imageUrl || '',
      alt: PlaceHolderImages.find(p => p.id === 'product-7')?.description || '',
      hint: PlaceHolderImages.find(p => p.id === 'product-7')?.imageHint || '',
    }
  },
  {
    id: 'prod_008',
    name: 'Performance Running Shoes',
    description: 'Lightweight and responsive running shoes designed for speed and comfort over any distance.',
    price: 159.99,
    category: 'Footwear',
    image: {
      id: 'product-8',
      src: PlaceHolderImages.find(p => p.id === 'product-8')?.imageUrl || '',
      alt: PlaceHolderImages.find(p => p.id === 'product-8')?.description || '',
      hint: PlaceHolderImages.find(p => p.id === 'product-8')?.imageHint || '',
    }
  },
  {
    id: 'prod_009',
    name: 'Vintage Denim Jacket',
    description: 'A classic trucker jacket in a vintage wash, made from rugged, non-stretch denim.',
    price: 119.99,
    category: 'Apparel',
    image: {
      id: 'product-9',
      src: PlaceHolderImages.find(p => p.id === 'product-9')?.imageUrl || '',
      alt: PlaceHolderImages.find(p => p.id === 'product-9')?.description || '',
      hint: PlaceHolderImages.find(p => p.id === 'product-9')?.imageHint || '',
    }
  },
  {
    id: 'prod_010',
    name: 'Canvas Weekender Duffle',
    description: 'The perfect travel companion for short trips, made from heavy-duty canvas with leather accents.',
    price: 99.99,
    category: 'Bags',
    image: {
      id: 'product-10',
      src: PlaceHolderImages.find(p => p.id === 'product-10')?.imageUrl || '',
      alt: PlaceHolderImages.find(p => p.id === 'product-10')?.description || '',
      hint: PlaceHolderImages.find(p => p.id === 'product-10')?.imageHint || '',
    }
  },
  {
    id: 'prod_011',
    name: 'Oxford Leather Shoes',
    description: 'Elegant dress shoes handcrafted from polished calfskin leather, perfect for formal occasions.',
    price: 249.99,
    category: 'Footwear',
    image: {
      id: 'product-11',
      src: PlaceHolderImages.find(p => p.id === 'product-11')?.imageUrl || '',
      alt: PlaceHolderImages.find(p => p.id === 'product-11')?.description || '',
      hint: PlaceHolderImages.find(p => p.id === 'product-11')?.imageHint || '',
    }
  },
  {
    id: 'prod_012',
    name: 'Classic Leather Belt',
    description: 'A versatile and durable belt made from 100% genuine leather with a solid brass buckle.',
    price: 59.99,
    category: 'Accessories',
    image: {
      id: 'product-12',
      src: PlaceHolderImages.find(p => p.id === 'product-12')?.imageUrl || '',
      alt: PlaceHolderImages.find(p => p.id === 'product-12')?.description || '',
      hint: PlaceHolderImages.find(p => p.id === 'product-12')?.imageHint || '',
    }
  },
];

export const getProducts = () => {
  return products;
}

export const getProductById = (id: string) => {
  return products.find(p => p.id === id);
}

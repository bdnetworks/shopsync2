
'use client';

import Image from 'next/image';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { useCart } from '@/context/cart-context';
import type { Product } from '@/lib/types';
import { ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import { siteConfig } from '@/config/site';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();

  const handleAddToCart = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    addToCart(product);
  };

  return (
    <Link href={`/products/${product.id}`} className="group flex flex-col">
      <Card className="flex flex-col overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 w-full h-full">
        <div className="aspect-square relative w-full border-b">
          <Image
            src={product.image.src}
            alt={product.image.alt}
            data-ai-hint={product.image.hint}
            fill
            className="object-cover"
          />
        </div>
        <CardContent className="flex flex-1 flex-col justify-between p-4 space-y-2">
           <div>
            <p className="text-sm text-muted-foreground">{product.category}</p>
            <h3 className="font-semibold text-base leading-tight group-hover:text-primary transition-colors h-10 overflow-hidden">
              {product.name}
            </h3>
          </div>
          <div className="flex justify-between items-center">
            <p className="text-lg font-bold text-primary">
              {siteConfig.currency}{product.price.toFixed(2)}
            </p>
            <Button onClick={handleAddToCart} size="icon" className="h-9 w-9">
              <ShoppingCart className="h-4 w-4" />
              <span className="sr-only">Add to Cart</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

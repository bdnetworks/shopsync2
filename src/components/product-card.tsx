'use client';

import Image from 'next/image';
import { Button } from './ui/button';
import { Card, CardContent, CardFooter, CardHeader } from './ui/card';
import { useCart } from '@/context/cart-context';
import type { Product } from '@/lib/types';
import { ShoppingCart } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();

  const handleAddToCart = () => {
    addToCart(product);
  };

  return (
    <Card className="flex h-full flex-col overflow-hidden transition-shadow duration-300 hover:shadow-lg">
      <CardHeader className="p-0">
        <div className="aspect-[4/3] relative w-full p-4">
            <Image
              src={product.image.src}
              alt={product.image.alt}
              data-ai-hint={product.image.hint}
              fill
              className="object-contain"
            />
        </div>
      </CardHeader>
      <CardContent className="flex-1 p-3 space-y-1">
        <h3 className="font-semibold text-sm h-10 overflow-hidden">{product.name}</h3>
        {product.unit && <p className="text-xs text-muted-foreground">{product.unit}</p>}
        <p className="text-base font-bold">
          ${product.price.toFixed(2)}
        </p>
      </CardContent>
      <CardFooter className="p-3 pt-0">
        <Button onClick={handleAddToCart} className="w-full bg-accent text-accent-foreground hover:bg-accent/90 h-9 text-sm">
          <ShoppingCart className="mr-2 h-4 w-4" /> Add to Cart
        </Button>
      </CardFooter>
    </Card>
  );
}

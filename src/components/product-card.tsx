'use client';

import Image from 'next/image';
import { Button } from './ui/button';
import { Card, CardContent, CardFooter, CardHeader } from './ui/card';
import { useCart } from '@/context/cart-context';
import type { Product } from '@/lib/types';
import { Badge } from './ui/badge';
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
        <div className="aspect-square relative w-full">
            <Image
              src={product.image.src}
              alt={product.image.alt}
              data-ai-hint={product.image.hint}
              fill
              className="object-cover"
            />
        </div>
      </CardHeader>
      <CardContent className="flex-1 p-4">
        <Badge variant="outline" className="mb-2">{product.category}</Badge>
        <h3 className="font-headline text-lg font-semibold">{product.name}</h3>
        <p className="mt-2 text-2xl font-bold">
          ${product.price.toFixed(2)}
        </p>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button onClick={handleAddToCart} className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
          <ShoppingCart className="mr-2 h-4 w-4" /> Add to Cart
        </Button>
      </CardFooter>
    </Card>
  );
}

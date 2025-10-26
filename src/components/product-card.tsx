'use client';

import Image from 'next/image';
import { Button } from './ui/button';
import { Card, CardContent, CardFooter, CardHeader } from './ui/card';
import { useCart } from '@/context/cart-context';
import type { Product } from '@/lib/types';
import { ShoppingCart } from 'lucide-react';
import Link from 'next/link';

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
    <Link href={`/products/${product.id}`} className="flex">
        <Card className="flex flex-col overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 w-full">
        <CardHeader className="p-0 border-b">
            <div className="aspect-square relative w-full p-4">
                <Image
                src={product.image.src}
                alt={product.image.alt}
                data-ai-hint={product.image.hint}
                fill
                className="object-contain"
                />
            </div>
        </CardHeader>
        <CardContent className="flex-1 p-3 text-center flex flex-col justify-between">
            <h3 className="font-semibold text-sm h-10 overflow-hidden hover:text-primary transition-colors">
                {product.name}
            </h3>
            <p className="text-base font-bold text-primary mt-1">
              ${product.price.toFixed(2)}
            </p>
        </CardContent>
        <CardFooter className="p-3 pt-0">
            <Button onClick={handleAddToCart} className="w-full h-9 text-sm">
            <ShoppingCart className="mr-2 h-4 w-4" /> Add to Cart
            </Button>
        </CardFooter>
        </Card>
    </Link>
  );
}

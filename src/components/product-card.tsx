
'use client';

import Image from 'next/image';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { useCart } from '@/context/cart-context';
import type { Product } from '@/lib/types';
import { ShoppingCart, Heart } from 'lucide-react';
import Link from 'next/link';
import { siteConfig } from '@/config/site';
import { useWishlist } from '@/context/wishlist-context';
import { cn } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const isInWishlist = isWishlisted(product.id);

  const handleAddToCart = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
  };
  
  const handleToggleWishlist = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  return (
    <Link href={`/products/${product.id}`} className="group flex flex-col h-full">
      <Card className="flex flex-col overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 w-full flex-1">
        <div className="aspect-square relative w-full border-b">
          <Image
            src={product.image.src}
            alt={product.image.alt}
            data-ai-hint={product.image.hint}
            fill
            className="object-cover"
          />
          <Button 
            size="icon" 
            className={cn(
              "absolute top-2 right-2 h-8 w-8 rounded-full bg-background/80 hover:bg-background text-foreground",
               isInWishlist && "text-red-500"
            )}
            onClick={handleToggleWishlist}
          >
            <Heart className={cn("h-4 w-4", isInWishlist && "fill-current")} />
            <span className="sr-only">Add to Wishlist</span>
          </Button>
        </div>
        <CardContent className="p-4 flex flex-col flex-1">
          <p className="text-sm text-muted-foreground">{product.category}</p>
          <h3 className="font-semibold text-base leading-tight group-hover:text-primary transition-colors h-10 overflow-hidden">
            {product.name}
          </h3>
          <div className="mt-2 flex justify-between items-center">
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

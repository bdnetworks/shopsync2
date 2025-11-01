
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
import { useQuickView } from '@/context/quick-view-context';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const { openQuickView } = useQuickView();
  const isInWishlist = isWishlisted(product.id);

  const hasOptions = (product.colors && product.colors.length > 0) || (product.sizes && product.sizes.length > 0);

  const handleCartClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    e.stopPropagation();
    if (hasOptions) {
      openQuickView(product);
    } else {
      addToCart(product);
    }
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
          <div className="absolute top-2 right-2">
            <Button 
              size="icon" 
              className={cn(
                "h-8 w-8 rounded-full bg-background/80 hover:bg-background text-foreground",
                 isInWishlist && "text-red-500"
              )}
              onClick={handleToggleWishlist}
            >
              <Heart className={cn("h-4 w-4", isInWishlist && "fill-current")} />
              <span className="sr-only">Add to Wishlist</span>
            </Button>
          </div>
        </div>
        <CardContent className="p-4 flex flex-col flex-1">
          <p className="text-sm text-muted-foreground">{product.category}</p>
          <h3 className="font-semibold text-base leading-tight group-hover:text-primary transition-colors h-10 overflow-hidden">
            {product.name}
          </h3>
          <div className="mt-auto pt-2 flex justify-between items-center">
            <p className="text-lg font-bold text-primary">
              {siteConfig.currency}{product.price.toFixed(2)}
            </p>
            <Button onClick={handleCartClick} size="icon" className="h-9 w-9">
              <ShoppingCart className="h-4 w-4" />
              <span className="sr-only">Add to Cart</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

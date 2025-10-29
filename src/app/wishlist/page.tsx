
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useWishlist } from '@/context/wishlist-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Heart, ShoppingBag, ShoppingCart, Trash2 } from 'lucide-react';
import type { Product } from '@/lib/types';
import Image from 'next/image';
import { siteConfig } from '@/config/site';
import { Skeleton } from '@/components/ui/skeleton';
import { useCart } from '@/context/cart-context';

export default function WishlistPage() {
  const { wishlistItems, getProductDetails, wishlistCount, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (wishlistCount > 0) {
      setLoading(true);
      getProductDetails(wishlistItems)
        .then(setProducts)
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [wishlistItems, getProductDetails, wishlistCount]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-headline font-bold text-center mb-8">My Wishlist</h1>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-4">
            {[...Array(wishlistCount || 6)].map((_, i) => (
                <div key={i} className="flex flex-col space-y-3">
                    <Skeleton className="h-[225px] w-full rounded-xl" />
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                    </div>
                     <Skeleton className="h-10 w-full" />
                </div>
            ))}
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <Heart className="mx-auto h-24 w-24 text-muted-foreground" />
        <h1 className="mt-8 text-4xl font-headline font-bold">Your Wishlist is Empty</h1>
        <p className="mt-2 text-muted-foreground">Looks like you haven't added anything to your wishlist yet.</p>
        <Button asChild className="mt-6">
          <Link href="/products">Start Shopping</Link>
        </Button>
      </div>
    );
  }

  const handleAddToCart = (product: Product) => {
    addToCart(product);
    removeFromWishlist(product.id);
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-headline font-bold text-center mb-8">My Wishlist</h1>
       <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-4">
        {products.map(product => (
          <Card key={product.id} className="group flex flex-col overflow-hidden">
            <Link href={`/products/${product.id}`} className="flex flex-col h-full">
              <div className="aspect-square relative w-full border-b">
                <Image
                  src={product.image.src}
                  alt={product.image.alt}
                  data-ai-hint={product.image.hint}
                  fill
                  className="object-cover"
                />
              </div>
              <CardContent className="p-4 flex flex-col flex-1">
                <h3 className="font-semibold text-base leading-tight h-10 overflow-hidden">
                  {product.name}
                </h3>
                <p className="text-lg font-bold text-primary mt-1">
                  {siteConfig.currency}{product.price.toFixed(2)}
                </p>
                <div className="mt-auto pt-4 flex flex-col sm:flex-row gap-2">
                    <Button onClick={(e) => {e.preventDefault(); handleAddToCart(product)}} size="sm" className="w-full">
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Move to Cart
                    </Button>
                    <Button onClick={(e) => {e.preventDefault(); removeFromWishlist(product.id)}} size="sm" variant="outline" className="w-full">
                         <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
              </CardContent>
            </Link>
          </Card>
        ))}
      </div>
    </div>
  );
}


'use client';

import { Suspense, useEffect, useState } from 'react';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { getProductById } from '@/lib/products';
import { useCart } from '@/context/cart-context';
import { ShoppingCart, CheckCircle, Heart, Share2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Product } from '@/lib/types';
import { siteConfig } from '@/config/site';
import { useWishlist } from '@/context/wishlist-context';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DisqusComments from '@/components/disqus-comments';
import { useToast } from '@/hooks/use-toast';

function ProductDetail({ params }: { params: { id: string } }) {
    const { addToCart } = useCart();
    const { isWishlisted, toggleWishlist } = useWishlist();
    const [product, setProduct] = useState<Product | null | undefined>(null);
    const { toast } = useToast();

    useEffect(() => {
        const findProduct = async () => {
            const foundProduct = await getProductById(params.id);
            setProduct(foundProduct);
        }
        findProduct();
    }, [params.id]);
    
    const handleShare = async () => {
        if (navigator.share && product) {
            try {
                await navigator.share({
                    title: product.name,
                    text: `Check out this product: ${product.name}`,
                    url: window.location.href,
                });
            } catch (error) {
                toast({
                    title: 'Could not share',
                    description: 'There was an error trying to share this product.',
                    variant: 'destructive',
                });
            }
        } else {
            try {
                await navigator.clipboard.writeText(window.location.href);
                toast({
                    title: 'Link Copied!',
                    description: 'Product link copied to your clipboard.',
                });
            } catch (error) {
                toast({
                    title: 'Could not copy link',
                    description: 'There was an error trying to copy the product link.',
                    variant: 'destructive',
                });
            }
        }
    };


    if (product === undefined) {
        notFound();
    }
    
    if (product === null) {
        return <ProductDetailSkeleton />;
    }
    
    const isInWishlist = isWishlisted(product.id);

    return (
        <div className="container mx-auto px-4 py-12">
            <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
                <div>
                    <Card className="group">
                        <CardContent className="p-4">
                            <div className="aspect-square relative w-full rounded-lg overflow-hidden">
                                <Image
                                    src={product.image.src}
                                    alt={product.image.alt}
                                    data-ai-hint={product.image.hint}
                                    fill
                                    className="object-contain transition-transform duration-500 group-hover:scale-110"
                                    priority
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>
                <div className="flex flex-col justify-center">
                    <h1 className="text-3xl lg:text-4xl font-headline font-bold mb-4">{product.name}</h1>
                    
                    <div className="flex items-center justify-between mb-8 p-4 bg-muted/50 rounded-lg">
                        <span className="text-3xl font-bold text-primary">{siteConfig.currency}{product.price.toFixed(2)}</span>
                        <div className="flex items-center gap-2 text-sm font-medium text-green-600">
                            <CheckCircle className="h-5 w-5" />
                            <span>In Stock</span>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <Button size="lg" onClick={() => addToCart(product)}>
                            <ShoppingCart className="mr-2 h-5 w-5" />
                            Add to Cart
                        </Button>
                        <Button size="lg" variant="outline" onClick={() => toggleWishlist(product)}>
                            <Heart className={cn("mr-2 h-5 w-5", isInWishlist && "fill-current text-red-500")} />
                            {isInWishlist ? 'In Wishlist' : 'Add to Wishlist'}
                        </Button>
                         <Button size="lg" variant="outline" onClick={handleShare} className="col-span-2">
                            <Share2 className="mr-2 h-5 w-5" />
                            Share
                        </Button>
                    </div>

                    <div className="mt-8 space-y-2 text-sm text-muted-foreground">
                        <p><span className="font-semibold text-foreground">Category:</span> {product.category}</p>
                        <p><span className="font-semibold text-foreground">Unit:</span> {product.unit}</p>
                    </div>
                </div>
            </div>
            <div className="mt-12">
                <Tabs defaultValue="description" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="description">Description</TabsTrigger>
                        <TabsTrigger value="reviews">Reviews & Comments</TabsTrigger>
                    </TabsList>
                    <TabsContent value="description" className="mt-4 p-4 border rounded-md">
                         <p className="text-muted-foreground text-lg leading-relaxed">{product.description}</p>
                    </TabsContent>
                    <TabsContent value="reviews" className="mt-4 p-4 border rounded-md">
                        <DisqusComments 
                            shortname="bdthemex" 
                            identifier={product.id}
                            title={product.name}
                        />
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}


export default function ProductDetailPage({ params }: { params: { id: string } }) {
    return (
        <Suspense fallback={<ProductDetailSkeleton />}>
            <ProductDetail params={params} />
        </Suspense>
    )
}

function ProductDetailSkeleton() {
    return (
        <div className="container mx-auto px-4 py-12">
            <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
                <div>
                    <Card>
                        <CardContent className="p-4">
                            <Skeleton className="aspect-square w-full rounded-lg" />
                        </CardContent>
                    </Card>
                </div>
                <div className="flex flex-col justify-center space-y-6">
                    <Skeleton className="h-12 w-3/4" />
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-6 w-4/5" />
                    <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                        <Skeleton className="h-10 w-1/3" />
                        <Skeleton className="h-6 w-1/4" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <Skeleton className="h-12 w-full" />
                      <Skeleton className="h-12 w-full" />
                      <Skeleton className="h-12 w-full col-span-2" />
                    </div>
                </div>
            </div>
        </div>
    )
}

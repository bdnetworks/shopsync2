

import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { getProductById, getProducts } from '@/lib/products';
import { ShoppingCart, CheckCircle, Heart, Share2, Minus, Plus } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Product } from '@/lib/types';
import { getSiteConfig, MergedSiteConfig } from '@/config/site';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DisqusComments from '@/components/disqus-comments';
import ProductCard from '@/components/product-card';
import { ProductDetailClient } from './product-detail-client';
import type { Metadata, ResolvingMetadata } from 'next';

type ProductPageProps = {
  params: { id: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

async function ProductDataFetcher({ params }: { params: { id: string } }) {
    const product = await getProductById(params.id);
    
    if (!product) {
        notFound();
    }

    const allProducts = await getProducts();
    const relatedProducts = allProducts
        .filter(p => p.category === product.category && p.id !== product.id)
        .slice(0, 4);

    const siteConfig = await getSiteConfig();

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
            
            <ProductDetailClient product={product} siteConfig={siteConfig} />

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
        
        {relatedProducts.length > 0 && (
            <div className="mt-16">
                <h2 className="text-2xl font-bold text-center mb-8">Related Products</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {relatedProducts.map(relatedProduct => (
                        <ProductCard key={relatedProduct.id} product={relatedProduct} />
                    ))}
                </div>
            </div>
        )}
    </div>
    );
}


export default function ProductDetailPage({ params }: ProductPageProps) {
    return (
        <Suspense fallback={<ProductDetailSkeleton />}>
            <ProductDataFetcher params={params} />
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


'use client';

import { Suspense, useEffect, useState } from 'react';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { getProductById } from '@/lib/products';
import { useCart } from '@/context/cart-context';
import { ShoppingCart, CheckCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Product } from '@/lib/types';

function ProductDetail({ params }: { params: { id: string } }) {
    const { addToCart } = useCart();
    const [product, setProduct] = useState<Product | null | undefined>(null);

    useEffect(() => {
        const findProduct = async () => {
            const foundProduct = await getProductById(params.id);
            setProduct(foundProduct);
        }
        findProduct();
    }, [params.id]);


    if (product === undefined) {
        notFound();
    }
    
    if (product === null) {
        return <ProductDetailSkeleton />;
    }


    return (
        <div className="container mx-auto px-4 py-12">
            <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
                <div>
                    <Card>
                        <CardContent className="p-4">
                            <div className="aspect-square relative w-full rounded-lg overflow-hidden">
                                <Image
                                    src={product.image.src}
                                    alt={product.image.alt}
                                    data-ai-hint={product.image.hint}
                                    fill
                                    className="object-contain"
                                    priority
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>
                <div className="flex flex-col justify-center">
                    <h1 className="text-3xl lg:text-4xl font-headline font-bold mb-4">{product.name}</h1>
                    <p className="text-muted-foreground mb-6 text-lg">{product.description}</p>
                    
                    <div className="flex items-center justify-between mb-8 p-4 bg-muted/50 rounded-lg">
                        <span className="text-3xl font-bold text-primary">${product.price.toFixed(2)}</span>
                        <div className="flex items-center gap-2 text-sm font-medium text-green-600">
                            <CheckCircle className="h-5 w-5" />
                            <span>In Stock</span>
                        </div>
                    </div>

                    <Button size="lg" onClick={() => addToCart(product)}>
                        <ShoppingCart className="mr-2 h-5 w-5" />
                        Add to Cart
                    </Button>

                    <div className="mt-8 space-y-2 text-sm text-muted-foreground">
                        <p><span className="font-semibold text-foreground">Category:</span> {product.category}</p>
                        <p><span className="font-semibold text-foreground">Unit:</span> {product.unit}</p>
                    </div>
                </div>
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
                    <Skeleton className="h-12 w-1/2" />
                </div>
            </div>
        </div>
    )
}

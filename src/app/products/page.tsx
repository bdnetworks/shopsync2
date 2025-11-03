

import { Suspense } from 'react';
import { getProducts } from '@/lib/products';
import ProductCard from '@/components/product-card';
import { Product, ProductCategory } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { getSiteConfig, MergedSiteConfig } from '@/config/site';
import { ProductsClient } from './products-client';

function ProductPageSkeleton() {
    return (
        <div className="container mx-auto px-2 py-2">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">
                {[...Array(12)].map((_, i) => (
                    <div key={i} className="flex flex-col space-y-3">
                        <Skeleton className="h-[225px] w-full rounded-xl" />
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-3/4" />
                        </div>
                         <Skeleton className="h-10 w-1/2" />
                    </div>
                ))}
            </div>
        </div>
    )
}

async function ProductsDataFetcher() {
    const [siteConfig, allProducts] = await Promise.all([
        getSiteConfig(),
        getProducts(),
    ]);

    return <ProductsClient allProducts={allProducts} siteConfig={siteConfig} />;
}

export default function ProductsPage() {
    return (
        <Suspense fallback={<ProductPageSkeleton />}>
            <ProductsDataFetcher />
        </Suspense>
    )
}

'use client';

import { useState, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { getProducts } from '@/lib/products';
import ProductCard from '@/components/product-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProductCategory } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

const productCategories: ProductCategory[] = ['Apparel', 'Bags', 'Footwear', 'Accessories'];

function ProductsComponent() {
  const allProducts = getProducts();
  const searchParams = useSearchParams();
  const selectedCategory = searchParams.get('category') as ProductCategory | null;

  const [activeTab, setActiveTab] = useState<ProductCategory | 'All'>(selectedCategory || 'All');

  const filteredProducts = useMemo(() => {
    if (activeTab === 'All') {
      return allProducts;
    }
    return allProducts.filter(p => p.category === activeTab);
  }, [activeTab, allProducts]);

  if (allProducts.length === 0) {
      return (
        <div className="container mx-auto px-4 py-12">
             <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
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

  return (
    <div className="container mx-auto px-4 py-12">
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as ProductCategory | 'All')} className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-5">
          <TabsTrigger value="All">All</TabsTrigger>
          {productCategories.map(category => (
            <TabsTrigger key={category} value={category}>{category}</TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value={activeTab}>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 mt-6">
                {filteredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
                ))}
            </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}


export default function ProductsPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ProductsComponent />
        </Suspense>
    )
}

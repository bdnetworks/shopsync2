
'use client';

import { useState, useMemo, Suspense, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { getProducts } from '@/lib/products';
import ProductCard from '@/components/product-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Product, ProductCategory } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { siteConfig } from '@/config/site';

function ProductsComponent() {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const selectedCategory = searchParams.get('category') as ProductCategory | null;

  const [activeTab, setActiveTab] = useState<ProductCategory | 'All'>(selectedCategory || 'All');

  useEffect(() => {
    async function loadProducts() {
      setLoading(true);
      const products = await getProducts();
      setAllProducts(products);
      setLoading(false);
    }
    loadProducts();
  }, []);

  useEffect(() => {
    if(selectedCategory) {
        setActiveTab(selectedCategory);
    }
  }, [selectedCategory]);

  const filteredProducts = useMemo(() => {
    if (activeTab === 'All') {
      return allProducts;
    }
    return allProducts.filter(p => p.category === activeTab);
  }, [activeTab, allProducts]);

  if (loading || allProducts.length === 0) {
      return (
        <div className="container mx-auto px-4 py-12">
             <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-4">
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

  return (
    <div className="container mx-auto px-4 py-12">
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as ProductCategory | 'All')} className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-5">
          <TabsTrigger value="All">All</TabsTrigger>
          {
            /*
             * The product categories tabs are rendered from `siteConfig.productCategories`.
             * To edit the categories, please modify the `productCategories` array in `src/config/site.ts`.
             * You also need to make sure the category and its corresponding sheet URL are present in `src/config/categories.json`.
            */
            siteConfig.productCategories.map(category => (
              <TabsTrigger key={category} value={category}>{category}</TabsTrigger>
            ))
          }
        </TabsList>
        <TabsContent value={activeTab}>
            <div className="grid grid-cols-2 sm-grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-4 mt-6">
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
        <Suspense fallback={<ProductDetailSkeleton />}>
            <ProductsComponent />
        </Suspense>
    )
}

function ProductDetailSkeleton() {
    return (
        <div className="container mx-auto px-4 py-12">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-4">
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

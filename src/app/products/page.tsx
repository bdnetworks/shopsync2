'use client';

import { useState, useMemo, Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import ProductCard from '@/components/product-card';
import { getProducts } from '@/lib/products';
import { ProductCategory, Product } from '@/lib/types';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { LayoutGrid } from 'lucide-react';

const categories: ProductCategory[] = ['Apparel', 'Bags', 'Footwear', 'Accessories'];

function ProductGrid() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get('category') as ProductCategory | null;

  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'all'>(categoryParam || 'all');

  useEffect(() => {
    // getProducts might be async now or might need initialization
    const products = getProducts();
    setAllProducts(products);
    setLoading(false);
  }, []);

  const handleCategoryChange = (category: ProductCategory | 'all') => {
    setSelectedCategory(category);
    const params = new URLSearchParams(window.location.search);
    if (category === 'all') {
      params.delete('category');
    } else {
      params.set('category', category);
    }
    router.push(`${window.location.pathname}?${params.toString()}`);
  };
  
  const filteredProducts = useMemo(() => {
    if (selectedCategory === 'all') {
      return allProducts;
    }
    return allProducts.filter(p => p.category === selectedCategory);
  }, [selectedCategory, allProducts]);

  if (loading) {
    return <ProductsPageSkeleton />;
  }

  return (
    <div className="container mx-auto px-4 py-8 bg-[#F2F4F8]">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <aside className="w-full md:w-64 lg:w-72">
          <Card>
            <CardHeader className="p-4 bg-secondary">
                <h3 className="text-lg font-bold flex items-center gap-2">
                    <LayoutGrid className="h-5 w-5" />
                    Categories
                </h3>
            </CardHeader>
            <CardContent className="p-0">
                <nav className="flex flex-col">
                    <button
                        onClick={() => handleCategoryChange('all')}
                        className={cn(
                        "p-4 text-left font-medium border-l-4",
                        selectedCategory === 'all'
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-transparent hover:bg-accent/50'
                        )}
                    >
                        All Products
                    </button>
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => handleCategoryChange(cat)}
                            className={cn(
                            "p-4 text-left font-medium border-l-4",
                            selectedCategory === cat
                                ? 'border-primary bg-primary/10 text-primary'
                                : 'border-transparent hover:bg-accent/50'
                            )}
                        >
                            {cat}
                        </button>
                    ))}
                </nav>
            </CardContent>
          </Card>
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          <div className="mb-6 p-4 rounded-md bg-white">
            <h1 className="text-2xl font-bold">
              {selectedCategory === 'all' ? 'Popular Products' : selectedCategory}
            </h1>
          </div>
          
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <h2 className="text-2xl font-headline">No Products Found</h2>
              <p className="text-muted-foreground mt-2">Try a different category.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default function ProductsPage() {
    return (
        <Suspense fallback={<ProductsPageSkeleton />}>
            <ProductGrid />
        </Suspense>
    )
}

function ProductsPageSkeleton() {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
            <aside className="w-full md:w-64 lg:w-72">
                <Card>
                    <CardHeader className="p-4"><Skeleton className="h-6 w-3/4" /></CardHeader>
                    <CardContent className="p-0">
                        <div className="flex flex-col">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <div key={i} className="p-4"><Skeleton className="h-5 w-full" /></div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </aside>
            <main className="flex-1">
                <div className="mb-6"><Skeleton className="h-10 w-1/2" /></div>
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
                    {Array.from({ length: 10 }).map((_, i) => (
                        <Card key={i}>
                            <CardHeader><Skeleton className="aspect-square" /></CardHeader>
                            <CardContent className="space-y-2 p-3 text-center">
                                <Skeleton className="h-4 w-3/4 mx-auto" />
                            </CardContent>
                            <CardFooter className="p-3 flex-col gap-2">
                                <Skeleton className="h-6 w-1/2 mx-auto" />
                                <Skeleton className="h-10 w-full" />
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            </main>
        </div>
      </div>
    )
}

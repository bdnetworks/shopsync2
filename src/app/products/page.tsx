'use client';

import { useState, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import ProductCard from '@/components/product-card';
import { getProducts } from '@/lib/products';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ProductCategory, Product } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

const allProducts = getProducts();
const categories: ProductCategory[] = ['Apparel', 'Bags', 'Footwear', 'Accessories'];

function ProductGrid() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get('category') as ProductCategory | null;
  
  const [sortOption, setSortOption] = useState('featured');
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'all'>(categoryParam || 'all');

  const filteredAndSortedProducts = useMemo(() => {
    let products = [...allProducts];

    if (selectedCategory !== 'all') {
      products = products.filter(p => p.category === selectedCategory);
    }

    switch (sortOption) {
      case 'price-asc':
        products.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        products.sort((a, b) => b.price - a.price);
        break;
      case 'name-asc':
        products.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-desc':
        products.sort((a, b) => b.name.localeCompare(a.name));
        break;
      default: // featured
        break;
    }

    return products;
  }, [sortOption, selectedCategory]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-headline font-bold">
          {selectedCategory === 'all' ? 'All Products' : selectedCategory}
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Explore our curated collection of high-quality goods.
        </p>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8 p-4 bg-secondary rounded-lg">
        <div className="flex items-center gap-4">
          <label htmlFor="category" className="text-sm font-medium">Filter by Category:</label>
          <Select value={selectedCategory} onValueChange={(value) => setSelectedCategory(value as ProductCategory | 'all')}>
            <SelectTrigger id="category" className="w-[180px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-4">
          <label htmlFor="sort" className="text-sm font-medium">Sort by:</label>
          <Select value={sortOption} onValueChange={setSortOption}>
            <SelectTrigger id="sort" className="w-[180px]">
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="featured">Featured</SelectItem>
              <SelectItem value="price-asc">Price: Low to High</SelectItem>
              <SelectItem value="price-desc">Price: High to Low</SelectItem>
              <SelectItem value="name-asc">Name: A to Z</SelectItem>
              <SelectItem value="name-desc">Name: Z to A</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {filteredAndSortedProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {filteredAndSortedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
            <h2 className="text-2xl font-headline">No Products Found</h2>
            <p className="text-muted-foreground mt-2">Try adjusting your filters.</p>
        </div>
      )}
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
        <div className="text-center mb-12">
            <Skeleton className="h-12 w-1/2 mx-auto" />
            <Skeleton className="h-6 w-3/4 mx-auto mt-4" />
        </div>
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8 p-4 bg-secondary rounded-lg">
            <Skeleton className="h-10 w-[280px]" />
            <Skeleton className="h-10 w-[280px]" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {Array.from({ length: 8 }).map((_, i) => (
                <Card key={i}>
                    <CardHeader><Skeleton className="h-48" /></CardHeader>
                    <CardContent className="space-y-2">
                        <Skeleton className="h-4 w-1/3" />
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-8 w-1/2" />
                    </CardContent>
                    <CardFooter>
                        <Skeleton className="h-10 w-full" />
                    </CardFooter>
                </Card>
            ))}
        </div>
      </div>
    )
}

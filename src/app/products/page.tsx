
'use client';

import { useState, useMemo, Suspense, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { getProducts } from '@/lib/products';
import ProductCard from '@/components/product-card';
import { Product, ProductCategory } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { siteConfig } from '@/config/site';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Filter } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';


function ProductsComponent() {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const selectedCategoryParam = searchParams.get('category') as ProductCategory | null;

  const [activeTab, setActiveTab] = useState<ProductCategory | 'All'>(selectedCategoryParam || 'All');

  const [sortOption, setSortOption] = useState('default');
  const [priceRange, setPriceRange] = useState([0, 1000]);

  const maxPrice = useMemo(() => {
    if (allProducts.length === 0) return 1000;
    return Math.ceil(Math.max(...allProducts.map(p => p.price)));
  }, [allProducts]);
  
  useEffect(() => {
    async function loadProducts() {
      setLoading(true);
      const products = await getProducts();
      const maxProductPrice = Math.ceil(Math.max(...products.map(p => p.price))) || 1000;
      setAllProducts(products);
      setPriceRange([0, maxProductPrice]);
      setLoading(false);
    }
    loadProducts();
  }, []);

  useEffect(() => {
    if(selectedCategoryParam) {
        setActiveTab(selectedCategoryParam);
    }
  }, [selectedCategoryParam]);
  
  useEffect(() => {
     setPriceRange([0, maxPrice]);
  }, [maxPrice])

  const filteredAndSortedProducts = useMemo(() => {
    let products = activeTab === 'All'
      ? allProducts
      : allProducts.filter(p => p.category === activeTab);
      
    products = products.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);

    switch (sortOption) {
      case 'price-asc':
        products.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        products.sort((a, b) => b.price - a.price);
        break;
      default:
        // Default sort, can be by ID or name
        break;
    }

    return products;
  }, [activeTab, allProducts, sortOption, priceRange]);
  
  const ProductGridSkeleton = () => (
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
          {[...Array(10)].map((_, i) => (
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
  );

  return (
    <div className="container mx-auto px-2 py-2">
        <Card>
             <CardHeader className="p-2 flex flex-row items-center justify-between">
                 <div className="overflow-x-auto">
                    <div className="flex items-center space-x-2">
                         <Button variant={activeTab === 'All' ? 'default' : 'outline'} onClick={() => setActiveTab('All')}>All</Button>
                        {siteConfig.productCategories.map(category => (
                          <Button key={category} variant={activeTab === category ? 'default' : 'outline'} onClick={() => setActiveTab(category)}>
                              {category}
                          </Button>
                        ))}
                    </div>
                </div>
                 <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="outline"><Filter className="h-4 w-4 mr-2" /> Filters</Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80">
                        <div className="grid gap-4">
                            <div className="space-y-2">
                                <h4 className="font-medium leading-none">Filters</h4>
                                <p className="text-sm text-muted-foreground">
                                    Refine your product search.
                                </p>
                            </div>
                             <div className="space-y-2">
                                <Label>Sort by</Label>
                                <Select value={sortOption} onValueChange={setSortOption}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Default" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="default">Default</SelectItem>
                                        <SelectItem value="price-asc">Lowest Price</SelectItem>
                                        <SelectItem value="price-desc">Highest Price</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Price Range</Label>
                                <div className="flex justify-between text-sm text-muted-foreground">
                                    <span>{siteConfig.currency}{priceRange[0]}</span>
                                    <span>{siteConfig.currency}{priceRange[1]}</span>
                                </div>
                                <Slider
                                    min={0}
                                    max={maxPrice}
                                    step={10}
                                    value={priceRange}
                                    onValueChange={(value) => setPriceRange(value)}
                                />
                            </div>
                        </div>
                    </PopoverContent>
                </Popover>
            </CardHeader>
            <CardContent className="p-2">
                {loading ? (
                    <ProductGridSkeleton />
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
                        {filteredAndSortedProducts.map(product => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                )}
                {!loading && filteredAndSortedProducts.length === 0 && (
                    <div className="text-center py-16">
                        <p className="text-lg text-muted-foreground">No products found for your selection.</p>
                    </div>
                )}
            </CardContent>
        </Card>
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

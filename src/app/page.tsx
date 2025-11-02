
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRef } from 'react';
import Autoplay from "embla-carousel-autoplay";

import { Button } from '@/components/ui/button';
import { getProducts, getFeaturedSections } from '@/lib/products';
import ProductCard from '@/components/product-card';
import { siteConfig } from '@/config/site';
import { Card, CardContent } from '@/components/ui/card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { Product, FeaturedSection } from '@/lib/types';
import { useState, useEffect } from 'react';

export default function Home() {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [featuredSections, setFeaturedSections] = useState<FeaturedSection[]>([]);
  const plugin = useRef(
    Autoplay({ delay: 2000, stopOnInteraction: true })
  );

  useEffect(() => {
    async function loadData() {
        const products = await getProducts();
        setAllProducts(products);
        const sections = await getFeaturedSections();
        setFeaturedSections(sections);
    }
    loadData();
  }, []);

  const collectionsProducts = allProducts.slice(0, 12);

  return (
    <div className="flex flex-col bg-background">
      <section className="py-4 md:py-6">
        <div className="container mx-auto px-4">
            <Carousel
              plugins={[plugin.current]}
              className="w-full"
              onMouseEnter={plugin.current.stop}
              onMouseLeave={plugin.current.reset}
            >
              <CarouselContent>
                {siteConfig.heroBanners.map((banner, index) => (
                  <CarouselItem key={index}>
                    <div className="relative w-full h-[30vh] md:h-[40vh] rounded-lg overflow-hidden">
                        <Image
                            src={banner.imageUrl}
                            alt={banner.description}
                            data-ai-hint={banner.imageHint}
                            fill
                            className="object-cover"
                            priority={index === 0}
                        />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
        </div>
      </section>

      <section className="pt-6 pb-2.5">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-6">Top Categories</h2>
          <div className="grid grid-cols-5 md:grid-cols-10 gap-4">
            {siteConfig.topCategories.map((category) => (
                <Link href={`/products?category=${category.name}`} key={category.name} className="flex flex-col items-center gap-2 text-center group">
                  <Card className="flex items-center justify-center p-1 w-full aspect-square rounded-full overflow-hidden group-hover:shadow-lg transition-shadow">
                    <Image 
                      src={category.imageUrl} 
                      alt={category.name} 
                      data-ai-hint={category.imageHint}
                      width={60} 
                      height={60} 
                      className="object-cover"
                    />
                  </Card>
                  <p className="text-xs md:text-sm font-medium group-hover:text-primary transition-colors">{category.name}</p>
                </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="pt-2.5 pb-6 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Collections</h2>
            <Button asChild variant="outline">
              <Link href="/products">View All</Link>
            </Button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-4">
            {collectionsProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {featuredSections.map(section => {
        const sectionCategories = section.categories.map(c => c.trim());
        const categoryProducts = allProducts
            .filter(p => sectionCategories.includes(p.category))
            .slice(0, section.productCount);

        if (categoryProducts.length === 0) return null;
        
        // For the "View All" link, we'll just link to the first category in the list.
        // A more complex implementation could link to a search results page with all categories.
        const viewAllLink = `/products?category=${sectionCategories[0]}`;

        return (
            <section key={section.title} className="py-6 bg-background">
                <div className="container mx-auto px-4">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold">{section.title}</h2>
                        <Button asChild variant="outline">
                            <Link href={viewAllLink}>View All</Link>
                        </Button>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-4">
                        {categoryProducts.map((product) => (
                          <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                </div>
            </section>
        );
      })}


      <section className="py-8">
        <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold mb-8 text-center">Top Brands</h2>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4 md:gap-8 items-center justify-items-center">
                {siteConfig.topBrands.map(brand => (
                    <div key={brand.name} className="grayscale hover:grayscale-0 transition-all duration-300">
                        <Image
                            src={brand.imageUrl}
                            alt={`${brand.name} logo`}
                            data-ai-hint={brand.imageHint}
                            width={120}
                            height={60}
                            className="object-contain"
                        />
                    </div>
                ))}
            </div>
        </div>
      </section>
    </div>
  );
}

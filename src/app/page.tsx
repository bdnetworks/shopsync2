import Image from 'next/image';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { getProducts } from '@/lib/products';
import ProductCard from '@/components/product-card';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { ProductCategory } from '@/lib/types';
import { Laptop, Cpu, Monitor, Speaker, Component, Gamepad2, Printer, Camera } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

const categories: {name: ProductCategory | 'All', icon: React.ElementType}[] = [
    { name: 'All', icon: Laptop },
    { name: 'Apparel', icon: Cpu },
    { name: 'Bags', icon: Monitor },
    { name: 'Footwear', icon: Speaker },
    { name: 'Accessories', icon: Component },
];

export default function Home() {
  const featuredProducts = getProducts().slice(0, 8);
  const heroImage = PlaceHolderImages.find(p => p.id === 'hero-1');

  return (
    <div className="flex flex-col bg-[#F2F4F8]">
      <section className="relative w-full h-[40vh] md:h-[50vh] text-white">
        {heroImage && (
           <Image
            src={heroImage.imageUrl}
            alt={heroImage.description}
            data-ai-hint={heroImage.imageHint}
            fill
            className="object-cover"
            priority
          />
        )}
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative h-full flex flex-col items-center justify-center text-center p-4">
          <h1 className="text-4xl md:text-6xl font-headline font-bold !leading-tight tracking-tight text-white">
            Discover Your Next Favorite Thing
          </h1>
          <p className="mt-4 max-w-2xl text-lg md:text-xl text-white/80">
            We sync the best products from around the web, curated just for you.
          </p>
          <Button asChild size="lg" className="mt-8 bg-primary text-primary-foreground hover:bg-primary/90">
            <Link href="/products">Shop All Products</Link>
          </Button>
        </div>
      </section>

      <section className="py-8">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-6">Top Categories</h2>
          <div className="grid grid-cols-4 md:grid-cols-8 gap-4">
            {categories.map((category) => (
              <Link href={category.name === 'All' ? '/products' : `/products?category=${category.name}`} key={category.name}>
                <Card className="flex flex-col items-center justify-center p-4 hover:shadow-lg transition-shadow aspect-square">
                  <category.icon className="h-8 w-8 text-primary" />
                  <p className="mt-2 text-sm text-center font-medium">{category.name}</p>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-8 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-1">Collections</h2>
          <p className="text-center text-muted-foreground mb-6">Handpicked selections that we think you'll love.</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          <div className="text-center mt-12">
            <Button asChild variant="outline">
              <Link href="/products">View All</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4 text-center">
            <h2 className="text-2xl font-bold mb-4">Top Brands</h2>
            <div className="flex justify-center items-center gap-8 flex-wrap">
                {['Apple', 'Microsoft', 'Starlink', 'HP', 'Asus', 'Dell', 'Lenovo', 'Acer'].map(brand => (
                    <span key={brand} className="font-semibold text-muted-foreground text-lg">{brand}</span>
                ))}
            </div>
        </div>
      </section>
    </div>
  );
}

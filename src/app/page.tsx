import Image from 'next/image';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { getProducts } from '@/lib/products';
import ProductCard from '@/components/product-card';
import { siteConfig } from '@/config/site';
import { Card } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { getIcon } from '@/lib/icons';

export default function Home() {
  const allProducts = getProducts();
  const collectionsProducts = allProducts.slice(0, 12);

  return (
    <div className="flex flex-col bg-background">
      <section className="py-4 md:py-6">
        <div className="container mx-auto px-4">
          <Carousel
              opts={{
                  loop: true,
              }}
              className="w-full"
          >
              <CarouselContent>
                  {siteConfig.heroBanners.map(image => (
                      <CarouselItem key={image.id}>
                          <div className="relative w-full h-[30vh] md:h-[40vh] rounded-lg overflow-hidden">
                              <Image
                                  src={image.imageUrl}
                                  alt={image.description}
                                  data-ai-hint={image.imageHint}
                                  fill
                                  className="object-cover"
                                  priority
                              />
                          </div>
                      </CarouselItem>
                  ))}
              </CarouselContent>
              <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-foreground" />
              <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-foreground" />
          </Carousel>
        </div>
      </section>

      <section className="py-8">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-6">Top Categories</h2>
          <div className="grid grid-cols-5 md:grid-cols-10 gap-4">
            {siteConfig.topCategories.map((category) => {
              const Icon = getIcon(category.icon);
              return (
                <Link href={'/products'} key={category.name}>
                  <Card className="flex flex-col items-center justify-center p-2 md:p-4 hover:shadow-lg transition-shadow aspect-square">
                    {Icon && <Icon className="h-6 w-6 md:h-8 md:w-8 text-primary" />}
                    <p className="mt-2 text-xs md:text-sm text-center font-medium">{category.name}</p>
                  </Card>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      <section className="py-8 bg-muted/30">
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

      {siteConfig.productCategories.map(category => {
        const categoryProducts = allProducts.filter(p => p.category === category).slice(0, 6);
        if (categoryProducts.length === 0) return null;
        return (
            <section key={category} className="py-8 bg-background">
                <div className="container mx-auto px-4">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold">{`Featured ${category}`}</h2>
                        <Button asChild variant="outline">
                            <Link href={`/products?category=${category}`}>View All</Link>
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


      <section className="py-12">
        <div className="container mx-auto px-4 text-center">
            <h2 className="text-2xl font-bold mb-4">Top Brands</h2>
            <div className="flex justify-center items-center gap-8 flex-wrap">
                {siteConfig.topBrands.map(brand => (
                    <span key={brand} className="font-semibold text-muted-foreground text-lg">{brand}</span>
                ))}
            </div>
        </div>
      </section>
    </div>
  );
}

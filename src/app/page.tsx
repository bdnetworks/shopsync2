
import Image from 'next/image';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { getProducts } from '@/lib/products';
import ProductCard from '@/components/product-card';
import { siteConfig } from '@/config/site';
import { Card } from '@/components/ui/card';
import { getIcon } from '@/lib/icons';

export default async function Home() {
  const allProducts = await getProducts();
  const collectionsProducts = allProducts.slice(0, 12);
  const heroBanner = siteConfig.heroBanners[0];

  return (
    <div className="flex flex-col bg-background">
      <section className="py-4 md:py-6">
        <div className="container mx-auto px-4">
            {heroBanner && (
              <div className="relative w-full h-[30vh] md:h-[40vh] rounded-lg overflow-hidden">
                  <Image
                      src={heroBanner.imageUrl}
                      alt={heroBanner.description}
                      data-ai-hint={heroBanner.imageHint}
                      fill
                      className="object-cover"
                      priority
                  />
              </div>
            )}
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

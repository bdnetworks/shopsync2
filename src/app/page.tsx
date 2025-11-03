

import { getProducts, getFeaturedSections } from '@/lib/products';
import { getSiteConfig } from '@/config/site';
import { Product, FeaturedSection, MergedSiteConfig } from '@/lib/types';
import { HomePageClient } from './home-page-client';

async function getHomePageData() {
    const [siteConfig, allProducts, featuredSections] = await Promise.all([
        getSiteConfig(),
        getProducts(),
        getFeaturedSections()
    ]);
    return { siteConfig, allProducts, featuredSections };
}

export default async function Home() {
  const { siteConfig, allProducts, featuredSections } = await getHomePageData();

  // Get the last 6 products as "latest"
  const latestProducts = allProducts.slice(-6).reverse();

  return (
    <HomePageClient
        siteConfig={siteConfig}
        allProducts={allProducts}
        featuredSections={featuredSections}
        latestProducts={latestProducts}
    />
  );
}


import type { Product, ProductCategory, FeaturedSection, TopCategory, FooterLinkSection, Offer, PaymentMethod } from './types';
import productsData from '@/config/products.json';
import siteData from '@/config/site.json';

// All product data is now sourced from local JSON files for performance.

async function initializeProducts(): Promise<Product[]> {
    return productsData.products.map(p => ({
        ...p,
        category: p.category as ProductCategory,
        image: {
            id: `${p.id}-img`,
            src: p.image.src,
            alt: p.image.alt || p.name,
            hint: p.image.hint || p.category || 'product'
        }
    }));
}

export const getProducts = async (): Promise<Product[]> => {
    return initializeProducts();
}

export const getProductById = async (id: string): Promise<Product | undefined> => {
    const products = await getProducts();
    return products.find(p => p.id === id);
}

export const getFeaturedSections = async (): Promise<FeaturedSection[]> => {
    return siteData.featuredSections.map(section => ({
        ...section,
        categories: section.categories as ProductCategory[],
    }));
};

export const getTopCategories = async (): Promise<TopCategory[]> => {
    return siteData.topCategories;
};


export const getTopBrands = async (): Promise<{name: string; imageUrl: string; imageHint: string}[]> => {
    return siteData.topBrands;
}

export const getFooterLinks = async (): Promise<FooterLinkSection[]> => {
    return siteData.footerLinks;
};

export const getOffers = async (): Promise<Offer[]> => {
    return siteData.offers;
};


export const getPaymentMethods = async (): Promise<PaymentMethod[]> => {
    return siteData.paymentMethods;
};

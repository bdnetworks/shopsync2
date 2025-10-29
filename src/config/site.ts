
import nav from './nav.json';
import socials from './socials.json';
import footer from './footer.json';
import contact from './contact.json';
import banners from './banners.json';
import home from './home-page.json';
import product from './product-page.json';
import site from './site.json';
import checkout from './checkout.json';
import type { ProductCategory } from "@/lib/types";

// Type assertion for checkout config
interface PaymentMethod {
    name: string;
    details: string;
}

interface CheckoutConfig {
    shippingFee: {
        insideDhaka: number;
        outsideDhaka: number;
    };
    paymentMethods: PaymentMethod[];
    contact: {
        whatsappNumber: string;
        email: string;
    };
}

interface FeaturedSection {
    title: string;
    category: ProductCategory;
    productCount: number;
}

export const siteConfig = {
    ...site,
    navLinks: nav.navLinks,
    socialLinks: socials.socialLinks,
    footerLinks: footer.footerLinks,
    contactInfo: contact.contactInfo,
    heroBanners: banners.heroBanners,
    topCategories: home.topCategories,
    /*
     * The product categories tabs are rendered from `siteConfig.productCategories`.
     * To edit the categories, please modify the `productCategories` array in `src/config/product-page.json`.
     * You also need to make sure the category and its corresponding sheet URL are present in `src/config/categories.json`.
    */
    productCategories: product.productCategories as ProductCategory[],
    featuredSections: home.featuredSections as FeaturedSection[],
    topBrands: home.topBrands,
    checkout: checkout as CheckoutConfig
}

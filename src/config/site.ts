
import nav from './nav.json';
import socials from './socials.json';
import footer from './footer.json';
import contact from './contact.json';
import banners from './banners.json';
import home from './home-page.json';
import product from './product-page.json';
import site from './site.json';
import type { ProductCategory } from "@/lib/types";

export const siteConfig = {
    ...site,
    navLinks: nav.navLinks,
    socialLinks: socials.socialLinks,
    footerLinks: footer.footerLinks,
    contactInfo: contact.contactInfo,
    heroBanners: banners.heroBanners,
    topCategories: home.topCategories,
    productCategories: product.productCategories as ProductCategory[],
    topBrands: home.topBrands,
    checkout: {
        // Add checkout page specific configurations here
    }
}


import { getSiteSettings } from '@/lib/settings';
import type { SiteSettings, ProductCategory } from "@/lib/types";

// Import static JSON files
import socials from './socials.json';
import footer from './footer.json';
import home from './home-page.json';
import product from './product-page.json';
import offers from './offers.json';
import contact from './contact.json';
import checkout from './checkout.json';

// Define a type for the final configuration object
export type MergedSiteConfig = {
    name: string;
    description: string;
    currency: string;
    logoImageUrl?: string;
    logoType: 'text' | 'image';
    navLinks: { href: string; label: string; }[];
    topBarLinks: { href: string; label: string; icon: string; }[];
    socialLinks: typeof socials.socialLinks;
    footerLinks: typeof footer.footerLinks;
    contactInfo: { title: string; value: string; icon: string; }[];
    heroBanners: { id: string; imageUrl: string; description: string; imageHint: string; }[];
    topCategories: typeof home.topCategories;
    productCategories: ProductCategory[];
    topBrands: typeof home.topBrands;
    offers: typeof offers.offers;
    checkout: {
      shippingFee: { insideDhaka: number; outsideDhaka: number; };
      paymentMethods: typeof checkout.paymentMethods;
      contact: typeof checkout.contact;
    };
    [key: string]: any; // Allow other properties from dynamic settings
}

let siteConfigCache: MergedSiteConfig | null = null;

export const getSiteConfig = async (): Promise<MergedSiteConfig> => {
    // If we have a cached version, return it
    if (siteConfigCache) {
        return siteConfigCache;
    }

    // Fetch dynamic settings from Google Sheet
    const dynamicSettings = await getSiteSettings();

    // Helper to parse menu strings (e.g., "Home:/,About:/about")
    const parseMenu = (menuString: string | undefined) => {
        if (!menuString) return [];
        return menuString.split(',').map(item => {
            const [label, href] = item.split(':');
            return { label: label.trim(), href: href ? href.trim() : '#' };
        });
    };
    
    // Helper to parse slider strings
    const parseSlider = (sliderString: string | undefined) => {
        if (!sliderString) return [];
        return sliderString.split(',').map((url, index) => ({
            id: `slider-${index + 1}`,
            imageUrl: url.trim(),
            description: `Slider image ${index + 1}`,
            imageHint: 'banner image'
        }));
    };

    // Start with default values from JSON files
    const config: MergedSiteConfig = {
        // Defaults from static files or hardcoded
        name: dynamicSettings.name || 'ShopSync',
        description: dynamicSettings.description || 'Syncing you with the best products from across the web.',
        currency: dynamicSettings.currencysymbol || '$',
        logoType: dynamicSettings.logo ? 'image' : 'text',
        logoImageUrl: dynamicSettings.logo || undefined,
        navLinks: parseMenu(dynamicSettings.headermenu),
        topBarLinks: parseMenu(dynamicSettings.topmenu).map(item => ({...item, icon: 'Tag'})),
        socialLinks: socials.socialLinks.map(link => {
            const socialKey = link.name.toLowerCase();
            if (dynamicSettings[socialKey]) {
                const url = socialKey === 'whatsapp' 
                    ? `https://wa.me/${(dynamicSettings[socialKey] as string).replace(/\D/g, '')}`
                    : `https://${socialKey}.com/${dynamicSettings[socialKey]}`;
                return { ...link, href: url };
            }
            return link;
        }),
        footerLinks: footer.footerLinks,
        contactInfo: [
            { title: "Email", value: dynamicSettings.email || contact.contactInfo.find(c => c.title === 'Email')?.value || '', icon: "Mail" },
            { title: "Phone", value: dynamicSettings.phone || contact.contactInfo.find(c => c.title === 'Phone')?.value || '', icon: "Phone" },
            { title: "Office", value: dynamicSettings.address || contact.contactInfo.find(c => c.title === 'Office')?.value || '', icon: "MapPin" }
        ],
        heroBanners: parseSlider(dynamicSettings.Slider),
        topCategories: home.topCategories,
        productCategories: product.productCategories as ProductCategory[],
        topBrands: home.topBrands,
        offers: offers.offers,
        checkout: {
            shippingFee: {
                insideDhaka: typeof dynamicSettings.shippingInsideCity === 'number' ? dynamicSettings.shippingInsideCity : checkout.shippingFee.insideDhaka,
                outsideDhaka: typeof dynamicSettings.shippingOutsideCity === 'number' ? dynamicSettings.shippingOutsideCity : checkout.shippingFee.outsideDhaka,
            },
            paymentMethods: checkout.paymentMethods,
            contact: {
                ...checkout.contact,
                whatsappNumber: dynamicSettings.phone || checkout.contact.whatsappNumber,
                email: dynamicSettings.email || checkout.contact.email,
            }
        },
        ...dynamicSettings // Spread the rest of the dynamic settings
    };

    // Cache the merged config
    siteConfigCache = config;

    return config;
};

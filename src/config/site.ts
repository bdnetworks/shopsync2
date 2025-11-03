
import { getSiteSettings } from '@/lib/settings';
import type { SiteSettings, ProductCategory, TopCategory } from "@/lib/types";
import { getFeaturedSections, getTopCategories, getTopBrands, getFooterLinks } from '@/lib/products';

// Import static JSON files
import socials from './socials.json';
// import footer from './footer.json'; // No longer needed
import categoriesConfig from '@/config/categories.json';
import offers from './offers.json';
import contact from './contact.json';
import checkout from './checkout.json';
import banners from './banners.json';
import type { FooterLinkSection } from '@/lib/types';

// Define a type for the final configuration object
export type MergedSiteConfig = {
    name: string;
    description: string;
    currency: string;
    phone: string;
    email: string;
    address: string;
    logoImageUrl?: string;
    logoType: 'text' | 'image';
    navLinks: { href: string; label: string; }[];
    topBarLinks: { href: string; label: string; icon: string; }[];
    socialLinks: typeof socials.socialLinks;
    footerLinks: FooterLinkSection[];
    contactInfo: { title: string; value: string; icon: string; }[];
    heroBanners: { id: string; imageUrl: string; description: string; imageHint: string; }[];
    topCategories: TopCategory[];
    productCategories: ProductCategory[];
    topBrands: {name: string, imageUrl: string, imageHint: string}[];
    offers: typeof offers.offers;
    checkout: {
      shippingFee: { insideDhaka: number; outsideDhaka: number; };
      paymentMethods: typeof checkout.paymentMethods;
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
            return { label: label ? label.trim() : '', href: href ? href.trim() : '#' };
        }).filter(item => item.label);
    };
    
    // Helper to parse slider strings
    const parseSlider = (sliderString: string | undefined) => {
        if (!sliderString) return [];
        return sliderString.split(',').map((url, index) => ({
            id: `slider-${index + 1}`,
            imageUrl: url.trim(),
            description: `Slider image ${index + 1}`,
            imageHint: 'banner image'
        })).filter(item => item.imageUrl);
    };

    const [featuredSections, topCategories, topBrands, footerLinks] = await Promise.all([
        getFeaturedSections(),
        getTopCategories(),
        getTopBrands(),
        getFooterLinks()
    ]);
    
    const [insideDhaka, outsideDhaka] = (dynamicSettings.deliveryFee || '0,0').split(',').map(Number);
    const siteEmail = dynamicSettings.email || contact.contactInfo.find(c => c.title === 'Email')?.value || '';
    const sitePhone = dynamicSettings.phone || contact.contactInfo.find(c => c.title === 'Phone')?.value || '';
    const siteAddress = dynamicSettings.address || contact.contactInfo.find(c => c.title === 'Office')?.value || '';
    
    const logoFromSettings = dynamicSettings.logo as string | undefined;

    const dynamicProductCategories = dynamicSettings.productCategories
        ? (dynamicSettings.productCategories as string).split(',').map(c => c.trim() as ProductCategory)
        : categoriesConfig.productCategories.map(c => c.name as ProductCategory);


    // Start with default values from JSON files
    const config: MergedSiteConfig = {
        // Defaults from static files or hardcoded
        name: dynamicSettings.name || 'ShopSync',
        description: dynamicSettings.description || 'Syncing you with the best products from across the web.',
        currency: dynamicSettings.currencysymbol || '$',
        email: siteEmail,
        phone: sitePhone,
        address: siteAddress,
        logoType: (logoFromSettings && logoFromSettings.startsWith('http')) ? 'image' : 'text',
        logoImageUrl: (logoFromSettings && logoFromSettings.startsWith('http')) ? logoFromSettings : undefined,
        navLinks: parseMenu(dynamicSettings.headermenu),
        topBarLinks: parseMenu(dynamicSettings.topmenu).map(item => ({...item, icon: 'Tag'})),
        socialLinks: socials.socialLinks.map(link => {
            const socialKey = link.name.toLowerCase();
            const socialValue = dynamicSettings[socialKey] as string | undefined;
            if (socialValue && socialValue !== '#') {
                 const url = socialKey === 'whatsapp' 
                    ? `https://wa.me/${socialValue.replace(/\D/g, '')}`
                    : (socialValue.startsWith('http') || socialValue.startsWith('https')) ? socialValue : `https://facebook.com/${socialValue}`;
                return { ...link, href: url };
            }
            return { ...link, href: '#' }; // Return a default non-functional link
        }),
        footerLinks: footerLinks.length > 0 ? footerLinks : [],
        contactInfo: [
            { title: "Email", value: siteEmail, icon: "Mail" },
            { title: "Phone", value: sitePhone, icon: "Phone" },
            { title: "Office", value: siteAddress, icon: "MapPin" }
        ],
        heroBanners: parseSlider(dynamicSettings.Slider).length > 0 ? parseSlider(dynamicSettings.Slider) : banners.heroBanners,
        topCategories: topCategories,
        featuredSections: featuredSections,
        productCategories: dynamicProductCategories,
        topBrands: topBrands,
        offers: offers.offers,
        checkout: {
            shippingFee: {
                insideDhaka: !isNaN(insideDhaka) && insideDhaka > 0 ? insideDhaka : checkout.shippingFee.insideDhaka,
                outsideDhaka: !isNaN(outsideDhaka) && outsideDhaka > 0 ? outsideDhaka : checkout.shippingFee.outsideDhaka,
            },
            paymentMethods: checkout.paymentMethods
        },
        ...dynamicSettings // Spread the rest of the dynamic settings
    };

    // Cache the merged config
    siteConfigCache = config;

    return config;
};

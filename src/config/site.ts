
import { getSiteSettings } from '@/lib/settings';
import type { SiteSettings, ProductCategory, TopCategory } from "@/lib/types";
import { getFeaturedSections, getTopCategories, getTopBrands, getFooterLinks } from '@/lib/products';

// Import static JSON files for fallback
import socials from './socials.json';
import categoriesConfig from '@/config/categories.json';
import offers from './offers.json';
import contact from './contact.json';
import checkout from './checkout.json';
import banners from './banners.json';
import nav from './nav.json';
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

export const getSiteConfig = async (): Promise<MergedSiteConfig> => {
    // Fetch dynamic settings from Google Sheet
    const dynamicSettings = await getSiteSettings();

    // Helper to parse menu strings (e.g., "Home:/,About:/about")
    const parseMenu = (menuString: string | undefined) => {
        if (!menuString) return [];
        return menuString.split(',').map(item => {
            const [label, href] = item.split(':');
            return { label: label ? label.trim() : '', href: href ? href.trim() : '#' };
        }).filter(item => item.label && item.href);
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

    const [topCategories, topBrands, footerLinks] = await Promise.all([
        getTopCategories(),
        getTopBrands(),
        getFooterLinks()
    ]);
    
    const [insideDhakaStr, outsideDhakaStr] = (dynamicSettings.deliveryfee || '0,0').split(',');
    const insideDhaka = parseFloat(insideDhakaStr);
    const outsideDhaka = parseFloat(outsideDhakaStr);

    const siteEmail = dynamicSettings.email || contact.contactInfo.find(c => c.title === 'Email')?.value || '';
    const sitePhone = dynamicSettings.phone || contact.contactInfo.find(c => c.title === 'Phone')?.value || '';
    const siteAddress = dynamicSettings.address || contact.contactInfo.find(c => c.title === 'Office')?.value || '';
    
    const logoFromSettings = dynamicSettings.logo as string | undefined;
    const isLogoUrl = logoFromSettings && (logoFromSettings.startsWith('http') || logoFromSettings.startsWith('/'));
    
    const dynamicProductCategories = dynamicSettings.productcategories
        ? (dynamicSettings.productcategories as string).split(',').map(c => c.trim() as ProductCategory)
        : categoriesConfig.productCategories.map(c => c.name as ProductCategory);

    const mergedNavLinks = parseMenu(dynamicSettings.headermenu).length > 0 ? parseMenu(dynamicSettings.headermenu) : nav.navLinks;
    const mergedTopBarLinks = parseMenu(dynamicSettings.topmenu).length > 0 ? parseMenu(dynamicSettings.topmenu).map(item => ({...item, icon: 'Tag'})) : [];


    // Start with default values from JSON files
    const config: MergedSiteConfig = {
        name: dynamicSettings.name || 'ShopSync',
        description: dynamicSettings.description || 'Syncing you with the best products from across the web.',
        currency: dynamicSettings.currencysymbol || '$',
        email: siteEmail,
        phone: sitePhone,
        address: siteAddress,
        logoType: isLogoUrl ? 'image' : 'text',
        logoImageUrl: isLogoUrl ? logoFromSettings : undefined,
        navLinks: mergedNavLinks,
        topBarLinks: mergedTopBarLinks,
        socialLinks: socials.socialLinks.map(link => {
            const socialKey = link.name.toLowerCase();
            const socialValue = dynamicSettings[socialKey] as string | undefined;
            if (socialValue && socialValue !== '#') {
                 const url = socialKey === 'whatsapp' 
                    ? `https://wa.me/${socialValue.replace(/\D/g, '')}`
                    : (socialValue.startsWith('http')) ? socialValue : `https://${socialKey}.com/${socialValue}`;
                return { ...link, href: url };
            }
            return { ...link, href: '#' }; // Return a default non-functional link
        }),
        footerLinks: footerLinks.length > 0 ? footerLinks : [],
        contactInfo: [
            { title: "Email", value: siteEmail, icon: "Mail" },
            { title: "Phone", value: sitePhone, icon: "Phone" },
            { title: "Office", value: siteAddress, icon: "MapPin" }
        ].filter(info => info.value),
        heroBanners: parseSlider(dynamicSettings.slider).length > 0 ? parseSlider(dynamicSettings.slider) : banners.heroBanners,
        topCategories: topCategories,
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

    return config;
};

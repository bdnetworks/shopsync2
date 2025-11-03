
import type { SiteSettings, ProductCategory, TopCategory, PaymentMethod, SocialLink, NavLink } from "@/lib/types";
import { getFeaturedSections, getTopCategories, getTopBrands, getFooterLinks, getPaymentMethods } from '@/lib/products';

// Import static JSON files for fallback
import siteData from './site.json';
import socials from './socials.json';
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
    navLinks: NavLink[];
    topBarLinks: { href: string; label: string; icon: string; }[];
    socialLinks: SocialLink[];
    footerLinks: FooterLinkSection[];
    contactInfo: { title: string; value: string; icon: string; }[];
    heroBanners: { id: string; imageUrl: string; description: string; imageHint: string; }[];
    topCategories: TopCategory[];
    productCategories: ProductCategory[];
    topBrands: {name: string, imageUrl: string, imageHint: string}[];
    checkout: {
      shippingFee: { insideDhaka: number; outsideDhaka: number; };
      paymentMethods: PaymentMethod[];
    };
    [key: string]: any; // Allow other properties from dynamic settings
}

export const getSiteConfig = async (): Promise<MergedSiteConfig> => {
    // All data is now sourced from local JSON files for performance.
    const dynamicSettings: SiteSettings = siteData.settings;

    const parseMenu = (menuString: string | undefined): NavLink[] => {
        if (!menuString) return [];
        return menuString.split(',').map(item => {
            const [label, href] = item.split(':');
            return { label: label ? label.trim() : '', href: href ? href.trim() : '#' };
        }).filter(item => item.label && item.href);
    };
    
    const parseSlider = (sliderString: string | undefined) => {
        if (!sliderString) return [];
        return sliderString.split(',').map((url, index) => ({
            id: `slider-${index + 1}`,
            imageUrl: url.trim(),
            description: `Slider image ${index + 1}`,
            imageHint: 'banner image'
        })).filter(item => item.imageUrl);
    };

    const [topCategories, topBrands, footerLinks, paymentMethods] = await Promise.all([
        getTopCategories(),
        getTopBrands(),
        getFooterLinks(),
        getPaymentMethods(),
    ]);
    
    const [insideDhakaStr, outsideDhakaStr] = (dynamicSettings.deliveryfee || '0,0').split(',');
    const insideDhaka = parseFloat(insideDhakaStr);
    const outsideDhaka = parseFloat(outsideDhakaStr);

    const siteEmail = dynamicSettings.email || '';
    const sitePhone = dynamicSettings.phone || '';
    const siteAddress = dynamicSettings.address || '';
    
    const logoFromSettings = dynamicSettings.logo || "";
    const isLogoUrl = logoFromSettings && (logoFromSettings.startsWith('http') || logoFromSettings.startsWith('/'));
    
    const dynamicProductCategories = dynamicSettings.productcategories
        ? (dynamicSettings.productcategories as string).split(',').map(c => c.trim() as ProductCategory)
        : siteData.productCategories.map(c => c as ProductCategory);

    const mergedNavLinks = parseMenu(dynamicSettings.headermenu).length > 0 ? parseMenu(dynamicSettings.headermenu) : nav.navLinks;
    
    const defaultTopBarLinks = [
        { href: `tel:${sitePhone}`, label: sitePhone, icon: 'Phone' },
        { href: `mailto:${siteEmail}`, label: siteEmail, icon: 'Mail' },
        { href: "/#customer-service", label: "Customer Service", icon: "User" },
        { href: "/offer", label: "Offer", icon: "Tag" },
        { href: "/products", label: "New Arrival", icon: "Shirt" },
        { href: "/#stores", label: "Store", icon: "Store" },
    ].filter(link => link.label);

    const mergedTopBarLinks = parseMenu(dynamicSettings.topmenu).length > 0 ? parseMenu(dynamicSettings.topmenu).map(item => ({...item, icon: 'Tag'})) : defaultTopBarLinks;

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
            return { ...link, href: '#' };
        }),
        footerLinks: footerLinks.length > 0 ? footerLinks : siteData.footerLinks,
        contactInfo: [
            { title: "Email", value: siteEmail, icon: "Mail" },
            { title: "Phone", value: sitePhone, icon: "Phone" },
            { title: "Office", value: siteAddress, icon: "MapPin" }
        ].filter(info => info.value),
        heroBanners: parseSlider(dynamicSettings.slider).length > 0 ? parseSlider(dynamicSettings.slider) : banners.heroBanners,
        topCategories: topCategories.length > 0 ? topCategories : siteData.topCategories,
        productCategories: dynamicProductCategories,
        topBrands: topBrands.length > 0 ? topBrands : siteData.topBrands,
        checkout: {
            shippingFee: {
                insideDhaka: !isNaN(insideDhaka) && insideDhaka > 0 ? insideDhaka : checkout.shippingFee.insideDhaka,
                outsideDhaka: !isNaN(outsideDhaka) && outsideDhaka > 0 ? outsideDhaka : checkout.shippingFee.outsideDhaka,
            },
            paymentMethods: paymentMethods.length > 0 ? paymentMethods : checkout.paymentMethods
        },
        ...dynamicSettings
    };

    return config;
};


import type { ProductCategory } from "@/lib/types";

export const siteConfig = {
    name: "RYANS",
    description: "Syncing you with the best products from across the web.",
    logoIcon: "ShoppingBag",
    navLinks: [
        { href: '/', label: 'Home' },
        { href: '/products', label: 'Products' },
        { href: '/about', label: 'About' },
        { href: '/contact', label: 'Contact' },
    ],
    socialLinks: [
        { name: 'Facebook', icon: "Facebook", href: '#' },
        { name: 'Twitter', icon: "Twitter", href: '#' },
        { name: 'Youtube', icon: "Youtube", href: '#' },
        { name: 'Instagram', icon: "Instagram", href: '#' },
    ],
    footerLinks: [
        {
            title: "Shop",
            links: [
                { name: "All Products", href: "/products"},
                { name: "Apparel", href: "/products?category=Apparel"},
                { name: "Bags", href: "/products?category=Bags"},
                { name: "Accessories", href: "/products?category=Accessories"},
            ]
        },
        {
            title: "About Us",
            links: [
                { name: "Our Story", href: "/about"},
                { name: "Contact", href: "/contact"},
                { name: "FAQs", href: "#"},
            ]
        },
        {
            title: "Support",
            links: [
                { name: "Shipping & Returns", href: "#"},
                { name: "Privacy Policy", href: "#"},
                { name: "Terms of Service", href: "#"},
            ]
        }
    ],
    contactInfo: [
        { title: "Email", value: "hello@shopsync.com", icon: "Mail" },
        { title: "Phone", value: "(123) 456-7890", icon: "Phone" },
        { title: "Office", value: "123 Commerce St, Online City, 10101", icon: "MapPin" }
    ],
    heroBanners: [
        {
            id: "hero-banner-1",
            description: "Promotional banner for a technology kit with a discount offer.",
            imageUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80",
            imageHint: "tech kit"
        },
        {
            id: "hero-banner-2",
            description: "Banner advertising free online home delivery with an image of a delivery person.",
            imageUrl: "https://images.unsplash.com/photo-1594411440399-973405c935e4?w=800&q=80",
            imageHint: "online delivery"
        }
    ],
    topCategories: [
        { name: 'Laptop', icon: "Laptop" },
        { name: 'Processor', icon: "Cpu" },
        { name: 'AIO PC', icon: "Monitor" },
        { name: 'Speaker', icon: "Speaker" },
        { name: 'Monitor', icon: "Tv" },
        { name: 'Software', icon: "HardDrive" },
        { name: 'Gaming', icon: "Gamepad2" },
        { name: 'Printer', icon: "Printer" },
        { name: 'CPU', icon: "Cpu" },
        { name: 'Camera', icon: "Camera" },
    ],
    // Edit the product categories for the products page tabs here.
    // Make sure to also add the corresponding category and sheet URL in `src/config/categories.json`
    productCategories: ['Apparel', 'Bags', 'Footwear', 'Accessories'] as ProductCategory[],
    topBrands: ['Apple', 'Microsoft', 'Starlink', 'HP', 'Asus', 'Dell', 'Lenovo', 'Acer', 'Intel', 'AMD', 'MSI'],
    checkout: {
        // Add checkout page specific configurations here
    }
}

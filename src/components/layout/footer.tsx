import Link from 'next/link';
import { Github, Twitter, Facebook } from 'lucide-react';
import Logo from '@/components/logo';

const socialLinks = [
  { name: 'Facebook', icon: Facebook, href: '#' },
  { name: 'Twitter', icon: Twitter, href: '#' },
  { name: 'GitHub', icon: Github, href: '#' },
];

const footerLinks = [
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
]

export default function Footer() {
  return (
    <footer className="bg-secondary text-secondary-foreground">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="md:col-span-2 lg:col-span-1">
             <Link href="/" className="flex items-center gap-2 mb-4">
              <Logo />
            </Link>
            <p className="text-sm text-muted-foreground">
              Syncing you with the best products from across the web.
            </p>
            <div className="flex space-x-4 mt-4">
              {socialLinks.map((social) => (
                <Link key={social.name} href={social.href} className="text-muted-foreground hover:text-foreground">
                  <social.icon className="h-5 w-5" />
                  <span className="sr-only">{social.name}</span>
                </Link>
              ))}
            </div>
          </div>
          {footerLinks.map((section) => (
            <div key={section.title}>
                <h3 className="font-headline font-semibold">{section.title}</h3>
                <ul className="mt-4 space-y-2">
                    {section.links.map((link) => (
                        <li key={link.name}>
                            <Link href={link.href} className="text-sm text-muted-foreground hover:text-foreground">
                                {link.name}
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>
          ))}
        </div>
        <div className="mt-8 border-t border-border pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} ShopSync. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

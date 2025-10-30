
'use client';

import Link from 'next/link';
import { Menu, ShoppingCart, Search, Heart, User, Phone, Mail, Tag, Shirt, Store } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Logo from '@/components/logo';
import { useCart } from '@/context/cart-context';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTrigger,
} from '@/components/ui/sheet';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Input } from '../ui/input';
import { siteConfig } from '@/config/site';
import { useWishlist } from '@/context/wishlist-context';

export default function Header() {
  const { itemCount } = useCart();
  const { wishlistCount } = useWishlist();
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 80);
    };
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const topBarLinks = [
      { href: "tel:16810", label: "16810", icon: Phone },
      { href: "mailto:info@ryans.com", label: "info@ryans.com", icon: Mail },
      { href: "/contact", label: "Contact", icon: User },
      { href: "#", label: "Offer", icon: Tag },
      { href: "#", label: "New Arrival", icon: Shirt },
      { href: "#", label: "Store", icon: Store },
  ]

  const RightIcons = () => (
    <div className="flex flex-1 items-center justify-end gap-2">
      <div className="hidden md:flex items-center gap-2">
        <Link href="/wishlist" aria-label="Open wishlist">
          <Button variant="ghost" size="icon" className="relative text-white hover:text-primary">
            <Heart className="h-6 w-6" />
            {wishlistCount > 0 && (
              <span className="absolute top-0 right-0 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white">
                {wishlistCount}
              </span>
            )}
          </Button>
        </Link>
        <Link href="/cart" aria-label="Open shopping cart">
          <Button variant="ghost" size="icon" className="relative text-white hover:text-primary">
            <ShoppingCart className="h-6 w-6" />
            {itemCount > 0 && (
              <span className="absolute top-0 right-0 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white">
                {itemCount}
              </span>
            )}
          </Button>
        </Link>
        <Link href="/contact" aria-label="Contact page" className="relative">
          <Button variant="ghost" size="icon" className="text-white hover:text-primary">
            <User className="h-6 w-6" />
          </Button>
        </Link>
      </div>

      <div className="flex flex-1 justify-end md:hidden">
        <div className="flex items-center gap-2">
            <Link href="/wishlist" aria-label="Open wishlist">
              <Button variant="ghost" size="icon" className="relative text-white hover:text-primary">
                <Heart className="h-6 w-6" />
                {wishlistCount > 0 && (
                  <span className="absolute top-0 right-0 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white">
                    {wishlistCount}
                  </span>
                )}
              </Button>
            </Link>
            <Link href="/cart" aria-label="Open shopping cart">
              <Button variant="ghost" size="icon" className="relative text-white hover:text-primary">
                <ShoppingCart className="h-6 w-6" />
                {itemCount > 0 && (
                  <span className="absolute top-0 right-0 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white">
                    {itemCount}
                  </span>
                )}
              </Button>
            </Link>
            <Sheet open={isMenuOpen} onOpenChange={setMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-white hover:text-primary">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="bg-[#0d2253] text-white border-l-gray-800">
                <SheetHeader>
                  <Link href="/" className="flex items-center gap-2 mb-8" onClick={() => setMenuOpen(false)}>
                    <Logo />
                  </Link>
                </SheetHeader>
                <div className="flex flex-col gap-4">
                  {siteConfig.navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMenuOpen(false)}
                      className={cn(
                        "text-lg font-medium transition-colors hover:text-primary",
                        pathname === link.href ? "text-primary" : ""
                      )}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </SheetContent>
            </Sheet>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <header className="w-full bg-[#0d2253] text-white">
        <div className="border-b border-gray-700">
          <div className="container hidden h-10 max-w-screen-2xl items-center justify-end gap-6 text-sm md:flex">
              {topBarLinks.map(link => {
                  const Icon = link.icon;
                  return (
                      <Link key={link.label} href={link.href} className="flex items-center gap-2 hover:text-primary transition-colors">
                          <Icon className="h-4 w-4" />
                          <span>{link.label}</span>
                      </Link>
                  )
              })}
          </div>
        </div>
        
        <div className="bg-[#0d2253] border-b border-gray-700">
            <div className="container flex h-20 max-w-screen-2xl items-center justify-between">
                <Link href="/" className="flex items-center gap-2">
                  <Logo />
                </Link>

                <div className="hidden lg:flex flex-1 max-w-xl mx-4">
                    <Input placeholder="Enter Your Keyword..." className="bg-white text-black rounded-r-none focus:ring-primary border-0 h-11"/>
                    <Button className="rounded-l-none bg-primary hover:bg-primary/90 h-11">
                        <Search className="h-5 w-5"/>
                    </Button>
                </div>
                <div className="flex flex-1 justify-end">
                  <RightIcons />
                </div>
            </div>
        </div>

        <nav className="hidden md:flex bg-[#0d2253]">
          <div className="container flex items-center gap-6 text-sm font-medium h-12 max-w-screen-2xl">
            {siteConfig.navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "transition-colors hover:text-primary",
                  pathname === link.href ? "text-primary font-semibold" : "text-white/80"
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </nav>
      </header>

      {/* Sticky Header */}
      <div className={cn(
        "fixed top-0 left-0 right-0 z-50 bg-[#0d2253] border-b border-gray-700 transition-transform duration-300 ease-in-out",
        isScrolled ? "translate-y-0" : "-translate-y-full"
      )}>
        <div className="container flex h-16 max-w-screen-2xl items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Logo />
          </Link>
          <div className="flex flex-1 justify-end">
            <RightIcons />
          </div>
        </div>
      </div>
    </>
  );
}

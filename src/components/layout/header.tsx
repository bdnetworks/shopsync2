
'use client';

import Link from 'next/link';
import { Menu, ShoppingCart, Search, Heart, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Logo from '@/components/logo';
import { useCart } from '@/context/cart-context';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTrigger,
} from '@/components/ui/sheet';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Input } from '../ui/input';
import { siteConfig } from '@/config/site';
import { useWishlist } from '@/context/wishlist-context';

export default function Header() {
  const { itemCount } = useCart();
  const { wishlistCount } = useWishlist();
  const [isMenuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background supports-[backdrop-filter]:bg-background/60">
      <div className="bg-[#0f172a] text-white">
        <div className="container flex h-16 max-w-screen-2xl items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Logo />
          </Link>

          <div className="hidden lg:flex flex-1 max-w-xl mx-4">
              <Input placeholder="Enter your keyword" className="bg-white text-black rounded-r-none focus:ring-primary"/>
              <Button className="rounded-l-none bg-primary hover:bg-primary/90">
                  <Search className="h-5 w-5"/>
              </Button>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/wishlist" aria-label="Open wishlist" className="hidden md:flex">
              <Button variant="ghost" size="icon" className="relative">
                <Heart className="h-5 w-5" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                    {wishlistCount}
                  </span>
                )}
              </Button>
            </Link>
            <Button variant="ghost" size="icon" className="relative hidden md:flex">
              <User className="h-5 w-5" />
            </Button>
            <Link href="/cart" aria-label="Open shopping cart">
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingCart className="h-5 w-5" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                    {itemCount}
                  </span>
                )}
              </Button>
            </Link>
            
            <div className="md:hidden">
              <Sheet open={isMenuOpen} onOpenChange={setMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="bg-[#0f172a] text-white border-l-gray-800">
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
      </div>
      <nav className="hidden md:flex bg-primary border-b">
        <div className="container flex items-center gap-6 text-sm font-medium h-12 max-w-screen-2xl">
          {siteConfig.navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "transition-colors hover:text-primary-foreground/80",
                pathname === link.href ? "text-primary-foreground font-semibold" : "text-primary-foreground/60"
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}

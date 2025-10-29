import type { Metadata } from 'next';
import './globals.css';
import { Playfair_Display, PT_Sans } from 'next/font/google';
import { cn } from '@/lib/utils';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { Toaster } from '@/components/ui/toaster';
import { CartProvider } from '@/context/cart-context';
import { WishlistProvider } from '@/context/wishlist-context';
import { siteConfig } from '@/config/site';
import Link from 'next/link';
import FloatingWhatsAppButton from '@/components/layout/floating-whatsapp-button';

const fontPlayfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-headline',
});

const fontPTSans = PT_Sans({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-body',
});

export const metadata: Metadata = {
  title: 'ShopSync - Modern E-commerce',
  description: 'Syncing you with the best products from across the web.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          'min-h-screen bg-background font-body antialiased',
          fontPlayfair.variable,
          fontPTSans.variable
        )}
      >
        <CartProvider>
          <WishlistProvider>
            <div className="relative flex min-h-dvh flex-col bg-background">
              <Header />
              <main className="flex-1">{children}</main>
              <Footer />
              <FloatingWhatsAppButton />
            </div>
            <Toaster />
          </WishlistProvider>
        </CartProvider>
      </body>
    </html>
  );
}

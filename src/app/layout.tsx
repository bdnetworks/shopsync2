
import type { Metadata } from 'next';
import './globals.css';
import { Playfair_Display, PT_Sans } from 'next/font/google';
import { cn } from '@/lib/utils';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { Toaster } from '@/components/ui/toaster';
import { CartProvider } from '@/context/cart-context';
import { WishlistProvider } from '@/context/wishlist-context';
import { getSiteConfig } from '@/config/site';
import FloatingWhatsAppButton from '@/components/layout/floating-whatsapp-button';
import { QuickViewProvider } from '@/context/quick-view-context';
import QuickViewModal from '@/components/quick-view-modal';

const fontPlayfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-headline',
});

const fontPTSans = PT_Sans({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-body',
});

export async function generateMetadata(): Promise<Metadata> {
  const siteConfig = await getSiteConfig();
  return {
    title: siteConfig.name,
    description: siteConfig.description,
    manifest: '/manifest.json',
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const siteConfig = await getSiteConfig();
  return (
    <html lang="en" suppressHydrationWarning>
       <head>
        <meta name="theme-color" content={siteConfig.themeColor || "#e11d48"} />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body
        className={cn(
          'min-h-screen bg-background font-body antialiased',
          fontPlayfair.variable,
          fontPTSans.variable
        )}
      >
        <CartProvider>
          <WishlistProvider>
            <QuickViewProvider>
              <div className="relative flex min-h-dvh flex-col bg-background">
                <Header />
                <main className="flex-1">{children}</main>
                <Footer />
                <FloatingWhatsAppButton />
              </div>
              <QuickViewModal />
              <Toaster />
            </QuickViewProvider>
          </WishlistProvider>
        </CartProvider>
      </body>
    </html>
  );
}

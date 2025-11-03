
'use client';

import { CartProvider } from "@/context/cart-context";
import { QuickViewProvider } from "@/context/quick-view-context";
import { WishlistProvider } from "@/context/wishlist-context";
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import FloatingWhatsAppButton from '@/components/layout/floating-whatsapp-button';
import QuickViewModal from '@/components/quick-view-modal';
import { Toaster } from '@/components/ui/toaster';
import { MergedSiteConfig } from "@/config/site";


export function Providers({ children, siteConfig }: { children: React.ReactNode, siteConfig: MergedSiteConfig }) {
    return (
        <CartProvider>
            <WishlistProvider>
                <QuickViewProvider>
                    <div className="relative flex min-h-dvh flex-col bg-background">
                        <Header siteConfig={siteConfig} />
                        <main className="flex-1">{children}</main>
                        <Footer />
                        <FloatingWhatsAppButton />
                    </div>
                    <QuickViewModal />
                    <Toaster />
                </QuickViewProvider>
            </WishlistProvider>
        </CartProvider>
    );
}

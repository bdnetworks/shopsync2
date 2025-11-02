
'use client';

import { getIcon } from "@/lib/icons";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getSiteConfig, MergedSiteConfig } from "@/config/site";

export default function FloatingWhatsAppButton() {
    const [siteConfig, setSiteConfig] = useState<MergedSiteConfig | null>(null);

    useEffect(() => {
        const fetchConfig = async () => {
          const config = await getSiteConfig();
          setSiteConfig(config);
        }
        fetchConfig();
    }, []);
    
    if (!siteConfig || !siteConfig.phone) return null;

    const whatsAppUrl = `https://wa.me/${siteConfig.phone.replace(/\D/g, '')}?text=Hello%2C%20I%20have%20a%20question%20about%20products.`;
    
    const WhatsAppIcon = getIcon('WhatsApp');
    const ChatIcon = getIcon('MessageSquareMore');

    return (
        <Link 
            href={whatsAppUrl}
            target="_blank" 
            rel="noopener noreferrer"
            className="fixed bottom-5 right-5 z-50 flex items-center gap-2 cursor-pointer group"
        >
            {/* Main body */}
            <div className="flex items-center bg-background rounded-full shadow-lg overflow-hidden transform transition-transform group-hover:scale-105">
                {/* WhatsApp Icon */}
                <div className="bg-green-500 text-white p-3 rounded-full z-10 -mr-2">
                    {WhatsAppIcon && <WhatsAppIcon className="h-6 w-6" />}
                </div>

                {/* Text and Chat Icon */}
                <div className="flex items-center pl-4 pr-3 py-2 rounded-full bg-background">
                    <div className="text-right mr-2">
                        <p className="text-sm font-semibold text-foreground">Any Question!</p>
                        <p className="text-sm text-muted-foreground">Chat with us!</p>
                    </div>
                    {ChatIcon && <ChatIcon className="h-6 w-6 text-green-500" />}
                </div>
            </div>
        </Link>
    )
}

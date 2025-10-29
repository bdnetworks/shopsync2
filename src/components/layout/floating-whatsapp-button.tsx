
'use client';

import { siteConfig } from "@/config/site";
import { getIcon } from "@/lib/icons";
import Link from "next/link";

export default function FloatingWhatsAppButton() {
    const socialLink = siteConfig.socialLinks.find(link => link.name === 'WhatsApp');
    
    if (!socialLink) return null;

    const WhatsAppIcon = getIcon('WhatsApp');
    const ChatIcon = getIcon('MessageSquareMore');

    return (
        <Link 
            href={socialLink.href}
            target="_blank" 
            rel="noopener noreferrer"
            className="fixed bottom-5 right-5 z-50 flex items-center gap-2 cursor-pointer group"
        >
            {/* Main body */}
            <div className="flex items-center bg-background rounded-full shadow-lg overflow-hidden transform transition-transform group-hover:scale-105">
                {/* WhatsApp Icon */}
                <div className="bg-primary text-primary-foreground p-3 rounded-full z-10 -mr-2">
                    {WhatsAppIcon && <WhatsAppIcon className="h-6 w-6" />}
                </div>

                {/* Text and Chat Icon */}
                <div className="flex items-center pl-4 pr-3 py-2 rounded-full bg-background">
                    <div className="text-right mr-2">
                        <p className="text-sm font-semibold text-primary">Any Question!</p>
                        <p className="text-sm text-muted-foreground">Chat with us!</p>
                    </div>
                    {ChatIcon && <ChatIcon className="h-6 w-6 text-primary" />}
                </div>
            </div>
        </Link>
    )
}

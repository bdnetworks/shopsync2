
'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { ShoppingBag } from 'lucide-react';
import Link from 'next/link';

export default function OrderConfirmationPage() {
    const [isClient, setIsClient] = useState(false);
    const router = useRouter();

    useEffect(() => {
        setIsClient(true);
        const orderDetails = sessionStorage.getItem('orderDetails');
        if (!orderDetails) {
            router.push('/');
        }
    }, [router]);

    if (!isClient) {
        return null; // Render nothing on the server
    }

    // This page is no longer reachable through the normal flow.
    // It's kept as a fallback but users will be redirected.
    // We show a generic message.

    return (
        <div className="container mx-auto px-4 py-16 text-center">
            <ShoppingBag className="mx-auto h-24 w-24 text-muted-foreground" />
            <h1 className="mt-8 text-4xl font-headline font-bold">Thank you for your interest!</h1>
            <p className="mt-2 text-muted-foreground">Manage your orders directly through WhatsApp.</p>
            <Button asChild className="mt-6">
                <Link href="/products">Continue Shopping</Link>
            </Button>
        </div>
    );
}

    
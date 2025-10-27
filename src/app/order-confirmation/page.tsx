
'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useCart } from '@/context/cart-context';
import { CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function OrderConfirmationPage() {
    const { clearCart } = useCart();

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('submitted')) {
          clearCart();
        }
    }, [clearCart]);

    return (
        <div className="container mx-auto px-4 py-16 flex items-center justify-center">
            <Card className="w-full max-w-md text-center">
                <CardHeader>
                    <div className="mx-auto bg-green-100 dark:bg-green-900 rounded-full p-3 w-fit">
                        <CheckCircle2 className="h-12 w-12 text-green-600 dark:text-green-400" />
                    </div>
                    <CardTitle className="font-headline text-3xl mt-4">Thank You!</CardTitle>
                    <CardDescription>
                        Your order request has been sent. We will contact you shortly to confirm the details.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground text-sm mb-6">
                        An email with your order summary has been sent to the provided address.
                    </p>
                    <Button asChild className="w-full">
                        <Link href="/products">Continue Shopping</Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}

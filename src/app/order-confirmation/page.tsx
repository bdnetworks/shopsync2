import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function OrderConfirmationPage() {
    return (
        <div className="container mx-auto px-4 py-16 flex items-center justify-center">
            <Card className="w-full max-w-md text-center">
                <CardHeader>
                    <div className="mx-auto bg-green-100 dark:bg-green-900 rounded-full p-3 w-fit">
                        <CheckCircle2 className="h-12 w-12 text-green-600 dark:text-green-400" />
                    </div>
                    <CardTitle className="font-headline text-3xl mt-4">Thank You For Your Order!</CardTitle>
                    <CardDescription>
                        Your order has been placed successfully. A confirmation email has been sent to you.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground text-sm mb-6">
                        You can view your order history in your account page.
                        (This is a demo, no order was actually placed).
                    </p>
                    <Button asChild className="w-full">
                        <Link href="/products">Continue Shopping</Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}

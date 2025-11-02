
'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";
import Link from "next/link";
import { Skeleton } from '@/components/ui/skeleton';

function OrderConfirmationContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');

  return (
    <div className="container mx-auto px-4 py-16 flex items-center justify-center">
      <Card className="max-w-2xl w-full text-center shadow-lg">
        <CardHeader>
          <div className="mx-auto bg-green-100 rounded-full h-16 w-16 flex items-center justify-center">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <CardTitle className="text-3xl font-headline font-bold mt-4">Thank You For Your Order!</CardTitle>
           <CardDescription className="text-lg text-muted-foreground pt-2">
            Your order has been placed successfully.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-muted/50 p-6 rounded-lg text-left space-y-2">
             {orderId ? (
                <p className="text-center">Your Order ID is: <strong className="text-primary">{orderId}</strong></p>
             ) : (
                <div className="flex justify-center">
                    <Skeleton className="h-6 w-48" />
                </div>
             )}
            <p className="text-center text-muted-foreground">
              We've sent a confirmation email to you with the order details. We will contact you shortly for processing.
            </p>
          </div>
          
          <Button asChild className="mt-4">
            <Link href="/products">Continue Shopping</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}


export default function OrderConfirmationPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <OrderConfirmationContent />
        </Suspense>
    )
}

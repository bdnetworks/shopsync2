
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";
import Link from "next/link";

export default function OrderConfirmationPage() {
  return (
    <div className="container mx-auto px-4 py-16 flex items-center justify-center">
      <Card className="max-w-lg w-full text-center shadow-lg">
        <CardHeader>
          <div className="mx-auto bg-green-100 rounded-full h-16 w-16 flex items-center justify-center">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <CardTitle className="text-3xl font-headline font-bold mt-4">Thank You For Your Order!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Your order has been successfully placed. You will receive a confirmation email shortly with the order details.
          </p>
          <Button asChild className="mt-6">
            <Link href="/products">Continue Shopping</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

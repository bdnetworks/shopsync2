
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CheckCircle, Mail, MessageSquare } from "lucide-react";
import Link from "next/link";

export default function OrderConfirmationPage() {
  return (
    <div className="container mx-auto px-4 py-16 flex items-center justify-center">
      <Card className="max-w-2xl w-full text-center shadow-lg">
        <CardHeader>
          <div className="mx-auto bg-green-100 rounded-full h-16 w-16 flex items-center justify-center">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <CardTitle className="text-3xl font-headline font-bold mt-4">Just one more step!</CardTitle>
           <CardDescription className="text-lg text-muted-foreground pt-2">
            Your order details are ready. Please complete the final step to confirm your order.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-muted/50 p-6 rounded-lg text-left">
            <h3 className="font-semibold text-lg mb-3">What to do next?</h3>
            <p className="text-muted-foreground mb-4">
              We have opened a new browser tab with either WhatsApp or Gmail, pre-filled with your order details. Please review the information and click the **Send** button in that tab to finalize your order.
            </p>
            <div className="flex items-center justify-center gap-6">
                <div className="flex flex-col items-center gap-2">
                    <div className="p-3 bg-green-200 rounded-full">
                        <MessageSquare className="h-8 w-8 text-green-700"/>
                    </div>
                    <span className="font-medium">WhatsApp</span>
                </div>
                 <div className="text-muted-foreground">or</div>
                 <div className="flex flex-col items-center gap-2">
                    <div className="p-3 bg-blue-200 rounded-full">
                        <Mail className="h-8 w-8 text-blue-700"/>
                    </div>
                    <span className="font-medium">Gmail</span>
                </div>
            </div>
          </div>
          
          <p className="text-sm text-muted-foreground">
            Once you send the message, your order will be confirmed. We will contact you shortly.
          </p>

          <Button asChild className="mt-4">
            <Link href="/products">Continue Shopping</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

    
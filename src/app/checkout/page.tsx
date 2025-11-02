
'use client';

import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useCart } from '@/context/cart-context';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { siteConfig } from '@/config/site';
import { Skeleton } from '@/components/ui/skeleton';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import type { ShippingOption } from '@/lib/types';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, Terminal } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function CheckoutPage() {
  const { cartItems, subtotal, total, isCartLoading, shippingFee, setShippingOption, clearCart } = useCart();
  const router = useRouter();
  const { toast } = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [address, setAddress] = useState('');
  const [selectedShipping, setSelectedShipping] = useState<ShippingOption>('insideDhaka');
  const [paymentMethod, setPaymentMethod] = useState(siteConfig.checkout.paymentMethods[0].name);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  useEffect(() => {
    // This effect runs when the user comes back to this page.
    // If we find our flag in session storage, it means they were probably sent to mail/whatsapp.
    // We then redirect them to the confirmation page and clear the flag.
    if (sessionStorage.getItem('order_redirect')) {
      sessionStorage.removeItem('order_redirect');
      clearCart();
      router.push('/order-confirmation');
    }
  }, [router, clearCart]);

  useEffect(() => {
    setShippingOption(selectedShipping);
  }, [selectedShipping, setShippingOption]);

  useEffect(() => {
    if (!isCartLoading && cartItems.length === 0) {
      router.push('/products');
    }
  }, [isCartLoading, cartItems.length, router]);
  
  const handleShippingChange = (value: ShippingOption) => {
    setSelectedShipping(value);
    setShippingOption(value);
  }

  const isFormValid = name && email && mobile && address && paymentMethod;
  
  const selectedPaymentMethodDetails = useMemo(() => {
      return siteConfig.checkout.paymentMethods.find(method => method.name === paymentMethod)
  }, [paymentMethod]);

  const itemsSummary = useMemo(() => {
    return cartItems.map(item => 
        `${item.name} (x${item.quantity})` +
        `${item.selectedColor ? ` - Color: ${item.selectedColor}` : ''}` +
        `${item.selectedSize ? ` - Size: ${item.selectedSize}` : ''}`
    ).join(',\n');
  }, [cartItems]);

  const whatsappMessage = useMemo(() => {
    const message = `
Hello, I'd like to place an order.
*Customer Details:*
Name: ${name}
Mobile: ${mobile}
Address: ${address}
Email: ${email}
*Order Items:*
${itemsSummary}
*Summary:*
Subtotal: ${siteConfig.currency}${subtotal.toFixed(2)}
Shipping: ${siteConfig.currency}${shippingFee.toFixed(2)}
Total: ${siteConfig.currency}${total.toFixed(2)}
Payment Method: ${paymentMethod}
Thank you!
`;
    return encodeURIComponent(message.trim());
  }, [name, mobile, address, email, itemsSummary, subtotal, shippingFee, total, paymentMethod]);
  
  const subject = `New Order from ${name} - ${new Date().toLocaleDateString()}`;

  const gmailComposeLink = useMemo(() => {
    const body = `
New Order Received
Customer Details:
- Name: ${name}
- Email: ${email}
- Mobile: ${mobile}
- Address: ${address}
Order Items:
${itemsSummary}
Summary:
- Subtotal: ${siteConfig.currency}${subtotal.toFixed(2)}
- Shipping Fee: ${siteConfig.currency}${shippingFee.toFixed(2)}
- Total: ${siteConfig.currency}${total.toFixed(2)}
- Payment Method: ${paymentMethod}
`;
    return `https://mail.google.com/mail/?view=cm&fs=1&to=${siteConfig.checkout.contact.email}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }, [name, email, mobile, address, itemsSummary, subtotal, shippingFee, total, paymentMethod, subject]);

  const handlePlaceOrder = async () => {
    if (!isFormValid) {
        toast({
            title: "Incomplete Information",
            description: "Please fill out all the required fields.",
            variant: "destructive"
        });
        return;
    }

    setIsSubmitting(true);

    const orderId = `order_${Date.now()}`;
    const orderDate = new Date().toISOString();

    const orderDetails = {
        orderId,
        customer: { name, email, mobile, address },
        items: cartItems,
        summary: {
            subtotal,
            shippingFee,
            total,
            paymentMethod,
            paymentDetails: selectedPaymentMethodDetails?.details
        },
        orderDate,
    };

    try {
        // We still send the automated email as a reliable backup
        const response = await fetch('/api/send-order-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderDetails),
        });

        const result = await response.json();

        if (!response.ok) {
            // If email fails, we don't block the user, just log it.
            console.error("Automated email failed:", result.details || 'Something went wrong.');
        }

    } catch (error: any) {
        console.error("Failed to send automated email:", error);
    } finally {
        // Set a flag before redirecting away from our site
        sessionStorage.setItem('order_redirect', 'true');

        // Redirect in the same tab
        const preferWhatsapp = true; // or based on user choice
        if(preferWhatsapp) {
            window.location.href = `https://wa.me/${siteConfig.checkout.contact.whatsappNumber}?text=${whatsappMessage}`;
        } else {
             window.location.href = gmailComposeLink;
        }

        // The user will be redirected back and the useEffect at the top will handle the rest.
        // We don't set isSubmitting to false here as we are navigating away.
    }
  };
  
  if (isCartLoading) {
    return (
        <div className="container mx-auto px-4 py-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                 <div className="space-y-8">
                    <Card>
                        <CardHeader>
                            <Skeleton className="h-8 w-48" />
                            <Skeleton className="h-4 w-64" />
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-20" />
                                <Skeleton className="h-10 w-full" />
                            </div>
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-20" />
                                <Skeleton className="h-10 w-full" />
                            </div>
                             <div className="space-y-2">
                                <Skeleton className="h-4 w-20" />
                                <Skeleton className="h-10 w-full" />
                            </div>
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-20" />
                                <Skeleton className="h-10 w-full" />
                            </div>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader>
                            <Skeleton className="h-8 w-40" />
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <Skeleton className="h-8 w-40" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-12 w-full" />
                        </CardContent>
                    </Card>
                 </div>
                 <div className="lg:order-first">
                    <Card>
                        <CardHeader>
                            <Skeleton className="h-8 w-48" />
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {[...Array(2)].map((_, i) => (
                                <div key={i} className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <Skeleton className="h-16 w-16 rounded-md" />
                                        <div className="space-y-2">
                                            <Skeleton className="h-4 w-24" />
                                            <Skeleton className="h-4 w-16" />
                                        </div>
                                    </div>
                                    <Skeleton className="h-5 w-20" />
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                 </div>
            </div>
        </div>
    );
  }

  
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-headline font-bold text-center mb-8">Checkout</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="font-headline">Shipping Information</CardTitle>
                <CardDescription>Please provide your delivery details.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" name="name" placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" name="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="mobile">Mobile Number</Label>
                    <Input id="mobile" type="tel" name="mobile" placeholder="01xxxxxxxxx" value={mobile} onChange={(e) => setMobile(e.target.value)} required />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="address">Full Address</Label>
                    <Input id="address" name="address" placeholder="123 Main St, Anytown" value={address} onChange={(e) => setAddress(e.target.value)} required />
                </div>
              </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Delivery Location</CardTitle>
                </CardHeader>
                <CardContent>
                    <RadioGroup name="shipping_location" value={selectedShipping} onValueChange={(value) => handleShippingChange(value as ShippingOption)}>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="insideDhaka" id="insideDhaka" />
                            <Label htmlFor="insideDhaka">In Dhaka city ({siteConfig.currency}{siteConfig.checkout.shippingFee.insideDhaka})</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="outsideDhaka" id="outsideDhaka" />
                            <Label htmlFor="outsideDhaka">Out of Dhaka ({siteConfig.currency}{siteConfig.checkout.shippingFee.outsideDhaka})</Label>
                        </div>
                    </RadioGroup>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Payment Method</CardTitle>
                </CardHeader>
                <CardContent>
                    <RadioGroup name="payment_method" value={paymentMethod} onValueChange={setPaymentMethod}>
                        {siteConfig.checkout.paymentMethods.map(method => (
                            <div key={method.name} className="flex items-center space-x-2">
                                <RadioGroupItem value={method.name} id={method.name} />
                                <Label htmlFor={method.name}>{method.name}</Label>
                            </div>
                        ))}
                    </RadioGroup>
                </CardContent>
            </Card>
            
            {selectedPaymentMethodDetails && selectedPaymentMethodDetails.name !== 'CASH ON DELIVERY' && (
              <Alert>
                <Terminal className="h-4 w-4" />
                <AlertTitle>Advance Payment Instruction</AlertTitle>
                <AlertDescription>
                  <p className="mb-2">Please complete your payment quickly using the details below. We will confirm your order upon receiving the payment.</p>
                  <p><strong>Method:</strong> {selectedPaymentMethodDetails.name}</p>
                  <p><strong>Details:</strong> {selectedPaymentMethodDetails.details}</p>
                </AlertDescription>
              </Alert>
            )}

            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Place Your Order</CardTitle>
                    <CardDescription>Your cart total is {siteConfig.currency}{total.toFixed(2)}</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button onClick={handlePlaceOrder} size="lg" className="w-full" disabled={!isFormValid || isSubmitting}>
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Processing...
                            </>
                        ) : (
                            'Place Order Now'
                        )}
                    </Button>
                </CardContent>
                {!isFormValid && <CardContent><p className="text-sm text-center text-destructive">Please fill out all shipping information to place an order.</p></CardContent>}
            </Card>
        </div>
        <div className="lg:order-first">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {cartItems.map(item => (
                <div key={item.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="relative h-16 w-16 rounded-md overflow-hidden">
                      <Image src={item.image.src} alt={item.image.alt} data-ai-hint={item.image.hint} fill className="object-cover" />
                      <span className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">{item.quantity}</span>
                    </div>
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-muted-foreground">{siteConfig.currency}{item.price.toFixed(2)}</p>
                      {(item.selectedColor || item.selectedSize) && (
                          <p className="text-sm text-muted-foreground">
                              {item.selectedColor && `Color: ${item.selectedColor}`}
                              {item.selectedColor && item.selectedSize && ", "}
                              {item.selectedSize && `Size: ${item.selectedSize}`}
                          </p>
                      )}
                    </div>
                  </div>
                  <p className="font-medium">{siteConfig.currency}{(item.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-muted-foreground"><span>Subtotal</span><span>{siteConfig.currency}{subtotal.toFixed(2)}</span></div>
                <div className="flex justify-between text-muted-foreground"><span>Shipping Fee</span><span>{siteConfig.currency}{shippingFee.toFixed(2)}</span></div>
                <div className="flex justify-between font-bold text-lg"><span>Total</span><span>{siteConfig.currency}{total.toFixed(2)}</span></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

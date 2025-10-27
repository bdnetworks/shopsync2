
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
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import type { ShippingOption } from '@/lib/types';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal, Loader2 } from 'lucide-react';
import Link from 'next/link';

const WhatsAppIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="h-5 w-5"
    >
      <path
        d="M16.75 13.96c.25.13.43.2.5.28.08.09.14.19.19.3.05.11.06.23.02.35-.04.12-.13.24-.26.36-.13.12-.28.23-.46.33-.18.1-.38.16-.6.18-.21.02-.43.0-.65-.05-.22-.05-.44-.12-.66-.23-.22-.1-.43-.23-.64-.39-.21-.16-.41-.34-.6-.54s-.37-.42-.53-.65c-.16-.23-.3-.48-.43-.74-.12-.26-.23-.53-.32-.81-.09-.28-.15-.56-.19-.85-.04-.29-.04-.57-.01-.85.03-.28.1-.55.19-.81.1-.26.22-.5.37-.71.15-.21.32-.4.51-.56.2-.16.41-.3.65-.41.24-.11.49-.19.76-.23.27-.04.53-.05.79-.02.26.03.5.1.73.2.23.1.43.23.6.39.17.16.3.35.4.56.1.21.15.43.15.66.0.23-.05.45-.14.66-.09.21-.22.4-.38.56-.16.16-.35.3-.56.41-.21.11-.44.19-.68.24-.1.02-.19.03-.29.03-.1 0-.2-.02-.29-.05-.1-.03-.18-.06-.26-.11-.08-.05-.15-.1-.21-.16-.06-.06-.11-.13-.15-.21-.04-.08-.06-.16-.07-.25-.01-.09.01-.18.04-.26.04-.08.09-.16.15-.22.06-.06.13-.11.21-.15.08-.04.16-.06.25-.07.09-.01.18.01.26.04.08.03.16.08.22.14.03.03.05.05.06.07.01.02.03.04.04.06.01.02.02.04.03.06.01.02.01.04.01.06v.01c0 .02.01.03.01.03zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c1.73 0 3.36-.44 4.78-1.22l2.72 1.22-1.22-2.72C19.56 18.36 20 16.73 20 15c0-5.52-4.48-10-10-10zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"
      ></path>
    </svg>
);


export default function CheckoutPage() {
  const { cartItems, subtotal, total, clearCart, isCartLoading, shippingFee, setShippingOption } = useCart();
  const router = useRouter();
  const { toast } = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [address, setAddress] = useState('');
  const [selectedShipping, setSelectedShipping] = useState<ShippingOption>('insideDhaka');
  const [paymentMethod, setPaymentMethod] = useState(siteConfig.checkout.paymentMethods[0].name);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  useEffect(() => {
    setShippingOption(selectedShipping);
  }, [selectedShipping, setShippingOption]);

  useEffect(() => {
    if (!isCartLoading && cartItems.length === 0) {
      const orderDetails = sessionStorage.getItem('orderDetails');
      if (!orderDetails) {
        router.push('/products');
      }
    }
  }, [isCartLoading, cartItems.length, router]);
  
  const handleShippingChange = (value: ShippingOption) => {
    setSelectedShipping(value);
    setShippingOption(value);
  }

  const selectedPaymentMethodDetails = useMemo(() => {
    return siteConfig.checkout.paymentMethods.find(p => p.name === paymentMethod);
  }, [paymentMethod]);

  const whatsappOrderLink = useMemo(() => {
    const orderItems = cartItems.map(item => `${item.name} (Qty: ${item.quantity}) - ${siteConfig.currency}${(item.price * item.quantity).toFixed(2)}`).join('\n');
    const message = `Hello, I'd like to place an order.\n\n*Name:* ${name}\n*Email:* ${email}\n*Mobile:* ${mobile}\n*Address:* ${address}\n\n*Items:*\n${orderItems}\n\n*Subtotal:* ${siteConfig.currency}${subtotal.toFixed(2)}\n*Shipping:* ${siteConfig.currency}${shippingFee.toFixed(2)}\n*Total:* ${siteConfig.currency}${total.toFixed(2)}\n\n*Payment Method:* ${paymentMethod}`;
    return `https://wa.me/${siteConfig.checkout.contact.whatsappNumber}?text=${encodeURIComponent(message)}`;
  }, [name, email, mobile, address, cartItems, subtotal, shippingFee, total, paymentMethod]);

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPlacingOrder(true);

    const orderId = `SS-${Date.now()}`;
    const orderDetails = {
        orderId,
        customer: { name, email, mobile, address },
        items: cartItems,
        summary: {
            subtotal,
            shippingFee,
            total,
            paymentMethod,
            paymentDetails: selectedPaymentMethodDetails?.details,
        },
        orderDate: new Date().toISOString(),
    };

    try {
      // Send email
      const response = await fetch('/api/send-order-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderDetails),
      });

      if (!response.ok) {
        throw new Error('Failed to send order email.');
      }
      
      // Store details and redirect
      sessionStorage.setItem('orderDetails', JSON.stringify(orderDetails));
      router.push('/order-confirmation');
      clearCart();

    } catch (error) {
      console.error("Failed to place order:", error);
      toast({
        title: "Order Placement Failed",
        description: "We couldn't process your order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsPlacingOrder(false);
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


  const isFormValid = name && email && mobile && address && paymentMethod;
  
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-headline font-bold text-center mb-8">Checkout</h1>
      <form onSubmit={handlePlaceOrder}>
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
                      <CardDescription>Once your information is correct, you can place your order.</CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col sm:flex-row gap-4">
                      <Button type="submit" size="lg" className="w-full" disabled={!isFormValid || isPlacingOrder}>
                          {isPlacingOrder && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          {isPlacingOrder ? 'Placing Order...' : `Place Order - ${siteConfig.currency}${total.toFixed(2)}`}
                      </Button>
                      <Button asChild size="lg" className="w-full bg-green-600 hover:bg-green-700" variant="secondary" disabled={!isFormValid}>
                          <a href={whatsappOrderLink} target="_blank" rel="noopener noreferrer">
                              <WhatsAppIcon />
                            Order on WhatsApp
                          </a>
                      </Button>
                  </CardContent>
                  {!isFormValid && <CardContent><p className="text-sm text-center text-destructive">Please fill out all shipping and payment information to place an order.</p></CardContent>}
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
      </form>
    </div>
  );
}


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
import { Mail, Terminal } from 'lucide-react';

export default function CheckoutPage() {
  const { cartItems, subtotal, total, isCartLoading, shippingFee, setShippingOption, clearCart } = useCart();
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [address, setAddress] = useState('');
  const [selectedShipping, setSelectedShipping] = useState<ShippingOption>('insideDhaka');
  const [paymentMethod, setPaymentMethod] = useState(siteConfig.checkout.paymentMethods[0].name);
  
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

  const gmailComposeLink = useMemo(() => {
    if (!isFormValid) return '#';

    const adminEmail = siteConfig.checkout.contact.email;
    const subject = `Purchase Info from ${siteConfig.name}`;
    
    const orderItems = cartItems.map(item => 
      `${item.name}\n${siteConfig.currency}${item.price.toFixed(2)} x ${item.quantity}\n-------------------`
    ).join('\n');
    
    const body = `
Hi, I am interested in placing an order.

${orderItems}

*Name* : ${name} (${mobile})
*Email* : ${email}
*Payment Method* : ${paymentMethod}
*Shipping Address* : ${address}
-------------------
*Subtotal* : ${siteConfig.currency}${subtotal.toFixed(2)}
*Shipping Fee* : ${siteConfig.currency}${shippingFee.toFixed(2)}
*Total* : ${siteConfig.currency}${total.toFixed(2)}

via. ${typeof window !== 'undefined' ? window.location.origin : ''}
    `.trim();

    const params = new URLSearchParams({
      to: adminEmail,
      su: subject,
      body: body
    });

    return `https://mail.google.com/mail/?view=cm&fs=1&${params.toString()}`;
  }, [isFormValid, name, email, mobile, address, cartItems, subtotal, shippingFee, total, paymentMethod]);


  const handleOrderViaEmail = () => {
    if (!isFormValid || gmailComposeLink === '#') return;
    
    window.open(gmailComposeLink, '_blank');
    
    setTimeout(() => {
        clearCart();
        router.push('/order-confirmation');
    }, 1000);
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
      <form onSubmit={(e) => e.preventDefault()}>
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
                      <CardDescription>Click the button to open a pre-filled Gmail compose window to place your order.</CardDescription>
                  </CardHeader>
                  <CardContent>
                      <Button onClick={handleOrderViaEmail} size="lg" className="w-full" disabled={!isFormValid}>
                          <Mail />
                        Place Order via Email - {siteConfig.currency}{total.toFixed(2)}
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

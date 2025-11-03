
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useCart } from '@/context/cart-context';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { getSiteConfig, MergedSiteConfig } from '@/config/site';
import { Skeleton } from '@/components/ui/skeleton';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import type { ShippingOption, CartItem } from '@/lib/types';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, Terminal } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function CheckoutPage() {
  const { cartItems, subtotal, total, isCartLoading, shippingFee, setShippingOption, clearCart, discount, appliedCoupon } = useCart();
  const router = useRouter();
  const { toast } = useToast();
  const [siteConfig, setSiteConfig] = useState<MergedSiteConfig | null>(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [address, setAddress] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [selectedShipping, setSelectedShipping] = useState<ShippingOption>('insideDhaka');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  useEffect(() => {
    const fetchConfig = async () => {
      const config = await getSiteConfig();
      setSiteConfig(config);
      if (config.checkout.paymentMethods.length > 0) {
        setPaymentMethod(config.checkout.paymentMethods[0].name);
      }
    }
    fetchConfig();
  }, []);

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
  
  const selectedPaymentMethodDetails = siteConfig?.checkout.paymentMethods.find(method => method.name === paymentMethod);

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

    const orderId = `SHOPSYNC-${Date.now()}`;
    const orderDate = new Date().toISOString();
    
    // Format products for Google Sheet
    const productsString = cartItems.map(item => 
        `${item.name} (Qty: ${item.quantity}${item.selectedColor ? `, Color: ${item.selectedColor}`:''}${item.selectedSize ? `, Size: ${item.selectedSize}`:''})`
    ).join(' | ');

    // 1. Data for Google Sheet
    const orderForSheet = {
        OrderID: orderId,
        OrderDate: orderDate,
        CustomerName: name,
        CustomerEmail: email,
        CustomerMobile: mobile,
        PaymentMethod: paymentMethod,
        TransactionID: transactionId,
        ShippingFee: shippingFee,
        Address: address,
        ZipCode: zipCode,
        Products: productsString,
        Subtotal: subtotal,
        Discount: discount,
        Coupon: appliedCoupon?.couponCode || '',
        OrderTotal: total,
    };

    // 2. Data for Email & Confirmation Page
    const orderDetailsForConfirmation = {
      orderId: orderId,
      customer: { name, email, mobile, address },
      items: cartItems,
      summary: {
        subtotal,
        shippingFee,
        discount,
        total,
        paymentMethod,
        paymentDetails: selectedPaymentMethodDetails?.details,
        couponCode: appliedCoupon?.couponCode,
      },
      orderDate: orderDate,
    };

    try {
        // Attempt to send email, but don't block the order if it fails
        const emailResponse = await fetch('/api/send-order-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderDetailsForConfirmation)
        });

        if (!emailResponse.ok) {
            const emailResult = await emailResponse.json();
            console.error("Could not send order email:", emailResult.details);
            // Non-blocking: we can still proceed with the sheet update
        }

        // Proceed to add the order to Google Sheet
        const sheetResponse = await fetch('/api/add-to-sheet', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderForSheet)
        });
        
        if (!sheetResponse.ok) {
             const sheetResult = await sheetResponse.json();
             // This is a critical failure, so we throw an error
             throw new Error(sheetResult.details || 'Failed to add order to Google Sheet.');
        }

        // Success!
        toast({
            title: "Order Placed Successfully!",
            description: "Your order has been recorded. We'll be in touch shortly."
        });
        
        sessionStorage.setItem('lastOrderDetails', JSON.stringify(orderDetailsForConfirmation));

        clearCart();
        router.push(`/order-confirmation?orderId=${orderId}`);

    } catch (error: any) {
        console.error('Order submission error:', error);
        toast({
            title: "Order Failed",
            description: error.message || "We couldn't place your order. Please check the details or try again later.",
            variant: "destructive",
        });
    } finally {
        setIsSubmitting(false);
    }
  };
  
  if (isCartLoading || !siteConfig) {
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" name="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="mobile">Mobile Number</Label>
                        <Input id="mobile" type="tel" name="mobile" placeholder="01xxxxxxxxx" value={mobile} onChange={(e) => setMobile(e.target.value)} required />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="address">Full Address</Label>
                    <Input id="address" name="address" placeholder="123 Main St, Anytown" value={address} onChange={(e) => setAddress(e.target.value)} required />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="zipCode">Zip Code (Optional)</Label>
                    <Input id="zipCode" name="zipCode" placeholder="1212" value={zipCode} onChange={(e) => setZipCode(e.target.value)} />
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
                  <p className="mb-2">Please complete your payment using the details below. We will confirm your order upon receiving the payment.</p>
                  <p><strong>Method:</strong> {selectedPaymentMethodDetails.name}</p>
                  <p><strong>Details:</strong> {selectedPaymentMethodDetails.details}</p>
                   <div className="space-y-2 mt-4">
                        <Label htmlFor="transactionId">Transaction ID</Label>
                        <Input id="transactionId" name="transactionId" placeholder="Enter payment transaction ID" value={transactionId} onChange={(e) => setTransactionId(e.target.value)} />
                    </div>
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
                                Placing Order...
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
                {discount > 0 && (
                    <div className="flex justify-between text-green-600">
                        <span>Discount</span>
                        <span>-{siteConfig.currency}{discount.toFixed(2)}</span>
                    </div>
                )}
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

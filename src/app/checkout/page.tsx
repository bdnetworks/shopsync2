
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useCart } from '@/context/cart-context';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { siteConfig } from '@/config/site';
import { useToast } from '@/hooks/use-toast';
import { sendOrderEmail } from '@/ai/flows/send-order-email';

export default function CheckoutPage() {
  const { cartItems, subtotal, shippingFee, total, clearCart } = useCart();
  const router = useRouter();
  const { toast } = useToast();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (cartItems.length === 0 && typeof window !== 'undefined' && !isSubmitting) {
    router.push('/products');
    return null;
  }

  const generateOrderText = () => {
    let orderDetails = "New Order Request:\n\n";
    cartItems.forEach(item => {
      orderDetails += `${item.name} (x${item.quantity}) - ${siteConfig.currency}${(item.price * item.quantity).toFixed(2)}\n`;
    });
    orderDetails += `\nSubtotal: ${siteConfig.currency}${subtotal.toFixed(2)}`;
    orderDetails += `\nShipping: ${siteConfig.currency}${shippingFee.toFixed(2)}`;
    orderDetails += `\nTotal: ${siteConfig.currency}${total.toFixed(2)}`;
    orderDetails += `\n\nCustomer Details:`;
    orderDetails += `\nName: ${name}`;
    orderDetails += `\nPhone: ${phone}`;
    orderDetails += `\nAddress: ${address}`;
    return orderDetails;
  };

  const handleWhatsAppOrder = () => {
    const orderText = generateOrderText();
    const whatsappUrl = `https://wa.me/${siteConfig.checkout.contact.whatsappNumber}?text=${encodeURIComponent(orderText)}`;
    window.open(whatsappUrl, '_blank');
    setIsSubmitting(true);
    clearCart();
    router.push('/order-confirmation');
  };

  const handleEmailOrder = async () => {
    setIsSubmitting(true);
    try {
      await sendOrderEmail({
        customerDetails: { name, phone, address },
        cartDetails: {
          items: cartItems,
          subtotal,
          shipping: shippingFee,
          total,
        },
      });
      clearCart();
      router.push('/order-confirmation');
    } catch (error) {
      console.error("Failed to send order email", error);
      toast({
        title: "Error",
        description: "Failed to place order. Please try again.",
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  };

  const isFormValid = name && phone && address;

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
                    <Input id="name" placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)} disabled={isSubmitting} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" placeholder="+1 234 567 890" value={phone} onChange={(e) => setPhone(e.target.value)} disabled={isSubmitting}/>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="address">Full Address</Label>
                    <Input id="address" placeholder="123 Main St, Anytown, USA 12345" value={address} onChange={(e) => setAddress(e.target.value)} disabled={isSubmitting} />
                </div>
              </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Submission Method</CardTitle>
                    <CardDescription>Choose how you would like to place your order.</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Button onClick={handleWhatsAppOrder} size="lg" className="w-full" disabled={!isFormValid || isSubmitting}>
                        Order on WhatsApp
                    </Button>
                    <Button onClick={handleEmailOrder} variant="secondary" size="lg" className="w-full" disabled={!isFormValid || isSubmitting}>
                        {isSubmitting ? 'Placing Order...' : 'Order via Email'}
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
    </div>
  );
}

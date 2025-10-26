'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useCart } from '@/context/cart-context';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { CreditCard, Lock } from 'lucide-react';

const formSchema = z.object({
  email: z.string().email({ message: 'Invalid email address.' }),
  shipping: z.object({
    name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
    address: z.string().min(5, { message: 'Address must be at least 5 characters.' }),
    city: z.string().min(2, { message: 'City must be at least 2 characters.' }),
    zip: z.string().min(5, { message: 'ZIP code must be at least 5 characters.' }),
  }),
  paymentMethod: z.enum(['card']),
  card: z.object({
      number: z.string().regex(/^\d{4} \d{4} \d{4} \d{4}$/, "Invalid card number"),
      name: z.string().min(2, "Name on card is required"),
      expiry: z.string().regex(/^(0[1-9]|1[0-2])\s*\/\s*([0-9]{2})$/, "Invalid expiry date (MM/YY)"),
      cvc: z.string().regex(/^\d{3,4}$/, "Invalid CVC"),
  })
});

export default function CheckoutPage() {
  const { cartItems, cartTotal, clearCart } = useCart();
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      shipping: { name: '', address: '', city: '', zip: '' },
      paymentMethod: 'card',
      card: { number: '', name: '', expiry: '', cvc: '' },
    },
  });
  
  if (cartItems.length === 0 && typeof window !== 'undefined') {
    router.push('/products');
    return null;
  }

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log('Order submitted:', values);
    clearCart();
    router.push('/order-confirmation');
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-headline font-bold text-center mb-8">Checkout</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="font-headline">Contact & Shipping</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField control={form.control} name="email" render={({ field }) => (
                  <FormItem><FormLabel>Email Address</FormLabel><FormControl><Input placeholder="you@example.com" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="shipping.name" render={({ field }) => (
                  <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input placeholder="John Doe" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="shipping.address" render={({ field }) => (
                  <FormItem><FormLabel>Shipping Address</FormLabel><FormControl><Input placeholder="123 Main St" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="shipping.city" render={({ field }) => (
                    <FormItem><FormLabel>City</FormLabel><FormControl><Input placeholder="Anytown" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="shipping.zip" render={({ field }) => (
                    <FormItem><FormLabel>ZIP Code</FormLabel><FormControl><Input placeholder="12345" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="font-headline">Payment Information</CardTitle>
                <CardDescription>All transactions are secure and encrypted.</CardDescription>
              </CardHeader>
              <CardContent>
                <FormField control={form.control} name="paymentMethod" render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="grid grid-cols-1">
                          <Label htmlFor="card" className="flex flex-col items-start space-y-4 rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                            <div className="flex items-center justify-between w-full">
                                <div className="flex items-center space-x-3">
                                    <RadioGroupItem value="card" id="card" />
                                    <div className="font-medium">Credit Card</div>
                                </div>
                                <CreditCard className="h-6 w-6" />
                            </div>
                            <div className="space-y-4 w-full">
                                <FormField control={form.control} name="card.number" render={({ field }) => (
                                    <FormItem><FormLabel>Card Number</FormLabel><FormControl><Input placeholder="0000 0000 0000 0000" {...field} /></FormControl><FormMessage /></FormItem>
                                )}/>
                                <FormField control={form.control} name="card.name" render={({ field }) => (
                                    <FormItem><FormLabel>Name on Card</FormLabel><FormControl><Input placeholder="John M. Doe" {...field} /></FormControl><FormMessage /></FormItem>
                                )}/>
                                <div className="grid grid-cols-2 gap-4">
                                <FormField control={form.control} name="card.expiry" render={({ field }) => (
                                    <FormItem><FormLabel>Expiration (MM/YY)</FormLabel><FormControl><Input placeholder="MM / YY" {...field} /></FormControl><FormMessage /></FormItem>
                                )}/>
                                <FormField control={form.control} name="card.cvc" render={({ field }) => (
                                    <FormItem><FormLabel>CVC</FormLabel><FormControl><Input placeholder="123" {...field} /></FormControl><FormMessage /></FormItem>
                                )}/>
                                </div>
                            </div>
                          </Label>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </CardContent>
            </Card>

            <Button type="submit" size="lg" className="w-full">
                <Lock className="mr-2 h-4 w-4" />
                Pay ${cartTotal.toFixed(2)}
            </Button>
          </form>
        </Form>
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
                      <p className="text-sm text-muted-foreground">${item.price.toFixed(2)}</p>
                    </div>
                  </div>
                  <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-muted-foreground"><span>Subtotal</span><span>${cartTotal.toFixed(2)}</span></div>
                <div className="flex justify-between text-muted-foreground"><span>Shipping</span><span>$0.00</span></div>
                <div className="flex justify-between font-bold text-lg"><span>Total</span><span>${cartTotal.toFixed(2)}</span></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

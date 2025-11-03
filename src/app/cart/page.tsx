
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/context/cart-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Minus, Plus, ShoppingBag, Trash2, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getSiteConfig, MergedSiteConfig } from '@/config/site';

export default function CartPage() {
  const { cartItems, updateQuantity, removeFromCart, subtotal, shippingFee, total, itemCount, discount, appliedCoupon, applyCoupon, removeCoupon } = useCart();
  const [siteConfig, setSiteConfig] = useState<MergedSiteConfig | null>(null);
  const [couponCode, setCouponCode] = useState('');

  useEffect(() => {
    const fetchConfig = async () => {
      const config = await getSiteConfig();
      setSiteConfig(config);
    }
    fetchConfig();
  }, []);

  if (!siteConfig) {
      return <div>Loading...</div>
  }

  if (itemCount === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <ShoppingBag className="mx-auto h-24 w-24 text-muted-foreground" />
        <h1 className="mt-8 text-4xl font-headline font-bold">Your Cart is Empty</h1>
        <p className="mt-2 text-muted-foreground">Looks like you haven't added anything to your cart yet.</p>
        <Button asChild className="mt-6">
          <Link href="/products">Start Shopping</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-headline font-bold text-center mb-8">Your Shopping Cart</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-2/4">Product</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cartItems.map(item => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="flex items-center gap-4">
                          <div className="relative h-16 w-16 rounded-md overflow-hidden">
                            <Image
                              src={item.image.src}
                              alt={item.image.alt}
                              data-ai-hint={item.image.hint}
                              fill
                              className="object-cover"
                            />
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
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                           <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                          <Input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 1)}
                            className="h-8 w-14 text-center"
                            min="1"
                          />
                           <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {siteConfig.currency}{(item.price * item.quantity).toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeFromCart(item.id)}
                          aria-label={`Remove ${item.name} from cart`}
                        >
                          <Trash2 className="h-5 w-5 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
        
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
               {!appliedCoupon && (
                <div className="flex items-center gap-2">
                    <Input 
                        placeholder="Coupon code" 
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                    />
                    <Button onClick={() => applyCoupon(couponCode)}>Apply</Button>
                </div>
               )}
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{siteConfig.currency}{subtotal.toFixed(2)}</span>
              </div>
              {discount > 0 && appliedCoupon && (
                 <div className="flex justify-between text-green-600">
                    <div className="flex items-center gap-2">
                        <span>Discount ({appliedCoupon.couponCode})</span>
                        <button onClick={removeCoupon} aria-label="Remove coupon">
                            <XCircle className="h-4 w-4 text-destructive" />
                        </button>
                    </div>
                    <span>-{siteConfig.currency}{discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>{siteConfig.currency}{shippingFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg border-t pt-4">
                <span>Total</span>
                <span>{siteConfig.currency}{total.toFixed(2)}</span>
              </div>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full" size="lg">
                <Link href="/checkout">Proceed to Checkout</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}

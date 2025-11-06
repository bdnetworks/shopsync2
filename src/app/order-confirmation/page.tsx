
'use client';

import { Suspense, useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CheckCircle, Printer, ShoppingBag, Share2 } from "lucide-react";
import Link from "next/link";
import { Skeleton } from '@/components/ui/skeleton';
import type { CartItem } from '@/lib/types';
import { getSiteConfig, MergedSiteConfig } from '@/config/site';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';

interface OrderDetails {
    orderId: string;
    customer: {
        name: string;
        email: string;
        mobile: string;
        address: string;
    };
    items: CartItem[];
    summary: {
        subtotal: number;
        shippingFee: number;
        discount: number;
        total: number;
        paymentMethod: string;
        paymentDetails?: string;
        couponCode?: string;
    };
    orderDate: string;
}

function OrderConfirmationContent() {
    const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
    const [siteConfig, setSiteConfig] = useState<MergedSiteConfig | null>(null);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        const fetchConfig = async () => {
            const config = await getSiteConfig();
            setSiteConfig(config);
        }
        fetchConfig();

        const storedDetails = sessionStorage.getItem('lastOrderDetails');
        if (storedDetails) {
            try {
                setOrderDetails(JSON.parse(storedDetails));
            } catch (e) {
                console.error("Failed to parse order details", e);
            }
        }
        setLoading(false);
    }, []);

    const handlePrint = () => {
        window.print();
    };

    const handleShare = async () => {
        if (!orderDetails || !siteConfig) return;

        const shareText = `I just placed an order from ${siteConfig.name}!\nOrder ID: #${orderDetails.orderId}\nTotal: ${siteConfig.currency}${orderDetails.summary.total.toFixed(2)}`;
        
        if (navigator.share) {
            try {
                await navigator.share({
                    title: `My Order from ${siteConfig.name}`,
                    text: shareText,
                    url: window.location.href,
                });
            } catch (error) {
                console.error('Error sharing:', error);
                toast({
                    title: 'Could not share order',
                    description: 'There was an error trying to share your order details.',
                    variant: 'destructive',
                });
            }
        } else {
             try {
                await navigator.clipboard.writeText(shareText);
                toast({
                    title: 'Order Details Copied!',
                    description: 'Your order summary has been copied to the clipboard.',
                });
            } catch (error) {
                toast({
                    title: 'Could not copy details',
                    description: 'There was an error trying to copy the order details.',
                    variant: 'destructive',
                });
            }
        }
    };


    if (loading || !siteConfig) {
        return (
            <div className="container mx-auto px-4 py-16 flex items-center justify-center">
                 <Card className="w-full max-w-4xl">
                    <CardHeader className="text-center">
                        <Skeleton className="h-16 w-16 rounded-full mx-auto" />
                        <Skeleton className="h-8 w-64 mt-4 mx-auto" />
                        <Skeleton className="h-6 w-48 mt-2 mx-auto" />
                    </CardHeader>
                    <CardContent className="p-8">
                        <div className="grid md:grid-cols-2 gap-8">
                            <div>
                                <Skeleton className="h-6 w-32 mb-4" />
                                <Skeleton className="h-4 w-full mb-2" />
                                <Skeleton className="h-4 w-full mb-2" />
                                <Skeleton className="h-4 w-3/4" />
                            </div>
                             <div>
                                <Skeleton className="h-6 w-32 mb-4" />
                                <Skeleton className="h-4 w-full mb-2" />
                                <Skeleton className="h-4 w-3/4" />
                            </div>
                        </div>
                        <div className="mt-8">
                            <Skeleton className="h-8 w-48 mb-4" />
                             <div className="space-y-4">
                                {[...Array(2)].map((_, i) => (
                                    <div key={i} className="flex justify-between items-center">
                                        <div className="flex items-center gap-4">
                                            <Skeleton className="h-12 w-12" />
                                            <div>
                                                <Skeleton className="h-4 w-32" />
                                                <Skeleton className="h-3 w-24 mt-1" />
                                            </div>
                                        </div>
                                        <Skeleton className="h-4 w-20" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                 </Card>
            </div>
        );
    }
    
    if (!orderDetails) {
        return (
            <div className="container mx-auto px-4 py-16 text-center">
                <ShoppingBag className="mx-auto h-24 w-24 text-muted-foreground" />
                <h1 className="mt-8 text-4xl font-headline font-bold">No Order Details Found</h1>
                <p className="mt-2 text-muted-foreground">We couldn't find any recent order information.</p>
                <Button asChild className="mt-6">
                <Link href="/products">Continue Shopping</Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center gap-8">
             <div className="text-center no-print">
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
                <h1 className="text-3xl md:text-4xl font-headline font-bold mt-4">Thank You For Your Order!</h1>
                <p className="text-muted-foreground mt-2">Your order has been placed successfully. A summary is shown below.</p>
            </div>

            <Card className="w-full max-w-4xl" id="receipt">
                <CardHeader>
                    <div className="flex flex-col md:flex-row justify-between items-start">
                        <div>
                             <CardTitle className="text-2xl mb-1">Order #{orderDetails.orderId}</CardTitle>
                             <CardDescription>Date: {new Date(orderDetails.orderDate).toLocaleDateString()}</CardDescription>
                        </div>
                        <div className="text-lg font-bold font-headline mt-4 md:mt-0">
                           {siteConfig.name}
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-6 md:p-8">
                    <div className="grid md:grid-cols-2 gap-8 mb-8">
                        <div className="space-y-1">
                            <h3 className="font-semibold">Billed To:</h3>
                            <p>{orderDetails.customer.name}</p>
                            <p>{orderDetails.customer.email}</p>
                            <p>{orderDetails.customer.mobile}</p>
                            <p>{orderDetails.customer.address}</p>
                        </div>
                        <div className="space-y-1 md:text-right">
                             <h3 className="font-semibold">Payment Method:</h3>
                             <p>{orderDetails.summary.paymentMethod}</p>
                             {orderDetails.summary.paymentMethod !== 'CASH ON DELIVERY' && orderDetails.summary.paymentDetails && (
                                 <p className="text-sm text-muted-foreground">(Note: {orderDetails.summary.paymentDetails})</p>
                             )}
                        </div>
                    </div>

                    <div>
                        <h3 className="font-semibold mb-4 text-lg">Order Summary</h3>
                         <div className="border rounded-md">
                            <div className="grid grid-cols-[2fr_1fr_1fr] md:grid-cols-[3fr_1fr_1fr_1fr] gap-4 font-semibold bg-muted/50 p-4">
                                <span>Product</span>
                                <span className="hidden md:inline">Price</span>
                                <span className="text-center">Quantity</span>
                                <span className="text-right">Total</span>
                            </div>
                            {orderDetails.items.map(item => (
                                <div key={item.id} className="grid grid-cols-[2fr_1fr_1fr] md:grid-cols-[3fr_1fr_1fr_1fr] gap-4 items-center p-4 border-t">
                                    <div className="flex items-center gap-3">
                                        <Image src={item.image.src} alt={item.image.alt} width={40} height={40} className="rounded" />
                                        <div>
                                            <p className="font-medium">{item.name}</p>
                                            {(item.selectedColor || item.selectedSize) && (
                                                <p className="text-sm text-muted-foreground">
                                                    {item.selectedColor && `Color: ${item.selectedColor}`}
                                                    {item.selectedColor && item.selectedSize && ", "}
                                                    {item.selectedSize && `Size: ${item.selectedSize}`}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <span className="hidden md:inline">{siteConfig.currency}{item.price.toFixed(2)}</span>
                                    <span className="text-center">{item.quantity}</span>
                                    <span className="text-right font-medium">{siteConfig.currency}{(item.price * item.quantity).toFixed(2)}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="mt-8 flex justify-end">
                        <div className="w-full md:w-1/2 lg:w-1/3 space-y-2">
                             <div className="flex justify-between">
                                <span>Subtotal:</span>
                                <span>{siteConfig.currency}{orderDetails.summary.subtotal.toFixed(2)}</span>
                            </div>
                            {orderDetails.summary.discount > 0 && (
                                <div className="flex justify-between text-green-600">
                                    <span>Discount ({orderDetails.summary.couponCode}):</span>
                                    <span>-{siteConfig.currency}{orderDetails.summary.discount.toFixed(2)}</span>
                                </div>
                            )}
                             <div className="flex justify-between">
                                <span>Shipping:</span>
                                <span>{siteConfig.currency}{orderDetails.summary.shippingFee.toFixed(2)}</span>
                            </div>
                             <div className="flex justify-between font-bold text-lg border-t pt-2 mt-2">
                                <span>Total:</span>
                                <span>{siteConfig.currency}{orderDetails.summary.total.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="justify-center no-print">
                     <div className="flex items-center gap-4">
                        <Button onClick={handlePrint}><Printer className="mr-2 h-4 w-4" /> Print Receipt</Button>
                        <Button variant="outline" onClick={handleShare}><Share2 className="mr-2 h-4 w-4" /> Share Order</Button>
                        <Button asChild variant="secondary">
                            <Link href="/products">Continue Shopping</Link>
                        </Button>
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
}


export default function OrderConfirmationPage() {
    return (
        <Suspense fallback={
            <div className="container mx-auto px-4 py-16 flex items-center justify-center">
                 <Card className="w-full max-w-4xl">
                     <CardHeader className="text-center">
                        <Skeleton className="h-16 w-16 rounded-full mx-auto" />
                        <Skeleton className="h-8 w-64 mt-4 mx-auto" />
                    </CardHeader>
                    <CardContent>
                         <Skeleton className="h-40 w-full" />
                    </CardContent>
                </Card>
            </div>
        }>
            <OrderConfirmationContent />
        </Suspense>
    )
}

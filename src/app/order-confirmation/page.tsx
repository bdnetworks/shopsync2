
'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { siteConfig } from '@/config/site';
import { Printer, ShoppingBag } from 'lucide-react';
import Image from 'next/image';

interface OrderDetails {
    orderId: string;
    customer: {
        name: string;
        email: string;
        mobile: string;
        address: string;
    };
    items: {
        id: string;
        name: string;
        quantity: number;
        price: number;
        image: {
            src: string;
            alt: string;
        }
    }[];
    summary: {
        subtotal: number;
        shippingFee: number;
        total: number;
        paymentMethod: string;
        paymentDetails?: string;
    };
    orderDate: string;
}

export default function OrderConfirmationPage() {
    const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
    const router = useRouter();

    useEffect(() => {
        const storedDetails = sessionStorage.getItem('orderDetails');
        if (storedDetails) {
            setOrderDetails(JSON.parse(storedDetails));
        } else {
            router.push('/');
        }
    }, [router]);

    const handlePrint = () => {
        window.print();
    };

    if (!orderDetails) {
        return (
            <div className="container mx-auto px-4 py-16 text-center">
                <ShoppingBag className="mx-auto h-24 w-24 text-muted-foreground" />
                <h1 className="mt-8 text-4xl font-headline font-bold">No Order Found</h1>
                <p className="mt-2 text-muted-foreground">We couldn't find any order details.</p>
                <Button asChild className="mt-6">
                    <a href="/products">Continue Shopping</a>
                </Button>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-12">
            <style jsx global>{`
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    #print-section, #print-section * {
                        visibility: visible;
                    }
                    #print-section {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                    }
                    .no-print {
                        display: none;
                    }
                }
            `}</style>

            <div id="print-section">
                <Card className="w-full max-w-4xl mx-auto">
                    <CardHeader className="text-center border-b pb-4">
                        <CardTitle className="font-headline text-3xl">Thank You For Your Order!</CardTitle>
                        <CardDescription>Your order has been placed successfully.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
                            <div>
                                <h3 className="font-semibold mb-2">Shipping Address</h3>
                                <p>{orderDetails.customer.name}</p>
                                <p>{orderDetails.customer.address}</p>
                                <p>{orderDetails.customer.mobile}</p>
                                <p>{orderDetails.customer.email}</p>
                            </div>
                            <div className="text-left md:text-right">
                                <h3 className="font-semibold">Order ID: {orderDetails.orderId}</h3>
                                <p>Date: {new Date(orderDetails.orderDate).toLocaleDateString()}</p>
                            </div>
                        </div>

                        <div>
                            <h3 className="font-semibold mb-4 text-lg border-t pt-4">Order Items</h3>
                            <div className="space-y-4">
                                {orderDetails.items.map(item => (
                                    <div key={item.id} className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="relative h-16 w-16 rounded-md overflow-hidden border">
                                                <Image src={item.image.src} alt={item.image.alt} fill className="object-cover" />
                                            </div>
                                            <div>
                                                <p className="font-medium">{item.name}</p>
                                                <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                                            </div>
                                        </div>
                                        <p className="font-medium">{siteConfig.currency}{(item.price * item.quantity).toFixed(2)}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="border-t pt-4 mt-6 space-y-2">
                            <div className="flex justify-between text-muted-foreground"><span>Subtotal</span><span>{siteConfig.currency}{orderDetails.summary.subtotal.toFixed(2)}</span></div>
                            <div className="flex justify-between text-muted-foreground"><span>Shipping Fee</span><span>{siteConfig.currency}{orderDetails.summary.shippingFee.toFixed(2)}</span></div>
                            <div className="flex justify-between font-bold text-lg"><span>Total</span><span>{siteConfig.currency}{orderDetails.summary.total.toFixed(2)}</span></div>
                        </div>

                        <div className="border-t pt-4 mt-6">
                            <h3 className="font-semibold mb-2">Payment Information</h3>
                            <p><span className="font-medium">Method:</span> {orderDetails.summary.paymentMethod}</p>
                             {orderDetails.summary.paymentMethod !== 'CASH ON DELIVERY' && (
                                <div className="mt-2 p-4 bg-muted/50 rounded-lg">
                                    <h4 className="font-semibold text-primary">Payment Instructions</h4>
                                    <p className="text-sm">{orderDetails.summary.paymentDetails}</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
            
            <div className="mt-8 text-center no-print">
                <Button onClick={handlePrint} className="mr-4">
                    <Printer className="mr-2 h-4 w-4" />
                    Print Order
                </Button>
                <Button asChild variant="outline">
                    <a href="/products">Continue Shopping</a>
                </Button>
            </div>
        </div>
    );
}


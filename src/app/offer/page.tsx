
'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { getOffers } from '@/lib/products';
import { useToast } from '@/hooks/use-toast';
import { Copy } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import type { Offer } from '@/lib/types';

function OfferPageSkeleton() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center">
        <Skeleton className="h-12 w-1/2 mx-auto" />
        <Skeleton className="h-6 w-3/4 mt-4 mx-auto" />
      </div>
      <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="flex flex-col overflow-hidden">
            <Skeleton className="aspect-video w-full" />
            <CardHeader>
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-16 w-full mt-2" />
            </CardHeader>
            <CardFooter className="mt-auto">
              <Skeleton className="h-20 w-full" />
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}


export default function OfferPage() {
  const { toast } = useToast();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOffers = async () => {
      setLoading(true);
      const fetchedOffers = await getOffers();
      setOffers(fetchedOffers);
      setLoading(false);
    }
    fetchOffers();
  }, []);


  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code).then(() => {
      toast({
        title: 'Coupon Code Copied!',
        description: `Code "${code}" has been copied to your clipboard.`,
      });
    }, (err) => {
      toast({
        title: 'Failed to copy',
        description: 'Could not copy the code to your clipboard.',
        variant: 'destructive',
      });
      console.error('Could not copy text: ', err);
    });
  };
  
  if (loading) {
    return <OfferPageSkeleton />;
  }

  return (
    <div className="bg-background">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-headline font-bold">Special Offers</h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
            Don't miss out on our exclusive deals and discounts. Grab them while they last!
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {offers.map((offer) => (
            <Card key={offer.id} className="flex flex-col overflow-hidden shadow-lg transition-transform hover:-translate-y-1">
              <div className="relative aspect-video w-full">
                <Image
                  src={offer.imageUrl}
                  alt={offer.title}
                  data-ai-hint={offer.imageHint}
                  fill
                  className="object-cover"
                />
              </div>
              <CardHeader>
                <CardTitle className="font-headline">{offer.title}</CardTitle>
                <CardDescription className="h-20 overflow-hidden">{offer.description}</CardDescription>
              </CardHeader>
              <CardFooter className="mt-auto">
                <div className="w-full flex items-center justify-center p-3 border-2 border-dashed border-primary rounded-lg bg-primary/10">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Use Code:</p>
                    <p className="text-2xl font-bold tracking-widest text-primary">{offer.couponCode}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="ml-auto"
                    onClick={() => handleCopyCode(offer.couponCode)}
                    aria-label={`Copy coupon code ${offer.couponCode}`}
                  >
                    <Copy className="h-5 w-5" />
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

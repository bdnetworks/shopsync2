
'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent }from "@/components/ui/dialog"
import { useQuickView } from '@/context/quick-view-context';
import { useCart } from '@/context/cart-context';
import Image from 'next/image';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Minus, Plus, ShoppingCart } from 'lucide-react';
import { siteConfig } from '@/config/site';
import { useToast } from '@/hooks/use-toast';
import { Product } from '@/lib/types';
import { Drawer, DrawerContent } from '@/components/ui/drawer';
import { useIsMobile } from '@/hooks/use-mobile';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';


function QuickViewContent({ product }: { product: Product }) {
  const { addToCart } = useCart();
  const { closeQuickView } = useQuickView();
  const { toast } = useToast();

  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState<string | undefined>(undefined);
  const [selectedSize, setSelectedSize] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (product) {
      setQuantity(1);
      setSelectedColor(product.colors && product.colors.length > 0 ? product.colors[0] : undefined);
      setSelectedSize(product.sizes && product.sizes.length > 0 ? product.sizes[0] : undefined);
    }
  }, [product]);

   if (!product) {
    return null;
  }

  const handleAddToCart = () => {
    if (product.colors && product.colors.length > 0 && !selectedColor) {
        toast({ title: "Please select a color", variant: 'destructive' });
        return;
    }
    if (product.sizes && product.sizes.length > 0 && !selectedSize) {
        toast({ title: "Please select a size", variant: 'destructive' });
        return;
    }
    addToCart(product, quantity, selectedColor, selectedSize);
    closeQuickView();
  };

  return (
     <div className="grid grid-cols-[100px_1fr] md:grid-cols-2 p-4 gap-4">
          <div className="p-0">
            <div className="aspect-square relative w-full rounded-lg overflow-hidden">
              <Image
                src={product.image.src}
                alt={product.image.alt}
                data-ai-hint={product.image.hint}
                fill
                className="object-contain"
              />
            </div>
          </div>
          <div className="p-0 flex flex-col">
            <h2 className="text-lg font-bold font-headline mb-1 leading-tight">{product.name}</h2>
            <p className="text-lg font-bold text-primary mb-2">{siteConfig.currency}{product.price.toFixed(2)}</p>
            
            <div className="space-y-3">
              {product.colors && product.colors.length > 0 && (
                <div>
                  <Label className="text-xs font-medium">Color</Label>
                   <Select value={selectedColor} onValueChange={setSelectedColor}>
                        <SelectTrigger className="w-full h-8 mt-1">
                            <SelectValue placeholder="Select a color" />
                        </SelectTrigger>
                        <SelectContent>
                            {product.colors.map(color => (
                                <SelectItem key={color} value={color}>
                                    <div className="flex items-center gap-2">
                                        <div className="h-4 w-4 rounded-full" style={{ backgroundColor: color.toLowerCase() }}/>
                                        {color}
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
              )}

              {product.sizes && product.sizes.length > 0 && (
                <div>
                  <Label className="text-xs font-medium">Size</Label>
                  <div className="flex items-center gap-2 mt-1">
                    {product.sizes.map(size => (
                      <Button
                        key={size}
                        variant={selectedSize === size ? 'default' : 'outline'}
                        size="sm"
                        className="w-8 h-8 text-xs"
                        onClick={() => setSelectedSize(size)}
                      >
                        {size}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <Label className="text-xs font-medium">Quantity</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <Input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                    className="h-8 w-12 text-center text-md font-bold"
                    min="1"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setQuantity(q => q + 1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="mt-auto pt-3">
              <Button size="default" className="w-full h-9" onClick={handleAddToCart}>
                <ShoppingCart className="mr-2 h-4 w-4" />
                Add to Cart
              </Button>
            </div>
          </div>
        </div>
  );
}


export default function QuickViewModal() {
  const { product, isOpen, closeQuickView } = useQuickView();
  const isMobile = useIsMobile();

  if (!product) {
    return null;
  }
  
  if (isMobile) {
    return (
        <Drawer open={isOpen} onOpenChange={(open) => !open && closeQuickView()}>
            <DrawerContent>
                 <QuickViewContent product={product} />
            </DrawerContent>
        </Drawer>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeQuickView()}>
      <DialogContent className="sm:max-w-md p-0">
       <QuickViewContent product={product} />
      </DialogContent>
    </Dialog>
  );
}

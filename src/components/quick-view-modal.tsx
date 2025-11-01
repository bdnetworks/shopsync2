
'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useQuickView } from '@/context/quick-view-context';
import { useCart } from '@/context/cart-context';
import Image from 'next/image';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Input } from './ui/input';
import { Minus, Plus, ShoppingCart } from 'lucide-react';
import { siteConfig } from '@/config/site';
import { useToast } from '@/hooks/use-toast';
import { Product } from '@/lib/types';

export default function QuickViewModal() {
  const { product, isOpen, closeQuickView } = useQuickView();
  const { addToCart } = useCart();
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
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeQuickView()}>
      <DialogContent className="sm:max-w-3xl p-0">
        <div className="grid grid-cols-1 md:grid-cols-2">
          <div className="p-4 md:p-6">
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
          <div className="p-4 md:p-6 flex flex-col">
            <h2 className="text-xl font-bold font-headline mb-2">{product.name}</h2>
            <p className="text-xl font-bold text-primary mb-4">{siteConfig.currency}{product.price.toFixed(2)}</p>
            
            <div className="space-y-4">
              {product.colors && product.colors.length > 0 && (
                <div>
                  <Label className="text-sm font-medium">Color</Label>
                  <RadioGroup value={selectedColor} onValueChange={setSelectedColor} className="flex items-center gap-2 mt-1">
                    {product.colors.map(color => (
                      <RadioGroupItem
                        key={color}
                        value={color}
                        id={`quick-view-color-${color}`}
                        className="h-7 w-7 border-2"
                        style={{ backgroundColor: color.toLowerCase(), borderColor: color.toLowerCase() }}
                      />
                    ))}
                  </RadioGroup>
                </div>
              )}

              {product.sizes && product.sizes.length > 0 && (
                <div>
                  <Label className="text-sm font-medium">Size</Label>
                  <div className="flex items-center gap-2 mt-1">
                    {product.sizes.map(size => (
                      <Button
                        key={size}
                        variant={selectedSize === size ? 'default' : 'outline'}
                        size="sm"
                        className="w-9 h-9"
                        onClick={() => setSelectedSize(size)}
                      >
                        {size}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <Label className="text-sm font-medium">Quantity</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-9 w-9"
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <Input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                    className="h-9 w-16 text-center text-md font-bold"
                    min="1"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-9 w-9"
                    onClick={() => setQuantity(q => q + 1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="mt-auto pt-4">
              <Button size="lg" className="w-full" onClick={handleAddToCart}>
                <ShoppingCart className="mr-2 h-4 w-4" />
                Add to Cart
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

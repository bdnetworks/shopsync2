
'use client';

import { Suspense, useEffect, useState } from 'react';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { getProductById, getProducts } from '@/lib/products';
import { useCart } from '@/context/cart-context';
import { ShoppingCart, CheckCircle, Heart, Share2, Minus, Plus } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Product } from '@/lib/types';
import { getSiteConfig, MergedSiteConfig } from '@/config/site';
import { useWishlist } from '@/context/wishlist-context';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DisqusComments from '@/components/disqus-comments';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import ProductCard from '@/components/product-card';
import { Input } from '@/components/ui/input';

function ProductDetail({ params }: { params: { id: string } }) {
    const { addToCart } = useCart();
    const { isWishlisted, toggleWishlist } = useWishlist();
    const [product, setProduct] = useState<Product | null | undefined>(null);
    const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
    const [quantity, setQuantity] = useState(1);
    const [selectedColor, setSelectedColor] = useState<string | undefined>(undefined);
    const [selectedSize, setSelectedSize] = useState<string | undefined>(undefined);
    const [siteConfig, setSiteConfig] = useState<MergedSiteConfig | null>(null);
    const { toast } = useToast();

    useEffect(() => {
        const fetchConfig = async () => {
            const config = await getSiteConfig();
            setSiteConfig(config);
        };
        fetchConfig();
        
        const findProduct = async () => {
            const foundProduct = await getProductById(params.id);
            setProduct(foundProduct);

            if (foundProduct) {
                if (foundProduct.colors && foundProduct.colors.length > 0) {
                    setSelectedColor(foundProduct.colors[0]);
                }
                if (foundProduct.sizes && foundProduct.sizes.length > 0) {
                    setSelectedSize(foundProduct.sizes[0]);
                }

                const allProducts = await getProducts();
                const related = allProducts
                    .filter(p => p.category === foundProduct.category && p.id !== foundProduct.id)
                    .slice(0, 4);
                setRelatedProducts(related);
            }
        }
        findProduct();
    }, [params.id]);
    
    useEffect(() => {
        if (product) {
            if (product.colors && product.colors.length > 0 && !selectedColor) {
                setSelectedColor(product.colors[0]);
            }
            if (product.sizes && product.sizes.length > 0 && !selectedSize) {
                setSelectedSize(product.sizes[0]);
            }
        }
    }, [product, selectedColor, selectedSize]);

    const handleShare = async () => {
        if (navigator.share && product) {
            try {
                await navigator.share({
                    title: product.name,
                    text: `Check out this product: ${product.name}`,
                    url: window.location.href,
                });
            } catch (error) {
                toast({
                    title: 'Could not share',
                    description: 'There was an error trying to share this product.',
                    variant: 'destructive',
                });
            }
        } else {
            try {
                await navigator.clipboard.writeText(window.location.href);
                toast({
                    title: 'Link Copied!',
                    description: 'Product link copied to your clipboard.',
                });
            } catch (error) {
                toast({
                    title: 'Could not copy link',
                    description: 'There was an error trying to copy the product link.',
                    variant: 'destructive',
                });
            }
        }
    };


    if (product === undefined) {
        notFound();
    }
    
    if (product === null || !siteConfig) {
        return <ProductDetailSkeleton />;
    }
    
    const isInWishlist = isWishlisted(product.id);
    
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
    }

    return (
        <div className="container mx-auto px-4 py-12">
            <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
                <div>
                    <Card className="group">
                        <CardContent className="p-4">
                            <div className="aspect-square relative w-full rounded-lg overflow-hidden">
                                <Image
                                    src={product.image.src}
                                    alt={product.image.alt}
                                    data-ai-hint={product.image.hint}
                                    fill
                                    className="object-contain transition-transform duration-500 group-hover:scale-110"
                                    priority
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>
                <div className="flex flex-col">
                    <h1 className="text-3xl lg:text-4xl font-headline font-bold mb-4">{product.name}</h1>
                    
                    <div className="flex items-center justify-between mb-4 p-4 bg-muted/50 rounded-lg">
                        <span className="text-3xl font-bold text-primary">{siteConfig.currency}{product.price.toFixed(2)}</span>
                        <div className="flex items-center gap-2 text-sm font-medium text-green-600">
                            <CheckCircle className="h-5 w-5" />
                            <span>In Stock</span>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {product.colors && product.colors.length > 0 && (
                            <div>
                                <Label className="text-sm font-medium">Color</Label>
                                <RadioGroup value={selectedColor} onValueChange={setSelectedColor} className="flex items-center gap-2 mt-2">
                                    {product.colors.map(color => (
                                        <RadioGroupItem 
                                            key={color} 
                                            value={color} 
                                            id={`color-${color}`}
                                            className="h-8 w-8 border-2"
                                            style={{ backgroundColor: color.toLowerCase(), borderColor: color.toLowerCase() }}
                                        />
                                    ))}
                                </RadioGroup>
                            </div>
                        )}

                        {product.sizes && product.sizes.length > 0 && (
                            <div>
                                <Label className="text-sm font-medium">Size</Label>
                                <div className="flex items-center gap-2 mt-2">
                                    {product.sizes.map(size => (
                                        <Button 
                                            key={size} 
                                            variant={selectedSize === size ? 'default' : 'outline'} 
                                            size="sm" 
                                            className="w-10 h-10"
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
                             <div className="flex items-center gap-2 mt-2">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-10 w-10"
                                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                >
                                    <Minus className="h-4 w-4" />
                                </Button>
                                <Input
                                    type="number"
                                    value={quantity}
                                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                                    className="h-10 w-20 text-center text-lg font-bold"
                                    min="1"
                                />
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-10 w-10"
                                    onClick={() => setQuantity(q => q + 1)}
                                >
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                    
                    <div className="mt-8 grid grid-cols-1 gap-4">
                        <Button size="lg" onClick={handleAddToCart}>
                            <ShoppingCart className="mr-2 h-5 w-5" />
                            Add to Cart
                        </Button>
                        <div className="grid grid-cols-2 gap-4">
                            <Button size="lg" variant="outline" onClick={() => toggleWishlist(product)}>
                                <Heart className={cn("mr-2 h-5 w-5", isInWishlist && "fill-current text-red-500")} />
                                {isInWishlist ? 'In Wishlist' : 'Wishlist'}
                            </Button>
                            <Button size="lg" variant="outline" onClick={handleShare}>
                                <Share2 className="mr-2 h-5 w-5" />
                                Share
                            </Button>
                        </div>
                    </div>

                    <div className="mt-8 space-y-2 text-sm text-muted-foreground">
                        <p><span className="font-semibold text-foreground">Category:</span> {product.category}</p>
                        {product.unit && <p><span className="font-semibold text-foreground">Unit:</span> {product.unit}</p>}
                    </div>
                </div>
            </div>
            <div className="mt-12">
                <Tabs defaultValue="description" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="description">Description</TabsTrigger>
                        <TabsTrigger value="reviews">Reviews & Comments</TabsTrigger>
                    </TabsList>
                    <TabsContent value="description" className="mt-4 p-4 border rounded-md">
                         <p className="text-muted-foreground text-lg leading-relaxed">{product.description}</p>
                    </TabsContent>
                    <TabsContent value="reviews" className="mt-4 p-4 border rounded-md">
                        <DisqusComments 
                            shortname="bdthemex" 
                            identifier={product.id}
                            title={product.name}
                        />
                    </TabsContent>
                </Tabs>
            </div>
            
            {relatedProducts.length > 0 && (
                <div className="mt-16">
                    <h2 className="text-2xl font-bold text-center mb-8">Related Products</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {relatedProducts.map(relatedProduct => (
                            <ProductCard key={relatedProduct.id} product={relatedProduct} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}


export default function ProductDetailPage({ params }: { params: { id: string } }) {
    return (
        <Suspense fallback={<ProductDetailSkeleton />}>
            <ProductDetail params={params} />
        </Suspense>
    )
}

function ProductDetailSkeleton() {
    return (
        <div className="container mx-auto px-4 py-12">
            <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
                <div>
                    <Card>
                        <CardContent className="p-4">
                            <Skeleton className="aspect-square w-full rounded-lg" />
                        </CardContent>
                    </Card>
                </div>
                <div className="flex flex-col justify-center space-y-6">
                    <Skeleton className="h-12 w-3/4" />
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-6 w-4/5" />
                    <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                        <Skeleton className="h-10 w-1/3" />
                        <Skeleton className="h-6 w-1/4" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <Skeleton className="h-12 w-full" />
                      <Skeleton className="h-12 w-full" />
                      <Skeleton className="h-12 w-full col-span-2" />
                    </div>
                </div>
            </div>
        </div>
    )
}

import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";

export default function AboutPage() {
  const aboutImage = PlaceHolderImages.find(p => p.id === 'hero-1');

  return (
    <div className="bg-background">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-headline font-bold">About ShopSync</h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
            Our mission is to bring you the best products from across the web, all in one place.
          </p>
        </div>

        <div className="mt-12 max-w-4xl mx-auto">
          {aboutImage && (
            <div className="aspect-video relative w-full rounded-lg overflow-hidden shadow-lg">
                <Image
                  src={aboutImage.imageUrl}
                  alt={aboutImage.description}
                  data-ai-hint={aboutImage.imageHint}
                  fill
                  className="object-cover"
                />
            </div>
          )}
        </div>
        
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-12 text-lg leading-relaxed">
            <div className="space-y-4">
                <h2 className="font-headline text-2xl font-semibold">Our Story</h2>
                <p>ShopSync was born from a simple idea: shopping online should be easy and inspiring. We were tired of browsing endless websites to find what we wanted. We envisioned a single destination where the best, most interesting products are curated and presented beautifully.</p>
                <p>We are a team of passionate curators, designers, and developers dedicated to making your shopping experience seamless and enjoyable. We don't sell products directly; instead, we act as your trusted guide, syncing you with amazing items from various online stores.</p>
            </div>
            <div className="space-y-4">
                <h2 className="font-headline text-2xl font-semibold">Our Philosophy</h2>
                <p>We believe in quality over quantity. Every product featured on ShopSync is handpicked for its design, craftsmanship, and value. We look for items that tell a story and bring joy to everyday life.</p>
                <p>Our platform is designed to be clean, fast, and responsive, ensuring you have a perfect experience whether you're on your desktop or on the go. Transparency is key, so we make it clear where each product comes from, allowing you to shop with confidence.</p>
            </div>
        </div>
      </div>
    </div>
  );
}

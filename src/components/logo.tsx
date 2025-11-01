import Image from "next/image";
import { siteConfig } from "@/config/site";

export default function Logo() {
  if (siteConfig.logoType === 'image' && siteConfig.logoImageUrl) {
    return (
      <div className="flex items-center">
        <Image 
            src={siteConfig.logoImageUrl} 
            alt={`${siteConfig.name} logo`}
            width={120}
            height={40}
            className="object-contain"
        />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="font-headline text-3xl font-bold text-primary">{siteConfig.name}</span>
    </div>
  );
}

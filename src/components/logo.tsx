
'use client';
import Image from "next/image";
import { useEffect, useState } from "react";
import { getSiteConfig, MergedSiteConfig } from "@/config/site";
import { Skeleton } from "./ui/skeleton";

export default function Logo() {
  const [siteConfig, setSiteConfig] = useState<MergedSiteConfig | null>(null);

  useEffect(() => {
    const fetchConfig = async () => {
      const config = await getSiteConfig();
      setSiteConfig(config);
    }
    fetchConfig();
  }, []);

  if (!siteConfig) {
    return <Skeleton className="h-8 w-24" />
  }

  // Corrected Logic: Only render Image if logoType is 'image' AND logoImageUrl is not empty.
  if (siteConfig.logoType === 'image' && siteConfig.logoImageUrl) {
    return (
      <div className="flex items-center">
        <Image 
            src={siteConfig.logoImageUrl} 
            alt={`${siteConfig.name} logo`}
            width={120}
            height={40}
            className="object-contain"
            priority
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

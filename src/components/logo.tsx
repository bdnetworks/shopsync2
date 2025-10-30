import { siteConfig } from "@/config/site";

export default function Logo() {
  return (
    <div className="flex items-center gap-2">
      <span className="font-headline text-3xl font-bold text-primary">{siteConfig.name}</span>
    </div>
  );
}

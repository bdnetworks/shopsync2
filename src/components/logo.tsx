import { siteConfig } from "@/config/site";
import { getIcon } from "@/lib/icons";

export default function Logo() {
  const Icon = getIcon(siteConfig.logoIcon);
  return (
    <div className="flex items-center gap-2">
      {Icon && <Icon className="h-7 w-7 text-primary" />}
      <span className="font-headline text-2xl font-bold">{siteConfig.name}</span>
    </div>
  );
}

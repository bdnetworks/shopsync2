import { ShoppingBag } from "lucide-react";

export default function Logo() {
  return (
    <div className="flex items-center gap-2">
      <ShoppingBag className="h-6 w-6 text-primary" />
      <span className="font-headline text-xl font-bold">ShopSync</span>
    </div>
  );
}

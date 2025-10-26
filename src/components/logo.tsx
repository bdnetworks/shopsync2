import { ShoppingBag } from "lucide-react";

export default function Logo() {
  return (
    <div className="flex items-center gap-2">
      <ShoppingBag className="h-7 w-7 text-primary" />
      <span className="font-headline text-2xl font-bold">RYANS</span>
    </div>
  );
}

"use client";

import Image from "next/image";
import { toast } from "sonner";
import { ShoppingCart } from "lucide-react";
import type { Product } from "@/core/products";
import { Button } from "@/shared/components/atoms/button";
import { Dialog, DialogContent } from "@/shared/components/atoms/dialog";
import { useCart } from "@/shared/lib/cart-store";
import { formatPrice } from "@/shared/lib/format";
import { cn } from "@/shared/lib/utils";

export function ProductDetailsDialog({
  product,
  open,
  onOpenChange,
}: {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const add = useCart((c) => c.add);

  if (!product) return null;

  function handleAdd() {
    if (!product) return;
    add({
      productId: product.id,
      name: product.name,
      price: product.price,
      unit: product.unit,
      emoji: product.emoji,
      gradient: product.gradient,
      quantity: 1,
      imageUrl: product.imageUrl,
    });
    toast.success(`${product.name} añadido`);
    onOpenChange(false);
  }

  const disabled = !product.isAvailable;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="flex max-h-[92vh] w-[calc(100%-1.5rem)] max-w-md flex-col gap-0 overflow-hidden rounded-2xl bg-card p-0 sm:max-w-md"
        showCloseButton
      >
        <div
          className={cn(
            "relative aspect-[4/3] w-full overflow-hidden bg-gradient-to-br from-neutral-800 to-neutral-900",
            product.gradient && `bg-gradient-to-br ${product.gradient}`,
          )}
        >
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              sizes="(min-width: 640px) 448px, 100vw"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-8xl">
              {product.emoji || "🛒"}
            </div>
          )}

          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"
          />

          <span className="absolute left-3 top-3 rounded-lg border border-primary/40 bg-primary/30 px-2.5 py-1 text-sm font-bold text-white shadow-md backdrop-blur-md">
            {formatPrice(product.price)}
          </span>

          {disabled && (
            <span className="absolute right-3 top-3 rounded-full bg-rose-500 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-white shadow-md">
              Agotado
            </span>
          )}
        </div>

        <div className="flex flex-col gap-4 p-5 sm:p-6">
          <div className="flex flex-col gap-1">
            <h2 className="text-xl font-semibold leading-tight sm:text-2xl">
              {product.name}
            </h2>
            <p className="text-[11px] uppercase tracking-widest text-muted-foreground">
              {product.unit}
            </p>
          </div>

          {product.description ? (
            <p className="text-sm leading-relaxed text-muted-foreground">
              {product.description}
            </p>
          ) : (
            <p className="text-sm italic text-muted-foreground/70">
              Sin descripción.
            </p>
          )}

          <div className="flex items-center justify-between gap-3 border-t pt-4">
            <div className="flex flex-col">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                Precio
              </span>
              <span className="text-2xl font-bold text-primary">
                {formatPrice(product.price)}
              </span>
            </div>
            <Button
              type="button"
              onClick={handleAdd}
              disabled={disabled}
              className="h-11 gap-2 rounded-full px-5 text-sm font-semibold shadow-lg shadow-primary/25"
            >
              <ShoppingCart className="h-4 w-4" aria-hidden />
              {disabled ? "Agotado" : "Añadir"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

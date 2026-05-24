"use client";

import { useState } from "react";
import { Minus, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useCart } from "@/lib/cart-store";
import { useToast } from "@/lib/toast-store";
import type { Product } from "@mercabana/core";
import { formatPrice, pricePerKg } from "@/lib/format";
import { cn } from "@/lib/utils";

export function ProductCard({ product }: { product: Product }) {
  const add = useCart((s) => s.add);
  const setQuantity = useCart((s) => s.setQuantity);
  const items = useCart((s) => s.items);
  const showToast = useToast((s) => s.show);
  const inCart = items.find((i) => i.productId === product.id);
  const [pulse, setPulse] = useState(false);
  const perKg = pricePerKg(product.unit, product.price);

  function handleAdd() {
    if (!product.isAvailable) return;
    add(product);
    showToast(`Añadido: ${product.name}`);
    setPulse(true);
    setTimeout(() => setPulse(false), 200);
  }

  function handleDecrement() {
    if (!inCart) return;
    setQuantity(product.id, inCart.quantity - 1);
  }

  return (
    <Card
      className={cn(
        "group relative gap-0 overflow-hidden p-0 transition",
        product.isAvailable
          ? "hover:border-primary/30 hover:shadow-md"
          : "opacity-70",
      )}
    >
      <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden bg-muted">
        {product.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.imageUrl}
            alt={product.name}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
            loading="lazy"
          />
        ) : (
          <span
            className="text-6xl opacity-90 transition duration-500 group-hover:scale-110"
            aria-hidden
          >
            {product.emoji}
          </span>
        )}
        {product.isHighlighted && product.isAvailable && (
          <Badge className="absolute left-2.5 top-2.5 h-5 rounded-full bg-background/95 px-2 text-[10px] font-semibold uppercase tracking-wide text-foreground shadow-sm">
            Selección
          </Badge>
        )}
        {!product.isAvailable && (
          <div className="absolute inset-0 flex items-center justify-center bg-foreground/45 backdrop-blur-[2px]">
            <span className="rounded-full bg-background/95 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-foreground">
              Agotado hoy
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1 p-3.5">
        <h3 className="line-clamp-1 text-[14.5px] font-semibold leading-tight tracking-tight text-foreground">
          {product.name}
        </h3>
        {product.description && (
          <p className="line-clamp-2 text-[11.5px] leading-snug text-muted-foreground">
            {product.description}
          </p>
        )}
        <div className="mt-2.5 flex items-end justify-between gap-2">
          <div className="flex flex-col">
            <span className="text-[18px] font-semibold tabular-nums tracking-tight text-foreground">
              {formatPrice(product.price)}
            </span>
            <span className="text-[10.5px] text-muted-foreground">
              {product.unit}
              {perKg && <span className="ml-1">· {perKg}</span>}
            </span>
          </div>

          {inCart ? (
            <div className="flex items-center gap-1.5 rounded-full border border-border bg-card p-0.5">
              <Button
                type="button"
                onClick={handleDecrement}
                size="icon"
                variant="ghost"
                aria-label={`Quitar ${product.name}`}
                className="h-7 w-7 rounded-full text-muted-foreground hover:text-foreground"
              >
                <Minus className="h-3.5 w-3.5" />
              </Button>
              <span className="min-w-[1ch] text-center text-[13px] font-semibold tabular-nums text-foreground">
                {inCart.quantity}
              </span>
              <Button
                type="button"
                onClick={handleAdd}
                size="icon"
                variant="ghost"
                aria-label={`Añadir ${product.name}`}
                className={cn(
                  "h-7 w-7 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground",
                  pulse && "scale-110",
                )}
              >
                <Plus className="h-3.5 w-3.5" />
              </Button>
            </div>
          ) : (
            <Button
              type="button"
              onClick={handleAdd}
              disabled={!product.isAvailable}
              size="icon"
              aria-label={`Añadir ${product.name}`}
              className={cn(
                "h-9 w-9 rounded-full shadow-sm",
                pulse && "scale-110",
              )}
            >
              <Plus className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}

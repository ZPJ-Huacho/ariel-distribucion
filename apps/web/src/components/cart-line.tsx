"use client";

import { Minus, Plus, Trash2 } from "lucide-react";
import type { CartItem } from "@mercabana/core";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart-store";
import { formatPrice } from "@/lib/format";

export function CartLine({ item }: { item: CartItem }) {
  const setQuantity = useCart((s) => s.setQuantity);
  const remove = useCart((s) => s.remove);

  return (
    <li className="flex items-center gap-3 rounded-xl border border-border bg-card p-3">
      <div
        className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted"
        aria-hidden
      >
        {item.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.imageUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <span className="text-2xl opacity-90">{item.emoji}</span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-0.5 min-w-0">
        <span className="line-clamp-1 text-[14px] font-semibold text-foreground">
          {item.name}
        </span>
        <span className="text-[11.5px] text-muted-foreground">
          {item.unit} · {formatPrice(item.price)}/ud
        </span>
        <span className="mt-0.5 text-[14px] font-semibold tabular-nums text-foreground">
          {formatPrice(item.price * item.quantity)}
        </span>
      </div>
      <div className="flex items-center gap-1">
        <div className="flex items-center gap-1 rounded-full border border-border bg-background p-0.5">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Quitar uno"
            onClick={() => setQuantity(item.productId, item.quantity - 1)}
            className="h-7 w-7 rounded-full text-muted-foreground hover:text-foreground"
          >
            <Minus className="h-3.5 w-3.5" />
          </Button>
          <span className="min-w-[1.5ch] text-center text-[13px] font-semibold tabular-nums">
            {item.quantity}
          </span>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Añadir uno"
            onClick={() => setQuantity(item.productId, item.quantity + 1)}
            className="h-7 w-7 rounded-full text-muted-foreground hover:text-foreground"
          >
            <Plus className="h-3.5 w-3.5" />
          </Button>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Eliminar"
          onClick={() => remove(item.productId)}
          className="h-7 w-7 text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </li>
  );
}

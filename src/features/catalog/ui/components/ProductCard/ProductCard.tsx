"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Check, ShoppingCart } from "lucide-react";
import type { Product } from "@/core/products";
import { useCart } from "@/shared/lib/cart-store";
import { useSettings } from "@/shared/providers/SettingsProvider";
import { getActiveTheme } from "@/shared/lib/themes";
import { getCardVariant } from "@/shared/lib/theme-card-variants";
import { formatPrice } from "@/shared/lib/format";
import { cn } from "@/shared/lib/utils";
import { SVG_ASSETS } from "@/shared/assets/svg";
import { ProductDetailsDialog } from "../ProductDetailsDialog";

export function ProductCard({ product }: { product: Product }) {
  const add = useCart((c) => c.add);
  const settings = useSettings();
  const theme = getActiveTheme(settings.theme);
  const variant = getCardVariant(theme.id);
  const disabled = !product.isAvailable;
  const [justAdded, setJustAdded] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const flashRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleAdd(e: React.MouseEvent) {
    e.stopPropagation();
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
    if (flashRef.current) clearTimeout(flashRef.current);
    setJustAdded(true);
    flashRef.current = setTimeout(() => setJustAdded(false), 900);
  }

  function handleOpen() {
    setDetailsOpen(true);
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setDetailsOpen(true);
    }
  }

  return (
    <>
      <article
        role="button"
        tabIndex={0}
        onClick={handleOpen}
        onKeyDown={handleKey}
        aria-label={`Ver detalles de ${product.name}`}
        className={cn(
          "group relative isolate flex aspect-[3/4] cursor-pointer flex-col overflow-hidden rounded-xl text-white shadow-md ring-1 ring-white/5 transition sm:rounded-2xl sm:shadow-lg hover:-translate-y-0.5 hover:shadow-xl hover:ring-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60",
          variant.ring,
          disabled && "opacity-70",
        )}
      >
        {theme.id === "navidad" && (
          <img
            src={SVG_ASSETS.christmasHat}
            alt=""
            aria-hidden
            className="pointer-events-none absolute -left-2 -top-2 z-30 h-9 w-9 select-none sm:-left-3 sm:-top-3 sm:h-12 sm:w-12"
            style={{ transform: "rotate(-18deg)" }}
          />
        )}

        <div
          className={cn(
            "absolute inset-0 bg-gradient-to-br from-neutral-800 to-neutral-900",
            product.gradient && `bg-gradient-to-br ${product.gradient}`,
          )}
        >
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              className="object-cover transition duration-500 group-hover:scale-105"
              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-6xl sm:text-8xl">
              {product.emoji || "🛒"}
            </div>
          )}
        </div>

        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-t from-black/40 via-transparent to-transparent"
        />

        <span className="absolute left-2.5 top-2.5 z-20 rounded-lg border border-primary/40 bg-primary/30 px-2 py-0.5 text-xs font-bold text-white shadow-md backdrop-blur-md sm:left-3 sm:top-3 sm:px-2.5 sm:py-1 sm:text-sm">
          {formatPrice(product.price)}
        </span>

        {!product.isAvailable && (
          <span className="absolute right-2.5 top-2.5 z-20 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white/85 backdrop-blur-md">
            Agotado
          </span>
        )}

        <div className="relative z-20 mt-auto flex flex-col gap-1 rounded-b-xl border-t border-white/10 bg-black/35 p-3 pr-12 [backdrop-filter:blur(16px)_saturate(160%)] supports-[not_(backdrop-filter:blur(1px))]:bg-black/75 sm:gap-1.5 sm:rounded-b-2xl sm:p-4 sm:pr-16">
          <h3
            className="line-clamp-2 text-[13px] font-semibold leading-tight text-white drop-shadow-sm sm:text-[15px]"
            title={product.name}
          >
            {product.name}
          </h3>
          <p className="text-[9px] uppercase tracking-widest text-white/60 sm:text-[10px]">
            {product.unit}
          </p>
        </div>

        <button
          type="button"
          disabled={disabled}
          onClick={handleAdd}
          aria-label={`Añadir ${product.name} al carrito`}
          style={
            justAdded
              ? undefined
              : { background: "#1717174d", backdropFilter: "blur(8px)" }
          }
          className={cn(
            "absolute bottom-2.5 right-2.5 z-30 grid h-8 w-8 place-items-center overflow-hidden rounded-full text-white shadow-lg ring-1 ring-white/25 transition-all",
            "hover:scale-110 hover:shadow-xl",
            "active:scale-95",
            "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/50",
            "disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100",
            "sm:bottom-4 sm:right-4 sm:h-11 sm:w-11",
            justAdded &&
              "bg-emerald-500 shadow-emerald-500/50 [animation:pop_400ms_ease-out]",
          )}
        >
          <span className="relative grid h-full w-full place-items-center">
            <ShoppingCart
              className={cn(
                "absolute h-4 w-4 transition-all duration-300 sm:h-5 sm:w-5",
                justAdded ? "scale-50 opacity-0" : "scale-100 opacity-100",
              )}
              strokeWidth={2.5}
              aria-hidden
            />
            <Check
              className={cn(
                "absolute h-4 w-4 transition-all duration-300 sm:h-5 sm:w-5",
                justAdded ? "scale-100 opacity-100" : "scale-50 opacity-0",
              )}
              strokeWidth={3}
              aria-hidden
            />
          </span>
        </button>
      </article>

      <ProductDetailsDialog
        product={detailsOpen ? product : null}
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
      />
    </>
  );
}

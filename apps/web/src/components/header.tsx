"use client";

import Link from "next/link";
import { MessageCircle, Sprout } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { useTenant } from "@/components/tenant-provider";
import { UserMenu } from "@/components/user-menu";
import { cn } from "@/lib/utils";

export function Header({ adminLink: _adminLink = false }: { adminLink?: boolean }) {
  const tenant = useTenant();
  const waLink = `https://wa.me/${tenant.whatsappNumber.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
    "Hola, quería consultar disponibilidad y precios.",
  )}`;

  return (
    <header className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 lg:px-6">
        <Link href="/" className="group flex items-center gap-2.5">
          <span
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm ring-1 ring-primary/20 transition group-hover:scale-105"
            aria-hidden
          >
            <Sprout className="h-4.5 w-4.5" />
          </span>
          <div className="flex flex-col leading-tight">
            <span className="text-[15px] font-semibold tracking-tight text-foreground">
              {tenant.name}
            </span>
            <span className="text-[10.5px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
              {tenant.tagline}
            </span>
          </div>
        </Link>
        <div className="flex items-center gap-2">
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "hidden h-9 gap-1.5 rounded-full border-border/80 text-muted-foreground hover:text-foreground sm:inline-flex",
            )}
          >
            <MessageCircle className="h-3.5 w-3.5" />
            WhatsApp
          </a>
          <UserMenu />
        </div>
      </div>
    </header>
  );
}

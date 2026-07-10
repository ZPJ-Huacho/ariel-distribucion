import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/shared/lib/utils";

export function BackLink({
  href,
  children,
  className,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex w-fit items-center gap-1 self-start rounded-full border border-border/60 bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-sm transition-colors hover:border-primary/40 hover:text-primary sm:text-sm",
        className,
      )}
    >
      <ArrowLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" aria-hidden />
      {children}
    </Link>
  );
}

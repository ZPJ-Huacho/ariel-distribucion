import Link from "next/link";
import { Home, PackageSearch } from "lucide-react";
import { buttonVariants } from "@/shared/components/atoms/button";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-lg flex-col items-center justify-center gap-6 px-4 py-16 text-center">
      <span className="text-6xl font-bold tracking-tight text-primary sm:text-7xl">
        404
      </span>
      <div className="space-y-2">
        <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
          Página no encontrada
        </h1>
        <p className="text-sm text-muted-foreground sm:text-base">
          La dirección que has puesto no existe o ya no está disponible.
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <Link href="/" className={buttonVariants()}>
          <Home className="h-4 w-4" aria-hidden />
          Volver al inicio
        </Link>
        <Link href="/?cat=todas" className={buttonVariants({ variant: "outline" })}>
          <PackageSearch className="h-4 w-4" aria-hidden />
          Ver catálogo
        </Link>
      </div>
    </main>
  );
}

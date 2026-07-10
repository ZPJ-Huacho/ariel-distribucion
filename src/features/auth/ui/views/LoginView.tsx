import Link from "next/link";
import { BackLink } from "@/shared/components/atoms/back-link";
import { LoginForm } from "../components/LoginForm";

export function LoginView({
  nextPromise,
}: {
  nextPromise: Promise<{ next?: string }>;
}) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 py-8">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <BackLink href="/">Volver al catálogo</BackLink>
        <div className="flex flex-col gap-6 rounded-xl border bg-card p-6 shadow-sm">
          <div>
            <h1 className="text-2xl font-semibold">Entrar</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Usa tu email y contraseña para acceder.
            </p>
          </div>
          <LoginForm nextPromise={nextPromise} />
          <p className="text-center text-sm text-muted-foreground">
            ¿No tienes cuenta?{" "}
            <Link href="/registro" className="text-primary hover:underline font-medium">
              Regístrate
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}

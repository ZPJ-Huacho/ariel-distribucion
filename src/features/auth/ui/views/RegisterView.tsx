import Link from "next/link";
import { BackLink } from "@/shared/components/atoms/back-link";
import { RegisterForm } from "../components/RegisterForm";

export function RegisterView() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 py-8">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <BackLink href="/">Volver al catálogo</BackLink>
        <div className="flex flex-col gap-6 rounded-xl border bg-card p-6 shadow-sm">
          <div>
            <h1 className="text-2xl font-semibold">Crear cuenta</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Guarda tus datos y pide más rápido la próxima vez.
            </p>
          </div>
          <RegisterForm />
          <p className="text-center text-sm text-muted-foreground">
            ¿Ya tienes cuenta?{" "}
            <Link href="/login" className="text-primary hover:underline font-medium">
              Entra
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}

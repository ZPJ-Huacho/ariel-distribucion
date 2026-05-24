import { Suspense } from "react";
import { AuthForm } from "@/components/auth-form";

export default function RegistroPage() {
  return (
    <main className="flex flex-1 items-center justify-center bg-gradient-to-b from-background to-muted/30 px-4 py-12">
      <Suspense fallback={null}>
        <AuthForm initialMode="register" />
      </Suspense>
    </main>
  );
}

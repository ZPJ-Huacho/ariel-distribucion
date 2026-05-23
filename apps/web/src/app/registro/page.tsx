import { Suspense } from "react";
import { AuthForm } from "@/components/auth-form";

export default function RegistroPage() {
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-10">
      <Suspense fallback={null}>
        <AuthForm initialMode="register" />
      </Suspense>
    </main>
  );
}

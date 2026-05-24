import { redirect } from "next/navigation";
import { ApiError } from "@mercabana/core";
import { Header } from "@/components/header";
import { SiteFooter } from "@/components/site-footer";
import { ProfileForm } from "@/components/profile-form";
import { createRequestApiClient } from "@/lib/api-server";

export const dynamic = "force-dynamic";

export default async function PerfilPage() {
  const client = await createRequestApiClient();
  let user;
  try {
    const me = await client.auth.me();
    user = me.user;
  } catch (err) {
    if (err instanceof ApiError) user = null;
    else throw err;
  }

  if (!user) redirect("/login?redirect=/perfil");

  return (
    <>
      <Header />
      <main className="mx-auto w-full max-w-md flex-1 px-4 py-10 lg:px-6">
        <div className="mb-6">
          <h1 className="text-[28px] font-semibold tracking-tight text-foreground">
            Mi perfil
          </h1>
          <p className="mt-1 text-[14px] text-muted-foreground">
            Edita tus datos o cambia la contraseña.
          </p>
        </div>
        <ProfileForm user={user} />
      </main>
      <SiteFooter />
    </>
  );
}

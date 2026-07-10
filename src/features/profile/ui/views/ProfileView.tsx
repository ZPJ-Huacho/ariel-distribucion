import { redirect } from "next/navigation";
import { getSession } from "@/core/auth";
import { GetProfileUseCase, getUserRepository } from "@/core/users";
import { Header } from "@/shared/components/organisms/Header";
import { SiteFooter } from "@/shared/components/organisms/SiteFooter";
import { BackLink } from "@/shared/components/atoms/back-link";
import { ProfileClient } from "../components/ProfileClient";

export async function ProfileView() {
  const session = await getSession();
  if (!session) redirect("/login?next=/perfil");

  const user = await new GetProfileUseCase(getUserRepository()).execute(session);
  if (!user) redirect("/login?next=/perfil");

  return (
    <>
      <Header />
      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-4 px-3 pb-24 pt-3 sm:gap-6 sm:px-4 sm:pb-10 sm:pt-6 lg:px-6">
        <BackLink href="/">Volver al catálogo</BackLink>
        <ProfileClient initialUser={user} />
      </main>
      <SiteFooter />
    </>
  );
}

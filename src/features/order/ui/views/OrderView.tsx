import { Header } from "@/shared/components/organisms/Header";
import { SiteFooter } from "@/shared/components/organisms/SiteFooter";
import { BackLink } from "@/shared/components/atoms/back-link";
import { OrderForm } from "../components/OrderForm";
import { OrderPageHeader } from "../components/OrderPageHeader";

export function OrderView() {
  return (
    <>
      <Header />
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-4 px-3 py-4 sm:gap-6 sm:px-4 sm:py-6 lg:px-6">
        <BackLink href="/">Seguir comprando</BackLink>
        <OrderPageHeader />
        <OrderForm />
      </main>
      <SiteFooter />
    </>
  );
}

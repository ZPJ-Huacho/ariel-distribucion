import Link from "next/link";
import { Header } from "@/components/header";
import { OrderFlow } from "@/components/order-flow";

export default function PedidoPage() {
  return (
    <>
      <Header />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 pb-16">
        <div className="pt-5 pb-3">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-sm font-medium text-stone-600 hover:text-stone-900"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Seguir comprando
          </Link>
          <h1 className="mt-3 text-2xl font-bold text-stone-900 sm:text-3xl">Tu pedido</h1>
          <p className="mt-1 text-sm text-stone-600">
            Revisa los productos y déjanos cómo entregamos. Cobramos al entregar.
          </p>
        </div>
        <OrderFlow />
      </main>
    </>
  );
}

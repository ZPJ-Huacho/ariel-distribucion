import Link from "next/link";
import { Header } from "@/components/header";
import { OrderFlow } from "@/components/order-flow";

export default function PedidoPage() {
  return (
    <>
      <Header />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 pb-16">
        <div className="border-b border-[var(--color-line)] pt-7 pb-5">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--color-ink-soft)] hover:text-brand-700"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Volver al catálogo
          </Link>
          <h1 className="mt-3 font-display text-[28px] leading-tight text-[var(--color-ink)] sm:text-[32px]">
            Confirma tu pedido
          </h1>
          <p className="mt-2 text-sm text-[var(--color-ink-soft)]">
            Revisa los productos y déjanos los datos de entrega. Te confirmamos por
            WhatsApp en minutos. Pago a la entrega.
          </p>
        </div>
        <div className="mt-6">
          <OrderFlow />
        </div>
      </main>
    </>
  );
}

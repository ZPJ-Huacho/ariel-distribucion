import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Header } from "@/components/header";
import { OrderFlow } from "@/components/order-flow";

export default function PedidoPage() {
  return (
    <>
      <Header />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 pb-20 lg:px-6">
        <div className="pt-8 pb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-[12px] font-medium text-muted-foreground transition hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Volver al catálogo
          </Link>
          <h1 className="mt-4 text-[28px] font-semibold tracking-tight text-foreground sm:text-[32px]">
            Confirma tu pedido
          </h1>
          <p className="mt-2 text-[14px] text-muted-foreground">
            Revisa los productos y déjanos los datos de entrega. Te confirmamos
            por WhatsApp en minutos. Pago a la entrega.
          </p>
        </div>
        <OrderFlow />
      </main>
    </>
  );
}

import { AdminProductsList } from "@/components/admin-products-list";
import { products } from "@/lib/data/products";

export default function AdminProductos() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">Productos</h1>
        <p className="text-sm text-stone-500">
          Toca el precio para cambiarlo. El interruptor activa o desactiva el producto del catálogo.
        </p>
      </div>
      <AdminProductsList products={products} />
    </div>
  );
}

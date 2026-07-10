import { CatalogView, type CatalogViewParams } from "@/features/catalog";

export const dynamic = "force-dynamic";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<CatalogViewParams>;
}) {
  const params = await searchParams;
  return <CatalogView params={params} />;
}

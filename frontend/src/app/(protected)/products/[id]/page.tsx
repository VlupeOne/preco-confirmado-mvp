import { ProductDetail } from "@/features/products/product-detail";

export const metadata = { title: "Detalhe do produto" };

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ProductDetail id={id} />;
}

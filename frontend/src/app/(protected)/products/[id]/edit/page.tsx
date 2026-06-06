import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { ProductEditor } from "@/features/products/product-editor";

export const metadata = { title: "Editar produto" };

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow="Configuração"
        title="Editar monitoramento"
        description="Provedor e identificador externo são imutáveis conforme o contrato do backend."
      />
      <Card>
        <CardContent className="p-5 sm:p-7">
          <ProductEditor productId={id} />
        </CardContent>
      </Card>
    </div>
  );
}

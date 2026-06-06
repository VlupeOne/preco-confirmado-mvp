import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { ProductEditor } from "@/features/products/product-editor";

export const metadata = { title: "Novo produto" };

export default function NewProductPage() {
  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow="Nova meta"
        title="Monitorar produto"
        description="Use exatamente o produto e a variante desejados. O backend validará esses dados novamente antes de criar qualquer alerta."
      />
      <Card>
        <CardContent className="p-5 sm:p-7">
          <ProductEditor />
        </CardContent>
      </Card>
    </div>
  );
}

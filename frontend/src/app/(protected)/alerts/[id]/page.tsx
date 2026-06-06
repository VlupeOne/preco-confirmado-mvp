import { AlertDetail } from "@/features/alerts/alert-detail";

export const metadata = { title: "Detalhe do alerta" };

export default async function AlertDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <AlertDetail id={id} />;
}

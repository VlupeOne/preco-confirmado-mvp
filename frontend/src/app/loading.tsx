import { PageSkeleton } from "@/components/feedback/page-skeleton";

export default function Loading() {
  return (
    <main id="conteudo-principal" className="mx-auto max-w-7xl p-6">
      <PageSkeleton />
    </main>
  );
}

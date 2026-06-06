"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";

export function PaginationControls({
  page,
  totalPages,
  totalElements,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  totalElements?: number;
  onPageChange: (page: number) => void;
}) {
  if (totalPages <= 1) {
    return totalElements !== undefined ? (
      <p className="text-muted-foreground text-xs">
        {totalElements} {totalElements === 1 ? "registro" : "registros"}
      </p>
    ) : null;
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-muted-foreground text-xs">
        Página {page + 1} de {totalPages}
        {totalElements !== undefined ? ` · ${totalElements} registros` : ""}
      </p>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={page === 0}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeft />
          Anterior
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={page + 1 >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          Próxima
          <ChevronRight />
        </Button>
      </div>
    </div>
  );
}

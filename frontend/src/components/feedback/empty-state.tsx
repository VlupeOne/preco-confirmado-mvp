import { Inbox } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <Card className="border-dashed">
      <CardContent className="flex min-h-64 flex-col items-center justify-center p-8 text-center">
        <span className="bg-muted mb-4 grid size-12 place-items-center rounded-2xl">
          <Inbox className="text-muted-foreground size-6" aria-hidden="true" />
        </span>
        <h2 className="font-semibold">{title}</h2>
        <p className="text-muted-foreground mt-2 max-w-md text-sm">
          {description}
        </p>
        {action && <div className="mt-5">{action}</div>}
      </CardContent>
    </Card>
  );
}

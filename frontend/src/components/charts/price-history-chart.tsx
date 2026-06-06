"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { PriceSnapshot } from "@/lib/api/types";
import { formatChartDate, formatMoney } from "@/lib/formatters";

export function PriceHistoryChart({
  snapshots,
  targetPrice,
  currency,
}: {
  snapshots: PriceSnapshot[];
  targetPrice?: number;
  currency?: string;
}) {
  const data = snapshots.map((snapshot) => ({
    id: snapshot.id,
    time: formatChartDate(snapshot.observedAt),
    price: snapshot.price,
  }));

  return (
    <div>
      <div className="h-72 min-w-0" aria-hidden="true">
        <ResponsiveContainer
          minWidth={0}
          initialDimension={{ width: 800, height: 288 }}
        >
          <LineChart
            data={data}
            margin={{ top: 12, right: 12, left: 4, bottom: 4 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="time" tick={{ fontSize: 11 }} minTickGap={32} />
            <YAxis
              tick={{ fontSize: 11 }}
              width={72}
              tickFormatter={(value: number) =>
                new Intl.NumberFormat("pt-BR", {
                  notation: "compact",
                  maximumFractionDigits: 1,
                }).format(value)
              }
              domain={["auto", "auto"]}
            />
            <Tooltip
              formatter={(value) => [
                formatMoney(Number(value), currency),
                "Preço observado",
              ]}
            />
            {targetPrice !== undefined && (
              <ReferenceLine
                y={targetPrice}
                stroke="var(--warning)"
                strokeDasharray="6 4"
                label={{ value: "Meta", fill: "var(--warning)", fontSize: 11 }}
              />
            )}
            <Line
              type="linear"
              dataKey="price"
              stroke="var(--success)"
              strokeWidth={3}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
              connectNulls={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <p className="text-muted-foreground mt-3 text-xs">
        Resumo acessível: {snapshots.length} observações reais, da mais antiga
        para a mais recente. A linha tracejada representa o preço desejado.
      </p>
    </div>
  );
}

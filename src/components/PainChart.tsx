"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";

export function PainChart({ data }: { data: { session: number; pain: number }[] }) {
  if (!data || data.length === 0) {
    return (
      <div className="h-56 flex items-center justify-center text-sm text-slate">
        Aucune donnée de suivi disponible
      </div>
    );
  }
  return (
    <div className="h-56">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 8 }}>
          <CartesianGrid stroke="#eef4fa" strokeDasharray="3 3" />
          <XAxis
            dataKey="session"
            stroke="#6b7280"
            fontSize={11}
            tickLine={false}
            axisLine={{ stroke: "#c8d6e5" }}
            label={{ value: "Séance", position: "insideBottom", offset: -4, fill: "#6b7280", fontSize: 11 }}
          />
          <YAxis
            stroke="#6b7280"
            fontSize={11}
            domain={[0, 10]}
            ticks={[0, 2, 4, 6, 8, 10]}
            tickLine={false}
            axisLine={{ stroke: "#c8d6e5" }}
          />
          <Tooltip
            contentStyle={{
              borderRadius: 8,
              border: "1px solid #c8d6e5",
              fontSize: 12,
              padding: "6px 10px",
            }}
            labelFormatter={(v) => `Séance ${v}`}
            formatter={(v) => [`${v}/10`, "EVA activité"]}
          />
          <ReferenceLine y={4} stroke="#d35400" strokeDasharray="4 4" strokeOpacity={0.5} />
          <Line
            type="monotone"
            dataKey="pain"
            stroke="#1e3a5f"
            strokeWidth={2.5}
            dot={{ r: 4, fill: "#1e3a5f" }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

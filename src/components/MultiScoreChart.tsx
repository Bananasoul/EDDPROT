"use client";

import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend,
} from "recharts";
import type { Patient } from "@/lib/mock-data";
import { useApp } from "@/lib/app-context";

type Series = "eva" | "odi" | "tsk" | "had";

const COLORS: Record<Series, string> = {
  eva: "#1e3a5f",
  odi: "#1a6b45",
  tsk: "#d35400",
  had: "#c0392b",
};

// Normalize each score to 0..10 scale for visual overlay
function normalize(p: Patient): { session: number; eva: number; odi: number | null; tsk: number | null; had: number | null }[] {
  const t0 = p.scoresT0;
  const t1 = p.scoresT1;
  return p.painTrend.map((pt) => {
    const ratio = pt.session / 36;
    const interp = (a: number | null | undefined, b: number | null | undefined, max: number) => {
      if (a == null) return null;
      if (b == null) return +(a / max * 10).toFixed(2);
      return +((a + (b - a) * ratio) / max * 10).toFixed(2);
    };
    return {
      session: pt.session,
      eva: pt.pain,
      odi: t0 ? interp(t0.odi, t1?.odi, 100) : null,
      tsk: t0 ? interp(t0.tsk, t1?.tsk, 68) : null,
      had: t0 ? interp(t0.had_a + t0.had_d, t1 ? t1.had_a + t1.had_d : null, 42) : null,
    };
  });
}

export function MultiScoreChart({ patient }: { patient: Patient }) {
  const { lang } = useApp();
  const tr = (fr: string, de: string) => (lang === "de" ? de : fr);
  const [active, setActive] = useState<Record<Series, boolean>>({
    eva: true,
    odi: true,
    tsk: true,
    had: false,
  });

  const data = normalize(patient);
  if (data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-sm text-slate">
        {tr("Aucune donnée de suivi disponible", "Keine Verlaufsdaten verfügbar")}
      </div>
    );
  }

  const labels: Record<Series, [string, string]> = {
    eva: [tr("EVA activité (/10)", "VAS Aktivität (/10)"), "/10"],
    odi: [tr("ODI normalisé", "ODI normalisiert"), "% → /10"],
    tsk: [tr("Tampa (kinésiophobie)", "Tampa (Kinesiophobie)"), "/68 → /10"],
    had: [tr("HAD totale (A+D)", "HAD gesamt (A+D)"), "/42 → /10"],
  };

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-3">
        {(Object.keys(labels) as Series[]).map((k) => (
          <button
            key={k}
            onClick={() => setActive((a) => ({ ...a, [k]: !a[k] }))}
            className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border transition"
            style={{
              borderColor: active[k] ? COLORS[k] : "#e2e8f0",
              color: active[k] ? COLORS[k] : "#94a3b8",
              backgroundColor: active[k] ? `${COLORS[k]}10` : "white",
            }}
          >
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: active[k] ? COLORS[k] : "#cbd5e1" }}
            />
            {labels[k][0]}
          </button>
        ))}
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 8 }}>
            <CartesianGrid stroke="#eef4fa" strokeDasharray="3 3" />
            <XAxis
              dataKey="session"
              stroke="#6b7280"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: "#c8d6e5" }}
              label={{
                value: tr("Séance", "Sitzung"),
                position: "insideBottom",
                offset: -4,
                fill: "#6b7280",
                fontSize: 11,
              }}
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
              labelFormatter={(v) => tr(`Séance ${v}`, `Sitzung ${v}`)}
            />
            <ReferenceLine y={4} stroke="#d35400" strokeDasharray="4 4" strokeOpacity={0.4} />
            {active.eva && (
              <Line
                type="monotone"
                dataKey="eva"
                name={tr("EVA", "VAS")}
                stroke={COLORS.eva}
                strokeWidth={2.5}
                dot={{ r: 3, fill: COLORS.eva }}
                activeDot={{ r: 5 }}
              />
            )}
            {active.odi && (
              <Line
                type="monotone"
                dataKey="odi"
                name="ODI"
                stroke={COLORS.odi}
                strokeWidth={2}
                dot={{ r: 3, fill: COLORS.odi }}
                strokeDasharray="5 3"
                activeDot={{ r: 5 }}
              />
            )}
            {active.tsk && (
              <Line
                type="monotone"
                dataKey="tsk"
                name="TSK"
                stroke={COLORS.tsk}
                strokeWidth={2}
                dot={{ r: 3, fill: COLORS.tsk }}
                strokeDasharray="2 3"
                activeDot={{ r: 5 }}
              />
            )}
            {active.had && (
              <Line
                type="monotone"
                dataKey="had"
                name="HAD"
                stroke={COLORS.had}
                strokeWidth={2}
                dot={{ r: 3, fill: COLORS.had }}
                strokeDasharray="3 4"
                activeDot={{ r: 5 }}
              />
            )}
            <Legend wrapperStyle={{ fontSize: 11 }} iconSize={8} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="text-[11px] text-slate mt-2">
        {tr(
          "Tous les scores sont normalisés sur une échelle 0-10 pour comparaison visuelle. Survolez les points pour les valeurs natives.",
          "Alle Scores werden für den visuellen Vergleich auf einer 0-10-Skala normalisiert. Bewegen Sie die Maus über die Punkte, um die nativen Werte anzuzeigen."
        )}
      </div>
    </div>
  );
}

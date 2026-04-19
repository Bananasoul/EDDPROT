"use client";

import { scoreThresholds, type Scores } from "@/lib/mock-data";
import { useApp } from "@/lib/app-context";
import { cn } from "@/lib/utils";

const keys: (keyof Scores)[] = [
  "pain_rest",
  "pain_activity",
  "had_a",
  "had_d",
  "odi",
  "tsk",
  "start",
  "wkg",
];

function scoreClass(k: keyof Scores, v: number | null) {
  if (v === null) return "text-slate";
  const th = scoreThresholds[k];
  if (th.higherIsWorse) {
    if (v >= th.bad) return "text-accent font-semibold";
    if (v >= th.warn) return "text-amber font-medium";
    return "text-clover font-medium";
  } else {
    if (v <= th.bad) return "text-accent font-semibold";
    if (v <= th.warn) return "text-amber font-medium";
    return "text-clover font-medium";
  }
}

function format(k: keyof Scores, v: number | null) {
  if (v === null) return "—";
  if (k === "odi") return `${v}%`;
  if (k === "wkg") return v.toFixed(1);
  return String(v);
}

function delta(k: keyof Scores, t0: number | null, t1: number | null) {
  if (t0 === null || t1 === null) return { label: "—", cls: "text-slate" };
  const d = t1 - t0;
  const th = scoreThresholds[k];
  const improved = th.higherIsWorse ? d < 0 : d > 0;
  const sign = d > 0 ? "+" : "";
  const val = k === "wkg" ? d.toFixed(1) : d.toString();
  return {
    label: `${sign}${val}`,
    cls: improved ? "text-clover font-semibold" : d === 0 ? "text-slate" : "text-accent",
  };
}

export function ScoresTable({ t0, t1 }: { t0: Scores | null; t1: Scores | null }) {
  const { t } = useApp();
  return (
    <div className="overflow-hidden rounded-lg border border-hairline">
      <table className="w-full text-sm">
        <thead className="bg-navy-pale text-navy text-xs uppercase tracking-wide">
          <tr>
            <th className="text-left px-3 py-2 font-semibold">Score</th>
            <th className="text-center px-3 py-2 font-semibold">{t.scores.t0}</th>
            <th className="text-center px-3 py-2 font-semibold">{t.scores.t1}</th>
            <th className="text-center px-3 py-2 font-semibold">{t.scores.delta}</th>
            <th className="text-right px-3 py-2 font-semibold">{t.scores.threshold}</th>
          </tr>
        </thead>
        <tbody>
          {keys.map((k) => {
            const v0 = t0?.[k] ?? null;
            const v1 = t1?.[k] ?? null;
            const d = delta(k, v0, v1);
            const th = scoreThresholds[k];
            return (
              <tr key={k} className="border-t border-hairline/60">
                <td className="px-3 py-2 text-ink">{t.scores[k]}</td>
                <td className={cn("px-3 py-2 text-center tabular-nums", scoreClass(k, v0))}>
                  {format(k, v0)}
                </td>
                <td className={cn("px-3 py-2 text-center tabular-nums", scoreClass(k, v1))}>
                  {format(k, v1)}
                </td>
                <td className={cn("px-3 py-2 text-center tabular-nums", d.cls)}>{d.label}</td>
                <td className="px-3 py-2 text-right text-xs text-slate tabular-nums">
                  {th.higherIsWorse ? `≤ ${th.warn}` : `≥ ${th.warn}`} / {th.max}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

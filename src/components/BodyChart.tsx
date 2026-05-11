"use client";

import { useState } from "react";
import { useApp } from "@/lib/app-context";
import { cn } from "@/lib/utils";

type Side = "front" | "back";
type Zone = {
  id: string;
  side: Side;
  labelFr: string;
  labelDe: string;
  // SVG path or simplified ellipse
  cx: number;
  cy: number;
  rx: number;
  ry: number;
};

const ZONES: Zone[] = [
  // Back side — primary for low back pain
  { id: "cervical", side: "back", labelFr: "Cervicales", labelDe: "Halswirbel", cx: 100, cy: 75, rx: 14, ry: 10 },
  { id: "trapezius_l", side: "back", labelFr: "Trapèze G", labelDe: "Trapezius li.", cx: 78, cy: 95, rx: 10, ry: 8 },
  { id: "trapezius_r", side: "back", labelFr: "Trapèze D", labelDe: "Trapezius re.", cx: 122, cy: 95, rx: 10, ry: 8 },
  { id: "thoracic", side: "back", labelFr: "Dorsales", labelDe: "Brustwirbel", cx: 100, cy: 130, rx: 18, ry: 22 },
  { id: "lumbar", side: "back", labelFr: "Lombaires", labelDe: "Lendenwirbel", cx: 100, cy: 175, rx: 22, ry: 18 },
  { id: "buttock_l", side: "back", labelFr: "Fessier G", labelDe: "Gesäß li.", cx: 80, cy: 215, rx: 14, ry: 14 },
  { id: "buttock_r", side: "back", labelFr: "Fessier D", labelDe: "Gesäß re.", cx: 120, cy: 215, rx: 14, ry: 14 },
  { id: "sciatic_l", side: "back", labelFr: "Trajet sciatique G", labelDe: "Ischias-Verlauf li.", cx: 78, cy: 270, rx: 7, ry: 30 },
  { id: "sciatic_r", side: "back", labelFr: "Trajet sciatique D", labelDe: "Ischias-Verlauf re.", cx: 122, cy: 270, rx: 7, ry: 30 },
  // Front side
  { id: "abdo", side: "front", labelFr: "Abdomen", labelDe: "Bauch", cx: 100, cy: 165, rx: 22, ry: 22 },
  { id: "hip_l_f", side: "front", labelFr: "Hanche G", labelDe: "Hüfte li.", cx: 78, cy: 205, rx: 12, ry: 12 },
  { id: "hip_r_f", side: "front", labelFr: "Hanche D", labelDe: "Hüfte re.", cx: 122, cy: 205, rx: 12, ry: 12 },
  { id: "thigh_l_f", side: "front", labelFr: "Cuisse G (face ant.)", labelDe: "Oberschenkel li. (vorne)", cx: 80, cy: 270, rx: 10, ry: 30 },
  { id: "thigh_r_f", side: "front", labelFr: "Cuisse D (face ant.)", labelDe: "Oberschenkel re. (vorne)", cx: 120, cy: 270, rx: 10, ry: 30 },
];

const intensityColor = (v: number): string => {
  if (v === 0) return "transparent";
  if (v <= 3) return "#fde68a"; // amber-200
  if (v <= 6) return "#fb923c"; // orange-400
  return "#dc2626"; // red-600
};

export function BodyChart() {
  const { lang } = useApp();
  const tr = (fr: string, de: string) => (lang === "de" ? de : fr);
  const [side, setSide] = useState<Side>("back");
  const [pain, setPain] = useState<Record<string, number>>({
    lumbar: 7,
    buttock_l: 5,
    sciatic_l: 4,
  });
  const [hover, setHover] = useState<string | null>(null);

  const cycle = (id: string) => {
    setPain((m) => {
      const next = { ...m };
      const cur = next[id] ?? 0;
      const newVal = cur === 0 ? 3 : cur === 3 ? 6 : cur === 6 ? 9 : 0;
      if (newVal === 0) delete next[id];
      else next[id] = newVal;
      return next;
    });
  };

  const visibleZones = ZONES.filter((z) => z.side === side);
  const totalMarked = Object.values(pain).filter((v) => v > 0).length;
  const maxIntensity = Object.values(pain).reduce((m, v) => Math.max(m, v), 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-[1fr_240px] gap-6">
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="inline-flex rounded-lg border border-hairline overflow-hidden text-xs font-medium">
            <button
              onClick={() => setSide("back")}
              className={cn(
                "px-3 py-1.5",
                side === "back" ? "bg-navy text-white" : "bg-white text-slate hover:bg-slate-light"
              )}
            >
              {tr("Vue postérieure", "Rückenansicht")}
            </button>
            <button
              onClick={() => setSide("front")}
              className={cn(
                "px-3 py-1.5",
                side === "front" ? "bg-navy text-white" : "bg-white text-slate hover:bg-slate-light"
              )}
            >
              {tr("Vue antérieure", "Vorderansicht")}
            </button>
          </div>
          <div className="text-xs text-slate">
            {tr("Cliquez pour cycler 0 → 3 → 6 → 9", "Klicken zum Wechseln 0 → 3 → 6 → 9")}
          </div>
        </div>

        <div className="bg-navy-pale/30 rounded-xl p-4 flex justify-center">
          <svg viewBox="0 0 200 400" className="w-full max-w-[260px] h-auto">
            {/* Body silhouette - back */}
            {side === "back" && (
              <g fill="#cbd5e1" fillOpacity={0.4} stroke="#94a3b8" strokeWidth={1}>
                {/* Head */}
                <circle cx={100} cy={40} r={20} />
                {/* Neck */}
                <rect x={92} y={58} width={16} height={12} />
                {/* Torso */}
                <path d="M 70 70 Q 65 85 65 110 L 60 200 Q 60 220 70 230 L 130 230 Q 140 220 140 200 L 135 110 Q 135 85 130 70 Z" />
                {/* Arms */}
                <path d="M 65 80 L 50 100 L 45 170 L 50 175 L 60 110 Z" />
                <path d="M 135 80 L 150 100 L 155 170 L 150 175 L 140 110 Z" />
                {/* Legs */}
                <path d="M 70 230 L 65 310 L 70 380 L 90 380 L 92 310 L 95 230 Z" />
                <path d="M 130 230 L 135 310 L 130 380 L 110 380 L 108 310 L 105 230 Z" />
              </g>
            )}
            {side === "front" && (
              <g fill="#cbd5e1" fillOpacity={0.4} stroke="#94a3b8" strokeWidth={1}>
                <circle cx={100} cy={40} r={20} />
                <rect x={92} y={58} width={16} height={12} />
                <path d="M 70 70 Q 65 85 65 110 L 60 200 Q 60 220 70 230 L 130 230 Q 140 220 140 200 L 135 110 Q 135 85 130 70 Z" />
                <path d="M 65 80 L 50 100 L 45 170 L 50 175 L 60 110 Z" />
                <path d="M 135 80 L 150 100 L 155 170 L 150 175 L 140 110 Z" />
                <path d="M 70 230 L 65 310 L 70 380 L 90 380 L 92 310 L 95 230 Z" />
                <path d="M 130 230 L 135 310 L 130 380 L 110 380 L 108 310 L 105 230 Z" />
              </g>
            )}

            {/* Zones */}
            {visibleZones.map((z) => {
              const v = pain[z.id] ?? 0;
              const isHovered = hover === z.id;
              return (
                <g key={z.id}>
                  <ellipse
                    cx={z.cx}
                    cy={z.cy}
                    rx={z.rx}
                    ry={z.ry}
                    fill={intensityColor(v)}
                    fillOpacity={v > 0 ? 0.75 : 0}
                    stroke={isHovered ? "#1e3a5f" : v > 0 ? intensityColor(v) : "#94a3b8"}
                    strokeOpacity={isHovered ? 1 : v > 0 ? 1 : 0.3}
                    strokeWidth={isHovered ? 2 : 1}
                    strokeDasharray={v > 0 ? "0" : "3 2"}
                    style={{ cursor: "pointer", transition: "all 0.15s" }}
                    onClick={() => cycle(z.id)}
                    onMouseEnter={() => setHover(z.id)}
                    onMouseLeave={() => setHover(null)}
                  />
                  {v > 0 && (
                    <text
                      x={z.cx}
                      y={z.cy + 1}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fontSize="9"
                      fontWeight="bold"
                      fill="white"
                      pointerEvents="none"
                    >
                      {v}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      <div className="space-y-3">
        <div className="p-3 rounded-lg bg-navy-pale">
          <div className="text-xs text-slate uppercase tracking-wide">
            {tr("Synthèse douleur", "Schmerzübersicht")}
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-navy tabular-nums">{totalMarked}</span>
            <span className="text-sm text-slate">
              {tr(
                `zone${totalMarked > 1 ? "s" : ""} marquée${totalMarked > 1 ? "s" : ""}`,
                `markierte Zone${totalMarked > 1 ? "n" : ""}`
              )}
            </span>
          </div>
          {maxIntensity > 0 && (
            <div className="mt-2 text-xs text-slate">
              {tr("Intensité max", "Max. Intensität")} :{" "}
              <span
                className="font-bold"
                style={{ color: intensityColor(maxIntensity) }}
              >
                {maxIntensity}/10
              </span>
            </div>
          )}
        </div>

        <div className="space-y-1.5">
          <div className="text-xs text-slate uppercase tracking-wide font-medium">
            {tr("Légende intensité", "Intensitätslegende")}
          </div>
          {[
            { v: 1, label: tr("Légère (1-3)", "Leicht (1-3)") },
            { v: 4, label: tr("Modérée (4-6)", "Mäßig (4-6)") },
            { v: 7, label: tr("Sévère (7-10)", "Stark (7-10)") },
          ].map((it) => (
            <div key={it.v} className="flex items-center gap-2 text-xs">
              <div
                className="w-4 h-4 rounded"
                style={{ backgroundColor: intensityColor(it.v), opacity: 0.8 }}
              />
              <span className="text-slate">{it.label}</span>
            </div>
          ))}
        </div>

        {Object.keys(pain).length > 0 && (
          <div className="pt-2 border-t border-hairline">
            <div className="text-xs text-slate uppercase tracking-wide font-medium mb-1.5">
              {tr("Zones marquées", "Markierte Zonen")}
            </div>
            <ul className="space-y-1 text-xs">
              {Object.entries(pain).map(([id, v]) => {
                const z = ZONES.find((zz) => zz.id === id);
                if (!z) return null;
                return (
                  <li key={id} className="flex items-center justify-between">
                    <span className="text-ink">{tr(z.labelFr, z.labelDe)}</span>
                    <span
                      className="font-bold tabular-nums"
                      style={{ color: intensityColor(v) }}
                    >
                      {v}/10
                    </span>
                  </li>
                );
              })}
            </ul>
            <button
              onClick={() => setPain({})}
              className="mt-2 text-xs text-slate hover:text-navy underline"
            >
              {tr("Réinitialiser", "Zurücksetzen")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

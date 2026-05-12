"use client";

import { useMemo, useState } from "react";
import {
  Plus,
  Heart,
  Clock,
  Activity,
  ChevronRight,
  ChevronDown,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  X,
  Save,
  FileText,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import {
  EQUIPMENT,
  EQUIPMENT_ICONS,
  EQUIPMENT_COLORS,
  getEquipment,
  totalDuration,
  avgFcSession,
  maxFcSession,
  type ApparatusSession,
  type ApparatusUse,
  type Equipment,
} from "@/lib/equipment";
import { sessionsForPatient } from "@/lib/mock-data";
import type { Patient } from "@/lib/mock-data";
import { useApp } from "@/lib/app-context";
import { cn } from "@/lib/utils";
import { FORMULAS, suggestFormula } from "@/lib/cardio-norms";

function ageOf(dob: string): number {
  return Math.floor((Date.now() - new Date(dob).getTime()) / (365.25 * 24 * 3600 * 1000));
}

export function ApparatusSessionsView({ patient }: { patient: Patient }) {
  const { lang } = useApp();
  const tr = (fr: string, de: string) => (lang === "de" ? de : fr);

  // Sessions existantes (mock) + sessions ajoutées localement (state)
  const initial = useMemo(() => sessionsForPatient(patient.id), [patient.id]);
  const [localSessions, setLocalSessions] = useState<ApparatusSession[]>([]);
  const all = useMemo(
    () =>
      [...initial, ...localSessions].sort((a, b) => a.sessionNumber - b.sessionNumber),
    [initial, localSessions]
  );

  const [showAdd, setShowAdd] = useState(false);
  const [expandedSession, setExpandedSession] = useState<string | null>(null);

  // FC cible 75 % FCmax pour ce patient
  const age = ageOf(patient.dob);
  const formulaKey = suggestFormula(age, patient.gender);
  const fcMax = FORMULAS[formulaKey].compute(age, patient.gender);
  const fcTarget = Math.round(fcMax * 0.75);

  const nextSessionNumber = all.length > 0 ? Math.max(...all.map((s) => s.sessionNumber)) + 1 : 1;

  // ─── Données graphiques ───
  const chartData = all.map((s) => ({
    n: s.sessionNumber,
    fcAvg: avgFcSession(s) ?? 0,
    fcMax: maxFcSession(s) ?? 0,
    eva: s.evaPainAfter ?? s.evaPainBefore,
    duration: totalDuration(s),
  }));

  const trend = useMemo(() => {
    if (chartData.length < 2) return null;
    const firstFc = chartData[0].fcAvg;
    const lastFc = chartData[chartData.length - 1].fcAvg;
    const fcDelta = lastFc - firstFc;
    const firstEva = chartData[0].eva;
    const lastEva = chartData[chartData.length - 1].eva;
    const evaDelta = lastEva - firstEva;
    return { fcDelta, evaDelta };
  }, [chartData]);

  return (
    <div className="space-y-5">
      {/* Header KPI */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiTile
          icon={<Activity className="w-4 h-4" />}
          label={tr("Séances réalisées", "Sitzungen")}
          value={`${all.length}`}
          sub={tr(`sur ${patient.sessionsDone} totales`, `von ${patient.sessionsDone} gesamt`)}
          tone="navy"
        />
        <KpiTile
          icon={<Heart className="w-4 h-4" />}
          label={tr("FC cible 75 %", "FC-Ziel 75 %")}
          value={`${fcTarget} bpm`}
          sub={tr(`FCmax ${fcMax} (${FORMULAS[formulaKey].label.split(" ")[0]})`, `FCmax ${fcMax}`)}
          tone="clover"
        />
        <KpiTile
          icon={<TrendingUp className="w-4 h-4" />}
          label={tr("Évolution FC moyenne", "Ø FC-Entwicklung")}
          value={
            trend != null
              ? `${trend.fcDelta >= 0 ? "+" : ""}${trend.fcDelta} bpm`
              : "—"
          }
          sub={tr("première vs dernière séance", "erste vs. letzte Sitzung")}
          tone={trend && trend.fcDelta > 0 ? "clover" : "navy"}
        />
        <KpiTile
          icon={<Activity className="w-4 h-4" />}
          label={tr("Δ EVA", "Δ VAS")}
          value={trend != null ? `${trend.evaDelta >= 0 ? "+" : ""}${trend.evaDelta}` : "—"}
          sub={tr("douleur après séance", "Schmerz nach Sitzung")}
          tone={trend && trend.evaDelta < 0 ? "clover" : "amber"}
        />
      </div>

      {/* Graphique progression */}
      {chartData.length > 0 && (
        <div className="rounded-xl border border-hairline bg-white p-5">
          <div className="font-serif text-base text-navy mb-3">
            {tr("Progression sur le programme", "Verlauf über das Programm")}
          </div>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid stroke="#eef4fa" strokeDasharray="3 3" />
                <XAxis
                  dataKey="n"
                  stroke="#6b7280"
                  fontSize={11}
                  label={{
                    value: tr("Séance", "Sitzung"),
                    position: "insideBottom",
                    offset: -2,
                    fontSize: 11,
                    fill: "#6b7280",
                  }}
                />
                <YAxis
                  yAxisId="fc"
                  stroke="#c0392b"
                  fontSize={11}
                  unit=" bpm"
                  domain={[60, 180]}
                />
                <YAxis
                  yAxisId="eva"
                  orientation="right"
                  stroke="#d35400"
                  fontSize={11}
                  unit="/10"
                  domain={[0, 10]}
                />
                <Tooltip
                  contentStyle={{ borderRadius: 8, border: "1px solid #c8d6e5", fontSize: 12 }}
                  labelFormatter={(v) => tr(`Séance ${v}`, `Sitzung ${v}`)}
                />
                <ReferenceLine
                  yAxisId="fc"
                  y={fcTarget}
                  stroke="#1a6b45"
                  strokeDasharray="4 3"
                  label={{ value: `cible ${fcTarget}`, position: "right", fontSize: 10, fill: "#1a6b45" }}
                />
                <Line
                  yAxisId="fc"
                  type="monotone"
                  dataKey="fcAvg"
                  name={tr("FC moy.", "Ø FC")}
                  stroke="#c0392b"
                  strokeWidth={2.5}
                  dot={{ r: 3 }}
                />
                <Line
                  yAxisId="eva"
                  type="monotone"
                  dataKey="eva"
                  name={tr("EVA après", "VAS nach")}
                  stroke="#d35400"
                  strokeWidth={2}
                  strokeDasharray="4 3"
                  dot={{ r: 3 }}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} iconSize={8} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Bouton ajout */}
      {!showAdd && (
        <button
          onClick={() => setShowAdd(true)}
          className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg border-2 border-dashed border-navy/40 text-navy hover:bg-navy-pale hover:border-navy transition text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          {tr(`Saisir séance n°${nextSessionNumber}`, `Sitzung Nr. ${nextSessionNumber} erfassen`)}
        </button>
      )}

      {/* Formulaire saisie */}
      {showAdd && (
        <NewSessionForm
          patient={patient}
          sessionNumber={nextSessionNumber}
          fcTarget={fcTarget}
          onCancel={() => setShowAdd(false)}
          onSave={(s) => {
            setLocalSessions((prev) => [...prev, s]);
            setShowAdd(false);
          }}
        />
      )}

      {/* Historique */}
      {all.length > 0 && (
        <div className="rounded-xl border border-hairline bg-white overflow-hidden">
          <div className="px-5 py-3 border-b border-hairline/60 flex items-center justify-between">
            <div className="font-serif text-base text-navy">
              {tr("Historique des séances", "Sitzungsverlauf")}
            </div>
            <div className="text-xs text-slate">
              {all.length} {tr("séances enregistrées", "erfasste Sitzungen")}
            </div>
          </div>
          <div className="divide-y divide-hairline/40">
            {[...all].reverse().map((s) => {
              const fcAvg = avgFcSession(s);
              const fcMaxS = maxFcSession(s);
              const dur = totalDuration(s);
              const isExpanded = expandedSession === s.id;
              const reachedTarget = fcAvg != null && fcAvg >= fcTarget * 0.92; // tolérance ±8%
              return (
                <div key={s.id}>
                  <button
                    onClick={() => setExpandedSession(isExpanded ? null : s.id)}
                    className="w-full px-5 py-3 flex items-center gap-3 hover:bg-slate-light/30 transition text-left"
                  >
                    <div className="w-12 h-12 rounded-lg bg-navy-pale text-navy flex flex-col items-center justify-center shrink-0">
                      <div className="text-[9px] uppercase tracking-wide opacity-70">
                        {tr("Séance", "Sitzung")}
                      </div>
                      <div className="text-base font-bold leading-none">{s.sessionNumber}</div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-navy">
                        {new Date(s.date).toLocaleDateString(lang === "de" ? "de-DE" : "fr-BE", {
                          weekday: "short",
                          day: "2-digit",
                          month: "short",
                        })}{" "}
                        ·{" "}
                        {new Date(s.date).toLocaleTimeString(lang === "de" ? "de-DE" : "fr-BE", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                      <div className="text-xs text-slate mt-0.5 flex flex-wrap gap-x-3 gap-y-0.5">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {dur} min
                        </span>
                        {fcAvg != null && (
                          <span className={cn("flex items-center gap-1", reachedTarget && "text-clover font-medium")}>
                            <Heart className="w-3 h-3" /> Ø {fcAvg} bpm
                            {fcMaxS != null && ` / max ${fcMaxS}`}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          EVA {s.evaPainBefore} → {s.evaPainAfter ?? "—"}
                        </span>
                        <span className="text-slate/70">{s.uses.length} {tr("appareils", "Geräte")}</span>
                      </div>
                    </div>
                    {reachedTarget ? (
                      <CheckCircle2 className="w-4 h-4 text-clover shrink-0" />
                    ) : null}
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-slate" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-slate" />
                    )}
                  </button>
                  {isExpanded && (
                    <div className="px-5 pb-4 bg-slate-light/20">
                      <SessionDetail session={s} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {all.length === 0 && !showAdd && (
        <div className="rounded-xl border border-hairline bg-white p-8 text-center text-sm text-slate">
          {tr(
            "Aucune séance appareils enregistrée. Cliquez « Saisir séance » pour commencer.",
            "Noch keine Geräte-Sitzung erfasst. Klicken Sie « Sitzung erfassen », um zu beginnen."
          )}
        </div>
      )}
    </div>
  );
}

// ─── Sous-composants ───────────────────────────────────────────────

function KpiTile({
  icon,
  label,
  value,
  sub,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  tone: "navy" | "clover" | "amber";
}) {
  const toneCls =
    tone === "clover"
      ? "bg-clover-soft text-clover"
      : tone === "amber"
      ? "bg-amber-soft text-amber"
      : "bg-navy-pale text-navy";
  return (
    <div className="rounded-lg border border-hairline bg-white p-3">
      <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-slate font-medium">
        <span className={cn("w-6 h-6 rounded flex items-center justify-center", toneCls)}>
          {icon}
        </span>
        {label}
      </div>
      <div className="mt-1.5 text-xl font-bold text-navy tabular-nums">{value}</div>
      {sub && <div className="text-[11px] text-slate mt-0.5">{sub}</div>}
    </div>
  );
}

function SessionDetail({ session }: { session: ApparatusSession }) {
  const { lang } = useApp();
  const tr = (fr: string, de: string) => (lang === "de" ? de : fr);
  return (
    <div className="space-y-3 pt-3">
      <div className="grid gap-2">
        {session.uses.map((u, i) => {
          const eq = getEquipment(u.equipmentId);
          if (!eq) return null;
          const Icon = EQUIPMENT_ICONS[eq.iconKey];
          return (
            <div
              key={i}
              className="flex items-center gap-3 p-2.5 rounded-md bg-white border border-hairline"
            >
              <div
                className="w-9 h-9 rounded-md flex items-center justify-center shrink-0"
                style={{ backgroundColor: `${EQUIPMENT_COLORS[eq.type]}15`, color: EQUIPMENT_COLORS[eq.type] }}
              >
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-navy">{tr(eq.labelFr, eq.labelDe)}</div>
                <div className="text-xs text-slate flex flex-wrap gap-x-3 mt-0.5">
                  <span>{u.durationMin} min</span>
                  {Object.entries(u.settings).map(([k, v]) => {
                    const param = eq.params.find((p) => p.key === k);
                    if (!param) return null;
                    return (
                      <span key={k}>
                        {tr(param.labelFr, param.labelDe)} : <strong>{v}{param.unit ? ` ${param.unit}` : ""}</strong>
                      </span>
                    );
                  })}
                </div>
              </div>
              <div className="text-right text-xs">
                {u.fcAvg != null && (
                  <div>
                    <span className="text-slate">Ø</span>{" "}
                    <span className="font-bold text-accent tabular-nums">{u.fcAvg}</span>
                  </div>
                )}
                {u.fcMax != null && (
                  <div className="text-slate/80">
                    max {u.fcMax}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      {session.notes && (
        <div className="text-xs italic text-slate p-2 rounded bg-amber-soft/40">
          💬 {session.notes}
        </div>
      )}
    </div>
  );
}

function NewSessionForm({
  patient,
  sessionNumber,
  fcTarget,
  onCancel,
  onSave,
}: {
  patient: Patient;
  sessionNumber: number;
  fcTarget: number;
  onCancel: () => void;
  onSave: (s: ApparatusSession) => void;
}) {
  const { lang } = useApp();
  const tr = (fr: string, de: string) => (lang === "de" ? de : fr);
  const [evaBefore, setEvaBefore] = useState(3);
  const [evaAfter, setEvaAfter] = useState<number | null>(null);
  const [notes, setNotes] = useState("");
  const [uses, setUses] = useState<ApparatusUse[]>([]);

  const addUse = (eq: Equipment) => {
    const defaultSettings: Record<string, number> = {};
    eq.params.forEach((p) => {
      defaultSettings[p.key] = p.defaultValue ?? p.min ?? 0;
    });
    setUses((prev) => [
      ...prev,
      {
        equipmentId: eq.id,
        durationMin: 10,
        fcAvg: null,
        fcMax: null,
        settings: defaultSettings,
        note: "",
      },
    ]);
  };

  const updateUse = (i: number, patch: Partial<ApparatusUse>) =>
    setUses((prev) => prev.map((u, j) => (j === i ? { ...u, ...patch } : u)));

  const removeUse = (i: number) => setUses((prev) => prev.filter((_, j) => j !== i));

  const save = () => {
    if (uses.length === 0) return;
    onSave({
      id: `local-${patient.id}-${sessionNumber}-${Date.now()}`,
      patientId: patient.id,
      sessionNumber,
      date: new Date().toISOString(),
      staff: "Ph. Banaszak",
      evaPainBefore: evaBefore,
      evaPainAfter: evaAfter,
      uses,
      notes,
    });
  };

  return (
    <div className="rounded-xl border-2 border-navy bg-white p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs uppercase tracking-wider text-slate font-medium">
            {tr("Nouvelle séance", "Neue Sitzung")}
          </div>
          <div className="font-serif text-lg text-navy">
            {tr(`Séance n°${sessionNumber} / 36`, `Sitzung Nr. ${sessionNumber} / 36`)}
          </div>
        </div>
        <button onClick={onCancel} className="text-slate hover:text-navy">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* EVA before */}
      <EvaSlider
        label={tr("EVA douleur AVANT séance", "VAS Schmerz VOR Sitzung")}
        value={evaBefore}
        onChange={setEvaBefore}
      />

      {/* Selection appareils */}
      <div>
        <div className="text-xs text-slate uppercase tracking-wide font-medium mb-2">
          {tr("Ajouter un appareil", "Gerät hinzufügen")}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {EQUIPMENT.map((eq) => {
            const Icon = EQUIPMENT_ICONS[eq.iconKey];
            return (
              <button
                key={eq.id}
                onClick={() => addUse(eq)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-hairline text-xs font-medium hover:border-navy hover:bg-navy-pale text-navy"
              >
                <Icon className="w-3.5 h-3.5" style={{ color: EQUIPMENT_COLORS[eq.type] }} />
                {tr(eq.labelFr, eq.labelDe)}
              </button>
            );
          })}
        </div>
      </div>

      {/* Appareils ajoutés */}
      {uses.length > 0 && (
        <div className="space-y-2">
          <div className="text-xs text-slate uppercase tracking-wide font-medium">
            {tr("Programme du jour", "Tagesprogramm")} · {tr(`Cible FC ≈ ${fcTarget} bpm`, `FC-Ziel ≈ ${fcTarget} bpm`)}
          </div>
          {uses.map((u, i) => {
            const eq = getEquipment(u.equipmentId)!;
            const Icon = EQUIPMENT_ICONS[eq.iconKey];
            return (
              <div key={i} className="rounded-lg border border-hairline bg-slate-light/20 p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Icon className="w-4 h-4" style={{ color: EQUIPMENT_COLORS[eq.type] }} />
                  <div className="font-medium text-navy text-sm flex-1">
                    {tr(eq.labelFr, eq.labelDe)}
                  </div>
                  <button
                    onClick={() => removeUse(i)}
                    className="text-slate hover:text-accent"
                    aria-label="remove"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <NumField
                    label={tr("Durée", "Dauer")}
                    unit="min"
                    value={u.durationMin}
                    onChange={(v) => updateUse(i, { durationMin: v })}
                    min={1}
                    max={60}
                    step={1}
                  />
                  {eq.params.map((p) => (
                    <NumField
                      key={p.key}
                      label={tr(p.labelFr, p.labelDe)}
                      unit={p.unit}
                      value={u.settings[p.key] ?? 0}
                      onChange={(v) =>
                        updateUse(i, { settings: { ...u.settings, [p.key]: v } })
                      }
                      min={p.min}
                      max={p.max}
                      step={p.step}
                    />
                  ))}
                  <NumField
                    label={tr("FC moy.", "Ø FC")}
                    unit="bpm"
                    value={u.fcAvg ?? 0}
                    onChange={(v) => updateUse(i, { fcAvg: v || null })}
                    min={50}
                    max={200}
                    placeholder
                    highlight={u.fcAvg != null && u.fcAvg >= fcTarget}
                  />
                  <NumField
                    label={tr("FC max", "Max FC")}
                    unit="bpm"
                    value={u.fcMax ?? 0}
                    onChange={(v) => updateUse(i, { fcMax: v || null })}
                    min={50}
                    max={210}
                    placeholder
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* EVA after */}
      <EvaSlider
        label={tr("EVA douleur APRÈS séance", "VAS Schmerz NACH Sitzung")}
        value={evaAfter ?? evaBefore}
        onChange={(v) => setEvaAfter(v)}
        optional
      />

      {/* Notes */}
      <div>
        <div className="text-xs text-slate uppercase tracking-wide font-medium mb-1">
          {tr("Notes (optionnel)", "Notizen (optional)")}
        </div>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          className="w-full rounded-md border border-hairline px-3 py-2 text-sm"
          placeholder={tr(
            "Ressenti patient, adaptations, événements particuliers…",
            "Patientenempfinden, Anpassungen, besondere Ereignisse…"
          )}
        />
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2 pt-2 border-t border-hairline/60">
        <button
          onClick={onCancel}
          className="px-3 py-2 rounded-md text-sm border border-hairline text-slate hover:text-navy"
        >
          {tr("Annuler", "Abbrechen")}
        </button>
        <button
          onClick={save}
          disabled={uses.length === 0}
          className={cn(
            "inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition",
            uses.length > 0
              ? "bg-navy text-white hover:bg-navy-mid"
              : "bg-slate-light text-slate cursor-not-allowed"
          )}
        >
          <Save className="w-4 h-4" />
          {tr("Enregistrer la séance", "Sitzung speichern")}
        </button>
      </div>
    </div>
  );
}

function EvaSlider({
  label,
  value,
  onChange,
  optional,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  optional?: boolean;
}) {
  const color = value <= 3 ? "#1a6b45" : value <= 6 ? "#d35400" : "#c0392b";
  return (
    <div>
      <div className="flex items-center justify-between text-xs mb-1.5">
        <span className="text-slate uppercase tracking-wide font-medium">
          {label} {optional && <span className="text-slate/60 normal-case">(optionnel)</span>}
        </span>
        <span className="font-bold tabular-nums" style={{ color }}>
          {value}/10
        </span>
      </div>
      <input
        type="range"
        min={0}
        max={10}
        step={1}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-full"
        style={{ accentColor: color }}
      />
      <div className="flex justify-between text-[10px] text-slate mt-0.5 px-0.5">
        <span>0</span>
        <span>3</span>
        <span>5</span>
        <span>7</span>
        <span>10</span>
      </div>
    </div>
  );
}

function NumField({
  label,
  unit,
  value,
  onChange,
  min,
  max,
  step,
  placeholder,
  highlight,
}: {
  label: string;
  unit?: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  placeholder?: boolean;
  highlight?: boolean;
}) {
  return (
    <div>
      <div className="text-[10px] text-slate uppercase tracking-wide font-medium mb-0.5">
        {label} {unit && <span className="opacity-60 normal-case">({unit})</span>}
      </div>
      <input
        type="number"
        value={placeholder && value === 0 ? "" : value}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        min={min}
        max={max}
        step={step}
        className={cn(
          "w-full rounded border border-hairline px-2 py-1 text-sm tabular-nums",
          highlight && "border-clover bg-clover-soft text-clover font-bold"
        )}
        placeholder={placeholder ? "—" : undefined}
      />
    </div>
  );
}

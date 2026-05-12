"use client";

import { useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Bike,
  Heart,
  Gauge,
  Trash2,
  Plus,
  FileText,
  Sparkles,
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
  ReferenceArea,
} from "recharts";
import type { Patient } from "@/lib/mock-data";
import { useApp } from "@/lib/app-context";
import { cn } from "@/lib/utils";
import {
  FORMULAS,
  suggestFormula,
  classifyWkg,
  getCategoryMeta,
  computeWkg,
  getBracketForAge,
  PROTOCOL,
  SAFETY_CHECKS_FR,
  type FormulaKey,
} from "@/lib/cardio-norms";
import { generateBikeTestReport } from "@/lib/pdf/bikeTestReport";

type Step = { t: number; watts: number; rpm: number | null; fc: number | null; note: string };

type StopReason =
  | "target"
  | "max_charge"
  | "impossible_pain"
  | "refusal"
  | "chest_pain"
  | "dizziness"
  | "dyspnea"
  | "low_rpm"
  | "ta_high";

const STOP_LABELS_FR: Record<StopReason, string> = {
  target: "Cible 75 % FCmax atteinte ✓",
  max_charge: "Charge maximale atteinte sans cible",
  impossible_pain: "Test impossible — douleur trop forte",
  refusal: "Refus du patient",
  chest_pain: "Douleur thoracique",
  dizziness: "Pâleur / vertige / malaise",
  dyspnea: "Dyspnée sévère",
  low_rpm: "RPM ne peut être maintenue > 50",
  ta_high: "TA > 250/115 mmHg",
};
const STOP_LABELS_DE: Record<StopReason, string> = {
  target: "Ziel 75 % FCmax erreicht ✓",
  max_charge: "Maximalleistung erreicht ohne Ziel",
  impossible_pain: "Test nicht möglich — zu starke Schmerzen",
  refusal: "Patient verweigert",
  chest_pain: "Brustschmerz",
  dizziness: "Blässe / Schwindel / Unwohlsein",
  dyspnea: "Schwere Dyspnoe",
  low_rpm: "RPM kann nicht > 50 gehalten werden",
  ta_high: "RR > 250/115 mmHg",
};

function ageOf(dob: string): number {
  return Math.floor((Date.now() - new Date(dob).getTime()) / (365.25 * 24 * 3600 * 1000));
}

function buildStepsTemplate(): Step[] {
  // 13 paliers : 25 W → 325 W
  return Array.from({ length: 13 }).map((_, i) => ({
    t: (i + 1) * PROTOCOL.stepDurationMin,
    watts: PROTOCOL.startWatts * (i + 1),
    rpm: null,
    fc: null,
    note: "",
  }));
}

export function BikeTest({ patient, onSaved }: { patient: Patient; onSaved?: () => void }) {
  const { lang } = useApp();
  const tr = (fr: string, de: string) => (lang === "de" ? de : fr);
  const STOP_LABELS = lang === "de" ? STOP_LABELS_DE : STOP_LABELS_FR;

  const sex = patient.gender;
  const initialAge = ageOf(patient.dob);

  // ─── Pre-test ───
  const [phase, setPhase] = useState<"prep" | "test" | "result">("prep");
  const [safety, setSafety] = useState<Record<string, boolean>>({});
  const [weight, setWeight] = useState<number | "">("");
  const [height, setHeight] = useState<number | "">("");
  const [age, setAge] = useState<number>(initialAge);
  const [formula, setFormula] = useState<FormulaKey>(suggestFormula(initialAge, sex));
  const [bikeId, setBikeId] = useState("Tunturi #3");
  const [seatHeight, setSeatHeight] = useState("");

  // ─── Test live ───
  const [steps, setSteps] = useState<Step[]>(buildStepsTemplate());

  // ─── Result ───
  const [stopReason, setStopReason] = useState<StopReason>("target");
  const [stopAtIndex, setStopAtIndex] = useState<number>(0);
  const [remarks, setRemarks] = useState("");

  // ─── Computed ───
  const fcMax = FORMULAS[formula].compute(age, sex);
  const fcTarget = Math.round((fcMax * PROTOCOL.targetFcPercent) / 100);
  const fcAlarm = Math.round((fcMax * PROTOCOL.alarmFcPercent) / 100);

  const finalWatts = useMemo(() => {
    if (stopReason === "impossible_pain" || stopReason === "refusal") return PROTOCOL.startWatts;
    return steps[stopAtIndex]?.watts ?? PROTOCOL.startWatts;
  }, [stopAtIndex, stopReason, steps]);

  const wkg = useMemo(
    () => (typeof weight === "number" && weight > 0 ? computeWkg(finalWatts, weight) : 0),
    [finalWatts, weight]
  );

  const category = useMemo(
    () => (wkg > 0 ? classifyWkg(wkg, age, sex) : "very_low"),
    [wkg, age, sex]
  );

  const bracket = getBracketForAge(age);

  // Validation pre-test
  const safetyBlockers = useMemo(() => {
    const blockers: string[] = [];
    if (safety["betablock"]) blockers.push(SAFETY_CHECKS_FR[0].warning);
    if (safety["hypertension"]) blockers.push(SAFETY_CHECKS_FR[2].warning);
    if (safety["pain_high"]) blockers.push(SAFETY_CHECKS_FR[3].warning);
    if (!safety["consent"]) blockers.push(SAFETY_CHECKS_FR[4].warning);
    return blockers;
  }, [safety]);

  const canStart = typeof weight === "number" && weight > 30 && weight < 250 && safety["consent"];

  // ─── Render ───
  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="rounded-xl bg-gradient-to-br from-navy via-navy-mid to-navy text-white p-5">
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <div className="flex items-center gap-2 text-sm uppercase tracking-wider opacity-80">
              <Bike className="w-4 h-4" />
              {tr("Test endurance vélo", "Ausdauertest Fahrrad")}
            </div>
            <h2 className="font-serif text-2xl mt-1">
              {patient.firstName} {patient.lastName}
            </h2>
            <div className="text-sm opacity-80 mt-0.5">
              {age} {tr("ans", "Jahre")} · {sex === "F" ? "♀" : "♂"} ·{" "}
              {tr("Protocole sub-max 75 % FCmax", "Submax-Protokoll 75 % FCmax")}
            </div>
          </div>
          <div className="flex gap-2 text-xs">
            {(["prep", "test", "result"] as const).map((p, i) => (
              <div
                key={p}
                className={cn(
                  "px-3 py-1 rounded-full border transition",
                  phase === p
                    ? "bg-white text-navy border-white font-semibold"
                    : "border-white/40 opacity-70"
                )}
              >
                {i + 1}. {p === "prep" ? tr("Préparation", "Vorbereitung") : p === "test" ? tr("Test", "Test") : tr("Résultats", "Ergebnisse")}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* PHASE 1 — PREP */}
      {phase === "prep" && (
        <div className="space-y-5">
          {/* Identity & calculs */}
          <section className="rounded-xl border border-hairline bg-white p-5">
            <div className="font-serif text-base text-navy mb-3 flex items-center gap-2">
              <Activity className="w-4 h-4" />
              {tr("Identité & paramètres", "Identität & Parameter")}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Field label={tr("Âge", "Alter")}>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(parseInt(e.target.value) || 0)}
                  className="input"
                />
              </Field>
              <Field label={tr("Poids (kg)", "Gewicht (kg)")} required>
                <input
                  type="number"
                  step="0.1"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value === "" ? "" : parseFloat(e.target.value))}
                  className="input"
                  placeholder="—"
                />
              </Field>
              <Field label={tr("Taille (cm)", "Größe (cm)")}>
                <input
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(e.target.value === "" ? "" : parseInt(e.target.value))}
                  className="input"
                  placeholder="—"
                />
              </Field>
              <Field label={tr("Vélo", "Fahrrad")}>
                <select value={bikeId} onChange={(e) => setBikeId(e.target.value)} className="input">
                  {["Tunturi #1", "Tunturi #2", "Tunturi #3", "Tunturi #4", "Tunturi #5", "Tunturi #6"].map((b) => (
                    <option key={b}>{b}</option>
                  ))}
                </select>
              </Field>
            </div>

            {/* Formula selector */}
            <div className="mt-4">
              <div className="text-xs text-slate uppercase tracking-wide mb-2 font-medium">
                {tr("Formule FCmax", "FCmax-Formel")}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                {(Object.keys(FORMULAS) as FormulaKey[]).map((k) => (
                  <button
                    key={k}
                    onClick={() => setFormula(k)}
                    className={cn(
                      "text-left p-3 rounded-lg border transition",
                      formula === k
                        ? "border-navy bg-navy-pale ring-2 ring-navy/20"
                        : "border-hairline bg-white hover:border-navy-mid"
                    )}
                  >
                    <div className="font-semibold text-navy text-sm">{FORMULAS[k].label}</div>
                    <div className="text-xs text-slate">{FORMULAS[k].sublabel}</div>
                    <div className="text-xs text-ink mt-1.5 font-mono tabular-nums">
                      = {FORMULAS[k].compute(age, sex)} bpm
                    </div>
                  </button>
                ))}
              </div>
              <div className="mt-2 text-xs text-slate italic flex items-start gap-1.5">
                <Sparkles className="w-3 h-3 mt-0.5 shrink-0" />
                {FORMULAS[formula].recommendation}
              </div>
            </div>

            {/* Calculs résultats */}
            <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-3">
              <KpiCell label="FC max" value={`${fcMax} bpm`} tone="navy" />
              <KpiCell
                label={tr("Cible 75 %", "Ziel 75 %")}
                value={`${fcTarget} bpm`}
                tone="clover"
                emphasis
              />
              <KpiCell label={tr("Alarme 85 %", "Alarm 85 %")} value={`${fcAlarm} bpm`} tone="amber" />
            </div>
          </section>

          {/* Sécurité */}
          <section className="rounded-xl border border-hairline bg-white p-5">
            <div className="font-serif text-base text-navy mb-3 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber" />
              {tr("Checklist sécurité", "Sicherheitscheckliste")}
            </div>
            <div className="space-y-2">
              {SAFETY_CHECKS_FR.map((c) => {
                const checked = !!safety[c.id];
                const isPositiveOk = c.id === "consent";
                const showWarning = isPositiveOk ? !checked : checked;
                return (
                  <div key={c.id}>
                    <label className="flex items-start gap-2.5 cursor-pointer text-sm">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) => setSafety((s) => ({ ...s, [c.id]: e.target.checked }))}
                        className="mt-0.5"
                      />
                      <span className="text-ink">{c.label}</span>
                    </label>
                    {showWarning && (
                      <div className="ml-6 mt-1 text-xs text-accent flex items-start gap-1">
                        <AlertTriangle className="w-3 h-3 mt-0.5 shrink-0" />
                        <span>{c.warning}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <Field label={tr("Réglage selle (notes)", "Sattel-Einstellung (Notizen)")} className="mt-3">
              <input
                value={seatHeight}
                onChange={(e) => setSeatHeight(e.target.value)}
                className="input"
                placeholder={tr("ex. cran 6, jambe non tendue à PMI", "z.B. Stufe 6, Bein nicht gestreckt")}
              />
            </Field>
          </section>

          <div className="flex justify-end gap-2">
            <button
              onClick={() => setPhase("test")}
              disabled={!canStart}
              className={cn(
                "inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium",
                canStart ? "bg-navy text-white hover:bg-navy-mid" : "bg-slate-light text-slate cursor-not-allowed"
              )}
            >
              {tr("Démarrer le test", "Test starten")} →
            </button>
          </div>
          {!canStart && (
            <div className="text-xs text-slate text-right">
              {tr("Saisir le poids et cocher le consentement pour continuer.", "Gewicht eingeben und Einwilligung ankreuzen.")}
            </div>
          )}
        </div>
      )}

      {/* PHASE 2 — TEST LIVE */}
      {phase === "test" && (
        <div className="space-y-5">
          {/* Live metrics */}
          <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <KpiCell label={tr("Cible", "Ziel")} value={`${fcTarget} bpm`} tone="clover" emphasis />
            <KpiCell label={tr("Alarme", "Alarm")} value={`${fcAlarm} bpm`} tone="amber" />
            <KpiCell label={tr("Cadence", "Kadenz")} value={`${PROTOCOL.targetCadenceMin}–${PROTOCOL.targetCadenceMax} RPM`} tone="navy" />
            <KpiCell label={tr("Vélo", "Fahrrad")} value={bikeId} tone="navy" />
          </section>

          {/* Tableau saisie */}
          <section className="rounded-xl border border-hairline bg-white overflow-hidden">
            <div className="px-5 py-3 border-b border-hairline/60 flex items-center justify-between">
              <div className="font-serif text-base text-navy flex items-center gap-2">
                <Gauge className="w-4 h-4" />
                {tr("Saisie progressive (paliers de 2 min)", "Schrittweise Erfassung (2-Min-Stufen)")}
              </div>
              <div className="text-xs text-slate">
                {tr("Cliquez « Cible atteinte » sur la ligne où vous arrêtez", "Klicken Sie « Ziel erreicht » in der Zeile, wo Sie stoppen")}
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-light/40 text-slate text-xs uppercase tracking-wide">
                  <tr>
                    <th className="text-left px-3 py-2 font-medium">{tr("Temps", "Zeit")}</th>
                    <th className="text-left px-3 py-2 font-medium">{tr("Charge", "Last")}</th>
                    <th className="text-left px-3 py-2 font-medium">RPM</th>
                    <th className="text-left px-3 py-2 font-medium">FC (bpm)</th>
                    <th className="text-left px-3 py-2 font-medium">% FCmax</th>
                    <th className="text-left px-3 py-2 font-medium">{tr("Note", "Notiz")}</th>
                    <th className="px-3 py-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {steps.map((s, i) => {
                    const pct = s.fc != null ? Math.round((s.fc / fcMax) * 100) : null;
                    const isStop = false; // not relevant during live test phase
                    const overTarget = pct != null && pct >= PROTOCOL.targetFcPercent;
                    const overAlarm = pct != null && pct >= PROTOCOL.alarmFcPercent;
                    return (
                      <tr
                        key={i}
                        className={cn(
                          "border-t border-hairline/40 transition",
                          isStop && "bg-clover-soft",
                          overAlarm && !isStop && "bg-accent/5"
                        )}
                      >
                        <td className="px-3 py-2 font-mono text-slate tabular-nums">{s.t}'</td>
                        <td className="px-3 py-2 font-semibold text-navy tabular-nums">{s.watts} W</td>
                        <td className="px-3 py-2">
                          <input
                            type="number"
                            value={s.rpm ?? ""}
                            onChange={(e) =>
                              setSteps((ss) =>
                                ss.map((x, j) =>
                                  j === i ? { ...x, rpm: e.target.value === "" ? null : parseInt(e.target.value) } : x
                                )
                              )
                            }
                            className="w-16 input-sm"
                            placeholder="—"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <input
                            type="number"
                            value={s.fc ?? ""}
                            onChange={(e) =>
                              setSteps((ss) =>
                                ss.map((x, j) =>
                                  j === i ? { ...x, fc: e.target.value === "" ? null : parseInt(e.target.value) } : x
                                )
                              )
                            }
                            className="w-20 input-sm"
                            placeholder="—"
                          />
                        </td>
                        <td className="px-3 py-2 tabular-nums">
                          {pct != null && (
                            <span
                              className={cn(
                                "font-semibold",
                                overAlarm ? "text-accent" : overTarget ? "text-clover" : "text-slate"
                              )}
                            >
                              {pct}%
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-2">
                          <input
                            value={s.note}
                            onChange={(e) =>
                              setSteps((ss) => ss.map((x, j) => (j === i ? { ...x, note: e.target.value } : x)))
                            }
                            className="w-full input-sm"
                            placeholder=""
                          />
                        </td>
                        <td className="px-3 py-2 text-right">
                          <button
                            onClick={() => {
                              setStopAtIndex(i);
                              setStopReason("target");
                              setPhase("result");
                            }}
                            disabled={s.fc == null}
                            className={cn(
                              "px-2.5 py-1.5 rounded-md text-xs font-medium",
                              s.fc != null
                                ? "bg-clover text-white hover:bg-clover/90"
                                : "bg-slate-light text-slate cursor-not-allowed"
                            )}
                          >
                            ✓ {tr("Stop", "Stopp")}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>

          {/* Boutons stop alternatifs */}
          <section className="rounded-xl border border-hairline bg-white p-4">
            <div className="text-xs text-slate uppercase tracking-wide font-medium mb-2">
              {tr("Arrêt anticipé (sans cible)", "Vorzeitiger Abbruch (ohne Ziel)")}
            </div>
            <div className="flex flex-wrap gap-2">
              {(["impossible_pain", "refusal", "chest_pain", "dizziness", "dyspnea", "low_rpm", "ta_high"] as StopReason[]).map(
                (r) => (
                  <button
                    key={r}
                    onClick={() => {
                      setStopReason(r);
                      setStopAtIndex(0);
                      setPhase("result");
                    }}
                    className="text-xs px-2.5 py-1 rounded-md border border-amber/50 text-amber hover:bg-amber-soft"
                  >
                    {STOP_LABELS[r]}
                  </button>
                )
              )}
            </div>
          </section>

          <div className="flex justify-between">
            <button onClick={() => setPhase("prep")} className="text-sm text-slate hover:text-navy">
              ← {tr("Retour préparation", "Zurück zur Vorbereitung")}
            </button>
          </div>
        </div>
      )}

      {/* PHASE 3 — RESULT */}
      {phase === "result" && (
        <div className="space-y-5">
          {/* Résumé */}
          <section className="rounded-xl bg-white border border-hairline p-5">
            <div className="font-serif text-base text-navy mb-3">
              {tr("Résultat", "Ergebnis")}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <ResultBig
                label={tr("Charge max", "Maximalleistung")}
                value={`${finalWatts} W`}
                tone="navy"
              />
              <ResultBig
                label={tr("Poids", "Gewicht")}
                value={typeof weight === "number" ? `${weight} kg` : "—"}
                tone="navy"
              />
              <ResultBig
                label="W/kg"
                value={wkg > 0 ? wkg.toFixed(2) : "—"}
                tone="clover"
                big
              />
              <ResultBig
                label={tr("Catégorie ACSM", "ACSM-Kategorie")}
                value={tr(getCategoryMeta(category).fr, getCategoryMeta(category).de)}
                color={getCategoryMeta(category).color}
                big
              />
            </div>
            <div className="mt-3 text-sm text-slate flex items-start gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-clover mt-0.5 shrink-0" />
              <span>{STOP_LABELS[stopReason]}</span>
            </div>
          </section>

          {/* Positionnement sur courbe normative */}
          <section className="rounded-xl bg-white border border-hairline p-5">
            <div className="font-serif text-base text-navy mb-3">
              {tr("Positionnement sur la norme ACSM", "Position in der ACSM-Norm")}
            </div>
            <NormCurve wkg={wkg} age={age} sex={sex} />
            <div className="mt-3 grid grid-cols-5 gap-1 text-[10px]">
              {(["very_low", "low", "average", "good", "excellent"] as const).map((cat) => {
                const meta = getCategoryMeta(cat);
                return (
                  <div
                    key={cat}
                    className="rounded px-1.5 py-1 text-center font-medium"
                    style={{
                      backgroundColor: cat === category ? meta.color : "#f1f5f9",
                      color: cat === category ? "white" : meta.color,
                    }}
                  >
                    {tr(meta.fr, meta.de)}
                  </div>
                );
              })}
            </div>
            <div className="mt-3 text-xs text-slate">
              {tr("Tranche d'âge", "Altersgruppe")} <strong>{bracket.range}</strong> ·{" "}
              {tr("Seuils W/kg", "W/kg-Schwellen")} ({sex === "M" ? "♂" : "♀"}) :{" "}
              {(sex === "M" ? bracket.M : bracket.F).join(" / ")}
            </div>
          </section>

          {/* Courbe FC vs charge */}
          {steps.some((s) => s.fc != null) && (
            <section className="rounded-xl bg-white border border-hairline p-5">
              <div className="font-serif text-base text-navy mb-3 flex items-center gap-2">
                <Heart className="w-4 h-4 text-accent" />
                {tr("Courbe FC vs charge", "FC vs. Last-Kurve")}
              </div>
              <FcChart steps={steps} fcTarget={fcTarget} fcAlarm={fcAlarm} />
            </section>
          )}

          {/* Remarques */}
          <section className="rounded-xl bg-white border border-hairline p-5">
            <Field label={tr("Remarques", "Bemerkungen")}>
              <textarea
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                rows={3}
                className="input"
                placeholder={tr(
                  "Confort patient, sensations, contexte particulier…",
                  "Patientenkomfort, Empfindungen, besonderer Kontext…"
                )}
              />
            </Field>
          </section>

          {/* Actions */}
          <div className="flex flex-wrap justify-between gap-2">
            <button onClick={() => setPhase("test")} className="text-sm text-slate hover:text-navy">
              ← {tr("Retour saisie", "Zurück zur Erfassung")}
            </button>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setPhase("prep");
                  setSteps(buildStepsTemplate());
                  setStopAtIndex(0);
                  setRemarks("");
                  onSaved?.();
                }}
                className="px-4 py-2 rounded-lg text-sm font-medium border border-hairline text-navy hover:bg-navy-pale"
              >
                {tr("Nouveau test", "Neuer Test")}
              </button>
              <button
                onClick={() =>
                  generateBikeTestReport(
                    {
                      patient,
                      age,
                      weight: typeof weight === "number" ? weight : 0,
                      height: typeof height === "number" ? height : 0,
                      bikeId,
                      seatHeight,
                      formula,
                      fcMax,
                      fcTarget,
                      finalWatts,
                      wkg,
                      category,
                      stopReason: STOP_LABELS[stopReason],
                      steps,
                      remarks,
                    },
                    lang
                  )
                }
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-navy text-white hover:bg-navy-mid"
              >
                <FileText className="w-4 h-4" />
                {tr("Télécharger PDF", "PDF herunterladen")}
              </button>
            </div>
          </div>

          {!!safetyBlockers.length && (
            <div className="rounded-md bg-accent/5 border border-accent/30 p-3 text-xs text-accent flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <strong>{tr("Alertes sécurité notées :", "Vermerkte Sicherheitswarnungen:")}</strong>
                <ul className="list-disc ml-4 mt-1">
                  {safetyBlockers.map((b, i) => (
                    <li key={i}>{b}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Inline styles for inputs to keep markup compact */}
      <style jsx>{`
        :global(.input) {
          width: 100%;
          padding: 0.5rem 0.75rem;
          border-radius: 0.5rem;
          border: 1px solid #e2e8f0;
          font-size: 0.875rem;
          background: white;
        }
        :global(.input:focus) {
          outline: none;
          border-color: #2e5d8e;
          box-shadow: 0 0 0 2px rgba(46, 93, 142, 0.15);
        }
        :global(.input-sm) {
          padding: 0.25rem 0.5rem;
          border-radius: 0.375rem;
          border: 1px solid #e2e8f0;
          font-size: 0.875rem;
          background: white;
        }
      `}</style>
    </div>
  );
}

function Field({
  label,
  children,
  required,
  className,
}: {
  label: string;
  children: React.ReactNode;
  required?: boolean;
  className?: string;
}) {
  return (
    <div className={className}>
      <div className="text-xs text-slate uppercase tracking-wide mb-1 font-medium">
        {label} {required && <span className="text-accent">*</span>}
      </div>
      {children}
    </div>
  );
}

function KpiCell({
  label,
  value,
  tone,
  emphasis,
}: {
  label: string;
  value: string;
  tone: "navy" | "clover" | "amber";
  emphasis?: boolean;
}) {
  const bg =
    tone === "clover" ? "bg-clover-soft" : tone === "amber" ? "bg-amber-soft" : "bg-navy-pale";
  const txt =
    tone === "clover" ? "text-clover" : tone === "amber" ? "text-amber" : "text-navy";
  return (
    <div className={cn("rounded-lg p-3", bg, emphasis && "ring-2 ring-clover/30")}>
      <div className="text-[10px] uppercase tracking-wide text-slate font-medium">{label}</div>
      <div className={cn("text-lg font-bold tabular-nums", txt)}>{value}</div>
    </div>
  );
}

function ResultBig({
  label,
  value,
  tone,
  big,
  color,
}: {
  label: string;
  value: string;
  tone?: "navy" | "clover" | "amber";
  big?: boolean;
  color?: string;
}) {
  return (
    <div className="rounded-lg p-3 bg-navy-pale">
      <div className="text-[10px] uppercase tracking-wide text-slate font-medium">{label}</div>
      <div
        className={cn("font-bold tabular-nums mt-0.5", big ? "text-2xl" : "text-lg")}
        style={color ? { color } : undefined}
      >
        {value}
      </div>
    </div>
  );
}

function NormCurve({ wkg, age, sex }: { wkg: number; age: number; sex: "M" | "F" }) {
  // Construit une courbe lisse à partir des seuils ACSM par tranche d'âge
  const data = [20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80].map((a) => {
    const b = getBracketForAge(a);
    const t = sex === "M" ? b.M : b.F;
    return {
      age: a,
      veryLow: t[0],
      low: t[1],
      average: t[2],
      good: t[3],
    };
  });
  const userPoint = [{ age, wkg }];
  return (
    <div className="h-56">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid stroke="#eef4fa" strokeDasharray="3 3" />
          <XAxis dataKey="age" stroke="#6b7280" fontSize={11} unit=" ans" />
          <YAxis stroke="#6b7280" fontSize={11} unit=" W/kg" domain={[0, 4]} />
          <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #c8d6e5", fontSize: 12 }} />
          <Line type="monotone" dataKey="veryLow" stroke="#c0392b" strokeDasharray="2 3" dot={false} name="Très faible" />
          <Line type="monotone" dataKey="low" stroke="#d35400" strokeDasharray="3 3" dot={false} name="Faible" />
          <Line type="monotone" dataKey="average" stroke="#d4ac0d" strokeDasharray="4 3" dot={false} name="Moyen" />
          <Line type="monotone" dataKey="good" stroke="#1a6b45" strokeDasharray="5 3" dot={false} name="Bon" />
          {wkg > 0 && (
            <Line
              data={userPoint}
              type="monotone"
              dataKey="wkg"
              stroke="#1e3a5f"
              strokeWidth={0}
              dot={{ r: 8, fill: "#1e3a5f", stroke: "white", strokeWidth: 2 }}
              name="Patient"
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function FcChart({
  steps,
  fcTarget,
  fcAlarm,
}: {
  steps: Step[];
  fcTarget: number;
  fcAlarm: number;
}) {
  const data = steps
    .filter((s) => s.fc != null)
    .map((s) => ({ watts: s.watts, fc: s.fc as number, t: s.t }));
  return (
    <div className="h-56">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid stroke="#eef4fa" strokeDasharray="3 3" />
          <XAxis dataKey="watts" stroke="#6b7280" fontSize={11} unit=" W" />
          <YAxis stroke="#6b7280" fontSize={11} unit=" bpm" domain={[60, 200]} />
          <Tooltip
            contentStyle={{ borderRadius: 8, border: "1px solid #c8d6e5", fontSize: 12 }}
            formatter={(v) => [`${v} bpm`, "FC"]}
            labelFormatter={(v) => `${v} W`}
          />
          <ReferenceArea y1={fcAlarm} y2={210} fill="#c0392b" fillOpacity={0.08} />
          <ReferenceLine y={fcTarget} stroke="#1a6b45" strokeDasharray="4 3" label={{ value: "75%", position: "right", fontSize: 10, fill: "#1a6b45" }} />
          <ReferenceLine y={fcAlarm} stroke="#c0392b" strokeDasharray="4 3" label={{ value: "85% ⚠", position: "right", fontSize: 10, fill: "#c0392b" }} />
          <Line type="monotone" dataKey="fc" stroke="#c0392b" strokeWidth={2.5} dot={{ r: 4, fill: "#c0392b" }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

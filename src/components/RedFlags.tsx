"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  ShieldAlert,
  ShieldCheck,
  ChevronDown,
  ChevronRight,
  Phone,
  FileText,
  Stethoscope,
  XCircle,
} from "lucide-react";
import {
  FLAGS,
  CATEGORY_LABELS,
  SEVERITY_META,
  ALL_CATEGORIES,
  flagsByCategory,
  assessFlags,
  type FlagCategory,
} from "@/lib/red-flags";
import { useApp } from "@/lib/app-context";
import { cn } from "@/lib/utils";

// ─── Composant principal — checklist complète ──────────────────────
export function RedFlagsChecklist({
  initialChecked,
  onChange,
  context = "kine_t0",
}: {
  initialChecked?: string[];
  onChange?: (ids: string[]) => void;
  context?: "physio_prescription" | "kine_t0" | "during_program";
}) {
  const { lang } = useApp();
  const tr = (fr: string, de: string) => (lang === "de" ? de : fr);
  const [checkedIds, setCheckedIds] = useState<Set<string>>(
    new Set(initialChecked ?? [])
  );
  const [expandedCat, setExpandedCat] = useState<FlagCategory | null>("cauda_equina");

  const assessment = useMemo(() => assessFlags(checkedIds), [checkedIds]);

  const toggle = (id: string) => {
    setCheckedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      onChange?.(Array.from(next));
      return next;
    });
  };

  return (
    <div className="space-y-4">
      {/* Bandeau contexte responsabilité */}
      <ContextBanner context={context} />

      {/* Décision en haut, toujours visible */}
      <DecisionBanner assessment={assessment} />

      {/* Catégories */}
      <div className="space-y-2">
        {ALL_CATEGORIES.map((cat) => {
          const catFlags = flagsByCategory(cat);
          const checkedInCat = catFlags.filter((f) => checkedIds.has(f.id));
          const meta = CATEGORY_LABELS[cat];
          const isOpen = expandedCat === cat;
          const hasChecked = checkedInCat.length > 0;
          const maxSeverity = checkedInCat.reduce<string | null>((max, f) => {
            const order = ["urgent_vital", "urgent", "elevated", "moderate"];
            if (max == null) return f.severity;
            return order.indexOf(f.severity) < order.indexOf(max) ? f.severity : max;
          }, null);
          const sevMeta = maxSeverity ? SEVERITY_META[maxSeverity as keyof typeof SEVERITY_META] : null;

          return (
            <div
              key={cat}
              className={cn(
                "rounded-lg border bg-white overflow-hidden transition",
                hasChecked ? "border-l-4" : "border border-hairline",
                hasChecked && cat === "cauda_equina" && "border-l-red-700",
                hasChecked && cat !== "cauda_equina" && maxSeverity === "urgent" && "border-l-accent",
                hasChecked && maxSeverity === "elevated" && "border-l-amber",
                hasChecked && maxSeverity === "moderate" && "border-l-yellow-500"
              )}
              style={{
                borderLeftColor: hasChecked && sevMeta ? sevMeta.color : undefined,
              }}
            >
              <button
                onClick={() => setExpandedCat(isOpen ? null : cat)}
                className="w-full px-4 py-3 flex items-center gap-3 hover:bg-slate-light/30 text-left transition"
              >
                <span className="text-xl shrink-0">{meta.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-navy text-sm">
                    {tr(meta.fr, meta.de)}
                  </div>
                  <div className="text-xs text-slate mt-0.5">
                    {catFlags.length} {tr("question(s)", "Frage(n)")}
                    {hasChecked && (
                      <span className="ml-2 font-semibold" style={{ color: sevMeta?.color }}>
                        · {checkedInCat.length} {tr("coché(s)", "angekreuzt")}
                      </span>
                    )}
                  </div>
                </div>
                {hasChecked && sevMeta && (
                  <span
                    className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide"
                    style={{ backgroundColor: sevMeta.bg, color: sevMeta.color }}
                  >
                    {tr(sevMeta.fr, sevMeta.de)}
                  </span>
                )}
                {isOpen ? (
                  <ChevronDown className="w-4 h-4 text-slate" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-slate" />
                )}
              </button>

              {isOpen && (
                <div className="px-4 pb-3 pt-1 space-y-2 bg-slate-light/15 border-t border-hairline/40">
                  {catFlags.map((f) => {
                    const isChecked = checkedIds.has(f.id);
                    const sev = SEVERITY_META[f.severity];
                    return (
                      <label
                        key={f.id}
                        className={cn(
                          "flex items-start gap-2.5 p-2.5 rounded-md cursor-pointer transition border",
                          isChecked
                            ? "border-current"
                            : "border-transparent hover:bg-white"
                        )}
                        style={{
                          backgroundColor: isChecked ? sev.bg : undefined,
                          color: isChecked ? sev.color : undefined,
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggle(f.id)}
                          className="mt-0.5 shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm leading-snug">
                            {tr(f.questionFr, f.questionDe)}
                          </div>
                          {(f.hintFr || f.hintDe) && (
                            <div
                              className={cn(
                                "text-xs mt-1 italic",
                                isChecked ? "" : "text-slate"
                              )}
                            >
                              💡 {tr(f.hintFr ?? "", f.hintDe ?? "")}
                            </div>
                          )}
                          <div className="text-[10px] uppercase tracking-wide mt-1 font-semibold">
                            {tr(sev.fr, sev.de)}
                          </div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Action footer */}
      {checkedIds.size > 0 && (
        <div className="flex justify-between items-center p-3 rounded-lg bg-slate-light/40">
          <div className="text-xs text-slate">
            {checkedIds.size} {tr("drapeau(x) identifié(s)", "Flagge(n) identifiziert")}
          </div>
          <button
            onClick={() => {
              setCheckedIds(new Set());
              onChange?.([]);
            }}
            className="text-xs text-slate hover:text-navy underline"
          >
            {tr("Réinitialiser", "Zurücksetzen")}
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Bandeau décision ──────────────────────────────────────────────
function DecisionBanner({ assessment }: { assessment: ReturnType<typeof assessFlags> }) {
  const { lang } = useApp();
  const tr = (fr: string, de: string) => (lang === "de" ? de : fr);
  const { decision } = assessment;

  const styles: Record<typeof decision.level, { bg: string; border: string; icon: React.ReactNode }> = {
    ok: {
      bg: "bg-clover-soft",
      border: "border-clover",
      icon: <ShieldCheck className="w-6 h-6 text-clover" />,
    },
    caution: {
      bg: "bg-amber-soft",
      border: "border-amber",
      icon: <AlertTriangle className="w-6 h-6 text-amber" />,
    },
    urgent: {
      bg: "bg-accent/10",
      border: "border-accent",
      icon: <ShieldAlert className="w-6 h-6 text-accent" />,
    },
    emergency: {
      bg: "bg-red-50",
      border: "border-red-700",
      icon: <ShieldAlert className="w-7 h-7 text-red-700 animate-pulse" />,
    },
  };
  const s = styles[decision.level];

  return (
    <div
      className={cn(
        "rounded-xl border-2 p-4",
        s.bg,
        s.border,
        decision.level === "emergency" && "ring-4 ring-red-700/20"
      )}
    >
      <div className="flex items-start gap-3">
        <div className="shrink-0">{s.icon}</div>
        <div className="flex-1 min-w-0">
          <div
            className={cn(
              "font-bold leading-tight",
              decision.level === "emergency" ? "text-red-700 text-base" : "text-base text-navy"
            )}
          >
            {tr(decision.titleFr, decision.titleDe)}
          </div>
          <p className="text-sm mt-1.5 text-ink leading-relaxed">
            {tr(decision.recommendationFr, decision.recommendationDe)}
          </p>
          {decision.level === "emergency" && (
            <div className="mt-3 flex flex-wrap gap-2">
              <a
                href="tel:112"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-red-700 text-white text-xs font-bold hover:bg-red-800"
              >
                <Phone className="w-3.5 h-3.5" /> 112
              </a>
              <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white border-2 border-red-700 text-red-700 text-xs font-bold hover:bg-red-50">
                <Phone className="w-3.5 h-3.5" />
                {tr("Appeler MPR", "PMR anrufen")}
              </button>
              <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white border-2 border-red-700 text-red-700 text-xs font-bold hover:bg-red-50">
                <Stethoscope className="w-3.5 h-3.5" />
                {tr("Appeler médecin traitant", "Hausarzt anrufen")}
              </button>
              <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white border-2 border-red-700 text-red-700 text-xs font-bold hover:bg-red-50">
                <FileText className="w-3.5 h-3.5" />
                {tr("Documenter horodaté", "Mit Zeitstempel dokumentieren")}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Bandeau contexte (responsabilité) ─────────────────────────────
function ContextBanner({
  context,
}: {
  context: "physio_prescription" | "kine_t0" | "during_program";
}) {
  const { lang } = useApp();
  const tr = (fr: string, de: string) => (lang === "de" ? de : fr);
  const messages = {
    physio_prescription: {
      fr: "Vous êtes le médecin prescripteur (MPR). Cette évaluation est de votre responsabilité primaire.",
      de: "Sie sind der verschreibende Arzt (PMR). Diese Beurteilung liegt in Ihrer primären Verantwortung.",
    },
    kine_t0: {
      fr: "Vérification de sécurité au bilan T0. Le MPR a déjà évalué à la prescription, mais cette double-vérification est cruciale.",
      de: "Sicherheitsüberprüfung bei der T0-Bilanz. Der PMR hat bei der Verordnung bereits beurteilt, aber diese Doppelprüfung ist entscheidend.",
    },
    during_program: {
      fr: "Re-évaluation en cours de programme. À refaire si apparition de nouveaux symptômes.",
      de: "Neubewertung während des Programms. Bei Auftreten neuer Symptome wiederholen.",
    },
  };
  return (
    <div className="text-xs text-slate p-2.5 rounded-md bg-navy-pale border border-navy-light flex items-start gap-2">
      <ShieldCheck className="w-3.5 h-3.5 text-navy mt-0.5 shrink-0" />
      <span>{tr(messages[context].fr, messages[context].de)}</span>
    </div>
  );
}

// ─── Mini-résumé inline (bandeau alerte court) ─────────────────────
export function RedFlagsSummary({ checkedIds }: { checkedIds: string[] }) {
  const { lang } = useApp();
  const tr = (fr: string, de: string) => (lang === "de" ? de : fr);
  const assessment = useMemo(() => assessFlags(new Set(checkedIds)), [checkedIds]);
  if (assessment.decision.level === "ok") return null;

  const styles: Record<string, string> = {
    caution: "bg-amber-soft border-amber text-amber",
    urgent: "bg-accent/10 border-accent text-accent",
    emergency: "bg-red-50 border-red-700 text-red-700",
  };
  const cls = styles[assessment.decision.level] ?? styles.caution;

  return (
    <div className={cn("rounded-md border-l-4 p-3 flex items-start gap-2", cls)}>
      {assessment.decision.level === "emergency" ? (
        <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5 animate-pulse" />
      ) : (
        <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
      )}
      <div className="text-sm font-medium leading-tight">
        {tr(assessment.decision.titleFr, assessment.decision.titleDe)}
      </div>
    </div>
  );
}

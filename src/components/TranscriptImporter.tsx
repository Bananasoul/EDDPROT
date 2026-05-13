"use client";

import { useEffect, useRef, useState } from "react";
import {
  ClipboardPaste,
  Sparkles,
  Loader2,
  Check,
  X,
  ChevronRight,
  Brain,
  FileText,
} from "lucide-react";
import { parseTranscript, type ParseResult } from "@/lib/anamnesis";
import { useApp } from "@/lib/app-context";
import { cn } from "@/lib/utils";

type Phase = "input" | "analyzing" | "result";

const ANALYSIS_STEPS_FR = [
  "Lecture du transcript Plaud…",
  "Détection des localisations douloureuses…",
  "Extraction de l'historique et de l'évolution…",
  "Identification du schéma 24 h et du sommeil…",
  "Repérage des facteurs aggravants et soulageants…",
  "Évaluation de la douleur (EVA pic / moyenne)…",
  "Analyse des antécédents médicaux et imagerie…",
  "Reconnaissance du contexte professionnel…",
  "Recherche des drapeaux rouges (KCE 287)…",
  "Identification des facteurs psycho-sociaux (jaunes)…",
  "Extraction des objectifs exprimés par le patient…",
  "Compilation et structuration finale…",
];

const ANALYSIS_STEPS_DE = [
  "Lese Plaud-Transkript…",
  "Erkennung der Schmerzlokalisationen…",
  "Extraktion der Anamnese und Entwicklung…",
  "Identifikation des 24-h-Schemas und Schlafs…",
  "Erkennung aggravierender und lindernder Faktoren…",
  "Schmerzbewertung (VAS Spitze / Durchschnitt)…",
  "Analyse der medizinischen Vorgeschichte und Bildgebung…",
  "Erkennung des beruflichen Kontexts…",
  "Suche nach roten Flaggen (KCE 287)…",
  "Identifikation psychosozialer Faktoren (gelbe)…",
  "Extraktion der vom Patienten geäußerten Ziele…",
  "Endgültige Kompilierung und Strukturierung…",
];

export function TranscriptImporter({
  patientId,
  onImport,
  onClose,
}: {
  patientId: string;
  onImport: (result: ParseResult) => void;
  onClose: () => void;
}) {
  const { lang } = useApp();
  const tr = (fr: string, de: string) => (lang === "de" ? de : fr);
  const steps = lang === "de" ? ANALYSIS_STEPS_DE : ANALYSIS_STEPS_FR;

  const [phase, setPhase] = useState<Phase>("input");
  const [text, setText] = useState("");
  const [stepIdx, setStepIdx] = useState(0);
  const [result, setResult] = useState<ParseResult | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  // Auto-advance through analysis steps
  useEffect(() => {
    if (phase !== "analyzing") return;
    if (stepIdx >= steps.length) {
      // Run parser
      const r = parseTranscript(text, patientId);
      setResult(r);
      const t = setTimeout(() => setPhase("result"), 400);
      return () => clearTimeout(t);
    }
    const delay = 300 + Math.random() * 350;
    const t = setTimeout(() => setStepIdx((i) => i + 1), delay);
    return () => clearTimeout(t);
  }, [phase, stepIdx, steps.length, text, patientId]);

  const start = () => {
    if (text.trim().length < 50) return;
    setStepIdx(0);
    setResult(null);
    setPhase("analyzing");
  };

  const apply = () => {
    if (result) {
      onImport(result);
    }
  };

  // Demo : paste sample transcript
  const pasteSample = () => {
    const sample = lang === "de"
      ? `Hauptproblem ist der Nacken. Linke Seite. Ich hatte eine Schulter-OP letztes Jahr im Januar. Akromioplastie auf der rechten Schulter, danach habe ich auch in Nackenschmerzen gehabt. Es zieht bis hier in die Hand, manchmal Kribbeln. Im Bereich der Lendenwirbel auch ein bisschen, aber mehr in der Mitte. Auf einer Skala von 0 bis 10 würde ich sagen 5 oder 6 in den letzten zwei Wochen. Ich nehme manchmal Paracetamol oder Ibuprofen. Ich schlafe etwa 5-6 Stunden, wache nachts auf wegen Schmerzen. Morgens bin ich steif, etwa 15 Minuten. Beim Sitzen lange tut mein Rücken weh. Ich habe Bluthochdruck und nehme L-Thyroxin für die Schilddrüse. Ich war Krankenschwester, jetzt bin ich krankgeschrieben seit der OP. Ich möchte wieder normal arbeiten können und wieder Garten machen.`
      : `Mon problème principal c'est le bas du dos, lombaire avec irradiation sciatique du côté gauche jusque dans le mollet, ça descend. Parfois des picotements et des fourmillements. J'ai eu une opération de hernie discale L5-S1 en 2021. Depuis, j'ai des douleurs résiduelles. Sur une échelle de 0 à 10, la pire douleur ces 2 dernières semaines c'était 7. En moyenne plutôt 5. J'ai fait une IRM récente. Je prends parfois du Tramadol et du Paracétamol mais ça ne soulage pas vraiment. Je dors mal, 4-5 heures, je me réveille la nuit à cause de la douleur. Le matin je suis raide pendant 20 minutes. Je suis chauffeur poids lourd, en arrêt depuis 6 mois. La conduite prolongée et la station assise prolongée provoquent la douleur. Marcher me soulage un peu, et la position fœtale aussi. J'ai un peu peur de bouger, j'évite certains mouvements. J'aimerais reprendre le travail et aller marcher avec mon chien. Je pense que c'est à cause de ma profession.`;
    setText(sample);
  };

  // ─── Render ─────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-50 bg-navy/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-navy to-navy-mid text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-white/15 flex items-center justify-center">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <div className="font-serif text-lg leading-tight">
                {tr("Import transcript Plaud", "Plaud-Transkript importieren")}
              </div>
              <div className="text-xs opacity-80">
                {tr("Copilot HSNE répartit automatiquement dans les sections", "HSNE-Copilot verteilt automatisch in die Sektionen")}
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded hover:bg-white/10">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-auto">
          {/* PHASE 1 — INPUT */}
          {phase === "input" && (
            <div className="p-6 space-y-4">
              <div className="text-sm text-slate leading-relaxed">
                {tr(
                  "Collez ici le transcript complet d'une anamnèse enregistrée avec votre dispositif Plaud. Copilot (HSNE) va parcourir le texte et pré-remplir les 10 sections du formulaire d'anamnèse T0. Vous gardez la main : tout reste éditable avant validation.",
                  "Fügen Sie hier das vollständige Transkript einer mit Ihrem Plaud-Gerät aufgenommenen Anamnese ein. Copilot (SNH) durchläuft den Text und füllt die 10 Abschnitte des T0-Anamnese-Formulars vor. Sie behalten die Kontrolle: alles bleibt vor der Validierung editierbar."
                )}
              </div>
              <div className="relative">
                <textarea
                  ref={textareaRef}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  rows={12}
                  className="w-full rounded-lg border border-hairline px-3 py-2 text-sm font-mono resize-y focus:outline-none focus:ring-2 focus:ring-navy/30"
                  placeholder={tr(
                    "Coller le transcript ici…\n\nExemple :\n00:00:00 Patient: Mon problème principal c'est le bas du dos…",
                    "Transkript hier einfügen…\n\nBeispiel:\n00:00:00 Patient: Mein Hauptproblem ist der untere Rücken…"
                  )}
                />
                <div className="absolute bottom-2 right-2 text-[10px] text-slate">
                  {text.length} {tr("caractères", "Zeichen")}
                </div>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <button
                  onClick={pasteSample}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-navy-mid hover:bg-navy-pale border border-hairline"
                >
                  <ClipboardPaste className="w-3.5 h-3.5" />
                  {tr("Coller un exemple démo", "Demo-Beispiel einfügen")}
                </button>
                <div className="flex gap-2">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 rounded-md text-sm border border-hairline text-slate hover:text-navy"
                  >
                    {tr("Annuler", "Abbrechen")}
                  </button>
                  <button
                    onClick={start}
                    disabled={text.trim().length < 50}
                    className={cn(
                      "inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition",
                      text.trim().length >= 50
                        ? "bg-navy text-white hover:bg-navy-mid"
                        : "bg-slate-light text-slate cursor-not-allowed"
                    )}
                  >
                    <Sparkles className="w-4 h-4" />
                    {tr("Analyser avec Copilot", "Mit Copilot analysieren")}
                  </button>
                </div>
              </div>
              <div className="text-[11px] text-slate italic flex items-start gap-1.5 p-2 bg-amber-soft/40 rounded">
                <span>⚡</span>
                <span>
                  {tr(
                    "Démo : l'analyse est exécutée localement (parseur règles + mots-clés). En production, l'API Copilot HSNE sera utilisée pour une extraction sémantique précise avec contexte clinique.",
                    "Demo: Die Analyse erfolgt lokal (Regelparser + Keywords). In Produktion wird die HSNE-Copilot-API für eine präzise semantische Extraktion mit klinischem Kontext genutzt."
                  )}
                </span>
              </div>
            </div>
          )}

          {/* PHASE 2 — ANALYZING */}
          {phase === "analyzing" && (
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-navy-pale text-navy flex items-center justify-center animate-pulse">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-serif text-base text-navy">
                    {tr("Copilot HSNE analyse votre transcript", "HSNE-Copilot analysiert Ihr Transkript")}
                  </div>
                  <div className="text-xs text-slate">
                    {tr(`Étape ${Math.min(stepIdx + 1, steps.length)} / ${steps.length}`, `Schritt ${Math.min(stepIdx + 1, steps.length)} / ${steps.length}`)}
                  </div>
                </div>
              </div>
              <div className="space-y-1.5 max-h-[400px] overflow-auto">
                {steps.map((step, i) => {
                  const done = i < stepIdx;
                  const active = i === stepIdx;
                  return (
                    <div
                      key={i}
                      className={cn(
                        "flex items-center gap-2.5 text-sm transition-all duration-300",
                        i > stepIdx ? "opacity-30" : "opacity-100"
                      )}
                    >
                      <div className="w-5 h-5 shrink-0 flex items-center justify-center">
                        {done ? (
                          <Check className="w-4 h-4 text-clover" />
                        ) : active ? (
                          <Loader2 className="w-4 h-4 text-navy animate-spin" />
                        ) : (
                          <div className="w-2 h-2 rounded-full bg-slate-light" />
                        )}
                      </div>
                      <span
                        className={cn(
                          active && "text-navy font-medium",
                          done && "text-slate line-through opacity-60"
                        )}
                      >
                        {step}
                      </span>
                    </div>
                  );
                })}
              </div>
              {/* Progress bar */}
              <div className="mt-4 h-1.5 bg-slate-light rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-navy to-clover transition-all duration-300"
                  style={{ width: `${(stepIdx / steps.length) * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* PHASE 3 — RESULT */}
          {phase === "result" && result && (
            <div className="p-6 space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-clover-soft text-clover flex items-center justify-center shrink-0">
                  <Check className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="font-serif text-lg text-navy">
                    {tr("Analyse terminée", "Analyse abgeschlossen")}
                  </div>
                  <div className="text-sm text-slate mt-0.5">
                    {tr(
                      `${result.detectionLog.length} éléments détectés · confiance ${Math.round(result.confidence * 100)} %`,
                      `${result.detectionLog.length} Elemente erkannt · Vertrauen ${Math.round(result.confidence * 100)} %`
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                <DetectionStat label="Localisations" value={result.data.mainComplaint.locations.length} />
                <DetectionStat label="Sensations" value={result.data.mainComplaint.sensationType.length} />
                <DetectionStat label="EVA détectée" value={result.data.pain.worst2weeks != null ? "✓" : "—"} />
                <DetectionStat label="Comorbidités" value={result.data.medical.comorbidities.length} />
                <DetectionStat label="Médicaments" value={result.data.factors.currentMedications ? "✓" : "—"} />
                <DetectionStat label="Objectifs patient" value={result.data.patientPerspective.goals.length} />
                <DetectionStat label="Drapeaux rouges" value={result.data.redFlagIds.length} highlight={result.data.redFlagIds.length > 0} />
                <DetectionStat label="Drapeaux jaunes" value={Object.values(result.data.yellowFlags).filter(Boolean).length} />
                <DetectionStat label="Métier" value={result.data.profession.currentJob || "—"} />
              </div>

              <div className="max-h-[200px] overflow-auto rounded-lg border border-hairline bg-slate-light/20">
                <table className="w-full text-xs">
                  <thead className="bg-slate-light/40 sticky top-0">
                    <tr className="text-slate">
                      <th className="text-left px-3 py-1.5 font-medium">Section</th>
                      <th className="text-left px-3 py-1.5 font-medium">Champ</th>
                      <th className="text-left px-3 py-1.5 font-medium">Valeur</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.detectionLog.slice(0, 30).map((l, i) => (
                      <tr key={i} className="border-t border-hairline/30">
                        <td className="px-3 py-1 text-navy font-medium">{l.section}</td>
                        <td className="px-3 py-1 text-slate">{l.field}</td>
                        <td className="px-3 py-1 text-ink">{l.value}</td>
                      </tr>
                    ))}
                    {result.detectionLog.length > 30 && (
                      <tr>
                        <td colSpan={3} className="px-3 py-1 text-slate italic text-center">
                          + {result.detectionLog.length - 30} {tr("éléments supplémentaires…", "weitere Elemente…")}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-hairline/40">
                <button
                  onClick={() => setPhase("input")}
                  className="px-4 py-2 rounded-md text-sm border border-hairline text-slate hover:text-navy"
                >
                  {tr("Recommencer", "Erneut starten")}
                </button>
                <button
                  onClick={apply}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium bg-clover text-white hover:bg-clover/90"
                >
                  {tr("Appliquer au formulaire", "Auf Formular anwenden")}
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function DetectionStat({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string | number;
  highlight?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-md p-2.5 border",
        highlight ? "border-accent bg-accent/5" : "border-hairline bg-white"
      )}
    >
      <div className="text-[10px] text-slate uppercase tracking-wide">{label}</div>
      <div
        className={cn(
          "text-base font-bold tabular-nums mt-0.5",
          highlight ? "text-accent" : "text-navy"
        )}
      >
        {value}
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  X,
  Sparkles,
  Clock,
} from "lucide-react";
import { useApp } from "@/lib/app-context";
import { cn } from "@/lib/utils";

type Step = {
  href: string;
  titleFr: string;
  titleDe: string;
  pitchFr: string;
  pitchDe: string;
  highlightFr?: string;
  highlightDe?: string;
};

const STEPS: Step[] = [
  {
    href: "/direction",
    titleFr: "Vue Direction — pourquoi investir",
    titleDe: "Direktionsansicht — warum investieren",
    pitchFr:
      "On commence par le sommet : la direction voit en 1 écran le ROI, la qualité KCE, l'impact organisationnel. C'est ce qui débloque le budget.",
    pitchDe:
      "Wir beginnen ganz oben: Die Direktion sieht in einem Bildschirm ROI, KCE-Qualität, organisatorische Wirkung. Das setzt das Budget frei.",
    highlightFr: "Pointer le bloc « avant / après plateforme » et les économies AT estimées.",
    highlightDe: "Auf den « Vorher/Nachher »-Block und die geschätzten AU-Einsparungen zeigen.",
  },
  {
    href: "/vision",
    titleFr: "Vision narrative — le problème, la solution",
    titleDe: "Narrative Vision — Problem, Lösung",
    pitchFr:
      "Le récit en 1 page : le chaos d'aujourd'hui, le parcours coordonné de demain, la feuille de route 8 phases.",
    pitchDe:
      "Die Geschichte auf einer Seite: das heutige Chaos, der koordinierte Weg von morgen, der 8-Phasen-Fahrplan.",
  },
  {
    href: "/secretary",
    titleFr: "Secrétariat — lundi matin",
    titleDe: "Sekretariat — Montagmorgen",
    pitchFr:
      "« Voici ce que voit la secrétaire en arrivant. Plus rien ne se perd : RDV, contacts, mutuelles, factures, alertes — tout sur un écran. »",
    pitchDe:
      "« So sieht das Sekretariat morgens aus. Nichts geht verloren: Termine, Kontakte, Krankenkassen, Rechnungen, Warnungen — alles auf einem Bildschirm. »",
    highlightFr: "Onglet Mutuelle : montrer la relance Freie Krankenkasse en 1 clic → PDF.",
    highlightDe: "Tab Krankenkasse: Mahnung Freie Krankenkasse in 1 Klick → PDF zeigen.",
  },
  {
    href: "/physio",
    titleFr: "Médecin physio — résumé en 30 secondes",
    titleDe: "Physikalischer Arzt — Zusammenfassung in 30 Sekunden",
    pitchFr:
      "Sélectionner Delcour : le médecin voit l'évolution T0→T1, valide le rapport en 1 clic, télécharge le PDF INAMI.",
    pitchDe:
      "Delcour auswählen: Der Arzt sieht die T0→T1-Entwicklung, validiert den Bericht in 1 Klick, lädt das INAMI-PDF herunter.",
  },
  {
    href: "/kine/p001",
    titleFr: "Fiche kiné — body chart interactif",
    titleDe: "PT-Akte — interaktive Körperkarte",
    pitchFr:
      "Onglet Anamnèse : le body chart SVG. Clic = intensité. Bilingue. Plus de schéma manuscrit.",
    pitchDe:
      "Tab Anamnese: SVG-Körperkarte. Klick = Intensität. Zweisprachig. Keine handgezeichneten Schemata mehr.",
  },
  {
    href: "/kine/p002",
    titleFr: "Vue d'ensemble — toutes les courbes",
    titleDe: "Übersicht — alle Kurven",
    pitchFr:
      "EVA + ODI + TSK + HAD superposés sur 36 séances, légende commutable. Clinique d'élite.",
    pitchDe:
      "VAS + ODI + TSK + HAD überlagert über 36 Sitzungen, umschaltbare Legende. Spitzenklinik.",
  },
  {
    href: "/kine/p002",
    titleFr: "Onglet Rapport — assistant IA Claude",
    titleDe: "Tab Bericht — KI-Assistent Claude",
    pitchFr:
      "« Lancer la rédaction » — Claude analyse, synthétise, rédige le compte-rendu en streaming. Le kiné gagne 35 min/patient.",
    pitchDe:
      "« Erstellung starten » — Claude analysiert, fasst zusammen, schreibt den Bericht im Streaming. Der PT spart 35 Min/Patient.",
    highlightFr: "Onglet Rapport (5e). Bouton « Lancer la rédaction » — laisser tourner.",
    highlightDe: "Tab Bericht (5.). Schaltfläche « Erstellung starten » — laufen lassen.",
  },
  {
    href: "/patient",
    titleFr: "Tablette patient — questionnaire bilingue",
    titleDe: "Patienten-Tablet — zweisprachiger Fragebogen",
    pitchFr:
      "Le patient répond depuis sa langue (FR/DE), à son rythme. Les scores remontent direct dans le dossier kiné.",
    pitchDe:
      "Der Patient antwortet in seiner Sprache (FR/DE), in seinem Tempo. Scores fließen direkt in die PT-Akte.",
  },
  {
    href: "/direction",
    titleFr: "Retour direction — la boucle est bouclée",
    titleDe: "Zurück zur Direktion — der Kreis schließt sich",
    pitchFr:
      "On reboucle : chaque action sur le terrain alimente les KPI stratégiques. Aucune saisie supplémentaire. C'est ça, la transformation.",
    pitchDe:
      "Wir schließen den Kreis: Jede Handlung im Feld füttert die strategischen KPIs. Keine Doppelerfassung. Das ist die Transformation.",
  },
];

export function DemoMode() {
  const { lang } = useApp();
  const router = useRouter();
  const pathname = usePathname();
  const [active, setActive] = useState(false);
  const [step, setStep] = useState(0);
  const [collapsed, setCollapsed] = useState(false);
  const tr = (fr: string, de: string) => (lang === "de" ? de : fr);

  // Restore from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("edd.demoMode");
    if (saved === "1") {
      setActive(true);
      const s = parseInt(localStorage.getItem("edd.demoStep") ?? "0", 10);
      if (!isNaN(s)) setStep(Math.max(0, Math.min(STEPS.length - 1, s)));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("edd.demoMode", active ? "1" : "0");
  }, [active]);

  useEffect(() => {
    localStorage.setItem("edd.demoStep", String(step));
  }, [step]);

  const start = () => {
    setActive(true);
    setStep(0);
    setCollapsed(false);
    router.push(STEPS[0].href);
  };

  const stop = () => {
    setActive(false);
    setStep(0);
  };

  const go = (i: number) => {
    if (i < 0 || i >= STEPS.length) return;
    setStep(i);
    router.push(STEPS[i].href);
  };

  // Floating launcher when inactive (small button bottom-right)
  if (!active) {
    return (
      <button
        onClick={start}
        className="fixed bottom-4 right-4 z-40 inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-navy text-white shadow-lg hover:bg-navy-mid transition text-sm font-medium"
        title={tr("Lancer la démo guidée", "Geführte Demo starten")}
      >
        <Sparkles className="w-4 h-4" />
        {tr("Démo guidée", "Geführte Demo")}
      </button>
    );
  }

  const current = STEPS[step];
  const isOnCorrectPage = pathname === current.href || pathname.startsWith(current.href);

  if (collapsed) {
    return (
      <button
        onClick={() => setCollapsed(false)}
        className="fixed bottom-4 right-4 z-40 inline-flex items-center gap-2 px-3 py-2 rounded-full bg-navy text-white shadow-lg text-xs font-medium"
      >
        <Play className="w-3.5 h-3.5" />
        {tr("Étape", "Schritt")} {step + 1}/{STEPS.length}
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-40 w-[400px] max-w-[calc(100vw-2rem)] rounded-xl bg-white shadow-2xl border border-navy/10 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-navy to-navy-mid text-white px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-medium">
          <Sparkles className="w-3.5 h-3.5" />
          <span className="uppercase tracking-wider">
            {tr("Démo guidée", "Geführte Demo")}
          </span>
          <span className="text-white/70">·</span>
          <span className="tabular-nums">
            {step + 1} / {STEPS.length}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setCollapsed(true)}
            className="p-1 rounded hover:bg-white/10"
            title={tr("Réduire", "Minimieren")}
          >
            <Pause className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={stop}
            className="p-1 rounded hover:bg-white/10"
            title={tr("Quitter", "Beenden")}
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-slate-light">
        <div
          className="h-full bg-amber transition-all"
          style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
        />
      </div>

      {/* Body */}
      <div className="p-4 space-y-3">
        <div>
          <div className="font-serif text-base text-navy leading-tight">
            {tr(current.titleFr, current.titleDe)}
          </div>
          <p className="text-sm text-slate mt-1.5 leading-relaxed">
            {tr(current.pitchFr, current.pitchDe)}
          </p>
        </div>

        {current.highlightFr && (
          <div className="flex items-start gap-2 p-2.5 rounded-md bg-amber-soft text-xs text-amber border border-amber/20">
            <Clock className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            <span className="leading-relaxed font-medium">
              {tr(current.highlightFr, current.highlightDe ?? current.highlightFr)}
            </span>
          </div>
        )}

        {!isOnCorrectPage && (
          <button
            onClick={() => router.push(current.href)}
            className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-md bg-navy-pale text-navy text-xs font-medium hover:bg-navy/10"
          >
            {tr("Aller à cette page", "Zu dieser Seite gehen")} →
          </button>
        )}
      </div>

      {/* Footer nav */}
      <div className="border-t border-hairline bg-slate-light/30 px-4 py-2.5 flex items-center justify-between">
        <button
          onClick={() => go(step - 1)}
          disabled={step === 0}
          className={cn(
            "inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded transition",
            step === 0
              ? "text-slate/40 cursor-not-allowed"
              : "text-navy hover:bg-white"
          )}
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          {tr("Précédent", "Zurück")}
        </button>

        <div className="flex gap-1">
          {STEPS.map((_, i) => (
            <button
              key={i}
              onClick={() => go(i)}
              className={cn(
                "w-1.5 h-1.5 rounded-full transition",
                i === step ? "bg-navy w-4" : "bg-slate/40 hover:bg-slate"
              )}
            />
          ))}
        </div>

        {step < STEPS.length - 1 ? (
          <button
            onClick={() => go(step + 1)}
            className="inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded text-navy hover:bg-white"
          >
            {tr("Suivant", "Weiter")}
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        ) : (
          <button
            onClick={stop}
            className="inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded bg-clover text-white hover:bg-clover/90"
          >
            {tr("Terminer", "Beenden")}
          </button>
        )}
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Mic,
  Sparkles,
  Eye,
  CheckCircle2,
} from "lucide-react";
import type { AnamnesisData } from "@/lib/anamnesis";
import { SECTION_LABELS } from "@/lib/anamnesis";
import { RecordingControls } from "./RecordingControls";
import { useApp } from "@/lib/app-context";
import { cn } from "@/lib/utils";

const SECTIONS = [
  { key: "mainComplaint", titleFr: "Pourquoi êtes-vous ici aujourd'hui ?", titleDe: "Warum sind Sie heute hier?", icon: "🎯" },
  { key: "painHistory", titleFr: "Depuis quand ?", titleDe: "Seit wann?", icon: "📅" },
  { key: "daySchema", titleFr: "Comment ça se passe sur 24 heures ?", titleDe: "Wie verläuft ein typischer Tag?", icon: "🕒" },
  { key: "factors", titleFr: "Qu'est-ce qui aggrave ? Qu'est-ce qui soulage ?", titleDe: "Was verschlimmert? Was lindert?", icon: "⚖️" },
  { key: "pain", titleFr: "Évaluation de la douleur", titleDe: "Schmerzbewertung", icon: "📊" },
  { key: "medical", titleFr: "Antécédents médicaux", titleDe: "Medizinische Vorgeschichte", icon: "🏥" },
  { key: "profession", titleFr: "Travail et activités", titleDe: "Beruf und Aktivitäten", icon: "💼" },
  { key: "patientPerspective", titleFr: "Vos attentes et objectifs", titleDe: "Ihre Erwartungen und Ziele", icon: "✨" },
] as const;

type SectionKey = typeof SECTIONS[number]["key"];

type Props = {
  data: AnamnesisData;
  onUpdate: <K extends keyof AnamnesisData>(
    section: K,
    field: keyof AnamnesisData[K],
    value: AnamnesisData[K][keyof AnamnesisData[K]]
  ) => void;
  onClose: () => void;
  onAudioTranscript?: (text: string) => void;
};

export function LiveInterviewMode({ data, onUpdate, onClose, onAudioTranscript }: Props) {
  const { lang, setLang } = useApp();
  const tr = (fr: string, de: string) => (lang === "de" ? de : fr);
  const [stepIdx, setStepIdx] = useState(0);
  const [recordingOpen, setRecordingOpen] = useState(false);
  const [consent, setConsent] = useState(false);

  const section = SECTIONS[stepIdx];
  const next = () => setStepIdx((i) => Math.min(i + 1, SECTIONS.length - 1));
  const prev = () => setStepIdx((i) => Math.max(i - 1, 0));

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col">
      {/* Header — minimal et apaisant */}
      <header className="border-b border-hairline px-6 py-4 flex items-center justify-between bg-gradient-to-r from-cyan-pale to-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-cyan text-white flex items-center justify-center">
            <Eye className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-navy text-base">
              {tr("Mode entretien partagé", "Modus Gespräch geteilt")}
            </div>
            <div className="text-xs text-slate">
              {tr("Écran visible avec le patient · format simplifié", "Bildschirm mit Patient sichtbar · vereinfachtes Format")}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Toggle FR/DE — gros boutons pour le patient */}
          <div className="flex items-center rounded-md overflow-hidden border-2 border-cyan">
            <button
              onClick={() => setLang("fr")}
              className={cn(
                "px-3 py-1.5 text-sm font-bold uppercase transition",
                lang === "fr" ? "bg-cyan text-white" : "text-cyan hover:bg-cyan-soft"
              )}
            >
              FR
            </button>
            <button
              onClick={() => setLang("de")}
              className={cn(
                "px-3 py-1.5 text-sm font-bold uppercase transition",
                lang === "de" ? "bg-cyan text-white" : "text-cyan hover:bg-cyan-soft"
              )}
            >
              DE
            </button>
          </div>

          {/* Bouton enregistrement */}
          <button
            onClick={() => setRecordingOpen(!recordingOpen)}
            className={cn(
              "inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-bold transition",
              recordingOpen
                ? "bg-accent text-white"
                : "bg-cyan-soft text-cyan-mid hover:bg-cyan-light"
            )}
          >
            <Mic className="w-4 h-4" />
            {tr("Enregistrer (avec accord)", "Aufnehmen (mit Zustimmung)")}
          </button>

          <button
            onClick={onClose}
            className="px-3 py-2 rounded-md border border-hairline text-slate hover:bg-slate-light text-sm font-medium inline-flex items-center gap-1.5"
          >
            <X className="w-4 h-4" />
            {tr("Quitter le mode partagé", "Geteilten Modus beenden")}
          </button>
        </div>
      </header>

      {/* Recording panel (collapsible) */}
      {recordingOpen && (
        <div className="border-b border-hairline bg-cyan-pale/50 px-6 py-4">
          <div className="max-w-3xl mx-auto">
            {!consent ? (
              <div className="rounded-lg border border-amber/40 bg-amber-soft p-4">
                <div className="flex items-start gap-3 mb-3">
                  <Sparkles className="w-5 h-5 text-amber shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-navy">
                      {tr("Consentement enregistrement requis", "Einwilligung zur Aufnahme erforderlich")}
                    </div>
                    <p className="text-sm text-ink mt-1 leading-relaxed">
                      {tr(
                        "À expliquer au patient avant de cliquer : « Je vais enregistrer notre entretien pour ne rien oublier et améliorer la qualité de ma prise en charge. L'audio sera traité automatiquement par notre logiciel hospitalier (Azure HSNE), aucun tiers extérieur n'aura accès à votre voix, et l'enregistrement sera supprimé après transcription dans votre dossier (RGPD). Êtes-vous d'accord ? »",
                        "Vor dem Klick dem Patienten erklären: « Ich werde unser Gespräch aufnehmen, um nichts zu vergessen und die Qualität meiner Versorgung zu verbessern. Die Audio wird automatisch von unserer Krankenhaussoftware (Azure SNH) verarbeitet, kein externer Dritter wird Zugriff auf Ihre Stimme haben, und die Aufnahme wird nach Transkription in Ihrer Akte gelöscht (DSGVO). Sind Sie einverstanden? »"
                      )}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setConsent(true)}
                  className="w-full py-2.5 rounded-md bg-clover text-white font-bold text-sm hover:bg-clover/90"
                >
                  {tr("Le patient a donné son accord — activer", "Patient hat zugestimmt — aktivieren")}
                </button>
              </div>
            ) : (
              <RecordingControls
                onTranscriptReady={(text) => {
                  onAudioTranscript?.(text);
                  setRecordingOpen(false);
                  setConsent(false);
                }}
              />
            )}
          </div>
        </div>
      )}

      {/* Body — section unique grand format */}
      <main className="flex-1 overflow-auto bg-slate-light/20">
        <div className="max-w-3xl mx-auto px-8 py-10">
          {/* Section header */}
          <div className="text-center mb-8">
            <div className="text-6xl mb-3">{section.icon}</div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-soft text-cyan-mid text-xs font-bold mb-3">
              {tr(`Étape ${stepIdx + 1} / ${SECTIONS.length}`, `Schritt ${stepIdx + 1} / ${SECTIONS.length}`)}
              <span className="opacity-60">·</span>
              <span>{tr(SECTION_LABELS[section.key].fr, SECTION_LABELS[section.key].de)}</span>
            </div>
            <h1 className="font-bold text-3xl md:text-4xl text-navy leading-tight">
              {tr(section.titleFr, section.titleDe)}
            </h1>
          </div>

          {/* Section content — version simplifiée et grand format */}
          <SectionContent sectionKey={section.key} data={data} onUpdate={onUpdate} tr={tr} />
        </div>
      </main>

      {/* Footer navigation */}
      <footer className="border-t border-hairline bg-white px-6 py-4 flex items-center justify-between">
        <button
          onClick={prev}
          disabled={stepIdx === 0}
          className={cn(
            "inline-flex items-center gap-1.5 px-4 py-2.5 rounded-md text-sm font-bold transition",
            stepIdx === 0
              ? "text-slate/40 cursor-not-allowed"
              : "text-navy hover:bg-navy-pale"
          )}
        >
          <ChevronLeft className="w-4 h-4" />
          {tr("Précédent", "Zurück")}
        </button>

        {/* Mini progression dots */}
        <div className="flex gap-1.5">
          {SECTIONS.map((_, i) => (
            <button
              key={i}
              onClick={() => setStepIdx(i)}
              className={cn(
                "h-2 rounded-full transition",
                i === stepIdx ? "w-8 bg-cyan" : "w-2 bg-slate-light hover:bg-cyan-light"
              )}
            />
          ))}
        </div>

        {stepIdx < SECTIONS.length - 1 ? (
          <button
            onClick={next}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-md bg-cyan text-white text-sm font-bold hover:bg-cyan-mid"
          >
            {tr("Suivant", "Weiter")}
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={onClose}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-md bg-clover text-white text-sm font-bold hover:bg-clover/90"
          >
            <CheckCircle2 className="w-4 h-4" />
            {tr("Terminer l'entretien", "Gespräch abschließen")}
          </button>
        )}
      </footer>
    </div>
  );
}

// ─── Contenu par section — version grand format pour le patient ───
function SectionContent({
  sectionKey,
  data,
  onUpdate,
  tr,
}: {
  sectionKey: SectionKey;
  data: AnamnesisData;
  onUpdate: Props["onUpdate"];
  tr: (fr: string, de: string) => string;
}) {
  if (sectionKey === "mainComplaint") {
    const locations = ["lombaire", "sciatique", "dorsal", "cervical", "épaule", "fessier", "hanche", "jambe"];
    const sensations = ["douleur", "picotements", "fourmillements", "brûlure", "engourdissement"];
    return (
      <div className="space-y-6">
        <BigField label={tr("Décrivez votre douleur principale", "Beschreiben Sie Ihren Hauptschmerz")}>
          <textarea
            value={data.mainComplaint.description}
            onChange={(e) => onUpdate("mainComplaint", "description", e.target.value)}
            rows={3}
            placeholder={tr("Avec vos mots…", "Mit Ihren Worten…")}
            className="w-full rounded-lg border border-hairline px-4 py-3 text-base focus:outline-none focus:border-cyan focus:ring-2 focus:ring-cyan/20"
          />
        </BigField>

        <BigField label={tr("Où ressentez-vous la douleur ?", "Wo spüren Sie den Schmerz?")} hint={tr("Tapez sur les zones concernées", "Tippen Sie auf die betroffenen Bereiche")}>
          <BigChips
            options={locations}
            selected={data.mainComplaint.locations}
            onChange={(v) => onUpdate("mainComplaint", "locations", v)}
          />
        </BigField>

        <BigField label={tr("Quelles sensations ?", "Welche Empfindungen?")}>
          <BigChips
            options={sensations}
            selected={data.mainComplaint.sensationType}
            onChange={(v) => onUpdate("mainComplaint", "sensationType", v)}
          />
        </BigField>
      </div>
    );
  }

  if (sectionKey === "painHistory") {
    return (
      <div className="space-y-6">
        <BigField label={tr("Quand avez-vous commencé à avoir mal ?", "Wann begannen die Schmerzen?")}>
          <input
            value={data.painHistory.onsetDate}
            onChange={(e) => onUpdate("painHistory", "onsetDate", e.target.value)}
            placeholder={tr("ex. octobre 2023, depuis 6 mois", "z.B. Oktober 2023, seit 6 Monaten")}
            className="w-full rounded-lg border border-hairline px-4 py-3 text-base focus:outline-none focus:border-cyan focus:ring-2 focus:ring-cyan/20"
          />
        </BigField>

        <BigField label={tr("Comment ça a commencé ?", "Wie begann es?")}>
          <div className="grid grid-cols-2 gap-3">
            {[
              { value: "traumatic", label: tr("Traumatisme (chute, accident)", "Trauma (Sturz, Unfall)") },
              { value: "spontaneous", label: tr("Soudainement (sans raison claire)", "Plötzlich (ohne klaren Grund)") },
              { value: "post_surgical", label: tr("Après une opération", "Nach einer Operation") },
              { value: "progressive", label: tr("Progressivement", "Allmählich") },
            ].map((opt) => (
              <button
                key={opt.value}
                onClick={() => onUpdate("painHistory", "onsetType", opt.value as typeof data.painHistory.onsetType)}
                className={cn(
                  "p-4 rounded-lg border-2 text-left transition",
                  data.painHistory.onsetType === opt.value
                    ? "border-cyan bg-cyan-soft"
                    : "border-hairline hover:border-cyan-light"
                )}
              >
                <span className="text-base font-medium text-navy">{opt.label}</span>
              </button>
            ))}
          </div>
        </BigField>
      </div>
    );
  }

  if (sectionKey === "daySchema") {
    const moments = [
      { v: "matin", fr: "Le matin", de: "Morgens", icon: "🌅" },
      { v: "journée", fr: "Pendant la journée", de: "Tagsüber", icon: "☀️" },
      { v: "soir", fr: "En soirée", de: "Abends", icon: "🌆" },
      { v: "nuit", fr: "La nuit", de: "Nachts", icon: "🌙" },
    ];
    return (
      <div className="space-y-6">
        <BigField label={tr("Quand votre douleur est-elle la plus forte ?", "Wann ist Ihr Schmerz am stärksten?")} hint={tr("Plusieurs choix possibles", "Mehrere Auswahl möglich")}>
          <div className="grid grid-cols-2 gap-3">
            {moments.map((m) => {
              const sel = data.daySchema.worstMoment.includes(m.v);
              return (
                <button
                  key={m.v}
                  onClick={() => {
                    const cur = data.daySchema.worstMoment;
                    onUpdate(
                      "daySchema",
                      "worstMoment",
                      sel ? cur.filter((x) => x !== m.v) : [...cur, m.v]
                    );
                  }}
                  className={cn(
                    "p-4 rounded-lg border-2 text-left transition flex items-center gap-3",
                    sel ? "border-cyan bg-cyan-soft" : "border-hairline hover:border-cyan-light"
                  )}
                >
                  <span className="text-3xl">{m.icon}</span>
                  <span className="text-base font-medium text-navy">{tr(m.fr, m.de)}</span>
                </button>
              );
            })}
          </div>
        </BigField>

        <BigField label={tr("Comment dormez-vous ?", "Wie schlafen Sie?")}>
          <div className="grid grid-cols-3 gap-3">
            {[
              { v: "good", fr: "Bien 😴", de: "Gut 😴" },
              { v: "fragmented", fr: "Fragmenté 😐", de: "Fragmentiert 😐" },
              { v: "poor", fr: "Mal 😞", de: "Schlecht 😞" },
            ].map((o) => (
              <button
                key={o.v}
                onClick={() => onUpdate("daySchema", "sleepQuality", o.v as typeof data.daySchema.sleepQuality)}
                className={cn(
                  "p-4 rounded-lg border-2 text-center transition",
                  data.daySchema.sleepQuality === o.v ? "border-cyan bg-cyan-soft" : "border-hairline hover:border-cyan-light"
                )}
              >
                <span className="text-base font-medium text-navy">{tr(o.fr, o.de)}</span>
              </button>
            ))}
          </div>
        </BigField>
      </div>
    );
  }

  if (sectionKey === "factors") {
    return (
      <div className="space-y-6">
        <BigField label={tr("Qu'est-ce qui aggrave la douleur ?", "Was verschlimmert den Schmerz?")}>
          <textarea
            value={data.factors.aggravating}
            onChange={(e) => onUpdate("factors", "aggravating", e.target.value)}
            rows={3}
            placeholder={tr("Position, mouvement, situation…", "Position, Bewegung, Situation…")}
            className="w-full rounded-lg border border-hairline px-4 py-3 text-base focus:outline-none focus:border-cyan focus:ring-2 focus:ring-cyan/20"
          />
        </BigField>
        <BigField label={tr("Qu'est-ce qui soulage ?", "Was lindert?")}>
          <textarea
            value={data.factors.relieving}
            onChange={(e) => onUpdate("factors", "relieving", e.target.value)}
            rows={3}
            placeholder={tr("Chaleur, marche, position spécifique…", "Wärme, Gehen, bestimmte Position…")}
            className="w-full rounded-lg border border-hairline px-4 py-3 text-base focus:outline-none focus:border-cyan focus:ring-2 focus:ring-cyan/20"
          />
        </BigField>
      </div>
    );
  }

  if (sectionKey === "pain") {
    const labels: { key: "worst2weeks" | "average2weeks"; fr: string; de: string }[] = [
      { key: "worst2weeks", fr: "Votre PIRE douleur des 2 dernières semaines", de: "Ihr SCHLIMMSTER Schmerz in den letzten 2 Wochen" },
      { key: "average2weeks", fr: "Votre douleur EN MOYENNE", de: "Ihr Schmerz IM DURCHSCHNITT" },
    ];
    return (
      <div className="space-y-6">
        <div className="text-center text-sm text-slate italic max-w-xl mx-auto">
          {tr(
            "0 = aucune douleur · 3 = inconfort · 5 = je prends un antalgique · 7 = je vois le médecin · 10 = lumière au bout du couloir",
            "0 = kein Schmerz · 3 = Unbehagen · 5 = ich nehme ein Schmerzmittel · 7 = ich gehe zum Arzt · 10 = weißes Licht am Ende des Flurs"
          )}
        </div>
        {labels.map((f) => (
          <BigField key={f.key} label={tr(f.fr, f.de)}>
            <div className="grid grid-cols-11 gap-1">
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => {
                const sel = data.pain[f.key] === n;
                const color = n <= 3 ? "#1A6B45" : n <= 6 ? "#D35400" : "#C0392B";
                return (
                  <button
                    key={n}
                    onClick={() => onUpdate("pain", f.key, n)}
                    className={cn(
                      "h-14 rounded-md border-2 transition font-bold text-base",
                      sel ? "text-white" : "border-hairline text-navy hover:border-cyan-light"
                    )}
                    style={{
                      backgroundColor: sel ? color : "white",
                      borderColor: sel ? color : undefined,
                    }}
                  >
                    {n}
                  </button>
                );
              })}
            </div>
          </BigField>
        ))}
      </div>
    );
  }

  if (sectionKey === "medical") {
    const comorbs = ["Hypertension artérielle", "Diabète", "Trouble thyroïdien", "Dépression / antidépresseur", "Fibromyalgie", "Ostéoporose", "Antécédent cancer"];
    return (
      <div className="space-y-6">
        <BigField label={tr("Quels examens d'imagerie avez-vous fait ?", "Welche bildgebenden Untersuchungen wurden durchgeführt?")}>
          <textarea
            value={data.medical.imaging}
            onChange={(e) => onUpdate("medical", "imaging", e.target.value)}
            rows={2}
            placeholder={tr("ex. IRM lombaire en mars 2024", "z.B. Lumbal-MRT im März 2024")}
            className="w-full rounded-lg border border-hairline px-4 py-3 text-base focus:outline-none focus:border-cyan focus:ring-2 focus:ring-cyan/20"
          />
        </BigField>
        <BigField label={tr("Avez-vous d'autres pathologies ?", "Haben Sie andere Erkrankungen?")} hint={tr("Cochez celles qui vous concernent", "Markieren Sie zutreffende")}>
          <BigChips
            options={comorbs}
            selected={data.medical.comorbidities}
            onChange={(v) => onUpdate("medical", "comorbidities", v)}
          />
        </BigField>
      </div>
    );
  }

  if (sectionKey === "profession") {
    return (
      <div className="space-y-6">
        <BigField label={tr("Quel est votre métier ?", "Was ist Ihr Beruf?")}>
          <input
            value={data.profession.currentJob}
            onChange={(e) => onUpdate("profession", "currentJob", e.target.value)}
            className="w-full rounded-lg border border-hairline px-4 py-3 text-base focus:outline-none focus:border-cyan focus:ring-2 focus:ring-cyan/20"
          />
        </BigField>
        <BigField label={tr("Que faites-vous comme sport ou loisir ?", "Was machen Sie als Sport oder Hobby?")}>
          <textarea
            value={data.profession.sportsHobbies}
            onChange={(e) => onUpdate("profession", "sportsHobbies", e.target.value)}
            rows={2}
            placeholder={tr("Actuellement et avant la douleur", "Aktuell und vor dem Schmerz")}
            className="w-full rounded-lg border border-hairline px-4 py-3 text-base focus:outline-none focus:border-cyan focus:ring-2 focus:ring-cyan/20"
          />
        </BigField>
      </div>
    );
  }

  if (sectionKey === "patientPerspective") {
    return (
      <div className="space-y-6">
        <BigField label={tr("Qu'est-ce que vous aimeriez pouvoir faire à nouveau ?", "Was möchten Sie wieder tun können?")} hint={tr("3 objectifs maximum", "Maximal 3 Ziele")}>
          <div className="space-y-3">
            {[0, 1, 2].map((i) => (
              <input
                key={i}
                value={data.patientPerspective.goals[i] ?? ""}
                onChange={(e) => {
                  const goals = [...data.patientPerspective.goals];
                  goals[i] = e.target.value;
                  onUpdate("patientPerspective", "goals", goals.filter(Boolean));
                }}
                placeholder={tr(`Objectif n°${i + 1}…`, `Ziel Nr. ${i + 1}…`)}
                className="w-full rounded-lg border border-hairline px-4 py-3 text-base focus:outline-none focus:border-cyan focus:ring-2 focus:ring-cyan/20"
              />
            ))}
          </div>
        </BigField>
        <BigField label={tr("Selon vous, d'où vient cette douleur ?", "Was glauben Sie, woher dieser Schmerz kommt?")}>
          <textarea
            value={data.patientPerspective.cause}
            onChange={(e) => onUpdate("patientPerspective", "cause", e.target.value)}
            rows={2}
            placeholder={tr("Votre perception personnelle", "Ihre persönliche Wahrnehmung")}
            className="w-full rounded-lg border border-hairline px-4 py-3 text-base focus:outline-none focus:border-cyan focus:ring-2 focus:ring-cyan/20"
          />
        </BigField>
      </div>
    );
  }

  return null;
}

// ─── Petits helpers UI ───
function BigField({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-base font-bold text-navy mb-1">{label}</div>
      {hint && <div className="text-sm text-slate italic mb-2">{hint}</div>}
      <div className="mt-2">{children}</div>
    </div>
  );
}

function BigChips({
  options,
  selected,
  onChange,
}: {
  options: string[];
  selected: string[];
  onChange: (v: string[]) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => {
        const sel = selected.includes(o);
        return (
          <button
            key={o}
            onClick={() => onChange(sel ? selected.filter((x) => x !== o) : [...selected, o])}
            className={cn(
              "px-4 py-2.5 rounded-full text-base font-medium border-2 transition",
              sel
                ? "border-cyan bg-cyan text-white"
                : "border-hairline text-slate hover:border-cyan-light hover:text-navy"
            )}
          >
            {o.charAt(0).toUpperCase() + o.slice(1)}
          </button>
        );
      })}
    </div>
  );
}

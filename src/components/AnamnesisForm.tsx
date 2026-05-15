"use client";

import { useState, useEffect } from "react";
import {
  ClipboardPaste,
  Save,
  FileText,
  ChevronDown,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  Eye,
  Printer,
  Mic,
} from "lucide-react";
import {
  type AnamnesisData,
  emptyAnamnesis,
  parseTranscript,
  SECTION_LABELS,
  ONSET_TYPE_LABELS,
  EVOLUTION_LABELS,
  WORK_STATUS_LABELS,
  SLEEP_QUALITY_LABELS,
} from "@/lib/anamnesis";
import { TranscriptImporter } from "@/components/TranscriptImporter";
import { LiveInterviewMode } from "@/components/LiveInterviewMode";
import { generateBlankAnamnesisForm } from "@/lib/pdf/anamnesisBlankForm";
import type { Patient } from "@/lib/mock-data";
import { useApp } from "@/lib/app-context";
import { cn } from "@/lib/utils";

type SectionKey =
  | "mainComplaint"
  | "painHistory"
  | "daySchema"
  | "factors"
  | "pain"
  | "medical"
  | "profession"
  | "yellowFlags"
  | "patientPerspective"
  | "clinicianNotes";

const SECTION_ORDER: SectionKey[] = [
  "mainComplaint",
  "painHistory",
  "daySchema",
  "factors",
  "pain",
  "medical",
  "profession",
  "yellowFlags",
  "patientPerspective",
  "clinicianNotes",
];

export function AnamnesisForm({
  patient,
  onSave,
  onGeneratePDF,
}: {
  patient: Patient;
  onSave?: (d: AnamnesisData) => void;
  onGeneratePDF?: (d: AnamnesisData) => void;
}) {
  const { lang } = useApp();
  const tr = (fr: string, de: string) => (lang === "de" ? de : fr);
  const [data, setData] = useState<AnamnesisData>(() => emptyAnamnesis(patient.id));
  const [importerOpen, setImporterOpen] = useState(false);
  const [liveMode, setLiveMode] = useState(false);
  const [openSection, setOpenSection] = useState<SectionKey | null>("mainComplaint");
  const [recentlyFilled, setRecentlyFilled] = useState<Set<string>>(new Set());

  // Highlight filled fields briefly after import
  useEffect(() => {
    if (recentlyFilled.size === 0) return;
    const t = setTimeout(() => setRecentlyFilled(new Set()), 4000);
    return () => clearTimeout(t);
  }, [recentlyFilled]);

  const updateField = <K extends keyof AnamnesisData>(
    section: K,
    field: keyof AnamnesisData[K],
    value: AnamnesisData[K][keyof AnamnesisData[K]]
  ) => {
    setData((d) => ({
      ...d,
      [section]: { ...(d[section] as object), [field]: value },
    } as AnamnesisData));
  };

  const completionScore = useState(() => 0)[0];
  const completion = computeCompletion(data);

  const handleImport = (result: { data: AnamnesisData; detectionLog: { section: string; field: string }[] }) => {
    setData(result.data);
    const filled = new Set<string>();
    result.detectionLog.forEach((l) => filled.add(`${l.section}|${l.field}`));
    setRecentlyFilled(filled);
    setImporterOpen(false);
    // Open first section
    setOpenSection("mainComplaint");
  };

  const wasFilled = (section: string, field: string) =>
    recentlyFilled.has(`${section}|${field}`);

  // ─── Render ─────────────────────────────────────────────────────
  return (
    <div className="space-y-4">
      {/* Header avec progress + actions */}
      <div className="sticky top-0 z-10 bg-white border-b border-hairline -mx-5 px-5 py-3">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-slate uppercase tracking-wide font-medium">
                {tr("Complétion", "Vollständigkeit")}
              </span>
              <span className="font-bold text-navy tabular-nums">{completion}%</span>
            </div>
            <div className="h-2 bg-slate-light rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-navy to-clover transition-all duration-500"
                style={{ width: `${completion}%` }}
              />
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setLiveMode(true)}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm font-bold bg-gradient-to-r from-cyan to-cyan-mid text-white hover:opacity-90 shadow-sm"
              title={tr("Vue plein écran avec le patient · enregistrement intégré", "Vollbildansicht mit Patient · integrierte Aufnahme")}
            >
              <Eye className="w-4 h-4" />
              {tr("Mode entretien live", "Live-Modus")}
            </button>
            <button
              onClick={() => setImporterOpen(true)}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium bg-navy text-white hover:bg-navy-mid"
              title={tr("Importer transcript Plaud / Azure Speech", "Plaud / Azure Speech importieren")}
            >
              <ClipboardPaste className="w-4 h-4" />
              {tr("Coller / Importer", "Einfügen / Importieren")}
            </button>
            <button
              onClick={() => generateBlankAnamnesisForm(patient, lang)}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium border border-hairline text-navy hover:bg-navy-pale"
              title={tr("Imprimer la fiche vierge pour avoir sur la table", "Leeres Formular drucken")}
            >
              <Printer className="w-4 h-4" />
              {tr("Fiche vierge", "Leeres Formular")}
            </button>
            <button
              onClick={() => onSave?.(data)}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium border border-hairline text-navy hover:bg-navy-pale"
            >
              <Save className="w-4 h-4" />
              {tr("Enregistrer", "Speichern")}
            </button>
            <button
              onClick={() => onGeneratePDF?.(data)}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium bg-clover text-white hover:bg-clover/90"
            >
              <FileText className="w-4 h-4" />
              {tr("PDF rempli", "Ausgefülltes PDF")}
            </button>
          </div>
        </div>
        {data.meta.transcriptSource === "plaud" && (
          <div className="mt-2 text-[11px] text-clover flex items-center gap-1.5">
            <Sparkles className="w-3 h-3" />
            {tr(
              "Pré-rempli depuis transcript Plaud · Vérifier chaque champ avec le patient",
              "Vorausgefüllt aus Plaud-Transkript · Jedes Feld mit dem Patienten überprüfen"
            )}
          </div>
        )}
      </div>

      {/* Sections */}
      <div className="space-y-3">
        {SECTION_ORDER.map((sectionKey) => (
          <Section
            key={sectionKey}
            sectionKey={sectionKey}
            label={
              sectionKey === "clinicianNotes"
                ? tr("Notes du clinicien", "Notizen des Klinikers")
                : tr(
                    SECTION_LABELS[sectionKey].fr,
                    SECTION_LABELS[sectionKey].de
                  )
            }
            isOpen={openSection === sectionKey}
            onToggle={() =>
              setOpenSection(openSection === sectionKey ? null : sectionKey)
            }
            isComplete={isSectionComplete(data, sectionKey)}
          >
            {sectionKey === "mainComplaint" && (
              <MainComplaintSection data={data} update={updateField} wasFilled={wasFilled} tr={tr} />
            )}
            {sectionKey === "painHistory" && (
              <PainHistorySection data={data} update={updateField} wasFilled={wasFilled} tr={tr} />
            )}
            {sectionKey === "daySchema" && (
              <DaySchemaSection data={data} update={updateField} wasFilled={wasFilled} tr={tr} />
            )}
            {sectionKey === "factors" && (
              <FactorsSection data={data} update={updateField} wasFilled={wasFilled} tr={tr} />
            )}
            {sectionKey === "pain" && (
              <PainSection data={data} update={updateField} wasFilled={wasFilled} tr={tr} />
            )}
            {sectionKey === "medical" && (
              <MedicalSection data={data} update={updateField} wasFilled={wasFilled} tr={tr} />
            )}
            {sectionKey === "profession" && (
              <ProfessionSection data={data} update={updateField} wasFilled={wasFilled} tr={tr} />
            )}
            {sectionKey === "yellowFlags" && (
              <YellowFlagsSection data={data} update={updateField} wasFilled={wasFilled} tr={tr} />
            )}
            {sectionKey === "patientPerspective" && (
              <PerspectiveSection data={data} update={updateField} wasFilled={wasFilled} tr={tr} />
            )}
            {sectionKey === "clinicianNotes" && (
              <textarea
                value={data.clinicianNotes}
                onChange={(e) => setData((d) => ({ ...d, clinicianNotes: e.target.value }))}
                rows={4}
                className="w-full rounded-md border border-hairline px-3 py-2 text-sm"
                placeholder={tr(
                  "Impression clinique, hypothèses, décisions, points à creuser…",
                  "Klinischer Eindruck, Hypothesen, Entscheidungen, zu vertiefende Punkte…"
                )}
              />
            )}
          </Section>
        ))}
      </div>

      {/* Modal import */}
      {importerOpen && (
        <TranscriptImporter
          patientId={patient.id}
          onImport={handleImport}
          onClose={() => setImporterOpen(false)}
        />
      )}

      {/* Mode entretien live (plein écran avec patient) */}
      {liveMode && (
        <LiveInterviewMode
          data={data}
          onUpdate={updateField}
          onClose={() => setLiveMode(false)}
          onAudioTranscript={(text) => {
            const result = parseTranscript(text, patient.id);
            handleImport(result);
          }}
        />
      )}
    </div>
  );
}

// ─── Section wrapper ────────────────────────────────────────────────
function Section({
  sectionKey,
  label,
  isOpen,
  onToggle,
  isComplete,
  children,
}: {
  sectionKey: string;
  label: string;
  isOpen: boolean;
  onToggle: () => void;
  isComplete: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-hairline bg-white overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full px-4 py-3 flex items-center gap-3 hover:bg-slate-light/30 transition text-left"
      >
        {isComplete ? (
          <CheckCircle2 className="w-5 h-5 text-clover shrink-0" />
        ) : (
          <div className="w-5 h-5 rounded-full border-2 border-slate-light shrink-0" />
        )}
        <div className="flex-1 font-medium text-navy">{label}</div>
        {isOpen ? (
          <ChevronDown className="w-4 h-4 text-slate" />
        ) : (
          <ChevronRight className="w-4 h-4 text-slate" />
        )}
      </button>
      {isOpen && <div className="px-4 pb-4 pt-1 border-t border-hairline/40">{children}</div>}
    </div>
  );
}

// ─── Field components ──────────────────────────────────────────────
function FieldLabel({ children, filled }: { children: React.ReactNode; filled?: boolean }) {
  return (
    <div className="text-xs text-slate uppercase tracking-wide font-medium mb-1 flex items-center gap-1.5">
      {children}
      {filled && (
        <span className="inline-flex items-center gap-0.5 text-clover text-[9px]">
          <Sparkles className="w-2.5 h-2.5" /> IA
        </span>
      )}
    </div>
  );
}

function TextInput({
  value,
  onChange,
  placeholder,
  filled,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  filled?: boolean;
}) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={cn(
        "w-full rounded-md border px-3 py-1.5 text-sm transition",
        filled
          ? "border-clover bg-clover-soft/30 focus:bg-white"
          : "border-hairline focus:border-navy"
      )}
    />
  );
}

function TextArea({
  value,
  onChange,
  placeholder,
  rows = 2,
  filled,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
  filled?: boolean;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className={cn(
        "w-full rounded-md border px-3 py-1.5 text-sm transition resize-y",
        filled
          ? "border-clover bg-clover-soft/30 focus:bg-white"
          : "border-hairline focus:border-navy"
      )}
    />
  );
}

function ChipGroup({
  options,
  selected,
  onChange,
  filled,
}: {
  options: { value: string; label: string }[];
  selected: string[];
  onChange: (v: string[]) => void;
  filled?: boolean;
}) {
  const toggle = (v: string) => {
    if (selected.includes(v)) onChange(selected.filter((x) => x !== v));
    else onChange([...selected, v]);
  };
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((opt) => {
        const active = selected.includes(opt.value);
        return (
          <button
            key={opt.value}
            onClick={() => toggle(opt.value)}
            className={cn(
              "px-2.5 py-1 rounded-full text-xs font-medium border transition",
              active
                ? "bg-navy text-white border-navy"
                : "border-hairline text-slate hover:border-navy-mid hover:text-navy"
            )}
          >
            {opt.label}
          </button>
        );
      })}
      {filled && selected.length > 0 && (
        <span className="text-[10px] text-clover inline-flex items-center gap-0.5">
          <Sparkles className="w-2.5 h-2.5" /> IA
        </span>
      )}
    </div>
  );
}

// ─── Helper type for section components ────────────────────────────
type SectionProps = {
  data: AnamnesisData;
  update: <K extends keyof AnamnesisData>(
    section: K,
    field: keyof AnamnesisData[K],
    value: AnamnesisData[K][keyof AnamnesisData[K]]
  ) => void;
  wasFilled: (section: string, field: string) => boolean;
  tr: (fr: string, de: string) => string;
};

// ─── 1. Plainte principale ────────────────────────────────────────
function MainComplaintSection({ data, update, wasFilled, tr }: SectionProps) {
  const locationOptions = [
    "lombaire", "sciatique", "dorsal", "cervical", "épaule", "trapèze",
    "fessier", "hanche", "genou", "bras", "jambe",
  ].map((v) => ({ value: v, label: v.charAt(0).toUpperCase() + v.slice(1) }));
  const sensationOptions = [
    "douleur", "picotements", "fourmillements", "brûlure", "engourdissement", "décharges",
  ].map((v) => ({ value: v, label: v.charAt(0).toUpperCase() + v.slice(1) }));
  return (
    <div className="space-y-3 pt-2">
      <div>
        <FieldLabel filled={wasFilled("Plainte principale", "Description")}>
          {tr("Description de la plainte (mots du patient)", "Beschreibung der Beschwerde (Patientenworte)")}
        </FieldLabel>
        <TextArea
          value={data.mainComplaint.description}
          onChange={(v) => update("mainComplaint", "description", v)}
          rows={2}
          filled={wasFilled("Plainte principale", "Description")}
        />
      </div>
      <div>
        <FieldLabel filled={wasFilled("Plainte principale", "Localisations")}>
          {tr("Zones douloureuses (cocher)", "Schmerzregionen (ankreuzen)")}
        </FieldLabel>
        <ChipGroup
          options={locationOptions}
          selected={data.mainComplaint.locations}
          onChange={(v) => update("mainComplaint", "locations", v)}
          filled={wasFilled("Plainte principale", "Localisations")}
        />
      </div>
      <div>
        <FieldLabel>
          {tr("Irradiation (trajet de la douleur)", "Ausstrahlung (Schmerzverlauf)")}
        </FieldLabel>
        <TextInput
          value={data.mainComplaint.irradiation}
          onChange={(v) => update("mainComplaint", "irradiation", v)}
          placeholder={tr("ex. descend jusqu'au mollet G, plante du pied", "z.B. zieht bis zur linken Wade")}
        />
      </div>
      <div>
        <FieldLabel filled={wasFilled("Plainte principale", "Sensations")}>
          {tr("Type de sensation", "Empfindungstyp")}
        </FieldLabel>
        <ChipGroup
          options={sensationOptions}
          selected={data.mainComplaint.sensationType}
          onChange={(v) => update("mainComplaint", "sensationType", v)}
          filled={wasFilled("Plainte principale", "Sensations")}
        />
      </div>
    </div>
  );
}

// ─── 2. Histoire ──────────────────────────────────────────────────
function PainHistorySection({ data, update, wasFilled, tr }: SectionProps) {
  return (
    <div className="space-y-3 pt-2">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <FieldLabel filled={wasFilled("Histoire", "Date début")}>
            {tr("Date / ancienneté du début", "Datum / Dauer des Beginns")}
          </FieldLabel>
          <TextInput
            value={data.painHistory.onsetDate}
            onChange={(v) => update("painHistory", "onsetDate", v)}
            placeholder={tr("ex. octobre 2023, depuis 6 mois", "z.B. Oktober 2023, seit 6 Monaten")}
            filled={wasFilled("Histoire", "Date début")}
          />
        </div>
        <div>
          <FieldLabel filled={wasFilled("Histoire", "Type début")}>
            {tr("Type de début", "Art des Beginns")}
          </FieldLabel>
          <select
            value={data.painHistory.onsetType}
            onChange={(e) =>
              update(
                "painHistory",
                "onsetType",
                e.target.value as typeof data.painHistory.onsetType
              )
            }
            className={cn(
              "w-full rounded-md border px-3 py-1.5 text-sm",
              wasFilled("Histoire", "Type début")
                ? "border-clover bg-clover-soft/30"
                : "border-hairline"
            )}
          >
            <option value="">—</option>
            {Object.entries(ONSET_TYPE_LABELS).map(([k, v]) => (
              <option key={k} value={k}>
                {tr(v.fr, v.de)}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <FieldLabel>
          {tr("Détails sur le début / circonstances", "Details zum Beginn / Umstände")}
        </FieldLabel>
        <TextArea
          value={data.painHistory.onsetDetails}
          onChange={(v) => update("painHistory", "onsetDetails", v)}
          rows={2}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <FieldLabel>{tr("Évolution actuelle", "Aktuelle Entwicklung")}</FieldLabel>
          <select
            value={data.painHistory.evolution}
            onChange={(e) =>
              update("painHistory", "evolution", e.target.value as typeof data.painHistory.evolution)
            }
            className="w-full rounded-md border border-hairline px-3 py-1.5 text-sm"
          >
            <option value="">—</option>
            {Object.entries(EVOLUTION_LABELS).map(([k, v]) => (
              <option key={k} value={k}>
                {tr(v.fr, v.de)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <FieldLabel>{tr("Épisodes antérieurs", "Frühere Episoden")}</FieldLabel>
          <TextInput
            value={data.painHistory.previousEpisodes}
            onChange={(v) => update("painHistory", "previousEpisodes", v)}
            placeholder={tr("ex. 1er épisode en 2018", "z.B. 1. Episode 2018")}
          />
        </div>
      </div>
      <div>
        <FieldLabel filled={wasFilled("Histoire", "Traitements essayés")}>
          {tr("Traitements déjà essayés (et résultats)", "Bereits versuchte Behandlungen (und Ergebnisse)")}
        </FieldLabel>
        <TextArea
          value={data.painHistory.treatmentsTried}
          onChange={(v) => update("painHistory", "treatmentsTried", v)}
          rows={2}
          filled={wasFilled("Histoire", "Traitements essayés")}
          placeholder={tr(
            "kiné classique, infiltrations, ostéo, médicaments…",
            "klassische PT, Infiltrationen, Osteo, Medikamente…"
          )}
        />
      </div>
    </div>
  );
}

// ─── 3. 24h ──────────────────────────────────────────────────────
function DaySchemaSection({ data, update, wasFilled, tr }: SectionProps) {
  const momentOptions = [
    { value: "matin", label: tr("Matin", "Morgen") },
    { value: "journée", label: tr("Journée", "Tag") },
    { value: "soir", label: tr("Soir", "Abend") },
    { value: "nuit", label: tr("Nuit", "Nacht") },
  ];
  return (
    <div className="space-y-3 pt-2">
      <div>
        <FieldLabel>{tr("Pire moment de la douleur (cocher)", "Schmerzhöhepunkt (ankreuzen)")}</FieldLabel>
        <ChipGroup
          options={momentOptions}
          selected={data.daySchema.worstMoment}
          onChange={(v) => update("daySchema", "worstMoment", v)}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <FieldLabel filled={wasFilled("24h", "Raideur matinale")}>
            {tr("Durée raideur matinale", "Dauer Morgensteifigkeit")}
          </FieldLabel>
          <TextInput
            value={data.daySchema.morningStiffnessDuration}
            onChange={(v) => update("daySchema", "morningStiffnessDuration", v)}
            placeholder={tr("ex. 15 min, > 30 min", "z.B. 15 Min, > 30 Min")}
            filled={wasFilled("24h", "Raideur matinale")}
          />
        </div>
        <div>
          <FieldLabel>{tr("Qualité du sommeil", "Schlafqualität")}</FieldLabel>
          <select
            value={data.daySchema.sleepQuality}
            onChange={(e) =>
              update(
                "daySchema",
                "sleepQuality",
                e.target.value as typeof data.daySchema.sleepQuality
              )
            }
            className="w-full rounded-md border border-hairline px-3 py-1.5 text-sm"
          >
            <option value="">—</option>
            {Object.entries(SLEEP_QUALITY_LABELS).map(([k, v]) => (
              <option key={k} value={k}>
                {tr(v.fr, v.de)}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <FieldLabel>{tr("Heures de sommeil moy.", "Ø Schlafstunden")}</FieldLabel>
          <TextInput
            value={data.daySchema.sleepHoursAvg}
            onChange={(v) => update("daySchema", "sleepHoursAvg", v)}
            placeholder="6-7 h"
          />
        </div>
        <div>
          <FieldLabel>{tr("Tolérance assise", "Sitztoleranz")}</FieldLabel>
          <TextInput
            value={data.daySchema.sittingTolerance}
            onChange={(v) => update("daySchema", "sittingTolerance", v)}
            placeholder={tr("ex. 30 min max", "z.B. max. 30 Min")}
          />
        </div>
        <div>
          <FieldLabel>{tr("Tolérance marche", "Gehtoleranz")}</FieldLabel>
          <TextInput
            value={data.daySchema.walkingTolerance}
            onChange={(v) => update("daySchema", "walkingTolerance", v)}
            placeholder={tr("ex. 20 min sans crise", "z.B. 20 Min ohne Krise")}
          />
        </div>
      </div>
      <div>
        <FieldLabel>{tr("Réveils nocturnes", "Nächtliches Aufwachen")}</FieldLabel>
        <TextInput
          value={data.daySchema.nightAwakenings}
          onChange={(v) => update("daySchema", "nightAwakenings", v)}
          placeholder={tr("ex. 2-3 fois, douleur ou changement de position", "z.B. 2-3 mal, Schmerz oder Positionswechsel")}
        />
      </div>
    </div>
  );
}

// ─── 4. Facteurs ─────────────────────────────────────────────────
function FactorsSection({ data, update, wasFilled, tr }: SectionProps) {
  return (
    <div className="space-y-3 pt-2">
      <div>
        <FieldLabel filled={wasFilled("Facteurs", "aggravants")}>
          {tr("Facteurs provocants / aggravants", "Aggravierende Faktoren")}
        </FieldLabel>
        <TextArea
          value={data.factors.aggravating}
          onChange={(v) => update("factors", "aggravating", v)}
          rows={2}
          filled={data.factors.aggravating.length > 0}
        />
      </div>
      <div>
        <FieldLabel filled={wasFilled("Facteurs", "soulageants")}>
          {tr("Facteurs soulageants", "Lindernde Faktoren")}
        </FieldLabel>
        <TextArea
          value={data.factors.relieving}
          onChange={(v) => update("factors", "relieving", v)}
          rows={2}
          filled={data.factors.relieving.length > 0}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <FieldLabel filled={wasFilled("Facteurs", "Médicament")}>
            {tr("Médicaments actuels", "Aktuelle Medikamente")}
          </FieldLabel>
          <TextArea
            value={data.factors.currentMedications}
            onChange={(v) => update("factors", "currentMedications", v)}
            rows={2}
            filled={wasFilled("Facteurs", "Médicament")}
            placeholder={tr("nom + dose + fréquence", "Name + Dosis + Häufigkeit")}
          />
        </div>
        <div>
          <FieldLabel>{tr("Effet ressenti des médicaments", "Wirkung der Medikamente")}</FieldLabel>
          <TextArea
            value={data.factors.medicationEffect}
            onChange={(v) => update("factors", "medicationEffect", v)}
            rows={2}
            placeholder={tr("ex. soulage moitié, pas d'effet, somnolence", "z.B. lindert teilweise, keine Wirkung, Schläfrigkeit")}
          />
        </div>
      </div>
    </div>
  );
}

// ─── 5. EVA ──────────────────────────────────────────────────────
function PainSection({ data, update, wasFilled, tr }: SectionProps) {
  const fields: { key: keyof AnamnesisData["pain"]; labelFr: string; labelDe: string }[] = [
    { key: "worst2weeks", labelFr: "Pire (2 sem.)", labelDe: "Stärkste (2 Wochen)" },
    { key: "average2weeks", labelFr: "Moyenne (2 sem.)", labelDe: "Durchschnitt (2 Wochen)" },
    { key: "atRest", labelFr: "Au repos", labelDe: "In Ruhe" },
    { key: "onActivity", labelFr: "En activité", labelDe: "Bei Aktivität" },
  ];
  return (
    <div className="space-y-3 pt-2">
      <div className="text-xs text-slate italic">
        {tr(
          "Échelle Philippe : 0 = aucune · 3 = inconfort · 5 = je prends un antalgique · 6-7 = je vois le médecin · 10 = lumière au bout du couloir",
          "Philippe-Skala: 0 = keine · 3 = Unbehagen · 5 = ich nehme ein Schmerzmittel · 6-7 = ich gehe zum Arzt · 10 = weißes Licht am Ende des Flurs"
        )}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {fields.map((f) => (
          <div key={f.key}>
            <FieldLabel filled={f.key === "worst2weeks" && wasFilled("EVA", "Pic 2 sem.")}>
              {tr(f.labelFr, f.labelDe)}
            </FieldLabel>
            <input
              type="number"
              min={0}
              max={10}
              value={data.pain[f.key] ?? ""}
              onChange={(e) =>
                update(
                  "pain",
                  f.key,
                  e.target.value === "" ? null : parseInt(e.target.value)
                )
              }
              className={cn(
                "w-full rounded-md border px-3 py-1.5 text-sm tabular-nums",
                f.key === "worst2weeks" && wasFilled("EVA", "Pic 2 sem.")
                  ? "border-clover bg-clover-soft/30"
                  : "border-hairline"
              )}
              placeholder="0-10"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── 6. Médical ──────────────────────────────────────────────────
function MedicalSection({ data, update, wasFilled, tr }: SectionProps) {
  const comorbOptions = [
    "Hypertension artérielle", "Diabète", "Trouble thyroïdien",
    "Dépression / antidépresseur", "Fibromyalgie", "Ostéoporose",
    "Endométriose", "Arthrose", "Scoliose", "Asthme",
    "Antécédent cancer", "Burn-out", "Lymphœdème",
  ].map((v) => ({ value: v, label: v }));
  return (
    <div className="space-y-3 pt-2">
      <div>
        <FieldLabel filled={wasFilled("Médical", "Imagerie")}>
          {tr("Imagerie réalisée (résultats)", "Durchgeführte Bildgebung (Ergebnisse)")}
        </FieldLabel>
        <TextArea
          value={data.medical.imaging}
          onChange={(v) => update("medical", "imaging", v)}
          rows={2}
          filled={wasFilled("Médical", "Imagerie")}
          placeholder={tr("ex. IRM L5-S1 (mars 2024) : protrusion discale", "z.B. MRT L5-S1 (März 2024): Bandscheibenvorwölbung")}
        />
      </div>
      <div>
        <FieldLabel filled={wasFilled("Médical", "Chirurgies")}>
          {tr("Antécédents chirurgicaux", "Chirurgische Vorgeschichte")}
        </FieldLabel>
        <TextArea
          value={data.medical.surgeries}
          onChange={(v) => update("medical", "surgeries", v)}
          rows={2}
          filled={wasFilled("Médical", "Chirurgies")}
          placeholder={tr("type + date + résultat", "Typ + Datum + Ergebnis")}
        />
      </div>
      <div>
        <FieldLabel filled={wasFilled("Médical", "Comorbidité")}>
          {tr("Comorbidités", "Komorbiditäten")}
        </FieldLabel>
        <ChipGroup
          options={comorbOptions}
          selected={data.medical.comorbidities}
          onChange={(v) => update("medical", "comorbidities", v)}
          filled={wasFilled("Médical", "Comorbidité")}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <FieldLabel>{tr("Allergies", "Allergien")}</FieldLabel>
          <TextInput
            value={data.medical.allergies}
            onChange={(v) => update("medical", "allergies", v)}
            placeholder={tr("ex. AINS, pénicilline", "z.B. NSAID, Penicillin")}
          />
        </div>
        <div>
          <FieldLabel filled={wasFilled("Médical", "Poids")}>
            {tr("Variation pondérale récente", "Aktuelle Gewichtsveränderung")}
          </FieldLabel>
          <TextInput
            value={data.medical.weightChange}
            onChange={(v) => update("medical", "weightChange", v)}
            filled={wasFilled("Médical", "Poids")}
          />
        </div>
      </div>
      <div>
        <FieldLabel>{tr("Autres pathologies / commentaires", "Sonstige Erkrankungen / Bemerkungen")}</FieldLabel>
        <TextArea
          value={data.medical.otherConditions}
          onChange={(v) => update("medical", "otherConditions", v)}
          rows={2}
        />
      </div>
    </div>
  );
}

// ─── 7. Profession ───────────────────────────────────────────────
function ProfessionSection({ data, update, wasFilled, tr }: SectionProps) {
  const constraintOptions = [
    "Station debout prolongée",
    "Port de charges",
    "Position assise prolongée",
    "Vibrations corps entier",
    "Conduite prolongée",
    "Travail sur écran",
    "Mouvements répétitifs",
  ].map((v) => ({ value: v, label: v }));

  return (
    <div className="space-y-3 pt-2">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <FieldLabel filled={wasFilled("Profession", "Métier")}>
            {tr("Métier actuel / dernier exercé", "Aktueller / letzter Beruf")}
          </FieldLabel>
          <TextInput
            value={data.profession.currentJob}
            onChange={(v) => update("profession", "currentJob", v)}
            filled={wasFilled("Profession", "Métier")}
          />
        </div>
        <div>
          <FieldLabel>{tr("Statut", "Status")}</FieldLabel>
          <select
            value={data.profession.workStatus}
            onChange={(e) =>
              update(
                "profession",
                "workStatus",
                e.target.value as typeof data.profession.workStatus
              )
            }
            className="w-full rounded-md border border-hairline px-3 py-1.5 text-sm"
          >
            <option value="">—</option>
            {Object.entries(WORK_STATUS_LABELS).map(([k, v]) => (
              <option key={k} value={k}>
                {tr(v.fr, v.de)}
              </option>
            ))}
          </select>
        </div>
      </div>
      {data.profession.workStatus === "sick_leave" && (
        <div>
          <FieldLabel>{tr("Durée d'arrêt", "Krankschreibungsdauer")}</FieldLabel>
          <TextInput
            value={data.profession.sickLeaveDuration}
            onChange={(v) => update("profession", "sickLeaveDuration", v)}
            placeholder={tr("ex. 6 mois", "z.B. 6 Monate")}
          />
        </div>
      )}
      <div>
        <FieldLabel>{tr("Contraintes professionnelles", "Berufliche Belastungen")}</FieldLabel>
        <ChipGroup
          options={constraintOptions}
          selected={data.profession.jobConstraints}
          onChange={(v) => update("profession", "jobConstraints", v)}
        />
      </div>
      <div>
        <FieldLabel filled={wasFilled("Profession", "Sport/loisirs")}>
          {tr("Sport et loisirs (actuels / passés)", "Sport und Hobbys (aktuell / vergangen)")}
        </FieldLabel>
        <TextArea
          value={data.profession.sportsHobbies}
          onChange={(v) => update("profession", "sportsHobbies", v)}
          rows={2}
          filled={wasFilled("Profession", "Sport/loisirs")}
        />
      </div>
      <div>
        <FieldLabel>{tr("Contexte social / familial", "Sozialer / familiärer Kontext")}</FieldLabel>
        <TextArea
          value={data.profession.socialContext}
          onChange={(v) => update("profession", "socialContext", v)}
          rows={2}
          placeholder={tr("ex. vit avec conjoint, 2 enfants, aide aux parents", "z.B. lebt mit Partner, 2 Kinder, Pflege der Eltern")}
        />
      </div>
    </div>
  );
}

// ─── 9. Yellow flags ─────────────────────────────────────────────
function YellowFlagsSection({ data, update, wasFilled, tr }: SectionProps) {
  const fields: { key: keyof AnamnesisData["yellowFlags"]; labelFr: string; labelDe: string; hintFr: string; hintDe: string }[] = [
    { key: "attitudes", labelFr: "Attitudes / croyances", labelDe: "Einstellungen / Überzeugungen", hintFr: "ex. catastrophisation, croyances erronées sur le dos", hintDe: "z.B. Katastrophisierung, falsche Überzeugungen" },
    { key: "behaviors", labelFr: "Comportements", labelDe: "Verhalten", hintFr: "ex. kinésiophobie, évitement, hyperactivité", hintDe: "z.B. Kinesiophobie, Vermeidung" },
    { key: "compensation", labelFr: "Compensation / litige", labelDe: "Kompensation / Rechtsstreit", hintFr: "AT, assurance, procédure en cours", hintDe: "AU, Versicherung, laufendes Verfahren" },
    { key: "diagnosis", labelFr: "Diagnostic / traitement", labelDe: "Diagnose / Behandlung", hintFr: "confusion diagnostique, traitements multiples sans effet", hintDe: "diagnostische Verwirrung" },
    { key: "emotions", labelFr: "Émotions", labelDe: "Emotionen", hintFr: "anxiété, dépression, colère", hintDe: "Angst, Depression, Wut" },
    { key: "family", labelFr: "Famille", labelDe: "Familie", hintFr: "soutien ou surprotection", hintDe: "Unterstützung oder Überprotektion" },
    { key: "work", labelFr: "Travail", labelDe: "Arbeit", hintFr: "satisfaction, conflit, perte de sens", hintDe: "Zufriedenheit, Konflikt" },
    { key: "social", labelFr: "Social", labelDe: "Sozial", hintFr: "isolement, soutien limité", hintDe: "Isolation" },
  ];
  return (
    <div className="space-y-3 pt-2">
      <div className="text-xs text-slate italic">
        {tr(
          "Grille ABCDEFWS — facteurs psycho-sociaux qui freinent la récupération",
          "ABCDEFWS-Raster — psychosoziale Faktoren, die die Genesung bremsen"
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {fields.map((f) => (
          <div key={f.key}>
            <FieldLabel filled={data.yellowFlags[f.key].length > 0 && wasFilled("Yellow", f.key)}>
              {tr(f.labelFr, f.labelDe)}
            </FieldLabel>
            <TextInput
              value={data.yellowFlags[f.key]}
              onChange={(v) => update("yellowFlags", f.key, v)}
              placeholder={tr(f.hintFr, f.hintDe)}
              filled={data.yellowFlags[f.key].length > 0}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── 10. Représentation patient ──────────────────────────────────
function PerspectiveSection({ data, update, wasFilled, tr }: SectionProps) {
  return (
    <div className="space-y-3 pt-2">
      <div>
        <FieldLabel filled={data.patientPerspective.cause.length > 0}>
          {tr("Cause selon le patient", "Ursache laut Patient")}
        </FieldLabel>
        <TextArea
          value={data.patientPerspective.cause}
          onChange={(v) => update("patientPerspective", "cause", v)}
          rows={2}
          filled={data.patientPerspective.cause.length > 0}
        />
      </div>
      <div>
        <FieldLabel>{tr("Craintes exprimées", "Geäußerte Ängste")}</FieldLabel>
        <TextArea
          value={data.patientPerspective.fears}
          onChange={(v) => update("patientPerspective", "fears", v)}
          rows={2}
          placeholder={tr("ex. peur de la chirurgie, peur d'aggraver", "z.B. Angst vor OP, Angst zu verschlimmern")}
        />
      </div>
      <div>
        <FieldLabel filled={wasFilled("Perspective", "Objectifs")}>
          {tr("Objectifs du patient (SMART)", "Patientenziele (SMART)")}
        </FieldLabel>
        <div className="space-y-1.5">
          {[0, 1, 2].map((i) => (
            <TextInput
              key={i}
              value={data.patientPerspective.goals[i] ?? ""}
              onChange={(v) => {
                const goals = [...data.patientPerspective.goals];
                goals[i] = v;
                update("patientPerspective", "goals", goals.filter(Boolean));
              }}
              placeholder={tr(`Objectif n°${i + 1} — spécifique, mesurable, atteignable, réaliste, temporel`, `Ziel Nr. ${i + 1} — SMART`)}
              filled={
                i === 0 &&
                wasFilled("Perspective", "Objectifs") &&
                (data.patientPerspective.goals[i] ?? "").length > 0
              }
            />
          ))}
        </div>
      </div>
      <div>
        <FieldLabel>{tr("Attentes vis-à-vis du programme", "Erwartungen an das Programm")}</FieldLabel>
        <TextArea
          value={data.patientPerspective.expectations}
          onChange={(v) => update("patientPerspective", "expectations", v)}
          rows={2}
        />
      </div>
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────
function isSectionComplete(data: AnamnesisData, key: string): boolean {
  switch (key) {
    case "mainComplaint":
      return data.mainComplaint.description.length > 0 || data.mainComplaint.locations.length > 0;
    case "painHistory":
      return data.painHistory.onsetType !== "" || data.painHistory.onsetDate !== "";
    case "daySchema":
      return data.daySchema.worstMoment.length > 0 || data.daySchema.sleepQuality !== "";
    case "factors":
      return data.factors.aggravating !== "" || data.factors.relieving !== "";
    case "pain":
      return data.pain.worst2weeks != null;
    case "medical":
      return data.medical.comorbidities.length > 0 || data.medical.imaging !== "" || data.medical.surgeries !== "";
    case "profession":
      return data.profession.currentJob !== "" || data.profession.workStatus !== "";
    case "yellowFlags":
      return Object.values(data.yellowFlags).some((v) => v.length > 0);
    case "patientPerspective":
      return data.patientPerspective.goals.length > 0 || data.patientPerspective.cause !== "";
    case "clinicianNotes":
      return data.clinicianNotes.length > 0;
    default:
      return false;
  }
}

function computeCompletion(data: AnamnesisData): number {
  const sections = [
    "mainComplaint", "painHistory", "daySchema", "factors",
    "pain", "medical", "profession",
    "yellowFlags", "patientPerspective", "clinicianNotes",
  ];
  const done = sections.filter((s) => isSectionComplete(data, s)).length;
  return Math.round((done / sections.length) * 100);
}

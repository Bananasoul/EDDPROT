"use client";

import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { useState } from "react";
import {
  ArrowLeft,
  FileText,
  AlertTriangle,
  Target,
  Activity,
  Calendar,
  User,
  Briefcase,
  Stethoscope,
  Languages,
  Flag,
} from "lucide-react";
import { getPatient } from "@/lib/mock-data";
import { useApp } from "@/lib/app-context";
import { generateMedicalReport } from "@/lib/pdf/medicalReport";
import { generateInamiReport } from "@/lib/pdf/inamiReport";
import { generateMutualLetter } from "@/lib/pdf/mutualLetter";
import { AiReportAssistant } from "@/components/AiReportAssistant";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { StatusBadge } from "@/components/StatusBadge";
import { ScoresTable } from "@/components/ScoresTable";
import { PainChart } from "@/components/PainChart";
import { MultiScoreChart } from "@/components/MultiScoreChart";
import { BodyChart } from "@/components/BodyChart";
import { BikeTest } from "@/components/BikeTest";
import { ApparatusSessionsView } from "@/components/ApparatusSessions";
import { RedFlagsChecklist, RedFlagsSummary } from "@/components/RedFlags";
import { cn } from "@/lib/utils";

type Tab = "overview" | "anamnesis" | "tests" | "sessions" | "report";

/**
 * Pré-cochage heuristique des drapeaux rouges à partir des champs
 * complaint, hypothesis et redFlags du dossier mock. Permet à la démo
 * de pré-remplir les checklists pour les patients déjà identifiés.
 */
function inferRedFlagIdsForPatient(p: NonNullable<ReturnType<typeof getPatient>>): string[] {
  const ids: string[] = [];
  const text = (p.complaint + " " + p.hypothesis + " " + p.redFlags.join(" ")).toLowerCase();
  // Queue de cheval (Pascal Renard p013)
  if (text.includes("uriner") || text.includes("urinaire") || text.includes("queue de cheval"))
    ids.push("ce_urinary");
  if (text.includes("périnéal") || text.includes("paresthésies périnéales") || text.includes("anesthésie"))
    ids.push("ce_saddle");
  if (text.includes("sphinctérien") || text.includes("incontinence")) ids.push("ce_fecal");
  // Ostéoporose connue (Hildegard Müller p011)
  if (text.includes("ostéoporose") || text.includes("dxa")) ids.push("fr_osteoporosis");
  // Cancer
  if (text.includes("perte de poids")) ids.push("ca_weight_loss");
  if (text.includes("antécédent cancer")) ids.push("ca_history");
  return ids;
}

export default function PatientPage() {
  const params = useParams<{ id: string }>();
  const p = getPatient(params.id);
  const { t } = useApp();
  const [tab, setTab] = useState<Tab>("overview");

  if (!p) return notFound();

  const tabs: { key: Tab; label: string }[] = [
    { key: "overview", label: t.nav.overview },
    { key: "anamnesis", label: t.nav.anamnesis },
    { key: "tests", label: t.nav.tests },
    { key: "sessions", label: t.nav.sessions },
    { key: "report", label: t.nav.report },
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <Link
        href="/kine"
        className="inline-flex items-center gap-1.5 text-sm text-slate hover:text-navy mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        {t.patientsList}
      </Link>

      {/* Patient header */}
      <div className="bg-white rounded-xl border border-hairline p-6 mb-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-full bg-navy-pale text-navy flex items-center justify-center font-serif text-xl">
              {p.firstName[0]}
              {p.lastName[0]}
            </div>
            <div>
              <h1 className="font-serif text-2xl text-navy">
                {p.lastName.toUpperCase()} {p.firstName}
              </h1>
              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1.5 text-sm text-slate">
                <span className="inline-flex items-center gap-1">
                  <User className="w-3.5 h-3.5" />
                  {p.gender === "F" ? "♀" : "♂"} ·{" "}
                  {new Date(p.dob).toLocaleDateString("fr-BE")}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Briefcase className="w-3.5 h-3.5" /> {p.job}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Stethoscope className="w-3.5 h-3.5" /> {p.prescriber}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Languages className="w-3.5 h-3.5" /> {p.lang.toUpperCase()}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            <StatusBadge status={p.status} />
            <div className="text-xs text-slate">
              {p.sessionsDone}/36 {t.sessions.toLowerCase()}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mt-6 border-b border-hairline -mx-6 px-6">
          {tabs.map((tb) => (
            <button
              key={tb.key}
              onClick={() => setTab(tb.key)}
              className={cn(
                "px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition",
                tab === tb.key
                  ? "border-navy text-navy"
                  : "border-transparent text-slate hover:text-navy hover:border-hairline"
              )}
            >
              {tb.label}
            </button>
          ))}
        </div>
      </div>

      {tab === "overview" && <OverviewTab p={p} />}
      {tab === "anamnesis" && <AnamnesisTab p={p} />}
      {tab === "tests" && <TestsTab p={p} />}
      {tab === "sessions" && <SessionsTab p={p} />}
      {tab === "report" && <ReportTab p={p} />}
    </div>
  );
}

function OverviewTab({ p }: { p: NonNullable<ReturnType<typeof getPatient>> }) {
  const { t } = useApp();
  const redFlagIds = inferRedFlagIdsForPatient(p);
  return (
    <div className="space-y-6">
      {redFlagIds.length > 0 && <RedFlagsSummary checkedIds={redFlagIds} />}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader title={t.scores.title} subtitle="Entrée / Sortie · variation · seuils cliniques" />
          <CardBody className="pt-3">
            <ScoresTable t0={p.scoresT0} t1={p.scoresT1} />
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            title={t.evolution}
            subtitle="EVA · ODI · TSK · HAD — toutes les courbes superposées"
          />
          <CardBody>
            <MultiScoreChart patient={p} />
          </CardBody>
        </Card>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader title={t.alerts} />
          <CardBody className="space-y-3">
            {p.redFlags.length === 0 && p.yellowFlags.length === 0 && (
              <div className="text-sm text-clover flex items-center gap-2">
                <Flag className="w-4 h-4" />
                {t.flags.none}
              </div>
            )}
            {p.redFlags.length > 0 && (
              <div>
                <div className="text-xs font-semibold text-accent mb-1.5 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  {t.flags.red}
                </div>
                <ul className="space-y-1">
                  {p.redFlags.map((f, i) => (
                    <li key={i} className="text-sm text-ink flex gap-2">
                      <span className="w-1 h-1 rounded-full bg-accent mt-2 shrink-0" /> {f}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {p.yellowFlags.length > 0 && (
              <div>
                <div className="text-xs font-semibold text-amber mb-1.5 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  {t.flags.yellow}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {p.yellowFlags.map((f, i) => (
                    <Badge key={i} variant="amber">
                      {f}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            title={t.goals}
            action={<Target className="w-4 h-4 text-navy-mid" />}
          />
          <CardBody>
            {p.goals.length === 0 ? (
              <div className="text-sm text-slate">À définir lors de T0</div>
            ) : (
              <ul className="space-y-2">
                {p.goals.map((g, i) => (
                  <li key={i} className="text-sm flex gap-2">
                    <span className="w-5 h-5 rounded-full bg-navy-pale text-navy flex items-center justify-center text-[11px] font-semibold shrink-0">
                      {i + 1}
                    </span>
                    <span className="text-ink">{g}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>

        {p.nextAppointment && (
          <Card>
            <CardHeader title={t.upcoming} />
            <CardBody>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-navy-pale text-navy flex items-center justify-center">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-medium text-navy">
                    {new Date(p.nextAppointment).toLocaleString("fr-BE", {
                      weekday: "long",
                      day: "2-digit",
                      month: "long",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                  <div className="text-xs text-slate">Salle kiné 2 · HSNE</div>
                </div>
              </div>
            </CardBody>
          </Card>
        )}
      </div>
      </div>
    </div>
  );
}

function AnamnesisTab({ p }: { p: NonNullable<ReturnType<typeof getPatient>> }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Bandeau lancement anamnèse T0 */}
      <Card className="lg:col-span-2 border-l-4 border-l-navy bg-gradient-to-r from-navy-pale via-white to-amber-soft/30">
        <CardBody>
          <div className="flex items-start gap-4 flex-wrap">
            <div className="w-12 h-12 rounded-lg bg-navy text-white flex items-center justify-center shrink-0">
              <FileText className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-[250px]">
              <div className="text-xs uppercase tracking-wider text-amber font-semibold mb-0.5">
                Bilan d'entrée — Séance 1 (T0)
              </div>
              <h3 className="font-serif text-lg text-navy">
                Lancer l'anamnèse guidée T0
              </h3>
              <p className="text-sm text-slate mt-1 leading-relaxed">
                Formulaire structuré en 10 sections couvrant plainte, histoire, schéma 24h, EVA, antécédents, profession, drapeaux jaunes et objectifs.
                Possibilité d'importer un transcript Plaud — Copilot HSNE pré-remplit automatiquement les sections.
              </p>
            </div>
            <Link
              href={`/kine/${p.id}/anamnese-t0`}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-navy text-white text-sm font-medium hover:bg-navy-mid shrink-0"
            >
              <FileText className="w-4 h-4" />
              Lancer l'anamnèse T0
            </Link>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Plainte principale" />
        <CardBody>
          <p className="text-sm text-ink leading-relaxed">{p.complaint}</p>
        </CardBody>
      </Card>
      <Card>
        <CardHeader title="Hypothèse clinique" />
        <CardBody>
          <p className="text-sm text-ink leading-relaxed">{p.hypothesis}</p>
        </CardBody>
      </Card>
      <Card className="lg:col-span-2 border-l-4 border-l-amber">
        <CardHeader
          title="🚨 Drapeaux rouges — checklist sécurité"
          subtitle="Évaluation interactive (KCE 287 / NICE NG59) — co-responsabilité avec le MPR prescripteur"
        />
        <CardBody>
          <RedFlagsChecklist
            initialChecked={inferRedFlagIdsForPatient(p)}
            context="kine_t0"
          />
        </CardBody>
      </Card>
      <Card className="lg:col-span-2">
        <CardHeader
          title="Localisation de la douleur"
          subtitle="Cliquez sur les zones pour marquer l'intensité (0 → 3 → 6 → 9)"
        />
        <CardBody>
          <BodyChart />
        </CardBody>
      </Card>
      <Card className="lg:col-span-2">
        <CardHeader
          title="Anamnèse complète"
          subtitle="Saisie progressive — la structure reprend la fiche v3 (page 2)"
        />
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            {[
              "Anamnèse douleur (début, origine, évolution)",
              "Schéma 24h · sommeil · qualité",
              "Facteurs de provocation / diminution",
              "Santé générale + Red flags + Queue de cheval",
              "Représentation du patient · Objectifs",
              "Yellow flags (ABCDEFWS)",
            ].map((label, i) => (
              <div
                key={i}
                className="border border-dashed border-hairline rounded-lg p-4 hover:border-navy-mid transition cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-navy-pale text-navy flex items-center justify-center text-xs font-semibold">
                    {i + 1}
                  </span>
                  <span className="font-medium text-navy">{label}</span>
                </div>
                <div className="text-xs text-slate mt-1.5">Cliquer pour saisir…</div>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

function TestsTab({ p }: { p: NonNullable<ReturnType<typeof getPatient>> }) {
  const { t } = useApp();
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader title={t.scores.title} subtitle="Tous les scores validés du protocole" />
        <CardBody>
          <ScoresTable t0={p.scoresT0} t1={p.scoresT1} />
        </CardBody>
      </Card>
      <Card>
        <CardHeader
          title="Test endurance vélo (sub-max 75 % FCmax)"
          subtitle="Protocole HSNE · paliers 25 W / 2 min · normes ACSM 2018"
        />
        <CardBody>
          <BikeTest patient={p} />
        </CardBody>
      </Card>
    </div>
  );
}

function SessionsTab({ p }: { p: NonNullable<ReturnType<typeof getPatient>> }) {
  const { t } = useApp();
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader
          title={t.sessionsProgress}
          subtitle={`${p.sessionsDone} / 36 séances réalisées · vue d'ensemble du programme`}
        />
        <CardBody>
          <div className="grid grid-cols-9 md:grid-cols-12 gap-1.5">
            {Array.from({ length: 36 }).map((_, i) => {
              const done = i < p.sessionsDone;
              const isT0 = i === 0;
              const isT1 = i === 35;
              return (
                <div
                  key={i}
                  className={cn(
                    "aspect-square rounded text-[10px] flex flex-col items-center justify-center font-semibold tabular-nums",
                    done ? "bg-navy text-white" : "bg-slate-light text-slate border border-hairline",
                    (isT0 || isT1) && "ring-2 ring-amber"
                  )}
                  title={isT0 ? "T0 — bilan d'entrée" : isT1 ? "T1 — bilan de sortie" : `Séance ${i + 1}`}
                >
                  {i + 1}
                  {isT0 && <span className="text-[7px] opacity-80">T0</span>}
                  {isT1 && <span className="text-[7px] opacity-80">T1</span>}
                </div>
              );
            })}
          </div>
          <div className="mt-4 text-xs text-slate flex gap-4 flex-wrap">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-navy" /> Réalisée
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-slate-light border border-hairline" /> À faire
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-3 h-3 rounded ring-2 ring-amber" /> T0 / T1 (bilans)
            </span>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader
          title="Séances appareils — détail & progression"
          subtitle="Saisie quotidienne · suivi FC vs cible 75 % FCmax · graphique d'évolution"
        />
        <CardBody>
          <ApparatusSessionsView patient={p} />
        </CardBody>
      </Card>
    </div>
  );
}

function ReportTab({ p }: { p: NonNullable<ReturnType<typeof getPatient>> }) {
  const { t, lang } = useApp();
  const readyT1 = !!(p.scoresT0 && p.scoresT1);
  const documents = [
    {
      key: "medical",
      titleFr: "Rapport au médecin traitant",
      titleDe: "Bericht an den Hausarzt",
      descFr: "Compte-rendu clinique complet : anamnèse, scores T0/T1, évolution, drapeaux, recommandations.",
      descDe: "Vollständiger klinischer Bericht: Anamnese, T0/T1-Scores, Entwicklung, Flaggen, Empfehlungen.",
      ready: !!p.scoresT0,
      hint: !p.scoresT0
        ? lang === "de"
          ? "T0-Bewertung erforderlich"
          : "Bilan T0 requis"
        : !readyT1
        ? lang === "de"
          ? "Vorläufige Version (T1 ausstehend)"
          : "Version intermédiaire (T1 en attente)"
        : "",
      generate: () => generateMedicalReport(p, lang),
    },
    {
      key: "inami",
      titleFr: "Attestation INAMI 563011",
      titleDe: "INAMI-Bescheinigung 563011",
      descFr: "Attestation de fin de programme · récapitulatif honoraires · critères qualité KCE.",
      descDe: "Programmabschlussbescheinigung · Honorarübersicht · KCE-Qualitätskriterien.",
      ready: p.sessionsDone >= 6,
      hint: p.sessionsDone < 6 ? (lang === "de" ? "Mindestens 6 Sitzungen erforderlich" : "Min. 6 séances requises") : "",
      generate: () => generateInamiReport(p, lang),
    },
    {
      key: "mutual",
      titleFr: "Courrier mutuelle (prise en charge)",
      titleDe: "Krankenkassen-Schreiben (Kostenübernahme)",
      descFr: `Demande adressée à ${p.mutual} · indication clinique · cotation INAMI.`,
      descDe: `Antrag an ${p.mutual} · klinische Indikation · INAMI-Tarifierung.`,
      ready: true,
      hint: "",
      generate: () => generateMutualLetter(p, lang),
    },
  ];

  return (
    <div className="space-y-4">
      <AiReportAssistant patient={p} />
      <Card>
        <CardHeader
          title={t.nav.report}
          subtitle={lang === "de"
            ? "Automatische Generierung FR/DE — sofortiger PDF-Download"
            : "Génération automatique FR/DE — téléchargement PDF immédiat"}
        />
        <CardBody>
          <div className="grid gap-3">
            {documents.map((d) => (
              <div
                key={d.key}
                className="flex items-start gap-4 p-4 rounded-lg border border-hairline bg-white hover:border-navy-mid transition"
              >
                <div
                  className={cn(
                    "w-11 h-11 rounded-lg flex items-center justify-center shrink-0",
                    d.ready ? "bg-clover-soft text-clover" : "bg-slate-light text-slate"
                  )}
                >
                  <FileText className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-navy">
                    {lang === "de" ? d.titleDe : d.titleFr}
                  </div>
                  <div className="text-sm text-slate mt-0.5">
                    {lang === "de" ? d.descDe : d.descFr}
                  </div>
                  {d.hint && (
                    <div className="text-xs text-amber mt-1.5 font-medium">{d.hint}</div>
                  )}
                </div>
                <button
                  onClick={d.generate}
                  disabled={!d.ready}
                  className={cn(
                    "inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition shrink-0",
                    d.ready
                      ? "bg-navy text-white hover:bg-navy-mid"
                      : "bg-slate-light text-slate cursor-not-allowed"
                  )}
                >
                  <FileText className="w-4 h-4" />
                  {lang === "de" ? "PDF herunterladen" : "Télécharger PDF"}
                </button>
              </div>
            ))}
          </div>
          <div className="mt-4 text-xs text-slate flex items-start gap-2 p-3 rounded-md bg-navy-pale">
            <Activity className="w-4 h-4 shrink-0 mt-0.5" />
            <span>
              {lang === "de"
                ? "Alle Dokumente werden mit dem Briefkopf des SNH generiert und enthalten den Hinweis « Demonstration » mit fiktiven Daten."
                : "Tous les documents sont générés avec l'en-tête HSNE et porteront la mention « démonstration » tant que les données ne sont pas réelles."}
            </span>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

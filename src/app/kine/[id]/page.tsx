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
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { StatusBadge } from "@/components/StatusBadge";
import { ScoresTable } from "@/components/ScoresTable";
import { PainChart } from "@/components/PainChart";
import { cn } from "@/lib/utils";

type Tab = "overview" | "anamnesis" | "tests" | "sessions" | "report";

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
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader title={t.scores.title} subtitle="Entrée / Sortie · variation · seuils cliniques" />
          <CardBody className="pt-3">
            <ScoresTable t0={p.scoresT0} t1={p.scoresT1} />
          </CardBody>
        </Card>

        <Card>
          <CardHeader title={t.evolution} subtitle="EVA activité — séances 1 à 36" />
          <CardBody>
            <PainChart data={p.painTrend} />
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
  );
}

function AnamnesisTab({ p }: { p: NonNullable<ReturnType<typeof getPatient>> }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
        <CardHeader title="Test à l'effort vélo" subtitle="W/kg selon âge et sexe" />
        <CardBody>
          <div className="text-sm text-slate">
            Module de saisie à venir : paramètres T0/T1, normes W/kg intégrées.
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

function SessionsTab({ p }: { p: NonNullable<ReturnType<typeof getPatient>> }) {
  const { t } = useApp();
  return (
    <Card>
      <CardHeader
        title={t.sessionsProgress}
        subtitle={`${p.sessionsDone} / 36 séances réalisées`}
      />
      <CardBody>
        <div className="grid grid-cols-9 md:grid-cols-12 gap-1.5">
          {Array.from({ length: 36 }).map((_, i) => {
            const done = i < p.sessionsDone;
            return (
              <div
                key={i}
                className={cn(
                  "aspect-square rounded text-[10px] flex items-center justify-center font-semibold tabular-nums",
                  done ? "bg-navy text-white" : "bg-slate-light text-slate border border-hairline"
                )}
              >
                {i + 1}
              </div>
            );
          })}
        </div>
        <div className="mt-4 text-xs text-slate flex gap-4">
          <span className="inline-flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-navy" /> Réalisée
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-slate-light border border-hairline" /> À faire
          </span>
        </div>
      </CardBody>
    </Card>
  );
}

function ReportTab({ p }: { p: NonNullable<ReturnType<typeof getPatient>> }) {
  const { t } = useApp();
  const ready = p.scoresT0 && p.scoresT1;
  return (
    <Card>
      <CardHeader
        title={t.nav.report}
        subtitle="Génération automatique FR/DE à partir des données saisies"
      />
      <CardBody>
        <div className="flex items-start gap-4">
          <div
            className={cn(
              "w-12 h-12 rounded-lg flex items-center justify-center",
              ready ? "bg-clover-soft text-clover" : "bg-slate-light text-slate"
            )}
          >
            <FileText className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <div className="font-medium text-navy">
              Rapport École du Dos — {p.lang === "de" ? "Rückenschule Bericht" : "Bilan T0 / T1"}
            </div>
            <div className="text-sm text-slate mt-1">
              {ready
                ? "Prêt à être généré. Le rapport compilera : anamnèse, scores T0/T1, évolution, hypothèse clinique, recommandations au médecin traitant."
                : "En attente des scores T1 (évaluation de sortie)."}
            </div>
            <div className="mt-4 flex gap-2">
              <button
                disabled={!ready}
                className={cn(
                  "inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition",
                  ready
                    ? "bg-navy text-white hover:bg-navy-mid"
                    : "bg-slate-light text-slate cursor-not-allowed"
                )}
              >
                <FileText className="w-4 h-4" />
                {t.generateReport}
              </button>
              <button className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border border-hairline text-navy hover:bg-navy-pale">
                <Activity className="w-4 h-4" />
                Prévisualiser
              </button>
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}

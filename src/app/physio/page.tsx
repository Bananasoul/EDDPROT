"use client";

import { useMemo, useState } from "react";
import {
  Stethoscope,
  AlertTriangle,
  FileCheck,
  TrendingDown,
  Users,
  ChevronRight,
  FileText,
  CheckCircle2,
} from "lucide-react";
import { patients, type Patient } from "@/lib/mock-data";
import { useApp } from "@/lib/app-context";
import { generateMedicalReport } from "@/lib/pdf/medicalReport";
import { generateInamiReport } from "@/lib/pdf/inamiReport";
import { RedFlagsChecklist, RedFlagsSummary } from "@/components/RedFlags";
import { assessFlags } from "@/lib/red-flags";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { KPITile } from "@/components/KPITile";
import { StatusBadge } from "@/components/StatusBadge";
import { ScoresTable } from "@/components/ScoresTable";
import { PainChart } from "@/components/PainChart";
import { cn } from "@/lib/utils";

// Pré-cochage drapeaux rouges depuis champs prose du dossier
function inferRedFlagIds(p: Patient): string[] {
  const ids: string[] = [];
  const text = (p.complaint + " " + p.hypothesis + " " + p.redFlags.join(" ")).toLowerCase();
  if (text.includes("uriner") || text.includes("urinaire") || text.includes("queue de cheval"))
    ids.push("ce_urinary");
  if (text.includes("périnéal") || text.includes("anesthésie")) ids.push("ce_saddle");
  if (text.includes("sphinctérien") || text.includes("incontinence")) ids.push("ce_fecal");
  if (text.includes("ostéoporose") || text.includes("dxa")) ids.push("fr_osteoporosis");
  if (text.includes("perte de poids")) ids.push("ca_weight_loss");
  if (text.includes("antécédent cancer")) ids.push("ca_history");
  return ids;
}

// Le médecin physio connecté est « Dr. S. Henrot » (démo)
const CURRENT_PHYSIO = "Dr. S. Henrot";

export default function PhysioPage() {
  const { t } = useApp();

  // Prescriptions du médecin connecté
  const mine = useMemo(
    () => patients.filter((p) => p.prescriber === CURRENT_PHYSIO),
    []
  );

  const [selectedId, setSelectedId] = useState<string>(mine[0]?.id ?? "");
  const selected = mine.find((p) => p.id === selectedId) ?? mine[0];

  const kpi = useMemo(() => {
    const active = mine.filter((p) => ["in_program", "t0_done"].includes(p.status)).length;
    const t1Due = mine.filter((p) => p.status === "t1_due").length;
    const alerts = mine.filter((p) => p.redFlags.length > 0 || p.yellowFlags.length >= 3).length;
    const withBoth = mine.filter((p) => p.scoresT0 && p.scoresT1);
    const avgDrop =
      withBoth.length === 0
        ? 0
        : withBoth.reduce(
            (s, p) => s + (p.scoresT0!.pain_activity - p.scoresT1!.pain_activity),
            0
          ) / withBoth.length;
    return { active, t1Due, alerts, avgDrop: +avgDrop.toFixed(1), total: mine.length };
  }, [mine]);

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="mb-6">
        <div className="text-xs text-accent uppercase tracking-wide font-semibold">
          {t.roles.physio.name}
        </div>
        <h1 className="font-serif text-3xl text-navy mt-1">
          {CURRENT_PHYSIO} — Mes prescriptions
        </h1>
        <p className="text-sm text-slate mt-1">
          {mine.length} patient(s) en cours · École du Dos HSNE
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        <KPITile label="Prescriptions actives" value={kpi.active} icon={<Users className="w-5 h-5" />} />
        <KPITile label="T1 à valider" value={kpi.t1Due} tone="accent" icon={<FileCheck className="w-5 h-5" />} />
        <KPITile label="Patients avec alerte" value={kpi.alerts} tone="amber" icon={<AlertTriangle className="w-5 h-5" />} />
        <KPITile
          label="Gain moy. EVA (T0→T1)"
          value={`−${kpi.avgDrop}`}
          sub="/ 10"
          tone="clover"
          icon={<TrendingDown className="w-5 h-5" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
        {/* Liste patients */}
        <Card className="self-start">
          <CardHeader title="Mes patients" subtitle={`${mine.length} prescription(s)`} />
          <div className="divide-y divide-hairline/60 max-h-[650px] overflow-auto">
            {mine.map((p) => {
              const active = p.id === selected?.id;
              const hasAlert = p.redFlags.length > 0 || p.yellowFlags.length >= 3;
              return (
                <button
                  key={p.id}
                  onClick={() => setSelectedId(p.id)}
                  className={cn(
                    "w-full text-left px-5 py-3 transition",
                    active ? "bg-navy-pale" : "hover:bg-slate-light/60"
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="font-medium text-navy truncate">
                        {p.lastName.toUpperCase()} {p.firstName}
                      </div>
                      <div className="text-xs text-slate mt-0.5 truncate">{p.job}</div>
                      <div className="mt-1.5 flex items-center gap-1.5">
                        <StatusBadge status={p.status} />
                        {hasAlert && (
                          <Badge variant="amber">
                            <AlertTriangle className="w-3 h-3" /> alerte
                          </Badge>
                        )}
                      </div>
                    </div>
                    {active && <ChevronRight className="w-4 h-4 text-navy shrink-0 mt-1" />}
                  </div>
                </button>
              );
            })}
          </div>
        </Card>

        {/* Panneau détail */}
        {selected ? <PhysioDetail p={selected} /> : null}
      </div>
    </div>
  );
}

function PhysioDetail({ p }: { p: Patient }) {
  const { t } = useApp();
  const readyForReport = p.scoresT0 && p.scoresT1;
  const inferredFlags = useMemo(() => inferRedFlagIds(p), [p]);
  const assessment = useMemo(() => assessFlags(new Set(inferredFlags)), [inferredFlags]);
  const [showFullChecklist, setShowFullChecklist] = useState(false);
  return (
    <div className="space-y-6">
      {/* Bandeau drapeaux rouges — responsabilité MPR */}
      {assessment.decision.level !== "ok" && (
        <Card className={cn(
          "border-l-4",
          assessment.decision.level === "emergency" && "border-l-accent bg-accent/5",
          assessment.decision.level === "urgent" && "border-l-accent bg-accent/5",
          assessment.decision.level === "caution" && "border-l-amber bg-amber-soft/40"
        )}>
          <CardBody>
            <div className="flex items-start gap-3">
              <AlertTriangle
                className={cn(
                  "w-6 h-6 shrink-0 mt-0.5",
                  (assessment.decision.level === "emergency" || assessment.decision.level === "urgent")
                    ? "text-accent"
                    : "text-amber"
                )}
              />
              <div className="flex-1">
                <div className="font-serif text-base text-navy">
                  {assessment.decision.titleFr}
                </div>
                <p className="text-sm text-ink mt-1 leading-relaxed">
                  {assessment.decision.recommendationFr}
                </p>
                <button
                  onClick={() => setShowFullChecklist((v) => !v)}
                  className="mt-2 text-xs text-navy hover:underline"
                >
                  {showFullChecklist ? "Masquer" : "Ouvrir"} la checklist complète drapeaux rouges (KCE 287)
                </button>
              </div>
            </div>
          </CardBody>
        </Card>
      )}
      {assessment.decision.level === "ok" && (
        <Card className="border-l-4 border-l-clover bg-clover-soft/30">
          <CardBody>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-clover shrink-0" />
              <div className="flex-1">
                <div className="text-sm font-medium text-clover">
                  Aucun drapeau rouge identifié dans le dossier · Lombalgie commune compatible EDD
                </div>
              </div>
              <button
                onClick={() => setShowFullChecklist((v) => !v)}
                className="text-xs text-navy hover:underline shrink-0"
              >
                {showFullChecklist ? "Masquer" : "Vérifier"} la checklist
              </button>
            </div>
          </CardBody>
        </Card>
      )}

      {showFullChecklist && (
        <Card>
          <CardHeader
            title="Checklist drapeaux rouges (KCE 287)"
            subtitle="Responsabilité MPR — à valider avant prescription"
          />
          <CardBody>
            <RedFlagsChecklist
              initialChecked={inferredFlags}
              context="physio_prescription"
            />
          </CardBody>
        </Card>
      )}

      {/* Résumé 1 page pour la consult */}
      <Card>
        <CardHeader
          title={`${p.lastName.toUpperCase()} ${p.firstName}`}
          subtitle={`${p.gender === "F" ? "♀" : "♂"} · ${new Date(p.dob).toLocaleDateString(
            "fr-BE"
          )} · ${p.job} · ${p.lang.toUpperCase()}`}
          action={<StatusBadge status={p.status} />}
        />
        <CardBody className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-slate mb-1.5">
                Plainte principale
              </div>
              <p className="text-sm text-ink leading-relaxed">{p.complaint}</p>
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-slate mb-1.5">
                Hypothèse clinique
              </div>
              <p className="text-sm text-ink leading-relaxed">{p.hypothesis}</p>
            </div>
          </div>

          {(p.redFlags.length > 0 || p.yellowFlags.length > 0) && (
            <div className="flex flex-wrap gap-1.5 pt-2 border-t border-hairline/60">
              {p.redFlags.map((f, i) => (
                <Badge key={`r${i}`} variant="accent">
                  <AlertTriangle className="w-3 h-3" /> {f}
                </Badge>
              ))}
              {p.yellowFlags.map((f, i) => (
                <Badge key={`y${i}`} variant="amber">
                  {f}
                </Badge>
              ))}
            </div>
          )}

          <div className="flex flex-wrap gap-2 pt-2 border-t border-hairline/60">
            <button
              onClick={() => readyForReport && generateInamiReport(p, p.lang)}
              disabled={!readyForReport}
              className={cn(
                "inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition",
                readyForReport
                  ? "bg-accent text-white hover:bg-accent/90"
                  : "bg-slate-light text-slate cursor-not-allowed"
              )}
            >
              <CheckCircle2 className="w-4 h-4" />
              Valider & signer (PDF INAMI)
            </button>
            <button
              onClick={() => generateMedicalReport(p, p.lang)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border border-hairline text-navy hover:bg-navy-pale"
            >
              <FileText className="w-4 h-4" />
              Rapport médecin traitant (PDF)
            </button>
            <button className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border border-hairline text-navy hover:bg-navy-pale">
              <Stethoscope className="w-4 h-4" />
              Notes de consultation
            </button>
          </div>
        </CardBody>
      </Card>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card>
          <CardHeader title={t.scores.title} subtitle="Évolution Entrée → Sortie" />
          <CardBody>
            <ScoresTable t0={p.scoresT0} t1={p.scoresT1} />
          </CardBody>
        </Card>
        <Card>
          <CardHeader title={t.evolution} subtitle="EVA activité sur 36 séances" />
          <CardBody>
            <PainChart data={p.painTrend} />
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader
          title="Objectifs du patient"
          subtitle="Validés lors de l'évaluation T0"
        />
        <CardBody>
          {p.goals.length === 0 ? (
            <div className="text-sm text-slate">Pas encore définis (T0 à réaliser).</div>
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
    </div>
  );
}

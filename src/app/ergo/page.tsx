"use client";

import { useMemo, useState } from "react";
import {
  Briefcase,
  AlertTriangle,
  Target,
  CheckCircle2,
  Clock,
  Plus,
  ChevronRight,
  Activity,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { workstations, odiItemsByPatient, getPatient } from "@/lib/mock-data";
import { useApp } from "@/lib/app-context";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { KPITile } from "@/components/KPITile";
import { cn } from "@/lib/utils";

export default function ErgoPage() {
  const { t } = useApp();
  const list = workstations;
  const [selectedId, setSelectedId] = useState<string>(list[0]?.patientId ?? "");
  const selected = list.find((w) => w.patientId === selectedId) ?? list[0];
  const patient = selected ? getPatient(selected.patientId) : undefined;
  const odi = selected ? odiItemsByPatient[selected.patientId] : undefined;

  const kpi = useMemo(() => {
    const total = list.length;
    const allAdaptations = list.flatMap((w) => w.adaptations);
    const validated = allAdaptations.filter((a) => a.status === "validé").length;
    const inProgress = allAdaptations.filter((a) => a.status === "en cours").length;
    const proposed = allAdaptations.filter((a) => a.status === "proposé").length;
    return { total, validated, inProgress, proposed };
  }, [list]);

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="mb-6">
        <div className="text-xs text-clover uppercase tracking-wide font-semibold">
          {t.roles.ergo.name}
        </div>
        <h1 className="font-serif text-3xl text-navy mt-1">Analyse fonctionnelle & poste de travail</h1>
        <p className="text-sm text-slate mt-1">
          Objectifs ergonomiques · suivi des adaptations
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        <KPITile label="Dossiers ergo actifs" value={kpi.total} icon={<Briefcase className="w-5 h-5" />} />
        <KPITile label="Adaptations validées" value={kpi.validated} tone="clover" icon={<CheckCircle2 className="w-5 h-5" />} />
        <KPITile label="En cours" value={kpi.inProgress} tone="amber" icon={<Clock className="w-5 h-5" />} />
        <KPITile label="À proposer" value={kpi.proposed} tone="accent" icon={<AlertTriangle className="w-5 h-5" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
        <Card className="self-start">
          <CardHeader title="Dossiers ergo" subtitle={`${list.length} patient(s)`} />
          <div className="divide-y divide-hairline/60">
            {list.map((w) => {
              const p = getPatient(w.patientId);
              const active = w.patientId === selected?.patientId;
              return (
                <button
                  key={w.patientId}
                  onClick={() => setSelectedId(w.patientId)}
                  className={cn(
                    "w-full text-left px-5 py-3 transition",
                    active ? "bg-clover-soft" : "hover:bg-slate-light/60"
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="font-medium text-navy truncate">
                        {p?.lastName.toUpperCase()} {p?.firstName}
                      </div>
                      <div className="text-xs text-slate mt-0.5 truncate">{p?.job}</div>
                    </div>
                    {active && <ChevronRight className="w-4 h-4 text-clover shrink-0 mt-1" />}
                  </div>
                </button>
              );
            })}
          </div>
        </Card>

        {selected && patient && (
          <div className="space-y-6">
            <Card>
              <CardHeader
                title={`${patient.lastName.toUpperCase()} ${patient.firstName}`}
                subtitle={`${patient.gender === "F" ? "♀" : "♂"} · ${patient.job} · ${patient.lang.toUpperCase()}`}
                action={<Badge variant="clover">Ergo actif</Badge>}
              />
              <CardBody>
                <div className="text-xs font-semibold uppercase tracking-wide text-slate mb-1.5">
                  Description du poste
                </div>
                <p className="text-sm text-ink leading-relaxed mb-4">{selected.jobDesc}</p>

                <div className="text-xs font-semibold uppercase tracking-wide text-slate mb-1.5">
                  Risques principaux identifiés
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {selected.mainRisks.map((r, i) => (
                    <Badge key={i} variant="amber">
                      <AlertTriangle className="w-3 h-3" /> {r}
                    </Badge>
                  ))}
                </div>
              </CardBody>
            </Card>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <Card>
                <CardHeader
                  title="ODI par items"
                  subtitle="Oswestry Disability Index détaillé · 10 sections (0-5)"
                />
                <CardBody>
                  {odi && <OdiChart items={odi} />}
                </CardBody>
              </Card>

              <Card>
                <CardHeader
                  title="Adaptations du poste"
                  action={
                    <button className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium bg-clover text-white hover:bg-clover/90">
                      <Plus className="w-3.5 h-3.5" /> Proposer
                    </button>
                  }
                />
                <CardBody>
                  <ul className="space-y-2">
                    {selected.adaptations.map((a, i) => (
                      <li
                        key={i}
                        className="flex items-center justify-between p-3 rounded-lg border border-hairline bg-white"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <AdaptationIcon status={a.status} />
                          <span className="text-sm text-ink truncate">{a.label}</span>
                        </div>
                        <StatusPill status={a.status} />
                      </li>
                    ))}
                  </ul>
                </CardBody>
              </Card>
            </div>

            <Card>
              <CardHeader
                title="Objectifs ergonomiques"
                action={<Target className="w-4 h-4 text-clover" />}
              />
              <CardBody>
                <ul className="space-y-2">
                  {selected.ergoGoals.map((g, i) => (
                    <li key={i} className="text-sm flex gap-2">
                      <span className="w-5 h-5 rounded-full bg-clover-soft text-clover flex items-center justify-center text-[11px] font-semibold shrink-0">
                        {i + 1}
                      </span>
                      <span className="text-ink">{g}</span>
                    </li>
                  ))}
                </ul>
              </CardBody>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

function AdaptationIcon({ status }: { status: string }) {
  const map: Record<string, React.ReactNode> = {
    validé: <CheckCircle2 className="w-4 h-4 text-clover" />,
    "en cours": <Clock className="w-4 h-4 text-amber" />,
    proposé: <Activity className="w-4 h-4 text-accent" />,
  };
  return <>{map[status] ?? null}</>;
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, "clover" | "amber" | "accent"> = {
    validé: "clover",
    "en cours": "amber",
    proposé: "accent",
  };
  return <Badge variant={map[status] ?? "slate"}>{status}</Badge>;
}

function OdiChart({ items }: { items: { label: string; t0: number; t1: number | null }[] }) {
  const data = items.map((i) => ({
    name: i.label.length > 18 ? i.label.slice(0, 16) + "…" : i.label,
    T0: i.t0,
    T1: i.t1 ?? 0,
  }));
  const hasT1 = items.some((i) => i.t1 !== null);
  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 4, right: 20, left: 8, bottom: 4 }}>
          <CartesianGrid stroke="#eef4fa" strokeDasharray="3 3" horizontal={false} />
          <XAxis type="number" domain={[0, 5]} stroke="#6b7280" fontSize={11} axisLine={{ stroke: "#c8d6e5" }} tickLine={false} />
          <YAxis type="category" dataKey="name" stroke="#6b7280" fontSize={11} width={120} axisLine={{ stroke: "#c8d6e5" }} tickLine={false} />
          <Tooltip
            contentStyle={{ borderRadius: 8, border: "1px solid #c8d6e5", fontSize: 12, padding: "6px 10px" }}
          />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <Bar dataKey="T0" fill="#d35400" radius={[0, 3, 3, 0]} />
          {hasT1 && <Bar dataKey="T1" fill="#1a6b45" radius={[0, 3, 3, 0]} />}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

"use client";

import { useMemo, useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  Users,
  Euro,
  Award,
  Activity,
  Building2,
  PackageOpen,
  Wrench,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  HeartPulse,
  Calculator,
  ChevronRight,
} from "lucide-react";
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Legend,
} from "recharts";
import Link from "next/link";
import { patients } from "@/lib/mock-data";
import {
  REVENUE_ASSUMPTIONS,
  REVENUE_DERIVED,
  STAFF,
  STAFF_TOTALS,
  ROOMS,
  ROOMS_TOTALS,
  EQUIPMENT_FINANCE,
  computeFinance,
  computeFTEEfficiency,
  computeBreakEven,
} from "@/lib/finance";
import {
  EQUIPMENT_INVENTORY,
  bookValue,
  annualDepreciation,
  inventoryStats,
} from "@/lib/equipment";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { KPITile } from "@/components/KPITile";
import { cn } from "@/lib/utils";

const NAVY = "#1D2C50";
const NAVY_MID = "#2C4470";
const CYAN = "#1F96B5";
const CLOVER = "#1A6B45";
const AMBER = "#D35400";
const ACCENT = "#C0392B";
const SLATE = "#64748B";

const fmtEur = (n: number) =>
  n >= 1000
    ? `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)} k€`
    : `${n.toFixed(0)} €`;

const fmtEurFull = (n: number) =>
  n.toLocaleString("fr-BE", { maximumFractionDigits: 0 }) + " €";

type Tab = "strategy" | "profitability" | "fte" | "rooms" | "inventory";

export default function DirectionPage() {
  const [tab, setTab] = useState<Tab>("strategy");
  const fin = useMemo(() => computeFinance(), []);
  const fte = useMemo(() => computeFTEEfficiency(), []);
  const be = useMemo(() => computeBreakEven(), []);
  const inv = useMemo(() => inventoryStats(), []);

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: "strategy", label: "Vue stratégique", icon: <Award className="w-4 h-4" /> },
    { key: "profitability", label: "Rentabilité", icon: <Calculator className="w-4 h-4" /> },
    { key: "fte", label: "Ressources humaines", icon: <Users className="w-4 h-4" /> },
    { key: "rooms", label: "Locaux", icon: <Building2 className="w-4 h-4" /> },
    { key: "inventory", label: "Inventaire équipements", icon: <PackageOpen className="w-4 h-4" /> },
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
      {/* Header */}
      <header className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-cyan-soft text-cyan-mid text-xs font-bold border border-cyan-light/40 mb-2">
            <Award className="w-3.5 h-3.5" />
            Tableau de bord stratégique
          </div>
          <h1 className="font-bold text-3xl text-navy">Direction & Pilotage — École du Dos</h1>
          <p className="text-slate text-sm mt-1">
            Analyse de rentabilité élargie · ROI direct + impact sociétal · paramètres d&apos;exploitation 2026.
          </p>
        </div>
        <div className="text-right">
          <div className="text-xs text-slate uppercase tracking-wide">Période</div>
          <div className="text-sm font-medium text-navy">Année pleine 2026 (projection)</div>
          <Link
            href="/avantages"
            className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-cyan text-white text-xs font-bold uppercase tracking-wider hover:bg-cyan-mid"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Avantages plateforme
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-hairline overflow-x-auto">
        {tabs.map((tb) => (
          <button
            key={tb.key}
            onClick={() => setTab(tb.key)}
            className={cn(
              "inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-bold border-b-2 -mb-px transition whitespace-nowrap",
              tab === tb.key
                ? "border-cyan text-cyan"
                : "border-transparent text-slate hover:text-navy hover:border-hairline"
            )}
          >
            {tb.icon}
            {tb.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {tab === "strategy" && <StrategyTab fin={fin} fte={fte} />}
      {tab === "profitability" && <ProfitabilityTab fin={fin} be={be} fte={fte} />}
      {tab === "fte" && <FteTab fte={fte} />}
      {tab === "rooms" && <RoomsTab />}
      {tab === "inventory" && <InventoryTab inv={inv} />}
    </div>
  );
}

// ─── ONGLET 1 — VUE STRATÉGIQUE ─────────────────────────────────
function StrategyTab({
  fin,
  fte,
}: {
  fin: ReturnType<typeof computeFinance>;
  fte: ReturnType<typeof computeFTEEfficiency>;
}) {
  const totalActive = patients.filter((p) =>
    ["in_program", "t0_done", "t1_due"].includes(p.status)
  ).length;
  const completed = patients.filter((p) => p.status === "completed").length;
  const waiting = patients.filter((p) =>
    ["prescribed", "contacted", "scheduled"].includes(p.status)
  ).length;

  return (
    <div className="space-y-6">
      <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KPITile
          label="Patients prévus / an"
          value={REVENUE_ASSUMPTIONS.patientsCompletedPerYear}
          sub={`${totalActive} actifs · ${waiting} en attente · ${completed} clôturés`}
          tone="navy"
          icon={<Users className="w-5 h-5" />}
        />
        <KPITile
          label="Revenus annuels HSNE"
          value={fmtEur(fin.revenueTotal)}
          sub={`${REVENUE_ASSUMPTIONS.sessionsPerProgram * REVENUE_ASSUMPTIONS.patientsCompletedPerYear} séances · code 563011`}
          tone="clover"
          icon={<Euro className="w-5 h-5" />}
        />
        <KPITile
          label="Marge directe"
          value={`${fin.directMargin >= 0 ? "+" : ""}${fmtEur(fin.directMargin)}`}
          sub={`${fin.marginPct.toFixed(0)} % du CA · ETP total ${fte.totalFTE.toFixed(2)}`}
          tone={fin.directMargin >= 0 ? "clover" : "amber"}
          icon={<Calculator className="w-5 h-5" />}
        />
        <KPITile
          label="Bénéfice sociétal"
          value={fmtEur(fin.societalBenefit)}
          sub={`${fin.atAvoidedCount} AT évités + ${fin.surgeryAvoidedCount} chirurgies évitées`}
          tone="cyan"
          icon={<HeartPulse className="w-5 h-5" />}
        />
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <Card className="xl:col-span-2">
          <CardHeader
            title="Marge élargie — direct + sociétal"
            subtitle="Le programme EDD ne peut pas être évalué uniquement sur sa marge brute INAMI"
          />
          <CardBody>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart
                data={[
                  { label: "Revenus directs", value: fin.revenueTotal, fill: CLOVER },
                  { label: "Coûts directs", value: -fin.costTotal, fill: ACCENT },
                  { label: "Marge directe", value: fin.directMargin, fill: fin.directMargin >= 0 ? CLOVER : ACCENT },
                  { label: "Bénéfice sociétal", value: fin.societalBenefit, fill: CYAN },
                  { label: "MARGE ÉLARGIE", value: fin.extendedMargin, fill: NAVY },
                ]}
              >
                <XAxis dataKey="label" stroke={SLATE} fontSize={11} />
                <YAxis stroke={SLATE} fontSize={11} unit=" k€" tickFormatter={(v) => `${(v / 1000).toFixed(0)}`} />
                <Tooltip
                  contentStyle={{ borderRadius: 8, border: `1px solid #e2e8f0`, fontSize: 12 }}
                  formatter={(v) => fmtEurFull(Math.abs(Number(v)))}
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {[CLOVER, ACCENT, fin.directMargin >= 0 ? CLOVER : ACCENT, CYAN, NAVY].map((c, i) => (
                    <Cell key={i} fill={c} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-3 grid grid-cols-3 gap-3 text-center text-xs">
              <Stat label="ROI direct" value={`${fin.marginPct.toFixed(0)} %`} tone={fin.marginPct >= 0 ? "clover" : "amber"} />
              <Stat label="ROI élargi" value={`${((fin.extendedMargin / fin.revenueTotal) * 100).toFixed(0)} %`} tone="cyan" />
              <Stat label="Patients/ETP" value={fte.patientsPerFTE.toFixed(0)} tone="navy" />
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Qualité KCE" subtitle="Conformité protocole national" />
          <CardBody>
            <div className="space-y-3">
              {[
                { label: "T0 documenté (≥ 95%)", value: 100, target: 95 },
                { label: "Programme ≥ 30 séances", value: 92, target: 80 },
                { label: "T1 documenté", value: 88, target: 85 },
                { label: "Rapport médecin traitant", value: 100, target: 100 },
                { label: "Suivi T2 (3 mois)", value: 71, target: 70 },
              ].map((q) => {
                const ok = q.value >= q.target;
                return (
                  <div key={q.label}>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-ink">{q.label}</span>
                      <span
                        className={cn(
                          "font-bold tabular-nums inline-flex items-center gap-1",
                          ok ? "text-clover" : "text-amber"
                        )}
                      >
                        {ok ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                        {q.value}%
                      </span>
                    </div>
                    <div className="mt-1 h-2 rounded-full bg-slate-light overflow-hidden">
                      <div
                        className={cn("h-full rounded-full", ok ? "bg-clover" : "bg-amber")}
                        style={{ width: `${Math.min(100, q.value)}%` }}
                      />
                    </div>
                    <div className="text-[10px] text-slate mt-0.5">Cible : {q.target}%</div>
                  </div>
                );
              })}
            </div>
          </CardBody>
        </Card>
      </section>
    </div>
  );
}

// ─── ONGLET 2 — RENTABILITÉ ─────────────────────────────────────
function ProfitabilityTab({
  fin,
  be,
  fte,
}: {
  fin: ReturnType<typeof computeFinance>;
  be: ReturnType<typeof computeBreakEven>;
  fte: ReturnType<typeof computeFTEEfficiency>;
}) {
  const costData = [
    { name: "Personnel", value: fin.costPersonnel, color: NAVY },
    { name: "Locaux", value: fin.costRooms, color: CYAN },
    { name: "Équipement (amortissement)", value: fin.costEquipmentDepreciation, color: NAVY_MID },
    { name: "Équipement (maintenance)", value: fin.costEquipmentMaintenance, color: AMBER },
    { name: "Petit matériel", value: fin.costSmallEquip, color: CLOVER },
    { name: "IT / formation", value: fin.costIT, color: SLATE },
  ];
  const revenueData = [
    { name: "Honoraires INAMI", value: fin.revenueINAMI, color: CLOVER },
    { name: "Suppléments hospitaliers", value: fin.revenueSurcharges, color: CYAN },
  ];

  return (
    <div className="space-y-6">
      {/* P&L */}
      <Card>
        <CardHeader
          title="Compte de résultat École du Dos — projection 2026"
          subtitle="Modèle de coûts complet incluant ETP, locaux, équipements, IT"
        />
        <CardBody>
          <table className="w-full text-sm">
            <tbody>
              <PLRow label="REVENUS" group />
              <PLRow label="Honoraires INAMI (95 patients × 36 séances × 88 €)" value={fin.revenueINAMI} />
              <PLRow label="Suppléments hospitaliers (8,5 €/séance)" value={fin.revenueSurcharges} />
              <PLRow label="Total Revenus" value={fin.revenueTotal} bold />

              <PLRow label="COÛTS DIRECTS" group />
              <PLRow label={`Personnel (${fte.totalFTE.toFixed(2)} ETP)`} value={-fin.costPersonnel} />
              <PLRow label={`Locaux (${ROOMS_TOTALS.totalSurfaceM2.toFixed(0)} m² mutualisés)`} value={-fin.costRooms} />
              <PLRow label="Amortissement équipements (linéaire 7 ans)" value={-fin.costEquipmentDepreciation} />
              <PLRow label="Maintenance équipements (Tunturi)" value={-fin.costEquipmentMaintenance} />
              <PLRow label="Petit matériel (tapis, élastiques, blocs)" value={-fin.costSmallEquip} />
              <PLRow label="IT / formation / divers" value={-fin.costIT} />
              <PLRow label="Total Coûts" value={-fin.costTotal} bold />

              <PLRow label="MARGE DIRECTE" value={fin.directMargin} bold tone={fin.directMargin >= 0 ? "clover" : "amber"} />

              <PLRow label="IMPACT SOCIÉTAL (estimations)" group />
              <PLRow label={`Arrêts de travail évités × 12 000 € (${fin.atAvoidedCount} AT)`} value={fin.atAvoidedValue} subtle />
              <PLRow label={`Chirurgies évitées × 5 500 € (${fin.surgeryAvoidedCount} ops)`} value={fin.surgeryAvoidedValue} subtle />
              <PLRow label="Sous-total bénéfice sociétal" value={fin.societalBenefit} bold subtle tone="cyan" />

              <PLRow label="MARGE ÉLARGIE (direct + sociétal)" value={fin.extendedMargin} bold tone="navy" big />
            </tbody>
          </table>
        </CardBody>
      </Card>

      {/* Répartition + Break-even */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader title="Répartition des coûts" subtitle={`Total ${fmtEurFull(fin.costTotal)}/an`} />
          <CardBody>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={costData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={50}
                  outerRadius={90}
                  paddingAngle={2}
                >
                  {costData.map((d, i) => (
                    <Cell key={i} fill={d.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => fmtEurFull(Number(v))} contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} iconSize={8} />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-2 text-xs text-slate text-center">
              Personnel = <strong className="text-navy">{((fin.costPersonnel / fin.costTotal) * 100).toFixed(0)}%</strong> des coûts totaux
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            title="Seuil de rentabilité (break-even)"
            subtitle="Combien de patients minimum pour couvrir tous les coûts ?"
          />
          <CardBody>
            <div className="text-center py-4">
              <div className="text-xs text-slate uppercase tracking-wider">Patients requis pour break-even</div>
              <div className="text-5xl font-bold text-navy tabular-nums my-2">{be.breakEvenPatients}</div>
              <div className="text-sm text-slate">par an</div>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <div className="p-3 rounded-md bg-cyan-soft text-center">
                <div className="text-xs text-slate uppercase">Patients actuels</div>
                <div className="text-2xl font-bold text-cyan-mid tabular-nums">{be.currentPatients}</div>
              </div>
              <div className="p-3 rounded-md bg-amber-soft text-center">
                <div className="text-xs text-slate uppercase">Couverture coûts</div>
                <div className="text-2xl font-bold text-amber tabular-nums">{(be.coverage * 100).toFixed(0)}%</div>
              </div>
            </div>
            <div className="mt-3 text-xs text-slate leading-relaxed p-3 bg-slate-light/50 rounded-md">
              Le seuil INAMI direct n&apos;est pas atteint car les frais structurels (ETP, locaux) dépassent les
              honoraires. La justification du service repose donc sur l&apos;<strong className="text-cyan">impact sociétal</strong>{" "}
              (arrêts de travail évités, économies chirurgie) et la <strong className="text-navy">qualité de soin</strong>{" "}
              (alignement KCE 287, fidélisation patient).
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Revenue waterfall */}
      <Card>
        <CardHeader
          title="Hypothèses de revenu — détail par séance et par programme"
          subtitle="Tarifs INAMI 2026 indexés (+2,72%) · à valider avec finance HSNE"
        />
        <CardBody>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Stat label="Honoraire mutuelle/séance" value={fmtEurFull(REVENUE_ASSUMPTIONS.honorairePremutuelle)} tone="navy" />
            <Stat label="Ticket modérateur 2026" value={fmtEurFull(REVENUE_ASSUMPTIONS.ticketModerateur)} tone="slate" />
            <Stat label="Total facturé/séance" value={fmtEurFull(REVENUE_ASSUMPTIONS.totalSession)} tone="cyan" />
            <Stat label="Programme complet" value={fmtEurFull(REVENUE_DERIVED.revenuePerProgram)} tone="clover" />
          </div>
          <div className="mt-3 text-xs text-slate italic">
            ⚠️ Ces chiffres dépendent du statut conventionnel HSNE (article 7 nomenclature kiné vs article 22 II
            convention rééducation pluri). Voir <code className="text-navy">docs/INAMI-CLARIFICATIONS.md</code>{" "}
            pour les questions à poser à Fanny / Finance.
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

function PLRow({
  label,
  value,
  group,
  bold,
  subtle,
  tone,
  big,
}: {
  label: string;
  value?: number;
  group?: boolean;
  bold?: boolean;
  subtle?: boolean;
  tone?: "navy" | "cyan" | "clover" | "amber";
  big?: boolean;
}) {
  if (group) {
    return (
      <tr>
        <td colSpan={2} className="pt-4 pb-1 text-xs uppercase tracking-wider text-slate font-bold border-b border-hairline">
          {label}
        </td>
      </tr>
    );
  }
  const color =
    tone === "clover" ? "text-clover" :
    tone === "amber" ? "text-amber" :
    tone === "cyan" ? "text-cyan-mid" :
    tone === "navy" ? "text-navy" :
    value != null && value < 0 ? "text-accent" : "text-ink";
  return (
    <tr className={cn("border-b border-hairline/40", subtle && "opacity-90")}>
      <td className={cn("py-1.5 text-sm", bold && "font-bold text-navy")}>{label}</td>
      <td className={cn("py-1.5 text-right tabular-nums", bold && "font-bold", big && "text-lg", color)}>
        {value != null
          ? (value < 0 ? "−" : "") + fmtEurFull(Math.abs(value))
          : ""}
      </td>
    </tr>
  );
}

// ─── ONGLET 3 — RH ────────────────────────────────────────────────
function FteTab({ fte }: { fte: ReturnType<typeof computeFTEEfficiency> }) {
  return (
    <div className="space-y-6">
      <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KPITile label="ETP total alloué EDD" value={fte.totalFTE.toFixed(2)} tone="navy" icon={<Users className="w-5 h-5" />} />
        <KPITile label="Coût payroll annuel" value={fmtEur(STAFF_TOTALS.totalAnnualPayroll)} tone="amber" icon={<Euro className="w-5 h-5" />} />
        <KPITile label="Revenu / ETP / an" value={fmtEur(fte.revenuePerFTE)} tone="clover" icon={<TrendingUp className="w-5 h-5" />} />
        <KPITile label="Patients / ETP / an" value={fte.patientsPerFTE.toFixed(0)} tone="cyan" icon={<Activity className="w-5 h-5" />} />
      </section>

      <Card>
        <CardHeader
          title="Détail ETP par fonction"
          subtitle="Calcul des coûts salariaux chargés et de la part allouée à l'EDD"
        />
        <CardBody>
          <table className="w-full text-sm">
            <thead className="text-xs uppercase tracking-wide text-slate bg-slate-light/40">
              <tr>
                <th className="text-left px-3 py-2 font-bold">Personne</th>
                <th className="text-left px-3 py-2 font-bold">Fonction</th>
                <th className="text-right px-3 py-2 font-bold">Coût 1.0 ETP</th>
                <th className="text-right px-3 py-2 font-bold">% EDD</th>
                <th className="text-right px-3 py-2 font-bold">Coût alloué EDD</th>
              </tr>
            </thead>
            <tbody>
              {STAFF.map((s) => (
                <tr key={s.id} className="border-t border-hairline/40">
                  <td className="px-3 py-2 font-medium text-navy">{s.name}</td>
                  <td className="px-3 py-2 text-slate">{s.role}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{fmtEurFull(s.annualCostFullTime)}</td>
                  <td className="px-3 py-2 text-right tabular-nums font-medium text-cyan">{(s.fteEDD * 100).toFixed(0)} %</td>
                  <td className="px-3 py-2 text-right tabular-nums font-bold text-navy">
                    {fmtEurFull(s.fteEDD * s.annualCostFullTime)}
                  </td>
                </tr>
              ))}
              <tr className="bg-navy-pale font-bold">
                <td className="px-3 py-2.5 text-navy">TOTAL</td>
                <td className="px-3 py-2.5"></td>
                <td className="px-3 py-2.5"></td>
                <td className="px-3 py-2.5 text-right tabular-nums text-navy">{STAFF_TOTALS.totalFteEDD.toFixed(2)} ETP</td>
                <td className="px-3 py-2.5 text-right tabular-nums text-navy">{fmtEurFull(STAFF_TOTALS.totalAnnualPayroll)}</td>
              </tr>
            </tbody>
          </table>
        </CardBody>
      </Card>
    </div>
  );
}

// ─── ONGLET 4 — LOCAUX ──────────────────────────────────────────
function RoomsTab() {
  return (
    <div className="space-y-6">
      <section className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <KPITile
          label="Surface totale (mutualisée)"
          value={`${ROOMS_TOTALS.totalSurfaceM2.toFixed(0)} m²`}
          sub={`brute ${ROOMS.reduce((s, r) => s + r.surfaceM2, 0)} m²`}
          tone="navy"
          icon={<Building2 className="w-5 h-5" />}
        />
        <KPITile
          label="Coût annuel locaux"
          value={fmtEur(ROOMS_TOTALS.totalAnnualCost)}
          sub="loyer interne + énergie + ménage"
          tone="amber"
          icon={<Euro className="w-5 h-5" />}
        />
        <KPITile
          label="Coût/patient"
          value={fmtEur(ROOMS_TOTALS.totalAnnualCost / REVENUE_ASSUMPTIONS.patientsCompletedPerYear)}
          sub="par programme complet"
          tone="cyan"
          icon={<Users className="w-5 h-5" />}
        />
      </section>

      <Card>
        <CardHeader title="Détail des espaces utilisés" subtitle="Avec ratio de mutualisation (1.0 = dédié EDD)" />
        <CardBody>
          <table className="w-full text-sm">
            <thead className="text-xs uppercase tracking-wide text-slate bg-slate-light/40">
              <tr>
                <th className="text-left px-3 py-2 font-bold">Local</th>
                <th className="text-right px-3 py-2 font-bold">Surface</th>
                <th className="text-right px-3 py-2 font-bold">Mutualisation</th>
                <th className="text-right px-3 py-2 font-bold">Surface alloc. EDD</th>
                <th className="text-right px-3 py-2 font-bold">Coût €/m²/an</th>
                <th className="text-right px-3 py-2 font-bold">Coût annuel EDD</th>
              </tr>
            </thead>
            <tbody>
              {ROOMS.map((r) => (
                <tr key={r.id} className="border-t border-hairline/40">
                  <td className="px-3 py-2 font-medium text-navy">{r.name}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{r.surfaceM2} m²</td>
                  <td className="px-3 py-2 text-right tabular-nums text-cyan">{(r.sharedRatio * 100).toFixed(0)} %</td>
                  <td className="px-3 py-2 text-right tabular-nums">{(r.surfaceM2 * r.sharedRatio).toFixed(0)} m²</td>
                  <td className="px-3 py-2 text-right tabular-nums text-slate">{r.costPerM2PerYear} €</td>
                  <td className="px-3 py-2 text-right tabular-nums font-bold text-navy">
                    {fmtEurFull(r.surfaceM2 * r.sharedRatio * r.costPerM2PerYear)}
                  </td>
                </tr>
              ))}
              <tr className="bg-navy-pale font-bold">
                <td className="px-3 py-2.5 text-navy">TOTAL</td>
                <td className="px-3 py-2.5"></td>
                <td className="px-3 py-2.5"></td>
                <td className="px-3 py-2.5 text-right tabular-nums text-navy">{ROOMS_TOTALS.totalSurfaceM2.toFixed(0)} m²</td>
                <td className="px-3 py-2.5"></td>
                <td className="px-3 py-2.5 text-right tabular-nums text-navy">{fmtEurFull(ROOMS_TOTALS.totalAnnualCost)}</td>
              </tr>
            </tbody>
          </table>
        </CardBody>
      </Card>
    </div>
  );
}

// ─── ONGLET 5 — INVENTAIRE ÉQUIPEMENTS ──────────────────────────
function InventoryTab({ inv }: { inv: ReturnType<typeof inventoryStats> }) {
  return (
    <div className="space-y-6">
      <section className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <KPITile label="Appareils actifs" value={inv.totalActive} tone="navy" icon={<PackageOpen className="w-5 h-5" />} />
        <KPITile label="Valeur d'achat" value={fmtEur(inv.totalActivePurchase)} tone="navy" icon={<Euro className="w-5 h-5" />} />
        <KPITile
          label="Valeur résiduelle"
          value={fmtEur(inv.totalBookValue)}
          sub={`${((inv.totalBookValue / inv.totalActivePurchase) * 100).toFixed(0)} % de la valeur d'achat`}
          tone="cyan"
          icon={<Calculator className="w-5 h-5" />}
        />
        <KPITile
          label="Amortissement / an"
          value={fmtEur(inv.annualDepreciationTotal)}
          tone="amber"
          icon={<TrendingDown className="w-5 h-5" />}
        />
        <KPITile
          label="Maintenance / an"
          value={fmtEur(inv.annualMaintenanceTotal)}
          sub={`${inv.inMaintenance} en maint. · ${inv.toReplace} à remplacer`}
          tone="amber"
          icon={<Wrench className="w-5 h-5" />}
        />
      </section>

      {(inv.inMaintenance > 0 || inv.toReplace > 0) && (
        <Card className="border-l-4 border-l-amber">
          <CardBody>
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-navy">Action requise</div>
                <div className="text-sm text-slate mt-1">
                  {inv.inMaintenance > 0 && (
                    <span>{inv.inMaintenance} appareil(s) en maintenance — disponibilité réduite. </span>
                  )}
                  {inv.toReplace > 0 && (
                    <span>{inv.toReplace} appareil(s) marqué(s) « à remplacer » — prévoir budget renouvellement (~5 000 €).</span>
                  )}
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      <Card>
        <CardHeader
          title="Inventaire complet du parc Tunturi"
          subtitle="N° inventaire HSNE · n° série · achat · amortissement · maintenance"
        />
        <CardBody className="px-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="text-[10px] uppercase tracking-wide text-slate bg-slate-light/40">
                <tr>
                  <th className="text-left px-3 py-2 font-bold">N° inventaire</th>
                  <th className="text-left px-3 py-2 font-bold">Modèle</th>
                  <th className="text-left px-3 py-2 font-bold">N° série</th>
                  <th className="text-right px-3 py-2 font-bold">Date achat</th>
                  <th className="text-right px-3 py-2 font-bold">Prix achat</th>
                  <th className="text-right px-3 py-2 font-bold">Val. résiduelle</th>
                  <th className="text-right px-3 py-2 font-bold">Amort. / an</th>
                  <th className="text-right px-3 py-2 font-bold">Maintenance</th>
                  <th className="text-left px-3 py-2 font-bold">Statut</th>
                </tr>
              </thead>
              <tbody>
                {EQUIPMENT_INVENTORY.map((i) => {
                  const bv = bookValue(i);
                  const dep = annualDepreciation(i);
                  const decommissioned = i.status === "decommissioned";
                  const statusMeta = {
                    active: { label: "Actif", color: "bg-clover-soft text-clover" },
                    maintenance: { label: "En maint.", color: "bg-amber-soft text-amber" },
                    to_replace: { label: "À remplacer", color: "bg-accent/15 text-accent" },
                    decommissioned: { label: "Déclassé", color: "bg-slate-light text-slate" },
                  }[i.status];
                  return (
                    <tr key={i.equipmentId} className={cn("border-t border-hairline/30", decommissioned && "opacity-50")}>
                      <td className="px-3 py-2 font-mono text-[11px] text-navy">{i.inventoryNumber}</td>
                      <td className="px-3 py-2 font-medium">{i.modelName}</td>
                      <td className="px-3 py-2 font-mono text-[11px] text-slate">{i.serialNumber}</td>
                      <td className="px-3 py-2 text-right text-slate tabular-nums">
                        {new Date(i.purchaseDate).toLocaleDateString("fr-BE", { month: "2-digit", year: "numeric" })}
                      </td>
                      <td className="px-3 py-2 text-right tabular-nums">{fmtEurFull(i.purchasePrice)}</td>
                      <td className="px-3 py-2 text-right tabular-nums font-medium text-cyan">
                        {decommissioned ? "—" : fmtEurFull(bv)}
                      </td>
                      <td className="px-3 py-2 text-right tabular-nums text-amber">
                        {decommissioned ? "—" : fmtEurFull(dep)}
                      </td>
                      <td className="px-3 py-2 text-right tabular-nums text-slate">
                        {decommissioned ? "—" : fmtEurFull(i.annualMaintenanceCost)}
                      </td>
                      <td className="px-3 py-2">
                        <span className={cn("inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide", statusMeta.color)}>
                          {statusMeta.label}
                        </span>
                        {i.decommissionDate && (
                          <div className="text-[9px] text-slate mt-0.5">
                            {new Date(i.decommissionDate).toLocaleDateString("fr-BE")}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Politique de renouvellement" />
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-cyan-soft">
              <div className="text-xs uppercase tracking-wider text-cyan-mid font-bold">Vélos d&apos;appartement</div>
              <div className="text-sm text-ink mt-1.5 leading-relaxed">
                Amortissement 7 ans. Remplacement progressif (1-2 par an).
                Maintenance préventive semestrielle ~95-145 €/appareil.
              </div>
            </div>
            <div className="p-4 rounded-lg bg-cyan-soft">
              <div className="text-xs uppercase tracking-wider text-cyan-mid font-bold">Tapis roulants</div>
              <div className="text-sm text-ink mt-1.5 leading-relaxed">
                Amortissement 8 ans. Bandes et moteurs = pièces critiques.
                Maintenance ~340-360 €/an, prévoir 4 800 € pour remplacement bande.
              </div>
            </div>
            <div className="p-4 rounded-lg bg-cyan-soft">
              <div className="text-xs uppercase tracking-wider text-cyan-mid font-bold">Cross & rameurs</div>
              <div className="text-sm text-ink mt-1.5 leading-relaxed">
                Amortissement 7 ans. Le cross-trainer (2018) atteint sa fin de vie comptable
                — remplacement à budgéter pour 2026 (~2 800 €).
              </div>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "navy" | "cyan" | "clover" | "amber" | "slate";
}) {
  const toneCls =
    tone === "clover" ? "text-clover" :
    tone === "amber" ? "text-amber" :
    tone === "cyan" ? "text-cyan-mid" :
    tone === "slate" ? "text-slate" :
    "text-navy";
  return (
    <div className="p-3 rounded-lg bg-navy-pale text-center">
      <div className="text-[10px] uppercase text-slate tracking-wide font-medium">{label}</div>
      <div className={cn("text-lg font-bold mt-0.5", toneCls)}>{value}</div>
    </div>
  );
}

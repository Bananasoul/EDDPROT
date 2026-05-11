"use client";

import { useMemo } from "react";
import {
  TrendingUp,
  TrendingDown,
  Users,
  Euro,
  Clock,
  CheckCircle2,
  AlertTriangle,
  BarChart3,
  Building2,
  Languages,
  Award,
  Activity,
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
  RadialBarChart,
  RadialBar,
  Legend,
} from "recharts";
import { patients } from "@/lib/mock-data";
import { useApp } from "@/lib/app-context";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { KPITile } from "@/components/KPITile";
import { cn } from "@/lib/utils";

const NAVY = "#1e3a5f";
const NAVY_MID = "#2e5d8e";
const CLOVER = "#1a6b45";
const AMBER = "#d35400";
const ACCENT = "#c0392b";
const SLATE = "#64748b";

export default function DirectionPage() {
  const { lang } = useApp();
  const tr = (fr: string, de: string) => (lang === "de" ? de : fr);

  const stats = useMemo(() => {
    const total = patients.length;
    const active = patients.filter((p) =>
      ["in_program", "t0_done", "t1_due"].includes(p.status)
    ).length;
    const completed = patients.filter((p) => p.status === "completed").length;
    const waiting = patients.filter((p) =>
      ["prescribed", "contacted", "scheduled"].includes(p.status)
    ).length;
    const withBoth = patients.filter((p) => p.scoresT0 && p.scoresT1);
    const avgPainDrop =
      withBoth.length === 0
        ? 0
        : withBoth.reduce(
            (s, p) => s + (p.scoresT0!.pain_activity - p.scoresT1!.pain_activity),
            0
          ) / withBoth.length;
    const avgOdiDrop =
      withBoth.length === 0
        ? 0
        : withBoth.reduce((s, p) => s + (p.scoresT0!.odi - p.scoresT1!.odi), 0) /
          withBoth.length;

    // Estimation économique : un AT lombalgie évité ≈ 12 000 € (source mock INAMI)
    const sessionsTotal = patients.reduce((s, p) => s + p.sessionsDone, 0);
    const revenueINAMI = sessionsTotal * 26.4;
    const atEvitesEstime = Math.round(completed * 0.6);
    const economiesEstimees = atEvitesEstime * 12000;

    return {
      total,
      active,
      completed,
      waiting,
      avgPainDrop: +avgPainDrop.toFixed(1),
      avgOdiDrop: Math.round(avgOdiDrop),
      sessionsTotal,
      revenueINAMI,
      economiesEstimees,
      atEvitesEstime,
      completionRate: completed
        ? Math.round((completed / (completed + active + waiting)) * 100)
        : 0,
    };
  }, []);

  // ROI mensuel mock — 6 derniers mois
  const monthlyData = useMemo(
    () => [
      { month: "Déc", revenu: 1820, cible: 2200, patients: 9 },
      { month: "Jan", revenu: 2110, cible: 2200, patients: 11 },
      { month: "Fév", revenu: 2480, cible: 2400, patients: 13 },
      { month: "Mar", revenu: 2950, cible: 2600, patients: 15 },
      { month: "Avr", revenu: 3420, cible: 2800, patients: 17 },
      {
        month: tr("Mai", "Mai"),
        revenu: Math.round(stats.revenueINAMI / 6),
        cible: 3000,
        patients: stats.active,
      },
    ],
    [stats]
  );

  const mutuelles = useMemo(() => {
    const m = new Map<string, number>();
    patients.forEach((p) => m.set(p.mutual, (m.get(p.mutual) ?? 0) + 1));
    return Array.from(m.entries()).map(([name, value]) => ({ name, value }));
  }, []);
  const PIE_COLORS = [NAVY, NAVY_MID, CLOVER, AMBER, ACCENT, SLATE, "#9333ea", "#0891b2", "#ea580c"];

  const langSplit = useMemo(() => {
    const fr = patients.filter((p) => p.lang === "fr").length;
    const de = patients.filter((p) => p.lang === "de").length;
    return [
      { name: tr("Français", "Französisch"), value: fr },
      { name: tr("Allemand", "Deutsch"), value: de },
    ];
  }, [lang]);

  const ageGroups = useMemo(() => {
    const groups = [
      { range: "< 30", min: 0, max: 30 },
      { range: "30-44", min: 30, max: 45 },
      { range: "45-59", min: 45, max: 60 },
      { range: "60-74", min: 60, max: 75 },
      { range: "75+", min: 75, max: 200 },
    ];
    return groups.map((g) => ({
      range: g.range,
      patients: patients.filter((p) => {
        const age = new Date().getFullYear() - new Date(p.dob).getFullYear();
        return age >= g.min && age < g.max;
      }).length,
    }));
  }, []);

  const qualityKPIs = [
    {
      label: tr("T0 documenté (≥ 95%)", "T0 dokumentiert (≥ 95%)"),
      value: 100,
      target: 95,
    },
    {
      label: tr("Programme ≥ 30 séances", "Programm ≥ 30 Sitzungen"),
      value: 92,
      target: 80,
    },
    {
      label: tr("T1 documenté", "T1 dokumentiert"),
      value: 88,
      target: 85,
    },
    {
      label: tr("Rapport médecin traitant", "Bericht an Hausarzt"),
      value: 100,
      target: 100,
    },
    {
      label: tr("Suivi T2 (3 mois)", "Nachsorge T2 (3 Monate)"),
      value: 71,
      target: 70,
    },
  ];

  const beforeAfter = [
    {
      label: tr("Temps de rédaction rapport", "Zeit für Berichterstellung"),
      before: tr("45 min / patient", "45 Min. / Patient"),
      after: tr("8 min / patient", "8 Min. / Patient"),
      gain: "−82%",
    },
    {
      label: tr("Documents papier / dossier", "Papierdokumente / Akte"),
      before: "23",
      after: "0",
      gain: "−100%",
    },
    {
      label: tr("Délai relance mutuelle", "Frist Krankenkassenmahnung"),
      before: tr("21 jours (manuel)", "21 Tage (manuell)"),
      after: tr("Auto J+10", "Auto Tag+10"),
      gain: "−52%",
    },
    {
      label: tr("Taux d'abandon programme", "Abbruchquote Programm"),
      before: "18%",
      after: "9%",
      gain: "−50%",
    },
    {
      label: tr("Saisie double (kiné/secrétariat)", "Doppelerfassung (PT/Sekr.)"),
      before: tr("32 min / patient", "32 Min. / Patient"),
      after: tr("0 min", "0 Min."),
      gain: "−100%",
    },
    {
      label: tr("Erreurs facturation INAMI", "Abrechnungsfehler INAMI"),
      before: "7,4 %",
      after: "0,5 %",
      gain: "−93%",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
      <header className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-navy-pale text-navy text-xs font-medium border border-navy-light mb-2">
            <Award className="w-3.5 h-3.5" />
            {tr("Tableau de bord stratégique", "Strategisches Dashboard")}
          </div>
          <h1 className="font-serif text-3xl text-navy">
            {tr("Direction & Pilotage — École du Dos", "Direktion & Steuerung — Rückenschule")}
          </h1>
          <p className="text-slate text-sm mt-1">
            {tr(
              "Vision consolidée du service, ROI, qualité KCE et impact organisationnel.",
              "Konsolidierte Sicht des Dienstes, ROI, KCE-Qualität und organisatorische Wirkung."
            )}
          </p>
        </div>
        <div className="text-right">
          <div className="text-xs text-slate uppercase tracking-wide">
            {tr("Période", "Zeitraum")}
          </div>
          <div className="text-sm font-medium text-navy">
            {tr("Déc. 2025 → Mai 2026 (6 mois)", "Dez. 2025 → Mai 2026 (6 Monate)")}
          </div>
        </div>
      </header>

      {/* KPI strategic top row */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KPITile
          label={tr("Patients pris en charge", "Betreute Patienten")}
          value={stats.total}
          sub={tr(
            `${stats.active} actifs · ${stats.waiting} en attente · ${stats.completed} clôturés`,
            `${stats.active} aktiv · ${stats.waiting} wartend · ${stats.completed} abgeschlossen`
          )}
          tone="navy"
          icon={<Users className="w-5 h-5" />}
        />
        <KPITile
          label={tr("Revenus INAMI 6 mois", "INAMI-Einnahmen 6 Monate")}
          value={`${(stats.revenueINAMI / 1000).toFixed(1)} k€`}
          sub={tr(
            `${stats.sessionsTotal} séances · code 563011`,
            `${stats.sessionsTotal} Sitzungen · Code 563011`
          )}
          tone="clover"
          icon={<Euro className="w-5 h-5" />}
        />
        <KPITile
          label={tr("Économies AT estimées", "Geschätzte AU-Einsparungen")}
          value={`${(stats.economiesEstimees / 1000).toFixed(0)} k€`}
          sub={tr(
            `${stats.atEvitesEstime} arrêts évités (estim.)`,
            `${stats.atEvitesEstime} vermiedene AU (Schätz.)`
          )}
          tone="amber"
          icon={<TrendingUp className="w-5 h-5" />}
        />
        <KPITile
          label={tr("Δ EVA moyen T0→T1", "Ø VAS T0→T1")}
          value={`−${stats.avgPainDrop}`}
          sub={tr(
            `−${stats.avgOdiDrop} pts ODI · taux complétion ${stats.completionRate}%`,
            `−${stats.avgOdiDrop} Pkt. ODI · Abschlussquote ${stats.completionRate}%`
          )}
          tone="navy"
          icon={<TrendingDown className="w-5 h-5" />}
        />
      </section>

      {/* ROI chart + Quality KPIs */}
      <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <Card className="xl:col-span-2">
          <CardHeader
            title={tr("ROI mensuel — revenus INAMI vs cible", "Monatliche ROI — INAMI vs. Ziel")}
            subtitle={tr(
              "Évolution sur 6 mois · les barres dépassant la ligne cible signalent l'atteinte d'objectif",
              "6-Monats-Verlauf · Balken über Zielinie zeigen Zielerreichung"
            )}
          />
          <CardBody>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={monthlyData}>
                <XAxis dataKey="month" stroke={SLATE} fontSize={12} />
                <YAxis stroke={SLATE} fontSize={12} unit=" €" />
                <Tooltip
                  contentStyle={{ borderRadius: 8, border: `1px solid #e2e8f0`, fontSize: 12 }}
                  formatter={(v) => `${Number(v).toLocaleString("fr-BE")} €`}
                />
                <Bar dataKey="revenu" radius={[6, 6, 0, 0]}>
                  {monthlyData.map((d, i) => (
                    <Cell
                      key={i}
                      fill={d.revenu >= d.cible ? CLOVER : NAVY_MID}
                    />
                  ))}
                </Bar>
                <Bar dataKey="cible" fill="transparent" />
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-3 grid grid-cols-3 gap-3 text-center">
              <Stat label={tr("Croissance 6 mois", "Wachstum 6 Monate")} value="+88%" tone="clover" />
              <Stat label={tr("Δ vs cible (mai)", "Δ vs. Ziel (Mai)")} value="+19%" tone="clover" />
              <Stat label={tr("File d'attente", "Warteliste")} value={`${stats.waiting} pat.`} tone="amber" />
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            title={tr("Qualité KCE", "KCE-Qualität")}
            subtitle={tr("Conformité au protocole national", "Konformität mit nationalem Protokoll")}
          />
          <CardBody>
            <div className="space-y-3">
              {qualityKPIs.map((q) => {
                const ok = q.value >= q.target;
                return (
                  <div key={q.label}>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-ink">{q.label}</span>
                      <span
                        className={cn(
                          "font-semibold tabular-nums inline-flex items-center gap-1",
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
                      <div
                        className="h-0.5 -mt-2.5 bg-navy/40"
                        style={{ width: `${q.target}%` }}
                      />
                    </div>
                    <div className="text-[10px] text-slate mt-0.5">
                      {tr("Cible", "Ziel")}: {q.target}%
                    </div>
                  </div>
                );
              })}
            </div>
          </CardBody>
        </Card>
      </section>

      {/* Demographics row */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader
            title={tr("Pyramide des âges", "Altersverteilung")}
            subtitle={tr("Répartition des patients", "Patientenverteilung")}
          />
          <CardBody>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={ageGroups} layout="vertical" margin={{ left: 6 }}>
                <XAxis type="number" stroke={SLATE} fontSize={11} />
                <YAxis dataKey="range" type="category" stroke={SLATE} fontSize={11} width={50} />
                <Tooltip contentStyle={{ borderRadius: 8, border: `1px solid #e2e8f0`, fontSize: 12 }} />
                <Bar dataKey="patients" fill={NAVY} radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            title={tr("Mutuelles", "Krankenkassen")}
            subtitle={tr("Compatibilité multi-mutuelles", "Multi-Krankenkassen-Kompatibilität")}
          />
          <CardBody>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={mutuelles}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={45}
                  outerRadius={75}
                  paddingAngle={2}
                >
                  {mutuelles.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 8, border: `1px solid #e2e8f0`, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-1.5 text-[11px] mt-2">
              {mutuelles.map((m, i) => (
                <div key={m.name} className="flex items-center gap-1.5 text-slate">
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }}
                  />
                  <span className="truncate">{m.name}</span>
                  <span className="ml-auto font-medium text-ink tabular-nums">{m.value}</span>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            title={tr("Langues du patient", "Patientensprachen")}
            subtitle={tr("Région germanophone HSNE", "Deutschsprachige Region SNH")}
          />
          <CardBody>
            <ResponsiveContainer width="100%" height={200}>
              <RadialBarChart
                innerRadius="40%"
                outerRadius="90%"
                data={langSplit}
                startAngle={90}
                endAngle={-270}
              >
                <RadialBar
                  background={{ fill: "#eef4fa" }}
                  dataKey="value"
                  cornerRadius={6}
                >
                  {langSplit.map((_, i) => (
                    <Cell key={i} fill={i === 0 ? NAVY : AMBER} />
                  ))}
                </RadialBar>
                <Legend
                  iconSize={8}
                  layout="vertical"
                  verticalAlign="middle"
                  align="right"
                  wrapperStyle={{ fontSize: 11 }}
                />
              </RadialBarChart>
            </ResponsiveContainer>
            <div className="text-xs text-slate mt-2 text-center">
              {tr(
                "Tous les rapports patients sont automatiquement bilingues.",
                "Alle Patientenberichte sind automatisch zweisprachig."
              )}
            </div>
          </CardBody>
        </Card>
      </section>

      {/* Avant / Après plateforme */}
      <Card>
        <CardHeader
          title={tr("Impact de la plateforme — avant / après", "Plattform-Wirkung — vorher / nachher")}
          subtitle={tr(
            "Comparatif basé sur 6 mois d'exploitation pilote (estimations service)",
            "Vergleich auf Basis von 6 Monaten Pilotbetrieb (Schätzungen Dienst)"
          )}
        />
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {beforeAfter.map((row) => (
              <div
                key={row.label}
                className="p-4 rounded-lg border border-hairline bg-white"
              >
                <div className="text-xs text-slate uppercase tracking-wide mb-2">
                  {row.label}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="text-[10px] text-slate uppercase">{tr("Avant", "Vorher")}</div>
                    <div className="text-base font-semibold text-accent line-through decoration-accent/40">
                      {row.before}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate uppercase">{tr("Après", "Nachher")}</div>
                    <div className="text-base font-semibold text-clover">{row.after}</div>
                  </div>
                </div>
                <div className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-clover bg-clover-soft px-2 py-0.5 rounded">
                  <TrendingDown className="w-3 h-3" /> {row.gain}
                </div>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* CTA strategic */}
      <Card>
        <CardHeader
          title={tr("Recommandations stratégiques", "Strategische Empfehlungen")}
          subtitle={tr("Synthèse pour la direction générale HSNE", "Zusammenfassung für die Generaldirektion SNH")}
        />
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Reco
              icon={<Building2 className="w-5 h-5" />}
              title={tr("Étendre à la kiné neurologique", "Auf neurologische PT erweitern")}
              desc={tr(
                "Modèle réplicable Parkinson, AVC, SEP — même architecture, ROI estimé +35 k€/an.",
                "Übertragbares Modell Parkinson, Schlaganfall, MS — gleiche Architektur, geschätzter ROI +35 k€/Jahr."
              )}
              tone="navy"
            />
            <Reco
              icon={<Activity className="w-5 h-5" />}
              title={tr("Pilote suivi à domicile", "Pilot Heim-Nachsorge")}
              desc={tr(
                "Module patient mobile pour relevés EVA quotidiens post-programme — différenciateur unique en région.",
                "Mobile Patientenanwendung für tägliche VAS-Erfassung nach Programm — einzigartiger Differenzierer in der Region."
              )}
              tone="clover"
            />
            <Reco
              icon={<BarChart3 className="w-5 h-5" />}
              title={tr("Intégration DPI HSNE", "Integration KIS SNH")}
              desc={tr(
                "Phase 2 : connecteur HL7/FHIR vers le DPI hospitalier pour zéro double saisie.",
                "Phase 2: HL7/FHIR-Konnektor zum Krankenhaus-KIS für null Doppelerfassung."
              )}
              tone="amber"
            />
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
  tone: "navy" | "clover" | "amber";
}) {
  const cls =
    tone === "clover"
      ? "text-clover"
      : tone === "amber"
      ? "text-amber"
      : "text-navy";
  return (
    <div className="p-3 rounded-lg bg-navy-pale">
      <div className="text-[10px] uppercase text-slate tracking-wide">{label}</div>
      <div className={cn("text-lg font-bold mt-0.5", cls)}>{value}</div>
    </div>
  );
}

function Reco({
  icon,
  title,
  desc,
  tone,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  tone: "navy" | "clover" | "amber";
}) {
  const bg =
    tone === "clover"
      ? "bg-clover-soft text-clover"
      : tone === "amber"
      ? "bg-amber-soft text-amber"
      : "bg-navy-pale text-navy";
  return (
    <div className="p-4 rounded-lg border border-hairline">
      <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center mb-2", bg)}>
        {icon}
      </div>
      <div className="font-semibold text-navy">{title}</div>
      <div className="text-sm text-slate mt-1 leading-relaxed">{desc}</div>
    </div>
  );
}

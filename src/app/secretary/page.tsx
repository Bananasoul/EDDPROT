"use client";

import { useMemo, useState } from "react";
import {
  Calendar,
  Phone,
  Users,
  AlertCircle,
  Euro,
  FileCheck,
  Building2,
  Clock,
  CheckCircle2,
  Send,
  RotateCcw,
  Plus,
} from "lucide-react";
import {
  appointments,
  billings,
  mutualRequests,
  patients,
  getPatient,
  type Appointment,
} from "@/lib/mock-data";
import { generateMutualLetter } from "@/lib/pdf/mutualLetter";
import { generateInamiReport } from "@/lib/pdf/inamiReport";
import { useApp } from "@/lib/app-context";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { KPITile } from "@/components/KPITile";
import { StatusBadge } from "@/components/StatusBadge";
import { cn } from "@/lib/utils";

type Tab = "overview" | "agenda" | "contacts" | "mutual" | "billing";

export default function SecretaryPage() {
  const { t } = useApp();
  const [tab, setTab] = useState<Tab>("overview");

  const kpi = useMemo(() => {
    const toContact = patients.filter((p) =>
      ["prescribed", "contacted"].includes(p.status)
    ).length;
    const upcoming = appointments.filter(
      (a) => new Date(a.dateTime) >= new Date("2026-04-19") && a.status !== "cancelled"
    ).length;
    const toBill = billings.filter((b) => b.status === "à facturer").length;
    const mutualPending = mutualRequests.filter((m) =>
      ["à envoyer", "relance requise"].includes(m.status)
    ).length;
    const endingSoon = patients.filter(
      (p) => p.status === "in_program" && p.sessionsDone >= 30
    ).length;
    return { toContact, upcoming, toBill, mutualPending, endingSoon };
  }, []);

  const tabs: { key: Tab; label: string; badge?: number }[] = [
    { key: "overview", label: "Vue d'ensemble" },
    { key: "agenda", label: "Agenda", badge: kpi.upcoming },
    { key: "contacts", label: "Patients à contacter", badge: kpi.toContact },
    { key: "mutual", label: "Mutuelle", badge: kpi.mutualPending },
    { key: "billing", label: "Facturation INAMI", badge: kpi.toBill },
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <div className="text-xs text-amber uppercase tracking-wide font-semibold">
            {t.roles.secretary.name}
          </div>
          <h1 className="font-serif text-3xl text-navy mt-1">Coordination & administration</h1>
          <p className="text-sm text-slate mt-1">
            École du Dos HSNE · semaine du 20 avril 2026
          </p>
        </div>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
        <KPITile label="À contacter" value={kpi.toContact} tone="amber" icon={<Phone className="w-5 h-5" />} />
        <KPITile label="RDV à venir" value={kpi.upcoming} icon={<Calendar className="w-5 h-5" />} />
        <KPITile label="Fin programme proche" value={kpi.endingSoon} tone="accent" icon={<AlertCircle className="w-5 h-5" />} />
        <KPITile label="Mutuelles en attente" value={kpi.mutualPending} tone="amber" icon={<Building2 className="w-5 h-5" />} />
        <KPITile label="À facturer" value={kpi.toBill} tone="clover" icon={<Euro className="w-5 h-5" />} />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-hairline overflow-x-auto">
        {tabs.map((tb) => (
          <button
            key={tb.key}
            onClick={() => setTab(tb.key)}
            className={cn(
              "px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition whitespace-nowrap flex items-center gap-2",
              tab === tb.key
                ? "border-navy text-navy"
                : "border-transparent text-slate hover:text-navy hover:border-hairline"
            )}
          >
            {tb.label}
            {tb.badge !== undefined && tb.badge > 0 && (
              <span
                className={cn(
                  "text-[10px] font-bold rounded-full px-1.5 py-0.5 min-w-[18px] text-center",
                  tab === tb.key ? "bg-navy text-white" : "bg-amber/20 text-amber"
                )}
              >
                {tb.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {tab === "overview" && <OverviewTab kpi={kpi} />}
      {tab === "agenda" && <AgendaTab />}
      {tab === "contacts" && <ContactsTab />}
      {tab === "mutual" && <MutualTab />}
      {tab === "billing" && <BillingTab />}
    </div>
  );
}

// ─── OVERVIEW ────────────────────────────────────────────────────
function OverviewTab({
  kpi,
}: {
  kpi: { toContact: number; upcoming: number; endingSoon: number; mutualPending: number; toBill: number };
}) {
  const todayAppts = appointments
    .slice()
    .sort((a, b) => +new Date(a.dateTime) - +new Date(b.dateTime))
    .slice(0, 5);

  const alerts = patients.filter(
    (p) => p.status === "in_program" && p.sessionsDone >= 30
  );
  const urgentMutual = mutualRequests.filter((m) => m.status === "relance requise");

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Agenda du jour */}
      <Card>
        <CardHeader
          title="Prochains RDV"
          subtitle="Synchronisation Outlook/Exchange (mock)"
          action={
            <button className="text-xs text-navy-mid hover:underline">Tout l'agenda →</button>
          }
        />
        <CardBody className="pt-0">
          <div className="divide-y divide-hairline/60">
            {todayAppts.map((a) => {
              const p = getPatient(a.patientId);
              return <AppointmentRow key={a.id} a={a} patientName={p ? `${p.lastName.toUpperCase()} ${p.firstName}` : "?"} />;
            })}
          </div>
        </CardBody>
      </Card>

      {/* Alertes fin de programme */}
      <Card>
        <CardHeader title="Fin de programme imminente" subtitle="Patients ≥ 30 séances — prévoir T1 + facturation clôture" />
        <CardBody className="space-y-3">
          {alerts.length === 0 ? (
            <div className="text-sm text-slate">Aucune alerte.</div>
          ) : (
            alerts.map((p) => (
              <div key={p.id} className="flex items-center justify-between p-3 rounded-lg bg-accent-soft/40 border border-accent/20">
                <div>
                  <div className="font-medium text-navy">
                    {p.lastName.toUpperCase()} {p.firstName}
                  </div>
                  <div className="text-xs text-slate mt-0.5">
                    Séance {p.sessionsDone}/36 · {p.mutual}
                  </div>
                </div>
                <Badge variant="accent">
                  <AlertCircle className="w-3 h-3" />
                  {36 - p.sessionsDone} restante(s)
                </Badge>
              </div>
            ))
          )}
        </CardBody>
      </Card>

      {/* Mutuelles urgentes */}
      <Card>
        <CardHeader title="Mutuelles à relancer" />
        <CardBody>
          {urgentMutual.length === 0 ? (
            <div className="text-sm text-slate">Rien d'urgent.</div>
          ) : (
            <ul className="space-y-2">
              {urgentMutual.map((m) => {
                const p = getPatient(m.patientId);
                return (
                  <li
                    key={m.patientId}
                    className="flex items-center justify-between p-3 rounded-lg border border-amber/30 bg-amber-soft/30"
                  >
                    <div>
                      <div className="font-medium text-navy">
                        {p?.lastName.toUpperCase()} {p?.firstName}
                      </div>
                      <div className="text-xs text-slate mt-0.5">
                        {m.mutual} · {m.note}
                      </div>
                    </div>
                    <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-amber text-white hover:bg-amber/90">
                      <RotateCcw className="w-3.5 h-3.5" />
                      Relancer
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </CardBody>
      </Card>

      {/* Synthèse chiffres */}
      <Card>
        <CardHeader title="Semaine en un coup d'œil" />
        <CardBody>
          <ul className="space-y-3 text-sm">
            <OverviewLine icon={<Phone className="w-4 h-4" />} label={`${kpi.toContact} patient(s) à contacter pour planification T0`} />
            <OverviewLine icon={<Calendar className="w-4 h-4" />} label={`${kpi.upcoming} rendez-vous programmés`} />
            <OverviewLine icon={<Building2 className="w-4 h-4" />} label={`${kpi.mutualPending} demande(s) mutuelle en attente d'action`} />
            <OverviewLine icon={<Euro className="w-4 h-4" />} label={`${kpi.toBill} facture(s) INAMI à établir cette semaine`} />
            <OverviewLine icon={<AlertCircle className="w-4 h-4" />} label={`${kpi.endingSoon} patient(s) proche de la fin (clôture dossier)`} />
          </ul>
        </CardBody>
      </Card>
    </div>
  );
}

function OverviewLine({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <li className="flex items-start gap-3">
      <span className="w-7 h-7 rounded-md bg-navy-pale text-navy flex items-center justify-center shrink-0">
        {icon}
      </span>
      <span className="text-ink leading-relaxed">{label}</span>
    </li>
  );
}

function AppointmentRow({ a, patientName }: { a: Appointment; patientName: string }) {
  const dt = new Date(a.dateTime);
  const typeColors: Record<Appointment["type"], "navy" | "accent" | "amber" | "clover"> = {
    T0: "amber",
    T1: "accent",
    séance: "navy",
    consult_physio: "clover",
  };
  const typeLabel: Record<Appointment["type"], string> = {
    T0: "Évaluation T0",
    T1: "Évaluation T1",
    séance: "Séance",
    consult_physio: "Consultation physio",
  };
  return (
    <div className="flex items-center gap-3 py-3">
      <div className="w-14 text-center shrink-0">
        <div className="text-[10px] uppercase tracking-wide text-slate">
          {dt.toLocaleDateString("fr-BE", { weekday: "short" })}
        </div>
        <div className="font-serif text-lg text-navy leading-none">{dt.getDate()}</div>
        <div className="text-[10px] text-slate">
          {dt.toLocaleDateString("fr-BE", { month: "short" })}
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-medium text-navy truncate">{patientName}</div>
        <div className="text-xs text-slate flex items-center gap-2 mt-0.5">
          <Clock className="w-3 h-3" />
          {dt.toLocaleTimeString("fr-BE", { hour: "2-digit", minute: "2-digit" })}
          <span>·</span>
          <span>{a.staff}</span>
          <span>·</span>
          <span>{a.room}</span>
        </div>
      </div>
      <Badge variant={typeColors[a.type]}>{typeLabel[a.type]}</Badge>
    </div>
  );
}

// ─── AGENDA ──────────────────────────────────────────────────────
function AgendaTab() {
  const sorted = [...appointments].sort((a, b) => +new Date(a.dateTime) - +new Date(b.dateTime));
  return (
    <Card>
      <CardHeader
        title="Agenda École du Dos"
        subtitle="Vue synchronisée Outlook/Exchange · (mock)"
        action={
          <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-navy text-white hover:bg-navy-mid">
            <Plus className="w-3.5 h-3.5" /> Nouveau RDV
          </button>
        }
      />
      <CardBody className="pt-0">
        <div className="divide-y divide-hairline/60">
          {sorted.map((a) => {
            const p = getPatient(a.patientId);
            return (
              <AppointmentRow
                key={a.id}
                a={a}
                patientName={p ? `${p.lastName.toUpperCase()} ${p.firstName}` : "?"}
              />
            );
          })}
        </div>
      </CardBody>
    </Card>
  );
}

// ─── CONTACTS ────────────────────────────────────────────────────
function ContactsTab() {
  const toContact = patients.filter((p) => ["prescribed", "contacted"].includes(p.status));
  return (
    <Card>
      <CardHeader
        title="Patients à contacter"
        subtitle="Issus des prescriptions médicales, en attente de planification T0"
      />
      <table className="w-full text-sm">
        <thead className="bg-slate-light/60 text-slate text-xs uppercase tracking-wide">
          <tr>
            <th className="text-left px-5 py-2 font-medium">Patient</th>
            <th className="text-left px-3 py-2 font-medium">Prescripteur</th>
            <th className="text-left px-3 py-2 font-medium">Mutuelle</th>
            <th className="text-left px-3 py-2 font-medium">Statut</th>
            <th className="px-3 py-2"></th>
          </tr>
        </thead>
        <tbody>
          {toContact.map((p) => (
            <tr key={p.id} className="border-t border-hairline/60">
              <td className="px-5 py-3">
                <div className="font-medium text-navy">
                  {p.lastName.toUpperCase()} {p.firstName}
                </div>
                <div className="text-xs text-slate">
                  {new Date(p.dob).toLocaleDateString("fr-BE")} · {p.lang.toUpperCase()}
                </div>
              </td>
              <td className="px-3 py-3 text-slate">{p.prescriber}</td>
              <td className="px-3 py-3 text-slate">{p.mutual}</td>
              <td className="px-3 py-3">
                <StatusBadge status={p.status} />
              </td>
              <td className="px-3 py-3 text-right">
                <div className="inline-flex gap-2">
                  <button className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium bg-navy text-white hover:bg-navy-mid">
                    <Phone className="w-3.5 h-3.5" /> Appeler
                  </button>
                  <button className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium border border-hairline text-navy hover:bg-navy-pale">
                    <Calendar className="w-3.5 h-3.5" /> Planifier
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}

// ─── MUTUAL ──────────────────────────────────────────────────────
function MutualTab() {
  const statusVariant = (s: string) =>
    s === "à envoyer"
      ? "amber"
      : s === "envoyée"
      ? "navy"
      : s === "acceptée"
      ? "clover"
      : s === "refusée"
      ? "accent"
      : "amber";

  return (
    <Card>
      <CardHeader
        title="Demandes mutuelle"
        subtitle="Suivi des formulaires de prise en charge"
      />
      <table className="w-full text-sm">
        <thead className="bg-slate-light/60 text-slate text-xs uppercase tracking-wide">
          <tr>
            <th className="text-left px-5 py-2 font-medium">Patient</th>
            <th className="text-left px-3 py-2 font-medium">Mutuelle</th>
            <th className="text-left px-3 py-2 font-medium">Date demande</th>
            <th className="text-left px-3 py-2 font-medium">Statut</th>
            <th className="text-left px-3 py-2 font-medium">Note</th>
            <th className="px-3 py-2"></th>
          </tr>
        </thead>
        <tbody>
          {mutualRequests.map((m) => {
            const p = getPatient(m.patientId);
            return (
              <tr key={m.patientId} className="border-t border-hairline/60">
                <td className="px-5 py-3 font-medium text-navy">
                  {p?.lastName.toUpperCase()} {p?.firstName}
                </td>
                <td className="px-3 py-3 text-slate">{m.mutual}</td>
                <td className="px-3 py-3 text-slate tabular-nums">
                  {m.requestDate ? new Date(m.requestDate).toLocaleDateString("fr-BE") : "—"}
                </td>
                <td className="px-3 py-3">
                  <Badge variant={statusVariant(m.status)}>{m.status}</Badge>
                </td>
                <td className="px-3 py-3 text-xs text-slate">{m.note ?? ""}</td>
                <td className="px-3 py-3 text-right">
                  {m.status === "à envoyer" && p && (
                    <button
                      onClick={() => generateMutualLetter(p, p.lang)}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium bg-navy text-white hover:bg-navy-mid"
                    >
                      <Send className="w-3.5 h-3.5" /> Générer & envoyer
                    </button>
                  )}
                  {m.status === "relance requise" && p && (
                    <button
                      onClick={() => generateMutualLetter(p, p.lang)}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium bg-amber text-white hover:bg-amber/90"
                    >
                      <RotateCcw className="w-3.5 h-3.5" /> Relancer (PDF)
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </Card>
  );
}

// ─── BILLING ─────────────────────────────────────────────────────
function BillingTab() {
  const total = billings
    .filter((b) => b.status === "à facturer")
    .reduce((s, b) => s + b.amount, 0);

  const statusIcon = (s: string) =>
    s === "payée" ? (
      <CheckCircle2 className="w-4 h-4 text-clover" />
    ) : s === "envoyée" ? (
      <Send className="w-4 h-4 text-navy-mid" />
    ) : s === "en attente mutuelle" ? (
      <Clock className="w-4 h-4 text-amber" />
    ) : (
      <AlertCircle className="w-4 h-4 text-amber" />
    );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <KPITile
          label="À encaisser cette semaine"
          value={`${total.toFixed(2)} €`}
          tone="clover"
          icon={<Euro className="w-5 h-5" />}
        />
        <KPITile
          label="Codes INAMI École du Dos"
          value="563011"
          sub="Séance 60 min · Kiné qualifié"
          icon={<FileCheck className="w-5 h-5" />}
        />
        <KPITile
          label="Taux remboursement"
          value="75%"
          sub="moy. toutes mutuelles"
          tone="navy"
          icon={<Building2 className="w-5 h-5" />}
        />
      </div>

      <Card>
        <CardHeader
          title="Factures en cours"
          subtitle="Calcul automatique à partir des séances réalisées"
        />
        <table className="w-full text-sm">
          <thead className="bg-slate-light/60 text-slate text-xs uppercase tracking-wide">
            <tr>
              <th className="text-left px-5 py-2 font-medium">Patient</th>
              <th className="text-left px-3 py-2 font-medium">Prestation</th>
              <th className="text-center px-3 py-2 font-medium">Séances</th>
              <th className="text-right px-3 py-2 font-medium">Montant</th>
              <th className="text-left px-3 py-2 font-medium">Statut</th>
              <th className="text-left px-3 py-2 font-medium">Échéance</th>
              <th className="px-3 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {billings.map((b) => {
              const p = getPatient(b.patientId);
              return (
                <tr key={b.patientId} className="border-t border-hairline/60">
                  <td className="px-5 py-3 font-medium text-navy">
                    {p?.lastName.toUpperCase()} {p?.firstName}
                  </td>
                  <td className="px-3 py-3 text-slate">
                    <div>{b.label}</div>
                    <div className="text-xs text-slate/70">Code {b.code}</div>
                  </td>
                  <td className="px-3 py-3 text-center tabular-nums text-slate">
                    {b.sessionsBilled}/{b.sessionsBilled + b.sessionsRemaining}
                  </td>
                  <td className="px-3 py-3 text-right font-semibold text-navy tabular-nums">
                    {b.amount.toFixed(2)} €
                  </td>
                  <td className="px-3 py-3">
                    <span className="inline-flex items-center gap-1.5 text-xs text-ink">
                      {statusIcon(b.status)} {b.status}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-slate tabular-nums">
                    {b.nextBillingDate ? new Date(b.nextBillingDate).toLocaleDateString("fr-BE") : "—"}
                  </td>
                  <td className="px-3 py-3 text-right">
                    {b.status === "à facturer" && p && (
                      <button
                        onClick={() => generateInamiReport(p, p.lang)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium bg-clover text-white hover:bg-clover/90"
                      >
                        <Send className="w-3.5 h-3.5" /> Émettre (PDF)
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

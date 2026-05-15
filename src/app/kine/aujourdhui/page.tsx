"use client";

import { useMemo, useState } from "react";
import {
  CheckCircle2,
  X,
  Clock,
  AlertCircle,
  Brain,
  Briefcase,
  Phone,
  Activity,
  ChevronRight,
  Sparkles,
  PhoneCall,
  Calendar,
} from "lucide-react";
import Link from "next/link";
import { patients, appointments, getPatient, type Patient } from "@/lib/mock-data";
import { patientPsyStatus, psySessions } from "@/lib/mock-data";
import { ATTENDANCE, summarize, ghostPatients, RISK_META, type AttendanceStatus, type AbsenceReason } from "@/lib/attendance";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { AbsenceModal } from "@/components/AbsenceModal";
import { cn } from "@/lib/utils";

// Détermine le créneau du jour (mock : on prend le créneau Mar/Jeu 8-10
// car aujourd'hui 15/05/2026 = vendredi → Mer/Ven 8-10 normalement)
const TODAY = new Date("2026-05-15"); // mercredi en pratique 15/05/26 = ven
const SLOT_LABEL = "Vendredi 15 mai · 8h00–10h00 · Équipe Philippe / Fanny";

export default function AujourdhuiPage() {
  // ─── Patients du groupe du jour ─────
  // On prend les patients en programme dont l'ID se termine par certains
  // chiffres, pour simuler la composition d'un groupe (5-7 patients)
  const todaysGroup = useMemo(
    () =>
      patients.filter((p) =>
        ["p008", "p009", "p010", "p014", "p015", "p016", "p017", "p020"].includes(p.id)
      ),
    []
  );

  // ─── Nouveaux patients à voir en T0 (créneau 9-10h) ─────
  const newT0Today = useMemo(
    () =>
      appointments
        .filter(
          (a) => a.type === "T0" && new Date(a.dateTime).toDateString() === TODAY.toDateString()
        )
        .map((a) => getPatient(a.patientId)!)
        .filter(Boolean),
    []
  );

  // Patients fantômes
  const ghosts = useMemo(() => ghostPatients(10), []);

  // Patients ayant besoin d'une intervention ergo
  const needsErgo = useMemo(
    () => patients.filter((p) => ["p008", "p014", "p017"].includes(p.id)),
    []
  );

  // Sessions psy approchant
  const upcomingPsy = useMemo(
    () => psySessions.filter((s) => s.status === "scheduled" && s.date && new Date(s.date) >= TODAY).slice(0, 2),
    []
  );

  // ─── State : présence de chaque patient ─────
  const [attendance, setAttendance] = useState<Record<string, AttendanceStatus>>({});
  const [modalPatient, setModalPatient] = useState<Patient | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const markStatus = (patient: Patient, status: AttendanceStatus) => {
    setAttendance((s) => ({ ...s, [patient.id]: status }));
    if (status === "present") showToast(`✓ ${patient.firstName} ${patient.lastName} marqué présent`);
  };

  const handleAbsenceConfirm = (
    patient: Patient,
    data: { status: AttendanceStatus; reason?: AbsenceReason; reasonNote?: string; sendFollowup: boolean }
  ) => {
    setAttendance((s) => ({ ...s, [patient.id]: data.status }));
    setModalPatient(null);
    if (data.sendFollowup) {
      showToast(`📨 Relance envoyée à ${patient.firstName} ${patient.lastName}`);
    } else {
      showToast(`✓ Absence enregistrée pour ${patient.firstName} ${patient.lastName}`);
    }
  };

  // Stats du groupe
  const presentCount = Object.values(attendance).filter((s) => s === "present" || s === "late").length;
  const absentCount = Object.values(attendance).filter((s) => s.startsWith("no_show") || s.startsWith("cancelled")).length;
  const pendingCount = todaysGroup.length - presentCount - absentCount;

  return (
    <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
      {/* Header */}
      <header>
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-cyan-soft text-cyan-mid text-xs font-bold mb-2">
          <Calendar className="w-3.5 h-3.5" />
          Mon vendredi matin
        </div>
        <h1 className="font-bold text-3xl text-navy">Bonjour Philippe 👋</h1>
        <p className="text-sm text-slate mt-1">{SLOT_LABEL}</p>
      </header>

      {/* Bandeau alerte priorité — si patients à risque */}
      <RiskBanner />

      {/* KPI rapides du groupe */}
      <section className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <DayKpi label="Patients attendus" value={todaysGroup.length} tone="navy" />
        <DayKpi label="Présents" value={presentCount} tone="clover" />
        <DayKpi label="Absents/annulés" value={absentCount} tone="amber" />
        <DayKpi label="En attente" value={pendingCount} tone="slate" />
        <DayKpi label="Nouveaux T0" value={newT0Today.length} tone="cyan" />
      </section>

      {/* Liste des présences du groupe — focus principal */}
      <Card>
        <CardHeader
          title="Liste de présence du groupe"
          subtitle="Cliquez sur ✓ ou ✗ à mesure que les patients arrivent. Toutes les actions sont sauvegardées."
        />
        <CardBody className="space-y-2">
          {todaysGroup.map((p) => (
            <PatientPresenceRow
              key={p.id}
              patient={p}
              status={attendance[p.id]}
              onPresent={() => markStatus(p, "present")}
              onLate={() => markStatus(p, "late")}
              onAbsent={() => setModalPatient(p)}
            />
          ))}
        </CardBody>
      </Card>

      {/* 2 colonnes : Nouveaux T0 + Alertes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Nouveaux T0 du jour (créneau 9-10h) */}
        {newT0Today.length > 0 && (
          <Card>
            <CardHeader
              title="Nouveaux patients en T0 aujourd'hui"
              subtitle="Créneau 9h-10h pendant que le groupe est sur les appareils"
            />
            <CardBody className="space-y-2">
              {newT0Today.map((p) => (
                <Link
                  key={p.id}
                  href={`/kine/${p.id}/anamnese-t0`}
                  className="flex items-center gap-3 p-3 rounded-lg border border-hairline hover:border-cyan hover:bg-cyan-soft/40 transition"
                >
                  <div className="w-10 h-10 rounded-full bg-cyan text-white flex items-center justify-center font-bold text-sm">
                    {p.firstName[0]}
                    {p.lastName[0]}
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-navy">
                      {p.lastName.toUpperCase()} {p.firstName}
                    </div>
                    <div className="text-xs text-slate">
                      {p.lang.toUpperCase()} · {p.job} · prescrit par {p.prescriber}
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-cyan">
                    <Sparkles className="w-3.5 h-3.5" />
                    Lancer T0
                    <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </Link>
              ))}
            </CardBody>
          </Card>
        )}

        {/* Patients fantômes — pas vus depuis longtemps */}
        {ghosts.length > 0 && (
          <Card className="border-l-4 border-l-amber">
            <CardHeader
              title={`Patients à relancer — pas vus depuis ${ghosts[0]?.daysSince}+ jours`}
              subtitle="Démarcher pour libérer la place ou confirmer la reprise"
            />
            <CardBody className="space-y-2">
              {ghosts.map((g) => {
                const p = getPatient(g.patientId);
                if (!p) return null;
                const summary = summarize(g.patientId);
                const risk = RISK_META[summary.riskLevel];
                return (
                  <div
                    key={g.patientId}
                    className="flex items-center gap-3 p-3 rounded-lg border border-hairline bg-amber-soft/30"
                  >
                    <div className="w-10 h-10 rounded-full bg-amber/20 text-amber flex items-center justify-center font-bold text-sm">
                      {p.firstName[0]}
                      {p.lastName[0]}
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-navy">
                        {p.lastName.toUpperCase()} {p.firstName}
                      </div>
                      <div className="text-xs text-slate">
                        Dernière séance il y a <strong className="text-amber">{g.daysSince} jours</strong> · séance{" "}
                        {p.sessionsDone}/36
                      </div>
                      <div className="text-[11px] mt-1">
                        <span
                          className="px-1.5 py-0.5 rounded font-bold"
                          style={{ backgroundColor: risk.bg, color: risk.color }}
                        >
                          {risk.fr}
                        </span>
                      </div>
                    </div>
                    <button className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-bold bg-amber text-white hover:bg-amber/90">
                      <PhoneCall className="w-3 h-3" />
                      Démarcher
                    </button>
                  </div>
                );
              })}
            </CardBody>
          </Card>
        )}
      </div>

      {/* 2 autres colonnes : Ergo + Psy */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Interventions ergo nécessaires */}
        <Card>
          <CardHeader
            title="Interventions ergo à prévoir"
            subtitle="Patients du groupe nécessitant un point avec Fanny / Wivine"
          />
          <CardBody className="space-y-2">
            {needsErgo.map((p) => (
              <Link
                key={p.id}
                href={`/kine/${p.id}`}
                className="flex items-center gap-3 p-3 rounded-lg border border-hairline hover:border-clover transition"
              >
                <div className="w-9 h-9 rounded-md bg-clover-soft text-clover flex items-center justify-center">
                  <Briefcase className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <div className="font-bold text-navy text-sm">
                    {p.lastName.toUpperCase()} {p.firstName}
                  </div>
                  <div className="text-xs text-slate">{p.job}</div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate" />
              </Link>
            ))}
          </CardBody>
        </Card>

        {/* Sessions psy approchant */}
        <Card>
          <CardHeader title="Séances psy à venir" subtitle="Sessions Dr. Vossen planifiées" />
          <CardBody className="space-y-2">
            {upcomingPsy.length === 0 && (
              <div className="text-sm text-slate text-center py-4">
                Aucune séance psy planifiée prochainement
              </div>
            )}
            {upcomingPsy.map((s) => (
              <div key={s.id} className="flex items-start gap-3 p-3 rounded-lg border border-hairline">
                <div className="w-9 h-9 rounded-md bg-amber-soft text-amber flex items-center justify-center">
                  <Brain className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <div className="font-bold text-navy text-sm">
                    Séance {s.topic} ({s.lang.toUpperCase()})
                  </div>
                  <div className="text-xs text-slate">
                    {s.date && new Date(s.date).toLocaleString("fr-BE", {
                      weekday: "short",
                      day: "2-digit",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                  <div className="text-[11px] text-slate mt-1">
                    {s.patientIds.length} patient(s) · {s.groupSlot}
                  </div>
                </div>
              </div>
            ))}
            <Link
              href="/psy"
              className="block text-center text-xs text-cyan font-bold hover:underline pt-2"
            >
              Voir l&apos;agenda psy complet →
            </Link>
          </CardBody>
        </Card>
      </div>

      {/* Modal absence */}
      {modalPatient && (
        <AbsenceModal
          patient={modalPatient}
          onClose={() => setModalPatient(null)}
          onConfirm={(data) => handleAbsenceConfirm(modalPatient, data)}
        />
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-20 right-4 z-50 max-w-md rounded-lg bg-clover text-white shadow-lg p-3 animate-in slide-in-from-bottom-5">
          <div className="text-sm font-medium">{toast}</div>
        </div>
      )}
    </div>
  );
}

// ─── Sous-composants ─────────────────────────────────────────────

function DayKpi({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "navy" | "clover" | "amber" | "cyan" | "slate";
}) {
  const colors = {
    navy: "text-navy bg-navy-pale",
    clover: "text-clover bg-clover-soft",
    amber: "text-amber bg-amber-soft",
    cyan: "text-cyan-mid bg-cyan-soft",
    slate: "text-slate bg-slate-light",
  };
  return (
    <div className="rounded-lg border border-hairline bg-white p-3 text-center">
      <div className="text-[10px] uppercase tracking-wide text-slate font-bold">{label}</div>
      <div className={cn("text-2xl font-bold tabular-nums mt-1 inline-block px-2 rounded", colors[tone])}>
        {value}
      </div>
    </div>
  );
}

function PatientPresenceRow({
  patient,
  status,
  onPresent,
  onLate,
  onAbsent,
}: {
  patient: Patient;
  status: AttendanceStatus | undefined;
  onPresent: () => void;
  onLate: () => void;
  onAbsent: () => void;
}) {
  const summary = summarize(patient.id);
  const risk = RISK_META[summary.riskLevel];
  const progressPct = (patient.sessionsDone / 36) * 100;

  const isMarked = status !== undefined;
  const isPresent = status === "present" || status === "late";
  const isAbsent = status?.startsWith("no_show") || status?.startsWith("cancelled");

  return (
    <div
      className={cn(
        "flex items-center gap-3 p-3 rounded-lg border transition",
        isPresent && "border-clover bg-clover-soft/50",
        isAbsent && "border-amber bg-amber-soft/50",
        !isMarked && "border-hairline hover:border-navy-mid"
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          "w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm shrink-0",
          isPresent ? "bg-clover text-white" : isAbsent ? "bg-amber text-white" : "bg-navy text-white"
        )}
      >
        {patient.firstName[0]}
        {patient.lastName[0]}
      </div>

      {/* Identité + progression */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <Link
            href={`/kine/${patient.id}`}
            className="font-bold text-navy hover:text-cyan text-sm"
          >
            {patient.lastName.toUpperCase()} {patient.firstName}
          </Link>
          <span className="text-[10px] text-slate uppercase">{patient.lang}</span>
          {summary.riskLevel !== "ok" && (
            <span
              className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded"
              style={{ backgroundColor: risk.bg, color: risk.color }}
            >
              <AlertCircle className="w-2.5 h-2.5" />
              {risk.fr}
            </span>
          )}
        </div>
        <div className="text-xs text-slate mt-0.5">
          Séance <strong className="text-navy">{patient.sessionsDone}/36</strong>
          {summary.daysSinceLastSession != null && (
            <> · vue il y a {summary.daysSinceLastSession} j</>
          )}
          {summary.unjustifiedRecent > 0 && (
            <> · <span className="text-amber font-bold">{summary.unjustifiedRecent} absence(s) récente(s)</span></>
          )}
        </div>
        {/* Progress bar */}
        <div className="h-1 bg-slate-light rounded-full overflow-hidden mt-1.5">
          <div
            className="h-full bg-gradient-to-r from-cyan to-cyan-mid"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Status badge si déjà marqué */}
      {isMarked && status && (
        <Badge variant={isPresent ? "clover" : "amber"}>
          {isPresent ? "Présent" : "Absent"}
        </Badge>
      )}

      {/* Actions */}
      <div className="flex gap-1.5 shrink-0">
        <button
          onClick={onPresent}
          title="Marquer présent"
          className={cn(
            "w-9 h-9 rounded-md flex items-center justify-center transition",
            status === "present"
              ? "bg-clover text-white"
              : "bg-clover-soft text-clover hover:bg-clover hover:text-white"
          )}
        >
          <CheckCircle2 className="w-4 h-4" />
        </button>
        <button
          onClick={onLate}
          title="En retard"
          className={cn(
            "w-9 h-9 rounded-md flex items-center justify-center transition",
            status === "late"
              ? "bg-amber text-white"
              : "bg-slate-light text-slate hover:bg-amber hover:text-white"
          )}
        >
          <Clock className="w-4 h-4" />
        </button>
        <button
          onClick={onAbsent}
          title="Annulé / absent"
          className={cn(
            "w-9 h-9 rounded-md flex items-center justify-center transition",
            isAbsent
              ? "bg-accent text-white"
              : "bg-accent-soft text-accent hover:bg-accent hover:text-white"
          )}
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

function RiskBanner() {
  // On compte les patients en risque
  const atRisk = patients
    .map((p) => ({ p, summary: summarize(p.id) }))
    .filter((x) => x.summary.riskLevel === "exclusion_proposed" || x.summary.riskLevel === "exclusion_warning");

  if (atRisk.length === 0) return null;

  return (
    <Card className="border-l-4 border-l-accent bg-accent/5">
      <CardBody>
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-accent shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="font-bold text-navy">
              {atRisk.length} patient{atRisk.length > 1 ? "s" : ""} à discuter en réunion d&apos;équipe
            </div>
            <div className="text-sm text-slate mt-0.5">
              Absences répétées non justifiées détectées — proposer recadrage ou exclusion pour libérer les places.
            </div>
            <div className="mt-2 flex gap-1.5 flex-wrap">
              {atRisk.map(({ p, summary }) => {
                const risk = RISK_META[summary.riskLevel];
                return (
                  <Link
                    key={p.id}
                    href={`/kine/${p.id}`}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold"
                    style={{ backgroundColor: risk.bg, color: risk.color }}
                  >
                    {p.lastName.toUpperCase()} {p.firstName}
                    <span className="opacity-70">({summary.unjustifiedRecent} abs.)</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}

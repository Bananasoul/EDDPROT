"use client";

import { useMemo, useState } from "react";
import {
  Brain,
  Phone,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Users,
  ChevronRight,
  Clock,
  Send,
  Bell,
  MessageCircle,
  Languages,
  Plus,
} from "lucide-react";
import {
  patients,
  patientPsyStatus,
  psySessions,
  getPsyStatus,
  getPatient,
  type PsySession,
  type Patient,
} from "@/lib/mock-data";
import { useApp } from "@/lib/app-context";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { KPITile } from "@/components/KPITile";
import { cn } from "@/lib/utils";

const PSYCHOLOGUE = "Dr. Katrin Vossen";

type Tab = "todo_de" | "todo_fr" | "scheduled" | "history";

// Détermine quels patients doivent encore voir la psy
function patientsNeedingPsy(lang: "fr" | "de", topic: 1 | 2): Patient[] {
  return patients.filter((p) => {
    if (p.lang !== lang) return false;
    // En programme ou récemment commencé
    if (!["in_program", "t0_done", "scheduled"].includes(p.status)) return false;
    const status = getPsyStatus(p.id);
    if (!status) return true;
    if (topic === 1) return !status.psy1Done;
    return status.psy1Done && !status.psy2Done;
  });
}

// Groupe les patients par créneau (groupe horaire)
function groupBySlot(patientList: Patient[]): Record<string, Patient[]> {
  const slots: Record<string, Patient[]> = {};
  for (const p of patientList) {
    // Détermination simple : on regarde le prescripteur (suppose équipe)
    // Mar/Jeu 8-10 → équipe Philippe/Fanny groupe 1
    // Mer/Ven 8-10 → équipe Philippe/Fanny groupe 2
    // Mer/Ven 10-12 → équipe Philippe/Fanny groupe 3
    // Lun/Jeu 14:30-16:30 → équipe Jean-Luc/Wivine
    let slot = "Non assigné";
    if (p.id.endsWith("1") || p.id.endsWith("8")) slot = "Mar/Jeu 8h-10h";
    else if (p.id.endsWith("3") || p.id.endsWith("12") || p.id.endsWith("16")) slot = "Mer/Ven 8h-10h";
    else if (p.id.endsWith("9") || p.id.endsWith("14") || p.id.endsWith("15") || p.id.endsWith("17")) slot = "Mer/Ven 10h-12h";
    else slot = "Lun/Jeu 14h30-16h30";

    if (!slots[slot]) slots[slot] = [];
    slots[slot].push(p);
  }
  return slots;
}

export default function PsyPage() {
  const { lang } = useApp();
  const tr = (fr: string, de: string) => (lang === "de" ? de : fr);
  const [tab, setTab] = useState<Tab>("todo_de");
  const [notification, setNotification] = useState<string | null>(null);

  // KPI
  const totalActive = patients.filter((p) =>
    ["in_program", "t0_done", "scheduled"].includes(p.status)
  ).length;

  const psy1ToDo = patientPsyStatus.filter((s) => !s.psy1Done).length;
  const psy2ToDo = patientPsyStatus.filter((s) => s.psy1Done && !s.psy2Done).length;
  const completedBoth = patientPsyStatus.filter((s) => s.psy1Done && s.psy2Done).length;

  // Compteurs par langue
  const todoDe = useMemo(() => {
    const s1 = patientsNeedingPsy("de", 1);
    const s2 = patientsNeedingPsy("de", 2);
    return { s1, s2, total: s1.length + s2.length };
  }, []);
  const todoFr = useMemo(() => {
    const s1 = patientsNeedingPsy("fr", 1);
    const s2 = patientsNeedingPsy("fr", 2);
    return { s1, s2, total: s1.length + s2.length };
  }, []);

  const scheduledSessions = psySessions.filter((s) => s.status === "scheduled");
  const completedSessions = psySessions.filter((s) => s.status === "completed");

  const tabs: { key: Tab; label: string; badge?: number; icon: React.ReactNode }[] = [
    {
      key: "todo_de",
      label: tr("À planifier — DE", "Zu planen — DE"),
      badge: todoDe.total,
      icon: <Languages className="w-3.5 h-3.5" />,
    },
    {
      key: "todo_fr",
      label: tr("À planifier — FR", "Zu planen — FR"),
      badge: todoFr.total,
      icon: <Languages className="w-3.5 h-3.5" />,
    },
    {
      key: "scheduled",
      label: tr("Sessions planifiées", "Geplante Sitzungen"),
      badge: scheduledSessions.length,
      icon: <Calendar className="w-3.5 h-3.5" />,
    },
    {
      key: "history",
      label: tr("Historique", "Verlauf"),
      badge: completedSessions.length,
      icon: <CheckCircle2 className="w-3.5 h-3.5" />,
    },
  ];

  const showNotif = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
      {/* Header */}
      <header className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-amber-soft text-amber text-xs font-medium border border-amber/30 mb-2">
            <Brain className="w-3.5 h-3.5" />
            {tr("Interface psychologue", "Schnittstelle Psychologin")}
          </div>
          <h1 className="font-serif text-3xl text-navy">
            {PSYCHOLOGUE}
          </h1>
          <p className="text-slate text-sm mt-1">
            {tr(
              "Coordination des séances bio-psycho-sociales · 2 séances groupe par patient · sessions séparées FR/DE",
              "Koordination der bio-psycho-sozialen Sitzungen · 2 Gruppensitzungen pro Patient · getrennte FR/DE-Sitzungen"
            )}
          </p>
        </div>
      </header>

      {/* KPI */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KPITile
          label={tr("Patients actifs", "Aktive Patienten")}
          value={totalActive}
          sub={tr("en programme EDD", "im EDD-Programm")}
          tone="navy"
          icon={<Users className="w-5 h-5" />}
        />
        <KPITile
          label={tr("Séance 1 à faire", "Sitzung 1 ausstehend")}
          value={psy1ToDo}
          sub={tr("douleur bio-psycho-sociale", "Schmerz bio-psycho-sozial")}
          tone="amber"
          icon={<AlertCircle className="w-5 h-5" />}
        />
        <KPITile
          label={tr("Séance 2 à faire", "Sitzung 2 ausstehend")}
          value={psy2ToDo}
          sub={tr("stratégies coping", "Bewältigungsstrategien")}
          tone="amber"
          icon={<AlertCircle className="w-5 h-5" />}
        />
        <KPITile
          label={tr("Patients complets", "Abgeschlossen")}
          value={completedBoth}
          sub="2 / 2"
          tone="clover"
          icon={<CheckCircle2 className="w-5 h-5" />}
        />
      </section>

      {/* Notification toast */}
      {notification && (
        <div className="fixed bottom-20 right-4 z-50 max-w-sm rounded-lg bg-clover text-white shadow-lg p-4 animate-in slide-in-from-bottom-5">
          <div className="flex items-start gap-2">
            <Send className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="text-sm leading-relaxed">{notification}</div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 border-b border-hairline overflow-x-auto">
        {tabs.map((tb) => (
          <button
            key={tb.key}
            onClick={() => setTab(tb.key)}
            className={cn(
              "inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition whitespace-nowrap",
              tab === tb.key
                ? "border-navy text-navy"
                : "border-transparent text-slate hover:text-navy hover:border-hairline"
            )}
          >
            {tb.icon}
            {tb.label}
            {tb.badge != null && tb.badge > 0 && (
              <span
                className={cn(
                  "ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold tabular-nums",
                  tab === tb.key ? "bg-navy text-white" : "bg-amber-soft text-amber"
                )}
              >
                {tb.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      {(tab === "todo_de" || tab === "todo_fr") && (
        <PlanTab
          targetLang={tab === "todo_de" ? "de" : "fr"}
          topic1={tab === "todo_de" ? todoDe.s1 : todoFr.s1}
          topic2={tab === "todo_de" ? todoDe.s2 : todoFr.s2}
          onSchedule={(slot, patientList, topic, languageOfSession) =>
            showNotif(
              tr(
                `✅ Séance psy ${topic} (${languageOfSession.toUpperCase()}) proposée pour le créneau ${slot} avec ${patientList.length} patient(s). Notification envoyée à l'équipe (Ph. Banaszak, F. Jenniges) et SMS aux patients.`,
                `✅ Psy-Sitzung ${topic} (${languageOfSession.toUpperCase()}) für Slot ${slot} mit ${patientList.length} Patient(en) vorgeschlagen. Benachrichtigung an Team und SMS an Patienten gesendet.`
              )
            )
          }
        />
      )}
      {tab === "scheduled" && <ScheduledTab sessions={scheduledSessions} />}
      {tab === "history" && <HistoryTab sessions={completedSessions} />}
    </div>
  );
}

// ─── ONGLET PLANIFICATION ─────────────────────────────────────────
function PlanTab({
  targetLang,
  topic1,
  topic2,
  onSchedule,
}: {
  targetLang: "fr" | "de";
  topic1: Patient[];
  topic2: Patient[];
  onSchedule: (slot: string, patients: Patient[], topic: 1 | 2, lang: "fr" | "de") => void;
}) {
  const { lang } = useApp();
  const tr = (fr: string, de: string) => (lang === "de" ? de : fr);
  const groupedT1 = useMemo(() => groupBySlot(topic1), [topic1]);
  const groupedT2 = useMemo(() => groupBySlot(topic2), [topic2]);

  if (topic1.length === 0 && topic2.length === 0) {
    return (
      <Card>
        <CardBody>
          <div className="text-center py-8 text-slate">
            <CheckCircle2 className="w-12 h-12 text-clover mx-auto mb-2" />
            <div className="font-medium text-clover">
              {tr("Tous les patients sont à jour !", "Alle Patienten sind auf dem aktuellen Stand!")}
            </div>
            <div className="text-sm mt-1">
              {tr(
                `Aucune séance ${targetLang.toUpperCase()} à planifier pour le moment.`,
                `Keine ${targetLang.toUpperCase()}-Sitzungen aktuell zu planen.`
              )}
            </div>
          </div>
        </CardBody>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Topic 1 */}
      {topic1.length > 0 && (
        <TopicSection
          title={tr(
            `Séance n°1 — Modèle bio-psycho-social (${targetLang.toUpperCase()})`,
            `Sitzung Nr. 1 — Bio-psycho-soziales Modell (${targetLang.toUpperCase()})`
          )}
          subtitle={tr(
            "Présentation du modèle de la douleur, neurosciences, lien stress/sommeil/douleur",
            "Vorstellung des Schmerzmodells, Neurowissenschaften, Verbindung Stress/Schlaf/Schmerz"
          )}
          groups={groupedT1}
          onSchedule={(slot, ps) => onSchedule(slot, ps, 1, targetLang)}
        />
      )}

      {/* Topic 2 */}
      {topic2.length > 0 && (
        <TopicSection
          title={tr(
            `Séance n°2 — Stratégies de coping (${targetLang.toUpperCase()})`,
            `Sitzung Nr. 2 — Bewältigungsstrategien (${targetLang.toUpperCase()})`
          )}
          subtitle={tr(
            "Stratégies pratiques : relaxation, pacing, gestion des pensées catastrophiques",
            "Praktische Strategien: Entspannung, Pacing, Umgang mit katastrophisierenden Gedanken"
          )}
          groups={groupedT2}
          onSchedule={(slot, ps) => onSchedule(slot, ps, 2, targetLang)}
        />
      )}
    </div>
  );
}

function TopicSection({
  title,
  subtitle,
  groups,
  onSchedule,
}: {
  title: string;
  subtitle: string;
  groups: Record<string, Patient[]>;
  onSchedule: (slot: string, patients: Patient[]) => void;
}) {
  const { lang } = useApp();
  const tr = (fr: string, de: string) => (lang === "de" ? de : fr);
  const total = Object.values(groups).reduce((s, ps) => s + ps.length, 0);

  return (
    <Card>
      <CardHeader
        title={title}
        subtitle={`${subtitle} · ${total} ${tr("patient(s) à voir", "Patient(en) zu sehen")}`}
      />
      <CardBody className="space-y-3">
        {Object.entries(groups).map(([slot, ps]) => (
          <div
            key={slot}
            className="rounded-lg border border-hairline p-4 hover:border-navy-mid transition"
          >
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="w-4 h-4 text-navy" />
                  <div className="font-semibold text-navy">{slot}</div>
                  <Badge variant="navy">{ps.length}</Badge>
                </div>
                <div className="text-xs text-slate mb-2">
                  {tr(
                    "Patients déjà groupés sur ce créneau (suggestion : organiser la séance psy à ce moment-là)",
                    "Patienten bereits in diesem Zeitfenster (Vorschlag: Psy-Sitzung zur gleichen Zeit organisieren)"
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
                  {ps.map((p) => (
                    <PatientLine key={p.id} p={p} />
                  ))}
                </div>
              </div>
              <button
                onClick={() => onSchedule(slot, ps)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-navy text-white text-xs font-medium hover:bg-navy-mid shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                {tr("Planifier groupe", "Gruppe planen")}
              </button>
            </div>
          </div>
        ))}
      </CardBody>
    </Card>
  );
}

function PatientLine({ p }: { p: Patient }) {
  const { lang } = useApp();
  const tr = (fr: string, de: string) => (lang === "de" ? de : fr);
  const status = getPsyStatus(p.id);
  const externalNote = status?.psyExternal;

  return (
    <div className="flex items-center gap-2 text-sm p-2 rounded bg-slate-light/30">
      <div className="w-7 h-7 rounded-full bg-navy text-white flex items-center justify-center text-[10px] font-bold shrink-0">
        {p.firstName[0]}
        {p.lastName[0]}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-medium text-navy truncate">
          {p.lastName.toUpperCase()} {p.firstName}
        </div>
        <div className="text-[11px] text-slate flex items-center gap-1.5 flex-wrap">
          <span className="inline-flex items-center gap-0.5">
            <Phone className="w-2.5 h-2.5" />
            {/* Numéro fictif basé sur ID */}
            +32 4{p.id.slice(2).padEnd(2, "0")} {Math.floor(100 + Math.random() * 899)}{" "}
            {Math.floor(100 + Math.random() * 899).toString().slice(0, 3)}
          </span>
          {externalNote && (
            <span className="inline-flex items-center gap-0.5 text-amber" title={externalNote}>
              <AlertCircle className="w-2.5 h-2.5" />
              {tr("suivi parallèle", "parallele Nachsorge")}
            </span>
          )}
        </div>
      </div>
      <a
        href={`/kine/${p.id}`}
        className="text-[11px] text-navy hover:underline shrink-0"
        onClick={(e) => e.stopPropagation()}
      >
        {tr("dossier", "Akte")} →
      </a>
    </div>
  );
}

// ─── ONGLET SESSIONS PLANIFIÉES ───────────────────────────────────
function ScheduledTab({ sessions }: { sessions: PsySession[] }) {
  const { lang } = useApp();
  const tr = (fr: string, de: string) => (lang === "de" ? de : fr);
  if (sessions.length === 0) {
    return (
      <Card>
        <CardBody>
          <div className="text-sm text-slate text-center py-4">
            {tr("Aucune session planifiée.", "Keine geplanten Sitzungen.")}
          </div>
        </CardBody>
      </Card>
    );
  }
  return (
    <div className="space-y-3">
      {sessions.map((s) => (
        <Card key={s.id}>
          <CardBody>
            <SessionRow session={s} />
          </CardBody>
        </Card>
      ))}
    </div>
  );
}

// ─── ONGLET HISTORIQUE ────────────────────────────────────────────
function HistoryTab({ sessions }: { sessions: PsySession[] }) {
  const { lang } = useApp();
  const tr = (fr: string, de: string) => (lang === "de" ? de : fr);
  if (sessions.length === 0) {
    return (
      <Card>
        <CardBody>
          <div className="text-sm text-slate text-center py-4">
            {tr("Aucune session dans l'historique.", "Keine Sitzungen im Verlauf.")}
          </div>
        </CardBody>
      </Card>
    );
  }
  return (
    <div className="space-y-3">
      {sessions.map((s) => (
        <Card key={s.id}>
          <CardBody>
            <SessionRow session={s} />
          </CardBody>
        </Card>
      ))}
    </div>
  );
}

function SessionRow({ session }: { session: PsySession }) {
  const { lang } = useApp();
  const tr = (fr: string, de: string) => (lang === "de" ? de : fr);
  const isCompleted = session.status === "completed";
  return (
    <div className="flex items-start gap-4">
      <div
        className={cn(
          "w-12 h-12 rounded-lg flex flex-col items-center justify-center shrink-0",
          isCompleted ? "bg-clover-soft text-clover" : "bg-navy-pale text-navy"
        )}
      >
        {session.date ? (
          <>
            <span className="text-[9px] uppercase">
              {new Date(session.date).toLocaleDateString(lang === "de" ? "de-DE" : "fr-BE", {
                month: "short",
              })}
            </span>
            <span className="text-base font-bold leading-none">
              {new Date(session.date).getDate()}
            </span>
          </>
        ) : (
          <Clock className="w-5 h-5" />
        )}
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="font-medium text-navy">
            {tr("Séance", "Sitzung")} n°{session.topic} —{" "}
            {session.topic === 1
              ? tr("Modèle bio-psycho-social", "Bio-psycho-soziales Modell")
              : tr("Stratégies coping", "Bewältigungsstrategien")}
          </div>
          <Badge variant={session.lang === "de" ? "amber" : "navy"}>
            {session.lang.toUpperCase()}
          </Badge>
          {session.groupSlot && (
            <span className="text-xs text-slate">· {session.groupSlot}</span>
          )}
          {isCompleted && (
            <Badge variant="clover">
              <CheckCircle2 className="w-3 h-3 mr-0.5" />
              {tr("Réalisée", "Durchgeführt")}
            </Badge>
          )}
        </div>
        {session.date && (
          <div className="text-xs text-slate mt-0.5">
            {new Date(session.date).toLocaleString(lang === "de" ? "de-DE" : "fr-BE", {
              weekday: "long",
              day: "2-digit",
              month: "long",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        )}
        <div className="mt-2 flex flex-wrap gap-1.5">
          {session.patientIds.map((pid) => {
            const p = getPatient(pid);
            return (
              <a
                key={pid}
                href={`/kine/${pid}`}
                className="text-xs px-2 py-1 rounded bg-slate-light hover:bg-navy-pale text-navy"
              >
                {p?.lastName.toUpperCase()} {p?.firstName}
              </a>
            );
          })}
        </div>
        {session.notes && (
          <div className="text-xs italic text-slate mt-2">💬 {session.notes}</div>
        )}
      </div>
    </div>
  );
}

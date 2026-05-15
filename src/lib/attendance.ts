/**
 * Suivi de présence École du Dos HSNE
 *
 * Gère :
 * - L'historique des présences/absences/annulations par patient
 * - Les motifs d'absence (maladie / vacances / oubli / autre)
 * - La détection automatique des patients à risque d'exclusion
 *   (≥ 3 absences non justifiées sur les 6 dernières séances)
 * - Le calcul du « délai depuis dernière séance » pour relance
 *
 * La règle d'exclusion finale reste à l'appréciation de l'équipe
 * (Q2 réponse Philippe : « pas de règle stricte, équipe décide »).
 */

export type AttendanceStatus =
  | "present"               // venu, séance réalisée
  | "late"                  // venu en retard
  | "cancelled_advance"     // annulé > 24h avant (motif valide)
  | "cancelled_late"        // annulé < 24h avant
  | "no_show_excused"       // pas venu mais excusé après coup
  | "no_show_unexcused";    // pas venu, pas de nouvelles

export const STATUS_META: Record<
  AttendanceStatus,
  { fr: string; de: string; color: string; bg: string; severity: number }
> = {
  present: { fr: "Présent", de: "Anwesend", color: "#1A6B45", bg: "#EDF7F2", severity: 0 },
  late: { fr: "En retard", de: "Verspätet", color: "#D35400", bg: "#FEF3E8", severity: 1 },
  cancelled_advance: { fr: "Annulé > 24h", de: "Abgesagt > 24h", color: "#64748B", bg: "#F1F5F9", severity: 1 },
  cancelled_late: { fr: "Annulé < 24h", de: "Abgesagt < 24h", color: "#D35400", bg: "#FEF3E8", severity: 2 },
  no_show_excused: { fr: "Absent excusé", de: "Entschuldigt", color: "#64748B", bg: "#F1F5F9", severity: 2 },
  no_show_unexcused: { fr: "Absent non excusé", de: "Unentschuldigt", color: "#C0392B", bg: "#FDECEA", severity: 3 },
};

export type AbsenceReason =
  | "illness"
  | "vacation"
  | "appointment_conflict"
  | "transport"
  | "forgot"
  | "unreached"
  | "other";

export const ABSENCE_REASONS: Record<
  AbsenceReason,
  { fr: string; de: string; severity: number }
> = {
  illness: { fr: "Maladie / état de santé", de: "Krankheit / Gesundheitszustand", severity: 0 },
  vacation: { fr: "Congé / vacances", de: "Urlaub / Ferien", severity: 0 },
  appointment_conflict: { fr: "Autre rendez-vous médical", de: "Anderer Arzttermin", severity: 0 },
  transport: { fr: "Problème de transport", de: "Transportproblem", severity: 1 },
  forgot: { fr: "A oublié", de: "Vergessen", severity: 2 },
  unreached: { fr: "Non joignable", de: "Nicht erreichbar", severity: 3 },
  other: { fr: "Autre raison", de: "Anderer Grund", severity: 1 },
};

export type AttendanceRecord = {
  id: string;
  patientId: string;
  date: string; // ISO datetime
  sessionNumber?: number; // n°/36 si réalisée
  status: AttendanceStatus;
  reason?: AbsenceReason;
  reasonNote?: string;
  reportedBy?: string; // ID staff
  followupSent?: boolean;
  followupSentAt?: string;
};

// ─── Mock historique présence ────────────────────────────────────
// Génère un historique réaliste pour les patients en programme.
// Logique : la majorité présents, avec quelques absences variées
// pour rendre le dashboard intéressant.

const today = new Date("2026-05-15");
const daysAgo = (n: number) => {
  const d = new Date(today);
  d.setDate(d.getDate() - n);
  return d.toISOString();
};

export const ATTENDANCE: AttendanceRecord[] = [
  // ── p001 Schmitz (en programme, séance 22) — bonne assiduité
  { id: "att-1", patientId: "p001", date: daysAgo(2), sessionNumber: 22, status: "present" },
  { id: "att-2", patientId: "p001", date: daysAgo(5), sessionNumber: 21, status: "present" },
  { id: "att-3", patientId: "p001", date: daysAgo(8), sessionNumber: 20, status: "late" },
  { id: "att-4", patientId: "p001", date: daysAgo(12), sessionNumber: 19, status: "present" },

  // ── p002 Delcour — excellent
  { id: "att-5", patientId: "p002", date: daysAgo(3), sessionNumber: 34, status: "present" },
  { id: "att-6", patientId: "p002", date: daysAgo(6), sessionNumber: 33, status: "present" },

  // ── p008 Brandt jeune Maurer — un cancellation < 24h
  { id: "att-7", patientId: "p008", date: daysAgo(2), sessionNumber: 12, status: "present" },
  { id: "att-8", patientId: "p008", date: daysAgo(7), sessionNumber: 11, status: "cancelled_late", reason: "appointment_conflict", reasonNote: "Convocation chantier urgent" },
  { id: "att-9", patientId: "p008", date: daysAgo(9), sessionNumber: 10, status: "present" },

  // ── p009 Lambert (fibromyalgie) — assidue
  { id: "att-10", patientId: "p009", date: daysAgo(1), sessionNumber: 18, status: "present" },
  { id: "att-11", patientId: "p009", date: daysAgo(4), sessionNumber: 17, status: "late" },

  // ── p010 Vandenberg — cas problématique (3 absences récentes)
  { id: "att-12", patientId: "p010", date: daysAgo(1), sessionNumber: 8, status: "no_show_unexcused" },
  { id: "att-13", patientId: "p010", date: daysAgo(5), sessionNumber: 7, status: "no_show_unexcused", followupSent: true, followupSentAt: daysAgo(4) },
  { id: "att-14", patientId: "p010", date: daysAgo(9), sessionNumber: 7, status: "cancelled_late", reason: "forgot", reasonNote: "Téléphoné après-midi" },
  { id: "att-15", patientId: "p010", date: daysAgo(12), sessionNumber: 6, status: "present" },

  // ── p011 Müller 78 ans — assiduité parfaite
  { id: "att-16", patientId: "p011", date: daysAgo(2), sessionNumber: 16, status: "present" },
  { id: "att-17", patientId: "p011", date: daysAgo(5), sessionNumber: 15, status: "present" },

  // ── p014 Dethier (burn-out) — variable
  { id: "att-18", patientId: "p014", date: daysAgo(3), sessionNumber: 14, status: "present" },
  { id: "att-19", patientId: "p014", date: daysAgo(7), sessionNumber: 13, status: "no_show_excused", reason: "illness", reasonNote: "Crise d'angoisse, suivi par psy" },
  { id: "att-20", patientId: "p014", date: daysAgo(10), sessionNumber: 13, status: "present" },

  // ── p015 Ricci post-partum — annulations justifiées (bébé malade)
  { id: "att-21", patientId: "p015", date: daysAgo(2), sessionNumber: 10, status: "present" },
  { id: "att-22", patientId: "p015", date: daysAgo(6), sessionNumber: 9, status: "cancelled_advance", reason: "illness", reasonNote: "Bébé fiévreux" },
  { id: "att-23", patientId: "p015", date: daysAgo(9), sessionNumber: 9, status: "present" },

  // ── p016 Weber (ado scoliose) — mère prévient toujours
  { id: "att-24", patientId: "p016", date: daysAgo(3), sessionNumber: 6, status: "present" },
  { id: "att-25", patientId: "p016", date: daysAgo(7), sessionNumber: 5, status: "cancelled_advance", reason: "appointment_conflict", reasonNote: "Contrôle orthopédiste" },

  // ── p017 Gillet télétravail — souvent en retard
  { id: "att-26", patientId: "p017", date: daysAgo(2), sessionNumber: 3, status: "late", reasonNote: "Réunion qui s'éternisait" },
  { id: "att-27", patientId: "p017", date: daysAgo(5), sessionNumber: 2, status: "late" },

  // ── p020 Joris récidive — assidu
  { id: "att-28", patientId: "p020", date: daysAgo(1), sessionNumber: 5, status: "present" },
];

// ─── Helpers de calcul ────────────────────────────────────────────
export function attendanceForPatient(patientId: string): AttendanceRecord[] {
  return ATTENDANCE.filter((a) => a.patientId === patientId).sort(
    (a, b) => +new Date(b.date) - +new Date(a.date)
  );
}

export type AttendanceSummary = {
  totalSessions: number;
  presentCount: number;
  lateCount: number;
  cancelledCount: number;
  noShowExcused: number;
  noShowUnexcused: number;
  // Indicateur de risque d'exclusion (KCE)
  unjustifiedRecent: number; // sur les 6 derniers RDV
  riskLevel: "ok" | "vigilance" | "exclusion_warning" | "exclusion_proposed";
  daysSinceLastSession: number | null;
  lastSessionDate: string | null;
  needsFollowup: boolean;
};

export function summarize(patientId: string): AttendanceSummary {
  const records = attendanceForPatient(patientId);
  const presentCount = records.filter((r) => r.status === "present").length;
  const lateCount = records.filter((r) => r.status === "late").length;
  const cancelledCount = records.filter(
    (r) => r.status === "cancelled_advance" || r.status === "cancelled_late"
  ).length;
  const noShowExcused = records.filter((r) => r.status === "no_show_excused").length;
  const noShowUnexcused = records.filter((r) => r.status === "no_show_unexcused").length;

  // Sur les 6 derniers RDV (présents + absents)
  const recent6 = records.slice(0, 6);
  const unjustifiedRecent = recent6.filter(
    (r) => r.status === "no_show_unexcused" || r.status === "cancelled_late"
  ).length;

  // Risk level
  let riskLevel: AttendanceSummary["riskLevel"] = "ok";
  if (unjustifiedRecent === 1) riskLevel = "vigilance";
  else if (unjustifiedRecent === 2) riskLevel = "exclusion_warning";
  else if (unjustifiedRecent >= 3) riskLevel = "exclusion_proposed";

  // Délai depuis dernière séance présente
  const lastPresent = records.find((r) => r.status === "present" || r.status === "late");
  const daysSinceLastSession = lastPresent
    ? Math.floor((today.getTime() - new Date(lastPresent.date).getTime()) / (24 * 3600 * 1000))
    : null;

  // Follow-up nécessaire si dernière absence pas excusée et pas de relance envoyée
  const lastAbsent = records.find((r) => r.status === "no_show_unexcused");
  const needsFollowup = lastAbsent !== undefined && !lastAbsent.followupSent;

  return {
    totalSessions: records.length,
    presentCount,
    lateCount,
    cancelledCount,
    noShowExcused,
    noShowUnexcused,
    unjustifiedRecent,
    riskLevel,
    daysSinceLastSession,
    lastSessionDate: lastPresent?.date ?? null,
    needsFollowup,
  };
}

export const RISK_META: Record<
  AttendanceSummary["riskLevel"],
  { fr: string; de: string; color: string; bg: string }
> = {
  ok: { fr: "Assiduité OK", de: "Anwesenheit OK", color: "#1A6B45", bg: "#EDF7F2" },
  vigilance: { fr: "Vigilance", de: "Wachsamkeit", color: "#D35400", bg: "#FEF3E8" },
  exclusion_warning: { fr: "Recadrage à prévoir", de: "Gespräch geplant", color: "#D35400", bg: "#FEF3E8" },
  exclusion_proposed: { fr: "Exclusion à discuter en équipe", de: "Ausschluss zu besprechen", color: "#C0392B", bg: "#FDECEA" },
};

// ─── Patients « fantômes » : pas vus depuis trop longtemps ──────
export function ghostPatients(thresholdDays = 14): { patientId: string; daysSince: number }[] {
  // Utilisé par la vue « pas vu depuis longtemps »
  const map: Record<string, AttendanceSummary> = {};
  // On ne renvoie que les patients ayant un historique
  const patientIds = Array.from(new Set(ATTENDANCE.map((a) => a.patientId)));
  return patientIds
    .map((pid) => ({ patientId: pid, summary: (map[pid] = summarize(pid)) }))
    .filter((x) => x.summary.daysSinceLastSession !== null && x.summary.daysSinceLastSession >= thresholdDays)
    .map((x) => ({ patientId: x.patientId, daysSince: x.summary.daysSinceLastSession! }))
    .sort((a, b) => b.daysSince - a.daysSince);
}

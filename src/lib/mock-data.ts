export type PatientStatus =
  | "prescribed"
  | "contacted"
  | "scheduled"
  | "t0_done"
  | "in_program"
  | "t1_due"
  | "completed";

export type Scores = {
  pain_rest: number;
  pain_activity: number;
  had_a: number;
  had_d: number;
  odi: number; // 0..100 %
  tsk: number; // 17..68
  start: number; // 0..9
  wkg: number;
};

export type Patient = {
  id: string;
  firstName: string;
  lastName: string;
  dob: string;
  gender: "F" | "M";
  lang: "fr" | "de";
  job: string;
  prescriber: string;
  mutual: string;
  status: PatientStatus;
  sessionsDone: number;
  t0Date: string | null;
  t1Date: string | null;
  scoresT0: Scores | null;
  scoresT1: Scores | null;
  yellowFlags: string[];
  redFlags: string[];
  goals: string[];
  nextAppointment: string | null;
  complaint: string;
  hypothesis: string;
  // monthly pain trend across 36 sessions (sparse)
  painTrend: { session: number; pain: number }[];
};

const trend = (start: number, end: number, n = 8) => {
  const arr: { session: number; pain: number }[] = [];
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1);
    const noise = (Math.sin(i * 1.3) + Math.cos(i * 0.7)) * 0.4;
    const v = Math.max(0, Math.min(10, start + (end - start) * t + noise));
    arr.push({ session: Math.round((i * 35) / (n - 1)) + 1, pain: +v.toFixed(1) });
  }
  return arr;
};

export const patients: Patient[] = [
  {
    id: "p001",
    firstName: "Margarethe",
    lastName: "Schmitz",
    dob: "1968-03-14",
    gender: "F",
    lang: "de",
    job: "Verkäuferin (Einzelhandel)",
    prescriber: "Dr. H. Kaufmann",
    mutual: "Christliche Krankenkasse",
    status: "in_program",
    sessionsDone: 22,
    t0Date: "2026-02-03",
    t1Date: null,
    scoresT0: {
      pain_rest: 4,
      pain_activity: 7,
      had_a: 11,
      had_d: 8,
      odi: 42,
      tsk: 44,
      start: 6,
      wkg: 1.1,
    },
    scoresT1: null,
    yellowFlags: ["Catastrophisation", "Évitement activité", "Faible support social"],
    redFlags: [],
    goals: [
      "Reprendre le travail à temps plein",
      "Jardiner sans douleur",
      "Porter ses petits-enfants",
    ],
    nextAppointment: "2026-04-22 14:30",
    complaint: "Lombalgie chronique L4-L5, irradiation fesse gauche, 14 mois",
    hypothesis: "Nociceptive avec composante centrale, kinésiophobie marquée",
    painTrend: trend(7, 3.5),
  },
  {
    id: "p002",
    firstName: "Jean-Marc",
    lastName: "Delcour",
    dob: "1975-11-02",
    gender: "M",
    lang: "fr",
    job: "Chauffeur poids lourd",
    prescriber: "Dr. S. Henrot",
    mutual: "Mutualité Socialiste",
    status: "t1_due",
    sessionsDone: 34,
    t0Date: "2026-01-12",
    t1Date: "2026-04-25",
    scoresT0: {
      pain_rest: 5,
      pain_activity: 8,
      had_a: 9,
      had_d: 6,
      odi: 48,
      tsk: 42,
      start: 7,
      wkg: 1.3,
    },
    scoresT1: {
      pain_rest: 2,
      pain_activity: 3,
      had_a: 5,
      had_d: 3,
      odi: 22,
      tsk: 28,
      start: 3,
      wkg: 2.1,
    },
    yellowFlags: ["Kinésiophobie", "Inquiétude reprise professionnelle"],
    redFlags: [],
    goals: [
      "Reprendre le volant sans douleur",
      "Tenir 8h de conduite",
      "Faire du vélo le week-end",
    ],
    nextAppointment: "2026-04-25 10:00",
    complaint: "Lombalgie post-effort, début brutal port de charge",
    hypothesis: "Mécanique nociceptive, excellente évolution T0→T1",
    painTrend: trend(8, 2),
  },
  {
    id: "p003",
    firstName: "Anneliese",
    lastName: "Vossen",
    dob: "1959-06-22",
    gender: "F",
    lang: "de",
    job: "Rentnerin (ehem. Krankenschwester)",
    prescriber: "Dr. H. Kaufmann",
    mutual: "Freie Krankenkasse",
    status: "t0_done",
    sessionsDone: 4,
    t0Date: "2026-04-08",
    t1Date: null,
    scoresT0: {
      pain_rest: 6,
      pain_activity: 8,
      had_a: 14,
      had_d: 12,
      odi: 58,
      tsk: 48,
      start: 8,
      wkg: 0.9,
    },
    scoresT1: null,
    yellowFlags: ["Dépression", "Isolement", "Somatisation", "Faible self-efficacy"],
    redFlags: ["Perte de poids involontaire → à surveiller"],
    goals: ["Sortir faire les courses seule", "Dormir sans douleur nocturne"],
    nextAppointment: "2026-04-21 09:00",
    complaint: "Lombalgie chronique diffuse, contexte deuil récent",
    hypothesis: "Composante centrale prédominante, yellow flags marqués",
    painTrend: trend(7.5, 6.8, 4),
  },
  {
    id: "p004",
    firstName: "Patrick",
    lastName: "Meessen",
    dob: "1982-09-08",
    gender: "M",
    lang: "fr",
    job: "Ouvrier construction",
    prescriber: "Dr. M. Lejeune",
    mutual: "Mutualité Chrétienne",
    status: "scheduled",
    sessionsDone: 0,
    t0Date: "2026-04-24",
    t1Date: null,
    scoresT0: null,
    scoresT1: null,
    yellowFlags: [],
    redFlags: [],
    goals: [],
    nextAppointment: "2026-04-24 11:00",
    complaint: "Hernie discale L5-S1 opérée il y a 6 mois, douleur résiduelle",
    hypothesis: "À évaluer lors T0",
    painTrend: [],
  },
  {
    id: "p005",
    firstName: "Renate",
    lastName: "Hilgers",
    dob: "1971-02-17",
    gender: "F",
    lang: "de",
    job: "Bürokauffrau",
    prescriber: "Dr. S. Henrot",
    mutual: "Christliche Krankenkasse",
    status: "completed",
    sessionsDone: 36,
    t0Date: "2025-10-14",
    t1Date: "2026-03-05",
    scoresT0: {
      pain_rest: 3,
      pain_activity: 6,
      had_a: 8,
      had_d: 5,
      odi: 36,
      tsk: 38,
      start: 5,
      wkg: 1.4,
    },
    scoresT1: {
      pain_rest: 1,
      pain_activity: 2,
      had_a: 4,
      had_d: 2,
      odi: 14,
      tsk: 24,
      start: 2,
      wkg: 2.4,
    },
    yellowFlags: ["Stress professionnel (résolu)"],
    redFlags: [],
    goals: [
      "Travailler 8h devant l'écran",
      "Reprendre la natation",
    ],
    nextAppointment: null,
    complaint: "Lombalgie posturale, travail sédentaire prolongé",
    hypothesis: "Excellente récupération, objectifs atteints",
    painTrend: trend(6, 1.5),
  },
  {
    id: "p006",
    firstName: "Giovanni",
    lastName: "Esposito",
    dob: "1989-12-03",
    gender: "M",
    lang: "fr",
    job: "Cuisinier",
    prescriber: "Dr. M. Lejeune",
    mutual: "Partenamut",
    status: "contacted",
    sessionsDone: 0,
    t0Date: null,
    t1Date: null,
    scoresT0: null,
    scoresT1: null,
    yellowFlags: [],
    redFlags: [],
    goals: [],
    nextAppointment: null,
    complaint: "Lombalgie station debout prolongée",
    hypothesis: "À évaluer lors T0",
    painTrend: [],
  },
  {
    id: "p007",
    firstName: "Brigitte",
    lastName: "Kohlmann",
    dob: "1964-07-29",
    gender: "F",
    lang: "de",
    job: "Lehrerin",
    prescriber: "Dr. H. Kaufmann",
    mutual: "Freie Krankenkasse",
    status: "prescribed",
    sessionsDone: 0,
    t0Date: null,
    t1Date: null,
    scoresT0: null,
    scoresT1: null,
    yellowFlags: [],
    redFlags: [],
    goals: [],
    nextAppointment: null,
    complaint: "Lombalgie chronique mal systématisée",
    hypothesis: "À évaluer",
    painTrend: [],
  },
];

export const getPatient = (id: string) => patients.find((p) => p.id === id);

export const kpis = (list: Patient[] = patients) => {
  const active = list.filter((p) => ["in_program", "t0_done"].includes(p.status)).length;
  const t0Pending = list.filter((p) => ["prescribed", "contacted", "scheduled"].includes(p.status)).length;
  const t1Pending = list.filter((p) => p.status === "t1_due").length;
  const withBoth = list.filter((p) => p.scoresT0 && p.scoresT1);
  const avgDrop =
    withBoth.length === 0
      ? 0
      : withBoth.reduce((s, p) => s + (p.scoresT0!.pain_activity - p.scoresT1!.pain_activity), 0) /
        withBoth.length;
  return {
    active,
    t0Pending,
    t1Pending,
    avgDrop: +avgDrop.toFixed(1),
    satisfaction: 87, // PGIC moyen (mock)
  };
};

// ─── Agenda (secrétariat) ────────────────────────────────────────
export type Appointment = {
  id: string;
  patientId: string;
  dateTime: string;
  type: "T0" | "T1" | "séance" | "consult_physio";
  staff: string;
  room: string;
  status: "confirmed" | "pending" | "cancelled";
};

export const appointments: Appointment[] = [
  { id: "a1", patientId: "p001", dateTime: "2026-04-22T14:30:00", type: "séance", staff: "Ph. Banaszak", room: "Kiné 2", status: "confirmed" },
  { id: "a2", patientId: "p002", dateTime: "2026-04-25T10:00:00", type: "T1", staff: "Ph. Banaszak", room: "Kiné 2", status: "confirmed" },
  { id: "a3", patientId: "p003", dateTime: "2026-04-21T09:00:00", type: "séance", staff: "Ph. Banaszak", room: "Kiné 2", status: "confirmed" },
  { id: "a4", patientId: "p004", dateTime: "2026-04-24T11:00:00", type: "T0", staff: "Ph. Banaszak", room: "Kiné 2", status: "confirmed" },
  { id: "a5", patientId: "p001", dateTime: "2026-04-28T14:30:00", type: "séance", staff: "Ph. Banaszak", room: "Kiné 2", status: "pending" },
  { id: "a6", patientId: "p006", dateTime: "2026-04-29T15:00:00", type: "T0", staff: "Ph. Banaszak", room: "Kiné 2", status: "pending" },
  { id: "a7", patientId: "p002", dateTime: "2026-05-02T16:00:00", type: "consult_physio", staff: "Dr. S. Henrot", room: "Consult. 3", status: "confirmed" },
];

// ─── Facturation INAMI (mock codes nomenclature) ───────────────────
export type Billing = {
  patientId: string;
  code: string;
  label: string;
  amount: number;
  sessionsBilled: number;
  sessionsRemaining: number;
  nextBillingDate: string | null;
  status: "à facturer" | "envoyée" | "payée" | "en attente mutuelle";
};

export const billings: Billing[] = [
  { patientId: "p001", code: "563011", label: "École du Dos — séances 19-24", amount: 158.4, sessionsBilled: 18, sessionsRemaining: 14, nextBillingDate: "2026-04-30", status: "à facturer" },
  { patientId: "p002", code: "563011", label: "École du Dos — séances 31-36 (clôture)", amount: 158.4, sessionsBilled: 30, sessionsRemaining: 2, nextBillingDate: "2026-04-26", status: "à facturer" },
  { patientId: "p003", code: "563011", label: "École du Dos — séances 1-6", amount: 158.4, sessionsBilled: 0, sessionsRemaining: 32, nextBillingDate: "2026-05-05", status: "en attente mutuelle" },
  { patientId: "p005", code: "563011", label: "École du Dos — séances 31-36 (clôture)", amount: 158.4, sessionsBilled: 36, sessionsRemaining: 0, nextBillingDate: null, status: "payée" },
];

// ─── Demandes mutuelle ────────────────────────────────────────────
export type MutualRequest = {
  patientId: string;
  mutual: string;
  requestDate: string;
  status: "à envoyer" | "envoyée" | "acceptée" | "refusée" | "relance requise";
  note?: string;
};

export const mutualRequests: MutualRequest[] = [
  { patientId: "p003", mutual: "Freie Krankenkasse", requestDate: "2026-04-10", status: "relance requise", note: "Pas de retour depuis 9 jours" },
  { patientId: "p004", mutual: "Mutualité Chrétienne", requestDate: "2026-04-15", status: "envoyée" },
  { patientId: "p006", mutual: "Partenamut", requestDate: "", status: "à envoyer" },
  { patientId: "p007", mutual: "Freie Krankenkasse", requestDate: "", status: "à envoyer" },
];

// ─── ODI par items (ergothérapie) ─────────────────────────────────
// Oswestry Disability Index — 10 sections, score 0-5 chacune
export type OdiItem = { key: string; label: string; t0: number; t1: number | null };

export const odiItemsByPatient: Record<string, OdiItem[]> = {
  p001: [
    { key: "pain", label: "Intensité de la douleur", t0: 3, t1: null },
    { key: "self_care", label: "Soins personnels", t0: 2, t1: null },
    { key: "lifting", label: "Soulever des objets", t0: 4, t1: null },
    { key: "walking", label: "Marcher", t0: 2, t1: null },
    { key: "sitting", label: "Rester assis", t0: 3, t1: null },
    { key: "standing", label: "Rester debout", t0: 4, t1: null },
    { key: "sleeping", label: "Dormir", t0: 3, t1: null },
    { key: "sex", label: "Vie sexuelle", t0: 2, t1: null },
    { key: "social", label: "Vie sociale", t0: 2, t1: null },
    { key: "travel", label: "Voyages / déplacements", t0: 3, t1: null },
  ],
  p002: [
    { key: "pain", label: "Intensité de la douleur", t0: 4, t1: 1 },
    { key: "self_care", label: "Soins personnels", t0: 2, t1: 1 },
    { key: "lifting", label: "Soulever des objets", t0: 5, t1: 2 },
    { key: "walking", label: "Marcher", t0: 3, t1: 1 },
    { key: "sitting", label: "Rester assis", t0: 5, t1: 2 },
    { key: "standing", label: "Rester debout", t0: 4, t1: 2 },
    { key: "sleeping", label: "Dormir", t0: 3, t1: 1 },
    { key: "sex", label: "Vie sexuelle", t0: 2, t1: 1 },
    { key: "social", label: "Vie sociale", t0: 2, t1: 1 },
    { key: "travel", label: "Voyages / déplacements", t0: 5, t1: 2 },
  ],
  p003: [
    { key: "pain", label: "Intensité de la douleur", t0: 4, t1: null },
    { key: "self_care", label: "Soins personnels", t0: 3, t1: null },
    { key: "lifting", label: "Soulever des objets", t0: 4, t1: null },
    { key: "walking", label: "Marcher", t0: 3, t1: null },
    { key: "sitting", label: "Rester assis", t0: 3, t1: null },
    { key: "standing", label: "Rester debout", t0: 4, t1: null },
    { key: "sleeping", label: "Dormir", t0: 4, t1: null },
    { key: "sex", label: "Vie sexuelle", t0: 3, t1: null },
    { key: "social", label: "Vie sociale", t0: 4, t1: null },
    { key: "travel", label: "Voyages / déplacements", t0: 3, t1: null },
  ],
  p005: [
    { key: "pain", label: "Intensité de la douleur", t0: 3, t1: 1 },
    { key: "self_care", label: "Soins personnels", t0: 2, t1: 0 },
    { key: "lifting", label: "Soulever des objets", t0: 3, t1: 1 },
    { key: "walking", label: "Marcher", t0: 2, t1: 0 },
    { key: "sitting", label: "Rester assis", t0: 5, t1: 2 },
    { key: "standing", label: "Rester debout", t0: 4, t1: 2 },
    { key: "sleeping", label: "Dormir", t0: 3, t1: 1 },
    { key: "sex", label: "Vie sexuelle", t0: 1, t1: 0 },
    { key: "social", label: "Vie sociale", t0: 2, t1: 0 },
    { key: "travel", label: "Voyages / déplacements", t0: 3, t1: 1 },
  ],
};

// ─── Poste de travail (ergo) ──────────────────────────────────────
export type WorkstationAssessment = {
  patientId: string;
  jobDesc: string;
  mainRisks: string[];
  adaptations: { label: string; status: "proposé" | "en cours" | "validé" }[];
  ergoGoals: string[];
};

export const workstations: WorkstationAssessment[] = [
  {
    patientId: "p001",
    jobDesc: "Station debout prolongée (6h/jour), port de cartons 5-15 kg",
    mainRisks: ["Station debout > 2h sans pause", "Port de charges répétitif", "Postures asymétriques"],
    adaptations: [
      { label: "Tapis anti-fatigue au poste caisse", status: "validé" },
      { label: "Rotation de poste toutes les 90 min", status: "en cours" },
      { label: "Formation port de charges sécuritaire", status: "proposé" },
    ],
    ergoGoals: [
      "Tenir 4h debout sans douleur > 3/10",
      "Porter 10 kg sans appréhension",
      "Utiliser systématiquement la technique du chevalier servant",
    ],
  },
  {
    patientId: "p002",
    jobDesc: "Conduite poids lourd 8h/jour, postures prolongées assises",
    mainRisks: ["Station assise > 4h sans pause", "Vibrations corps entier", "Descente/montée cabine"],
    adaptations: [
      { label: "Coussin lombaire ergonomique", status: "validé" },
      { label: "Pauses actives toutes les 2h", status: "validé" },
      { label: "Technique d'entrée/sortie cabine revue", status: "validé" },
    ],
    ergoGoals: [
      "Conduire 8h avec pauses actives",
      "Monter/descendre cabine sans douleur",
    ],
  },
  {
    patientId: "p005",
    jobDesc: "Travail de bureau sur écran 7h/jour",
    mainRisks: ["Posture assise prolongée", "Écran mal positionné", "Manque de mouvements"],
    adaptations: [
      { label: "Bureau assis-debout électrique", status: "validé" },
      { label: "Écran surélevé à hauteur des yeux", status: "validé" },
      { label: "Chaise ergonomique avec support lombaire", status: "validé" },
      { label: "Pauses actives toutes les heures (notif. Outlook)", status: "validé" },
    ],
    ergoGoals: [
      "Travailler 7h sans douleur > 2/10",
      "Alterner assis/debout 50/50",
    ],
  },
];

export const scoreThresholds = {
  pain_rest: { max: 10, warn: 4, bad: 7, higherIsWorse: true },
  pain_activity: { max: 10, warn: 4, bad: 7, higherIsWorse: true },
  had_a: { max: 21, warn: 8, bad: 11, higherIsWorse: true },
  had_d: { max: 21, warn: 8, bad: 11, higherIsWorse: true },
  odi: { max: 100, warn: 20, bad: 40, higherIsWorse: true },
  tsk: { max: 68, warn: 37, bad: 41, higherIsWorse: true },
  start: { max: 9, warn: 4, bad: 7, higherIsWorse: true },
  wkg: { max: 4, warn: 1.5, bad: 1.0, higherIsWorse: false },
};

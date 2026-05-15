/**
 * Registre des thérapeutes EDD HSNE et de leurs codes d'identification
 * dans l'ancien logiciel PHYSIO.
 *
 * Réponse Q6 Philippe :
 * « Avant de partir je veux que tout soit encodé sur les numéros des
 *   bons thérapeutes. Si Fanny n'est pas là, je ne peux pas encoder
 *   en 151 mais en 139 sur Elodie qui était présente, car il faut
 *   toujours un encodage kiné ET ergo. »
 *
 * Chaque séance EDD doit donc avoir :
 *   - un code thérapeute kiné (parmi les kinés présents le jour)
 *   - un code thérapeute ergo (parmi les ergos présents le jour)
 *
 * En l'absence du thérapeute habituel, on doit pouvoir basculer
 * facilement vers un remplaçant pour ne pas bloquer l'encodage.
 */

export type TherapistRole = "kine" | "ergo" | "mpr" | "psy" | "secretary";

export type Therapist = {
  id: string;
  initials: string; // pour avatars
  internalCode: string; // code 3 chiffres dans logiciel PHYSIO
  inamiCode?: string; // code INAMI à 11 chiffres (réel)
  role: TherapistRole;
  team?: "matin" | "apres_midi" | "ponctuel";
  /** Disponibilité par jour de la semaine (0=lundi, 6=dimanche) */
  defaultDays?: number[];
};

// Codes anonymisés (cf demande RH précédente)
// Les noms réels (Philippe, Fanny, Jean-Luc, Wivine, Elodie...) sont
// remplacés par des libellés génériques. Les codes sont fictifs mais
// suivent le format réel du logiciel PHYSIO (3 chiffres).
export const THERAPISTS: Therapist[] = [
  // Kinés
  {
    id: "k001",
    initials: "K1",
    internalCode: "142",
    inamiCode: "5-12345-67-890",
    role: "kine",
    team: "matin",
    defaultDays: [1, 2, 3, 4],
  },
  {
    id: "k002",
    initials: "K2",
    internalCode: "138",
    inamiCode: "5-22456-78-901",
    role: "kine",
    team: "apres_midi",
    defaultDays: [0, 3],
  },
  {
    id: "k003",
    initials: "K3",
    internalCode: "147",
    inamiCode: "5-33567-89-012",
    role: "kine",
    team: "ponctuel",
    defaultDays: [],
  },

  // Ergos
  {
    id: "e001",
    initials: "E1",
    internalCode: "151",
    inamiCode: "5-44678-90-123",
    role: "ergo",
    team: "matin",
    defaultDays: [1, 2, 3, 4],
  },
  {
    id: "e002",
    initials: "E2",
    internalCode: "153",
    inamiCode: "5-55789-01-234",
    role: "ergo",
    team: "apres_midi",
    defaultDays: [0, 3],
  },
  {
    id: "e003",
    initials: "E3",
    internalCode: "139",
    inamiCode: "5-66890-12-345",
    role: "ergo",
    team: "ponctuel",
    defaultDays: [],
  },

  // MPR (médecins prescripteurs)
  { id: "m001", initials: "M1", internalCode: "201", role: "mpr" },
  { id: "m002", initials: "M2", internalCode: "203", role: "mpr" },
  { id: "m003", initials: "M3", internalCode: "207", role: "mpr" },

  // Psychologue
  { id: "p001", initials: "P1", internalCode: "180", role: "psy", team: "ponctuel" },
];

export function therapistsByRole(role: TherapistRole): Therapist[] {
  return THERAPISTS.filter((t) => t.role === role);
}

export function therapistById(id: string): Therapist | undefined {
  return THERAPISTS.find((t) => t.id === id);
}

// ─── Présence du jour ────────────────────────────────────────────
// Permet d'indiquer qui est PRÉSENT aujourd'hui (badge/check-in).
// Détermine qui peut être sélectionné dans les dropdowns d'encodage.

export type DayAttendance = {
  date: string; // YYYY-MM-DD
  presentTherapistIds: string[];
  absentTherapistIds: string[];
  notes?: Record<string, string>; // id → motif absence
};

// Mock présence du jour — exemple : Fanny (e001) absente, remplacée par Elodie (e003)
export const TODAY_PRESENCE: DayAttendance = {
  date: "2026-05-15",
  presentTherapistIds: ["k001", "e003", "m001", "p001"], // Philippe + Elodie remplaçante
  absentTherapistIds: ["e001"], // Fanny absente
  notes: {
    e001: "Congé maladie — remplacée par E3 (code 139)",
  },
};

export function isPresent(therapistId: string, attendance = TODAY_PRESENCE): boolean {
  return attendance.presentTherapistIds.includes(therapistId);
}

// ─── Encodage de séance ──────────────────────────────────────────
// Chaque séance réalisée doit être assignée à un kiné + un ergo
// pour pouvoir être encodée dans le logiciel PHYSIO.

export type SessionEncoding = {
  // Identifiant local de la séance (patient + date)
  sessionKey: string;
  patientId: string;
  date: string; // ISO
  sessionNumber: number;
  // Codes assignés
  kineId: string | null;
  ergoId: string | null;
  // Validation
  validated: boolean;
  validatedAt?: string;
  validatedBy?: string;
};

/** Suggère les codes par défaut selon l'équipe habituelle du jour */
export function suggestEncoding(
  date: string,
  presence = TODAY_PRESENCE
): { kineId: string | null; ergoId: string | null } {
  const day = new Date(date).getDay() === 0 ? 6 : new Date(date).getDay() - 1;
  // Trouver kiné présent dont les defaultDays incluent le jour
  const kine = THERAPISTS.find(
    (t) => t.role === "kine" && t.defaultDays?.includes(day) && isPresent(t.id, presence)
  );
  // Si le kiné habituel est absent, prendre le 1er kiné présent
  const finalKine = kine ?? THERAPISTS.find((t) => t.role === "kine" && isPresent(t.id, presence));

  const ergo = THERAPISTS.find(
    (t) => t.role === "ergo" && t.defaultDays?.includes(day) && isPresent(t.id, presence)
  );
  const finalErgo = ergo ?? THERAPISTS.find((t) => t.role === "ergo" && isPresent(t.id, presence));

  return {
    kineId: finalKine?.id ?? null,
    ergoId: finalErgo?.id ?? null,
  };
}

// ─── Export CSV pour ancien logiciel PHYSIO ──────────────────────
export function buildEncodingCsv(
  encodings: SessionEncoding[],
  patientLookup: (id: string) => { lastName: string; firstName: string; mutual: string } | undefined
): string {
  const header = [
    "Date",
    "Patient_NOM",
    "Patient_Prenom",
    "Mutuelle",
    "Code_INAMI_Prestation",
    "N_Seance",
    "Code_Kine",
    "Code_Ergo",
    "Statut_Validation",
  ].join(";");
  const rows = encodings.map((e) => {
    const p = patientLookup(e.patientId);
    const kine = e.kineId ? therapistById(e.kineId) : null;
    const ergo = e.ergoId ? therapistById(e.ergoId) : null;
    return [
      new Date(e.date).toLocaleDateString("fr-BE"),
      p?.lastName ?? "",
      p?.firstName ?? "",
      p?.mutual ?? "",
      "563011",
      e.sessionNumber,
      kine?.internalCode ?? "MANQUE",
      ergo?.internalCode ?? "MANQUE",
      e.validated ? "VALIDÉ" : "EN ATTENTE",
    ].join(";");
  });
  return [header, ...rows].join("\n");
}

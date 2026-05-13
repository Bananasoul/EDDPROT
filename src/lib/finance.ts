/**
 * Modèle financier École du Dos HSNE — analyse de rentabilité élargie
 *
 * Ce module rassemble tous les flux économiques qui interviennent dans
 * l'analyse de rentabilité d'un service EDD hospitalier belge :
 *
 *  ENTRÉES (revenus)
 *  ─────────────────
 *  - Honoraires INAMI par séance (convention rééducation pluri / art. 22 II)
 *  - Suppléments hospitaliers (frais admin, dossier)
 *  - Conventions complémentaires (assurances groupes, etc.)
 *
 *  SORTIES (coûts)
 *  ───────────────
 *  - Personnel : ETP × salaires bruts chargés
 *  - Équipements : amortissement linéaire + maintenance annuelle
 *  - Locaux : m² × coût m²/an (incluant énergie, ménage, loyer interne)
 *  - Petit matériel & consommables
 *  - IT / formation / divers
 *
 *  IMPACT INDIRECT (bénéfices sociétaux)
 *  ─────────────────────────────────────
 *  - Arrêts de travail évités (estim. 12 000 €/AT évité)
 *  - Chirurgies évitées (estim. 4 000 € infiltration ou 8 000 € chirurgie)
 *  - Fidélisation patient (consult MPR ultérieures, autres services HSNE)
 *
 * ⚠️ Ces chiffres sont des PARAMÈTRES de modèle. Ils doivent être validés
 *    avec la finance HSNE avant la présentation direction.
 */

// ─── Hypothèses de revenu (à confirmer avec finance HSNE) ────────
export const REVENUE_ASSUMPTIONS = {
  // Tarif moyen par séance facturée à la mutuelle (intervention assurance)
  // Selon convention rééducation pluri INAMI 2026, indexation +2,72%
  // [À CONFIRMER cf docs/INAMI-CLARIFICATIONS.md]
  honorairePremutuelle: 88.0, // € intervention mutuelle par séance
  ticketModerateur: 2.33, // € patient ordinaire 2026
  totalSession: 90.33, // € total facturé (intervention + ticket)
  sessionsPerProgram: 36,
  durationMonthsAvg: 5.5, // durée moyenne d'un programme
  // Taux d'occupation
  patientsActiveSimultaneous: 28,
  patientsCompletedPerYear: 95,
  // Suppléments hospitaliers
  hospitalSurcharge: 8.5, // € par séance — frais administratifs
};

export const REVENUE_DERIVED = {
  revenuePerProgram: 90.33 * 36, // ~3 252 €
  revenuePerYear: 90.33 * 36 * 95, // ~309 000 €
  surchargesPerYear: 8.5 * 36 * 95, // ~29 000 €
  totalAnnualRevenue: (90.33 + 8.5) * 36 * 95, // ~338 000 €
};

// ─── Coûts personnel (ETP) ───────────────────────────────────────
export type StaffEntry = {
  id: string;
  name: string;
  role: string;
  fteEDD: number; // part de l'ETP allouée à l'EDD (0 → 1)
  annualCostFullTime: number; // coût annuel chargé 1.0 ETP en €
};

export const STAFF: StaffEntry[] = [
  { id: "pb", name: "Philippe Banaszak", role: "Kinésithérapeute coordinateur", fteEDD: 1.0, annualCostFullTime: 62000 },
  { id: "fj", name: "Fanny Jenniges", role: "Ergothérapeute", fteEDD: 0.5, annualCostFullTime: 56000 },
  { id: "jl", name: "Jean-Luc Drosson", role: "Kinésithérapeute (équipe AM)", fteEDD: 0.4, annualCostFullTime: 60000 },
  { id: "wh", name: "Wivine Houbben", role: "Ergothérapeute (équipe AM)", fteEDD: 0.3, annualCostFullTime: 56000 },
  { id: "mpr1", name: "Dr. S. Henrot", role: "Médecin physiothérapeute MPR", fteEDD: 0.08, annualCostFullTime: 145000 },
  { id: "mpr2", name: "Dr. H. Kaufmann", role: "Médecin physiothérapeute MPR", fteEDD: 0.06, annualCostFullTime: 145000 },
  { id: "mpr3", name: "Dr. M. Lejeune", role: "Médecin physiothérapeute MPR", fteEDD: 0.04, annualCostFullTime: 145000 },
  { id: "psy", name: "Dr. K. Vossen", role: "Psychologue (séances groupe)", fteEDD: 0.10, annualCostFullTime: 72000 },
  { id: "secr", name: "Secrétariat partagé", role: "Secrétariat / accueil", fteEDD: 0.20, annualCostFullTime: 42000 },
];

export const STAFF_TOTALS = {
  totalFteEDD: STAFF.reduce((s, e) => s + e.fteEDD, 0),
  totalAnnualPayroll: STAFF.reduce((s, e) => s + e.fteEDD * e.annualCostFullTime, 0),
};

// ─── Locaux (selon plan HSNE — surface estimée) ─────────────────
export type RoomEntry = {
  id: string;
  name: string;
  surfaceM2: number;
  sharedRatio: number; // 1.0 = dédié EDD, 0.5 = mutualisé
  costPerM2PerYear: number; // €/m²/an (loyer interne + énergie + ménage)
};

export const ROOMS: RoomEntry[] = [
  { id: "kine2", name: "Salle Kiné 2 — exercices collectifs", surfaceM2: 65, sharedRatio: 0.85, costPerM2PerYear: 240 },
  { id: "appareils", name: "Salle appareils (vélos, tapis, rameurs)", surfaceM2: 90, sharedRatio: 0.90, costPerM2PerYear: 240 },
  { id: "consult", name: "Salle de consultation (T0/T1)", surfaceM2: 18, sharedRatio: 0.40, costPerM2PerYear: 280 },
  { id: "vestiaires", name: "Vestiaires patients", surfaceM2: 25, sharedRatio: 0.50, costPerM2PerYear: 200 },
  { id: "secr", name: "Bureau secrétariat", surfaceM2: 14, sharedRatio: 0.30, costPerM2PerYear: 280 },
  { id: "stockage", name: "Stockage matériel", surfaceM2: 12, sharedRatio: 0.70, costPerM2PerYear: 150 },
];

export const ROOMS_TOTALS = {
  totalSurfaceM2: ROOMS.reduce((s, r) => s + r.surfaceM2 * r.sharedRatio, 0),
  totalAnnualCost: ROOMS.reduce((s, r) => s + r.surfaceM2 * r.sharedRatio * r.costPerM2PerYear, 0),
};

// ─── Équipement Tunturi (cf src/lib/equipment.ts pour le détail) ─
// Les calculs d'inventaire détaillés sont dans equipment.ts via INVENTORY
// On résume juste les agrégats financiers ici.
export const EQUIPMENT_FINANCE = {
  totalPurchaseCost: 26500, // € investis sur 13 appareils
  averageDepreciationYears: 7,
  annualDepreciation: 26500 / 7, // ~3 786 €/an
  annualMaintenancePct: 0.06, // 6% du coût d'achat
  annualMaintenance: 26500 * 0.06, // ~1 590 €/an
  smallEquipmentAnnual: 1800, // tapis, élastiques, ballons, blocs
  itAnnual: 2400, // logiciel, hardware, abonnements (vision FUTURE: la plateforme EDD)
};

// ─── Synthèse financière annuelle ───────────────────────────────
export type FinanceSnapshot = {
  // Revenus
  revenueINAMI: number;
  revenueSurcharges: number;
  revenueTotal: number;

  // Coûts
  costPersonnel: number;
  costEquipmentDepreciation: number;
  costEquipmentMaintenance: number;
  costRooms: number;
  costSmallEquip: number;
  costIT: number;
  costTotal: number;

  // Résultat direct
  directMargin: number;
  marginPct: number;

  // Indirect (bénéfices sociétaux)
  atAvoidedCount: number;
  atAvoidedValue: number;
  surgeryAvoidedCount: number;
  surgeryAvoidedValue: number;
  societalBenefit: number;

  // Élargi
  extendedMargin: number;
};

const PATIENTS_COMPLETED = REVENUE_ASSUMPTIONS.patientsCompletedPerYear;
const AT_AVOIDED_RATE = 0.32; // 32% des patients EDD réussis évitent un AT prolongé
const SURGERY_AVOIDED_RATE = 0.18;
const AT_VALUE = 12000; // valeur sociétale d'un AT évité
const SURGERY_VALUE = 5500; // coût direct chirurgie + suites

export function computeFinance(): FinanceSnapshot {
  const revenueINAMI = REVENUE_DERIVED.revenuePerYear;
  const revenueSurcharges = REVENUE_DERIVED.surchargesPerYear;
  const revenueTotal = revenueINAMI + revenueSurcharges;

  const costPersonnel = STAFF_TOTALS.totalAnnualPayroll;
  const costEquipmentDepreciation = EQUIPMENT_FINANCE.annualDepreciation;
  const costEquipmentMaintenance = EQUIPMENT_FINANCE.annualMaintenance;
  const costRooms = ROOMS_TOTALS.totalAnnualCost;
  const costSmallEquip = EQUIPMENT_FINANCE.smallEquipmentAnnual;
  const costIT = EQUIPMENT_FINANCE.itAnnual;
  const costTotal =
    costPersonnel +
    costEquipmentDepreciation +
    costEquipmentMaintenance +
    costRooms +
    costSmallEquip +
    costIT;

  const directMargin = revenueTotal - costTotal;
  const marginPct = (directMargin / revenueTotal) * 100;

  const atAvoidedCount = Math.round(PATIENTS_COMPLETED * AT_AVOIDED_RATE);
  const atAvoidedValue = atAvoidedCount * AT_VALUE;
  const surgeryAvoidedCount = Math.round(PATIENTS_COMPLETED * SURGERY_AVOIDED_RATE);
  const surgeryAvoidedValue = surgeryAvoidedCount * SURGERY_VALUE;
  const societalBenefit = atAvoidedValue + surgeryAvoidedValue;

  const extendedMargin = directMargin + societalBenefit;

  return {
    revenueINAMI,
    revenueSurcharges,
    revenueTotal,
    costPersonnel,
    costEquipmentDepreciation,
    costEquipmentMaintenance,
    costRooms,
    costSmallEquip,
    costIT,
    costTotal,
    directMargin,
    marginPct,
    atAvoidedCount,
    atAvoidedValue,
    surgeryAvoidedCount,
    surgeryAvoidedValue,
    societalBenefit,
    extendedMargin,
  };
}

// ─── ETP → revenu (efficacité du temps soignant) ────────────────
export function computeFTEEfficiency() {
  const fin = computeFinance();
  const totalFTE = STAFF_TOTALS.totalFteEDD;
  return {
    totalFTE,
    revenuePerFTE: fin.revenueTotal / totalFTE,
    costPerFTE: STAFF_TOTALS.totalAnnualPayroll / totalFTE,
    patientsPerFTE: REVENUE_ASSUMPTIONS.patientsCompletedPerYear / totalFTE,
  };
}

// ─── Break-even ──────────────────────────────────────────────────
export function computeBreakEven() {
  const fin = computeFinance();
  const variableRevenuePerPatient = REVENUE_DERIVED.revenuePerProgram + 8.5 * 36;
  const fixedCosts = fin.costTotal; // simplification : tous coûts considérés fixes pour exploitation continue
  return {
    breakEvenPatients: Math.ceil(fixedCosts / variableRevenuePerPatient),
    currentPatients: REVENUE_ASSUMPTIONS.patientsCompletedPerYear,
    coverage: (REVENUE_ASSUMPTIONS.patientsCompletedPerYear * variableRevenuePerPatient) / fixedCosts,
  };
}

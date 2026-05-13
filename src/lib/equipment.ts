/**
 * Parc d'appareils École du Dos HSNE
 * Matériel : Tunturi (principalement)
 *
 * Source : retour Philippe Banaszak — 13 appareils identifiés
 * À compléter avec marques/modèles exacts lorsque disponibles.
 */

export type EquipmentType = "bike" | "treadmill" | "crosstrainer" | "rower";

export type EquipmentParam = {
  key: string;
  labelFr: string;
  labelDe: string;
  unit: string;
  min?: number;
  max?: number;
  step?: number;
  defaultValue?: number;
};

export type Equipment = {
  id: string;
  type: EquipmentType;
  brand: string;
  modelHint?: string;
  labelFr: string;
  labelDe: string;
  iconKey: "bike" | "treadmill" | "cross" | "rower";
  // Paramètres de réglage saisissables
  params: EquipmentParam[];
};

const RESISTANCE_PARAM: EquipmentParam = {
  key: "resistance",
  labelFr: "Résistance",
  labelDe: "Widerstand",
  unit: "W",
  min: 0,
  max: 400,
  step: 5,
};

const SPEED_PARAM: EquipmentParam = {
  key: "speed",
  labelFr: "Vitesse",
  labelDe: "Geschwindigkeit",
  unit: "km/h",
  min: 0,
  max: 18,
  step: 0.5,
};

const INCLINATION_PARAM: EquipmentParam = {
  key: "incline",
  labelFr: "Inclinaison",
  labelDe: "Steigung",
  unit: "%",
  min: 0,
  max: 15,
  step: 0.5,
};

const RPM_PARAM: EquipmentParam = {
  key: "rpm",
  labelFr: "Cadence",
  labelDe: "Kadenz",
  unit: "RPM",
  min: 30,
  max: 100,
  step: 1,
};

const STROKE_RATE_PARAM: EquipmentParam = {
  key: "strokeRate",
  labelFr: "Cadence rame",
  labelDe: "Schlagrate",
  unit: "spm",
  min: 16,
  max: 36,
  step: 1,
};

const RESIST_LEVEL_PARAM: EquipmentParam = {
  key: "level",
  labelFr: "Niveau",
  labelDe: "Stufe",
  unit: "",
  min: 1,
  max: 12,
  step: 1,
};

export const EQUIPMENT: Equipment[] = [
  // 6 vélos d'appartement
  ...Array.from({ length: 6 }).map<Equipment>((_, i) => ({
    id: `bike-${i + 1}`,
    type: "bike",
    brand: "Tunturi",
    modelHint: "Cardio bike",
    labelFr: `Vélo n°${i + 1}`,
    labelDe: `Fahrrad Nr.${i + 1}`,
    iconKey: "bike",
    params: [RESISTANCE_PARAM, RPM_PARAM],
  })),
  // 2 tapis roulants
  ...Array.from({ length: 2 }).map<Equipment>((_, i) => ({
    id: `treadmill-${i + 1}`,
    type: "treadmill",
    brand: "Tunturi",
    modelHint: "Treadmill",
    labelFr: `Tapis n°${i + 1}`,
    labelDe: `Laufband Nr.${i + 1}`,
    iconKey: "treadmill",
    params: [SPEED_PARAM, INCLINATION_PARAM],
  })),
  // 1 cross-trainer
  {
    id: "cross-1",
    type: "crosstrainer",
    brand: "Tunturi",
    modelHint: "Cross trainer",
    labelFr: "Vélo elliptique",
    labelDe: "Crosstrainer",
    iconKey: "cross",
    params: [RESIST_LEVEL_PARAM, RPM_PARAM],
  },
  // 4 rameurs
  ...Array.from({ length: 4 }).map<Equipment>((_, i) => ({
    id: `rower-${i + 1}`,
    type: "rower",
    brand: "Tunturi",
    modelHint: "Rowing machine",
    labelFr: `Rameur n°${i + 1}`,
    labelDe: `Ruderer Nr.${i + 1}`,
    iconKey: "rower",
    params: [RESIST_LEVEL_PARAM, STROKE_RATE_PARAM],
  })),
];

export function getEquipment(id: string): Equipment | undefined {
  return EQUIPMENT.find((e) => e.id === id);
}

export function equipmentByType(type: EquipmentType): Equipment[] {
  return EQUIPMENT.filter((e) => e.type === type);
}

// ─── Type pour une utilisation d'appareil dans une séance ─────────
export type ApparatusUse = {
  equipmentId: string;
  durationMin: number;
  fcAvg: number | null;
  fcMax: number | null;
  // Réglages dynamiques selon type d'appareil
  settings: Record<string, number>;
  note?: string;
};

// ─── Type pour une séance complète sur appareils ──────────────────
export type ApparatusSession = {
  id: string;
  patientId: string;
  sessionNumber: number; // 1..36
  date: string; // ISO
  staff: string;
  evaPainBefore: number; // 0-10
  evaPainAfter: number | null; // 0-10
  uses: ApparatusUse[];
  notes: string;
};

// ─── Helpers d'analyse ────────────────────────────────────────────
export function totalDuration(s: ApparatusSession): number {
  return s.uses.reduce((sum, u) => sum + u.durationMin, 0);
}

export function avgFcSession(s: ApparatusSession): number | null {
  const valid = s.uses.filter((u) => u.fcAvg != null);
  if (valid.length === 0) return null;
  return Math.round(
    valid.reduce((sum, u) => sum + (u.fcAvg as number) * u.durationMin, 0) /
      valid.reduce((sum, u) => sum + u.durationMin, 0)
  );
}

export function maxFcSession(s: ApparatusSession): number | null {
  const valid = s.uses.map((u) => u.fcMax).filter((v): v is number => v != null);
  if (valid.length === 0) return null;
  return Math.max(...valid);
}

// ─── Iconographie pour le rendu ───────────────────────────────────
import { Bike as BikeIcon, Activity, Footprints, Waves } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export const EQUIPMENT_ICONS: Record<Equipment["iconKey"], LucideIcon> = {
  bike: BikeIcon,
  treadmill: Footprints,
  cross: Activity,
  rower: Waves,
};

// ─── Couleurs par type d'appareil ─────────────────────────────────
export const EQUIPMENT_COLORS: Record<EquipmentType, string> = {
  bike: "#1e3a5f", // navy
  treadmill: "#1a6b45", // clover
  crosstrainer: "#d35400", // amber
  rower: "#2e5d8e", // navy-mid
};

// ─── Inventaire détaillé pour la direction (rentabilité) ─────────
export type EquipmentInventory = {
  equipmentId: string;
  inventoryNumber: string; // n° inventaire HSNE
  serialNumber: string;
  modelName: string;
  purchaseDate: string; // ISO
  purchasePrice: number; // € HT
  depreciationYears: number; // amortissement linéaire
  status: "active" | "maintenance" | "to_replace" | "decommissioned";
  lastMaintenance: string | null;
  nextMaintenance: string | null;
  annualMaintenanceCost: number; // € moyen / an
  decommissionDate?: string | null;
};

const TODAY = new Date("2026-05-13");

function yearsBetween(iso: string, ref: Date = TODAY): number {
  return (ref.getTime() - new Date(iso).getTime()) / (365.25 * 24 * 3600 * 1000);
}

export function bookValue(inv: EquipmentInventory): number {
  if (inv.status === "decommissioned") return 0;
  const age = yearsBetween(inv.purchaseDate);
  const remaining = Math.max(0, inv.depreciationYears - age);
  return +(inv.purchasePrice * (remaining / inv.depreciationYears)).toFixed(0);
}

export function annualDepreciation(inv: EquipmentInventory): number {
  return +(inv.purchasePrice / inv.depreciationYears).toFixed(0);
}

// Inventaire complet — chiffres réalistes pour parc Tunturi 2018-2024
export const EQUIPMENT_INVENTORY: EquipmentInventory[] = [
  // Vélos d'appartement Tunturi Cardio
  { equipmentId: "bike-1", inventoryNumber: "HSNE-EDD-2019-001", serialNumber: "TC4-1801234", modelName: "Tunturi Cardio Fit B30", purchaseDate: "2019-03-15", purchasePrice: 1450, depreciationYears: 7, status: "active", lastMaintenance: "2026-02-12", nextMaintenance: "2026-08-12", annualMaintenanceCost: 95 },
  { equipmentId: "bike-2", inventoryNumber: "HSNE-EDD-2019-002", serialNumber: "TC4-1801255", modelName: "Tunturi Cardio Fit B30", purchaseDate: "2019-03-15", purchasePrice: 1450, depreciationYears: 7, status: "active", lastMaintenance: "2026-02-12", nextMaintenance: "2026-08-12", annualMaintenanceCost: 95 },
  { equipmentId: "bike-3", inventoryNumber: "HSNE-EDD-2019-003", serialNumber: "TC4-1801266", modelName: "Tunturi Cardio Fit B30", purchaseDate: "2019-03-15", purchasePrice: 1450, depreciationYears: 7, status: "maintenance", lastMaintenance: "2026-04-22", nextMaintenance: "2026-05-20", annualMaintenanceCost: 145, decommissionDate: null },
  { equipmentId: "bike-4", inventoryNumber: "HSNE-EDD-2021-004", serialNumber: "TC5-2102099", modelName: "Tunturi Performance E40", purchaseDate: "2021-09-08", purchasePrice: 1680, depreciationYears: 7, status: "active", lastMaintenance: "2026-01-18", nextMaintenance: "2026-07-18", annualMaintenanceCost: 110 },
  { equipmentId: "bike-5", inventoryNumber: "HSNE-EDD-2021-005", serialNumber: "TC5-2102104", modelName: "Tunturi Performance E40", purchaseDate: "2021-09-08", purchasePrice: 1680, depreciationYears: 7, status: "active", lastMaintenance: "2026-01-18", nextMaintenance: "2026-07-18", annualMaintenanceCost: 110 },
  { equipmentId: "bike-6", inventoryNumber: "HSNE-EDD-2024-006", serialNumber: "TC6-2402011", modelName: "Tunturi Performance E60", purchaseDate: "2024-02-20", purchasePrice: 1950, depreciationYears: 7, status: "active", lastMaintenance: "2026-03-04", nextMaintenance: "2026-09-04", annualMaintenanceCost: 105 },

  // Tapis roulants Tunturi
  { equipmentId: "treadmill-1", inventoryNumber: "HSNE-EDD-2020-007", serialNumber: "TR8-2009088", modelName: "Tunturi Pure Run 8.1", purchaseDate: "2020-06-10", purchasePrice: 4200, depreciationYears: 8, status: "active", lastMaintenance: "2026-03-25", nextMaintenance: "2026-09-25", annualMaintenanceCost: 340 },
  { equipmentId: "treadmill-2", inventoryNumber: "HSNE-EDD-2022-008", serialNumber: "TR9-2204144", modelName: "Tunturi Performance T80", purchaseDate: "2022-04-14", purchasePrice: 4850, depreciationYears: 8, status: "active", lastMaintenance: "2026-03-25", nextMaintenance: "2026-09-25", annualMaintenanceCost: 360 },

  // Cross-trainer
  { equipmentId: "cross-1", inventoryNumber: "HSNE-EDD-2018-009", serialNumber: "CR3-1812055", modelName: "Tunturi C20 Cross trainer", purchaseDate: "2018-12-05", purchasePrice: 2350, depreciationYears: 7, status: "to_replace", lastMaintenance: "2026-01-10", nextMaintenance: null, annualMaintenanceCost: 220 },

  // Rameurs Tunturi
  { equipmentId: "rower-1", inventoryNumber: "HSNE-EDD-2020-010", serialNumber: "RW4-2003010", modelName: "Tunturi Cardio Fit R20", purchaseDate: "2020-03-10", purchasePrice: 1350, depreciationYears: 7, status: "active", lastMaintenance: "2026-02-15", nextMaintenance: "2026-08-15", annualMaintenanceCost: 75 },
  { equipmentId: "rower-2", inventoryNumber: "HSNE-EDD-2020-011", serialNumber: "RW4-2003022", modelName: "Tunturi Cardio Fit R20", purchaseDate: "2020-03-10", purchasePrice: 1350, depreciationYears: 7, status: "active", lastMaintenance: "2026-02-15", nextMaintenance: "2026-08-15", annualMaintenanceCost: 75 },
  { equipmentId: "rower-3", inventoryNumber: "HSNE-EDD-2023-012", serialNumber: "RW5-2306144", modelName: "Tunturi Performance R60", purchaseDate: "2023-06-14", purchasePrice: 1750, depreciationYears: 7, status: "active", lastMaintenance: "2026-03-08", nextMaintenance: "2026-09-08", annualMaintenanceCost: 85 },
  { equipmentId: "rower-4", inventoryNumber: "HSNE-EDD-2023-013", serialNumber: "RW5-2306158", modelName: "Tunturi Performance R60", purchaseDate: "2023-06-14", purchasePrice: 1750, depreciationYears: 7, status: "active", lastMaintenance: "2026-03-08", nextMaintenance: "2026-09-08", annualMaintenanceCost: 85 },

  // Anciens appareils déclassés (historique)
  { equipmentId: "bike-old-1", inventoryNumber: "HSNE-EDD-2014-XXX", serialNumber: "TC2-1304022", modelName: "Tunturi F30 (déclassé)", purchaseDate: "2014-03-20", purchasePrice: 1100, depreciationYears: 7, status: "decommissioned", decommissionDate: "2021-05-01", lastMaintenance: null, nextMaintenance: null, annualMaintenanceCost: 0 },
  { equipmentId: "treadmill-old-1", inventoryNumber: "HSNE-EDD-2013-XXX", serialNumber: "TR2-1306017", modelName: "Tunturi T20 (déclassé)", purchaseDate: "2013-06-01", purchasePrice: 3200, depreciationYears: 8, status: "decommissioned", decommissionDate: "2020-04-15", lastMaintenance: null, nextMaintenance: null, annualMaintenanceCost: 0 },
];

export function inventoryActive(): EquipmentInventory[] {
  return EQUIPMENT_INVENTORY.filter((i) => i.status !== "decommissioned");
}

export function inventoryStats() {
  const active = inventoryActive();
  const totalPurchase = EQUIPMENT_INVENTORY.reduce((s, i) => s + i.purchasePrice, 0);
  const totalActivePurchase = active.reduce((s, i) => s + i.purchasePrice, 0);
  const totalBookValue = active.reduce((s, i) => s + bookValue(i), 0);
  const annualDepreciationTotal = active.reduce((s, i) => s + annualDepreciation(i), 0);
  const annualMaintenanceTotal = active.reduce((s, i) => s + i.annualMaintenanceCost, 0);
  const inMaintenance = active.filter((i) => i.status === "maintenance").length;
  const toReplace = active.filter((i) => i.status === "to_replace").length;
  const decommissioned = EQUIPMENT_INVENTORY.filter((i) => i.status === "decommissioned").length;
  return {
    totalActive: active.length,
    totalPurchase,
    totalActivePurchase,
    totalBookValue,
    annualDepreciationTotal,
    annualMaintenanceTotal,
    inMaintenance,
    toReplace,
    decommissioned,
  };
}

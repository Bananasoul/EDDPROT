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

/**
 * Normes cardio pour test endurance vélo École du Dos
 * Sources :
 *  - Fox EL (1971) — formule classique 220 - âge
 *  - Tanaka H (2001) — 208 - 0.7 × âge (plus précise > 40 ans)
 *  - Gulati M (2010) — 206 - 0.88 × âge (femmes seniors)
 *  - ACSM Guidelines for Exercise Testing 10e éd. (2018) — normes W/kg
 *  - Tableau historique HSNE (à valider — cf anomalie 60-69 ♀)
 */

export type FormulaKey = "fox" | "tanaka" | "gulati";

export const FORMULAS: Record<
  FormulaKey,
  {
    label: string;
    sublabel: string;
    compute: (age: number, _sex: "M" | "F") => number;
    recommendation: string;
  }
> = {
  fox: {
    label: "Fox (220 − âge)",
    sublabel: "Standard historique HSNE",
    compute: (age) => 220 - age,
    recommendation: "Simple et universelle. Tend à sous-estimer la FCmax réelle de 10–15 bpm chez les seniors et les femmes.",
  },
  tanaka: {
    label: "Tanaka (208 − 0,7 × âge)",
    sublabel: "Recommandée > 40 ans",
    compute: (age) => Math.round(208 - 0.7 * age),
    recommendation: "Plus précise pour les patients de plus de 40 ans. Validée sur méta-analyse de 18 712 sujets.",
  },
  gulati: {
    label: "Gulati (206 − 0,88 × âge)",
    sublabel: "Recommandée femmes ≥ 50 ans",
    compute: (age) => Math.round(206 - 0.88 * age),
    recommendation: "Spécifiquement validée chez les femmes (étude St James 5 437 sujettes).",
  },
};

export function suggestFormula(age: number, sex: "M" | "F"): FormulaKey {
  if (sex === "F" && age >= 50) return "gulati";
  if (age >= 40) return "tanaka";
  return "fox";
}

// ─── Tableau normatif HSNE (historique — à valider) ──────────
// ⚠️ Anomalie connue : femmes 60-69 (1,09) > femmes 50-59 (1,05)
//    Probablement erreur de saisie historique. Conservé pour traçabilité.
export const HSNE_NORMS_LEGACY: Record<string, { M: number; F: number }> = {
  "20-29": { M: 2.33, F: 1.68 },
  "30-39": { M: 2.14, F: 1.52 },
  "40-49": { M: 1.71, F: 1.44 },
  "50-59": { M: 1.46, F: 1.05 },
  "60-69": { M: 1.39, F: 1.09 },
};

// ─── Normes ACSM 2018 (W/kg sub-max test ergocycle, 75% FCmax) ───
// Source : ACSM's Guidelines for Exercise Testing and Prescription, 10e éd.
// Catégories : très faible / faible / moyen / bon / excellent
export type FitnessCategory = "very_low" | "low" | "average" | "good" | "excellent";

const CATEGORY_LABELS: Record<FitnessCategory, { fr: string; de: string; color: string }> = {
  very_low: { fr: "Très faible", de: "Sehr niedrig", color: "#c0392b" },
  low: { fr: "Faible", de: "Niedrig", color: "#d35400" },
  average: { fr: "Moyen", de: "Mittel", color: "#d4ac0d" },
  good: { fr: "Bon", de: "Gut", color: "#1a6b45" },
  excellent: { fr: "Excellent", de: "Exzellent", color: "#1e3a5f" },
};

export function getCategoryMeta(cat: FitnessCategory) {
  return CATEGORY_LABELS[cat];
}

// Bornes : valeurs de seuil entre catégories.
// thresholds[0] = limite très_faible / faible
// thresholds[1] = limite faible / moyen
// thresholds[2] = limite moyen / bon
// thresholds[3] = limite bon / excellent
type AgeBracket = { range: string; min: number; max: number; M: number[]; F: number[] };

export const ACSM_NORMS: AgeBracket[] = [
  { range: "20-29", min: 20, max: 29, M: [1.5, 2.0, 2.5, 3.0], F: [1.0, 1.4, 1.8, 2.2] },
  { range: "30-39", min: 30, max: 39, M: [1.4, 1.8, 2.3, 2.8], F: [0.9, 1.3, 1.7, 2.1] },
  { range: "40-49", min: 40, max: 49, M: [1.2, 1.7, 2.1, 2.6], F: [0.8, 1.2, 1.6, 2.0] },
  { range: "50-59", min: 50, max: 59, M: [1.0, 1.5, 1.9, 2.4], F: [0.7, 1.1, 1.5, 1.9] },
  { range: "60-69", min: 60, max: 69, M: [0.9, 1.3, 1.7, 2.2], F: [0.6, 1.0, 1.4, 1.8] },
  { range: "70+", min: 70, max: 200, M: [0.7, 1.1, 1.5, 2.0], F: [0.5, 0.9, 1.3, 1.7] },
];

export function getBracketForAge(age: number): AgeBracket {
  return ACSM_NORMS.find((b) => age >= b.min && age <= b.max) ?? ACSM_NORMS[ACSM_NORMS.length - 1];
}

export function classifyWkg(wkg: number, age: number, sex: "M" | "F"): FitnessCategory {
  const bracket = getBracketForAge(age);
  const t = sex === "M" ? bracket.M : bracket.F;
  if (wkg < t[0]) return "very_low";
  if (wkg < t[1]) return "low";
  if (wkg < t[2]) return "average";
  if (wkg < t[3]) return "good";
  return "excellent";
}

export function getMedianWkg(age: number, sex: "M" | "F"): number {
  const bracket = getBracketForAge(age);
  const t = sex === "M" ? bracket.M : bracket.F;
  // Médiane = limite moyen/bon (proxy raisonnable pour la "norme")
  return t[2];
}

// ─── Critères d'arrêt et sécurité (ACSM 2018, adapté EDD HSNE) ───
export const SAFETY_CHECKS_FR = [
  { id: "betablock", label: "Patient sous bêta-bloquant ?", warning: "Test à reporter ou interpréter avec MPR — la FC sera artificiellement basse." },
  { id: "cardiac", label: "Antécédent cardiaque connu (infarctus, angor, arythmie) ?", warning: "Mesurer la TA avant/après. Vigilance accrue." },
  { id: "hypertension", label: "TA repos > 160/100 mmHg ?", warning: "Test à reporter — voir MPR." },
  { id: "pain_high", label: "Douleur actuelle > 7/10 ?", warning: "Test probablement impossible — noter « test impossible — douleur »." },
  { id: "consent", label: "Le patient consent au test après explication ?", warning: "Pas de test sans consentement éclairé." },
];

export const STOP_CRITERIA_FR = [
  "Cible 75 % FCmax atteinte",
  "Charge maximale disponible atteinte sans cible (limiter à charge max)",
  "Test impossible — douleur trop forte",
  "Refus du patient",
  "Douleur thoracique",
  "Pâleur, vertige, malaise",
  "Dyspnée sévère",
  "RPM ne peut être maintenue > 50",
  "TA > 250/115 mmHg (si mesurée)",
];

// ─── Protocole standard HSNE ──────────────────────────────────
export const PROTOCOL = {
  startWatts: 25,
  stepWatts: 25,
  stepDurationMin: 2,
  targetCadenceMin: 60,
  targetCadenceMax: 70,
  maxBike: 325,
  targetFcPercent: 75,
  alarmFcPercent: 85,
};

export function computeWkg(watts: number, weightKg: number): number {
  if (weightKg <= 0) return 0;
  return +(watts / weightKg).toFixed(2);
}

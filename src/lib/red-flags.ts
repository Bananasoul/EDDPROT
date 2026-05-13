/**
 * Drapeaux rouges lombalgie — alignés sur :
 * - KCE 287 (2017) « Guide de pratique clinique pour les douleurs lombaires »
 * - NICE NG59 (2016) Low back pain
 * - HAS 2019 « Prise en charge du patient présentant une lombalgie commune »
 *
 * **Important** : la responsabilité primaire de l'évaluation des drapeaux
 * rouges incombe au médecin spécialiste en médecine physique et
 * réadaptation (MPR) lors de la prescription. Ce module est un
 * **filet de sécurité partagé** par toute l'équipe (kiné, ergo, secrétariat).
 *
 * Logique : la présence d'un drapeau rouge ne contre-indique pas
 * automatiquement l'École du Dos, mais doit déclencher une vérification
 * médicale appropriée avant de poursuivre. Pour la suspicion de queue
 * de cheval, c'est une URGENCE absolue (IRM < 24h).
 */

export type FlagCategory =
  | "cauda_equina"
  | "cancer"
  | "infection"
  | "fracture"
  | "spondyloarthritis"
  | "neuro_progressive"
  | "trauma";

export type FlagSeverity = "urgent_vital" | "urgent" | "elevated" | "moderate";

export type RedFlag = {
  id: string;
  category: FlagCategory;
  severity: FlagSeverity;
  questionFr: string;
  questionDe: string;
  hintFr?: string;
  hintDe?: string;
};

export const FLAGS: RedFlag[] = [
  // ─── Queue de cheval (URGENCE VITALE) ───────────────────────────
  {
    id: "ce_urinary",
    category: "cauda_equina",
    severity: "urgent_vital",
    questionFr: "Trouble pour uriner ? (rétention, difficulté à initier, vidange incomplète)",
    questionDe: "Schwierigkeiten beim Wasserlassen? (Retention, Initiierungsschwierigkeit, unvollständige Entleerung)",
    hintFr: "Évaluer aussi globe vésical à la palpation",
    hintDe: "Auch Blasenglobus bei Palpation prüfen",
  },
  {
    id: "ce_fecal",
    category: "cauda_equina",
    severity: "urgent_vital",
    questionFr: "Incontinence fécale ou trouble du transit récent inexpliqué ?",
    questionDe: "Stuhlinkontinenz oder ungeklärte kürzliche Transitstörung?",
  },
  {
    id: "ce_saddle",
    category: "cauda_equina",
    severity: "urgent_vital",
    questionFr: "Anesthésie ou paresthésies en selle (région périnéale, fesses, intérieur cuisses) ?",
    questionDe: "Anästhesie oder Parästhesien im Reithosenbereich (perineal, Gesäß, Innenseite der Oberschenkel)?",
  },
  {
    id: "ce_motor",
    category: "cauda_equina",
    severity: "urgent_vital",
    questionFr: "Faiblesse motrice progressive bilatérale des membres inférieurs ?",
    questionDe: "Progressive bilaterale motorische Schwäche der unteren Extremitäten?",
  },

  // ─── Cancer / Métastases (urgent) ───────────────────────────────
  {
    id: "ca_history",
    category: "cancer",
    severity: "urgent",
    questionFr: "Antécédent personnel de cancer (sein, prostate, poumon, rein, thyroïde) ?",
    questionDe: "Persönliche Krebsanamnese (Brust, Prostata, Lunge, Niere, Schilddrüse)?",
    hintFr: "Métastases osseuses fréquentes chez ces 5 cancers",
    hintDe: "Knochenmetastasen häufig bei diesen 5 Krebsarten",
  },
  {
    id: "ca_weight_loss",
    category: "cancer",
    severity: "urgent",
    questionFr: "Perte de poids inexpliquée > 5 kg en 6 mois ?",
    questionDe: "Ungeklärter Gewichtsverlust > 5 kg in 6 Monaten?",
  },
  {
    id: "ca_night_pain",
    category: "cancer",
    severity: "elevated",
    questionFr: "Douleur nocturne intense, non soulagée par le repos ou un changement de position ?",
    questionDe: "Starker nächtlicher Schmerz, nicht durch Ruhe oder Lagewechsel gelindert?",
    hintFr: "Différencier des douleurs mécaniques améliorées au repos",
    hintDe: "Von mechanischen Schmerzen unterscheiden, die in Ruhe besser werden",
  },
  {
    id: "ca_no_improvement",
    category: "cancer",
    severity: "elevated",
    questionFr: "Aucune amélioration depuis > 4-6 semaines malgré le repos et un traitement adapté ?",
    questionDe: "Keine Besserung seit > 4-6 Wochen trotz Ruhe und angepasster Behandlung?",
  },
  {
    id: "ca_age_new",
    category: "cancer",
    severity: "moderate",
    questionFr: "Patient(e) > 50 ans avec apparition récente (premier épisode) ?",
    questionDe: "Patient/in > 50 Jahre mit kürzlichem Auftreten (erste Episode)?",
  },

  // ─── Infection (urgent) ─────────────────────────────────────────
  {
    id: "inf_fever",
    category: "infection",
    severity: "urgent",
    questionFr: "Fièvre persistante > 38°C ou frissons inexpliqués ?",
    questionDe: "Anhaltendes Fieber > 38°C oder ungeklärte Schüttelfröste?",
  },
  {
    id: "inf_immuno",
    category: "infection",
    severity: "elevated",
    questionFr: "Immunodépression (VIH, corticoïdes long terme, chimiothérapie, transplant) ?",
    questionDe: "Immunsuppression (HIV, langfristige Kortikoide, Chemotherapie, Transplantation)?",
  },
  {
    id: "inf_iv_drug",
    category: "infection",
    severity: "elevated",
    questionFr: "Toxicomanie intraveineuse actuelle ou récente ?",
    questionDe: "Aktuelle oder kürzliche intravenöse Drogenabhängigkeit?",
  },
  {
    id: "inf_recent",
    category: "infection",
    severity: "moderate",
    questionFr: "Infection récente (urinaire, peau, ORL) dans les 6 dernières semaines ?",
    questionDe: "Kürzliche Infektion (Harnwege, Haut, HNO) in den letzten 6 Wochen?",
  },

  // ─── Fracture vertébrale (élevé) ─────────────────────────────────
  {
    id: "fr_trauma_recent",
    category: "fracture",
    severity: "urgent",
    questionFr: "Traumatisme significatif récent (chute, AVP, choc) < 6 semaines ?",
    questionDe: "Signifikantes kürzliches Trauma (Sturz, Verkehrsunfall, Stoß) < 6 Wochen?",
  },
  {
    id: "fr_osteoporosis",
    category: "fracture",
    severity: "elevated",
    questionFr: "Ostéoporose connue (DXA T-score < -2,5) ou fracture de fragilité antérieure ?",
    questionDe: "Bekannte Osteoporose (DXA T-Score < -2,5) oder vorherige Fragilitätsfraktur?",
  },
  {
    id: "fr_corticoids",
    category: "fracture",
    severity: "moderate",
    questionFr: "Corticothérapie au long cours (> 3 mois) ?",
    questionDe: "Langfristige Kortikoidtherapie (> 3 Monate)?",
  },
  {
    id: "fr_age_sudden",
    category: "fracture",
    severity: "moderate",
    questionFr: "Patient(e) > 70 ans avec apparition brutale après effort minime ?",
    questionDe: "Patient/in > 70 Jahre mit plötzlichem Auftreten nach minimaler Anstrengung?",
  },

  // ─── Spondylarthrite axiale (modéré — orientation rhumato) ──────
  {
    id: "spa_age_young",
    category: "spondyloarthritis",
    severity: "moderate",
    questionFr: "Patient(e) < 40 ans avec lombalgie chronique inflammatoire ?",
    questionDe: "Patient/in < 40 Jahre mit chronisch entzündlicher Lumbalgie?",
  },
  {
    id: "spa_morning_stiffness",
    category: "spondyloarthritis",
    severity: "moderate",
    questionFr: "Raideur matinale > 30 min, s'améliorant à l'exercice (pas au repos) ?",
    questionDe: "Morgensteifigkeit > 30 Min, Besserung durch Bewegung (nicht durch Ruhe)?",
  },
  {
    id: "spa_night_2nd_half",
    category: "spondyloarthritis",
    severity: "moderate",
    questionFr: "Douleur nocturne 2ᵉ moitié de la nuit faisant lever le patient ?",
    questionDe: "Nächtlicher Schmerz in der 2. Nachthälfte, der den Patienten aufwachen lässt?",
  },
  {
    id: "spa_family",
    category: "spondyloarthritis",
    severity: "moderate",
    questionFr: "Antécédents familiaux ou personnels : SpA, psoriasis, MICI, uvéite ?",
    questionDe: "Familiäre oder persönliche Anamnese: SpA, Psoriasis, CED, Uveitis?",
  },

  // ─── Déficit neurologique progressif (urgent) ───────────────────
  {
    id: "neuro_motor_progressive",
    category: "neuro_progressive",
    severity: "urgent",
    questionFr: "Faiblesse motrice progressive d'un membre inférieur (impossible de marcher sur la pointe des pieds OU sur les talons) ?",
    questionDe: "Progressive motorische Schwäche eines unteren Glieds (kann nicht auf Zehenspitzen ODER Fersen gehen)?",
  },
  {
    id: "neuro_atrophy",
    category: "neuro_progressive",
    severity: "elevated",
    questionFr: "Atrophie musculaire visible d'un membre inférieur ?",
    questionDe: "Sichtbare Muskelatrophie eines unteren Glieds?",
  },
  {
    id: "neuro_areflexia",
    category: "neuro_progressive",
    severity: "elevated",
    questionFr: "Réflexes ostéo-tendineux abolis (rotulien ou achilléen) ?",
    questionDe: "Erloschene Sehnenreflexe (Patellar- oder Achillessehnenreflex)?",
  },
];

export const CATEGORY_LABELS: Record<FlagCategory, { fr: string; de: string; emoji: string }> = {
  cauda_equina: { fr: "Syndrome queue de cheval", de: "Cauda-Equina-Syndrom", emoji: "🚨" },
  cancer: { fr: "Cancer / métastases", de: "Krebs / Metastasen", emoji: "🎗️" },
  infection: { fr: "Infection", de: "Infektion", emoji: "🦠" },
  fracture: { fr: "Fracture vertébrale", de: "Wirbelfraktur", emoji: "🦴" },
  spondyloarthritis: { fr: "Spondylarthrite axiale", de: "Axiale Spondyloarthritis", emoji: "🔥" },
  neuro_progressive: { fr: "Déficit neurologique progressif", de: "Progressives neurologisches Defizit", emoji: "⚡" },
  trauma: { fr: "Traumatisme récent", de: "Kürzliches Trauma", emoji: "💥" },
};

export const SEVERITY_META: Record<
  FlagSeverity,
  { fr: string; de: string; color: string; bg: string; weight: number }
> = {
  urgent_vital: {
    fr: "URGENCE VITALE",
    de: "VITALE NOTFALL",
    color: "#7f1d1d",
    bg: "#fee2e2",
    weight: 100,
  },
  urgent: { fr: "Urgent", de: "Dringend", color: "#c0392b", bg: "#fed7d7", weight: 50 },
  elevated: { fr: "Élevé", de: "Hoch", color: "#d35400", bg: "#fed7aa", weight: 20 },
  moderate: { fr: "Modéré", de: "Mäßig", color: "#d4ac0d", bg: "#fef3c7", weight: 5 },
};

// ─── Logique de décision ────────────────────────────────────────
export type FlagAssessment = {
  flagsByCategory: Record<FlagCategory, RedFlag[]>;
  totalScore: number;
  highestSeverity: FlagSeverity | null;
  caudaEquinaCount: number; // nombre de symptômes queue de cheval cochés
  decision: Decision;
};

export type Decision = {
  level: "ok" | "caution" | "urgent" | "emergency";
  titleFr: string;
  titleDe: string;
  recommendationFr: string;
  recommendationDe: string;
};

export function assessFlags(checkedIds: Set<string>): FlagAssessment {
  const checked = FLAGS.filter((f) => checkedIds.has(f.id));
  const flagsByCategory = {} as Record<FlagCategory, RedFlag[]>;
  for (const f of checked) {
    if (!flagsByCategory[f.category]) flagsByCategory[f.category] = [];
    flagsByCategory[f.category].push(f);
  }
  const totalScore = checked.reduce((s, f) => s + SEVERITY_META[f.severity].weight, 0);
  const severityOrder: FlagSeverity[] = ["urgent_vital", "urgent", "elevated", "moderate"];
  const highestSeverity =
    severityOrder.find((sv) => checked.some((f) => f.severity === sv)) ?? null;
  const caudaEquinaCount = (flagsByCategory["cauda_equina"] ?? []).length;

  const decision = makeDecision(highestSeverity, caudaEquinaCount, checked.length);
  return { flagsByCategory, totalScore, highestSeverity, caudaEquinaCount, decision };
}

function makeDecision(
  severity: FlagSeverity | null,
  caudaCount: number,
  totalCount: number
): Decision {
  // Queue de cheval : ≥ 1 symptôme = urgence absolue (KCE 287)
  if (caudaCount >= 1) {
    return {
      level: "emergency",
      titleFr: "🚨 URGENCE — Suspicion de syndrome de queue de cheval",
      titleDe: "🚨 NOTFALL — Verdacht auf Cauda-Equina-Syndrom",
      recommendationFr:
        "STOP École du Dos. IRM lombaire en URGENCE (< 24h) + avis neurochirurgical immédiat. Téléphoner directement au médecin traitant et au MPR référent. Documenter dans le dossier l'heure de découverte des symptômes.",
      recommendationDe:
        "STOPP Rückenschule. Lumbale MRT als NOTFALL (< 24h) + sofortige neurochirurgische Beratung. Direkt Hausarzt und zuständigen PMR anrufen. Zeitpunkt der Symptomerkennung in der Akte dokumentieren.",
    };
  }

  if (severity === "urgent_vital" || severity === "urgent") {
    return {
      level: "urgent",
      titleFr: "⚠️ Lombalgie potentiellement spécifique — orientation médicale",
      titleDe: "⚠️ Möglicherweise spezifische Lumbalgie — ärztliche Überweisung",
      recommendationFr:
        "Suspendre la prescription EDD jusqu'à clarification. Orienter vers le MPR HSNE pour examen approfondi + bilan complémentaire (imagerie, biologie). NE PAS débuter le programme tant que la cause spécifique n'est pas écartée.",
      recommendationDe:
        "EDD-Verordnung aussetzen bis zur Klärung. An PMR SNH überweisen für gründliche Untersuchung + Zusatzuntersuchungen (Bildgebung, Labor). Programm NICHT starten, bis spezifische Ursache ausgeschlossen ist.",
    };
  }

  if (severity === "elevated") {
    return {
      level: "caution",
      titleFr: "🟠 Vigilance — facteurs nécessitant un avis MPR",
      titleDe: "🟠 Wachsamkeit — Faktoren erfordern PMR-Beratung",
      recommendationFr:
        "Le programme EDD reste possible mais l'avis du MPR est requis avant le démarrage. Documenter les éléments et tracer la décision. Surveillance accrue durant les 6 premières séances.",
      recommendationDe:
        "EDD-Programm bleibt möglich, aber PMR-Beratung vor Beginn erforderlich. Elemente dokumentieren und Entscheidung nachverfolgen. Verstärkte Überwachung während der ersten 6 Sitzungen.",
    };
  }

  if (severity === "moderate" && totalCount > 0) {
    return {
      level: "caution",
      titleFr: "🟡 Drapeau modéré — à mentionner au MPR",
      titleDe: "🟡 Mäßige Flagge — dem PMR zu erwähnen",
      recommendationFr:
        "Élément(s) modéré(s) à signaler au MPR responsable. Le programme EDD est possible avec vigilance et suivi standard. Si suspicion de spondylarthrite axiale chez patient < 40 ans : orientation rhumato recommandée.",
      recommendationDe:
        "Mäßige(s) Element(e) dem zuständigen PMR melden. EDD-Programm ist mit Wachsamkeit und Standardnachsorge möglich. Bei Verdacht auf axiale Spondyloarthritis bei Patient < 40: Rheumatologie-Überweisung empfohlen.",
    };
  }

  return {
    level: "ok",
    titleFr: "✅ Aucun drapeau rouge identifié",
    titleDe: "✅ Keine rote Flagge identifiziert",
    recommendationFr:
      "Tableau de lombalgie commune compatible avec le programme École du Dos. Vérification à refaire en cas d'apparition de nouveaux symptômes durant le programme.",
    recommendationDe:
      "Bild einer gewöhnlichen Lumbalgie, kompatibel mit dem Rückenschule-Programm. Erneute Überprüfung bei Auftreten neuer Symptome während des Programms.",
  };
}

// ─── Helpers ────────────────────────────────────────────────────
export function flagsByCategory(category: FlagCategory): RedFlag[] {
  return FLAGS.filter((f) => f.category === category);
}

export const ALL_CATEGORIES: FlagCategory[] = [
  "cauda_equina",
  "neuro_progressive",
  "fracture",
  "cancer",
  "infection",
  "spondyloarthritis",
];

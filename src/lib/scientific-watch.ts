/**
 * Veille scientifique automatisée — Low Back Pain
 *
 * Réponse Q10 « bouton magique » Philippe : « Une dashboard qui montre
 * une veille scientifique sur le rachis LBP / LBP chronique et qui
 * propose dynamiquement les interventions sur les protocoles. »
 *
 * En production : pull RSS PubMed (Entrez API) + abstract via API
 * Anthropic Claude pour résumé clinique pertinent + tagging Copilot
 * vers les concepts utilisés dans le service.
 *
 * Pour la démo : 12 publications mock 2025-2026 réalistes.
 */

export type ArticleTopic =
  | "exercise"
  | "psychosocial"
  | "imaging"
  | "pharmacology"
  | "ai_decision"
  | "manual_therapy"
  | "education"
  | "biomarkers";

export type ArticleEvidenceLevel = "meta_analysis" | "rct" | "cohort" | "review" | "case_series" | "expert_opinion";

export type Article = {
  id: string;
  title: string;
  authors: string;
  journal: string;
  year: number;
  date: string; // ISO publication date
  pubmedId: string;
  topic: ArticleTopic;
  evidenceLevel: ArticleEvidenceLevel;
  /** Résumé bref (genere par IA) */
  tldr: string;
  /** Implication concrète proposée pour le service EDD HSNE */
  hsneImplication: string;
  /** Score de pertinence pour HSNE 0-100 */
  relevanceScore: number;
  saved?: boolean;
};

export const TOPIC_META: Record<ArticleTopic, { fr: string; de: string; color: string; icon: string }> = {
  exercise: { fr: "Exercice / réadaptation", de: "Bewegung / Reha", color: "#1A6B45", icon: "🏃" },
  psychosocial: { fr: "Psycho-social", de: "Psychosozial", color: "#D35400", icon: "🧠" },
  imaging: { fr: "Imagerie", de: "Bildgebung", color: "#1F96B5", icon: "📷" },
  pharmacology: { fr: "Pharmacologie", de: "Pharmakologie", color: "#7C3AED", icon: "💊" },
  ai_decision: { fr: "IA / Aide décision", de: "KI / Entscheidung", color: "#0891B2", icon: "🤖" },
  manual_therapy: { fr: "Thérapie manuelle", de: "Manuelle Therapie", color: "#1D2C50", icon: "✋" },
  education: { fr: "Éducation patient", de: "Patientenbildung", color: "#EC4899", icon: "📖" },
  biomarkers: { fr: "Biomarqueurs", de: "Biomarker", color: "#059669", icon: "🧬" },
};

export const EVIDENCE_META: Record<ArticleEvidenceLevel, { fr: string; de: string; weight: number }> = {
  meta_analysis: { fr: "Méta-analyse", de: "Meta-Analyse", weight: 5 },
  rct: { fr: "Essai randomisé contrôlé", de: "Randomisierte kontrollierte Studie", weight: 4 },
  cohort: { fr: "Étude de cohorte", de: "Kohortenstudie", weight: 3 },
  review: { fr: "Revue systématique", de: "Systematische Übersicht", weight: 3 },
  case_series: { fr: "Série de cas", de: "Fallserie", weight: 1 },
  expert_opinion: { fr: "Avis d'expert", de: "Expertenmeinung", weight: 1 },
};

// 12 articles mock, dates récentes 2025-2026, sujets variés
export const ARTICLES: Article[] = [
  {
    id: "art-001",
    title: "Effects of multimodal exercise on chronic low back pain: 12-month follow-up of a multicenter RCT",
    authors: "Ferreira ML, Hancock M, et al.",
    journal: "The Lancet Rheumatology",
    year: 2026,
    date: "2026-04-22",
    pubmedId: "39201234",
    topic: "exercise",
    evidenceLevel: "rct",
    tldr:
      "RCT 1247 patients : programme multimodal (renforcement + aérobie + éducation neurosciences) supérieur à exercice seul à 12 mois. NNT 6 pour réduction EVA ≥ 30%. Effet maintenu sans re-coaching.",
    hsneImplication:
      "Confirme la pertinence du protocole École du Dos HSNE (multimodal). Renforce l'argument INAMI/direction : maintien à 12 mois sans rappel = ROI long terme. Pas de changement protocole.",
    relevanceScore: 95,
  },
  {
    id: "art-002",
    title: "Cognitive Functional Therapy vs core stabilization in chronic LBP: Network meta-analysis of 47 trials",
    authors: "O'Sullivan P, Caneiro JP, et al.",
    journal: "British Journal of Sports Medicine",
    year: 2026,
    date: "2026-04-08",
    pubmedId: "39198765",
    topic: "psychosocial",
    evidenceLevel: "meta_analysis",
    tldr:
      "47 essais (n=4892) : la Cognitive Functional Therapy (CFT) surpasse les approches purement biomécaniques sur la douleur (-1.4 pt EVA), incapacité (-7.2 pts ODI) et kinésiophobie. Effet ×2 chez les patients à drapeaux jaunes.",
    hsneImplication:
      "À intégrer dans la formation continue de l'équipe. Compatible avec les 2 séances psy actuelles. Suggérer un module CFT court (4h) pour Philippe et Jean-Luc dès Q4 2026.",
    relevanceScore: 90,
  },
  {
    id: "art-003",
    title: "AI-augmented physiotherapy intake notes: clinician acceptance and time savings (RCT)",
    authors: "Tham J, Wei L, et al.",
    journal: "JAMA Network Open",
    year: 2026,
    date: "2026-03-30",
    pubmedId: "39187654",
    topic: "ai_decision",
    evidenceLevel: "rct",
    tldr:
      "342 thérapeutes randomisés : LLM (Whisper + GPT-4) pré-remplissant les notes T0. Gain temps moyen 28 min/patient (p<0.001), satisfaction +18 pts, qualité documentaire ≥ témoin selon audit aveugle.",
    hsneImplication:
      "Validation scientifique exacte de notre workflow Plaud + Copilot. À citer dans le pitch direction. Confirme le 35 min de gain estimé (légèrement en-dessous de notre claim).",
    relevanceScore: 98,
  },
  {
    id: "art-004",
    title: "MRI for non-specific low back pain: when not to image — updated evidence and decision aid",
    authors: "Maher CG, Underwood M, et al.",
    journal: "BMJ",
    year: 2026,
    date: "2026-03-15",
    pubmedId: "39176543",
    topic: "imaging",
    evidenceLevel: "review",
    tldr:
      "Confirmation : IRM systématique en lombalgie non spécifique inutile (no change in outcomes, +50% surdiagnostic). Décision arbre intégré KCE 287 reste la référence en l'absence de drapeaux rouges.",
    hsneImplication:
      "Conforte le module drapeaux rouges actuel. À utiliser pour rappeler aux MPR et médecins traitants l'intérêt de ne pas multiplier les imageries. Affiche fixe à imprimer pour secrétariat.",
    relevanceScore: 75,
  },
  {
    id: "art-005",
    title: "Pacing-based pacing-graded exercise hybrid for chronic LBP: 6-month results",
    authors: "Nicholas MK, Tonkin L, et al.",
    journal: "Pain",
    year: 2026,
    date: "2026-02-28",
    pubmedId: "39165432",
    topic: "exercise",
    evidenceLevel: "rct",
    tldr:
      "Programme hybride pacing par paliers temporels + graded exposure : meilleure adhésion (drop-out 9% vs 18% groupe contrôle) et baisse EVA équivalente. Patients à risque psychosocial particulièrement bénéficiaires.",
    hsneImplication:
      "Notre protocole 36 séances 2x/sem est déjà aligné. Mention dans la brochure v2026 → ajouter référence pacing temporel comme principe explicite. Outil suivi adhésion utile.",
    relevanceScore: 85,
  },
  {
    id: "art-006",
    title: "Biopsychosocial education vs structural education for chronic LBP: a systematic review",
    authors: "Moseley GL, Butler DS, et al.",
    journal: "Physical Therapy",
    year: 2026,
    date: "2026-02-12",
    pubmedId: "39154321",
    topic: "education",
    evidenceLevel: "review",
    tldr:
      "L'éducation neurosciences de la douleur (Pain Neuroscience Education) supérieure à l'éducation purement biomécanique (anatomique). Effet sur catastrophisation TSK, douleur EVA, retour au travail.",
    hsneImplication:
      "Justifie nos 6 métaphores HSNE (locomotive, éponge, câble nerveux). À incorporer formellement dans la formation des MPR prescripteurs pour homogénéiser le discours.",
    relevanceScore: 92,
  },
  {
    id: "art-007",
    title: "Tramadol vs placebo for chronic LBP: long-term safety signals from a 2025 EMA analysis",
    authors: "European Medicines Agency",
    journal: "Drug Safety",
    year: 2026,
    date: "2026-02-04",
    pubmedId: "39143210",
    topic: "pharmacology",
    evidenceLevel: "review",
    tldr:
      "Analyse EMA 23 cohortes : Tramadol au long cours en lombalgie chronique = ratio bénéfice/risque défavorable. Recommandation : limiter aux poussées aiguës < 4 semaines.",
    hsneImplication:
      "À transmettre aux MPR prescripteurs. Plusieurs patients EDD HSNE sous Tramadol au long cours (cf Renard p013). Outil intéressant pour discussion sevrage avec médecin traitant.",
    relevanceScore: 80,
  },
  {
    id: "art-008",
    title: "Inflammatory biomarkers as predictors of chronification in acute LBP",
    authors: "Thompson J, Ng KKM, et al.",
    journal: "European Spine Journal",
    year: 2026,
    date: "2026-01-22",
    pubmedId: "39132109",
    topic: "biomarkers",
    evidenceLevel: "cohort",
    tldr:
      "Cohorte 1102 lombalgies aiguës : CRP > 3 mg/L et IL-6 > 5 pg/mL à J7 prédisent chronification à 6 mois (AUC 0.81). Identification précoce des patients à orienter EDD.",
    hsneImplication:
      "Pas d'application immédiate (pas de prélèvement sanguin EDD). Mais argument pour proposer aux MPR de doser CRP/IL-6 sur les patients aigus puis orienter rapidement EDD si élevés. Discussion à initier.",
    relevanceScore: 60,
  },
  {
    id: "art-009",
    title: "Dry needling vs sham for chronic LBP: triple-blind RCT",
    authors: "Dommerholt J, Fernández-de-las-Peñas C, et al.",
    journal: "Pain Medicine",
    year: 2026,
    date: "2026-01-10",
    pubmedId: "39121098",
    topic: "manual_therapy",
    evidenceLevel: "rct",
    tldr:
      "Triple aveugle, n=384 : aucune différence significative dry needling vs sham sur EVA, ODI, satisfaction. Effet placebo dominant.",
    hsneImplication:
      "Confirme que l'approche EDD HSNE (exercice + éducation, pas de dry needling) reste la meilleure stratégie. Argument à conserver si patient demande dry needling externe.",
    relevanceScore: 55,
  },
  {
    id: "art-010",
    title: "Patient-reported goals and treatment success in EDD-type programs: 5-year cohort",
    authors: "Vlaeyen JWS, Linton SJ, et al.",
    journal: "Spine",
    year: 2025,
    date: "2025-12-15",
    pubmedId: "39110987",
    topic: "psychosocial",
    evidenceLevel: "cohort",
    tldr:
      "5 ans cohorte multicentrique 2847 patients : succès clinique fortement corrélé à l'expression d'objectifs SMART à T0 (HR 2.1). Patients sans objectif SMART à T0 : drop-out ×3.",
    hsneImplication:
      "Justifie scientifiquement notre champ « 3 objectifs SMART » dans l'anamnèse T0. À mettre en avant lors du pitch direction (notre formulaire est aligné evidence-based).",
    relevanceScore: 88,
  },
  {
    id: "art-011",
    title: "Telehealth follow-up in EDD programs reduces relapse at 12 months: pragmatic RCT",
    authors: "Bennell KL, Hinman RS, et al.",
    journal: "Annals of Internal Medicine",
    year: 2025,
    date: "2025-11-28",
    pubmedId: "39101876",
    topic: "exercise",
    evidenceLevel: "rct",
    tldr:
      "Suivi téléphonique mensuel (15 min) post-EDD pendant 6 mois : taux de récidive lombalgie à 12 mois 17% vs 31% (témoin). NNT 7. Coût marginal très faible.",
    hsneImplication:
      "Idée pour un module post-T2 : appel/visioconsult mensuel pendant 6 mois. PBKINE pourrait facturer ce suivi en complément. Pilote possible Q1 2027.",
    relevanceScore: 90,
  },
  {
    id: "art-012",
    title: "AI-based personalized exercise prescription for chronic LBP: feasibility study",
    authors: "Lopez-Rojas A, Garcia-Lopez D, et al.",
    journal: "npj Digital Medicine",
    year: 2025,
    date: "2025-11-10",
    pubmedId: "39090765",
    topic: "ai_decision",
    evidenceLevel: "case_series",
    tldr:
      "Algorithme ML personnalisant la prescription d'exercice selon profil patient (âge, scores T0, contraintes pro). Faisabilité démontrée n=87, étude RCT prévue 2026.",
    hsneImplication:
      "Vision moyen terme : module IA suggérant le programme appareils individualisé selon profil. À ajouter dans la roadmap v3 plateforme HSNE (post-MVP).",
    relevanceScore: 70,
  },
];

/** Articles non lus (pour badge sur le bouton magique) */
export function unreadCount(): number {
  return ARTICLES.filter((a) => !a.saved).length;
}

/** Top articles par pertinence */
export function topArticles(n = 3): Article[] {
  return [...ARTICLES].sort((a, b) => b.relevanceScore - a.relevanceScore).slice(0, n);
}

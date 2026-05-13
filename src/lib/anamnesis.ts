/**
 * Modèle d'anamnèse T0 École du Dos HSNE
 *
 * Structure dérivée de :
 * - 5 transcripts d'anamnèses Philippe Banaszak (Plaud AI)
 * - Brochure HSNE Bro 10.02 page 2 — sections officielles
 * - KCE 287 (drapeaux rouges intégrés via module séparé)
 *
 * Les sections suivent l'ordre naturel observé en consultation :
 * plainte → histoire → impact 24h → facteurs → EVA → médical →
 * profession → flags → représentation/objectifs.
 */

export type AnamnesisData = {
  // Métadonnées
  meta: {
    patientId: string;
    interviewerId: string;
    startedAt: string;
    completedAt: string | null;
    transcriptSource?: "plaud" | "manual" | null;
  };

  // 1. Plainte principale
  mainComplaint: {
    description: string;
    locations: string[]; // zones cochées sur body chart
    irradiation: string;
    sensationType: string[]; // douleur, picotement, fourmillement, brûlure, engourdissement
  };

  // 2. Histoire de la douleur
  painHistory: {
    onsetDate: string;
    onsetType: "" | "traumatic" | "spontaneous" | "post_surgical" | "progressive" | "other";
    onsetDetails: string;
    evolution: "" | "improving" | "stable" | "worsening" | "fluctuating";
    previousEpisodes: string;
    treatmentsTried: string;
  };

  // 3. Schéma sur 24h
  daySchema: {
    worstMoment: string[]; // morning, day, evening, night
    morningStiffnessDuration: string;
    sittingTolerance: string;
    walkingTolerance: string;
    sleepQuality: "" | "good" | "fragmented" | "poor";
    sleepHoursAvg: string;
    nightAwakenings: string;
  };

  // 4. Facteurs provocants / soulageants
  factors: {
    aggravating: string;
    relieving: string;
    currentMedications: string;
    medicationEffect: string;
  };

  // 5. EVA douleur (échelle Philippe)
  pain: {
    worst2weeks: number | null;
    average2weeks: number | null;
    atRest: number | null;
    onActivity: number | null;
  };

  // 6. Antécédents médicaux
  medical: {
    imaging: string; // IRM, scan, radio + dates + résultats
    surgeries: string;
    comorbidities: string[]; // HTA, diabète, thyroïde, dépression, etc.
    otherConditions: string;
    allergies: string;
    weightChange: string;
  };

  // 7. Profession & activités
  profession: {
    currentJob: string;
    jobConstraints: string[]; // station debout, port charges, posture statique, vibrations
    workStatus: "" | "active" | "sick_leave" | "invalidity" | "retired" | "unemployed" | "student";
    sickLeaveDuration: string;
    sportsHobbies: string;
    socialContext: string; // famille, aide, isolement
  };

  // 8. Drapeaux rouges (référence module RedFlags)
  // Cocher les IDs depuis la checklist KCE 287
  redFlagIds: string[];

  // 9. Yellow flags (psycho-social — ABCDEFWS)
  yellowFlags: {
    attitudes: string; // croyances sur le dos
    behaviors: string; // évitement, peur
    compensation: string; // accident, AT
    diagnosis: string; // confusion diagnostique
    emotions: string; // anxiété, dépression, catastrophisation
    family: string; // soutien
    work: string; // satisfaction, conflit
    social: string; // isolement
  };

  // 10. Représentation du patient & objectifs
  patientPerspective: {
    cause: string; // ce que le patient pense être à l'origine
    fears: string; // ce qu'il craint
    goals: string[]; // objectifs SMART
    expectations: string;
  };

  // 11. Notes libres du clinicien
  clinicianNotes: string;
};

// ─── Template vierge ──────────────────────────────────────────────
export function emptyAnamnesis(patientId: string, interviewerId = "Ph. Banaszak"): AnamnesisData {
  return {
    meta: {
      patientId,
      interviewerId,
      startedAt: new Date().toISOString(),
      completedAt: null,
      transcriptSource: null,
    },
    mainComplaint: { description: "", locations: [], irradiation: "", sensationType: [] },
    painHistory: {
      onsetDate: "",
      onsetType: "",
      onsetDetails: "",
      evolution: "",
      previousEpisodes: "",
      treatmentsTried: "",
    },
    daySchema: {
      worstMoment: [],
      morningStiffnessDuration: "",
      sittingTolerance: "",
      walkingTolerance: "",
      sleepQuality: "",
      sleepHoursAvg: "",
      nightAwakenings: "",
    },
    factors: { aggravating: "", relieving: "", currentMedications: "", medicationEffect: "" },
    pain: { worst2weeks: null, average2weeks: null, atRest: null, onActivity: null },
    medical: {
      imaging: "",
      surgeries: "",
      comorbidities: [],
      otherConditions: "",
      allergies: "",
      weightChange: "",
    },
    profession: {
      currentJob: "",
      jobConstraints: [],
      workStatus: "",
      sickLeaveDuration: "",
      sportsHobbies: "",
      socialContext: "",
    },
    redFlagIds: [],
    yellowFlags: {
      attitudes: "",
      behaviors: "",
      compensation: "",
      diagnosis: "",
      emotions: "",
      family: "",
      work: "",
      social: "",
    },
    patientPerspective: { cause: "", fears: "", goals: [], expectations: "" },
    clinicianNotes: "",
  };
}

// ─── Listes de référence pour le parser ───────────────────────────
const BODY_LOCATIONS = [
  { keywords: ["lombaire", "lombalgie", "bas du dos", "lendenwirbel", "lendenrücken"], value: "lombaire" },
  { keywords: ["sciatique", "ischias", "radicul"], value: "sciatique" },
  { keywords: ["dorsal", "milieu du dos", "thorac", "brustwirbel"], value: "dorsal" },
  { keywords: ["cervical", "nuque", "nacken", "halswirbel"], value: "cervical" },
  { keywords: ["épaule", "schulter"], value: "épaule" },
  { keywords: ["trapèze", "trapezius"], value: "trapèze" },
  { keywords: ["fessier", "fesse", "gesäß", "po"], value: "fessier" },
  { keywords: ["hanche", "hüfte"], value: "hanche" },
  { keywords: ["genou", "knie"], value: "genou" },
  { keywords: ["bras", "arm"], value: "bras" },
  { keywords: ["jambe", "bein", "cuisse"], value: "jambe" },
];

const SENSATION_KEYWORDS = [
  { keywords: ["picotement", "kribbeln"], value: "picotements" },
  { keywords: ["fourmillement", "ameisen", "ameisengefühl"], value: "fourmillements" },
  { keywords: ["brûlure", "brûle", "brennen"], value: "brûlure" },
  { keywords: ["engourdi", "endormi", "taub", "schlafen"], value: "engourdissement" },
  { keywords: ["choc électrique", "stromschlag"], value: "décharges" },
];

const COMORBIDITY_KEYWORDS = [
  { keywords: ["hypertension", "bluthochdruck", "tension"], value: "Hypertension artérielle" },
  { keywords: ["diabète", "diabetes", "zucker"], value: "Diabète" },
  { keywords: ["thyroïde", "schilddrüse", "thyroxine", "l-thyroxin"], value: "Trouble thyroïdien" },
  { keywords: ["dépression", "antidépresseur", "antidepressiva", "trazodone", "duloxetine"], value: "Dépression / antidépresseur" },
  { keywords: ["fibromyalgie", "fibromyalgia"], value: "Fibromyalgie" },
  { keywords: ["ostéoporose", "osteoporose", "dxa"], value: "Ostéoporose" },
  { keywords: ["endométriose", "endometriose"], value: "Endométriose" },
  { keywords: ["arthrose", "arthrosis"], value: "Arthrose" },
  { keywords: ["scoliose", "skoliose"], value: "Scoliose" },
  { keywords: ["asthme", "asthma"], value: "Asthme" },
  { keywords: ["cancer", "krebs"], value: "Antécédent cancer" },
  { keywords: ["burn-out", "burnout"], value: "Burn-out" },
  { keywords: ["lymphœdème", "lymphödem"], value: "Lymphœdème" },
];

const MEDICATION_KEYWORDS = [
  "paracétamol", "paracetamol", "dafalgan",
  "ibuprofène", "ibuprofen", "brufen",
  "tramadol",
  "diclofénac", "diclofenac", "voltarène",
  "celebrex", "célécoxib",
  "naproxène", "naproxen",
  "lyrica", "prégabaline", "pregabalin",
  "neurontin", "gabapentine", "gabapentin",
  "myolastan", "tétrazépam",
  "trazodone", "duloxetine", "duloxétine",
  "l-thyroxin", "lévothyrox",
  "cortison", "cortisone",
];

const SURGERY_KEYWORDS = [
  "opération", "OP", "chirurgie", "operation",
  "arthroscopie", "arthroskopie",
  "acromioplastie", "akromioplastie",
  "hernie discale", "bandscheibenvorfall",
  "arthrodèse", "arthrodese", "fusion",
  "prothèse", "prothese",
  "césarienne",
];

const SPORTS_KEYWORDS = [
  "vélo", "fahrrad", "course", "laufen", "natation", "schwimmen",
  "yoga", "pilates", "marche", "spazieren", "tennis", "football",
  "basket", "crossfit", "fitness", "gym", "danse", "tanzen",
  "rando", "wandern", "ski",
];

// Comorbidities also detect imagery
const IMAGERY_KEYWORDS = [
  { kw: "irm", label: "IRM" },
  { kw: "mrt", label: "IRM (MRT)" },
  { kw: "scanner", label: "Scanner CT" },
  { kw: "tomodensito", label: "Scanner CT" },
  { kw: "radio", label: "Radiographie" },
  { kw: "röntgen", label: "Radiographie" },
  { kw: "emg", label: "Électroneuromyogramme (EMG)" },
  { kw: "elektronomöogramm", label: "EMG" },
  { kw: "dxa", label: "Densitométrie osseuse (DXA)" },
];

const WORK_CONSTRAINT_KEYWORDS = [
  { keywords: ["station debout", "debout prolongé", "stehen", "stundenlang"], value: "Station debout prolongée" },
  { keywords: ["port de charge", "porter", "lasten", "heben"], value: "Port de charges" },
  { keywords: ["assis prolong", "sitzen", "sédentaire", "bureau"], value: "Position assise prolongée" },
  { keywords: ["vibration", "vibrations"], value: "Vibrations corps entier" },
  { keywords: ["conduite", "conduire", "chauffeur", "fahren"], value: "Conduite prolongée" },
  { keywords: ["écran", "ordinateur", "bildschirm", "télétravail"], value: "Travail sur écran" },
  { keywords: ["répétitif", "répétition", "wiederholt"], value: "Mouvements répétitifs" },
];

const RED_FLAG_KEYWORDS = [
  { keywords: ["impossible uriner", "rétention urinaire", "ne peut plus uriner"], id: "ce_urinary" },
  { keywords: ["incontinence fécale", "trouble sphinct"], id: "ce_fecal" },
  { keywords: ["anesthésie périnéale", "anesthésie en selle", "saddle"], id: "ce_saddle" },
  { keywords: ["paralysie progressive"], id: "ce_motor" },
  { keywords: ["antécédent cancer", "krebs"], id: "ca_history" },
  { keywords: ["perte de poids", "abgenommen", "gewichtsverlust"], id: "ca_weight_loss" },
  { keywords: ["douleur nocturne", "nuit douleur"], id: "ca_night_pain" },
  { keywords: ["ostéoporose", "osteoporose"], id: "fr_osteoporosis" },
  { keywords: ["fièvre"], id: "inf_fever" },
];

// ─── PARSER PRINCIPAL ─────────────────────────────────────────────
// Cette fonction simule l'extraction intelligente que ferait Copilot
// sur un transcript Plaud. Pour la démo HSNE, on combine :
// - Détection par mots-clés FR/DE
// - Extraction de phrases entières contenant les patterns
// - Pré-remplissage des sections structurées

export type ParseResult = {
  data: AnamnesisData;
  detectionLog: { section: string; field: string; value: string; source: string }[];
  confidence: number;
};

export function parseTranscript(transcript: string, patientId: string): ParseResult {
  const data = emptyAnamnesis(patientId);
  data.meta.transcriptSource = "plaud";
  const log: ParseResult["detectionLog"] = [];
  const lc = transcript.toLowerCase();
  const sentences = transcript
    .split(/[.!?]\s+|\n+/)
    .map((s) => s.trim())
    .filter(Boolean);

  // ─── 1. Plainte principale ───
  // Locations
  const detectedLocations = new Set<string>();
  BODY_LOCATIONS.forEach((loc) => {
    if (loc.keywords.some((k) => lc.includes(k))) {
      detectedLocations.add(loc.value);
      log.push({
        section: "Plainte principale",
        field: "Localisations",
        value: loc.value,
        source: loc.keywords.find((k) => lc.includes(k)) ?? "",
      });
    }
  });
  data.mainComplaint.locations = Array.from(detectedLocations);

  // Sensations
  const detectedSensations = new Set<string>();
  SENSATION_KEYWORDS.forEach((s) => {
    if (s.keywords.some((k) => lc.includes(k))) {
      detectedSensations.add(s.value);
      log.push({ section: "Plainte principale", field: "Sensations", value: s.value, source: "" });
    }
  });
  data.mainComplaint.sensationType = Array.from(detectedSensations);

  // Description de la plainte = premières phrases pertinentes
  const plainteSentences = sentences
    .filter((s) =>
      /(douleur|mal au|mal de|schmerz|tut weh|weh tut|hauptproblem|plainte|principal|main complaint)/i.test(
        s
      )
    )
    .slice(0, 3);
  if (plainteSentences.length > 0) {
    data.mainComplaint.description = plainteSentences.join(". ").slice(0, 500);
    log.push({
      section: "Plainte principale",
      field: "Description",
      value: data.mainComplaint.description.slice(0, 50) + "…",
      source: "extraction phrases",
    });
  }

  // ─── 2. Histoire de la douleur ───
  // Onset type
  if (/post[- ]op|opération|chirurgie|op\b|operation/.test(lc)) {
    data.painHistory.onsetType = "post_surgical";
    log.push({ section: "Histoire", field: "Type début", value: "Post-chirurgical", source: "" });
  } else if (/chute|accident|trauma|sturz|unfall/.test(lc)) {
    data.painHistory.onsetType = "traumatic";
    log.push({ section: "Histoire", field: "Type début", value: "Traumatique", source: "" });
  } else if (/progressif|progressivement|allmählich/.test(lc)) {
    data.painHistory.onsetType = "progressive";
    log.push({ section: "Histoire", field: "Type début", value: "Progressif", source: "" });
  } else if (/(soudain|brusque|d'un coup|plötzlich)/.test(lc)) {
    data.painHistory.onsetType = "spontaneous";
    log.push({ section: "Histoire", field: "Type début", value: "Spontané", source: "" });
  }

  // Onset date (ex: "ça fait 2 ans", "depuis 6 mois", "octobre 2023")
  const dateMatch = transcript.match(
    /(\d+)\s*(ans?|jahr|mois|monat|semaine|woche)|(\d{4})|(janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre)\s*(\d{4})?/i
  );
  if (dateMatch) {
    data.painHistory.onsetDate = dateMatch[0];
    log.push({
      section: "Histoire",
      field: "Date début",
      value: dateMatch[0],
      source: "regex date",
    });
  }

  // Evolution
  if (/améliore|besser|mieux/.test(lc) && !/pas mieux|nicht besser/.test(lc)) {
    data.painHistory.evolution = "improving";
  } else if (/aggrave|schlimmer|pire|empire/.test(lc)) {
    data.painHistory.evolution = "worsening";
  } else if (/stable|gleich|pareil/.test(lc)) {
    data.painHistory.evolution = "stable";
  } else if (/fluctu|wechsel|varie|jours/.test(lc)) {
    data.painHistory.evolution = "fluctuating";
  }

  // Treatments tried — kiné, infiltrations, etc.
  const treatments: string[] = [];
  if (/kiné|kine|physio/.test(lc)) treatments.push("Kinésithérapie classique");
  if (/infiltration/.test(lc)) treatments.push("Infiltrations");
  if (/ostéopathe|osteopath/.test(lc)) treatments.push("Ostéopathie");
  if (/acupuncture/.test(lc)) treatments.push("Acupuncture");
  if (/massage/.test(lc)) treatments.push("Massages");
  if (/reiki/.test(lc)) treatments.push("Reiki");
  if (treatments.length > 0) {
    data.painHistory.treatmentsTried = treatments.join(", ");
    log.push({
      section: "Histoire",
      field: "Traitements essayés",
      value: treatments.join(", "),
      source: "",
    });
  }

  // ─── 3. Schéma 24h ───
  const worst = new Set<string>();
  if (/le matin|au réveil|morgens|aufstehen/.test(lc)) worst.add("matin");
  if (/après-midi|nachmittag|journée|tag/.test(lc)) worst.add("journée");
  if (/le soir|abends|soir|après une journée/.test(lc)) worst.add("soir");
  if (/la nuit|nuit|nachts|nacht/.test(lc)) worst.add("nuit");
  data.daySchema.worstMoment = Array.from(worst);

  // Morning stiffness
  const stiffMatch = transcript.match(/raideur\s*matinale[^.]*?(\d+)\s*(min|heur)/i) ||
    transcript.match(/(\d+)\s*minute[s]?\s+pour\s+(?:se débloquer|repartir)/i);
  if (stiffMatch) {
    data.daySchema.morningStiffnessDuration = stiffMatch[0];
    log.push({
      section: "24h",
      field: "Raideur matinale",
      value: stiffMatch[0],
      source: "regex",
    });
  } else if (/raide.*matin|morgens.*steif/.test(lc)) {
    data.daySchema.morningStiffnessDuration = "Raideur matinale rapportée";
  }

  // Sleep
  if (/dort.*pas|insomni|nicht.*schlafen|kann.*nicht.*schlafen|réveil.*nuit|wach/.test(lc)) {
    data.daySchema.sleepQuality = "fragmented";
  } else if (/bien dort|gut.*schlafen|tip top|8 heures|8 stunden/.test(lc)) {
    data.daySchema.sleepQuality = "good";
  }

  const hoursMatch = transcript.match(/(\d+)\s*(heures?|stunden)/i);
  if (hoursMatch) {
    const n = parseInt(hoursMatch[1]);
    if (n >= 3 && n <= 12) data.daySchema.sleepHoursAvg = hoursMatch[0];
  }

  // ─── 4. Facteurs ───
  const aggravators: string[] = [];
  if (/assis.*long|sitzen.*lang|lang.*sitzen/.test(lc)) aggravators.push("Position assise prolongée");
  if (/debout.*long|stehen.*lang/.test(lc)) aggravators.push("Station debout prolongée");
  if (/se pencher|flexion|bücken|sich nach vorne/.test(lc)) aggravators.push("Flexion en avant");
  if (/porter|charge|heben|trag/.test(lc)) aggravators.push("Port de charges");
  if (/marcher.*difficile|gehen.*schwer/.test(lc)) aggravators.push("Marche prolongée");
  if (/stress|nerveus/.test(lc)) aggravators.push("Stress");
  if (aggravators.length > 0) {
    data.factors.aggravating = aggravators.join(" · ");
  }

  const relievers: string[] = [];
  if (/chaud|wärme|warm/.test(lc)) relievers.push("Application de chaud");
  if (/froid|kalt|kälte/.test(lc) && !/froid.*pas.*bien/.test(lc)) relievers.push("Application de froid");
  if (/marche.*bien|gehen.*hilft|bouger.*soulage/.test(lc)) relievers.push("Marche / mouvement");
  if (/repos|liegen|hinlegen/.test(lc)) relievers.push("Repos / position allongée");
  if (/position fœt|position foet|fetal|knie an die brust/.test(lc)) relievers.push("Position fœtale");
  if (/étirement|stretching|dehnen/.test(lc)) relievers.push("Étirements");
  if (relievers.length > 0) {
    data.factors.relieving = relievers.join(" · ");
  }

  // Medications detected
  const medsFound: string[] = [];
  MEDICATION_KEYWORDS.forEach((m) => {
    if (lc.includes(m)) {
      medsFound.push(m.charAt(0).toUpperCase() + m.slice(1));
      log.push({ section: "Facteurs", field: "Médicament", value: m, source: "" });
    }
  });
  if (medsFound.length > 0) {
    data.factors.currentMedications = Array.from(new Set(medsFound)).join(", ");
  }

  // ─── 5. EVA douleur ───
  // Recherche "7", "5/10", "8 sur 10", "à combien"
  const evaMatches = transcript.matchAll(/(\d+)(?:\s*\/\s*10|\s+sur\s+10|\s+pulsation|\s*\.|\s)/gi);
  const evaCandidates: number[] = [];
  for (const m of evaMatches) {
    const n = parseInt(m[1]);
    if (n >= 1 && n <= 10) evaCandidates.push(n);
  }
  if (evaCandidates.length > 0) {
    // Heuristique : pic = max ; moyenne = médiane
    const sorted = [...evaCandidates].sort((a, b) => a - b);
    data.pain.worst2weeks = sorted[sorted.length - 1];
    data.pain.average2weeks = sorted[Math.floor(sorted.length / 2)];
    log.push({
      section: "EVA",
      field: "Pic 2 sem.",
      value: String(data.pain.worst2weeks),
      source: "extraction nombres",
    });
  }

  // ─── 6. Antécédents médicaux ───
  // Imagerie
  const imagingDetected: string[] = [];
  IMAGERY_KEYWORDS.forEach((i) => {
    if (lc.includes(i.kw)) {
      imagingDetected.push(i.label);
      log.push({ section: "Médical", field: "Imagerie", value: i.label, source: i.kw });
    }
  });
  if (imagingDetected.length > 0) {
    data.medical.imaging = Array.from(new Set(imagingDetected)).join(", ");
  }

  // Chirurgies
  const surgeriesDetected: string[] = [];
  SURGERY_KEYWORDS.forEach((s) => {
    if (lc.includes(s.toLowerCase())) {
      surgeriesDetected.push(s.charAt(0).toUpperCase() + s.slice(1));
    }
  });
  if (surgeriesDetected.length > 0) {
    data.medical.surgeries = Array.from(new Set(surgeriesDetected)).join(", ");
    log.push({
      section: "Médical",
      field: "Chirurgies",
      value: data.medical.surgeries,
      source: "",
    });
  }

  // Comorbidités
  const comorbs = new Set<string>();
  COMORBIDITY_KEYWORDS.forEach((c) => {
    if (c.keywords.some((k) => lc.includes(k))) {
      comorbs.add(c.value);
      log.push({ section: "Médical", field: "Comorbidité", value: c.value, source: "" });
    }
  });
  data.medical.comorbidities = Array.from(comorbs);

  // Weight change
  if (/perte de poids|abgenommen|gewichtsverlust|perdu.*kilo/.test(lc)) {
    data.medical.weightChange = "Perte de poids rapportée";
    log.push({ section: "Médical", field: "Poids", value: "Perte rapportée", source: "" });
  } else if (/pris.*kilo|zugenommen|prise de poids/.test(lc)) {
    data.medical.weightChange = "Prise de poids rapportée";
  }

  // ─── 7. Profession ───
  // Détection métier
  const jobKeywords = [
    { kw: ["chauffeur", "lkw", "fahrer", "poids lourd"], value: "Chauffeur" },
    { kw: ["maçon", "maurer", "construction", "chantier"], value: "Maçon / ouvrier construction" },
    { kw: ["aide-soignant", "infirmier", "krankenschwester", "pflege"], value: "Aide-soignant / infirmier" },
    { kw: ["bureau", "cadre", "bürokauffrau", "büro"], value: "Travail de bureau" },
    { kw: ["enseignant", "lehrer", "professeur", "instituteur"], value: "Enseignant" },
    { kw: ["technicien de surface", "femme de ménage", "putzfrau", "nettoyage"], value: "Technicien de surface" },
    { kw: ["magasinier", "lagerarbeiter"], value: "Magasinier" },
    { kw: ["cuisinier", "koch"], value: "Cuisinier" },
    { kw: ["vendeuse", "verkäuferin", "vente"], value: "Vendeuse" },
    { kw: ["électricien", "elektriker"], value: "Électricien" },
    { kw: ["retraité", "rentner", "rentnerin"], value: "Retraité(e)" },
  ];
  for (const j of jobKeywords) {
    if (j.kw.some((k) => lc.includes(k))) {
      data.profession.currentJob = j.value;
      log.push({ section: "Profession", field: "Métier", value: j.value, source: "" });
      break;
    }
  }

  // Job constraints
  const constraints = new Set<string>();
  WORK_CONSTRAINT_KEYWORDS.forEach((c) => {
    if (c.keywords.some((k) => lc.includes(k))) constraints.add(c.value);
  });
  data.profession.jobConstraints = Array.from(constraints);

  // Work status
  if (/arrêt.*travail|arrêt maladie|krankgeschrieben|sick leave/.test(lc)) {
    data.profession.workStatus = "sick_leave";
  } else if (/invalidité|invalid|invalide/.test(lc)) {
    data.profession.workStatus = "invalidity";
  } else if (/retraite|rente|retired/.test(lc)) {
    data.profession.workStatus = "retired";
  } else if (data.profession.currentJob) {
    data.profession.workStatus = "active";
  }

  // Sports
  const sportsFound: string[] = [];
  SPORTS_KEYWORDS.forEach((s) => {
    if (lc.includes(s)) sportsFound.push(s);
  });
  if (sportsFound.length > 0) {
    data.profession.sportsHobbies = Array.from(new Set(sportsFound)).join(", ");
    log.push({
      section: "Profession",
      field: "Sport/loisirs",
      value: sportsFound.join(", "),
      source: "",
    });
  }

  // ─── 8. Red flags ───
  RED_FLAG_KEYWORDS.forEach((r) => {
    if (r.keywords.some((k) => lc.includes(k))) {
      data.redFlagIds.push(r.id);
      log.push({ section: "Drapeaux rouges", field: r.id, value: "DÉTECTÉ", source: "" });
    }
  });

  // ─── 9. Yellow flags (keyword detection) ───
  if (/peur de bouger|kinésiophobie|angst vor bewegung|angst.*bewegung/.test(lc)) {
    data.yellowFlags.behaviors = "Kinésiophobie / évitement du mouvement";
  }
  if (/catastroph/.test(lc)) {
    data.yellowFlags.attitudes = "Catastrophisation";
  }
  if (/dépression|antidepressiva|dépressi|traurig/.test(lc)) {
    data.yellowFlags.emotions = "Dépression rapportée";
  }
  if (/seul|isol|allein|einsam/.test(lc)) {
    data.yellowFlags.social = "Isolement social";
  }
  if (/conflit.*travail|hiérarch|chef/.test(lc)) {
    data.yellowFlags.work = "Conflit professionnel";
  }
  if (/accident.*travail|AT|berufsunfall/.test(lc)) {
    data.yellowFlags.compensation = "Contexte AT en cours";
  }

  // ─── 10. Représentation patient ───
  const goalSentences = sentences.filter((s) =>
    /(j'aimerais|j'aimerai|ich möchte|j'aimerais bien|reprendre|wieder können|wieder.*machen)/i.test(s)
  );
  if (goalSentences.length > 0) {
    data.patientPerspective.goals = goalSentences.slice(0, 3).map((s) => s.slice(0, 200));
    log.push({
      section: "Perspective",
      field: "Objectifs",
      value: `${goalSentences.length} objectifs détectés`,
      source: "",
    });
  }

  const causeSentences = sentences.filter((s) =>
    /(je pense que|d'après moi|à cause de|parce que|wegen|liegt an|denke ich)/i.test(s)
  );
  if (causeSentences.length > 0) {
    data.patientPerspective.cause = causeSentences[0].slice(0, 300);
  }

  // ─── Confidence score ───
  const sectionsFilled = [
    data.mainComplaint.locations.length > 0,
    data.painHistory.onsetType !== "",
    data.daySchema.worstMoment.length > 0,
    data.factors.aggravating !== "" || data.factors.relieving !== "",
    data.pain.worst2weeks != null,
    data.medical.comorbidities.length > 0 || data.medical.imaging !== "",
    data.profession.currentJob !== "",
    data.redFlagIds.length > 0,
    data.yellowFlags.behaviors !== "" || data.yellowFlags.emotions !== "",
    data.patientPerspective.goals.length > 0,
  ];
  const confidence = sectionsFilled.filter(Boolean).length / sectionsFilled.length;

  return { data, detectionLog: log, confidence };
}

// ─── Labels bilingues des sections ────────────────────────────────
export const SECTION_LABELS: Record<string, { fr: string; de: string }> = {
  mainComplaint: { fr: "Plainte principale", de: "Hauptbeschwerde" },
  painHistory: { fr: "Histoire de la douleur", de: "Schmerzgeschichte" },
  daySchema: { fr: "Schéma sur 24 h", de: "24h-Schema" },
  factors: { fr: "Facteurs aggravants / soulageants", de: "Aggravierende / lindernde Faktoren" },
  pain: { fr: "Évaluation de la douleur (EVA)", de: "Schmerzbewertung (VAS)" },
  medical: { fr: "Antécédents médicaux", de: "Medizinische Vorgeschichte" },
  profession: { fr: "Profession & activités", de: "Beruf & Aktivitäten" },
  redFlags: { fr: "Drapeaux rouges (KCE 287)", de: "Rote Flaggen (KCE 287)" },
  yellowFlags: { fr: "Drapeaux jaunes (psycho-social)", de: "Gelbe Flaggen (psychosozial)" },
  patientPerspective: { fr: "Représentation & objectifs du patient", de: "Patientenwahrnehmung & Ziele" },
  clinicianNotes: { fr: "Notes du clinicien", de: "Notizen des Klinikers" },
};

export const ONSET_TYPE_LABELS: Record<string, { fr: string; de: string }> = {
  traumatic: { fr: "Traumatique", de: "Traumatisch" },
  spontaneous: { fr: "Spontané", de: "Spontan" },
  post_surgical: { fr: "Post-chirurgical", de: "Postoperativ" },
  progressive: { fr: "Progressif", de: "Progressiv" },
  other: { fr: "Autre", de: "Andere" },
};

export const EVOLUTION_LABELS: Record<string, { fr: string; de: string }> = {
  improving: { fr: "S'améliore", de: "Bessert sich" },
  stable: { fr: "Stable", de: "Stabil" },
  worsening: { fr: "S'aggrave", de: "Verschlechtert sich" },
  fluctuating: { fr: "Fluctuante", de: "Schwankend" },
};

export const WORK_STATUS_LABELS: Record<string, { fr: string; de: string }> = {
  active: { fr: "En activité", de: "Aktiv berufstätig" },
  sick_leave: { fr: "En arrêt maladie", de: "Krankgeschrieben" },
  invalidity: { fr: "Invalidité", de: "Invalidität" },
  retired: { fr: "Retraité(e)", de: "Im Ruhestand" },
  unemployed: { fr: "Sans emploi", de: "Arbeitslos" },
  student: { fr: "Étudiant(e)", de: "Student/in" },
};

export const SLEEP_QUALITY_LABELS: Record<string, { fr: string; de: string }> = {
  good: { fr: "Bon", de: "Gut" },
  fragmented: { fr: "Fragmenté", de: "Fragmentiert" },
  poor: { fr: "Mauvais", de: "Schlecht" },
};

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
  {
    id: "p008",
    firstName: "Lukas",
    lastName: "Brandt",
    dob: "1998-04-11",
    gender: "M",
    lang: "de",
    job: "Maurer (Bauunternehmen)",
    prescriber: "Dr. H. Kaufmann",
    mutual: "Christliche Krankenkasse",
    status: "in_program",
    sessionsDone: 12,
    t0Date: "2026-03-18",
    t1Date: null,
    scoresT0: { pain_rest: 3, pain_activity: 8, had_a: 6, had_d: 4, odi: 38, tsk: 36, start: 4, wkg: 1.8 },
    scoresT1: null,
    yellowFlags: ["Pression de retour au chantier", "Indépendant — perte de revenu"],
    redFlags: [],
    goals: ["Reprendre les travaux lourds", "Course à pied 5 km", "Football amateur dimanche"],
    nextAppointment: "2026-05-13 08:30",
    complaint: "Sciatique L5 droite aiguë, début après faux mouvement chantier, 3 mois",
    hypothesis: "Conflit disco-radiculaire, excellent pronostic, jeune actif motivé",
    painTrend: trend(7, 2.5, 6),
  },
  {
    id: "p009",
    firstName: "Christine",
    lastName: "Lambert",
    dob: "1972-08-25",
    gender: "F",
    lang: "fr",
    job: "Aide-soignante (maison de repos)",
    prescriber: "Dr. M. Lejeune",
    mutual: "Solidaris",
    status: "in_program",
    sessionsDone: 18,
    t0Date: "2026-02-20",
    t1Date: null,
    scoresT0: { pain_rest: 6, pain_activity: 7, had_a: 13, had_d: 10, odi: 52, tsk: 46, start: 7, wkg: 1.0 },
    scoresT1: null,
    yellowFlags: ["Fibromyalgie associée", "Catastrophisation", "Sommeil perturbé", "Conflit hiérarchique au travail"],
    redFlags: [],
    goals: ["Diminuer la prise d'antalgiques", "Reprendre 4/5e", "Marcher 30 min sans pause"],
    nextAppointment: "2026-05-14 11:00",
    complaint: "Lombalgie diffuse + douleurs multi-sites, contexte fibromyalgie diagnostiquée",
    hypothesis: "Sensibilisation centrale dominante, plateau attendu, focus éducation à la douleur",
    painTrend: trend(7, 6, 5),
  },
  {
    id: "p010",
    firstName: "Marc",
    lastName: "Vandenberg",
    dob: "1965-01-30",
    gender: "M",
    lang: "fr",
    job: "Magasinier (en arrêt AT depuis 4 mois)",
    prescriber: "Dr. S. Henrot",
    mutual: "Mutualité Neutre",
    status: "in_program",
    sessionsDone: 8,
    t0Date: "2026-03-02",
    t1Date: null,
    scoresT0: { pain_rest: 5, pain_activity: 7, had_a: 10, had_d: 9, odi: 46, tsk: 50, start: 7, wkg: 1.1 },
    scoresT1: null,
    yellowFlags: ["Démotivation", "3 absences non justifiées", "Bénéfices secondaires AT", "TSK > 50"],
    redFlags: [],
    goals: ["À redéfinir avec le patient lors du recadrage"],
    nextAppointment: "2026-05-15 09:30",
    complaint: "Lombalgie chronique sur AT, 4e mois d'arrêt, conflit assurance",
    hypothesis: "Risque d'abandon élevé — alliance thérapeutique à reconstruire en priorité",
    painTrend: [
      { session: 1, pain: 7 },
      { session: 3, pain: 6.5 },
      { session: 5, pain: 7 },
      { session: 8, pain: 7.2 },
    ],
  },
  {
    id: "p011",
    firstName: "Hildegard",
    lastName: "Müller",
    dob: "1948-11-12",
    gender: "F",
    lang: "de",
    job: "Rentnerin (ehem. Sekretärin)",
    prescriber: "Dr. H. Kaufmann",
    mutual: "Freie Krankenkasse",
    status: "in_program",
    sessionsDone: 16,
    t0Date: "2026-02-10",
    t1Date: null,
    scoresT0: { pain_rest: 4, pain_activity: 6, had_a: 7, had_d: 6, odi: 44, tsk: 40, start: 5, wkg: 0.7 },
    scoresT1: null,
    yellowFlags: ["Peur de tomber", "Vit seule", "Isolement social"],
    redFlags: ["Ostéoporose sévère (DXA T-score -3.1) — pas de manipulations"],
    goals: ["Marcher 20 min en extérieur", "Monter 2 étages sans aide", "Reprendre le club du 3e âge"],
    nextAppointment: "2026-05-13 14:00",
    complaint: "Lombalgie chronique sur arthrose multi-étagée, 78 ans, ostéoporose",
    hypothesis: "Déconditionnement majeur, focus renforcement progressif et équilibre",
    painTrend: trend(6, 4, 6),
  },
  {
    id: "p012",
    firstName: "Wolfgang",
    lastName: "Becker",
    dob: "1970-05-19",
    gender: "M",
    lang: "de",
    job: "Lagerarbeiter (mi-temps thérapeutique)",
    prescriber: "Dr. H. Kaufmann",
    mutual: "Christliche Krankenkasse",
    status: "t0_done",
    sessionsDone: 2,
    t0Date: "2026-04-28",
    t1Date: null,
    scoresT0: { pain_rest: 4, pain_activity: 6, had_a: 7, had_d: 5, odi: 40, tsk: 38, start: 5, wkg: 1.5 },
    scoresT1: null,
    yellowFlags: ["Pression de l'employeur pour reprise totale"],
    redFlags: [],
    goals: ["Reprendre le port de charges 15 kg", "Sevrer les antalgiques"],
    nextAppointment: "2026-05-12 15:00",
    complaint: "Post-arthrodèse L4-L5 (8 mois), raideur résiduelle, douleur cicatricielle",
    hypothesis: "Récupération post-op progressive — mobilisation contrôlée + éducation gestuelle",
    painTrend: trend(6, 5.5, 3),
  },
  {
    id: "p013",
    firstName: "Thomas",
    lastName: "Renard",
    dob: "1980-07-04",
    gender: "M",
    lang: "fr",
    job: "Électricien indépendant",
    prescriber: "Dr. S. Henrot",
    mutual: "Mutualité Libre",
    status: "scheduled",
    sessionsDone: 0,
    t0Date: "2026-05-19",
    t1Date: null,
    scoresT0: null,
    scoresT1: null,
    yellowFlags: [],
    redFlags: ["Trouble sphinctérien rapporté", "Hypoesthésie périnéale", "IRM URGENTE avant T0 — suspicion queue de cheval"],
    goals: [],
    nextAppointment: "2026-05-19 08:30",
    complaint: "Lombo-radiculalgie + paresthésies périnéales — drapeaux rouges majeurs",
    hypothesis: "T0 SUSPENDU — orientation imagerie en urgence + consultation neurochirurgicale",
    painTrend: [],
  },
  {
    id: "p014",
    firstName: "Sophie",
    lastName: "Dethier",
    dob: "1983-02-28",
    gender: "F",
    lang: "fr",
    job: "Cadre RH (en arrêt burn-out)",
    prescriber: "Dr. M. Lejeune",
    mutual: "Partenamut",
    status: "in_program",
    sessionsDone: 14,
    t0Date: "2026-02-25",
    t1Date: null,
    scoresT0: { pain_rest: 3, pain_activity: 5, had_a: 16, had_d: 13, odi: 34, tsk: 32, start: 6, wkg: 1.6 },
    scoresT1: null,
    yellowFlags: ["Burn-out professionnel", "HAD-A 16 (sévère)", "Suivi psychologique parallèle (Dr. Wauters)"],
    redFlags: [],
    goals: ["Reprise mi-temps thérapeutique", "Apaiser la rumination mentale", "Reprendre le yoga 2x/sem"],
    nextAppointment: "2026-05-12 10:00",
    complaint: "Lombalgies sur fond de stress chronique, somatisation, contexte burn-out",
    hypothesis: "Composante psycho-émotionnelle prédominante — coordination étroite avec psychologue",
    painTrend: trend(5, 3, 6),
  },
  {
    id: "p015",
    firstName: "Elena",
    lastName: "Ricci",
    dob: "1992-09-15",
    gender: "F",
    lang: "fr",
    job: "Enseignante primaire (congé maternité jusqu'au 30/06)",
    prescriber: "Dr. M. Lejeune",
    mutual: "Mutualité Chrétienne",
    status: "in_program",
    sessionsDone: 10,
    t0Date: "2026-03-10",
    t1Date: null,
    scoresT0: { pain_rest: 4, pain_activity: 6, had_a: 9, had_d: 7, odi: 36, tsk: 34, start: 5, wkg: 1.4 },
    scoresT1: null,
    yellowFlags: ["Sommeil fragmenté (bébé 4 mois)", "Charge mentale parentale élevée"],
    redFlags: [],
    goals: ["Porter bébé sans douleur", "Reprendre la course à pied", "Tenir une journée d'école debout"],
    nextAppointment: "2026-05-14 09:00",
    complaint: "Lombalgies post-partum (4 mois), diastasis abdominal modéré (2,5 cm)",
    hypothesis: "Déconditionnement post-grossesse + asymétrie portage — bon pronostic",
    painTrend: trend(6, 4, 5),
  },
  {
    id: "p016",
    firstName: "Jonas",
    lastName: "Weber",
    dob: "2008-06-21",
    gender: "M",
    lang: "de",
    job: "Schüler (Gymnasium 5. Klasse)",
    prescriber: "Dr. H. Kaufmann",
    mutual: "Christliche Krankenkasse",
    status: "in_program",
    sessionsDone: 6,
    t0Date: "2026-03-25",
    t1Date: null,
    scoresT0: { pain_rest: 3, pain_activity: 5, had_a: 6, had_d: 4, odi: 26, tsk: 28, start: 3, wkg: 1.7 },
    scoresT1: null,
    yellowFlags: ["Sac scolaire surchargé (12 kg)", "Sport intensif (basket 2x/sem) à adapter temporairement"],
    redFlags: [],
    goals: ["Tenir la journée scolaire sans douleur", "Reprendre basket en compétition"],
    nextAppointment: "2026-05-15 16:30",
    complaint: "Scoliose idiopathique (Cobb 22°) + dorsalgies posturales, 17 ans",
    hypothesis: "Scoliose adolescent — focus posture/renforcement, suivi orthopédique parallèle",
    painTrend: trend(5, 3.5, 4),
  },
  {
    id: "p017",
    firstName: "Pierre",
    lastName: "Gillet",
    dob: "1978-12-09",
    gender: "M",
    lang: "fr",
    job: "Cadre IT (télétravail 4j/sem)",
    prescriber: "Dr. S. Henrot",
    mutual: "Mutualité Libre",
    status: "t0_done",
    sessionsDone: 3,
    t0Date: "2026-04-30",
    t1Date: null,
    scoresT0: { pain_rest: 3, pain_activity: 5, had_a: 12, had_d: 8, odi: 32, tsk: 36, start: 5, wkg: 1.3 },
    scoresT1: null,
    yellowFlags: ["Stress professionnel élevé", "Sédentarité extrême (< 3000 pas/jour)", "Reflux gastrique sous IPP"],
    redFlags: [],
    goals: ["Tenir une réunion 2h sans douleur", "Reprendre la natation 2x/sem", "Atteindre 8000 pas/jour"],
    nextAppointment: "2026-05-12 13:30",
    complaint: "Lombalgies chroniques posturales, télétravail prolongé sur ordinateur portable",
    hypothesis: "Déconditionnement + posture défaillante — adaptation ergo bureau prioritaire",
    painTrend: trend(5, 4.5, 3),
  },
  {
    id: "p018",
    firstName: "Maria",
    lastName: "Gonçalves",
    dob: "1969-03-08",
    gender: "F",
    lang: "fr",
    job: "Agente d'entretien (hôpital)",
    prescriber: "Dr. M. Lejeune",
    mutual: "Helan",
    status: "scheduled",
    sessionsDone: 0,
    t0Date: "2026-05-20",
    t1Date: null,
    scoresT0: null,
    scoresT1: null,
    yellowFlags: [],
    redFlags: [],
    goals: [],
    nextAppointment: "2026-05-20 08:00",
    complaint: "Lombalgies récidivantes, métier physique, 3e épisode en 2 ans",
    hypothesis: "À évaluer lors T0",
    painTrend: [],
  },
  {
    id: "p019",
    firstName: "Karin",
    lastName: "Hoffmann",
    dob: "1966-10-17",
    gender: "F",
    lang: "de",
    job: "Apothekenhelferin",
    prescriber: "Dr. H. Kaufmann",
    mutual: "Freie Krankenkasse",
    status: "completed",
    sessionsDone: 36,
    t0Date: "2025-08-20",
    t1Date: "2026-01-15",
    scoresT0: { pain_rest: 5, pain_activity: 7, had_a: 10, had_d: 7, odi: 44, tsk: 42, start: 6, wkg: 1.2 },
    scoresT1: { pain_rest: 2, pain_activity: 3, had_a: 5, had_d: 3, odi: 18, tsk: 26, start: 3, wkg: 2.0 },
    yellowFlags: ["Stress (résolu)"],
    redFlags: [],
    goals: ["Reprendre la randonnée — atteint", "Travailler sans antalgiques — atteint"],
    nextAppointment: "2026-07-15 10:00",
    complaint: "Lombalgie chronique — suivi à 6 mois post-programme (T2)",
    hypothesis: "Excellents résultats maintenus à 4 mois — contrôle T2 prévu juillet 2026",
    painTrend: trend(6, 2, 8),
  },
  {
    id: "p020",
    firstName: "Bernard",
    lastName: "Joris",
    dob: "1962-04-23",
    gender: "M",
    lang: "fr",
    job: "Ouvrier métallurgie (mi-temps thérapeutique)",
    prescriber: "Dr. S. Henrot",
    mutual: "Mutualité Socialiste",
    status: "t0_done",
    sessionsDone: 5,
    t0Date: "2026-04-22",
    t1Date: null,
    scoresT0: { pain_rest: 5, pain_activity: 7, had_a: 9, had_d: 8, odi: 42, tsk: 44, start: 6, wkg: 1.2 },
    scoresT1: null,
    yellowFlags: ["Récidive après 2 ans", "Découragement face à la rechute", "Crainte de la chirurgie"],
    redFlags: [],
    goals: ["Éviter la chirurgie", "Tenir le mi-temps", "Réapproprier les acquis du 1er programme"],
    nextAppointment: "2026-05-13 10:30",
    complaint: "Récidive lombalgie — 2e École du Dos (1er programme terminé en 2024 avec succès)",
    hypothesis: "Bon pronostic — patient connaît les outils, focus consolidation et auto-gestion",
    painTrend: trend(7, 5, 4),
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
  // Semaine en cours (12-16 mai 2026)
  { id: "a8", patientId: "p014", dateTime: "2026-05-12T10:00:00", type: "séance", staff: "Ph. Banaszak", room: "Kiné 2", status: "confirmed" },
  { id: "a9", patientId: "p017", dateTime: "2026-05-12T13:30:00", type: "séance", staff: "Ph. Banaszak", room: "Kiné 2", status: "confirmed" },
  { id: "a10", patientId: "p012", dateTime: "2026-05-12T15:00:00", type: "séance", staff: "Ph. Banaszak", room: "Kiné 2", status: "confirmed" },
  { id: "a11", patientId: "p008", dateTime: "2026-05-13T08:30:00", type: "séance", staff: "Ph. Banaszak", room: "Kiné 2", status: "confirmed" },
  { id: "a12", patientId: "p020", dateTime: "2026-05-13T10:30:00", type: "séance", staff: "Ph. Banaszak", room: "Kiné 2", status: "confirmed" },
  { id: "a13", patientId: "p011", dateTime: "2026-05-13T14:00:00", type: "séance", staff: "Ph. Banaszak", room: "Kiné 2", status: "confirmed" },
  { id: "a14", patientId: "p015", dateTime: "2026-05-14T09:00:00", type: "séance", staff: "Ph. Banaszak", room: "Kiné 2", status: "confirmed" },
  { id: "a15", patientId: "p009", dateTime: "2026-05-14T11:00:00", type: "séance", staff: "Ph. Banaszak", room: "Kiné 2", status: "confirmed" },
  { id: "a16", patientId: "p010", dateTime: "2026-05-15T09:30:00", type: "séance", staff: "Ph. Banaszak", room: "Kiné 2", status: "pending" },
  { id: "a17", patientId: "p016", dateTime: "2026-05-15T16:30:00", type: "séance", staff: "Ph. Banaszak", room: "Kiné 2", status: "confirmed" },
  // Semaine prochaine
  { id: "a18", patientId: "p013", dateTime: "2026-05-19T08:30:00", type: "T0", staff: "Ph. Banaszak", room: "Kiné 2", status: "pending" },
  { id: "a19", patientId: "p018", dateTime: "2026-05-20T08:00:00", type: "T0", staff: "Ph. Banaszak", room: "Kiné 2", status: "confirmed" },
  { id: "a20", patientId: "p007", dateTime: "2026-05-21T14:00:00", type: "T0", staff: "Ph. Banaszak", room: "Kiné 2", status: "pending" },
  { id: "a21", patientId: "p014", dateTime: "2026-05-22T10:00:00", type: "consult_physio", staff: "Dr. M. Lejeune", room: "Consult. 1", status: "confirmed" },
];

// ─── Facturation INAMI (mock codes nomenclature) ───────────────────
// ⚠️  Les montants ci-dessous (158,40 €, code 563011) sont des PLACEHOLDERS.
// Le code et le tarif exact dépendent de la convention HSNE
// (article 7 nomenclature kiné vs article 22 II centre conventionné).
// Voir docs/INAMI-CLARIFICATIONS.md pour les 5 questions à poser à Fanny
// avant d'ajuster ces chiffres. Tarifs 2026 à indexer +2,72 %.
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
  { patientId: "p008", code: "563011", label: "École du Dos — séances 7-12", amount: 158.4, sessionsBilled: 6, sessionsRemaining: 24, nextBillingDate: "2026-05-18", status: "à facturer" },
  { patientId: "p009", code: "563011", label: "École du Dos — séances 13-18", amount: 158.4, sessionsBilled: 12, sessionsRemaining: 18, nextBillingDate: "2026-05-15", status: "à facturer" },
  { patientId: "p010", code: "563011", label: "École du Dos — séances 1-6", amount: 158.4, sessionsBilled: 6, sessionsRemaining: 30, nextBillingDate: "2026-05-20", status: "envoyée" },
  { patientId: "p011", code: "563011", label: "École du Dos — séances 13-16", amount: 105.6, sessionsBilled: 12, sessionsRemaining: 20, nextBillingDate: "2026-05-22", status: "à facturer" },
  { patientId: "p014", code: "563011", label: "École du Dos — séances 7-12", amount: 158.4, sessionsBilled: 6, sessionsRemaining: 24, nextBillingDate: "2026-05-19", status: "envoyée" },
  { patientId: "p015", code: "563011", label: "École du Dos — séances 7-12", amount: 158.4, sessionsBilled: 6, sessionsRemaining: 26, nextBillingDate: "2026-05-21", status: "à facturer" },
  { patientId: "p016", code: "563011", label: "École du Dos — séances 1-6", amount: 158.4, sessionsBilled: 0, sessionsRemaining: 30, nextBillingDate: "2026-05-25", status: "en attente mutuelle" },
  { patientId: "p019", code: "563011", label: "École du Dos — séances 31-36 (clôture)", amount: 158.4, sessionsBilled: 36, sessionsRemaining: 0, nextBillingDate: null, status: "payée" },
  { patientId: "p020", code: "563011", label: "École du Dos — séances 1-5 (récidive)", amount: 132.0, sessionsBilled: 0, sessionsRemaining: 31, nextBillingDate: "2026-05-16", status: "à facturer" },
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
  { patientId: "p010", mutual: "Mutualité Neutre", requestDate: "2026-04-25", status: "acceptée" },
  { patientId: "p012", mutual: "Christliche Krankenkasse", requestDate: "2026-04-29", status: "envoyée" },
  { patientId: "p013", mutual: "Mutualité Libre", requestDate: "", status: "à envoyer", note: "À envoyer après confirmation IRM (drapeaux rouges)" },
  { patientId: "p014", mutual: "Partenamut", requestDate: "2026-03-01", status: "acceptée" },
  { patientId: "p015", mutual: "Mutualité Chrétienne", requestDate: "2026-03-08", status: "acceptée" },
  { patientId: "p016", mutual: "Christliche Krankenkasse", requestDate: "2026-03-22", status: "relance requise", note: "Pas de retour depuis 12 jours — adolescent, dossier prioritaire" },
  { patientId: "p018", mutual: "Helan", requestDate: "2026-05-05", status: "envoyée" },
  { patientId: "p020", mutual: "Mutualité Socialiste", requestDate: "2026-04-18", status: "acceptée", note: "2e programme accordé après avis médecin-conseil" },
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
  p008: [
    { key: "pain", label: "Intensité de la douleur", t0: 4, t1: null },
    { key: "self_care", label: "Soins personnels", t0: 1, t1: null },
    { key: "lifting", label: "Soulever des objets", t0: 5, t1: null },
    { key: "walking", label: "Marcher", t0: 2, t1: null },
    { key: "sitting", label: "Rester assis", t0: 3, t1: null },
    { key: "standing", label: "Rester debout", t0: 4, t1: null },
    { key: "sleeping", label: "Dormir", t0: 2, t1: null },
    { key: "sex", label: "Vie sexuelle", t0: 1, t1: null },
    { key: "social", label: "Vie sociale", t0: 1, t1: null },
    { key: "travel", label: "Voyages / déplacements", t0: 4, t1: null },
  ],
  p009: [
    { key: "pain", label: "Intensité de la douleur", t0: 4, t1: null },
    { key: "self_care", label: "Soins personnels", t0: 3, t1: null },
    { key: "lifting", label: "Soulever des objets", t0: 4, t1: null },
    { key: "walking", label: "Marcher", t0: 3, t1: null },
    { key: "sitting", label: "Rester assis", t0: 4, t1: null },
    { key: "standing", label: "Rester debout", t0: 4, t1: null },
    { key: "sleeping", label: "Dormir", t0: 5, t1: null },
    { key: "sex", label: "Vie sexuelle", t0: 3, t1: null },
    { key: "social", label: "Vie sociale", t0: 3, t1: null },
    { key: "travel", label: "Voyages / déplacements", t0: 4, t1: null },
  ],
  p011: [
    { key: "pain", label: "Intensité de la douleur", t0: 3, t1: null },
    { key: "self_care", label: "Soins personnels", t0: 3, t1: null },
    { key: "lifting", label: "Soulever des objets", t0: 5, t1: null },
    { key: "walking", label: "Marcher", t0: 4, t1: null },
    { key: "sitting", label: "Rester assis", t0: 2, t1: null },
    { key: "standing", label: "Rester debout", t0: 4, t1: null },
    { key: "sleeping", label: "Dormir", t0: 4, t1: null },
    { key: "sex", label: "Vie sexuelle", t0: 0, t1: null },
    { key: "social", label: "Vie sociale", t0: 4, t1: null },
    { key: "travel", label: "Voyages / déplacements", t0: 4, t1: null },
  ],
  p014: [
    { key: "pain", label: "Intensité de la douleur", t0: 3, t1: null },
    { key: "self_care", label: "Soins personnels", t0: 1, t1: null },
    { key: "lifting", label: "Soulever des objets", t0: 3, t1: null },
    { key: "walking", label: "Marcher", t0: 1, t1: null },
    { key: "sitting", label: "Rester assis", t0: 4, t1: null },
    { key: "standing", label: "Rester debout", t0: 3, t1: null },
    { key: "sleeping", label: "Dormir", t0: 5, t1: null },
    { key: "sex", label: "Vie sexuelle", t0: 3, t1: null },
    { key: "social", label: "Vie sociale", t0: 4, t1: null },
    { key: "travel", label: "Voyages / déplacements", t0: 2, t1: null },
  ],
  p015: [
    { key: "pain", label: "Intensité de la douleur", t0: 3, t1: null },
    { key: "self_care", label: "Soins personnels", t0: 2, t1: null },
    { key: "lifting", label: "Soulever des objets", t0: 4, t1: null },
    { key: "walking", label: "Marcher", t0: 1, t1: null },
    { key: "sitting", label: "Rester assis", t0: 3, t1: null },
    { key: "standing", label: "Rester debout", t0: 4, t1: null },
    { key: "sleeping", label: "Dormir", t0: 4, t1: null },
    { key: "sex", label: "Vie sexuelle", t0: 2, t1: null },
    { key: "social", label: "Vie sociale", t0: 2, t1: null },
    { key: "travel", label: "Voyages / déplacements", t0: 3, t1: null },
  ],
  p017: [
    { key: "pain", label: "Intensité de la douleur", t0: 3, t1: null },
    { key: "self_care", label: "Soins personnels", t0: 1, t1: null },
    { key: "lifting", label: "Soulever des objets", t0: 2, t1: null },
    { key: "walking", label: "Marcher", t0: 2, t1: null },
    { key: "sitting", label: "Rester assis", t0: 5, t1: null },
    { key: "standing", label: "Rester debout", t0: 3, t1: null },
    { key: "sleeping", label: "Dormir", t0: 2, t1: null },
    { key: "sex", label: "Vie sexuelle", t0: 1, t1: null },
    { key: "social", label: "Vie sociale", t0: 1, t1: null },
    { key: "travel", label: "Voyages / déplacements", t0: 3, t1: null },
  ],
  p019: [
    { key: "pain", label: "Intensité de la douleur", t0: 4, t1: 1 },
    { key: "self_care", label: "Soins personnels", t0: 2, t1: 0 },
    { key: "lifting", label: "Soulever des objets", t0: 4, t1: 2 },
    { key: "walking", label: "Marcher", t0: 3, t1: 1 },
    { key: "sitting", label: "Rester assis", t0: 4, t1: 1 },
    { key: "standing", label: "Rester debout", t0: 4, t1: 2 },
    { key: "sleeping", label: "Dormir", t0: 3, t1: 1 },
    { key: "sex", label: "Vie sexuelle", t0: 2, t1: 0 },
    { key: "social", label: "Vie sociale", t0: 3, t1: 1 },
    { key: "travel", label: "Voyages / déplacements", t0: 4, t1: 1 },
  ],
  p020: [
    { key: "pain", label: "Intensité de la douleur", t0: 4, t1: null },
    { key: "self_care", label: "Soins personnels", t0: 2, t1: null },
    { key: "lifting", label: "Soulever des objets", t0: 5, t1: null },
    { key: "walking", label: "Marcher", t0: 3, t1: null },
    { key: "sitting", label: "Rester assis", t0: 4, t1: null },
    { key: "standing", label: "Rester debout", t0: 4, t1: null },
    { key: "sleeping", label: "Dormir", t0: 3, t1: null },
    { key: "sex", label: "Vie sexuelle", t0: 2, t1: null },
    { key: "social", label: "Vie sociale", t0: 3, t1: null },
    { key: "travel", label: "Voyages / déplacements", t0: 4, t1: null },
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
  {
    patientId: "p008",
    jobDesc: "Maçonnerie — port de blocs (10-25 kg), postures contraignantes, vibrations outils",
    mainRisks: ["Port de charges lourdes répétitif", "Postures en flexion prolongée", "Vibrations marteau-piqueur"],
    adaptations: [
      { label: "Chariot de transport pour blocs", status: "validé" },
      { label: "Genouillères + tapis de chantier", status: "en cours" },
      { label: "Reprise progressive : charges < 10 kg pendant 4 sem", status: "proposé" },
    ],
    ergoGoals: ["Reprendre le port 25 kg sans appréhension", "Tenir 8h chantier sans crise"],
  },
  {
    patientId: "p009",
    jobDesc: "Aide-soignante — transferts patients, soins au lit, postures asymétriques 8h/jour",
    mainRisks: ["Transferts manuels patients dépendants", "Postures penchées prolongées", "Stress émotionnel chronique"],
    adaptations: [
      { label: "Lève-personne systématique > 30 kg", status: "validé" },
      { label: "Formation manutention équipe (refresh)", status: "en cours" },
      { label: "Aménagement 4/5e horaire", status: "proposé" },
    ],
    ergoGoals: ["Réduire les transferts manuels de 60%", "Tenir un poste sans crise > 2 sem"],
  },
  {
    patientId: "p014",
    jobDesc: "Cadre RH — bureau 8h/jour, réunions debout, écran portable + 2e écran",
    mainRisks: ["Sédentarité prolongée", "Charge mentale et émotionnelle", "Posture statique"],
    adaptations: [
      { label: "Bureau assis-debout électrique", status: "validé" },
      { label: "Reprise mi-temps thérapeutique 2,5j/sem", status: "en cours" },
      { label: "Pauses respiration cohérence cardiaque (3x/jour)", status: "validé" },
    ],
    ergoGoals: ["Reprise mi-temps stable sur 8 semaines", "Tenir une réunion 2h sans douleur"],
  },
  {
    patientId: "p015",
    jobDesc: "Enseignante primaire — debout 6h/jour, port d'enfants, postures penchées tableau",
    mainRisks: ["Station debout prolongée", "Port asymétrique (bébé + cartable)", "Sommeil fragmenté"],
    adaptations: [
      { label: "Écharpe de portage ergonomique (formation)", status: "validé" },
      { label: "Reprise progressive école sept. 2026 (4/5e initial)", status: "proposé" },
      { label: "Conseils diastasis post-partum (gainage hypopressif)", status: "en cours" },
    ],
    ergoGoals: ["Porter bébé 30 min sans douleur", "Tenir journée d'école debout à la rentrée"],
  },
  {
    patientId: "p017",
    jobDesc: "Cadre IT télétravail 4j/sem — laptop sur table cuisine, visioconférences 5-6h/jour",
    mainRisks: ["Poste télétravail non ergonomique", "Sédentarité extrême (< 3000 pas/jour)", "Stress chronique"],
    adaptations: [
      { label: "Bureau assis-debout pour télétravail (devis HSNE)", status: "proposé" },
      { label: "Support laptop + clavier/souris déportés", status: "validé" },
      { label: "Marche obligatoire entre réunions (notif. Teams)", status: "en cours" },
    ],
    ergoGoals: ["Atteindre 8000 pas/jour", "Tenir une journée TT sans douleur"],
  },
  {
    patientId: "p020",
    jobDesc: "Métallurgie — port de pièces (15-30 kg), poste fixe, vibrations machines",
    mainRisks: ["Récidive sur même geste professionnel", "Pression de production", "Fatigue 8h debout"],
    adaptations: [
      { label: "Mi-temps thérapeutique maintenu 3 mois", status: "validé" },
      { label: "Rotation poste 90 min (négociée avec employeur)", status: "en cours" },
      { label: "Échauffement obligatoire prise de poste", status: "validé" },
    ],
    ergoGoals: ["Tenir le mi-temps sans crise", "Préparer reprise temps plein à 6 mois"],
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

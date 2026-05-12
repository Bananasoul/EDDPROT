import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { Patient } from "@/lib/mock-data";
import {
  drawHeader,
  drawFooter,
  drawPatientBox,
  sectionTitle,
  paragraph,
  tr,
  formatDate,
  NAVY,
  CLOVER,
  AMBER,
  ACCENT,
  SLATE,
  HAIRLINE,
  INK,
  type Lang,
} from "./shared";
import {
  FORMULAS,
  getCategoryMeta,
  getBracketForAge,
  type FitnessCategory,
  type FormulaKey,
  PROTOCOL,
} from "@/lib/cardio-norms";

type Step = { t: number; watts: number; rpm: number | null; fc: number | null; note: string };

export type BikeTestData = {
  patient: Patient;
  age: number;
  weight: number;
  height: number;
  bikeId: string;
  seatHeight: string;
  formula: FormulaKey;
  fcMax: number;
  fcTarget: number;
  finalWatts: number;
  wkg: number;
  category: FitnessCategory;
  stopReason: string;
  steps: Step[];
  remarks: string;
};

export function generateBikeTestReport(d: BikeTestData, lang: Lang = "fr") {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  drawHeader(doc, lang, {
    titleFr: "Test endurance vélo (sub-max 75 % FCmax)",
    titleDe: "Ausdauertest Fahrrad (submax 75 % FCmax)",
    filename: "",
  });
  drawFooter(doc, lang);

  let y = 38;
  y = drawPatientBox(doc, lang, d.patient, y) + 5;

  // ─── Bloc paramètres ─────────────────────────────────────────
  y = sectionTitle(doc, tr(lang, "Paramètres du test", "Test-Parameter"), y);
  autoTable(doc, {
    startY: y,
    body: [
      [tr(lang, "Date du test", "Datum des Tests"), formatDate(new Date().toISOString(), lang)],
      [tr(lang, "Âge", "Alter"), `${d.age} ${tr(lang, "ans", "Jahre")}`],
      [tr(lang, "Poids", "Gewicht"), `${d.weight} kg`],
      [tr(lang, "Taille", "Größe"), d.height ? `${d.height} cm` : "—"],
      [tr(lang, "Vélo / réglage", "Fahrrad / Einstellung"), `${d.bikeId}${d.seatHeight ? " · " + d.seatHeight : ""}`],
      [tr(lang, "Formule FCmax", "FCmax-Formel"), FORMULAS[d.formula].label],
      [tr(lang, "FCmax théorique", "Theoretische FCmax"), `${d.fcMax} bpm`],
      [tr(lang, "Cible 75 %", "Ziel 75 %"), `${d.fcTarget} bpm`],
      [tr(lang, "Protocole", "Protokoll"), tr(
        lang,
        `Paliers de ${PROTOCOL.stepWatts} W toutes les ${PROTOCOL.stepDurationMin} min · cadence ${PROTOCOL.targetCadenceMin}-${PROTOCOL.targetCadenceMax} RPM`,
        `Stufen von ${PROTOCOL.stepWatts} W alle ${PROTOCOL.stepDurationMin} Min · Kadenz ${PROTOCOL.targetCadenceMin}-${PROTOCOL.targetCadenceMax} RPM`
      )],
    ],
    theme: "plain",
    styles: { fontSize: 9, cellPadding: 1.2, textColor: INK },
    columnStyles: {
      0: { fontStyle: "bold", textColor: NAVY, cellWidth: 60 },
    },
    margin: { left: 12, right: 12 },
  });
  y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 5;

  // ─── Bloc paliers ───────────────────────────────────────────
  const completedSteps = d.steps.filter((s) => s.fc != null);
  if (completedSteps.length > 0) {
    y = sectionTitle(doc, tr(lang, "Déroulement par palier", "Verlauf nach Stufen"), y);
    autoTable(doc, {
      startY: y,
      head: [
        [
          tr(lang, "Temps", "Zeit"),
          tr(lang, "Charge", "Last"),
          "RPM",
          tr(lang, "FC (bpm)", "FC (bpm)"),
          "% FCmax",
          tr(lang, "Note", "Notiz"),
        ],
      ],
      body: completedSteps.map((s) => {
        const pct = s.fc != null ? Math.round((s.fc / d.fcMax) * 100) : 0;
        return [
          `${s.t}'`,
          `${s.watts} W`,
          s.rpm != null ? String(s.rpm) : "—",
          s.fc != null ? String(s.fc) : "—",
          `${pct} %`,
          s.note || "",
        ];
      }),
      theme: "grid",
      headStyles: { fillColor: NAVY, textColor: 255, fontSize: 9 },
      bodyStyles: { fontSize: 9 },
      didParseCell: (data) => {
        if (data.section === "body" && data.column.index === 4) {
          const v = parseInt(String(data.cell.raw)) || 0;
          if (v >= 85) data.cell.styles.textColor = ACCENT;
          else if (v >= 75) data.cell.styles.textColor = CLOVER;
        }
      },
      margin: { left: 12, right: 12 },
    });
    y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 5;
  }

  // ─── Bloc résultat principal ────────────────────────────────
  if (y > 220) {
    doc.addPage();
    drawHeader(doc, lang, {
      titleFr: "Test endurance vélo (sub-max 75 % FCmax)",
      titleDe: "Ausdauertest Fahrrad (submax 75 % FCmax)",
      filename: "",
    });
    drawFooter(doc, lang);
    y = 40;
  }
  y = sectionTitle(doc, tr(lang, "Résultat", "Ergebnis"), y);

  const catMeta = getCategoryMeta(d.category);
  const bracket = getBracketForAge(d.age);
  const sex = d.patient.gender;

  autoTable(doc, {
    startY: y,
    body: [
      [
        tr(lang, "Charge max atteinte", "Maximalleistung"),
        `${d.finalWatts} W`,
        tr(lang, "Critère d'arrêt", "Abbruchkriterium"),
        d.stopReason,
      ],
      [
        tr(lang, "Poids", "Gewicht"),
        `${d.weight} kg`,
        tr(lang, "Tranche d'âge", "Altersgruppe"),
        bracket.range,
      ],
    ],
    theme: "plain",
    styles: { fontSize: 9, cellPadding: 1.5, textColor: INK },
    columnStyles: {
      0: { fontStyle: "bold", textColor: NAVY, cellWidth: 55 },
      2: { fontStyle: "bold", textColor: NAVY, cellWidth: 55 },
    },
    margin: { left: 12, right: 12 },
  });
  y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 3;

  // Encart W/kg + catégorie en gros
  const W = doc.internal.pageSize.getWidth();
  const boxH = 28;
  doc.setDrawColor(...HAIRLINE);
  doc.setFillColor(238, 244, 250);
  doc.roundedRect(12, y, (W - 24) / 2 - 2, boxH, 2, 2, "FD");
  doc.setFillColor(...hexToRgb(catMeta.color));
  doc.roundedRect(12 + (W - 24) / 2 + 2, y, (W - 24) / 2 - 2, boxH, 2, 2, "F");

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...SLATE);
  doc.text(tr(lang, "Indice W/kg", "Index W/kg"), 16, y + 7);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(...NAVY);
  doc.text(d.wkg > 0 ? d.wkg.toFixed(2) : "—", 16, y + 20);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...SLATE);
  doc.text(`= ${d.finalWatts} W ÷ ${d.weight} kg`, 16, y + 25);

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(tr(lang, "Catégorie ACSM", "ACSM-Kategorie"), 16 + (W - 24) / 2 + 2 + 4, y + 7);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text(tr(lang, catMeta.fr, catMeta.de), 16 + (W - 24) / 2 + 2 + 4, y + 18);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  const thresholds = sex === "M" ? bracket.M : bracket.F;
  doc.text(
    tr(
      lang,
      `Seuils ${sex === "M" ? "♂" : "♀"} : ${thresholds.join(" / ")}`,
      `Schwellen ${sex === "M" ? "♂" : "♀"}: ${thresholds.join(" / ")}`
    ),
    16 + (W - 24) / 2 + 2 + 4,
    y + 24
  );

  y += boxH + 5;

  // ─── Interprétation ────────────────────────────────────────
  y = sectionTitle(doc, tr(lang, "Interprétation clinique", "Klinische Interpretation"), y);
  y = paragraph(
    doc,
    interpretation(d, lang),
    y
  );
  y += 2;

  // ─── Remarques ────────────────────────────────────────────
  if (d.remarks.trim()) {
    y = sectionTitle(doc, tr(lang, "Remarques du clinicien", "Bemerkungen des Klinikers"), y);
    y = paragraph(doc, d.remarks, y) + 2;
  }

  // ─── Avertissement ────────────────────────────────────────
  doc.setFillColor(255, 244, 230);
  doc.setDrawColor(...AMBER);
  doc.setLineWidth(0.3);
  doc.roundedRect(12, y, W - 24, 18, 2, 2, "FD");
  doc.setFont("helvetica", "italic");
  doc.setFontSize(8);
  doc.setTextColor(...AMBER);
  doc.text(
    tr(
      lang,
      "Test sub-maximal indirect (protocole YMCA adapté). Prédit la condition cardio-respiratoire — n'a pas valeur d'épreuve d'effort cardiologique. Pour tout doute clinique, orienter vers cardiologie.",
      "Indirekter Submax-Test (angepasstes YMCA-Protokoll). Sagt die kardio-respiratorische Fitness voraus — ersetzt keine kardiologische Belastungsuntersuchung. Bei klinischem Zweifel an Kardiologie überweisen."
    ),
    16,
    y + 7,
    { maxWidth: W - 32 }
  );
  y += 22;

  // ─── Signature ────────────────────────────────────────────
  doc.setDrawColor(...HAIRLINE);
  doc.setLineWidth(0.2);
  doc.line(12, y, 90, y);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...NAVY);
  doc.text("Philippe Banaszak", 12, y + 5);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...SLATE);
  doc.text(
    tr(lang, "Kinésithérapeute coordinateur — École du Dos HSNE", "Koordinierender Physiotherapeut — Rückenschule SNH"),
    12,
    y + 9
  );
  doc.text(`INAMI 5-12345-67-890 · ${formatDate(new Date().toISOString(), lang)}`, 12, y + 13);

  doc.save(
    `EDD_TestVelo_${d.patient.lastName}_${d.patient.firstName}_${new Date().toISOString().slice(0, 10)}.pdf`
  );
}

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

function interpretation(d: BikeTestData, lang: Lang): string {
  const catMeta = getCategoryMeta(d.category);
  const meta = tr(lang, catMeta.fr, catMeta.de).toLowerCase();
  if (lang === "de") {
    return `Mit einem Index von ${d.wkg.toFixed(2)} W/kg liegt der/die Patient/in in der Kategorie « ${meta} » für die Altersgruppe ${getBracketForAge(d.age).range}. Im Rahmen der Rückenschule streben wir eine Verbesserung dieses Indexes durch das Trainingsprogramm auf den Geräten an. Eine Verbesserung dieser Fitness korreliert statistisch mit einer Verringerung der Rückenschmerzen. Erneute Messung am Ende der 36 Sitzungen (T1).`;
  }
  return `Avec un indice de ${d.wkg.toFixed(2)} W/kg, le/la patient(e) se situe dans la catégorie « ${meta} » pour la tranche d'âge ${getBracketForAge(d.age).range}. Dans le cadre de l'École du Dos, nous cherchons à améliorer cet indice via le programme d'entraînement sur appareils. L'amélioration de cette condition physique est statistiquement corrélée à la diminution des douleurs lombaires. Re-mesure prévue en fin de programme (T1, séance 36).`;
}

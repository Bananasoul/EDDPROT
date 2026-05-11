import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { Patient } from "@/lib/mock-data";
import { scoreThresholds } from "@/lib/mock-data";
import {
  drawHeader,
  drawFooter,
  drawPatientBox,
  sectionTitle,
  paragraph,
  bulletList,
  tr,
  formatDate,
  NAVY,
  CLOVER,
  ACCENT,
  AMBER,
  SLATE,
  HAIRLINE,
  INK,
  type Lang,
} from "./shared";

const SCORE_LABELS: Record<keyof typeof scoreThresholds, [string, string]> = {
  pain_rest: ["EVA repos", "VAS Ruhe"],
  pain_activity: ["EVA activité", "VAS Aktivität"],
  had_a: ["HAD-A (anxiété)", "HAD-A (Angst)"],
  had_d: ["HAD-D (dépression)", "HAD-D (Depression)"],
  odi: ["ODI (incapacité, %)", "ODI (Behinderung, %)"],
  tsk: ["TSK (kinésiophobie)", "TSK (Kinesiophobie)"],
  start: ["STarT Back", "STarT Back"],
  wkg: ["W/kg (vélo)", "W/kg (Fahrrad)"],
};

export function generateMedicalReport(p: Patient, lang: Lang = "fr") {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  drawHeader(doc, lang, {
    titleFr: "Rapport au médecin traitant",
    titleDe: "Bericht an den Hausarzt",
    filename: "",
  });
  drawFooter(doc, lang);

  let y = 38;
  y = drawPatientBox(doc, lang, p, y) + 6;

  // Recipient block
  doc.setDrawColor(...HAIRLINE);
  doc.setFont("helvetica", "italic");
  doc.setFontSize(9);
  doc.setTextColor(...SLATE);
  doc.text(tr(lang, "Destinataire :", "Empfänger:"), 12, y);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...INK);
  doc.text(p.prescriber, 12, y + 5);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(
    tr(lang, "Concerne : compte-rendu École du Dos (HSNE)", "Betrifft: Bericht Rückenschule (SNH)"),
    12,
    y + 10
  );
  y += 18;

  // Salutation
  y = paragraph(
    doc,
    tr(
      lang,
      `Cher confrère, chère consœur,\n\nNous vous adressons le présent compte-rendu concernant ${p.firstName} ${p.lastName} pris(e) en charge dans le programme École du Dos (protocole KCE 36 séances, INAMI 563011).`,
      `Sehr geehrte Frau Kollegin, sehr geehrter Herr Kollege,\n\nhiermit übermitteln wir Ihnen den Bericht zu ${p.firstName} ${p.lastName} im Rahmen der Rückenschule (KCE-Protokoll 36 Sitzungen, INAMI 563011).`
    ),
    y
  );
  y += 4;

  // Plainte
  y = sectionTitle(doc, tr(lang, "Motif de prise en charge", "Behandlungsgrund"), y);
  y = paragraph(doc, p.complaint, y) + 2;
  y = paragraph(doc, tr(lang, "Hypothèse clinique : ", "Klinische Hypothese: ") + p.hypothesis, y) + 4;

  // Scores T0/T1
  y = sectionTitle(doc, tr(lang, "Évaluation comparative T0 / T1", "Vergleichende Auswertung T0 / T1"), y);
  const scoreKeys = Object.keys(SCORE_LABELS) as (keyof typeof scoreThresholds)[];
  const rows = scoreKeys.map((k) => {
    const t0 = p.scoresT0?.[k];
    const t1 = p.scoresT1?.[k];
    const cfg = scoreThresholds[k];
    const delta =
      t0 != null && t1 != null
        ? cfg.higherIsWorse
          ? +(t0 - t1).toFixed(1)
          : +(t1 - t0).toFixed(1)
        : null;
    const interp =
      delta == null
        ? tr(lang, "—", "—")
        : delta > 0
        ? tr(lang, "Amélioration", "Verbesserung")
        : delta < 0
        ? tr(lang, "Aggravation", "Verschlechterung")
        : tr(lang, "Stable", "Stabil");
    return [
      SCORE_LABELS[k][lang === "de" ? 1 : 0],
      t0 != null ? String(t0) : "—",
      t1 != null ? String(t1) : "—",
      delta == null ? "—" : (delta > 0 ? "+" : "") + delta,
      interp,
    ];
  });
  autoTable(doc, {
    startY: y,
    head: [
      [
        tr(lang, "Score", "Score"),
        "T0",
        "T1",
        "Δ",
        tr(lang, "Évolution", "Entwicklung"),
      ],
    ],
    body: rows,
    theme: "grid",
    headStyles: { fillColor: NAVY, textColor: 255, fontSize: 9 },
    bodyStyles: { fontSize: 9, textColor: INK },
    columnStyles: {
      1: { halign: "center" },
      2: { halign: "center" },
      3: { halign: "center", fontStyle: "bold" },
    },
    didParseCell: (data) => {
      if (data.section === "body" && data.column.index === 4) {
        const v = String(data.cell.raw);
        if (v.includes(tr(lang, "Amélior", "Verbesser"))) data.cell.styles.textColor = CLOVER;
        if (v.includes(tr(lang, "Aggrav", "Verschlech"))) data.cell.styles.textColor = ACCENT;
      }
    },
    margin: { left: 12, right: 12 },
  });
  y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 6;

  // Drapeaux
  if (p.yellowFlags.length || p.redFlags.length) {
    y = sectionTitle(doc, tr(lang, "Drapeaux cliniques identifiés", "Identifizierte klinische Flaggen"), y);
    if (p.yellowFlags.length) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9.5);
      doc.setTextColor(...AMBER);
      doc.text(tr(lang, "Drapeaux jaunes (psycho-sociaux)", "Gelbe Flaggen (psychosozial)"), 12, y);
      y = bulletList(doc, p.yellowFlags, y + 2, AMBER);
    }
    if (p.redFlags.length) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9.5);
      doc.setTextColor(...ACCENT);
      doc.text(tr(lang, "Drapeaux rouges (organiques)", "Rote Flaggen (organisch)"), 12, y);
      y = bulletList(doc, p.redFlags, y + 2, ACCENT);
    }
    y += 2;
  }

  // Page break check
  if (y > 230) {
    doc.addPage();
    drawHeader(doc, lang, { titleFr: "Rapport au médecin traitant", titleDe: "Bericht an den Hausarzt", filename: "" });
    drawFooter(doc, lang);
    y = 40;
  }

  // Objectifs
  y = sectionTitle(doc, tr(lang, "Objectifs du patient", "Patientenziele"), y);
  y = bulletList(doc, p.goals.length ? p.goals : [tr(lang, "À définir lors du prochain bilan", "Beim nächsten Bilanz festzulegen")], y, CLOVER);

  // Conclusion
  y = sectionTitle(doc, tr(lang, "Conclusion et recommandations", "Schlussfolgerung und Empfehlungen"), y);
  const ready = !!(p.scoresT0 && p.scoresT1);
  const conclusion = ready
    ? tr(
        lang,
        `Le programme s'est déroulé sur ${p.sessionsDone} séances. L'évolution observée sur les scores fonctionnels et la douleur est favorable. Nous recommandons la poursuite d'une activité physique régulière (2-3x/sem), l'application des principes de protection rachidienne acquis durant le programme, et un contrôle clinique à 3 mois (T2).`,
        `Das Programm wurde über ${p.sessionsDone} Sitzungen durchgeführt. Die Entwicklung der funktionellen und Schmerz-Scores ist günstig. Wir empfehlen die Fortsetzung regelmäßiger körperlicher Aktivität (2-3x/Woche), die Anwendung der erlernten Rückenschutzprinzipien und eine klinische Kontrolle nach 3 Monaten (T2).`
      )
    : tr(
        lang,
        `Le patient est actuellement en cours de programme (${p.sessionsDone}/36 séances). Un compte-rendu T1 complet vous sera adressé à l'issue.`,
        `Der Patient befindet sich derzeit im Programm (${p.sessionsDone}/36 Sitzungen). Ein vollständiger T1-Bericht wird Ihnen am Ende übermittelt.`
      );
  y = paragraph(doc, conclusion, y) + 4;

  // Signature
  y = paragraph(
    doc,
    tr(lang, "Bien confraternellement,", "Mit kollegialen Grüßen,"),
    y,
    { bold: false }
  );
  y += 8;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...NAVY);
  doc.text("Philippe Banaszak", 12, y);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...SLATE);
  doc.text(
    tr(lang, "Kinésithérapeute coordinateur — École du Dos HSNE", "Koordinierender Physiotherapeut — Rückenschule SNH"),
    12,
    y + 4
  );
  doc.text(`INAMI 5-12345-67-890 · ${formatDate(new Date().toISOString(), lang)}`, 12, y + 8);

  doc.save(
    `EDD_Rapport_${p.lastName}_${p.firstName}_${new Date().toISOString().slice(0, 10)}.pdf`
  );
}

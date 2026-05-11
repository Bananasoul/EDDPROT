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
  SLATE,
  HAIRLINE,
  INK,
  type Lang,
} from "./shared";

export function generateInamiReport(p: Patient, lang: Lang = "fr") {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  drawHeader(doc, lang, {
    titleFr: "Attestation INAMI — fin de programme",
    titleDe: "INAMI-Bescheinigung — Programmende",
    filename: "",
  });
  drawFooter(doc, lang);

  let y = 38;
  y = drawPatientBox(doc, lang, p, y) + 6;

  y = sectionTitle(doc, tr(lang, "Identification du programme", "Programm-Identifikation"), y);
  autoTable(doc, {
    startY: y,
    body: [
      [tr(lang, "Code INAMI", "INAMI-Code"), "563011"],
      [tr(lang, "Libellé", "Bezeichnung"), tr(lang, "École du Dos — protocole KCE 36 séances", "Rückenschule — KCE-Protokoll 36 Sitzungen")],
      [tr(lang, "Prescripteur", "Verschreiber"), p.prescriber],
      [tr(lang, "Date T0 (bilan initial)", "Datum T0 (Erstbilanz)"), formatDate(p.t0Date, lang)],
      [tr(lang, "Date T1 (bilan final)", "Datum T1 (Endbilanz)"), formatDate(p.t1Date, lang)],
      [tr(lang, "Séances réalisées", "Durchgeführte Sitzungen"), `${p.sessionsDone} / 36`],
      [tr(lang, "Centre", "Zentrum"), tr(lang, "HSNE Eupen — Service Kinésithérapie", "SNH Eupen — Physiotherapie")],
    ],
    theme: "plain",
    styles: { fontSize: 9.5, cellPadding: 1.5, textColor: INK },
    columnStyles: {
      0: { fontStyle: "bold", textColor: NAVY, cellWidth: 60 },
    },
    margin: { left: 12, right: 12 },
  });
  y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 6;

  // Detail séances facturées (mock)
  y = sectionTitle(doc, tr(lang, "Récapitulatif des séances", "Übersicht der Sitzungen"), y);
  const blocks = [
    [tr(lang, "Bloc 1 (séances 1-6)", "Block 1 (Sitzungen 1-6)"), "26,40 €"],
    [tr(lang, "Bloc 2 (séances 7-12)", "Block 2 (Sitzungen 7-12)"), "26,40 €"],
    [tr(lang, "Bloc 3 (séances 13-18)", "Block 3 (Sitzungen 13-18)"), "26,40 €"],
    [tr(lang, "Bloc 4 (séances 19-24)", "Block 4 (Sitzungen 19-24)"), "26,40 €"],
    [tr(lang, "Bloc 5 (séances 25-30)", "Block 5 (Sitzungen 25-30)"), "26,40 €"],
    [tr(lang, "Bloc 6 (séances 31-36 + clôture)", "Block 6 (Sitzungen 31-36 + Abschluss)"), "26,40 €"],
  ];
  autoTable(doc, {
    startY: y,
    head: [[tr(lang, "Désignation", "Bezeichnung"), tr(lang, "Honoraires", "Honorar")]],
    body: blocks,
    foot: [
      [
        { content: tr(lang, "TOTAL programme complet", "GESAMT vollständiges Programm"), styles: { fontStyle: "bold" } },
        { content: "158,40 €", styles: { fontStyle: "bold", textColor: NAVY } },
      ],
    ],
    theme: "grid",
    headStyles: { fillColor: NAVY, textColor: 255, fontSize: 9 },
    bodyStyles: { fontSize: 9 },
    footStyles: { fillColor: [238, 244, 250], textColor: NAVY },
    columnStyles: { 1: { halign: "right", cellWidth: 40 } },
    margin: { left: 12, right: 12 },
  });
  y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 6;

  // Critères qualité
  y = sectionTitle(doc, tr(lang, "Critères qualité (KCE)", "Qualitätskriterien (KCE)"), y);
  const checks = [
    [tr(lang, "Bilan T0 documenté (EVA, ODI, TSK, HAD, STarT Back)", "T0-Bilanz dokumentiert (VAS, ODI, TSK, HAD, STarT Back)"), p.scoresT0 ? "✓" : "—"],
    [tr(lang, "Programme 36 séances respecté", "36-Sitzungen-Programm eingehalten"), p.sessionsDone >= 30 ? "✓" : `${p.sessionsDone}/36`],
    [tr(lang, "Bilan T1 documenté", "T1-Bilanz dokumentiert"), p.scoresT1 ? "✓" : "—"],
    [tr(lang, "Compte-rendu médecin traitant transmis", "Bericht an Hausarzt übermittelt"), p.scoresT1 ? "✓" : "—"],
    [tr(lang, "Suivi T2 (3 mois) planifié", "T2-Nachsorge (3 Monate) geplant"), p.status === "completed" ? "✓" : "—"],
  ];
  autoTable(doc, {
    startY: y,
    body: checks,
    theme: "plain",
    styles: { fontSize: 9, cellPadding: 1.2 },
    columnStyles: {
      0: { textColor: INK },
      1: { halign: "center", fontStyle: "bold", textColor: CLOVER, cellWidth: 25 },
    },
    margin: { left: 12, right: 12 },
  });
  y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8;

  y = paragraph(
    doc,
    tr(
      lang,
      "Je soussigné, kinésithérapeute responsable du programme École du Dos à l'Hôpital Saint-Nicolas Eupen, atteste que les prestations susmentionnées ont été effectuées dans les conditions prévues par la nomenclature INAMI et le protocole KCE.",
      "Der Unterzeichnende, verantwortlicher Physiotherapeut der Rückenschule am St.-Nikolaus-Hospital Eupen, bescheinigt hiermit, dass die obengenannten Leistungen gemäß INAMI-Nomenklatur und KCE-Protokoll erbracht wurden."
    ),
    y
  );
  y += 8;

  doc.setDrawColor(...HAIRLINE);
  doc.line(12, y, 90, y);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...NAVY);
  doc.text("Philippe Banaszak", 12, y + 5);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...SLATE);
  doc.text(tr(lang, "Kinésithérapeute INAMI 5-12345-67-890", "Physiotherapeut INAMI 5-12345-67-890"), 12, y + 9);
  doc.text(formatDate(new Date().toISOString(), lang), 12, y + 13);

  doc.save(
    `EDD_INAMI_${p.lastName}_${p.firstName}_${new Date().toISOString().slice(0, 10)}.pdf`
  );
}

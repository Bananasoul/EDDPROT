import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { Patient } from "@/lib/mock-data";
import type { AnamnesisData } from "@/lib/anamnesis";
import {
  ONSET_TYPE_LABELS,
  EVOLUTION_LABELS,
  WORK_STATUS_LABELS,
  SLEEP_QUALITY_LABELS,
} from "@/lib/anamnesis";
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

function val(s: string | undefined | null, lang: Lang): string {
  if (!s || s.trim().length === 0) return tr(lang, "—", "—");
  return s;
}

function joinValues(arr: string[], lang: Lang): string {
  if (arr.length === 0) return tr(lang, "—", "—");
  return arr.join(" · ");
}

export function generateAnamnesisReport(d: AnamnesisData, p: Patient, lang: Lang = "fr") {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  drawHeader(doc, lang, {
    titleFr: "Anamnèse d'entrée — T0",
    titleDe: "Eingangsanamnese — T0",
    filename: "",
  });
  drawFooter(doc, lang);

  let y = 38;
  y = drawPatientBox(doc, lang, p, y) + 4;

  // Mention IA si pertinent
  if (d.meta.transcriptSource === "plaud") {
    doc.setFillColor(220, 252, 231);
    doc.setDrawColor(...CLOVER);
    doc.roundedRect(12, y, 186, 6, 1, 1, "FD");
    doc.setFont("helvetica", "italic");
    doc.setFontSize(8);
    doc.setTextColor(...CLOVER);
    doc.text(
      tr(
        lang,
        "✦ Pré-rempli automatiquement à partir d'un transcript Plaud (Copilot HSNE) puis validé par le clinicien.",
        "✦ Automatisch aus einem Plaud-Transkript (HSNE-Copilot) vorausgefüllt und vom Kliniker validiert."
      ),
      14,
      y + 4
    );
    y += 9;
  }

  // ─── 1. Plainte principale ───
  y = sectionTitle(doc, tr(lang, "1. Plainte principale", "1. Hauptbeschwerde"), y);
  if (d.mainComplaint.description) {
    y = paragraph(doc, d.mainComplaint.description, y) + 1;
  }
  autoTable(doc, {
    startY: y,
    body: [
      [tr(lang, "Localisations", "Lokalisationen"), joinValues(d.mainComplaint.locations, lang)],
      [tr(lang, "Irradiation", "Ausstrahlung"), val(d.mainComplaint.irradiation, lang)],
      [tr(lang, "Type de sensation", "Empfindungstyp"), joinValues(d.mainComplaint.sensationType, lang)],
    ],
    theme: "plain",
    styles: { fontSize: 9, cellPadding: 1.2, textColor: INK },
    columnStyles: { 0: { fontStyle: "bold", textColor: NAVY, cellWidth: 60 } },
    margin: { left: 12, right: 12 },
  });
  y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 4;

  // ─── 2. Histoire ───
  y = sectionTitle(doc, tr(lang, "2. Histoire de la douleur", "2. Schmerzgeschichte"), y);
  autoTable(doc, {
    startY: y,
    body: [
      [tr(lang, "Début", "Beginn"), val(d.painHistory.onsetDate, lang)],
      [
        tr(lang, "Type de début", "Art des Beginns"),
        d.painHistory.onsetType
          ? tr(lang, ONSET_TYPE_LABELS[d.painHistory.onsetType].fr, ONSET_TYPE_LABELS[d.painHistory.onsetType].de)
          : tr(lang, "—", "—"),
      ],
      [tr(lang, "Détails", "Details"), val(d.painHistory.onsetDetails, lang)],
      [
        tr(lang, "Évolution", "Entwicklung"),
        d.painHistory.evolution
          ? tr(lang, EVOLUTION_LABELS[d.painHistory.evolution].fr, EVOLUTION_LABELS[d.painHistory.evolution].de)
          : tr(lang, "—", "—"),
      ],
      [tr(lang, "Épisodes antérieurs", "Frühere Episoden"), val(d.painHistory.previousEpisodes, lang)],
      [tr(lang, "Traitements essayés", "Versuchte Behandlungen"), val(d.painHistory.treatmentsTried, lang)],
    ],
    theme: "plain",
    styles: { fontSize: 9, cellPadding: 1.2, textColor: INK },
    columnStyles: { 0: { fontStyle: "bold", textColor: NAVY, cellWidth: 60 } },
    margin: { left: 12, right: 12 },
  });
  y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 4;

  // ─── 3. 24h ───
  if (y > 250) {
    doc.addPage();
    drawHeader(doc, lang, { titleFr: "Anamnèse d'entrée — T0", titleDe: "Eingangsanamnese — T0", filename: "" });
    drawFooter(doc, lang);
    y = 40;
  }
  y = sectionTitle(doc, tr(lang, "3. Schéma sur 24 h", "3. 24h-Schema"), y);
  autoTable(doc, {
    startY: y,
    body: [
      [tr(lang, "Pire moment", "Schmerzhöhepunkt"), joinValues(d.daySchema.worstMoment, lang)],
      [tr(lang, "Raideur matinale", "Morgensteifigkeit"), val(d.daySchema.morningStiffnessDuration, lang)],
      [tr(lang, "Tolérance assise", "Sitztoleranz"), val(d.daySchema.sittingTolerance, lang)],
      [tr(lang, "Tolérance marche", "Gehtoleranz"), val(d.daySchema.walkingTolerance, lang)],
      [
        tr(lang, "Qualité du sommeil", "Schlafqualität"),
        d.daySchema.sleepQuality
          ? tr(lang, SLEEP_QUALITY_LABELS[d.daySchema.sleepQuality].fr, SLEEP_QUALITY_LABELS[d.daySchema.sleepQuality].de)
          : tr(lang, "—", "—"),
      ],
      [tr(lang, "Heures de sommeil", "Schlafstunden"), val(d.daySchema.sleepHoursAvg, lang)],
      [tr(lang, "Réveils nocturnes", "Nächtliches Aufwachen"), val(d.daySchema.nightAwakenings, lang)],
    ],
    theme: "plain",
    styles: { fontSize: 9, cellPadding: 1.2, textColor: INK },
    columnStyles: { 0: { fontStyle: "bold", textColor: NAVY, cellWidth: 60 } },
    margin: { left: 12, right: 12 },
  });
  y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 4;

  // ─── 4. Facteurs ───
  y = sectionTitle(doc, tr(lang, "4. Facteurs aggravants & soulageants", "4. Aggravierende & lindernde Faktoren"), y);
  autoTable(doc, {
    startY: y,
    body: [
      [tr(lang, "Aggravants", "Aggravierend"), val(d.factors.aggravating, lang)],
      [tr(lang, "Soulageants", "Lindernd"), val(d.factors.relieving, lang)],
      [tr(lang, "Médicaments", "Medikamente"), val(d.factors.currentMedications, lang)],
      [tr(lang, "Effet médicament", "Wirkung Medikamente"), val(d.factors.medicationEffect, lang)],
    ],
    theme: "plain",
    styles: { fontSize: 9, cellPadding: 1.2, textColor: INK },
    columnStyles: { 0: { fontStyle: "bold", textColor: NAVY, cellWidth: 60 } },
    margin: { left: 12, right: 12 },
  });
  y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 4;

  // ─── 5. EVA ───
  if (y > 240) {
    doc.addPage();
    drawHeader(doc, lang, { titleFr: "Anamnèse d'entrée — T0", titleDe: "Eingangsanamnese — T0", filename: "" });
    drawFooter(doc, lang);
    y = 40;
  }
  y = sectionTitle(doc, tr(lang, "5. Évaluation de la douleur (EVA 0-10)", "5. Schmerzbewertung (VAS 0-10)"), y);
  autoTable(doc, {
    startY: y,
    head: [
      [
        tr(lang, "Pire (2 sem.)", "Stärkste (2 Wochen)"),
        tr(lang, "Moyenne (2 sem.)", "Durchschnitt"),
        tr(lang, "Au repos", "In Ruhe"),
        tr(lang, "En activité", "Bei Aktivität"),
      ],
    ],
    body: [
      [
        d.pain.worst2weeks != null ? `${d.pain.worst2weeks}/10` : "—",
        d.pain.average2weeks != null ? `${d.pain.average2weeks}/10` : "—",
        d.pain.atRest != null ? `${d.pain.atRest}/10` : "—",
        d.pain.onActivity != null ? `${d.pain.onActivity}/10` : "—",
      ],
    ],
    theme: "grid",
    headStyles: { fillColor: NAVY, textColor: 255, fontSize: 9 },
    bodyStyles: { fontSize: 11, halign: "center", fontStyle: "bold", textColor: ACCENT },
    margin: { left: 12, right: 12 },
  });
  y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 4;

  // ─── 6. Médical ───
  y = sectionTitle(doc, tr(lang, "6. Antécédents médicaux", "6. Medizinische Vorgeschichte"), y);
  autoTable(doc, {
    startY: y,
    body: [
      [tr(lang, "Imagerie", "Bildgebung"), val(d.medical.imaging, lang)],
      [tr(lang, "Chirurgies", "Operationen"), val(d.medical.surgeries, lang)],
      [tr(lang, "Comorbidités", "Komorbiditäten"), joinValues(d.medical.comorbidities, lang)],
      [tr(lang, "Allergies", "Allergien"), val(d.medical.allergies, lang)],
      [tr(lang, "Variation pondérale", "Gewichtsveränderung"), val(d.medical.weightChange, lang)],
      [tr(lang, "Autres", "Sonstiges"), val(d.medical.otherConditions, lang)],
    ],
    theme: "plain",
    styles: { fontSize: 9, cellPadding: 1.2, textColor: INK },
    columnStyles: { 0: { fontStyle: "bold", textColor: NAVY, cellWidth: 60 } },
    margin: { left: 12, right: 12 },
  });
  y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 4;

  // ─── 7. Profession ───
  if (y > 240) {
    doc.addPage();
    drawHeader(doc, lang, { titleFr: "Anamnèse d'entrée — T0", titleDe: "Eingangsanamnese — T0", filename: "" });
    drawFooter(doc, lang);
    y = 40;
  }
  y = sectionTitle(doc, tr(lang, "7. Profession & activités", "7. Beruf & Aktivitäten"), y);
  autoTable(doc, {
    startY: y,
    body: [
      [tr(lang, "Métier", "Beruf"), val(d.profession.currentJob, lang)],
      [
        tr(lang, "Statut", "Status"),
        d.profession.workStatus
          ? tr(lang, WORK_STATUS_LABELS[d.profession.workStatus].fr, WORK_STATUS_LABELS[d.profession.workStatus].de)
          : tr(lang, "—", "—"),
      ],
      ...(d.profession.workStatus === "sick_leave"
        ? [[tr(lang, "Durée arrêt", "Krankschreibungsdauer"), val(d.profession.sickLeaveDuration, lang)]]
        : []),
      [tr(lang, "Contraintes", "Belastungen"), joinValues(d.profession.jobConstraints, lang)],
      [tr(lang, "Sport & loisirs", "Sport & Hobbys"), val(d.profession.sportsHobbies, lang)],
      [tr(lang, "Contexte social", "Sozialer Kontext"), val(d.profession.socialContext, lang)],
    ],
    theme: "plain",
    styles: { fontSize: 9, cellPadding: 1.2, textColor: INK },
    columnStyles: { 0: { fontStyle: "bold", textColor: NAVY, cellWidth: 60 } },
    margin: { left: 12, right: 12 },
  });
  y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 4;

  // ─── 8. Yellow flags ───
  const ylf = d.yellowFlags;
  const hasYellow = Object.values(ylf).some((v) => v.length > 0);
  if (hasYellow) {
    y = sectionTitle(doc, tr(lang, "8. Drapeaux jaunes (psycho-social)", "8. Gelbe Flaggen (psychosozial)"), y);
    autoTable(doc, {
      startY: y,
      body: [
        ...(ylf.attitudes ? [[tr(lang, "Attitudes/croyances", "Einstellungen"), ylf.attitudes]] : []),
        ...(ylf.behaviors ? [[tr(lang, "Comportements", "Verhalten"), ylf.behaviors]] : []),
        ...(ylf.compensation ? [[tr(lang, "Compensation/litige", "Kompensation"), ylf.compensation]] : []),
        ...(ylf.diagnosis ? [[tr(lang, "Diagnostic/traitement", "Diagnose"), ylf.diagnosis]] : []),
        ...(ylf.emotions ? [[tr(lang, "Émotions", "Emotionen"), ylf.emotions]] : []),
        ...(ylf.family ? [[tr(lang, "Famille", "Familie"), ylf.family]] : []),
        ...(ylf.work ? [[tr(lang, "Travail", "Arbeit"), ylf.work]] : []),
        ...(ylf.social ? [[tr(lang, "Social", "Sozial"), ylf.social]] : []),
      ],
      theme: "plain",
      styles: { fontSize: 9, cellPadding: 1.2, textColor: AMBER },
      columnStyles: { 0: { fontStyle: "bold", textColor: NAVY, cellWidth: 60 } },
      margin: { left: 12, right: 12 },
    });
    y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 4;
  }

  // ─── 9. Perspective patient ───
  if (y > 230) {
    doc.addPage();
    drawHeader(doc, lang, { titleFr: "Anamnèse d'entrée — T0", titleDe: "Eingangsanamnese — T0", filename: "" });
    drawFooter(doc, lang);
    y = 40;
  }
  y = sectionTitle(doc, tr(lang, "9. Représentation & objectifs du patient", "9. Patientenwahrnehmung & Ziele"), y);
  if (d.patientPerspective.cause) {
    y = paragraph(doc, tr(lang, "Cause selon le patient : ", "Ursache laut Patient: ") + d.patientPerspective.cause, y) + 1;
  }
  if (d.patientPerspective.fears) {
    y = paragraph(doc, tr(lang, "Craintes : ", "Ängste: ") + d.patientPerspective.fears, y) + 1;
  }
  if (d.patientPerspective.goals.length > 0) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(...NAVY);
    doc.text(tr(lang, "Objectifs SMART :", "SMART-Ziele:"), 12, y);
    y += 4;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...INK);
    d.patientPerspective.goals.forEach((g, i) => {
      doc.setFillColor(...CLOVER);
      doc.circle(15, y + 1.5, 0.8, "F");
      const lines = doc.splitTextToSize(`${i + 1}. ${g}`, 180);
      doc.text(lines, 18, y + 2);
      y += lines.length * 4 + 1;
    });
  }
  if (d.patientPerspective.expectations) {
    y = paragraph(doc, tr(lang, "Attentes : ", "Erwartungen: ") + d.patientPerspective.expectations, y) + 2;
  }

  // ─── 10. Notes cliniques ───
  if (d.clinicianNotes) {
    if (y > 250) {
      doc.addPage();
      drawHeader(doc, lang, { titleFr: "Anamnèse d'entrée — T0", titleDe: "Eingangsanamnese — T0", filename: "" });
      drawFooter(doc, lang);
      y = 40;
    }
    y = sectionTitle(doc, tr(lang, "10. Notes du clinicien", "10. Notizen des Klinikers"), y);
    y = paragraph(doc, d.clinicianNotes, y) + 2;
  }

  // Signature
  if (y > 240) {
    doc.addPage();
    drawHeader(doc, lang, { titleFr: "Anamnèse d'entrée — T0", titleDe: "Eingangsanamnese — T0", filename: "" });
    drawFooter(doc, lang);
    y = 40;
  }
  doc.setDrawColor(...HAIRLINE);
  doc.line(12, y, 90, y);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...NAVY);
  doc.text(d.meta.interviewerId, 12, y + 5);
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
    `EDD_AnamneseT0_${p.lastName}_${p.firstName}_${new Date().toISOString().slice(0, 10)}.pdf`
  );
}

import jsPDF from "jspdf";
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
  SLATE,
  HAIRLINE,
  INK,
  type Lang,
} from "./shared";

export function generateMutualLetter(p: Patient, lang: Lang = "fr") {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  drawHeader(doc, lang, {
    titleFr: "Demande de prise en charge — mutuelle",
    titleDe: "Antrag auf Kostenübernahme — Krankenkasse",
    filename: "",
  });
  drawFooter(doc, lang);

  let y = 38;
  y = drawPatientBox(doc, lang, p, y) + 6;

  // Mutual recipient box
  doc.setDrawColor(...HAIRLINE);
  doc.setFontSize(9);
  doc.setTextColor(...SLATE);
  doc.setFont("helvetica", "italic");
  doc.text(tr(lang, "À l'attention de :", "Zu Händen von:"), 12, y);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.setTextColor(...NAVY);
  doc.text(p.mutual, 12, y + 6);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...INK);
  doc.text(tr(lang, "Service Médecin-conseil / Tiers-payant", "Vertrauensarzt / Direktabrechnung"), 12, y + 11);
  y += 18;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...NAVY);
  doc.text(
    tr(
      lang,
      "Objet : Demande de prise en charge — programme École du Dos (INAMI 563011)",
      "Betreff: Antrag auf Kostenübernahme — Rückenschule (INAMI 563011)"
    ),
    12,
    y
  );
  y += 8;

  y = paragraph(
    doc,
    tr(lang, "Madame, Monsieur,", "Sehr geehrte Damen und Herren,"),
    y
  );
  y += 2;

  y = paragraph(
    doc,
    tr(
      lang,
      `Nous sollicitons votre accord pour la prise en charge du programme multidisciplinaire École du Dos pour votre affilié(e) ${p.firstName} ${p.lastName} (né(e) le ${formatDate(p.dob, lang)}).`,
      `Wir beantragen Ihre Genehmigung zur Kostenübernahme des multidisziplinären Programms Rückenschule für Ihre/n Versicherte/n ${p.firstName} ${p.lastName} (geboren am ${formatDate(p.dob, lang)}).`
    ),
    y
  );
  y += 4;

  y = sectionTitle(doc, tr(lang, "Indication clinique", "Klinische Indikation"), y);
  y = paragraph(doc, p.complaint, y) + 2;
  y = paragraph(doc, tr(lang, "Hypothèse diagnostique : ", "Diagnostische Hypothese: ") + p.hypothesis, y) + 4;

  y = sectionTitle(doc, tr(lang, "Programme proposé", "Vorgeschlagenes Programm"), y);
  y = paragraph(
    doc,
    tr(
      lang,
      "Programme multidisciplinaire de réadaptation lombaire selon les recommandations KCE 2017 (rapport 287) :\n• 36 séances de kinésithérapie spécialisée (2x/sem pendant 18 sem)\n• Évaluations standardisées T0 et T1 (EVA, ODI, TSK, HAD, STarT Back)\n• Coordination médicale (médecin physiothérapeute) et ergothérapique\n• Volet éducation thérapeutique du patient (douleur, biomécanique, hygiène rachidienne)",
      "Multidisziplinäres Rehabilitationsprogramm für den unteren Rücken gemäß KCE-Empfehlungen 2017 (Bericht 287):\n• 36 Sitzungen spezialisierte Physiotherapie (2x/Woche über 18 Wochen)\n• Standardisierte Beurteilungen T0 und T1 (VAS, ODI, TSK, HAD, STarT Back)\n• Ärztliche (Physiotherapeut) und ergotherapeutische Koordination\n• Therapeutische Patientenschulung (Schmerz, Biomechanik, Rückenhygiene)"
    ),
    y
  );
  y += 4;

  y = sectionTitle(doc, tr(lang, "Cotation INAMI", "INAMI-Tarifierung"), y);
  y = paragraph(
    doc,
    tr(
      lang,
      "Code 563011 — École du Dos · 158,40 € pour le programme complet · facturation par bloc de 6 séances (26,40 € / bloc) en tiers-payant.",
      "Code 563011 — Rückenschule · 158,40 € für das vollständige Programm · Abrechnung pro Block von 6 Sitzungen (26,40 € / Block) per Direktabrechnung."
    ),
    y
  );
  y += 4;

  y = paragraph(
    doc,
    tr(
      lang,
      "Nous restons à votre disposition pour toute information complémentaire et vous prions d'agréer, Madame, Monsieur, l'expression de nos salutations distinguées.",
      "Für weitere Auskünfte stehen wir Ihnen gerne zur Verfügung. Mit freundlichen Grüßen,"
    ),
    y
  );
  y += 12;

  doc.setDrawColor(...HAIRLINE);
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
    `EDD_Mutuelle_${p.lastName}_${p.firstName}_${new Date().toISOString().slice(0, 10)}.pdf`
  );
}

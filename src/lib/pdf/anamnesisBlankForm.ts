import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { Patient } from "@/lib/mock-data";
import {
  drawHeader,
  drawFooter,
  drawPatientBox,
  sectionTitle,
  tr,
  formatDate,
  NAVY,
  CYAN,
  CYAN_SOFT,
  CLOVER,
  AMBER,
  ACCENT,
  SLATE,
  HAIRLINE,
  INK,
  type Lang,
} from "./shared";

/**
 * Fiche T0 imprimable vierge — pour avoir devant soi durant l'entretien.
 * Lignes vides à remplir au stylo. Format A4, 2 pages compactes.
 *
 * Inspiré de la pratique Philippe : « idéalement j'ai une fiche imprimée
 * devant moi qui reprend la structure de l'entretien, et je prends des
 * notes pour adapter encore plus les questions au champ lexical du
 * patient. j'ai le plaud qui est allumé, je préviens le patient que
 * l'entretien est enregistré à des fins de qualité d'anamnèse. »
 */

function lines(doc: jsPDF, x: number, y: number, count: number, w = 186, gap = 6) {
  doc.setDrawColor(...HAIRLINE);
  doc.setLineWidth(0.15);
  for (let i = 0; i < count; i++) {
    doc.line(x, y + i * gap, x + w, y + i * gap);
  }
  return y + count * gap + 2;
}

function checkboxes(doc: jsPDF, x: number, y: number, items: string[], cols = 2) {
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...INK);
  const colWidth = 186 / cols;
  let row = 0, col = 0;
  for (const item of items) {
    const cx = x + col * colWidth;
    const cy = y + row * 5.5;
    doc.setDrawColor(...NAVY);
    doc.setLineWidth(0.3);
    doc.rect(cx, cy - 2.5, 3, 3);
    doc.text(item, cx + 4.5, cy);
    col++;
    if (col >= cols) { col = 0; row++; }
  }
  return y + (Math.ceil(items.length / cols)) * 5.5 + 2;
}

function smallNote(doc: jsPDF, label: string, x: number, y: number, w = 186): number {
  doc.setFont("helvetica", "italic");
  doc.setFontSize(7.5);
  doc.setTextColor(...SLATE);
  doc.text(label, x, y);
  return y + 2.5;
}

export function generateBlankAnamnesisForm(patient: Patient | null, lang: Lang = "fr") {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  drawHeader(doc, lang, {
    titleFr: "Fiche d'entretien T0 — vierge",
    titleDe: "Anamnesebogen T0 — leer",
    filename: "",
  });
  drawFooter(doc, lang);

  let y = 38;

  // Patient box (ou cadre vide si pas de patient)
  if (patient) {
    y = drawPatientBox(doc, lang, patient, y) + 4;
  } else {
    doc.setDrawColor(...HAIRLINE);
    doc.setFillColor(...CYAN_SOFT);
    doc.roundedRect(12, y, 186, 22, 2, 2, "FD");
    doc.setTextColor(...NAVY);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text(tr(lang, "Identité patient (à compléter)", "Patientenidentität (auszufüllen)"), 16, y + 5);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text(tr(lang, "Nom :", "Name:"), 16, y + 11);
    doc.line(28, y + 11, 100, y + 11);
    doc.text(tr(lang, "Prénom :", "Vorname:"), 105, y + 11);
    doc.line(122, y + 11, 195, y + 11);
    doc.text(tr(lang, "Date naissance :", "Geburtsdatum:"), 16, y + 17);
    doc.line(40, y + 17, 75, y + 17);
    doc.text(tr(lang, "Date entretien :", "Gesprächsdatum:"), 80, y + 17);
    doc.line(102, y + 17, 137, y + 17);
    doc.text(tr(lang, "Langue :", "Sprache:"), 142, y + 17);
    doc.line(155, y + 17, 195, y + 17);
    y += 26;
  }

  // Bandeau RGPD enregistrement
  doc.setFillColor(...CYAN_SOFT);
  doc.setDrawColor(...CYAN);
  doc.roundedRect(12, y, 186, 11, 1.5, 1.5, "FD");
  doc.setFont("helvetica", "italic");
  doc.setFontSize(7.5);
  doc.setTextColor(...NAVY);
  doc.text(
    tr(
      lang,
      "🎙 Entretien enregistré avec votre accord (Plaud / Azure HSNE) à des fins d'amélioration de la qualité de l'anamnèse. Données traitées RGPD, audio supprimé après transcription dans votre dossier.",
      "🎙 Gespräch wird mit Ihrer Zustimmung aufgezeichnet (Plaud / Azure SNH) zur Verbesserung der Anamnesequalität. DSGVO-konform, Audio nach Transkription gelöscht."
    ),
    16, y + 4, { maxWidth: 178 }
  );
  doc.text(
    tr(lang, "Consentement obtenu :   ☐ Oui    ☐ Non — Signature patient :", "Einwilligung erhalten:   ☐ Ja    ☐ Nein — Unterschrift Patient:"),
    16, y + 9
  );
  doc.setDrawColor(...NAVY);
  doc.line(116, y + 9, 195, y + 9);
  y += 14;

  // ─── 1. Plainte principale ────────────────────────────────
  y = sectionTitle(doc, tr(lang, "1. Plainte principale", "1. Hauptbeschwerde"), y);
  y = smallNote(doc, tr(lang, "Localisation, irradiation, sensations (douleur / picotements / engourdissement)", "Lokalisation, Ausstrahlung, Empfindungen"), 14, y);
  y = lines(doc, 12, y + 2, 3);

  // ─── 2. Histoire de la douleur ───────────────────────────
  y = sectionTitle(doc, tr(lang, "2. Histoire — depuis quand ? Comment ?", "2. Geschichte — seit wann? Wie?"), y);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...INK);
  doc.text(tr(lang, "Début :", "Beginn:"), 14, y);
  doc.line(28, y, 90, y);
  doc.text(tr(lang, "Évolution : ☐ s'améliore  ☐ stable  ☐ s'aggrave  ☐ fluctuante", "Entwicklung: ☐ bessert  ☐ stabil  ☐ verschlimmert  ☐ schwankend"), 95, y);
  y += 4;
  y = checkboxes(doc, 14, y + 2, [
    tr(lang, "☐ Traumatisme (chute, accident)", "☐ Trauma (Sturz, Unfall)"),
    tr(lang, "☐ Soudain (sans raison)", "☐ Plötzlich (ohne Grund)"),
    tr(lang, "☐ Post-chirurgical", "☐ Postoperativ"),
    tr(lang, "☐ Progressif", "☐ Progressiv"),
  ], 2);
  y = smallNote(doc, tr(lang, "Détails du début / circonstances", "Details zum Beginn"), 14, y + 1);
  y = lines(doc, 12, y + 2, 2);
  y = smallNote(doc, tr(lang, "Traitements déjà essayés (kiné, infiltrations, ostéo, médicaments)", "Bereits versuchte Behandlungen"), 14, y);
  y = lines(doc, 12, y + 2, 2);

  // ─── 3. Schéma 24h ───────────────────────────────────────
  y = sectionTitle(doc, tr(lang, "3. Schéma sur 24 h", "3. 24h-Schema"), y);
  y = checkboxes(doc, 14, y + 2, [
    tr(lang, "Pire : ☐ matin  ☐ journée  ☐ soir  ☐ nuit", "Spitze: ☐ morgens  ☐ tagsüber  ☐ abends  ☐ nachts"),
  ], 1);
  doc.setFontSize(8.5);
  doc.text(tr(lang, "Sommeil : ☐ bon  ☐ fragmenté  ☐ mauvais —— heures :", "Schlaf: ☐ gut  ☐ fragmentiert  ☐ schlecht —— Stunden:"), 14, y);
  doc.line(120, y, 145, y);
  doc.text(tr(lang, "Raideur matinale :", "Morgensteifigkeit:"), 150, y);
  doc.line(178, y, 195, y);
  y += 4;
  doc.text(tr(lang, "Tolérance assise :", "Sitztoleranz:"), 14, y);
  doc.line(40, y, 95, y);
  doc.text(tr(lang, "Tolérance marche :", "Gehtoleranz:"), 100, y);
  doc.line(125, y, 195, y);
  y += 4;

  // ─── 4. Facteurs ─────────────────────────────────────────
  y = sectionTitle(doc, tr(lang, "4. Facteurs aggravants & soulageants", "4. Aggravierende & lindernde Faktoren"), y);
  y = smallNote(doc, tr(lang, "Aggravants (position, mouvement, situation)", "Aggravierend"), 14, y);
  y = lines(doc, 12, y + 2, 2);
  y = smallNote(doc, tr(lang, "Soulageants (chaud, marche, position)", "Lindernd"), 14, y);
  y = lines(doc, 12, y + 2, 2);
  y = smallNote(doc, tr(lang, "Médicaments actuels + effet ressenti", "Aktuelle Medikamente + Wirkung"), 14, y);
  y = lines(doc, 12, y + 2, 1);

  // ─── 5. EVA ──────────────────────────────────────────────
  y = sectionTitle(doc, tr(lang, "5. Évaluation EVA (0 = aucune, 10 = lumière au bout du couloir)", "5. VAS-Bewertung (0 = keine, 10 = Licht am Ende des Flurs)"), y);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...INK);
  // 4 colonnes EVA
  const evaLabels = [
    tr(lang, "Pire (2 sem.)", "Stärkste (2 Wo.)"),
    tr(lang, "Moyenne (2 sem.)", "Durchschnitt"),
    tr(lang, "Au repos", "In Ruhe"),
    tr(lang, "En activité", "Bei Aktivität"),
  ];
  const colW = 186 / 4;
  evaLabels.forEach((label, i) => {
    const x = 12 + i * colW;
    doc.text(label, x + 2, y);
    doc.setDrawColor(...NAVY);
    doc.setLineWidth(0.4);
    doc.roundedRect(x + 2, y + 1.5, 24, 7, 1, 1);
    doc.setFontSize(7);
    doc.setTextColor(...SLATE);
    doc.text("/10", x + 28, y + 6.5);
    doc.setFontSize(8.5);
    doc.setTextColor(...INK);
  });
  y += 12;

  // Page 2
  doc.addPage();
  drawHeader(doc, lang, { titleFr: "Fiche d'entretien T0 — vierge", titleDe: "Anamnesebogen T0 — leer", filename: "" });
  drawFooter(doc, lang);
  y = 38;

  // ─── 6. Médical ──────────────────────────────────────────
  y = sectionTitle(doc, tr(lang, "6. Antécédents médicaux", "6. Medizinische Vorgeschichte"), y);
  y = smallNote(doc, tr(lang, "Imagerie réalisée (IRM, scan, radio + dates + résultats)", "Bildgebung"), 14, y);
  y = lines(doc, 12, y + 2, 2);
  y = smallNote(doc, tr(lang, "Antécédents chirurgicaux (type + date)", "Chirurgische Anamnese"), 14, y);
  y = lines(doc, 12, y + 2, 2);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  y = checkboxes(doc, 14, y + 1, [
    tr(lang, "☐ HTA", "☐ HBD"),
    tr(lang, "☐ Diabète", "☐ Diabetes"),
    tr(lang, "☐ Thyroïde", "☐ Schilddrüse"),
    tr(lang, "☐ Dépression", "☐ Depression"),
    tr(lang, "☐ Fibromyalgie", "☐ Fibromyalgie"),
    tr(lang, "☐ Ostéoporose", "☐ Osteoporose"),
    tr(lang, "☐ ATCD cancer", "☐ Krebsanamnese"),
    tr(lang, "☐ Autre :", "☐ Sonstige:"),
  ], 4);
  y = smallNote(doc, tr(lang, "Autres pathologies / allergies / variation pondérale", "Sonstige Pathologien / Allergien / Gewichtsveränderung"), 14, y);
  y = lines(doc, 12, y + 2, 2);

  // ─── 7. Profession ───────────────────────────────────────
  y = sectionTitle(doc, tr(lang, "7. Profession & activités", "7. Beruf & Aktivitäten"), y);
  doc.setFontSize(8.5);
  doc.text(tr(lang, "Métier :", "Beruf:"), 14, y);
  doc.line(28, y, 110, y);
  doc.text(tr(lang, "Statut :", "Status:"), 115, y);
  doc.line(125, y, 195, y);
  y += 4;
  y = checkboxes(doc, 14, y, [
    tr(lang, "☐ Station debout", "☐ Stehen"),
    tr(lang, "☐ Port charges", "☐ Lasten"),
    tr(lang, "☐ Position assise", "☐ Sitzen"),
    tr(lang, "☐ Vibrations", "☐ Vibrationen"),
    tr(lang, "☐ Conduite", "☐ Fahren"),
    tr(lang, "☐ Écran", "☐ Bildschirm"),
    tr(lang, "☐ Mvts répétitifs", "☐ Repetitive Bew."),
    tr(lang, "☐ Autre :", "☐ Andere:"),
  ], 4);
  y = smallNote(doc, tr(lang, "Sport et loisirs (actuels et passés)", "Sport und Hobbys"), 14, y);
  y = lines(doc, 12, y + 2, 2);

  // ─── 8. Drapeaux rouges (KCE 287) ───────────────────────
  doc.setFillColor(255, 235, 235);
  doc.setDrawColor(...ACCENT);
  doc.setLineWidth(0.5);
  doc.roundedRect(12, y, 186, 4, 1, 1, "FD");
  doc.setTextColor(...ACCENT);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text(tr(lang, "🚨 8. Drapeaux rouges KCE 287 — vérifier systématiquement", "🚨 8. Rote Flaggen KCE 287 — systematisch prüfen"), 14, y + 3);
  y += 5;
  y = checkboxes(doc, 14, y + 1, [
    tr(lang, "☐ Trouble pour uriner", "☐ Wasserlassstörung"),
    tr(lang, "☐ Incontinence fécale", "☐ Stuhlinkontinenz"),
    tr(lang, "☐ Anesthésie en selle", "☐ Reithosenanästhesie"),
    tr(lang, "☐ Faiblesse motrice progressive", "☐ Prog. Schwäche"),
    tr(lang, "☐ Antécédent cancer", "☐ Krebsanamnese"),
    tr(lang, "☐ Perte poids inexpliquée", "☐ Ungeklärter Gewichtsv."),
    tr(lang, "☐ Douleur nocturne intense", "☐ Starker Nachtschmerz"),
    tr(lang, "☐ Fièvre persistante", "☐ Anhaltendes Fieber"),
    tr(lang, "☐ Trauma récent < 6 sem.", "☐ Trauma < 6 Wo."),
    tr(lang, "☐ Ostéoporose connue", "☐ Bekannte Osteoporose"),
  ], 2);
  y += 1;

  // ─── 9. Yellow flags (psycho-social) ───────────────────
  y = sectionTitle(doc, tr(lang, "9. Drapeaux jaunes (psycho-social — ABCDEFWS)", "9. Gelbe Flaggen (psychosozial — ABCDEFWS)"), y);
  doc.setFontSize(7.5);
  doc.setTextColor(...AMBER);
  doc.text(
    tr(
      lang,
      "Attitudes / Behaviors / Compensation / Diagnosis / Emotions / Family / Work / Social",
      "Einstellungen / Verhalten / Kompensation / Diagnose / Emotionen / Familie / Arbeit / Sozial"
    ),
    14, y
  );
  y += 2.5;
  y = lines(doc, 12, y + 2, 3);

  // ─── 10. Représentation patient & objectifs ─────────────
  y = sectionTitle(doc, tr(lang, "10. Représentation du patient & objectifs SMART", "10. Patientenwahrnehmung & SMART-Ziele"), y);
  y = smallNote(doc, tr(lang, "Cause selon le patient / craintes exprimées", "Ursache laut Patient / geäußerte Ängste"), 14, y);
  y = lines(doc, 12, y + 2, 2);
  y = smallNote(doc, tr(lang, "Objectifs (3 max) — spécifique, mesurable, atteignable, réaliste, temporel", "Ziele (max. 3)"), 14, y);
  // 3 lignes numérotées pour objectifs
  for (let i = 1; i <= 3; i++) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...CLOVER);
    doc.text(`${i}.`, 14, y + 4);
    doc.setDrawColor(...HAIRLINE);
    doc.line(20, y + 4, 198, y + 4);
    y += 6;
  }

  // Notes du clinicien (espace libre)
  y += 1;
  y = sectionTitle(doc, tr(lang, "Notes libres du clinicien", "Freie Notizen des Klinikers"), y);
  y = lines(doc, 12, y + 2, 5);

  doc.save(
    `EDD_FicheT0_vierge_${patient ? patient.lastName + "_" + patient.firstName + "_" : ""}${new Date().toISOString().slice(0, 10)}.pdf`
  );
}

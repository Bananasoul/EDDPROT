import jsPDF from "jspdf";
import type { Patient } from "@/lib/mock-data";

// Palette officielle Hôpital Saint-Nicolas Eupen (extraite hospital-eupen.be)
export const NAVY: [number, number, number] = [29, 44, 80];      // #1D2C50 — navy logo HSNE
export const NAVY_MID: [number, number, number] = [44, 68, 112]; // #2C4470
export const CYAN: [number, number, number] = [31, 150, 181];    // #1F96B5 — cyan signature
export const CYAN_LIGHT: [number, number, number] = [124, 197, 216]; // #7CC5D8
export const CYAN_SOFT: [number, number, number] = [213, 243, 248];  // #D5F3F8
export const CLOVER: [number, number, number] = [26, 107, 69];
export const AMBER: [number, number, number] = [211, 84, 0];
export const ACCENT: [number, number, number] = [192, 57, 43];
export const INK: [number, number, number] = [0, 22, 54];        // #001636 — texte HSNE
export const SLATE: [number, number, number] = [100, 116, 139];
export const HAIRLINE: [number, number, number] = [226, 232, 240];

export type Lang = "fr" | "de";

export const tr = (lang: Lang, fr: string, de: string) => (lang === "de" ? de : fr);

export const formatDate = (iso: string | null, lang: Lang) => {
  if (!iso) return tr(lang, "—", "—");
  const d = new Date(iso);
  return d.toLocaleDateString(lang === "de" ? "de-DE" : "fr-BE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

export const ageOf = (dob: string) => {
  const d = new Date(dob);
  const diff = Date.now() - d.getTime();
  return Math.floor(diff / (365.25 * 24 * 3600 * 1000));
};

export type DocMeta = {
  titleFr: string;
  titleDe: string;
  filename: string;
};

export function drawHeader(doc: jsPDF, lang: Lang, meta: DocMeta) {
  const W = doc.internal.pageSize.getWidth();
  // Navy band — couleur HSNE officielle #1D2C50
  doc.setFillColor(...NAVY);
  doc.rect(0, 0, W, 28, "F");
  // Accent stripe — cyan signature HSNE #1F96B5
  doc.setFillColor(...CYAN);
  doc.rect(0, 28, W, 1.5, "F");

  // Logo HSNE simplifié — 4 traits verticaux évoquant les feuilles du logo
  doc.setFillColor(255, 255, 255);
  doc.setLineWidth(1);
  // Triangles stylisés (silhouette des feuilles HSNE)
  const lx = 14, ly = 8;
  doc.triangle(lx, ly + 12, lx + 3, ly, lx + 6, ly + 12, "F");
  doc.triangle(lx + 5, ly + 12, lx + 8, ly, lx + 11, ly + 12, "F");

  // Hospital name (style logo HSNE)
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text(tr(lang, "ST. NIKOLAUS HOSPITAL EUPEN", "ST.-NIKOLAUS-HOSPITAL EUPEN"), 30, 13);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...CYAN_LIGHT);
  doc.text(tr(lang, "Service École du Dos · Programme KCE/INAMI", "Rückenschule · KCE/INAMI-Programm"), 30, 19);

  // Document title (right)
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text(tr(lang, meta.titleFr, meta.titleDe), W - 12, 13, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...CYAN_LIGHT);
  doc.text(
    tr(lang, "Document généré le ", "Erstellt am ") + formatDate(new Date().toISOString(), lang),
    W - 12,
    19,
    { align: "right" }
  );
}

export function drawFooter(doc: jsPDF, lang: Lang) {
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  doc.setDrawColor(...HAIRLINE);
  doc.setLineWidth(0.2);
  doc.line(12, H - 14, W - 12, H - 14);
  doc.setFontSize(7.5);
  doc.setTextColor(...SLATE);
  doc.setFont("helvetica", "normal");
  doc.text(
    tr(
      lang,
      "HSNE · Klosterstrasse 9 · 4700 Eupen · +32 87 59 91 11 · ecoledudos@hsne.be",
      "SNH · Klosterstraße 9 · 4700 Eupen · +32 87 59 91 11 · rueckenschule@snh.be"
    ),
    12,
    H - 9
  );
  const pageNum = doc.getCurrentPageInfo().pageNumber;
  doc.text(`${pageNum}`, W - 12, H - 9, { align: "right" });
  // Demo watermark (subtle)
  doc.setTextColor(...AMBER);
  doc.setFont("helvetica", "italic");
  doc.setFontSize(7);
  doc.text(
    tr(lang, "DOCUMENT DE DÉMONSTRATION — données fictives", "DEMONSTRATIONSDOKUMENT — fiktive Daten"),
    W / 2,
    H - 9,
    { align: "center" }
  );
}

export function drawPatientBox(doc: jsPDF, lang: Lang, p: Patient, y: number): number {
  const W = doc.internal.pageSize.getWidth();
  doc.setDrawColor(...HAIRLINE);
  doc.setFillColor(238, 244, 250); // navy-pale
  doc.roundedRect(12, y, W - 24, 30, 2, 2, "FD");

  doc.setTextColor(...NAVY);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text(`${p.lastName.toUpperCase()}, ${p.firstName}`, 16, y + 7);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...INK);
  const age = ageOf(p.dob);
  const sex = p.gender === "F" ? tr(lang, "F", "W") : "M";
  doc.text(
    `${tr(lang, "Né(e) le", "Geb.")} ${formatDate(p.dob, lang)} · ${age} ${tr(lang, "ans", "Jahre")} · ${sex}`,
    16,
    y + 13
  );
  doc.text(`${tr(lang, "Profession", "Beruf")} : ${p.job}`, 16, y + 18);
  doc.text(`${tr(lang, "Mutuelle", "Krankenkasse")} : ${p.mutual}`, 16, y + 23);

  // Right column
  const xR = W / 2 + 6;
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...NAVY);
  doc.text(tr(lang, "Dossier", "Dossier"), xR, y + 7);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...INK);
  doc.text(`ID : ${p.id.toUpperCase()}`, xR, y + 13);
  doc.text(`${tr(lang, "Prescripteur", "Verschreiber")} : ${p.prescriber}`, xR, y + 18);
  doc.text(
    `${tr(lang, "Séances réalisées", "Sitzungen abgeschlossen")} : ${p.sessionsDone} / 36`,
    xR,
    y + 23
  );

  return y + 30;
}

export function sectionTitle(doc: jsPDF, label: string, y: number): number {
  doc.setFillColor(...NAVY);
  doc.rect(12, y, 3, 6, "F");
  doc.setTextColor(...NAVY);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text(label, 18, y + 4.8);
  doc.setDrawColor(...HAIRLINE);
  doc.setLineWidth(0.2);
  const W = doc.internal.pageSize.getWidth();
  doc.line(18 + doc.getTextWidth(label) + 4, y + 3, W - 12, y + 3);
  return y + 10;
}

export function paragraph(doc: jsPDF, text: string, y: number, opts?: { bold?: boolean; size?: number }): number {
  const W = doc.internal.pageSize.getWidth();
  doc.setFont("helvetica", opts?.bold ? "bold" : "normal");
  doc.setFontSize(opts?.size ?? 9.5);
  doc.setTextColor(...INK);
  const lines = doc.splitTextToSize(text, W - 24);
  doc.text(lines, 12, y);
  return y + lines.length * (opts?.size ?? 9.5) * 0.42 + 1;
}

export function bulletList(doc: jsPDF, items: string[], y: number, color: [number, number, number] = NAVY): number {
  if (items.length === 0) {
    doc.setFont("helvetica", "italic");
    doc.setFontSize(9);
    doc.setTextColor(...SLATE);
    doc.text("—", 16, y + 4);
    return y + 6;
  }
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  let cy = y;
  for (const it of items) {
    doc.setFillColor(...color);
    doc.circle(15, cy + 2.5, 0.8, "F");
    doc.setTextColor(...INK);
    const W = doc.internal.pageSize.getWidth();
    const lines = doc.splitTextToSize(it, W - 30);
    doc.text(lines, 18, cy + 3);
    cy += lines.length * 4 + 1.5;
  }
  return cy + 2;
}

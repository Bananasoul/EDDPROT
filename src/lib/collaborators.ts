"use client";

import { useEffect, useState } from "react";

/**
 * Présence collaborative type Google Docs / Workspace.
 *
 * Réponse Q7 Philippe : « Merge et notification "X est en train d'éditer"
 *  un peu comme sur Google Workspace avec l'édition simultanée et on
 *  voit quels champs sont en train d'être édités. »
 *
 * Pour la démo on simule la présence de plusieurs utilisateurs en
 * mémoire (mock). En production : connexion WebSocket + Yjs ou
 * SyncStream Supabase pour le vrai multi-user.
 */

export type Collaborator = {
  id: string;
  initials: string;
  name: string;
  role: string;
  color: string; // couleur d'identification (cursor, border)
  /** Champ actuellement édité (clé interne, ex: "anamnesis.complaint.description") */
  editingField?: string;
  /** Section actuellement consultée */
  viewingSection?: string;
  /** Position simulée du curseur en pourcentage (pour ghost cursor démo) */
  cursorX?: number;
  cursorY?: number;
};

// Palette de couleurs distinctes pour les utilisateurs
const PALETTE = [
  "#1F96B5", // cyan HSNE
  "#1A6B45", // clover
  "#D35400", // amber
  "#8B5CF6", // purple
  "#EC4899", // pink
  "#0891B2", // teal
];

// Mock collaborateurs — équipe École du Dos
const ALL_COLLABORATORS: Omit<Collaborator, "editingField" | "viewingSection" | "cursorX" | "cursorY">[] = [
  { id: "u-fj", initials: "FJ", name: "F. Jenniges", role: "Ergothérapeute", color: PALETTE[0] },
  { id: "u-mpr", initials: "Dr.H", name: "Dr H. (MPR)", role: "Médecin physio", color: PALETTE[1] },
  { id: "u-secr", initials: "MS", name: "M. Secrétariat", role: "Secrétariat", color: PALETTE[2] },
  { id: "u-jl", initials: "JL", name: "J-L. Drosson", role: "Kinésithérapeute", color: PALETTE[3] },
];

const FIELDS_TO_SIMULATE = [
  "anamnesis.painHistory.onsetDate",
  "anamnesis.medical.imaging",
  "anamnesis.profession.currentJob",
  "anamnesis.factors.aggravating",
  "anamnesis.daySchema.sleepQuality",
  "anamnesis.patientPerspective.goals",
];

const SECTIONS = [
  "Anamnèse",
  "Tests",
  "Séances",
  "Rapport",
  "Vue d'ensemble",
];

/**
 * Hook qui simule la présence d'autres utilisateurs sur la fiche patient.
 * - Démarre avec 2 collaborateurs présents
 * - Alterne périodiquement quel champ est édité par qui
 * - Simule un curseur fantôme pour l'effet visuel
 */
export function useMockCollaborators(opts?: { patientId?: string; activate?: boolean }): Collaborator[] {
  const activate = opts?.activate ?? true;
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);

  useEffect(() => {
    if (!activate) {
      setCollaborators([]);
      return;
    }

    // Démarrage : 2 collaborateurs initiaux (Fanny + MPR)
    setCollaborators([
      { ...ALL_COLLABORATORS[0], editingField: FIELDS_TO_SIMULATE[0], viewingSection: "Anamnèse" },
      { ...ALL_COLLABORATORS[1], viewingSection: "Vue d'ensemble", cursorX: 70, cursorY: 30 },
    ]);

    // Toutes les 4-7s on change un champ édité ou un curseur
    const interval = setInterval(() => {
      setCollaborators((curr) => {
        if (curr.length === 0) return curr;
        return curr.map((c) => {
          // Probabilité 60% de changer de champ
          if (Math.random() > 0.4) {
            const newField = FIELDS_TO_SIMULATE[Math.floor(Math.random() * FIELDS_TO_SIMULATE.length)];
            return {
              ...c,
              editingField: newField,
              viewingSection: SECTIONS[Math.floor(Math.random() * SECTIONS.length)],
              cursorX: 20 + Math.random() * 60,
              cursorY: 20 + Math.random() * 60,
            };
          }
          return c;
        });
      });
    }, 5000 + Math.random() * 2000);

    // Toutes les 18s, un nouvel utilisateur arrive ou part (max 4)
    const churn = setInterval(() => {
      setCollaborators((curr) => {
        if (curr.length >= 3) {
          // Quelqu'un part (50%)
          if (Math.random() > 0.5) {
            return curr.slice(0, -1);
          }
        } else {
          // Quelqu'un arrive
          const candidate = ALL_COLLABORATORS.find((c) => !curr.find((x) => x.id === c.id));
          if (candidate) {
            return [...curr, { ...candidate, viewingSection: "Anamnèse" }];
          }
        }
        return curr;
      });
    }, 22000);

    return () => {
      clearInterval(interval);
      clearInterval(churn);
    };
  }, [activate]);

  return collaborators;
}

/** Trouve qui édite un champ donné */
export function whoIsEditing(field: string, collaborators: Collaborator[]): Collaborator | undefined {
  return collaborators.find((c) => c.editingField === field);
}

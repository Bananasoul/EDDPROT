"use client";

import { useEffect, useState } from "react";
import { MousePointer2 } from "lucide-react";
import type { Collaborator } from "@/lib/collaborators";

/**
 * Curseurs fantômes qui se déplacent à l'écran pour matérialiser
 * la présence d'autres utilisateurs (effet Google Workspace / Figma).
 *
 * Les positions cursorX/cursorY des collaborateurs sont en pourcentage
 * de la viewport. On anime les transitions en douceur.
 */
export function GhostCursors({ collaborators }: { collaborators: Collaborator[] }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // Filtrer ceux qui ont des coordonnées
  const visible = collaborators.filter((c) => c.cursorX != null && c.cursorY != null);

  return (
    <div className="fixed inset-0 pointer-events-none z-30 overflow-hidden">
      {visible.map((c) => (
        <div
          key={c.id}
          className="absolute transition-all duration-1500 ease-out"
          style={{
            left: `${c.cursorX}%`,
            top: `${c.cursorY}%`,
            transform: "translate(-2px, -2px)",
          }}
        >
          <MousePointer2
            className="w-5 h-5 drop-shadow"
            style={{ color: c.color, fill: c.color }}
          />
          <div
            className="absolute top-5 left-5 px-1.5 py-0.5 rounded text-[10px] font-bold text-white whitespace-nowrap shadow-md"
            style={{ backgroundColor: c.color }}
          >
            {c.name}
          </div>
        </div>
      ))}
    </div>
  );
}

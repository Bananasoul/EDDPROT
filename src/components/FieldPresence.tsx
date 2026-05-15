"use client";

import { useEffect, useState } from "react";
import { Edit3 } from "lucide-react";
import { whoIsEditing, type Collaborator } from "@/lib/collaborators";
import { cn } from "@/lib/utils";

/**
 * Wrapper qui affiche un indicateur "X est en train d'éditer" sur un champ.
 * À placer autour de chaque input collaboratif.
 */
export function FieldPresence({
  fieldKey,
  collaborators,
  children,
  className,
}: {
  fieldKey: string;
  collaborators: Collaborator[];
  children: React.ReactNode;
  className?: string;
}) {
  const editor = whoIsEditing(fieldKey, collaborators);
  const [highlight, setHighlight] = useState(false);

  // Quand un éditeur arrive sur ce champ, on flash brièvement
  useEffect(() => {
    if (editor) {
      setHighlight(true);
      const t = setTimeout(() => setHighlight(false), 1200);
      return () => clearTimeout(t);
    }
  }, [editor?.id]);

  return (
    <div className={cn("relative", className)}>
      {/* Le champ wrappé */}
      <div
        className={cn(
          "rounded-md transition-all duration-300",
          editor && "ring-2 ring-offset-1",
          highlight && "scale-[1.005]"
        )}
        style={{
          // ringColor inline pour utiliser la couleur du collaborateur
          boxShadow: editor ? `0 0 0 2px ${editor.color}, 0 0 12px ${editor.color}30` : undefined,
        }}
      >
        {children}
      </div>

      {/* Badge indicateur en haut à droite */}
      {editor && (
        <div
          className="absolute -top-2.5 right-2 z-10 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold text-white shadow-md whitespace-nowrap"
          style={{ backgroundColor: editor.color }}
        >
          <Edit3 className="w-2.5 h-2.5" />
          <span>{editor.name}</span>
          <span className="opacity-80">édite…</span>
        </div>
      )}
    </div>
  );
}

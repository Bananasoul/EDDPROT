"use client";

import { useState } from "react";
import { Eye, Edit3, Wifi } from "lucide-react";
import type { Collaborator } from "@/lib/collaborators";
import { cn } from "@/lib/utils";

/**
 * Pile d'avatars Google-Docs-style en haut d'un dossier.
 * Chaque avatar pulse subtilement quand l'utilisateur édite quelque chose.
 * Hover affiche son nom + ce qu'il fait.
 */
export function CollaborativePresence({
  collaborators,
  className,
}: {
  collaborators: Collaborator[];
  className?: string;
}) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  if (collaborators.length === 0) return null;

  const visible = collaborators.slice(0, 4);
  const overflow = collaborators.length - visible.length;

  return (
    <div className={cn("inline-flex items-center gap-2", className)}>
      <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate">
        <Wifi className="w-3.5 h-3.5 text-clover" />
        En ligne
      </div>

      <div className="flex -space-x-2 relative">
        {visible.map((c) => {
          const isEditing = !!c.editingField;
          return (
            <div
              key={c.id}
              className="relative"
              onMouseEnter={() => setHoveredId(c.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold text-white border-2 border-white shadow-sm transition-transform",
                  isEditing && "ring-2 ring-offset-0 animate-pulse-subtle"
                )}
                style={{
                  backgroundColor: c.color,
                  boxShadow: isEditing ? `0 0 0 3px ${c.color}33` : undefined,
                }}
              >
                {c.initials}
              </div>

              {/* Tooltip détaillé au hover */}
              {hoveredId === c.id && (
                <div className="absolute top-full mt-2 right-0 z-50 w-56 rounded-lg bg-navy text-white p-2.5 text-xs shadow-xl">
                  <div className="font-bold flex items-center gap-1.5">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: c.color }}
                    />
                    {c.name}
                  </div>
                  <div className="text-white/70 text-[10px] mt-0.5">{c.role}</div>
                  {c.viewingSection && (
                    <div className="mt-2 flex items-center gap-1.5 text-[10px]">
                      <Eye className="w-3 h-3" />
                      <span>Consulte : <strong>{c.viewingSection}</strong></span>
                    </div>
                  )}
                  {c.editingField && (
                    <div className="mt-1 flex items-center gap-1.5 text-[10px] text-amber">
                      <Edit3 className="w-3 h-3" />
                      <span>Édite : <strong>{c.editingField.split(".").pop()}</strong></span>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {overflow > 0 && (
          <div className="w-8 h-8 rounded-full bg-slate-light text-slate flex items-center justify-center text-[11px] font-bold border-2 border-white">
            +{overflow}
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes pulse-subtle {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.08); }
        }
        .animate-pulse-subtle {
          animation: pulse-subtle 1.6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

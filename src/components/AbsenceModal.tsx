"use client";

import { useState } from "react";
import { X, AlertTriangle, Phone, MessageSquare, Send } from "lucide-react";
import {
  ABSENCE_REASONS,
  STATUS_META,
  type AbsenceReason,
  type AttendanceStatus,
} from "@/lib/attendance";
import type { Patient } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

type Props = {
  patient: Patient;
  initialStatus?: AttendanceStatus;
  onClose: () => void;
  onConfirm: (data: {
    status: AttendanceStatus;
    reason?: AbsenceReason;
    reasonNote?: string;
    sendFollowup: boolean;
  }) => void;
};

const STATUS_OPTIONS: AttendanceStatus[] = [
  "cancelled_advance",
  "cancelled_late",
  "no_show_excused",
  "no_show_unexcused",
];

export function AbsenceModal({ patient, initialStatus = "cancelled_late", onClose, onConfirm }: Props) {
  const [status, setStatus] = useState<AttendanceStatus>(initialStatus);
  const [reason, setReason] = useState<AbsenceReason | "">("");
  const [reasonNote, setReasonNote] = useState("");
  const [sendFollowup, setSendFollowup] = useState(false);

  const isUnexcused = status === "no_show_unexcused";

  return (
    <div className="fixed inset-0 z-50 bg-navy/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber to-amber/80 text-white px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5" />
            <div>
              <div className="font-bold text-base leading-tight">Signaler une absence</div>
              <div className="text-xs opacity-90">
                {patient.lastName.toUpperCase()} {patient.firstName} · {patient.lang.toUpperCase()}
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded hover:bg-white/15">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Statut */}
          <div>
            <div className="text-xs font-bold uppercase tracking-wide text-slate mb-2">
              Type d&apos;absence
            </div>
            <div className="grid grid-cols-2 gap-2">
              {STATUS_OPTIONS.map((s) => {
                const meta = STATUS_META[s];
                const active = status === s;
                return (
                  <button
                    key={s}
                    onClick={() => setStatus(s)}
                    className={cn(
                      "p-2.5 rounded-md border text-left transition",
                      active
                        ? "border-navy ring-2 ring-navy/20"
                        : "border-hairline hover:border-navy-mid"
                    )}
                    style={{
                      backgroundColor: active ? meta.bg : "white",
                    }}
                  >
                    <div className="text-sm font-bold" style={{ color: meta.color }}>
                      {meta.fr}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Motif */}
          <div>
            <div className="text-xs font-bold uppercase tracking-wide text-slate mb-2">
              Motif (optionnel)
            </div>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value as AbsenceReason)}
              className="w-full rounded-md border border-hairline px-3 py-2 text-sm"
            >
              <option value="">— sélectionner —</option>
              {(Object.keys(ABSENCE_REASONS) as AbsenceReason[]).map((r) => (
                <option key={r} value={r}>
                  {ABSENCE_REASONS[r].fr}
                </option>
              ))}
            </select>
          </div>

          {/* Note libre */}
          <div>
            <div className="text-xs font-bold uppercase tracking-wide text-slate mb-2">
              Note (contexte précis)
            </div>
            <textarea
              value={reasonNote}
              onChange={(e) => setReasonNote(e.target.value)}
              rows={2}
              placeholder="ex. téléphoné le matin / contact via mari / etc."
              className="w-full rounded-md border border-hairline px-3 py-2 text-sm"
            />
          </div>

          {/* Relance */}
          {isUnexcused && (
            <div className="rounded-md border border-accent/30 bg-accent/5 p-3">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={sendFollowup}
                  onChange={(e) => setSendFollowup(e.target.checked)}
                  className="mt-0.5"
                />
                <div className="flex-1">
                  <div className="text-sm font-bold text-accent flex items-center gap-1.5">
                    <Send className="w-3.5 h-3.5" />
                    Envoyer une relance immédiate au patient
                  </div>
                  <div className="text-xs text-slate mt-1 leading-relaxed">
                    SMS + email type « Vous étiez attendu(e) ce jour. Merci de nous recontacter
                    au 087 599 542 pour confirmer la suite de votre programme. »
                  </div>
                </div>
              </label>
            </div>
          )}

          {/* Quick actions */}
          <div className="flex gap-2 text-xs">
            <a
              href={`tel:+32${patient.id.replace("p", "")}`}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-hairline text-navy hover:bg-navy-pale"
            >
              <Phone className="w-3 h-3" />
              Appeler
            </a>
            <button className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-hairline text-navy hover:bg-navy-pale">
              <MessageSquare className="w-3 h-3" />
              SMS rapide
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-light/30 px-5 py-3 flex justify-end gap-2 border-t border-hairline">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md text-sm border border-hairline text-slate hover:text-navy"
          >
            Annuler
          </button>
          <button
            onClick={() =>
              onConfirm({
                status,
                reason: reason || undefined,
                reasonNote: reasonNote || undefined,
                sendFollowup,
              })
            }
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-bold bg-navy text-white hover:bg-navy-mid"
          >
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
}

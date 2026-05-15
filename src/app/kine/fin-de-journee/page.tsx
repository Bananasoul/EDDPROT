"use client";

import { useMemo, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Download,
  UserCheck,
  UserX,
  Sparkles,
  Eye,
  Clock,
  Calendar,
} from "lucide-react";
import Link from "next/link";
import { patients, getPatient, type Patient } from "@/lib/mock-data";
import {
  THERAPISTS,
  TODAY_PRESENCE,
  isPresent,
  suggestEncoding,
  buildEncodingCsv,
  therapistsByRole,
  therapistById,
  type SessionEncoding,
} from "@/lib/therapists";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

const TODAY = new Date("2026-05-15");
const TODAY_STR = TODAY.toISOString().slice(0, 10);

// Patients présents aujourd'hui (mock — utilise les mêmes 8 que la vue matin)
const TODAYS_PATIENTS: string[] = ["p008", "p009", "p014", "p015", "p016", "p017", "p020"];
// (p010 Vandenberg absent → exclu de l'encodage du jour)

export default function FinDeJourneePage() {
  const presentTherapists = THERAPISTS.filter((t) => isPresent(t.id));
  const absentTherapists = THERAPISTS.filter((t) =>
    TODAY_PRESENCE.absentTherapistIds.includes(t.id)
  );

  // Suggestion automatique pour la journée
  const suggested = useMemo(() => suggestEncoding(TODAY_STR), []);

  // État des encodages
  const [encodings, setEncodings] = useState<SessionEncoding[]>(() =>
    TODAYS_PATIENTS.map((pid) => {
      const p = getPatient(pid);
      return {
        sessionKey: `${pid}-${TODAY_STR}`,
        patientId: pid,
        date: TODAY.toISOString(),
        sessionNumber: (p?.sessionsDone ?? 0) + 1,
        kineId: suggested.kineId,
        ergoId: suggested.ergoId,
        validated: false,
      };
    })
  );

  const [validatedDay, setValidatedDay] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (m: string) => {
    setToast(m);
    setTimeout(() => setToast(null), 3500);
  };

  const updateEncoding = (
    sessionKey: string,
    patch: Partial<Pick<SessionEncoding, "kineId" | "ergoId">>
  ) => {
    setEncodings((s) =>
      s.map((e) => (e.sessionKey === sessionKey ? { ...e, ...patch } : e))
    );
  };

  const allKines = therapistsByRole("kine");
  const allErgos = therapistsByRole("ergo");

  // Stats
  const completeCount = encodings.filter((e) => e.kineId && e.ergoId).length;
  const incompleteCount = encodings.length - completeCount;

  // Bulk apply
  const applyBulkKine = (id: string) => {
    setEncodings((s) => s.map((e) => ({ ...e, kineId: id })));
    showToast(`Kiné assigné à toutes les séances : code ${therapistById(id)?.internalCode}`);
  };
  const applyBulkErgo = (id: string) => {
    setEncodings((s) => s.map((e) => ({ ...e, ergoId: id })));
    showToast(`Ergo assigné à toutes les séances : code ${therapistById(id)?.internalCode}`);
  };

  const validateDay = () => {
    if (incompleteCount > 0) {
      showToast(`⚠ ${incompleteCount} séance(s) incomplète(s) — assignez kiné + ergo`);
      return;
    }
    setEncodings((s) =>
      s.map((e) => ({ ...e, validated: true, validatedAt: new Date().toISOString() }))
    );
    setValidatedDay(true);
    showToast("✓ Journée validée — encodages prêts pour PHYSIO");
  };

  const downloadCsv = () => {
    const csv = buildEncodingCsv(encodings, (id) => {
      const p = getPatient(id);
      return p ? { lastName: p.lastName, firstName: p.firstName, mutual: p.mutual } : undefined;
    });
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `EDD_encodage_${TODAY_STR}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    showToast("CSV téléchargé — à importer dans PHYSIO");
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-6 space-y-6">
      <Link
        href="/kine/aujourdhui"
        className="inline-flex items-center gap-1.5 text-sm text-slate hover:text-navy"
      >
        <ArrowLeft className="w-4 h-4" />
        Retour à la vue du jour
      </Link>

      <header>
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-amber-soft text-amber text-xs font-bold mb-2">
          <Clock className="w-3.5 h-3.5" />
          Avant de partir — encodage du jour
        </div>
        <h1 className="font-bold text-3xl text-navy">Validation des encodages</h1>
        <p className="text-sm text-slate mt-1">
          Vendredi 15 mai 2026 · {encodings.length} séance(s) à encoder pour le logiciel PHYSIO
        </p>
      </header>

      {/* Bandeau présence du jour */}
      <Card>
        <CardHeader title="Présence des thérapeutes aujourd'hui" subtitle="Le badge présence détermine qui peut être sélectionné" />
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <div className="text-xs uppercase tracking-wider text-clover font-bold mb-2">
                <UserCheck className="w-3.5 h-3.5 inline" /> Présents ({presentTherapists.length})
              </div>
              <div className="flex flex-wrap gap-2">
                {presentTherapists.map((t) => (
                  <div
                    key={t.id}
                    className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-md bg-clover-soft text-clover text-xs font-bold border border-clover/20"
                  >
                    <span className="w-6 h-6 rounded-full bg-clover text-white flex items-center justify-center text-[10px]">
                      {t.initials}
                    </span>
                    <span>{t.role.toUpperCase()}</span>
                    <span className="opacity-70">code {t.internalCode}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wider text-accent font-bold mb-2">
                <UserX className="w-3.5 h-3.5 inline" /> Absents ({absentTherapists.length})
              </div>
              <div className="flex flex-wrap gap-2">
                {absentTherapists.map((t) => (
                  <div
                    key={t.id}
                    className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-md bg-accent/5 text-accent text-xs font-bold border border-accent/20 line-through opacity-70"
                    title={TODAY_PRESENCE.notes?.[t.id]}
                  >
                    <span className="w-6 h-6 rounded-full bg-accent text-white flex items-center justify-center text-[10px] not-line-through">
                      {t.initials}
                    </span>
                    <span>{t.role.toUpperCase()}</span>
                    <span className="opacity-70">code {t.internalCode}</span>
                  </div>
                ))}
              </div>
              {Object.entries(TODAY_PRESENCE.notes ?? {}).map(([id, note]) => (
                <div key={id} className="text-[11px] text-slate mt-2 italic">
                  ↳ {note}
                </div>
              ))}
            </div>
          </div>
        </CardBody>
      </Card>

      {/* KPI rapides */}
      <section className="grid grid-cols-3 gap-3">
        <KpiCard label="Séances à encoder" value={encodings.length} tone="navy" />
        <KpiCard label="Encodages complets" value={completeCount} tone="clover" />
        <KpiCard label="Manquants" value={incompleteCount} tone={incompleteCount > 0 ? "amber" : "slate"} />
      </section>

      {/* Application en masse */}
      <Card>
        <CardHeader
          title="Appliquer en masse à toute la journée"
          subtitle="Utile quand un seul kiné/ergo a tenu toute la session"
        />
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-slate mb-2">
                Tout le jour kiné =
              </div>
              <div className="flex flex-wrap gap-1.5">
                {allKines.map((t) => {
                  const present = isPresent(t.id);
                  return (
                    <button
                      key={t.id}
                      onClick={() => applyBulkKine(t.id)}
                      disabled={!present}
                      className={cn(
                        "inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-bold transition",
                        present
                          ? "bg-navy text-white hover:bg-navy-mid"
                          : "bg-slate-light text-slate cursor-not-allowed line-through"
                      )}
                    >
                      <span className="opacity-80">{t.initials}</span>
                      <span>code {t.internalCode}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-slate mb-2">
                Tout le jour ergo =
              </div>
              <div className="flex flex-wrap gap-1.5">
                {allErgos.map((t) => {
                  const present = isPresent(t.id);
                  return (
                    <button
                      key={t.id}
                      onClick={() => applyBulkErgo(t.id)}
                      disabled={!present}
                      className={cn(
                        "inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-bold transition",
                        present
                          ? "bg-clover text-white hover:bg-clover/90"
                          : "bg-slate-light text-slate cursor-not-allowed line-through"
                      )}
                    >
                      <span className="opacity-80">{t.initials}</span>
                      <span>code {t.internalCode}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Tableau d'encodage */}
      <Card>
        <CardHeader
          title="Détail par séance"
          subtitle="Modifiez les codes individuellement si nécessaire"
        />
        <CardBody className="px-0">
          <table className="w-full text-sm">
            <thead className="text-xs uppercase tracking-wide text-slate bg-slate-light/40">
              <tr>
                <th className="text-left px-4 py-2 font-bold">Patient</th>
                <th className="text-center px-3 py-2 font-bold">Séance</th>
                <th className="text-left px-3 py-2 font-bold">Code kiné</th>
                <th className="text-left px-3 py-2 font-bold">Code ergo</th>
                <th className="text-center px-3 py-2 font-bold">Statut</th>
              </tr>
            </thead>
            <tbody>
              {encodings.map((e) => {
                const p = getPatient(e.patientId);
                if (!p) return null;
                const complete = e.kineId && e.ergoId;
                return (
                  <tr key={e.sessionKey} className={cn("border-t border-hairline/40", complete ? "bg-clover-soft/30" : "")}>
                    <td className="px-4 py-2.5">
                      <div className="font-bold text-navy">
                        {p.lastName.toUpperCase()} {p.firstName}
                      </div>
                      <div className="text-[11px] text-slate">{p.mutual}</div>
                    </td>
                    <td className="px-3 py-2.5 text-center font-bold tabular-nums">{e.sessionNumber}/36</td>
                    <td className="px-3 py-2.5">
                      <CodeSelect
                        therapists={allKines}
                        value={e.kineId}
                        onChange={(v) => updateEncoding(e.sessionKey, { kineId: v })}
                      />
                    </td>
                    <td className="px-3 py-2.5">
                      <CodeSelect
                        therapists={allErgos}
                        value={e.ergoId}
                        onChange={(v) => updateEncoding(e.sessionKey, { ergoId: v })}
                      />
                    </td>
                    <td className="px-3 py-2.5 text-center">
                      {complete ? (
                        <span className="inline-flex items-center gap-1 text-clover text-xs font-bold">
                          <CheckCircle2 className="w-4 h-4" />
                          OK
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-amber text-xs font-bold">
                          <AlertTriangle className="w-4 h-4" />
                          Manque
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardBody>
      </Card>

      {/* Validation finale + export */}
      <Card className={cn("border-l-4", validatedDay ? "border-l-clover bg-clover-soft/30" : "border-l-amber")}>
        <CardBody>
          <div className="flex items-start gap-4 flex-wrap">
            <div
              className={cn(
                "w-12 h-12 rounded-lg flex items-center justify-center shrink-0",
                validatedDay ? "bg-clover text-white" : "bg-amber text-white"
              )}
            >
              {validatedDay ? <CheckCircle2 className="w-6 h-6" /> : <Sparkles className="w-6 h-6" />}
            </div>
            <div className="flex-1 min-w-[250px]">
              <div className="font-bold text-navy">
                {validatedDay ? "Journée validée" : "Validation finale"}
              </div>
              <p className="text-sm text-slate mt-0.5">
                {validatedDay
                  ? "Tous les encodages sont OK. Téléchargez le CSV à importer dans PHYSIO."
                  : "Une fois tous les encodages complets, validez la journée pour générer le récap CSV."}
              </p>
            </div>
            <div className="flex gap-2">
              {!validatedDay && (
                <button
                  onClick={validateDay}
                  className={cn(
                    "inline-flex items-center gap-2 px-4 py-2.5 rounded-md text-sm font-bold transition",
                    incompleteCount === 0
                      ? "bg-clover text-white hover:bg-clover/90"
                      : "bg-slate-light text-slate cursor-not-allowed"
                  )}
                  disabled={incompleteCount > 0}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Valider la journée
                </button>
              )}
              <button
                onClick={downloadCsv}
                disabled={!validatedDay}
                className={cn(
                  "inline-flex items-center gap-2 px-4 py-2.5 rounded-md text-sm font-bold transition",
                  validatedDay
                    ? "bg-navy text-white hover:bg-navy-mid"
                    : "bg-slate-light text-slate cursor-not-allowed"
                )}
              >
                <Download className="w-4 h-4" />
                Export CSV PHYSIO
              </button>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Notes */}
      <Card>
        <CardBody>
          <div className="flex items-start gap-2 text-xs text-slate">
            <Eye className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong className="text-navy">Comment ça fonctionne :</strong> dès que tu coches une présence le matin
              dans <Link href="/kine/aujourdhui" className="text-cyan font-bold hover:underline">Mon matin</Link>,
              une ligne d&apos;encodage est créée ici. Le système suggère les codes de l&apos;équipe habituelle
              (kiné matin K1 + ergo matin E1) mais bascule automatiquement sur le remplaçant en cas d&apos;absence
              (ex. ergo E1 absente → E3 suggérée). Tu valides en fin de journée et tu télécharges le CSV
              pour saisie dans le logiciel PHYSIO. Demain, base de calcul prête pour la facturation INAMI.
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-20 right-4 z-50 max-w-md rounded-lg bg-navy text-white shadow-lg p-3 text-sm font-medium">
          {toast}
        </div>
      )}
    </div>
  );
}

function KpiCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "navy" | "clover" | "amber" | "slate";
}) {
  const colors = {
    navy: "text-navy bg-navy-pale",
    clover: "text-clover bg-clover-soft",
    amber: "text-amber bg-amber-soft",
    slate: "text-slate bg-slate-light",
  };
  return (
    <div className="rounded-lg border border-hairline bg-white p-3 text-center">
      <div className="text-[10px] uppercase tracking-wide text-slate font-bold">{label}</div>
      <div className={cn("text-2xl font-bold tabular-nums mt-1 inline-block px-3 rounded", colors[tone])}>
        {value}
      </div>
    </div>
  );
}

function CodeSelect({
  therapists,
  value,
  onChange,
}: {
  therapists: import("@/lib/therapists").Therapist[];
  value: string | null;
  onChange: (id: string | null) => void;
}) {
  return (
    <select
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value || null)}
      className={cn(
        "rounded-md border px-2 py-1.5 text-xs font-mono tabular-nums",
        value ? "border-hairline bg-white" : "border-amber bg-amber-soft text-amber"
      )}
    >
      <option value="">— code —</option>
      {therapists.map((t) => {
        const present = isPresent(t.id);
        return (
          <option key={t.id} value={t.id} disabled={!present}>
            {t.internalCode} ({t.initials}) {present ? "" : "✗ absent"}
          </option>
        );
      })}
    </select>
  );
}

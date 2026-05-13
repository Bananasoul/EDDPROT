"use client";

import { notFound, useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getPatient } from "@/lib/mock-data";
import { AnamnesisForm } from "@/components/AnamnesisForm";
import { generateAnamnesisReport } from "@/lib/pdf/anamnesisReport";
import { useApp } from "@/lib/app-context";

export default function AnamneseT0Page() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { lang } = useApp();
  const p = getPatient(params.id);
  const tr = (fr: string, de: string) => (lang === "de" ? de : fr);

  if (!p) return notFound();

  return (
    <div className="max-w-5xl mx-auto px-6 py-6">
      <button
        onClick={() => router.push(`/kine/${p.id}`)}
        className="inline-flex items-center gap-1.5 text-sm text-slate hover:text-navy mb-3"
      >
        <ArrowLeft className="w-4 h-4" />
        {tr("Retour à la fiche patient", "Zurück zur Patientenakte")}
      </button>

      <header className="mb-4 pb-3 border-b border-hairline">
        <div className="text-xs text-amber uppercase tracking-wider font-semibold">
          {tr("Anamnèse d'entrée — Séance 1 (T0)", "Eingangsanamnese — Sitzung 1 (T0)")}
        </div>
        <h1 className="font-serif text-2xl text-navy mt-1">
          {p.lastName.toUpperCase()} {p.firstName}
        </h1>
        <div className="text-sm text-slate mt-0.5">
          {p.gender === "F" ? "♀" : "♂"} ·{" "}
          {new Date(p.dob).toLocaleDateString(lang === "de" ? "de-DE" : "fr-BE")} ·{" "}
          {p.job} · {p.lang.toUpperCase()} · {p.prescriber}
        </div>
      </header>

      <AnamnesisForm
        patient={p}
        onSave={() => {
          // mock save — feedback toast pourrait être ajouté
          alert(tr("Anamnèse enregistrée (démo).", "Anamnese gespeichert (Demo)."));
        }}
        onGeneratePDF={(d) => generateAnamnesisReport(d, p, lang)}
      />
    </div>
  );
}

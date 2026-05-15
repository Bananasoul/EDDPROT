"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Search, Users, ClipboardCheck, Calendar, TrendingDown, Smile, Plus, ChevronRight, Sunrise, ArrowRight } from "lucide-react";
import { patients, kpis } from "@/lib/mock-data";
import { useApp } from "@/lib/app-context";
import { KPITile } from "@/components/KPITile";
import { StatusBadge } from "@/components/StatusBadge";

export default function KinePage() {
  const { t } = useApp();
  const k = useMemo(() => kpis(), []);
  const [q, setQ] = useState("");

  const filtered = patients.filter((p) => {
    const n = `${p.firstName} ${p.lastName} ${p.job}`.toLowerCase();
    return n.includes(q.toLowerCase());
  });

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <div className="text-xs text-slate uppercase tracking-wide font-medium">
            {t.roles.kine.name}
          </div>
          <h1 className="font-serif text-3xl text-navy mt-1">{t.patientsList}</h1>
        </div>
        <button className="inline-flex items-center gap-2 bg-navy text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-navy-mid transition">
          <Plus className="w-4 h-4" />
          {t.newEval}
        </button>
      </div>

      {/* CTA Mon matin — vue principale d'arrivée */}
      <Link
        href="/kine/aujourdhui"
        className="block mb-4 rounded-xl bg-gradient-to-r from-navy via-navy-mid to-cyan-mid text-white p-5 hover:shadow-xl hover:scale-[1.005] transition group"
      >
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
            <Sunrise className="w-7 h-7" />
          </div>
          <div className="flex-1">
            <div className="text-xs uppercase tracking-widest opacity-80 font-bold">
              Vue d&apos;arrivée recommandée
            </div>
            <div className="font-bold text-xl mt-0.5">Mon matin du jour</div>
            <div className="text-sm opacity-90 mt-1">
              Liste de présence du groupe · alertes assiduité · nouveaux T0 · interventions ergo · séances psy
            </div>
          </div>
          <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition" />
        </div>
      </Link>

      {/* Boutons magiques : Veille + Métaphores */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
        <Link
          href="/veille"
          className="rounded-xl bg-white border-2 border-cyan p-4 hover:bg-cyan-soft transition group flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-lg bg-cyan text-white flex items-center justify-center shrink-0">
            <span className="text-xl">✨</span>
          </div>
          <div className="flex-1">
            <div className="text-[10px] uppercase tracking-widest text-cyan-mid font-bold">
              Bouton magique #1
            </div>
            <div className="font-bold text-navy">Veille scientifique LBP</div>
            <div className="text-xs text-slate mt-0.5">12 articles cette quinzaine · résumés Copilot · implications HSNE</div>
          </div>
          <ChevronRight className="w-5 h-5 text-cyan group-hover:translate-x-0.5 transition" />
        </Link>
        <Link
          href="/metaphores"
          className="rounded-xl bg-white border-2 border-amber p-4 hover:bg-amber-soft transition group flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-lg bg-amber text-white flex items-center justify-center shrink-0">
            <span className="text-xl">📖</span>
          </div>
          <div className="flex-1">
            <div className="text-[10px] uppercase tracking-widest text-amber font-bold">
              Bouton magique #2
            </div>
            <div className="font-bold text-navy">6 métaphores pédagogiques</div>
            <div className="text-xs text-slate mt-0.5">Locomotive · éponge · câble · sprinter · jeu on/off · voiture</div>
          </div>
          <ChevronRight className="w-5 h-5 text-amber group-hover:translate-x-0.5 transition" />
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
        <KPITile label={t.kpi.active} value={k.active} icon={<Users className="w-5 h-5" />} />
        <KPITile label={t.kpi.t0_pending} value={k.t0Pending} tone="amber" icon={<ClipboardCheck className="w-5 h-5" />} />
        <KPITile label={t.kpi.t1_pending} value={k.t1Pending} tone="accent" icon={<Calendar className="w-5 h-5" />} />
        <KPITile label={t.kpi.avg_pain_drop} value={`−${k.avgDrop}`} sub="/ 10 (EVA)" tone="clover" icon={<TrendingDown className="w-5 h-5" />} />
        <KPITile label={t.kpi.satisfaction} value={`${k.satisfaction}%`} tone="clover" icon={<Smile className="w-5 h-5" />} />
      </div>

      <div className="bg-white rounded-xl border border-hairline overflow-hidden">
        <div className="px-5 py-3 border-b border-hairline flex items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t.search + "..."}
              className="w-full pl-9 pr-3 py-2 text-sm bg-slate-light/60 border border-transparent rounded-lg focus:outline-none focus:border-navy-mid focus:bg-white"
            />
          </div>
          <span className="text-xs text-slate">
            {filtered.length} / {patients.length}
          </span>
        </div>

        <table className="w-full text-sm">
          <thead className="bg-slate-light/60 text-slate text-xs uppercase tracking-wide">
            <tr>
              <th className="text-left px-5 py-2 font-medium">{t.patient}</th>
              <th className="text-left px-3 py-2 font-medium">{t.job}</th>
              <th className="text-left px-3 py-2 font-medium">{t.prescriber}</th>
              <th className="text-center px-3 py-2 font-medium">{t.sessions}</th>
              <th className="text-left px-3 py-2 font-medium">Statut</th>
              <th className="px-3 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr
                key={p.id}
                className="border-t border-hairline/60 hover:bg-navy-pale/40 transition cursor-pointer"
              >
                <td className="px-5 py-3">
                  <Link href={`/kine/${p.id}`} className="block">
                    <div className="font-medium text-navy">
                      {p.lastName.toUpperCase()} {p.firstName}
                    </div>
                    <div className="text-xs text-slate">
                      {p.gender === "F" ? "♀" : "♂"} ·{" "}
                      {new Date(p.dob).toLocaleDateString("fr-BE")} · {p.lang.toUpperCase()}
                    </div>
                  </Link>
                </td>
                <td className="px-3 py-3 text-slate">{p.job}</td>
                <td className="px-3 py-3 text-slate">{p.prescriber}</td>
                <td className="px-3 py-3 text-center">
                  <SessionsBar done={p.sessionsDone} />
                </td>
                <td className="px-3 py-3">
                  <StatusBadge status={p.status} />
                </td>
                <td className="px-3 py-3 text-right">
                  <Link
                    href={`/kine/${p.id}`}
                    className="inline-flex items-center text-navy-mid hover:text-navy"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SessionsBar({ done }: { done: number }) {
  const pct = (done / 36) * 100;
  const color = done === 36 ? "bg-clover" : done === 0 ? "bg-hairline" : "bg-navy-mid";
  return (
    <div className="flex items-center gap-2 justify-center">
      <span className="text-xs font-medium text-navy tabular-nums">{done}/36</span>
      <div className="w-20 h-1.5 rounded-full bg-slate-light overflow-hidden">
        <div className={`h-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

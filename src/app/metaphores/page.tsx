"use client";

import { useState, useMemo } from "react";
import {
  BookOpen,
  Search,
  Send,
  Share2,
  ChevronRight,
  X,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import { METAPHORS, CATEGORY_META, type Metaphor, type MetaphorCategory } from "@/lib/metaphors";
import { useApp } from "@/lib/app-context";
import { Card, CardBody } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

export default function MetaphoresPage() {
  const { lang } = useApp();
  const tr = (fr: string, de: string) => (lang === "de" ? de : fr);

  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState<MetaphorCategory | null>(null);
  const [openMetaphor, setOpenMetaphor] = useState<Metaphor | null>(null);

  const filtered = useMemo(() => {
    return METAPHORS.filter((m) => {
      if (filterCat && m.category !== filterCat) return false;
      if (search) {
        const q = search.toLowerCase();
        const txt = (
          m.titleFr + m.titleDe + m.hookFr + m.hookDe + m.useCaseFr +
          m.audienceTags.join(" ")
        ).toLowerCase();
        if (!txt.includes(q)) return false;
      }
      return true;
    });
  }, [search, filterCat]);

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
      {/* Header */}
      <header>
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-slate hover:text-navy mb-3">
          <ArrowLeft className="w-4 h-4" />
          {tr("Accueil", "Startseite")}
        </Link>
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-cyan-soft text-cyan-mid text-xs font-bold mb-2">
          <BookOpen className="w-3.5 h-3.5" />
          {tr("Bibliothèque pédagogique HSNE", "Pädagogische Bibliothek SNH")}
        </div>
        <h1 className="font-bold text-3xl text-navy">
          {tr("Les 6 métaphores Philippe", "Die 6 Metaphern von Philippe")}
        </h1>
        <p className="text-slate text-sm mt-1 max-w-3xl leading-relaxed">
          {tr(
            "Le langage commun de l'École du Dos HSNE pour expliquer les concepts complexes au patient. Chaque métaphore est utilisée selon la sensibilité du patient et son champ lexical. Partagez-en une avec vos patients pour qu'ils retrouvent l'explication chez eux.",
            "Die gemeinsame Sprache der Rückenschule SNH zur Erklärung komplexer Konzepte für den Patienten. Jede Metapher wird je nach Sensibilität des Patienten und seinem Wortschatz verwendet. Teilen Sie eine mit Ihren Patienten."
          )}
        </p>
      </header>

      {/* Filtres */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={tr("Rechercher une métaphore, mot-clé, audience…", "Metapher, Stichwort, Zielgruppe suchen…")}
            className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-hairline rounded-lg focus:outline-none focus:border-cyan focus:ring-2 focus:ring-cyan/20"
          />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          <button
            onClick={() => setFilterCat(null)}
            className={cn(
              "px-2.5 py-1.5 rounded-md text-xs font-bold uppercase tracking-wide transition",
              !filterCat ? "bg-navy text-white" : "bg-white border border-hairline text-slate hover:text-navy"
            )}
          >
            {tr("Toutes", "Alle")}
          </button>
          {(Object.keys(CATEGORY_META) as MetaphorCategory[]).map((cat) => {
            const meta = CATEGORY_META[cat];
            const active = filterCat === cat;
            return (
              <button
                key={cat}
                onClick={() => setFilterCat(active ? null : cat)}
                className="px-2.5 py-1.5 rounded-md text-xs font-bold uppercase tracking-wide transition border"
                style={{
                  backgroundColor: active ? meta.color : "white",
                  color: active ? "white" : meta.color,
                  borderColor: meta.color,
                }}
              >
                {meta.icon} {tr(meta.fr, meta.de)}
              </button>
            );
          })}
        </div>
      </div>

      {/* Grille */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((m) => (
          <MetaphorCard key={m.id} m={m} onOpen={() => setOpenMetaphor(m)} tr={tr} />
        ))}
      </section>

      {filtered.length === 0 && (
        <Card>
          <CardBody>
            <div className="text-center text-slate py-8">
              {tr("Aucune métaphore ne correspond à votre recherche.", "Keine Metapher entspricht Ihrer Suche.")}
            </div>
          </CardBody>
        </Card>
      )}

      {/* Modal détail */}
      {openMetaphor && (
        <MetaphorDetail m={openMetaphor} onClose={() => setOpenMetaphor(null)} tr={tr} />
      )}
    </div>
  );
}

// ─── Carte métaphore ───
function MetaphorCard({
  m,
  onOpen,
  tr,
}: {
  m: Metaphor;
  onOpen: () => void;
  tr: (fr: string, de: string) => string;
}) {
  const cat = CATEGORY_META[m.category];
  return (
    <button
      onClick={onOpen}
      className="text-left bg-white rounded-xl border border-hairline p-5 hover:shadow-lg hover:border-cyan transition group"
    >
      <div className="flex items-start gap-3">
        <div className="text-4xl shrink-0">{m.emoji}</div>
        <div className="flex-1 min-w-0">
          <div
            className="inline-block text-[10px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded"
            style={{ color: cat.color, backgroundColor: cat.color + "15" }}
          >
            {tr(cat.fr, cat.de)}
          </div>
          <h3 className="font-bold text-navy text-lg mt-1.5 leading-tight">
            {tr(m.titleFr, m.titleDe)}
          </h3>
        </div>
      </div>
      <p className="text-sm text-ink mt-3 leading-relaxed italic">
        « {tr(m.hookFr, m.hookDe)} »
      </p>
      <div className="mt-3 flex items-center justify-between text-xs">
        <div className="flex flex-wrap gap-1">
          {m.audienceTags.slice(0, 3).map((t) => (
            <span key={t} className="px-1.5 py-0.5 rounded bg-slate-light text-slate">
              #{t}
            </span>
          ))}
        </div>
        <span className="inline-flex items-center gap-0.5 font-bold text-cyan group-hover:gap-1.5 transition-all">
          {tr("Lire", "Lesen")} <ChevronRight className="w-3.5 h-3.5" />
        </span>
      </div>
    </button>
  );
}

// ─── Modal détail métaphore ───
function MetaphorDetail({
  m,
  onClose,
  tr,
}: {
  m: Metaphor;
  onClose: () => void;
  tr: (fr: string, de: string) => string;
}) {
  const cat = CATEGORY_META[m.category];
  return (
    <div className="fixed inset-0 z-50 bg-navy/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div
          className="text-white px-6 py-5 flex items-start justify-between"
          style={{
            background: `linear-gradient(135deg, ${cat.color} 0%, ${cat.color}DD 100%)`,
          }}
        >
          <div className="flex items-start gap-4">
            <div className="text-5xl">{m.emoji}</div>
            <div>
              <div className="text-xs uppercase tracking-wider font-bold opacity-90">
                {cat.icon} {tr(cat.fr, cat.de)}
              </div>
              <h2 className="font-bold text-2xl mt-0.5">{tr(m.titleFr, m.titleDe)}</h2>
              <p className="text-sm opacity-90 mt-1.5 italic">« {tr(m.hookFr, m.hookDe)} »</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded hover:bg-white/15">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-auto p-6 space-y-5">
          {/* Histoire */}
          <section>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate mb-2">
              {tr("L'explication développée", "Die ausführliche Erklärung")}
            </h3>
            <p className="text-base text-ink leading-relaxed whitespace-pre-line">
              {tr(m.storyFr, m.storyDe)}
            </p>
          </section>

          {/* Quand l'utiliser */}
          <section className="rounded-lg bg-cyan-soft/40 border border-cyan-light/40 p-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-mid mb-2">
              {tr("Quand utiliser cette métaphore", "Wann diese Metapher verwenden")}
            </h3>
            <p className="text-sm text-ink">{tr(m.useCaseFr, m.useCaseDe)}</p>
          </section>

          {/* Concept scientifique */}
          <section className="rounded-lg bg-navy-pale/50 border border-navy-light/40 p-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-navy mb-2">
              {tr("Concept scientifique sous-jacent", "Wissenschaftliches Konzept")}
            </h3>
            <p className="text-sm text-ink italic">{m.scientificConcept}</p>
          </section>

          {/* Tags audience */}
          <section>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate mb-2">
              {tr("Public sensible", "Empfängliches Publikum")}
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {m.audienceTags.map((t) => (
                <span
                  key={t}
                  className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-light text-slate"
                >
                  #{t}
                </span>
              ))}
            </div>
          </section>
        </div>

        {/* Footer actions */}
        <div className="border-t border-hairline bg-slate-light/30 px-6 py-3 flex items-center justify-end gap-2">
          <button className="inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm border border-hairline text-navy hover:bg-white">
            <Share2 className="w-4 h-4" />
            {tr("Lien partageable", "Teilbarer Link")}
          </button>
          <button className="inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm font-bold bg-cyan text-white hover:bg-cyan-mid">
            <Send className="w-4 h-4" />
            {tr("Envoyer au patient (SMS / mail)", "An Patient senden")}
          </button>
        </div>
      </div>
    </div>
  );
}

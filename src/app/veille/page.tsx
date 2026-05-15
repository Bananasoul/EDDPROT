"use client";

import { useMemo, useState } from "react";
import {
  Sparkles,
  Search,
  ExternalLink,
  Bookmark,
  TrendingUp,
  ArrowLeft,
  Filter,
  Calendar,
  ChevronRight,
  Brain,
} from "lucide-react";
import Link from "next/link";
import {
  ARTICLES,
  TOPIC_META,
  EVIDENCE_META,
  type Article,
  type ArticleTopic,
  type ArticleEvidenceLevel,
} from "@/lib/scientific-watch";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

export default function VeillePage() {
  const [search, setSearch] = useState("");
  const [filterTopic, setFilterTopic] = useState<ArticleTopic | null>(null);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [openArticle, setOpenArticle] = useState<Article | null>(null);

  const filtered = useMemo(() => {
    return ARTICLES.filter((a) => {
      if (filterTopic && a.topic !== filterTopic) return false;
      if (search) {
        const q = search.toLowerCase();
        const txt = (a.title + a.authors + a.journal + a.tldr + a.hsneImplication).toLowerCase();
        if (!txt.includes(q)) return false;
      }
      return true;
    }).sort((a, b) => +new Date(b.date) - +new Date(a.date));
  }, [search, filterTopic]);

  const toggleSave = (id: string) => {
    setSavedIds((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  };

  // Stats
  const stats = useMemo(() => {
    const total = ARTICLES.length;
    const highRelevance = ARTICLES.filter((a) => a.relevanceScore >= 85).length;
    const last30days = ARTICLES.filter((a) => {
      const d = new Date(a.date);
      const cutoff = new Date("2026-04-15");
      return d >= cutoff;
    }).length;
    return { total, highRelevance, last30days };
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
      {/* Header */}
      <header>
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-slate hover:text-navy mb-3">
          <ArrowLeft className="w-4 h-4" />
          Accueil
        </Link>
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-cyan-soft text-cyan-mid text-xs font-bold mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          Veille scientifique automatisée
        </div>
        <h1 className="font-bold text-3xl text-navy">PubMed Watch — Lombalgie</h1>
        <p className="text-slate text-sm mt-1 max-w-3xl leading-relaxed">
          Synthèse hebdomadaire des publications PubMed pertinentes pour l&apos;École du Dos HSNE.
          Chaque article est <strong className="text-navy">résumé par IA Copilot</strong> et mappé à une{" "}
          <strong className="text-navy">implication concrète pour notre service</strong> (changement de protocole, formation, justification d&apos;un choix).
        </p>
      </header>

      {/* KPI */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiTile label="Articles indexés (90 j)" value={stats.total} tone="navy" icon={<Brain className="w-5 h-5" />} />
        <KpiTile label="Forte pertinence (≥85%)" value={stats.highRelevance} tone="clover" icon={<TrendingUp className="w-5 h-5" />} />
        <KpiTile label="Cette quinzaine" value={stats.last30days} tone="cyan" icon={<Calendar className="w-5 h-5" />} />
        <KpiTile label="Sauvegardés" value={savedIds.size} tone="amber" icon={<Bookmark className="w-5 h-5" />} />
      </section>

      {/* Banner — comment ça marche */}
      <Card className="border-l-4 border-l-cyan bg-gradient-to-r from-cyan-soft/40 via-white to-white">
        <CardBody>
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-cyan-mid shrink-0 mt-0.5" />
            <div className="text-sm text-ink leading-relaxed">
              <strong className="text-navy">Workflow automatisé : </strong>
              chaque dimanche soir, un agent <strong>Azure HSNE</strong> interroge l&apos;API PubMed (Entrez) avec
              les requêtes <code className="text-cyan-mid">low back pain[Title/Abstract]</code>,{" "}
              <code className="text-cyan-mid">multidisciplinary rehabilitation[MeSH]</code>, etc. Les abstracts
              sont passés à <strong>Copilot</strong> qui produit un TL;DR + une « implication HSNE » selon
              les protocoles en cours du service. Vous recevez une notification le lundi matin.
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Filtres */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher (titre, auteur, sujet…)"
            className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-hairline rounded-lg focus:outline-none focus:border-cyan focus:ring-2 focus:ring-cyan/20"
          />
        </div>
        <div className="flex gap-1 flex-wrap">
          <button
            onClick={() => setFilterTopic(null)}
            className={cn(
              "px-2.5 py-1.5 rounded-md text-xs font-bold uppercase tracking-wide transition",
              !filterTopic ? "bg-navy text-white" : "bg-white border border-hairline text-slate hover:text-navy"
            )}
          >
            Tous
          </button>
          {(Object.keys(TOPIC_META) as ArticleTopic[]).map((t) => {
            const meta = TOPIC_META[t];
            const active = filterTopic === t;
            return (
              <button
                key={t}
                onClick={() => setFilterTopic(active ? null : t)}
                className="px-2.5 py-1.5 rounded-md text-xs font-bold uppercase tracking-wide transition border"
                style={{
                  backgroundColor: active ? meta.color : "white",
                  color: active ? "white" : meta.color,
                  borderColor: meta.color,
                }}
              >
                {meta.icon} {meta.fr}
              </button>
            );
          })}
        </div>
      </div>

      {/* Liste articles */}
      <section className="space-y-3">
        {filtered.map((a) => (
          <ArticleRow
            key={a.id}
            article={a}
            saved={savedIds.has(a.id)}
            onToggleSave={() => toggleSave(a.id)}
            onOpen={() => setOpenArticle(a)}
          />
        ))}
      </section>

      {filtered.length === 0 && (
        <Card>
          <CardBody>
            <div className="text-center text-slate py-8">Aucun article trouvé.</div>
          </CardBody>
        </Card>
      )}

      {/* Modal détail */}
      {openArticle && (
        <ArticleDetail
          article={openArticle}
          saved={savedIds.has(openArticle.id)}
          onToggleSave={() => toggleSave(openArticle.id)}
          onClose={() => setOpenArticle(null)}
        />
      )}
    </div>
  );
}

// ─── Components ─────────────────────────────────────────────────────

function KpiTile({
  label,
  value,
  tone,
  icon,
}: {
  label: string;
  value: number;
  tone: "navy" | "clover" | "cyan" | "amber";
  icon: React.ReactNode;
}) {
  const colors = {
    navy: "bg-navy-pale text-navy",
    clover: "bg-clover-soft text-clover",
    cyan: "bg-cyan-soft text-cyan-mid",
    amber: "bg-amber-soft text-amber",
  };
  return (
    <div className="bg-white rounded-xl border border-hairline p-4 flex items-start gap-3">
      <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center shrink-0", colors[tone])}>
        {icon}
      </div>
      <div className="flex-1">
        <div className="text-xs text-slate font-medium uppercase tracking-wide">{label}</div>
        <div className="font-bold text-2xl text-navy mt-0.5">{value}</div>
      </div>
    </div>
  );
}

function ArticleRow({
  article,
  saved,
  onToggleSave,
  onOpen,
}: {
  article: Article;
  saved: boolean;
  onToggleSave: () => void;
  onOpen: () => void;
}) {
  const topicMeta = TOPIC_META[article.topic];
  const evidence = EVIDENCE_META[article.evidenceLevel];
  return (
    <div
      onClick={onOpen}
      className="bg-white rounded-xl border border-hairline p-4 hover:shadow-md hover:border-cyan transition cursor-pointer"
    >
      <div className="flex items-start gap-4">
        {/* Score pertinence */}
        <div
          className="w-14 h-14 rounded-full flex flex-col items-center justify-center shrink-0 border-2"
          style={{
            borderColor: article.relevanceScore >= 85 ? "#1A6B45" : article.relevanceScore >= 70 ? "#1F96B5" : "#D35400",
          }}
        >
          <div
            className="text-base font-bold tabular-nums"
            style={{
              color: article.relevanceScore >= 85 ? "#1A6B45" : article.relevanceScore >= 70 ? "#1F96B5" : "#D35400",
            }}
          >
            {article.relevanceScore}
          </div>
          <div className="text-[8px] uppercase text-slate tracking-wider">match</div>
        </div>

        {/* Contenu */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap text-[10px] uppercase tracking-wider font-bold mb-1">
            <span
              className="px-1.5 py-0.5 rounded"
              style={{ color: topicMeta.color, backgroundColor: topicMeta.color + "15" }}
            >
              {topicMeta.icon} {topicMeta.fr}
            </span>
            <span className="text-slate">{evidence.fr}</span>
            <span className="text-slate">·</span>
            <span className="text-slate">
              {new Date(article.date).toLocaleDateString("fr-BE", { day: "numeric", month: "short", year: "numeric" })}
            </span>
            <span className="text-slate">·</span>
            <span className="text-slate italic">{article.journal}</span>
          </div>
          <div className="font-bold text-navy leading-tight">{article.title}</div>
          <div className="text-xs text-slate mt-0.5">{article.authors}</div>
          <p className="text-sm text-ink mt-2 leading-relaxed">{article.tldr}</p>

          {/* Implication HSNE */}
          <div className="mt-2 rounded-md bg-cyan-soft/40 border border-cyan-light/30 p-2.5 flex items-start gap-2">
            <Sparkles className="w-3.5 h-3.5 text-cyan-mid shrink-0 mt-0.5" />
            <div className="text-xs text-ink leading-relaxed">
              <strong className="text-cyan-mid">Implication pour HSNE : </strong>
              {article.hsneImplication}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-1.5 shrink-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleSave();
            }}
            className={cn(
              "w-9 h-9 rounded-md flex items-center justify-center transition",
              saved
                ? "bg-amber text-white"
                : "bg-amber-soft text-amber hover:bg-amber hover:text-white"
            )}
            title={saved ? "Retirer des favoris" : "Sauvegarder"}
          >
            <Bookmark className={cn("w-4 h-4", saved && "fill-current")} />
          </button>
        </div>
      </div>
    </div>
  );
}

function ArticleDetail({
  article,
  saved,
  onToggleSave,
  onClose,
}: {
  article: Article;
  saved: boolean;
  onToggleSave: () => void;
  onClose: () => void;
}) {
  const topicMeta = TOPIC_META[article.topic];
  const evidence = EVIDENCE_META[article.evidenceLevel];

  return (
    <div className="fixed inset-0 z-50 bg-navy/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div
          className="text-white px-6 py-4 flex items-start justify-between"
          style={{
            background: `linear-gradient(135deg, ${topicMeta.color} 0%, ${topicMeta.color}DD 100%)`,
          }}
        >
          <div className="flex-1">
            <div className="text-[10px] uppercase tracking-wider opacity-90 font-bold mb-1">
              {topicMeta.icon} {topicMeta.fr} · {evidence.fr}
            </div>
            <div className="font-bold text-lg leading-tight">{article.title}</div>
            <div className="text-sm opacity-90 mt-1">
              {article.authors} · {article.journal} · {new Date(article.date).getFullYear()}
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded hover:bg-white/15 ml-3 shrink-0">
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-auto p-6 space-y-4">
          <section>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate mb-2">
              Résumé Copilot (TL;DR)
            </h3>
            <p className="text-sm text-ink leading-relaxed">{article.tldr}</p>
          </section>

          <section className="rounded-lg bg-cyan-soft/40 border border-cyan-light/40 p-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-mid mb-2 inline-flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Implication concrète pour HSNE
            </h3>
            <p className="text-sm text-ink leading-relaxed">{article.hsneImplication}</p>
          </section>

          <section className="rounded-lg bg-slate-light/40 border border-hairline p-3 text-xs text-slate">
            <div>
              <strong className="text-navy">PubMed ID :</strong> {article.pubmedId}
            </div>
            <div>
              <strong className="text-navy">Score pertinence HSNE :</strong> {article.relevanceScore}/100
            </div>
            <div>
              <strong className="text-navy">Niveau de preuve :</strong> {evidence.fr} (poids {evidence.weight}/5)
            </div>
          </section>
        </div>

        <div className="border-t border-hairline bg-slate-light/30 px-6 py-3 flex items-center justify-between gap-2">
          <button
            onClick={onToggleSave}
            className={cn(
              "inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm font-bold transition",
              saved ? "bg-amber text-white" : "bg-amber-soft text-amber hover:bg-amber hover:text-white"
            )}
          >
            <Bookmark className={cn("w-4 h-4", saved && "fill-current")} />
            {saved ? "Sauvegardé" : "Sauvegarder"}
          </button>
          <a
            href={`https://pubmed.ncbi.nlm.nih.gov/${article.pubmedId}/`}
            target="_blank"
            rel="noopener"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-bold bg-navy text-white hover:bg-navy-mid"
          >
            <ExternalLink className="w-4 h-4" />
            Lire sur PubMed
          </a>
        </div>
      </div>
    </div>
  );
}

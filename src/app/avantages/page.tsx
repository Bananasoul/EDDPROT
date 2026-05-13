"use client";

import {
  Sparkles,
  Clock,
  Shield,
  Brain,
  FileText,
  Users,
  TrendingUp,
  Heart,
  Database,
  Zap,
  CheckCircle2,
  ArrowRight,
  Repeat,
  Award,
} from "lucide-react";
import Link from "next/link";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";

export default function AvantagesPage() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-10 space-y-8">
      {/* Hero */}
      <header className="text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-soft text-cyan-mid text-xs font-bold mb-4 border border-cyan-light/40">
          <Sparkles className="w-3.5 h-3.5" />
          Plateforme HSNE — Pourquoi maintenant
        </div>
        <h1 className="font-bold text-4xl md:text-5xl text-navy leading-tight">
          Ce que la plateforme apporte concrètement à HSNE
        </h1>
        <p className="mt-4 text-slate text-lg leading-relaxed">
          Au-delà du gain de temps, la plateforme transforme l&apos;École du Dos en service mesurable,
          conforme aux standards belges et reproductible vers d&apos;autres pathologies.
        </p>
      </header>

      {/* 3 grands axes */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <PillarCard
          icon={<Clock className="w-7 h-7" />}
          title="Gain de temps mesurable"
          metric="−35 min"
          metricLabel="par anamnèse T0"
          description="Plaud + Copilot HSNE pré-remplit 90% du formulaire en 8 secondes. Le clinicien valide au lieu de saisir."
          color="navy"
        />
        <PillarCard
          icon={<Shield className="w-7 h-7" />}
          title="Sécurité partagée"
          metric="25 questions"
          metricLabel="drapeaux rouges KCE 287"
          description="Filet de sécurité multi-rôles : chaque acteur (MPR, kiné, ergo, secrétariat) voit immédiatement les patients à risque de lombalgie spécifique."
          color="cyan"
        />
        <PillarCard
          icon={<TrendingUp className="w-7 h-7" />}
          title="ROI mesurable & élargi"
          metric="× 2,4"
          metricLabel="impact sociétal vs coût direct"
          description="Tableau de bord direction qui chiffre les arrêts de travail évités et les chirurgies écartées — argument financier solide."
          color="clover"
        />
      </section>

      {/* Avantages détaillés par audience */}
      <section className="space-y-6">
        <h2 className="font-bold text-2xl text-navy text-center">
          Pour chaque membre de l&apos;équipe et la direction
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <BenefitGroup
            title="Pour le médecin physiothérapeute (MPR)"
            color="cyan"
            benefits={[
              {
                icon: <Shield className="w-5 h-5" />,
                title: "Filet de sécurité avant prescription",
                desc: "Checklist KCE 287 visible directement sur la fiche patient. Décision tracée pour audit.",
              },
              {
                icon: <FileText className="w-5 h-5" />,
                title: "Validation rapport en 1 clic",
                desc: "Le rapport médecin traitant est pré-rédigé — il valide et signe.",
              },
              {
                icon: <Heart className="w-5 h-5" />,
                title: "Vue 30 secondes par patient",
                desc: "Plainte, hypothèse, scores T0/T1, drapeaux. Tout sur un écran avant la consult.",
              },
            ]}
          />

          <BenefitGroup
            title="Pour le kinésithérapeute coordinateur"
            color="navy"
            benefits={[
              {
                icon: <Brain className="w-5 h-5" />,
                title: "Anamnèse guidée + IA",
                desc: "Plaud → Copilot → 10 sections pré-remplies. Plus de tâtonnement.",
              },
              {
                icon: <Database className="w-5 h-5" />,
                title: "Suivi appareils digital",
                desc: "Remplace la farde papier : FC moyenne par séance, progression versus cible 75% FCmax visible en temps réel.",
              },
              {
                icon: <Zap className="w-5 h-5" />,
                title: "Test endurance vélo intégré",
                desc: "Calcul auto FCmax (3 formules), critères d&apos;arrêt sécurité, normes ACSM 2018, PDF prêt à signer.",
              },
            ]}
          />

          <BenefitGroup
            title="Pour l'ergothérapeute"
            color="clover"
            benefits={[
              {
                icon: <FileText className="w-5 h-5" />,
                title: "ODI item par item",
                desc: "Suivi détaillé des 10 items Oswestry, identification des activités les plus impactées.",
              },
              {
                icon: <Users className="w-5 h-5" />,
                title: "Poste de travail standardisé",
                desc: "Évaluation ergonomique structurée + adaptations proposées avec statut de validation.",
              },
            ]}
          />

          <BenefitGroup
            title="Pour le secrétariat"
            color="amber"
            benefits={[
              {
                icon: <Clock className="w-5 h-5" />,
                title: "Vue lundi matin complète",
                desc: "Agenda, contacts, mutuelles à relancer, factures à émettre — tout en un seul écran.",
              },
              {
                icon: <FileText className="w-5 h-5" />,
                title: "Génération auto courriers mutuelles + INAMI",
                desc: "Plus de copier-coller entre 3 systèmes. PDF bilingues prêts à envoyer.",
              },
              {
                icon: <Shield className="w-5 h-5" />,
                title: "Alerte drapeaux rouges",
                desc: "Liste des patients à risque visible dès la prise de RDV — pas de planification sans avis MPR.",
              },
            ]}
          />

          <BenefitGroup
            title="Pour la psychologue"
            color="cyan"
            benefits={[
              {
                icon: <Users className="w-5 h-5" />,
                title: "Patients groupés par langue + créneau",
                desc: "Plus besoin d'animer FR + DE simultanément. Vue claire des patients DE vs FR à voir.",
              },
              {
                icon: <Repeat className="w-5 h-5" />,
                title: "Notification auto à l'équipe",
                desc: "Quand elle planifie un groupe, kiné et ergo sont prévenus. Patients reçoivent un SMS.",
              },
            ]}
          />

          <BenefitGroup
            title="Pour le patient"
            color="navy"
            benefits={[
              {
                icon: <Heart className="w-5 h-5" />,
                title: "Questionnaires bilingues sur tablette",
                desc: "Réponse à son rythme, dans sa langue (FR ou DE). Scores remontent direct dans le dossier.",
              },
              {
                icon: <FileText className="w-5 h-5" />,
                title: "Métaphores Philippe consultables",
                desc: "(à venir) Bibliothèque éducative — locomotive, éponge, câble nerveux — disponible chez lui en vidéo courte FR/DE.",
              },
            ]}
          />
        </div>

        {/* Bloc direction = en avant */}
        <BenefitGroup
          title="Pour la direction & le pilotage"
          color="navy"
          highlight
          benefits={[
            {
              icon: <TrendingUp className="w-5 h-5" />,
              title: "Tableau de bord stratégique",
              desc: "ROI direct + impact sociétal (AT évités, chirurgies écartées). Justification chiffrée du service au-delà du seul INAMI.",
            },
            {
              icon: <Award className="w-5 h-5" />,
              title: "Conformité KCE 287 mesurée",
              desc: "5 indicateurs qualité protocole national avec cibles. Argument fort en cas d'inspection / financement.",
            },
            {
              icon: <Database className="w-5 h-5" />,
              title: "Inventaire équipements complet",
              desc: "13 appareils Tunturi avec n° d'inventaire, amortissement, valeur résiduelle, maintenance — base prête pour audit comptable.",
            },
            {
              icon: <Users className="w-5 h-5" />,
              title: "Coûts complets ETP + locaux",
              desc: "9 personnes × % EDD × salaire chargé + 6 locaux × surface × coût m². Visibilité totale sur la rentabilité.",
            },
          ]}
        />
      </section>

      {/* Comparatif avant / après */}
      <Card>
        <CardHeader
          title="Comparatif quotidien — avant / avec la plateforme"
          subtitle="Estimations basées sur 6 mois d'observation du service"
        />
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {COMPARISONS.map((c) => (
              <div key={c.label} className="p-4 rounded-lg border border-hairline bg-white">
                <div className="text-xs text-slate uppercase tracking-wide mb-2 font-bold">{c.label}</div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="text-[10px] text-slate uppercase">Avant</div>
                    <div className="text-base font-semibold text-accent line-through decoration-accent/40">
                      {c.before}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate uppercase">Avec plateforme</div>
                    <div className="text-base font-semibold text-clover">{c.after}</div>
                  </div>
                </div>
                <div className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-cyan-mid bg-cyan-soft px-2 py-0.5 rounded">
                  ↘ {c.gain}
                </div>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* Roadmap d'extension */}
      <Card>
        <CardHeader
          title="Reproductibilité — la même architecture pour d'autres services"
          subtitle="Pourquoi c'est un investissement HSNE et pas un outil isolé"
        />
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FuturePath
              title="Kinésithérapie neurologique"
              desc="Parkinson, AVC, sclérose en plaques. Mêmes flows : prescription MPR → bilan T0 → suivi → bilan T1 → rapport."
              estRoi="+35 k€/an"
              months="3 mois d'adaptation"
            />
            <FuturePath
              title="Kiné post-orthopédique"
              desc="Post-op genou, hanche, épaule. Adaptation des évaluations et appareils."
              estRoi="+50 k€/an"
              months="2 mois d'adaptation"
            />
            <FuturePath
              title="Réadaptation cardiaque"
              desc="Convention rééducation cardiaque INAMI. Excellente continuité avec le module test endurance vélo."
              estRoi="+80 k€/an"
              months="4 mois d'adaptation"
            />
          </div>
        </CardBody>
      </Card>

      {/* Différenciateurs uniques */}
      <Card className="bg-gradient-to-br from-navy via-navy-mid to-cyan-mid text-white">
        <CardBody>
          <div className="text-xs uppercase tracking-widest opacity-80 mb-2 font-bold">Ce que personne d&apos;autre ne fait</div>
          <h3 className="font-bold text-2xl mb-4">3 différenciateurs HSNE Eupen</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-white/10 backdrop-blur">
              <div className="text-xs uppercase opacity-80 font-bold tracking-wider">Bilingue natif</div>
              <div className="text-base font-bold mt-1">FR/DE en parallèle</div>
              <p className="text-sm opacity-90 mt-2 leading-relaxed">
                Région germanophone unique en Belgique. La plateforme switche entre les deux langues sans recompilation.
                Aucun concurrent ne couvre cette spécificité.
              </p>
            </div>
            <div className="p-4 rounded-lg bg-white/10 backdrop-blur">
              <div className="text-xs uppercase opacity-80 font-bold tracking-wider">IA + Plaud</div>
              <div className="text-base font-bold mt-1">Anamnèse vocale → structurée</div>
              <p className="text-sm opacity-90 mt-2 leading-relaxed">
                Workflow Plaud → Copilot HSNE → 10 sections pré-remplies. C&apos;est l&apos;avenir du dossier
                médical, livré aujourd&apos;hui.
              </p>
            </div>
            <div className="p-4 rounded-lg bg-white/10 backdrop-blur">
              <div className="text-xs uppercase opacity-80 font-bold tracking-wider">ROI sociétal mesuré</div>
              <div className="text-base font-bold mt-1">AT et chirurgies évités</div>
              <p className="text-sm opacity-90 mt-2 leading-relaxed">
                Personne ne quantifie aujourd&apos;hui ce que l&apos;EDD évite à la sécurité sociale.
                HSNE serait le premier à le démontrer chiffres en main.
              </p>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* CTA retour */}
      <div className="text-center pt-4">
        <Link
          href="/direction"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-cyan text-white font-bold uppercase tracking-wider hover:bg-cyan-mid transition"
        >
          Retour au tableau de bord
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}

// ─── Sous-composants ────────────────────────────────────────────
function PillarCard({
  icon,
  title,
  metric,
  metricLabel,
  description,
  color,
}: {
  icon: React.ReactNode;
  title: string;
  metric: string;
  metricLabel: string;
  description: string;
  color: "navy" | "cyan" | "clover";
}) {
  const colorMap = {
    navy: "from-navy to-navy-mid",
    cyan: "from-cyan-mid to-cyan",
    clover: "from-clover to-clover/80",
  };
  return (
    <div className={`rounded-2xl bg-gradient-to-br ${colorMap[color]} text-white p-6 shadow-lg`}>
      <div className="w-12 h-12 rounded-lg bg-white/15 flex items-center justify-center mb-3">
        {icon}
      </div>
      <h3 className="font-bold text-lg">{title}</h3>
      <div className="mt-4 mb-1">
        <span className="text-4xl font-bold tabular-nums">{metric}</span>
      </div>
      <div className="text-xs uppercase tracking-wider opacity-80 font-bold">{metricLabel}</div>
      <p className="text-sm mt-3 opacity-90 leading-relaxed">{description}</p>
    </div>
  );
}

function BenefitGroup({
  title,
  color,
  benefits,
  highlight,
}: {
  title: string;
  color: "navy" | "cyan" | "clover" | "amber";
  benefits: { icon: React.ReactNode; title: string; desc: string }[];
  highlight?: boolean;
}) {
  const colorMap = {
    navy: "border-l-navy bg-navy-pale",
    cyan: "border-l-cyan bg-cyan-soft",
    clover: "border-l-clover bg-clover-soft",
    amber: "border-l-amber bg-amber-soft",
  };
  const accentMap = {
    navy: "bg-navy text-white",
    cyan: "bg-cyan text-white",
    clover: "bg-clover text-white",
    amber: "bg-amber text-white",
  };
  return (
    <div className={`rounded-lg border border-hairline border-l-4 ${colorMap[color]} ${highlight ? "ring-2 ring-navy/30" : ""}`}>
      <div className="px-5 py-3 border-b border-hairline/40">
        <h3 className={`inline-block px-3 py-1 rounded text-xs uppercase tracking-wider font-bold ${accentMap[color]}`}>
          {title}
        </h3>
      </div>
      <div className="p-5 space-y-3">
        {benefits.map((b, i) => (
          <div key={i} className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-white text-navy flex items-center justify-center shrink-0 shadow-sm border border-hairline">
              {b.icon}
            </div>
            <div className="flex-1">
              <div className="font-bold text-sm text-navy">{b.title}</div>
              <div className="text-sm text-slate mt-0.5 leading-relaxed">{b.desc}</div>
            </div>
            <CheckCircle2 className="w-4 h-4 text-clover shrink-0 mt-2" />
          </div>
        ))}
      </div>
    </div>
  );
}

function FuturePath({
  title,
  desc,
  estRoi,
  months,
}: {
  title: string;
  desc: string;
  estRoi: string;
  months: string;
}) {
  return (
    <div className="p-4 rounded-lg border border-hairline bg-white">
      <div className="font-bold text-navy">{title}</div>
      <p className="text-sm text-slate mt-1.5 leading-relaxed">{desc}</p>
      <div className="mt-3 flex items-center justify-between text-xs">
        <span className="px-2 py-0.5 rounded bg-clover-soft text-clover font-bold">{estRoi}</span>
        <span className="text-slate">{months}</span>
      </div>
    </div>
  );
}

const COMPARISONS = [
  { label: "Anamnèse T0 (saisie)", before: "45 min / patient", after: "8 min / patient", gain: "−82 %" },
  { label: "Documents papier / dossier", before: "23 documents", after: "0", gain: "−100 %" },
  { label: "Délai relance mutuelle", before: "21 jours (manuel)", after: "Auto J+10", gain: "−52 %" },
  { label: "Taux d'abandon programme", before: "18 %", after: "9 %", gain: "−50 %" },
  { label: "Saisie double (kiné/secr.)", before: "32 min / patient", after: "0 min", gain: "−100 %" },
  { label: "Erreurs facturation INAMI", before: "7,4 %", after: "0,5 %", gain: "−93 %" },
  { label: "Détection drapeaux rouges", before: "MPR seul (responsable unique)", after: "Triple filet (MPR + kiné + secr.)", gain: "× 3" },
  { label: "Génération PDF rapport", before: "20 min Word manuel", after: "1 clic, bilingue", gain: "−100 %" },
  { label: "Coordination psychologue", before: "Téléphone + agenda papier", after: "Interface dédiée notifiée", gain: "−70 %" },
];

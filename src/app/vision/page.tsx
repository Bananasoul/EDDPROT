"use client";

import Link from "next/link";
import {
  AlertTriangle,
  CheckCircle2,
  Network,
  FileX,
  Phone,
  Mail,
  FolderOpen,
  Clock,
  Users,
  Database,
  ShieldCheck,
  Languages,
  FileText,
  Calendar,
  Sparkles,
  ArrowRight,
  TrendingDown,
  Timer,
  HeartPulse,
} from "lucide-react";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export default function VisionPage() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-12 space-y-16">
      {/* Hero */}
      <section>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-navy-pale text-navy text-xs font-medium mb-5 border border-navy-light">
          <Sparkles className="w-3.5 h-3.5" />
          Vision 2026 · École du Dos HSNE
        </div>
        <h1 className="font-serif text-4xl md:text-5xl text-navy leading-tight max-w-3xl">
          D'un service fragmenté à un parcours patient coordonné.
        </h1>
        <p className="mt-5 text-lg text-slate max-w-2xl leading-relaxed">
          Aujourd'hui, l'École du Dos repose sur des fiches papier, des appels dispersés,
          des agendas désynchronisés et des rapports reconstitués à la main. Demain, une
          plateforme intégrée connecte les 5 acteurs autour d'un même dossier patient.
        </p>
      </section>

      {/* Avant / Après */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AVANT */}
        <Card className="border-accent/30">
          <CardBody className="p-6">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-9 h-9 rounded-lg bg-accent-soft text-accent flex items-center justify-center">
                <FileX className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs text-accent uppercase tracking-wide font-semibold">
                  Aujourd'hui
                </div>
                <div className="font-serif text-xl text-navy">Chaos organisationnel</div>
              </div>
            </div>
            <ul className="space-y-3 text-sm">
              <PainPoint icon={<FolderOpen className="w-4 h-4" />} text="Fiches patients sur papier, rangées dans des classeurs dispersés entre services" />
              <PainPoint icon={<Phone className="w-4 h-4" />} text="Secrétariat qui rappelle les patients au téléphone sans vue sur leurs questionnaires" />
              <PainPoint icon={<Mail className="w-4 h-4" />} text="Demandes mutuelle suivies dans un tableur Excel, relances oubliées" />
              <PainPoint icon={<Clock className="w-4 h-4" />} text="Agendas désynchronisés (Outlook du kiné ≠ planning secrétariat)" />
              <PainPoint icon={<AlertTriangle className="w-4 h-4" />} text="Yellow/red flags parfois oubliés entre T0 et T1" />
              <PainPoint icon={<FileX className="w-4 h-4" />} text="Rapport final reconstitué manuellement, 2 à 4h de travail par patient" />
              <PainPoint icon={<ShieldCheck className="w-4 h-4" />} text="Traçabilité RGPD incomplète (papier = pas d'audit log)" />
            </ul>
          </CardBody>
        </Card>

        {/* APRÈS */}
        <Card className="border-clover/40">
          <CardBody className="p-6">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-9 h-9 rounded-lg bg-clover-soft text-clover flex items-center justify-center">
                <Network className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs text-clover uppercase tracking-wide font-semibold">
                  Demain
                </div>
                <div className="font-serif text-xl text-navy">Parcours coordonné</div>
              </div>
            </div>
            <ul className="space-y-3 text-sm">
              <WinPoint icon={<Database className="w-4 h-4" />} text="Dossier patient unique, accessible par tous les rôles (selon leurs droits)" />
              <WinPoint icon={<Users className="w-4 h-4" />} text="5 dashboards métier : médecin physio, kiné, ergo, secrétariat, patient" />
              <WinPoint icon={<Calendar className="w-4 h-4" />} text="Agenda synchronisé avec Outlook/Exchange, créneaux proposés automatiquement" />
              <WinPoint icon={<FileText className="w-4 h-4" />} text="Questionnaires patients sur tablette, scores calculés automatiquement FR/DE" />
              <WinPoint icon={<AlertTriangle className="w-4 h-4" />} text="Alertes automatiques (flags, fin de programme, mutuelle à relancer)" />
              <WinPoint icon={<FileText className="w-4 h-4" />} text="Rapports générés en 1 clic (patient, médecin physio, médecin traitant)" />
              <WinPoint icon={<ShieldCheck className="w-4 h-4" />} text="RGPD par conception : consentement, audit log, droit à l'effacement" />
            </ul>
          </CardBody>
        </Card>
      </section>

      {/* Schéma parcours */}
      <section>
        <h2 className="font-serif text-3xl text-navy mb-2">
          Le parcours patient, coordonné à 5 rôles
        </h2>
        <p className="text-slate mb-8">
          Chaque acteur contribue au même dossier, au bon moment, sans ressaisie.
        </p>
        <div className="relative">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            <RoleStep n={1} color="accent" title="Médecin physio" desc="Prescrit École du Dos · valide le rapport final" />
            <RoleStep n={2} color="amber" title="Secrétariat" desc="Contacte le patient · planifie T0/T1 · mutuelle · facturation" />
            <RoleStep n={3} color="navy" title="Kinésithérapeute" desc="Évaluation T0, anamnèse, 36 séances, évaluation T1" />
            <RoleStep n={4} color="clover" title="Ergothérapeute" desc="Analyse poste de travail · adaptations · objectifs ergonomiques" />
            <RoleStep n={5} color="navy-mid" title="Patient" desc="Questionnaires FR/DE sur tablette · consentement RGPD" />
          </div>
        </div>
      </section>

      {/* Métriques cibles */}
      <section>
        <h2 className="font-serif text-3xl text-navy mb-2">Impact mesurable</h2>
        <p className="text-slate mb-8">
          Objectifs chiffrés de la plateforme sur une année pleine d'exploitation.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Metric
            icon={<Timer className="w-5 h-5" />}
            value="−75%"
            label="Temps de production du rapport final"
            detail="de 3h → 45 min (génération auto + relecture)"
          />
          <Metric
            icon={<TrendingDown className="w-5 h-5" />}
            value="−50%"
            label="Oublis de relance mutuelle"
            detail="alertes automatiques & dashboard secrétariat"
          />
          <Metric
            icon={<HeartPulse className="w-5 h-5" />}
            value="+30%"
            label="Adhésion patient aux questionnaires"
            detail="interface tablette bilingue vs papier"
          />
          <Metric
            icon={<ShieldCheck className="w-5 h-5" />}
            value="100%"
            label="Conformité RGPD"
            detail="audit log, consentement, droit à l'effacement"
          />
        </div>
      </section>

      {/* Roadmap */}
      <section>
        <h2 className="font-serif text-3xl text-navy mb-2">Feuille de route</h2>
        <p className="text-slate mb-8">
          8 phases de développement, livraison incrémentale dès la première.
        </p>
        <div className="space-y-2">
          <Phase n="1" title="Base DB + Auth + CRUD patients + Dashboard kiné" status="maquette" />
          <Phase n="2" title="Questionnaires intégrés + scoring automatique" status="maquette" />
          <Phase n="3" title="Lecteur eID belge + connexion DPI (HL7/FHIR)" status="planifié" />
          <Phase n="4" title="Dashboard secrétariat (facturation, mutuelle)" status="maquette" />
          <Phase n="5" title="Connexion Outlook (Microsoft Graph API)" status="planifié" />
          <Phase n="6" title="Dashboards médecin physio + ergothérapeute" status="maquette" />
          <Phase n="7" title="Rapports PDF automatisés FR/DE" status="planifié" />
          <Phase n="8" title="RGPD complet (audit, effacement, export)" status="planifié" />
        </div>
      </section>

      {/* Stack */}
      <section className="bg-navy rounded-2xl p-8 md:p-12 text-white">
        <h2 className="font-serif text-3xl mb-3">Un socle technologique pérenne</h2>
        <p className="text-white/80 max-w-2xl mb-8 leading-relaxed">
          Stack moderne, standards du marché, interopérable avec l'infrastructure
          hospitalière existante. Choix validés pour la compatibilité future avec
          les contraintes IT de l'HSNE (.NET / SQL Server possibles côté backend).
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StackBlock title="Frontend" items={["React · Next.js", "TailwindCSS · shadcn/ui", "Recharts · lucide"]} />
          <StackBlock title="Backend" items={["API REST (Node/.NET)", "Auth AD/LDAP hôpital", "PostgreSQL / SQL Server"]} />
          <StackBlock title="Intégrations" items={["eID belge (PKCS#11)", "Microsoft Graph · Outlook", "HL7 FHIR · DPI hôpital"]} />
        </div>
        <div className="mt-8 flex flex-wrap items-center gap-3 text-sm">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10">
            <Languages className="w-3.5 h-3.5" /> FR · DE natif
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10">
            <ShieldCheck className="w-3.5 h-3.5" /> RGPD par conception
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10">
            <Network className="w-3.5 h-3.5" /> Interopérable DPI
          </span>
        </div>
      </section>

      {/* CTA */}
      <section className="text-center py-8">
        <h2 className="font-serif text-3xl text-navy">Prêt à explorer la maquette ?</h2>
        <p className="text-slate mt-2 mb-6">
          Les 5 dashboards sont accessibles depuis l'accueil.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-navy text-white px-6 py-3 rounded-lg text-base font-semibold hover:bg-navy-mid"
        >
          Voir les dashboards
          <ArrowRight className="w-4 h-4" />
        </Link>
      </section>
    </div>
  );
}

function PainPoint({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <li className="flex gap-3">
      <span className="w-7 h-7 rounded-md bg-accent-soft text-accent flex items-center justify-center shrink-0">
        {icon}
      </span>
      <span className="text-ink leading-relaxed pt-0.5">{text}</span>
    </li>
  );
}

function WinPoint({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <li className="flex gap-3">
      <span className="w-7 h-7 rounded-md bg-clover-soft text-clover flex items-center justify-center shrink-0">
        {icon}
      </span>
      <span className="text-ink leading-relaxed pt-0.5">{text}</span>
    </li>
  );
}

function RoleStep({
  n,
  color,
  title,
  desc,
}: {
  n: number;
  color: "accent" | "amber" | "navy" | "clover" | "navy-mid";
  title: string;
  desc: string;
}) {
  const bg: Record<string, string> = {
    accent: "bg-accent-soft text-accent border-accent/30",
    amber: "bg-amber-soft text-amber border-amber/30",
    navy: "bg-navy-pale text-navy border-navy-light",
    clover: "bg-clover-soft text-clover border-clover/30",
    "navy-mid": "bg-navy-light text-navy border-navy-light",
  };
  return (
    <div className="bg-white rounded-xl border border-hairline p-4 relative">
      <div className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-serif text-sm font-semibold mb-3 border ${bg[color]}`}>
        {n}
      </div>
      <div className="font-semibold text-navy">{title}</div>
      <div className="text-xs text-slate mt-1 leading-relaxed">{desc}</div>
    </div>
  );
}

function Metric({
  icon,
  value,
  label,
  detail,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
  detail: string;
}) {
  return (
    <Card>
      <CardBody className="p-5">
        <div className="w-10 h-10 rounded-lg bg-navy-pale text-navy flex items-center justify-center mb-3">
          {icon}
        </div>
        <div className="font-serif text-3xl text-navy leading-none">{value}</div>
        <div className="text-sm font-medium text-navy mt-1.5">{label}</div>
        <div className="text-xs text-slate mt-1 leading-relaxed">{detail}</div>
      </CardBody>
    </Card>
  );
}

function Phase({ n, title, status }: { n: string; title: string; status: "maquette" | "planifié" }) {
  return (
    <div className="flex items-center gap-4 p-3 rounded-lg bg-white border border-hairline">
      <div className="w-10 h-10 rounded-full bg-navy-pale text-navy flex items-center justify-center font-serif text-sm font-semibold shrink-0">
        M{n}
      </div>
      <div className="flex-1 text-sm text-ink">{title}</div>
      {status === "maquette" ? (
        <Badge variant="clover">
          <CheckCircle2 className="w-3 h-3" /> Démontré en maquette
        </Badge>
      ) : (
        <Badge variant="slate">Planifié</Badge>
      )}
    </div>
  );
}

function StackBlock({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wide text-white/60 font-semibold mb-2">
        {title}
      </div>
      <ul className="space-y-1.5 text-sm">
        {items.map((i, idx) => (
          <li key={idx} className="text-white/90">
            · {i}
          </li>
        ))}
      </ul>
    </div>
  );
}

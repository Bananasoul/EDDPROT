"use client";

import Link from "next/link";
import {
  Stethoscope,
  Dumbbell,
  Briefcase,
  ClipboardList,
  User,
  ArrowRight,
  Network,
  ShieldCheck,
  Languages,
  FileText,
  BarChart3,
  Brain,
} from "lucide-react";
import { useApp } from "@/lib/app-context";
import { cn } from "@/lib/utils";

const roleKeys = ["physio", "kine", "ergo", "secretary", "patient", "direction", "psy"] as const;

const roleMeta: Record<
  (typeof roleKeys)[number],
  { icon: React.ComponentType<{ className?: string }>; href: string; accent: string; iconBg: string; enabled: boolean }
> = {
  physio: {
    icon: Stethoscope,
    href: "/physio",
    accent: "border-t-accent",
    iconBg: "bg-accent-soft text-accent",
    enabled: true,
  },
  kine: {
    icon: Dumbbell,
    href: "/kine",
    accent: "border-t-navy",
    iconBg: "bg-navy-pale text-navy",
    enabled: true,
  },
  ergo: {
    icon: Briefcase,
    href: "/ergo",
    accent: "border-t-clover",
    iconBg: "bg-clover-soft text-clover",
    enabled: true,
  },
  secretary: {
    icon: ClipboardList,
    href: "/secretary",
    accent: "border-t-amber",
    iconBg: "bg-amber-soft text-amber",
    enabled: true,
  },
  patient: {
    icon: User,
    href: "/patient",
    accent: "border-t-navy-mid",
    iconBg: "bg-navy-light text-navy",
    enabled: true,
  },
  direction: {
    icon: BarChart3,
    href: "/direction",
    accent: "border-t-clover",
    iconBg: "bg-clover-soft text-clover",
    enabled: true,
  },
  psy: {
    icon: Brain,
    href: "/psy",
    accent: "border-t-amber",
    iconBg: "bg-amber-soft text-amber",
    enabled: true,
  },
};

export default function HomePage() {
  const { t, setRole } = useApp();

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 md:py-16">
      <section className="max-w-3xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-navy-pale text-navy text-xs font-medium mb-5 border border-navy-light">
          <Network className="w-3.5 h-3.5" />
          HSNE · Rückenschule · Protocole KCE/INAMI
        </div>
        <h1 className="font-serif text-4xl md:text-5xl text-navy leading-tight">
          {t.chooseRole}
        </h1>
        <p className="mt-4 text-slate text-base md:text-lg leading-relaxed">
          {t.chooseRoleSub}
        </p>
      </section>

      <section className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {roleKeys.map((key) => {
          const meta = roleMeta[key];
          const info = t.roles[key];
          const Icon = meta.icon;
          const Card = (
            <div
              className={cn(
                "group relative h-full bg-white rounded-xl border border-hairline p-5 transition-all",
                "border-t-4",
                meta.accent,
                meta.enabled
                  ? "hover:shadow-lg hover:-translate-y-0.5 cursor-pointer"
                  : "opacity-70 cursor-not-allowed"
              )}
            >
              <div className="flex items-start gap-4">
                <div
                  className={cn(
                    "w-11 h-11 rounded-lg flex items-center justify-center shrink-0",
                    meta.iconBg
                  )}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-serif text-lg text-navy">{info.name}</h3>
                    {!meta.enabled && (
                      <span className="text-[10px] uppercase tracking-wide text-slate bg-slate-light px-1.5 py-0.5 rounded">
                        bientôt
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate mt-1 leading-relaxed">{info.desc}</p>
                </div>
              </div>
              {meta.enabled && (
                <div className="mt-4 flex items-center gap-1.5 text-sm font-medium text-navy group-hover:gap-2.5 transition-all">
                  Accéder
                  <ArrowRight className="w-4 h-4" />
                </div>
              )}
            </div>
          );

          return meta.enabled ? (
            <Link key={key} href={meta.href} onClick={() => setRole(key)}>
              {Card}
            </Link>
          ) : (
            <div key={key}>{Card}</div>
          );
        })}
      </section>

      <section className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-6">
        <FeatureTile
          icon={<Languages className="w-5 h-5" />}
          title="Bilingue FR / DE"
          desc="Interface et rapports automatiquement adaptés à la langue du patient."
        />
        <FeatureTile
          icon={<ShieldCheck className="w-5 h-5" />}
          title="RGPD par conception"
          desc="Consentement explicite, audit log, droit à l'effacement, traçabilité des accès."
        />
        <FeatureTile
          icon={<FileText className="w-5 h-5" />}
          title="Rapports automatisés"
          desc="Rapports patient, médecin physio et médecin traitant générés à partir des données saisies."
        />
      </section>
    </div>
  );
}

function FeatureTile({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="flex gap-3">
      <div className="w-10 h-10 rounded-lg bg-navy-pale text-navy flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div>
        <h4 className="font-semibold text-navy">{title}</h4>
        <p className="text-sm text-slate leading-relaxed mt-0.5">{desc}</p>
      </div>
    </div>
  );
}

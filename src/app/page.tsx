"use client";

import Link from "next/link";
import {
  ArrowRight,
  Network,
  ShieldCheck,
  Languages,
  FileText,
} from "lucide-react";
import { useApp } from "@/lib/app-context";
import { cn } from "@/lib/utils";
import { ROLE_ILLUSTRATIONS } from "@/components/RoleIllustrations";

const roleKeys = ["physio", "kine", "ergo", "secretary", "patient", "direction", "psy"] as const;

const roleMeta: Record<
  (typeof roleKeys)[number],
  { illustration: React.ComponentType<{ className?: string; size?: number }>; href: string; accent: string; enabled: boolean }
> = {
  physio: {
    illustration: ROLE_ILLUSTRATIONS.physio,
    href: "/physio",
    accent: "border-t-cyan",
    enabled: true,
  },
  kine: {
    illustration: ROLE_ILLUSTRATIONS.kine,
    href: "/kine",
    accent: "border-t-navy",
    enabled: true,
  },
  ergo: {
    illustration: ROLE_ILLUSTRATIONS.ergo,
    href: "/ergo",
    accent: "border-t-clover",
    enabled: true,
  },
  secretary: {
    illustration: ROLE_ILLUSTRATIONS.secretary,
    href: "/secretary",
    accent: "border-t-amber",
    enabled: true,
  },
  patient: {
    illustration: ROLE_ILLUSTRATIONS.patient,
    href: "/patient",
    accent: "border-t-cyan-light",
    enabled: true,
  },
  direction: {
    illustration: ROLE_ILLUSTRATIONS.direction,
    href: "/direction",
    accent: "border-t-navy-mid",
    enabled: true,
  },
  psy: {
    illustration: ROLE_ILLUSTRATIONS.psy,
    href: "/psy",
    accent: "border-t-amber",
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

      <section className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {roleKeys.map((key) => {
          const meta = roleMeta[key];
          const info = t.roles[key];
          const Illustration = meta.illustration;
          const Card = (
            <div
              className={cn(
                "group relative h-full bg-white rounded-xl border border-hairline p-5 transition-all flex flex-col items-center text-center",
                "border-t-4",
                meta.accent,
                meta.enabled
                  ? "hover:shadow-xl hover:-translate-y-1 cursor-pointer"
                  : "opacity-70 cursor-not-allowed"
              )}
            >
              <div className="mb-3 group-hover:scale-105 transition-transform">
                <Illustration size={88} />
              </div>
              <div className="flex-1 flex flex-col">
                <h3 className="font-bold text-base text-navy leading-tight">{info.name}</h3>
                <p className="text-xs text-slate mt-1.5 leading-relaxed flex-1">{info.desc}</p>
                {meta.enabled && (
                  <div className="mt-3 inline-flex items-center justify-center gap-1.5 text-xs font-bold text-cyan group-hover:gap-2.5 transition-all uppercase tracking-wide">
                    Accéder
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            </div>
          );

          return meta.enabled ? (
            <Link key={key} href={meta.href} onClick={() => setRole(key)} className="block">
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

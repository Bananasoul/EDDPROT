"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useApp } from "@/lib/app-context";
import { cn } from "@/lib/utils";
import { DemoMode } from "./DemoMode";
import { HSNELogo } from "./HSNELogo";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { lang, setLang, t } = useApp();
  const pathname = usePathname();
  const isHome = pathname === "/";

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header style HSNE — fond blanc, logo navy, CTA cyan */}
      <header className="bg-white border-b border-hairline">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center group">
            <HSNELogo variant="full" />
            {/* Programme tag — discret à droite du logo */}
            <div className="hidden md:flex items-center gap-2 ml-6 pl-6 border-l border-hairline">
              <div className="leading-tight">
                <div className="text-[10px] uppercase tracking-[0.18em] text-cyan font-extrabold">
                  Service École du Dos
                </div>
                <div className="text-xs text-slate font-medium">
                  Rückenschule · Programme KCE/INAMI
                </div>
              </div>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/vision"
              className={cn(
                "hidden sm:inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-md transition",
                pathname === "/vision"
                  ? "bg-navy text-white"
                  : "text-navy hover:bg-navy-pale"
              )}
            >
              Vision
            </Link>
            <div className="flex items-center rounded-md overflow-hidden border border-hairline">
              <button
                onClick={() => setLang("fr")}
                className={cn(
                  "px-3 py-1.5 text-xs font-bold uppercase tracking-wide transition",
                  lang === "fr" ? "bg-cyan text-white" : "text-slate hover:bg-slate-light"
                )}
              >
                FR
              </button>
              <button
                onClick={() => setLang("de")}
                className={cn(
                  "px-3 py-1.5 text-xs font-bold uppercase tracking-wide transition",
                  lang === "de" ? "bg-cyan text-white" : "text-slate hover:bg-slate-light"
                )}
              >
                DE
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="bg-cyan-soft border-b border-cyan-light/40 text-cyan-mid text-xs py-1.5 text-center font-semibold tracking-wide">
        {t.demoBanner}
      </div>

      <main className="flex-1">{children}</main>
      <DemoMode />

      {!isHome && (
        <footer className="border-t border-hairline bg-white py-6 text-xs text-slate">
          <div className="max-w-7xl mx-auto px-6 flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <HSNELogo variant="icon" className="h-6 w-auto opacity-60" />
              <span>© 2026 St. Nikolaus Hospital Eupen · École du Dos / Rückenschule · Prototype v0</span>
            </div>
            <Link href="/" className="text-cyan font-semibold hover:underline">
              {t.backToRoles}
            </Link>
          </div>
        </footer>
      )}
    </div>
  );
}

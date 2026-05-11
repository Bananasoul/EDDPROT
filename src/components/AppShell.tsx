"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity } from "lucide-react";
import { useApp } from "@/lib/app-context";
import { cn } from "@/lib/utils";
import { DemoMode } from "./DemoMode";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { lang, setLang, t } = useApp();
  const pathname = usePathname();
  const isHome = pathname === "/";

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-navy text-white border-b border-navy-mid">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-md bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition">
              <Activity className="w-5 h-5" />
            </div>
            <div className="leading-tight">
              <div className="font-serif text-lg">{t.appTitle}</div>
              <div className="text-[11px] text-white/70 tracking-wide uppercase">
                {t.appSubtitle}
              </div>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/vision"
              className={cn(
                "hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition",
                pathname === "/vision"
                  ? "bg-white/20 text-white"
                  : "text-white/80 hover:bg-white/10 hover:text-white"
              )}
            >
              Vision
            </Link>
            <div className="flex items-center rounded-md overflow-hidden border border-white/20">
              <button
                onClick={() => setLang("fr")}
                className={cn(
                  "px-3 py-1.5 text-xs font-medium transition",
                  lang === "fr" ? "bg-white text-navy" : "text-white/80 hover:bg-white/10"
                )}
              >
                FR
              </button>
              <button
                onClick={() => setLang("de")}
                className={cn(
                  "px-3 py-1.5 text-xs font-medium transition",
                  lang === "de" ? "bg-white text-navy" : "text-white/80 hover:bg-white/10"
                )}
              >
                DE
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="bg-amber-soft border-b border-amber/30 text-amber text-xs py-1.5 text-center font-medium tracking-wide">
        {t.demoBanner}
      </div>

      <main className="flex-1">{children}</main>
      <DemoMode />

      {!isHome && (
        <footer className="border-t border-hairline bg-white py-6 text-center text-xs text-slate">
          <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
            <span>© 2026 HSNE — École du Dos · Prototype v0</span>
            <Link href="/" className="text-navy-mid hover:underline">
              {t.backToRoles}
            </Link>
          </div>
        </footer>
      )}
    </div>
  );
}

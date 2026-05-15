"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CreditCard,
  KeyRound,
  ShieldCheck,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle2,
  Smartphone,
  AlertCircle,
  Wifi,
} from "lucide-react";
import { HSNELogo } from "@/components/HSNELogo";
import { cn } from "@/lib/utils";

type AuthMethod = "badge" | "azure" | "password";
type Phase = "choose" | "badge_waiting" | "badge_reading" | "azure_redirect" | "password_form" | "twofa" | "success";

export default function LoginPage() {
  const router = useRouter();
  const [method, setMethod] = useState<AuthMethod>("badge");
  const [phase, setPhase] = useState<Phase>("choose");
  const [twoFaCode, setTwoFaCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Animation badge tap
  const [tapPulse, setTapPulse] = useState(false);

  useEffect(() => {
    if (phase === "badge_waiting") {
      const interval = setInterval(() => setTapPulse((p) => !p), 1500);
      return () => clearInterval(interval);
    }
  }, [phase]);

  // ─── Workflows ─────────────────────────────────────────────────
  const startBadge = () => {
    setMethod("badge");
    setPhase("badge_waiting");
    setAuthError(null);
    // Simule la lecture après 2 secondes
    setTimeout(() => simulateBadgeTap(), 2000);
  };

  const simulateBadgeTap = () => {
    setPhase("badge_reading");
    setTimeout(() => succeed(), 1400);
  };

  const startAzure = () => {
    setMethod("azure");
    setPhase("azure_redirect");
    setAuthError(null);
    // Simule la redirection Microsoft puis arrive en 2FA
    setTimeout(() => setPhase("twofa"), 1800);
  };

  const startPassword = () => {
    setMethod("password");
    setPhase("password_form");
    setAuthError(null);
  };

  const submitPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPhase("twofa");
  };

  const submit2FA = (e: React.FormEvent) => {
    e.preventDefault();
    if (twoFaCode.length === 6) succeed();
    else setAuthError("Code à 6 chiffres requis");
  };

  const succeed = () => {
    setPhase("success");
    // Mémorise dans sessionStorage
    if (typeof window !== "undefined") {
      sessionStorage.setItem(
        "edd.session",
        JSON.stringify({
          loggedIn: true,
          method,
          loginAt: new Date().toISOString(),
          name: "Philippe Banaszak",
          role: "Kinésithérapeute coordinateur",
        })
      );
    }
    setTimeout(() => router.push("/"), 1200);
  };

  // Pour la démo : autocomplete 2FA via démo
  const fillDemoCode = () => setTwoFaCode("382174");

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-pale via-white to-cyan-soft/40 flex items-center justify-center p-4">
      {/* Décor SVG en arrière-plan : silhouette feuilles HSNE en filigrane */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-[0.03]">
        <svg viewBox="0 0 1000 1000" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
          <g transform="translate(200,100) scale(5)">
            <path d="M64.5 52.9V0L43.97 24.5C51.88 33.17 58.75 42.72 64.5 52.9Z" fill="#1D2C50" />
            <path d="M20.72 51.76C45.77 80.21 50.65 121.47 51.59 137h12.89V109.07C64.57 82.09 55.06 55.97 37.64 35.37L20.72 51.76Z" fill="#1D2C50" />
            <path d="M78.04 0V52.95C83.76 42.71 90.64 33.17 98.54 24.51L78.04 0Z" fill="#1D2C50" />
            <path d="M103.28 137h17.49C123.14 124.82 130.08 94.31 142.86 76.93L129.8 61.31C108.86 86.3 104.27 122.65 103.28 137Z" fill="#1D2C50" />
          </g>
        </svg>
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <HSNELogo variant="full" className="justify-center" />
          <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-soft text-cyan-mid text-xs font-bold">
            <ShieldCheck className="w-3.5 h-3.5" />
            Authentification HSNE Eupen
          </div>
          <h1 className="font-bold text-2xl text-navy mt-3">École du Dos · Plateforme</h1>
          <p className="text-sm text-slate mt-1">
            Sélectionnez votre méthode de connexion
          </p>
        </div>

        {/* Carte principale */}
        <div className="bg-white rounded-2xl shadow-xl border border-hairline overflow-hidden">
          {/* PHASE — choose method */}
          {phase === "choose" && (
            <div className="p-6 space-y-3">
              <MethodCard
                icon={<CreditCard className="w-5 h-5" />}
                title="Badge HSNE"
                desc="Approchez votre carte du lecteur (sans contact)"
                hint="Méthode recommandée"
                accent="cyan"
                onClick={startBadge}
              />
              <MethodCard
                icon={<MicrosoftIcon />}
                title="SSO Microsoft 365"
                desc="Compte Outlook HSNE + Authenticator"
                hint="Single Sign-On Azure AD"
                accent="navy"
                onClick={startAzure}
              />
              <MethodCard
                icon={<KeyRound className="w-5 h-5" />}
                title="Identifiant + mot de passe"
                desc="Compte local HSNE (méthode de secours)"
                accent="slate"
                onClick={startPassword}
              />
            </div>
          )}

          {/* PHASE — badge waiting */}
          {phase === "badge_waiting" && (
            <div className="p-8 text-center">
              <div className="relative w-32 h-32 mx-auto mb-6">
                {/* Pulses NFC */}
                <div
                  className={cn(
                    "absolute inset-0 rounded-full bg-cyan/20 transition-transform duration-1500",
                    tapPulse ? "scale-150 opacity-0" : "scale-100 opacity-100"
                  )}
                />
                <div
                  className={cn(
                    "absolute inset-2 rounded-full bg-cyan/30 transition-transform duration-1500 delay-100",
                    tapPulse ? "scale-125 opacity-0" : "scale-100 opacity-100"
                  )}
                />
                <div className="absolute inset-4 rounded-full bg-gradient-to-br from-cyan to-cyan-mid flex items-center justify-center">
                  <Wifi className="w-12 h-12 text-white" strokeWidth={2.5} />
                </div>
              </div>
              <div className="font-bold text-navy text-lg">Approchez votre badge</div>
              <div className="text-sm text-slate mt-1">
                Le lecteur NFC est prêt — placez votre carte HSNE devant l&apos;écran
              </div>
              <button
                onClick={() => setPhase("choose")}
                className="mt-4 text-xs text-slate hover:text-navy underline"
              >
                Choisir une autre méthode
              </button>
            </div>
          )}

          {phase === "badge_reading" && (
            <div className="p-8 text-center">
              <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-clover-soft flex items-center justify-center">
                <Loader2 className="w-12 h-12 text-clover animate-spin" />
              </div>
              <div className="font-bold text-navy text-lg">Lecture du badge…</div>
              <div className="text-sm text-slate mt-1">Vérification AD HSNE en cours</div>
            </div>
          )}

          {/* PHASE — azure redirect */}
          {phase === "azure_redirect" && (
            <div className="p-8 text-center">
              <div className="w-20 h-20 mx-auto mb-4 rounded-xl bg-gradient-to-br from-[#0078D4] to-[#005A9E] flex items-center justify-center">
                <MicrosoftIcon size={40} />
              </div>
              <div className="font-bold text-navy text-lg">Redirection Microsoft 365…</div>
              <div className="text-sm text-slate mt-2 font-mono text-xs">
                login.microsoftonline.com/hospital-eupen.be
              </div>
              <Loader2 className="w-5 h-5 mx-auto mt-4 text-navy-mid animate-spin" />
            </div>
          )}

          {/* PHASE — password form */}
          {phase === "password_form" && (
            <form onSubmit={submitPassword} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wide text-slate">
                  Identifiant HSNE
                </label>
                <input
                  type="text"
                  defaultValue="ph.banaszak"
                  className="w-full mt-1 rounded-md border border-hairline px-3 py-2.5 text-sm focus:outline-none focus:border-cyan focus:ring-2 focus:ring-cyan/20"
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wide text-slate">
                  Mot de passe
                </label>
                <div className="relative mt-1">
                  <input
                    type={showPassword ? "text" : "password"}
                    defaultValue="•••••••••••"
                    className="w-full rounded-md border border-hairline px-3 py-2.5 text-sm pr-10 focus:outline-none focus:border-cyan focus:ring-2 focus:ring-cyan/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((p) => !p)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate hover:text-navy"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              {authError && (
                <div className="rounded-md bg-accent/10 border border-accent/30 p-2.5 text-xs text-accent flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  {authError}
                </div>
              )}
              <button
                type="submit"
                className="w-full py-2.5 rounded-md bg-navy text-white font-bold text-sm hover:bg-navy-mid"
              >
                Se connecter
              </button>
              <button
                type="button"
                onClick={() => setPhase("choose")}
                className="w-full text-xs text-slate hover:text-navy underline"
              >
                Choisir une autre méthode
              </button>
            </form>
          )}

          {/* PHASE — 2FA */}
          {phase === "twofa" && (
            <form onSubmit={submit2FA} className="p-6 space-y-4">
              <div className="text-center">
                <div className="w-14 h-14 mx-auto rounded-xl bg-cyan-soft text-cyan-mid flex items-center justify-center mb-3">
                  <Smartphone className="w-7 h-7" />
                </div>
                <div className="font-bold text-navy">Vérification à 2 facteurs</div>
                <div className="text-sm text-slate mt-1">
                  Ouvrez <strong className="text-navy">Microsoft Authenticator</strong> et entrez le code à 6 chiffres
                </div>
              </div>
              <input
                type="text"
                value={twoFaCode}
                onChange={(e) => setTwoFaCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="• • • • • •"
                className="w-full text-center text-3xl font-mono tracking-[0.5em] py-3 rounded-md border-2 border-hairline focus:outline-none focus:border-cyan focus:ring-2 focus:ring-cyan/20"
                autoFocus
              />
              {authError && (
                <div className="rounded-md bg-accent/10 border border-accent/30 p-2.5 text-xs text-accent text-center">
                  {authError}
                </div>
              )}
              <button
                type="submit"
                disabled={twoFaCode.length !== 6}
                className={cn(
                  "w-full py-2.5 rounded-md font-bold text-sm transition",
                  twoFaCode.length === 6
                    ? "bg-cyan text-white hover:bg-cyan-mid"
                    : "bg-slate-light text-slate cursor-not-allowed"
                )}
              >
                Valider
              </button>
              <button
                type="button"
                onClick={fillDemoCode}
                className="w-full text-xs text-cyan font-bold hover:underline"
              >
                ✦ Utiliser le code démo (382174)
              </button>
            </form>
          )}

          {/* PHASE — success */}
          {phase === "success" && (
            <div className="p-8 text-center">
              <div className="w-20 h-20 mx-auto rounded-full bg-clover-soft flex items-center justify-center mb-4">
                <CheckCircle2 className="w-12 h-12 text-clover" />
              </div>
              <div className="font-bold text-navy text-xl">Bienvenue Philippe</div>
              <div className="text-sm text-slate mt-1">Redirection vers la plateforme…</div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-xs text-slate space-y-1">
          <div>
            En cas de problème : <strong className="text-navy">IT HSNE · 087 599 011</strong> ·{" "}
            it-support@hospital-eupen.be
          </div>
          <div className="opacity-60">
            © 2026 St. Nikolaus Hospital Eupen — Plateforme École du Dos
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Sous-composants ───────────────────────────────────────────────

function MethodCard({
  icon,
  title,
  desc,
  hint,
  accent,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  hint?: string;
  accent: "cyan" | "navy" | "slate";
  onClick: () => void;
}) {
  const colors = {
    cyan: "border-cyan/30 hover:border-cyan hover:bg-cyan-soft/40",
    navy: "border-navy/20 hover:border-navy hover:bg-navy-pale",
    slate: "border-hairline hover:border-slate hover:bg-slate-light",
  };
  const iconBg = {
    cyan: "bg-cyan text-white",
    navy: "bg-navy text-white",
    slate: "bg-slate text-white",
  };
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full p-4 rounded-lg border-2 text-left transition flex items-start gap-3 group",
        colors[accent]
      )}
    >
      <div className={cn("w-11 h-11 rounded-lg flex items-center justify-center shrink-0", iconBg[accent])}>
        {icon}
      </div>
      <div className="flex-1">
        <div className="font-bold text-navy">{title}</div>
        <div className="text-sm text-slate mt-0.5">{desc}</div>
        {hint && (
          <div className="text-[10px] uppercase tracking-wider text-cyan-mid font-bold mt-1">
            ✦ {hint}
          </div>
        )}
      </div>
    </button>
  );
}

function MicrosoftIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect x="2" y="2" width="9" height="9" fill="#F25022" />
      <rect x="13" y="2" width="9" height="9" fill="#7FBA00" />
      <rect x="2" y="13" width="9" height="9" fill="#00A4EF" />
      <rect x="13" y="13" width="9" height="9" fill="#FFB900" />
    </svg>
  );
}

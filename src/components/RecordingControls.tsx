"use client";

import { useEffect, useRef, useState } from "react";
import { Mic, Square, Pause, Play, Loader2, Check, X, Sparkles } from "lucide-react";
import { useApp } from "@/lib/app-context";
import { cn } from "@/lib/utils";

type Phase = "idle" | "recording" | "paused" | "stopped" | "transcribing" | "done";

type Props = {
  onTranscriptReady: (transcript: string, audioBlob: Blob) => void;
  /** Si fourni, transcript de démo utilisé en mode mock (sans Azure réel) */
  mockTranscript?: string;
};

export function RecordingControls({ onTranscriptReady, mockTranscript }: Props) {
  const { lang } = useApp();
  const tr = (fr: string, de: string) => (lang === "de" ? de : fr);

  const [phase, setPhase] = useState<Phase>("idle");
  const [elapsed, setElapsed] = useState(0); // seconds
  const [error, setError] = useState<string | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const tickRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const start = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mr = new MediaRecorder(stream);
      chunksRef.current = [];
      mr.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      mr.onstop = () => {
        // Reset timer
        if (tickRef.current) clearInterval(tickRef.current);
      };
      mr.start();
      recorderRef.current = mr;
      setPhase("recording");
      setElapsed(0);
      tickRef.current = setInterval(() => setElapsed((s) => s + 1), 1000);
    } catch (err) {
      console.error(err);
      setError(
        tr(
          "Impossible d'accéder au microphone. Vérifiez les autorisations dans votre navigateur.",
          "Mikrofonzugriff nicht möglich. Bitte Berechtigungen im Browser überprüfen."
        )
      );
    }
  };

  const pause = () => {
    recorderRef.current?.pause();
    if (tickRef.current) clearInterval(tickRef.current);
    setPhase("paused");
  };

  const resume = () => {
    recorderRef.current?.resume();
    tickRef.current = setInterval(() => setElapsed((s) => s + 1), 1000);
    setPhase("recording");
  };

  const stop = async () => {
    recorderRef.current?.stop();
    streamRef.current?.getTracks().forEach((t) => t.stop());
    setPhase("transcribing");

    // Wait for ondataavailable to fire one last time
    await new Promise((r) => setTimeout(r, 200));
    const blob = new Blob(chunksRef.current, { type: "audio/webm" });

    // Mock : simule appel Azure Speech (en prod : POST /api/transcribe vers Azure)
    await new Promise((r) => setTimeout(r, 1800));

    // En l'absence d'Azure réel, on utilise le transcript de démo si fourni
    const transcript = mockTranscript ??
      tr(
        "Mon problème principal c'est le bas du dos, lombaire avec irradiation sciatique côté gauche. J'ai eu une opération de hernie discale L5-S1 en 2021. Sur une échelle de 0 à 10, la pire douleur ces 2 dernières semaines c'était 7. Je dors mal, 4-5 heures, je me réveille la nuit. Le matin je suis raide pendant 20 minutes. Je suis chauffeur poids lourd, en arrêt depuis 6 mois. La conduite prolongée provoque la douleur, marcher me soulage un peu. J'aimerais reprendre le travail.",
        "Mein Hauptproblem ist der untere Rücken, lumbal mit Ischias-Ausstrahlung links. Ich hatte 2021 eine Bandscheibenoperation L5-S1. Auf einer Skala von 0 bis 10 war der schlimmste Schmerz in den letzten 2 Wochen 7. Ich schlafe schlecht, 4-5 Stunden, wache nachts auf. Morgens bin ich 20 Minuten lang steif. Ich bin LKW-Fahrer, krankgeschrieben seit 6 Monaten. Langes Fahren verursacht den Schmerz, Gehen lindert. Ich möchte wieder arbeiten."
      );

    setPhase("done");
    onTranscriptReady(transcript, blob);
  };

  const cancel = () => {
    recorderRef.current?.stop();
    streamRef.current?.getTracks().forEach((t) => t.stop());
    if (tickRef.current) clearInterval(tickRef.current);
    chunksRef.current = [];
    setPhase("idle");
    setElapsed(0);
  };

  const fmtTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${String(sec).padStart(2, "0")}`;
  };

  // ─── Render ───────────────────────────────────────────────────
  return (
    <div className="rounded-xl border border-cyan-light/40 bg-gradient-to-br from-cyan-pale to-white p-4">
      <div className="flex items-start gap-3 mb-3">
        <div className="w-9 h-9 rounded-lg bg-cyan-mid text-white flex items-center justify-center shrink-0">
          <Mic className="w-4 h-4" />
        </div>
        <div className="flex-1">
          <div className="font-bold text-navy text-sm">
            {tr("Enregistrement audio + Azure Speech", "Audioaufnahme + Azure Speech")}
          </div>
          <div className="text-xs text-slate mt-0.5">
            {tr(
              "Alternative gratuite à Plaud · transcription Azure HSNE puis structuration Copilot",
              "Kostenlose Alternative zu Plaud · Azure-HSNE-Transkription dann Copilot-Strukturierung"
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-3 p-2.5 rounded-md bg-accent/10 border border-accent/30 text-xs text-accent">
          {error}
        </div>
      )}

      {/* Phases */}
      {phase === "idle" && (
        <button
          onClick={start}
          className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-lg bg-cyan text-white font-bold hover:bg-cyan-mid transition"
        >
          <Mic className="w-5 h-5" />
          {tr("Démarrer l'enregistrement", "Aufnahme starten")}
        </button>
      )}

      {(phase === "recording" || phase === "paused") && (
        <div className="space-y-3">
          {/* Timer + indicator */}
          <div className="flex items-center justify-center gap-3 py-3 rounded-lg bg-white border border-hairline">
            <span
              className={cn(
                "w-3 h-3 rounded-full",
                phase === "recording" ? "bg-accent animate-pulse" : "bg-slate"
              )}
            />
            <span className="font-mono text-2xl tabular-nums text-navy font-bold">
              {fmtTime(elapsed)}
            </span>
            <span className="text-xs text-slate uppercase tracking-wider">
              {phase === "recording"
                ? tr("Enregistrement…", "Aufnahme läuft…")
                : tr("En pause", "Pausiert")}
            </span>
          </div>

          {/* Controls */}
          <div className="flex gap-2">
            {phase === "recording" ? (
              <button
                onClick={pause}
                className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 rounded-md border border-hairline text-navy hover:bg-navy-pale text-sm font-medium"
              >
                <Pause className="w-4 h-4" />
                {tr("Pause", "Pause")}
              </button>
            ) : (
              <button
                onClick={resume}
                className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 rounded-md border border-hairline text-navy hover:bg-navy-pale text-sm font-medium"
              >
                <Play className="w-4 h-4" />
                {tr("Reprendre", "Fortsetzen")}
              </button>
            )}
            <button
              onClick={stop}
              className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 rounded-md bg-clover text-white hover:bg-clover/90 text-sm font-bold"
            >
              <Square className="w-4 h-4" />
              {tr("Terminer + transcrire", "Stoppen + transkribieren")}
            </button>
            <button
              onClick={cancel}
              className="inline-flex items-center justify-center px-3 rounded-md border border-hairline text-slate hover:bg-slate-light"
              title={tr("Annuler", "Abbrechen")}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {phase === "transcribing" && (
        <div className="flex items-center gap-3 p-4 rounded-lg bg-white border border-hairline">
          <Loader2 className="w-5 h-5 text-cyan animate-spin shrink-0" />
          <div>
            <div className="text-sm font-bold text-navy">
              {tr("Transcription Azure Speech en cours…", "Azure-Speech-Transkription läuft…")}
            </div>
            <div className="text-xs text-slate mt-0.5">
              {tr(
                `${fmtTime(elapsed)} d'audio · estimation 2-3 secondes`,
                `${fmtTime(elapsed)} Audio · Schätzung 2-3 Sekunden`
              )}
            </div>
          </div>
        </div>
      )}

      {phase === "done" && (
        <div className="flex items-center gap-3 p-3 rounded-lg bg-clover-soft border border-clover/30">
          <Check className="w-5 h-5 text-clover shrink-0" />
          <div className="flex-1">
            <div className="text-sm font-bold text-clover">
              {tr("Audio transcrit", "Audio transkribiert")}
            </div>
            <div className="text-xs text-slate mt-0.5">
              {tr(
                "Le transcript est prêt à être structuré par Copilot HSNE",
                "Transkript bereit zur Strukturierung durch HSNE-Copilot"
              )}
            </div>
          </div>
          <Sparkles className="w-4 h-4 text-cyan" />
        </div>
      )}

      {/* Footer info — économies */}
      {phase === "idle" && (
        <div className="mt-3 text-[11px] text-slate text-center italic">
          ✦ {tr(
            "350 €/an économisés vs abonnement Plaud · Azure Speech inclus dans la licence HSNE",
            "350 €/Jahr gespart vs. Plaud-Abo · Azure Speech in HSNE-Lizenz enthalten"
          )}
        </div>
      )}
    </div>
  );
}

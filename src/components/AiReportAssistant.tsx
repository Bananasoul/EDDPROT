"use client";

import { useEffect, useRef, useState } from "react";
import { Sparkles, Loader2, RotateCcw, FileText, Check, Square } from "lucide-react";
import type { Patient } from "@/lib/mock-data";
import { useApp } from "@/lib/app-context";
import { cn } from "@/lib/utils";

type Phase = "idle" | "thinking" | "streaming" | "done";

const STEPS_FR = [
  "Analyse de l'anamnèse et du motif de prise en charge…",
  "Synthèse des scores T0 / T1 et calcul des deltas significatifs…",
  "Identification des drapeaux jaunes/rouges et facteurs pronostiques…",
  "Génération de la conclusion et des recommandations au médecin traitant…",
];
const STEPS_DE = [
  "Analyse der Anamnese und des Behandlungsgrundes…",
  "Zusammenfassung der T0/T1-Scores und Berechnung signifikanter Deltas…",
  "Identifikation der gelben/roten Flaggen und prognostischer Faktoren…",
  "Generierung der Schlussfolgerung und Empfehlungen an den Hausarzt…",
];

function buildReportText(p: Patient, lang: "fr" | "de"): string {
  const t0 = p.scoresT0;
  const t1 = p.scoresT1;
  const dropEva = t0 && t1 ? t0.pain_activity - t1.pain_activity : null;
  const dropOdi = t0 && t1 ? t0.odi - t1.odi : null;
  const dropTsk = t0 && t1 ? t0.tsk - t1.tsk : null;
  const ywl = p.yellowFlags.length;
  const rdl = p.redFlags.length;

  if (lang === "de") {
    const parts: string[] = [];
    parts.push(
      `Sehr geehrte Frau Kollegin, sehr geehrter Herr Kollege,\n\nim Anschluss an die ${p.sessionsDone} durchgeführten Sitzungen im Rahmen der Rückenschule (KCE-Protokoll, INAMI 563011) übermitteln wir Ihnen den folgenden Bericht zu Ihrem/r Patient/in ${p.firstName} ${p.lastName}.`
    );
    parts.push(
      `\n\nKLINISCHER KONTEXT — Der/Die Patient/in wurde an uns überwiesen wegen: ${p.complaint.toLowerCase()}. Unsere Arbeitshypothese lautet: ${p.hypothesis.toLowerCase()}.`
    );
    if (t0 && t1) {
      parts.push(
        `\n\nVERGLEICHENDE BEWERTUNG T0 → T1 — Wir verzeichnen eine Verringerung der VAS Aktivität um ${dropEva} Punkte (${t0.pain_activity}/10 → ${t1.pain_activity}/10), einen Rückgang des ODI um ${dropOdi} Prozentpunkte (${t0.odi}% → ${t1.odi}%) sowie eine Verbesserung des TSK-Scores um ${dropTsk} Punkte. Die HAD-Skalen entwickeln sich günstig (HAD-A: ${t0.had_a} → ${t1.had_a}; HAD-D: ${t0.had_d} → ${t1.had_d}).`
      );
    } else if (t0) {
      parts.push(
        `\n\nERSTBEWERTUNG T0 — VAS Aktivität ${t0.pain_activity}/10, ODI ${t0.odi}%, TSK ${t0.tsk}, STarT Back ${t0.start}/9. Der/Die Patient/in befindet sich derzeit in Sitzung ${p.sessionsDone}/36; ein vollständiger T1-Bericht folgt.`
      );
    }
    if (ywl || rdl) {
      const yw = ywl ? `gelbe Flaggen identifiziert (${p.yellowFlags.slice(0, 3).join(", ")}${ywl > 3 ? "…" : ""})` : "";
      const rd = rdl ? `rote Flaggen erfordern Aufmerksamkeit (${p.redFlags.join(", ")})` : "";
      parts.push(`\n\nKLINISCHE FLAGGEN — ${[yw, rd].filter(Boolean).join("; ")}.`);
    }
    parts.push(
      `\n\nSCHLUSSFOLGERUNG — ${
        t1
          ? "Die Programmziele wurden weitgehend erreicht. Wir empfehlen die Aufrechterhaltung einer regelmäßigen körperlichen Aktivität (2-3x/Woche), die Anwendung der erlernten Rückenschutzprinzipien und eine klinische Kontrolle nach 3 Monaten (T2)."
          : "Das Programm verläuft günstig; wir behalten die kontinuierliche Bewertung der Schmerz-, Behinderungs- und Kinesiophobie-Scores bei und werden Ihnen am Ende einen vollständigen Bericht zukommen lassen."
      }`
    );
    parts.push(`\n\nMit kollegialen Grüßen,\nPhilippe Banaszak`);
    return parts.join("");
  }

  const parts: string[] = [];
  parts.push(
    `Cher confrère, chère consœur,\n\nÀ la suite des ${p.sessionsDone} séances effectuées dans le cadre du programme École du Dos (protocole KCE, INAMI 563011), nous vous adressons le compte-rendu suivant concernant votre patient(e) ${p.firstName} ${p.lastName}.`
  );
  parts.push(
    `\n\nCONTEXTE CLINIQUE — Le/la patient(e) nous a été adressé(e) pour : ${p.complaint.toLowerCase()}. Notre hypothèse de travail est : ${p.hypothesis.toLowerCase()}.`
  );
  if (t0 && t1) {
    parts.push(
      `\n\nÉVALUATION COMPARATIVE T0 → T1 — Nous notons une diminution de l'EVA activité de ${dropEva} points (${t0.pain_activity}/10 → ${t1.pain_activity}/10), une baisse de l'ODI de ${dropOdi} points de pourcentage (${t0.odi}% → ${t1.odi}%) et une amélioration du score TSK de ${dropTsk} points. Les échelles HAD évoluent favorablement (HAD-A : ${t0.had_a} → ${t1.had_a} ; HAD-D : ${t0.had_d} → ${t1.had_d}).`
    );
  } else if (t0) {
    parts.push(
      `\n\nÉVALUATION INITIALE T0 — EVA activité ${t0.pain_activity}/10, ODI ${t0.odi}%, TSK ${t0.tsk}, STarT Back ${t0.start}/9. Le/la patient(e) est actuellement en séance ${p.sessionsDone}/36 ; un rapport T1 complet suivra.`
    );
  }
  if (ywl || rdl) {
    const yw = ywl ? `drapeaux jaunes identifiés (${p.yellowFlags.slice(0, 3).join(", ")}${ywl > 3 ? "…" : ""})` : "";
    const rd = rdl ? `drapeaux rouges nécessitent une vigilance (${p.redFlags.join(", ")})` : "";
    parts.push(`\n\nDRAPEAUX CLINIQUES — ${[yw, rd].filter(Boolean).join(" ; ")}.`);
  }
  parts.push(
    `\n\nCONCLUSION — ${
      t1
        ? "Les objectifs du programme sont en grande partie atteints. Nous recommandons le maintien d'une activité physique régulière (2-3x/sem), l'application des principes de protection rachidienne acquis et un contrôle clinique à 3 mois (T2)."
        : "Le programme se déroule favorablement ; nous maintenons une évaluation continue des scores de douleur, d'incapacité et de kinésiophobie, et vous adresserons un compte-rendu complet en fin de programme."
    }`
  );
  parts.push(`\n\nBien confraternellement,\nPhilippe Banaszak`);
  return parts.join("");
}

export function AiReportAssistant({ patient }: { patient: Patient }) {
  const { lang } = useApp();
  const [phase, setPhase] = useState<Phase>("idle");
  const [stepIdx, setStepIdx] = useState(0);
  const [text, setText] = useState("");
  const [fullText, setFullText] = useState("");
  const stopRef = useRef(false);
  const tr = (fr: string, de: string) => (lang === "de" ? de : fr);
  const steps = lang === "de" ? STEPS_DE : STEPS_FR;

  const start = () => {
    stopRef.current = false;
    setText("");
    setStepIdx(0);
    setPhase("thinking");
    const generated = buildReportText(patient, lang);
    setFullText(generated);
  };

  // Thinking phase
  useEffect(() => {
    if (phase !== "thinking") return;
    if (stepIdx >= steps.length) {
      setPhase("streaming");
      return;
    }
    const timer = setTimeout(() => setStepIdx((i) => i + 1), 700);
    return () => clearTimeout(timer);
  }, [phase, stepIdx, steps.length]);

  // Streaming phase — chunk-based reveal
  useEffect(() => {
    if (phase !== "streaming") return;
    if (text.length >= fullText.length) {
      setPhase("done");
      return;
    }
    if (stopRef.current) return;
    const chunkSize = Math.max(2, Math.floor(Math.random() * 5));
    const next = fullText.slice(0, text.length + chunkSize);
    const delay = /[.,;:!?\n]/.test(fullText[text.length] || "") ? 80 : 18;
    const timer = setTimeout(() => setText(next), delay);
    return () => clearTimeout(timer);
  }, [phase, text, fullText]);

  const stop = () => {
    stopRef.current = true;
    setPhase("done");
    setText(fullText);
  };

  const reset = () => {
    stopRef.current = false;
    setText("");
    setStepIdx(0);
    setFullText("");
    setPhase("idle");
  };

  return (
    <div className="rounded-xl border border-hairline bg-gradient-to-br from-navy-pale via-white to-amber-soft/30 overflow-hidden">
      <div className="flex items-start justify-between p-5 border-b border-hairline/60">
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-lg bg-gradient-to-br from-navy to-navy-mid text-white flex items-center justify-center shrink-0 shadow-sm">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-serif text-lg text-navy">
                {tr("Rédaction assistée par IA", "KI-gestützte Berichterstellung")}
              </h3>
              <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber/15 text-amber font-bold">
                BETA
              </span>
            </div>
            <p className="text-sm text-slate mt-0.5 leading-relaxed">
              {tr(
                "Synthèse automatique du dossier en compte-rendu structuré, prêt à relire et signer.",
                "Automatische Zusammenfassung der Akte in einen strukturierten, lesefertigen Bericht."
              )}
            </p>
          </div>
        </div>
        {phase === "idle" && (
          <button
            onClick={start}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-navy text-white hover:bg-navy-mid shrink-0 shadow-sm"
          >
            <Sparkles className="w-4 h-4" />
            {tr("Lancer la rédaction", "Erstellung starten")}
          </button>
        )}
        {phase === "streaming" && (
          <button
            onClick={stop}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-hairline text-navy hover:bg-white shrink-0"
          >
            <Square className="w-3.5 h-3.5" />
            {tr("Stopper", "Stoppen")}
          </button>
        )}
        {phase === "done" && (
          <div className="flex gap-2 shrink-0">
            <button
              onClick={reset}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-hairline text-navy hover:bg-white"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              {tr("Régénérer", "Neu generieren")}
            </button>
          </div>
        )}
      </div>

      {phase === "idle" && (
        <div className="p-5 text-sm text-slate flex items-start gap-2">
          <FileText className="w-4 h-4 shrink-0 mt-0.5 text-navy-mid" />
          <span>
            {tr(
              "Claude analyse l'anamnèse, les scores T0/T1 et les drapeaux pour rédiger un brouillon de compte-rendu en moins de 30 secondes. Vous restez l'auteur : tout est éditable avant envoi.",
              "Claude analysiert Anamnese, T0/T1-Scores und Flaggen und erstellt in weniger als 30 Sekunden einen Berichtsentwurf. Sie bleiben Autor: alles ist vor dem Versand bearbeitbar."
            )}
          </span>
        </div>
      )}

      {phase === "thinking" && (
        <div className="p-5 space-y-2">
          {steps.map((s, i) => {
            const active = i === stepIdx;
            const done = i < stepIdx;
            return (
              <div
                key={i}
                className={cn(
                  "flex items-center gap-2.5 text-sm transition-opacity",
                  i > stepIdx ? "opacity-30" : "opacity-100"
                )}
              >
                <div className="w-5 h-5 shrink-0 flex items-center justify-center">
                  {done ? (
                    <Check className="w-4 h-4 text-clover" />
                  ) : active ? (
                    <Loader2 className="w-4 h-4 text-navy animate-spin" />
                  ) : (
                    <div className="w-2 h-2 rounded-full bg-slate-light" />
                  )}
                </div>
                <span className={cn(active && "text-navy font-medium", done && "text-slate")}>
                  {s}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {(phase === "streaming" || phase === "done") && (
        <div className="p-5 space-y-3">
          <div className="font-serif text-base text-navy whitespace-pre-wrap leading-relaxed bg-white p-4 rounded-lg border border-hairline shadow-inner min-h-[200px]">
            {text}
            {phase === "streaming" && (
              <span className="inline-block w-1.5 h-4 bg-navy ml-0.5 align-middle animate-pulse" />
            )}
          </div>
          {phase === "done" && (
            <div className="flex items-center justify-between text-xs text-slate">
              <div className="flex items-center gap-1.5 text-clover">
                <Check className="w-3.5 h-3.5" />
                {tr(
                  `Rédigé en ${(fullText.length / 80).toFixed(1)}s · ${fullText.split(/\s+/).length} mots`,
                  `Erstellt in ${(fullText.length / 80).toFixed(1)}s · ${fullText.split(/\s+/).length} Wörter`
                )}
              </div>
              <span className="italic">
                {tr(
                  "À relire et signer avant envoi",
                  "Vor dem Versand zu prüfen und zu unterschreiben"
                )}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

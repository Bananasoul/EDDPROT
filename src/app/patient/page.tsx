"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, ShieldCheck, FileText, Tablet } from "lucide-react";
import { useApp } from "@/lib/app-context";
import { Card, CardBody } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

// Questionnaire structure (trimmed demo : NRS + 3 items STarT Back + PGIC)
type Step = {
  id: string;
  scale: "nrs" | "startback" | "pgic" | "consent" | "intro" | "done";
  question: { fr: string; de: string };
  hint?: { fr: string; de: string };
};

const steps: Step[] = [
  {
    id: "intro",
    scale: "intro",
    question: {
      fr: "Bienvenue dans votre évaluation École du Dos",
      de: "Willkommen zu Ihrer Rückenschule-Bewertung",
    },
    hint: {
      fr: "Durée : environ 8 minutes · Vos réponses sont strictement confidentielles.",
      de: "Dauer: etwa 8 Minuten · Ihre Antworten bleiben streng vertraulich.",
    },
  },
  {
    id: "consent",
    scale: "consent",
    question: {
      fr: "Consentement éclairé (RGPD)",
      de: "Informierte Einwilligung (DSGVO)",
    },
  },
  {
    id: "nrs_rest",
    scale: "nrs",
    question: {
      fr: "Quelle est l'intensité de votre douleur AU REPOS, aujourd'hui ?",
      de: "Wie stark sind Ihre Schmerzen IN RUHE, heute?",
    },
    hint: {
      fr: "0 = aucune douleur, 10 = douleur insupportable",
      de: "0 = keine Schmerzen, 10 = unerträgliche Schmerzen",
    },
  },
  {
    id: "nrs_act",
    scale: "nrs",
    question: {
      fr: "Quelle est l'intensité de votre douleur LORS D'UNE ACTIVITÉ ?",
      de: "Wie stark sind Ihre Schmerzen BEI EINER AKTIVITÄT?",
    },
    hint: {
      fr: "0 = aucune douleur, 10 = douleur insupportable",
      de: "0 = keine Schmerzen, 10 = unerträgliche Schmerzen",
    },
  },
  {
    id: "sb1",
    scale: "startback",
    question: {
      fr: "Ma douleur au dos s'est étendue le long de la jambe à un moment donné ces 2 dernières semaines.",
      de: "Meine Rückenschmerzen haben in den letzten 2 Wochen irgendwann in das Bein ausgestrahlt.",
    },
  },
  {
    id: "sb2",
    scale: "startback",
    question: {
      fr: "J'ai eu mal à l'épaule ou à la nuque à un moment donné ces 2 dernières semaines.",
      de: "Ich hatte in den letzten 2 Wochen irgendwann Schulter- oder Nackenschmerzen.",
    },
  },
  {
    id: "sb3",
    scale: "startback",
    question: {
      fr: "Je n'ai marché que pour de courtes distances à cause de mon mal de dos.",
      de: "Ich bin wegen meiner Rückenschmerzen nur kurze Strecken gegangen.",
    },
  },
  {
    id: "done",
    scale: "done",
    question: { fr: "", de: "" },
  },
];

export default function PatientPage() {
  const { lang } = useApp();
  const [i, setI] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number | boolean>>({});
  const [consent, setConsent] = useState(false);

  const step = steps[i];
  const total = steps.length - 2; // excluant intro et done
  const progress = Math.max(0, Math.min(total, i - 1));

  const next = () => setI((v) => Math.min(steps.length - 1, v + 1));
  const prev = () => setI((v) => Math.max(0, v - 1));

  const tr = (o: { fr: string; de: string } | undefined) => (o ? o[lang] : "");

  const nrsScore = typeof answers["nrs_act"] === "number" ? (answers["nrs_act"] as number) : 0;
  const sbYes = ["sb1", "sb2", "sb3"].filter((k) => answers[k] === true).length;

  const canNext = () => {
    if (step.scale === "intro") return true;
    if (step.scale === "consent") return consent;
    if (step.scale === "nrs") return typeof answers[step.id] === "number";
    if (step.scale === "startback") return typeof answers[step.id] === "boolean";
    return false;
  };

  return (
    <div className="min-h-[80vh] bg-gradient-to-b from-navy-pale/40 to-white">
      <div className="max-w-2xl mx-auto px-6 py-10">
        {/* Tablet framing cue */}
        <div className="inline-flex items-center gap-2 text-xs text-slate uppercase tracking-wide font-medium mb-3">
          <Tablet className="w-3.5 h-3.5" />
          Interface patient — tablette
        </div>

        {/* Progress bar */}
        {step.scale !== "intro" && step.scale !== "done" && (
          <div className="mb-6">
            <div className="flex items-center justify-between text-xs text-slate mb-1.5">
              <span>
                Question {progress} / {total}
              </span>
              <span>{Math.round((progress / total) * 100)}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-slate-light overflow-hidden">
              <div
                className="h-full bg-navy transition-all duration-500"
                style={{ width: `${(progress / total) * 100}%` }}
              />
            </div>
          </div>
        )}

        <Card className="shadow-md">
          <CardBody className="p-8 min-h-[420px] flex flex-col">
            {step.scale === "intro" && (
              <IntroView question={tr(step.question)} hint={tr(step.hint)} onStart={next} />
            )}

            {step.scale === "consent" && (
              <ConsentView
                title={tr(step.question)}
                checked={consent}
                onChange={setConsent}
              />
            )}

            {step.scale === "nrs" && (
              <NrsView
                question={tr(step.question)}
                hint={tr(step.hint)}
                value={answers[step.id] as number | undefined}
                onChange={(v) => setAnswers((a) => ({ ...a, [step.id]: v }))}
              />
            )}

            {step.scale === "startback" && (
              <YesNoView
                question={tr(step.question)}
                value={answers[step.id] as boolean | undefined}
                onChange={(v) => setAnswers((a) => ({ ...a, [step.id]: v }))}
              />
            )}

            {step.scale === "done" && (
              <DoneView nrs={nrsScore} sbYes={sbYes} lang={lang} />
            )}

            {/* Navigation */}
            {step.scale !== "intro" && step.scale !== "done" && (
              <div className="mt-auto pt-6 flex items-center justify-between">
                <button
                  onClick={prev}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-medium text-slate hover:text-navy"
                >
                  <ArrowLeft className="w-4 h-4" />
                  {lang === "fr" ? "Précédent" : "Zurück"}
                </button>
                <button
                  onClick={next}
                  disabled={!canNext()}
                  className={cn(
                    "inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg text-sm font-semibold transition",
                    canNext()
                      ? "bg-navy text-white hover:bg-navy-mid"
                      : "bg-slate-light text-slate cursor-not-allowed"
                  )}
                >
                  {lang === "fr" ? "Suivant" : "Weiter"}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

function IntroView({ question, hint, onStart }: { question: string; hint: string; onStart: () => void }) {
  const { lang } = useApp();
  return (
    <div className="text-center flex flex-col items-center justify-center flex-1 py-8">
      <div className="w-16 h-16 rounded-full bg-navy-pale text-navy flex items-center justify-center mb-5">
        <FileText className="w-8 h-8" />
      </div>
      <h2 className="font-serif text-2xl md:text-3xl text-navy">{question}</h2>
      <p className="text-slate mt-3 max-w-md">{hint}</p>
      <button
        onClick={onStart}
        className="mt-8 inline-flex items-center gap-2 bg-navy text-white px-6 py-3 rounded-lg text-base font-semibold hover:bg-navy-mid"
      >
        {lang === "fr" ? "Commencer" : "Beginnen"}
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}

function ConsentView({
  title,
  checked,
  onChange,
}: {
  title: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  const { lang } = useApp();
  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <ShieldCheck className="w-6 h-6 text-clover" />
        <h2 className="font-serif text-2xl text-navy">{title}</h2>
      </div>
      <div className="text-sm text-ink leading-relaxed space-y-3 bg-slate-light/40 p-5 rounded-lg border border-hairline">
        {lang === "fr" ? (
          <>
            <p>
              Vos réponses seront utilisées uniquement dans le cadre de votre prise en charge
              École du Dos à l'Hôpital Saint-Nicolas Eupen. Elles sont couvertes par le secret
              médical et stockées de manière sécurisée.
            </p>
            <p>
              Vous disposez d'un droit d'accès, de rectification et d'effacement de vos données
              à tout moment (RGPD / AVG).
            </p>
          </>
        ) : (
          <>
            <p>
              Ihre Antworten werden ausschließlich im Rahmen Ihrer Rückenschule-Behandlung im
              St.-Nikolaus-Hospital Eupen verwendet. Sie unterliegen der ärztlichen
              Schweigepflicht und werden sicher gespeichert.
            </p>
            <p>
              Sie haben jederzeit das Recht auf Zugang, Berichtigung und Löschung Ihrer Daten
              (DSGVO).
            </p>
          </>
        )}
      </div>
      <label className="mt-5 flex items-start gap-3 cursor-pointer group">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="w-5 h-5 mt-0.5 accent-navy"
        />
        <span className="text-sm text-ink">
          {lang === "fr"
            ? "J'ai lu et j'accepte le traitement de mes données dans ce cadre."
            : "Ich habe gelesen und akzeptiere die Verarbeitung meiner Daten in diesem Rahmen."}
        </span>
      </label>
    </div>
  );
}

function NrsView({
  question,
  hint,
  value,
  onChange,
}: {
  question: string;
  hint: string;
  value?: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <h2 className="font-serif text-xl md:text-2xl text-navy leading-snug">{question}</h2>
      <p className="text-sm text-slate mt-2">{hint}</p>

      <div className="mt-10">
        <div className="grid grid-cols-11 gap-1.5">
          {Array.from({ length: 11 }).map((_, n) => {
            const selected = value === n;
            const hue = n <= 3 ? "bg-clover" : n <= 6 ? "bg-amber" : "bg-accent";
            return (
              <button
                key={n}
                onClick={() => onChange(n)}
                className={cn(
                  "aspect-square rounded-lg text-base md:text-lg font-semibold transition-all border-2",
                  selected
                    ? `${hue} text-white border-transparent scale-105 shadow-md`
                    : "bg-white text-navy border-hairline hover:border-navy-mid hover:bg-navy-pale"
                )}
              >
                {n}
              </button>
            );
          })}
        </div>
        <div className="mt-3 flex justify-between text-[11px] text-slate">
          <span>Aucune douleur</span>
          <span>Douleur insupportable</span>
        </div>
      </div>
    </div>
  );
}

function YesNoView({
  question,
  value,
  onChange,
}: {
  question: string;
  value?: boolean;
  onChange: (v: boolean) => void;
}) {
  const { lang } = useApp();
  return (
    <div>
      <h2 className="font-serif text-xl md:text-2xl text-navy leading-snug">{question}</h2>
      <div className="mt-10 grid grid-cols-2 gap-4">
        {[true, false].map((v) => {
          const selected = value === v;
          return (
            <button
              key={String(v)}
              onClick={() => onChange(v)}
              className={cn(
                "py-8 rounded-xl border-2 font-semibold text-lg transition-all",
                selected
                  ? v
                    ? "bg-accent text-white border-transparent shadow-md"
                    : "bg-clover text-white border-transparent shadow-md"
                  : "bg-white text-navy border-hairline hover:border-navy-mid hover:bg-navy-pale"
              )}
            >
              {v ? (lang === "fr" ? "Oui" : "Ja") : lang === "fr" ? "Non" : "Nein"}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function DoneView({ nrs, sbYes, lang }: { nrs: number; sbYes: number; lang: "fr" | "de" }) {
  return (
    <div className="text-center flex flex-col items-center justify-center flex-1 py-4">
      <div className="w-16 h-16 rounded-full bg-clover-soft text-clover flex items-center justify-center mb-5">
        <CheckCircle2 className="w-10 h-10" />
      </div>
      <h2 className="font-serif text-2xl md:text-3xl text-navy">
        {lang === "fr" ? "Merci !" : "Vielen Dank!"}
      </h2>
      <p className="text-slate mt-3 max-w-md">
        {lang === "fr"
          ? "Vos réponses ont été enregistrées. Votre kinésithérapeute les consultera avant votre prochaine séance."
          : "Ihre Antworten wurden gespeichert. Ihr Physiotherapeut wird sie vor Ihrer nächsten Sitzung einsehen."}
      </p>

      <div className="mt-8 grid grid-cols-2 gap-4 w-full max-w-sm">
        <div className="p-4 rounded-lg bg-navy-pale border border-navy-light">
          <div className="text-[10px] uppercase tracking-wide text-slate font-medium">NRS activité</div>
          <div className="font-serif text-2xl text-navy mt-1">{nrs}/10</div>
        </div>
        <div className="p-4 rounded-lg bg-navy-pale border border-navy-light">
          <div className="text-[10px] uppercase tracking-wide text-slate font-medium">STarT (partiel)</div>
          <div className="font-serif text-2xl text-navy mt-1">{sbYes}/3</div>
        </div>
      </div>

      <p className="mt-8 text-xs text-slate max-w-md">
        {lang === "fr"
          ? "(Démo — en production : génération PDF auto, envoi sécurisé au DPI, notification au kiné)"
          : "(Demo — in Produktion: automatische PDF-Erstellung, sicherer Versand an DPI, Benachrichtigung Physio)"}
      </p>
    </div>
  );
}

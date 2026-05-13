/**
 * Illustrations pour les rôles École du Dos HSNE
 * Style line-drawing inspiré du site officiel hospital-eupen.be
 * (personnages stylisés, traits navy, fond transparent, simple et chaleureux)
 */

const STROKE = "#1D2C50";   // navy logo HSNE
const ACCENT = "#1F96B5";   // cyan signature HSNE

type IllustrationProps = {
  className?: string;
  size?: number;
};

// ─── 1. Médecin physiothérapeute (médecin avec stéthoscope) ──────
export function PhysioIllustration({ className = "", size = 96 }: IllustrationProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 96 96"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Tête */}
      <circle cx="48" cy="26" r="11" stroke={STROKE} strokeWidth="2" fill="white" />
      {/* Cheveux */}
      <path d="M37 24c0-7 5-12 11-12s11 5 11 12" stroke={STROKE} strokeWidth="2" strokeLinecap="round" />
      {/* Yeux */}
      <circle cx="44" cy="26" r="0.8" fill={STROKE} />
      <circle cx="52" cy="26" r="0.8" fill={STROKE} />
      {/* Sourire */}
      <path d="M45 30c1 1 2 1.5 3 1.5s2-0.5 3-1.5" stroke={STROKE} strokeWidth="1.5" strokeLinecap="round" fill="none" />
      {/* Cou */}
      <path d="M44 36v4M52 36v4" stroke={STROKE} strokeWidth="2" />
      {/* Blouse / col */}
      <path d="M30 44c0-2 4-4 8-4l10 6 10-6c4 0 8 2 8 4v32H30z" stroke={STROKE} strokeWidth="2" fill="white" strokeLinejoin="round" />
      {/* Col en V */}
      <path d="M40 40l8 10 8-10" stroke={STROKE} strokeWidth="2" fill="none" />
      {/* Stéthoscope */}
      <path d="M38 50c0 8-2 14-2 18 0 4 2 6 5 6s5-2 5-6" stroke={ACCENT} strokeWidth="2" fill="none" strokeLinecap="round" />
      <circle cx="46" cy="74" r="3" stroke={ACCENT} strokeWidth="2" fill="white" />
      {/* Poche */}
      <rect x="54" y="56" width="8" height="6" stroke={STROKE} strokeWidth="1.5" fill="none" />
    </svg>
  );
}

// ─── 2. Kinésithérapeute (silhouette en mouvement) ──────────────
export function KineIllustration({ className = "", size = 96 }: IllustrationProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 96 96"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Tête */}
      <circle cx="34" cy="24" r="8" stroke={STROKE} strokeWidth="2" fill="white" />
      {/* Corps en mouvement (yoga / étirement) */}
      <path d="M34 32v18l-8 18 8-4 8 4-2-18 4-12-10-6z" stroke={STROKE} strokeWidth="2" fill="white" strokeLinejoin="round" />
      {/* Bras tendus */}
      <path d="M34 38l-12-8M44 38l16-12" stroke={STROKE} strokeWidth="2" strokeLinecap="round" />
      {/* Mains */}
      <circle cx="22" cy="30" r="2.5" stroke={STROKE} strokeWidth="1.5" fill="white" />
      <circle cx="60" cy="26" r="2.5" stroke={STROKE} strokeWidth="1.5" fill="white" />
      {/* Cercle de mouvement (énergie) */}
      <path d="M68 50c4 6 6 14 4 22" stroke={ACCENT} strokeWidth="2" strokeLinecap="round" strokeDasharray="3 4" fill="none" />
      <path d="M16 50c-4 6-6 14-4 22" stroke={ACCENT} strokeWidth="2" strokeLinecap="round" strokeDasharray="3 4" fill="none" />
      {/* Sol */}
      <line x1="14" y1="84" x2="82" y2="84" stroke={STROKE} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

// ─── 3. Ergothérapeute (mains avec engrenage / outil) ───────────
export function ErgoIllustration({ className = "", size = 96 }: IllustrationProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 96 96"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Main gauche */}
      <path d="M14 50c0-2 2-4 4-4l8 2v16l-8 2c-2 0-4-2-4-4z" stroke={STROKE} strokeWidth="2" fill="white" strokeLinejoin="round" />
      {/* Doigts main gauche */}
      <path d="M22 44v-8M26 44v-10M30 44v-8" stroke={STROKE} strokeWidth="2" strokeLinecap="round" />
      {/* Main droite */}
      <path d="M82 50c0-2-2-4-4-4l-8 2v16l8 2c2 0 4-2 4-4z" stroke={STROKE} strokeWidth="2" fill="white" strokeLinejoin="round" />
      <path d="M74 44v-8M70 44v-10M66 44v-8" stroke={STROKE} strokeWidth="2" strokeLinecap="round" />
      {/* Engrenage central (adaptation/outil) */}
      <circle cx="48" cy="56" r="14" stroke={ACCENT} strokeWidth="2" fill="white" />
      <circle cx="48" cy="56" r="6" stroke={ACCENT} strokeWidth="2" fill="none" />
      <path
        d="M48 38v6M48 68v6M30 56h6M60 56h6M35 43l4 4M57 65l4 4M35 69l4-4M57 47l4-4"
        stroke={ACCENT}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

// ─── 4. Secrétariat (bureau avec calendrier + téléphone) ────────
export function SecretaryIllustration({ className = "", size = 96 }: IllustrationProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 96 96"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Bureau / écran */}
      <rect x="20" y="22" width="56" height="38" rx="3" stroke={STROKE} strokeWidth="2" fill="white" />
      {/* Pied écran */}
      <path d="M44 60v8h8v-8M36 68h24" stroke={STROKE} strokeWidth="2" strokeLinecap="round" />
      {/* Contenu écran : calendrier */}
      <rect x="26" y="28" width="20" height="20" rx="1" stroke={ACCENT} strokeWidth="1.5" fill="none" />
      <line x1="26" y1="33" x2="46" y2="33" stroke={ACCENT} strokeWidth="1.5" />
      <circle cx="32" cy="40" r="1" fill={ACCENT} />
      <circle cx="38" cy="40" r="1" fill={ACCENT} />
      <circle cx="44" cy="40" r="1" fill={ACCENT} />
      <circle cx="32" cy="45" r="1" fill={ACCENT} />
      {/* Lignes texte écran droite */}
      <line x1="50" y1="30" x2="70" y2="30" stroke={STROKE} strokeWidth="1.5" strokeLinecap="round" />
      <line x1="50" y1="35" x2="68" y2="35" stroke={STROKE} strokeWidth="1.5" strokeLinecap="round" />
      <line x1="50" y1="40" x2="70" y2="40" stroke={STROKE} strokeWidth="1.5" strokeLinecap="round" />
      <line x1="50" y1="45" x2="64" y2="45" stroke={STROKE} strokeWidth="1.5" strokeLinecap="round" />
      <line x1="50" y1="50" x2="70" y2="50" stroke={STROKE} strokeWidth="1.5" strokeLinecap="round" />
      {/* Téléphone */}
      <path d="M14 76c0-3 2-6 5-7l3 6c-1 2-2 3-3 4l3 4c1-1 2-2 4-3l6 3c-1 3-4 5-7 5-6 0-11-5-11-12z" stroke={STROKE} strokeWidth="2" fill="white" strokeLinejoin="round" />
      {/* Tasse de café */}
      <path d="M64 78h12v-6H64zM76 73h2c2 0 2 4 0 4h-2" stroke={STROKE} strokeWidth="2" fill="white" strokeLinejoin="round" />
      <path d="M68 70v-3M72 70v-3" stroke={ACCENT} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

// ─── 5. Patient (silhouette + battement de coeur) ───────────────
export function PatientIllustration({ className = "", size = 96 }: IllustrationProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 96 96"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Tête */}
      <circle cx="48" cy="26" r="10" stroke={STROKE} strokeWidth="2" fill="white" />
      {/* Sourire */}
      <path d="M44 28c1 1.5 2.5 2 4 2s3-0.5 4-2" stroke={STROKE} strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <circle cx="45" cy="24" r="0.8" fill={STROKE} />
      <circle cx="51" cy="24" r="0.8" fill={STROKE} />
      {/* Corps (silhouette épaules + tronc) */}
      <path d="M28 78v-22c0-8 6-14 14-14h12c8 0 14 6 14 14v22" stroke={STROKE} strokeWidth="2" fill="white" strokeLinejoin="round" />
      {/* Battement de cœur sur le torse */}
      <path d="M36 60h6l3-6 4 12 3-6 4 6h6" stroke={ACCENT} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

// ─── 6. Direction & Pilotage (graphique en croissance) ──────────
export function DirectionIllustration({ className = "", size = 96 }: IllustrationProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 96 96"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Cadre */}
      <rect x="14" y="18" width="68" height="58" rx="3" stroke={STROKE} strokeWidth="2" fill="white" />
      {/* Axes */}
      <line x1="22" y1="68" x2="76" y2="68" stroke={STROKE} strokeWidth="1.5" strokeLinecap="round" />
      <line x1="22" y1="28" x2="22" y2="68" stroke={STROKE} strokeWidth="1.5" strokeLinecap="round" />
      {/* Barres */}
      <rect x="28" y="56" width="6" height="12" fill={STROKE} />
      <rect x="38" y="50" width="6" height="18" fill={STROKE} />
      <rect x="48" y="42" width="6" height="26" fill={ACCENT} />
      <rect x="58" y="34" width="6" height="34" fill={ACCENT} />
      <rect x="68" y="28" width="6" height="40" fill={ACCENT} />
      {/* Flèche tendance haussière */}
      <path d="M28 50l10-6 10-2 10-8 10-6" stroke={STROKE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M64 28l4-4 4 4M68 24v8" stroke={STROKE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

// ─── 7. Psychologue (cerveau + bulle de dialogue) ───────────────
export function PsyIllustration({ className = "", size = 96 }: IllustrationProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 96 96"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Profil tête */}
      <path
        d="M22 50c0-14 12-26 26-26 14 0 24 10 24 22v18c0 6-4 12-12 12h-6v8h-12c-2 0-4-2-4-4v-8c0-2-2-2-4-4-4-3-12-9-12-18z"
        stroke={STROKE}
        strokeWidth="2"
        fill="white"
        strokeLinejoin="round"
      />
      {/* Œil */}
      <circle cx="58" cy="42" r="1.2" fill={STROKE} />
      {/* Sourire */}
      <path d="M52 50c1 1 3 2 5 2" stroke={STROKE} strokeWidth="1.5" strokeLinecap="round" fill="none" />
      {/* Cerveau stylisé (replis) */}
      <path
        d="M30 38c0-6 4-10 8-10M30 44c0-4 2-8 6-10M32 50c0-4 2-7 5-9M34 56c0-3 2-6 4-7"
        stroke={ACCENT}
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
      {/* Pensées (3 cercles) */}
      <circle cx="18" cy="20" r="2" stroke={ACCENT} strokeWidth="1.5" fill="white" />
      <circle cx="14" cy="14" r="1.5" stroke={ACCENT} strokeWidth="1.5" fill="white" />
      <circle cx="10" cy="9" r="1" stroke={ACCENT} strokeWidth="1.5" fill="white" />
    </svg>
  );
}

export const ROLE_ILLUSTRATIONS = {
  physio: PhysioIllustration,
  kine: KineIllustration,
  ergo: ErgoIllustration,
  secretary: SecretaryIllustration,
  patient: PatientIllustration,
  direction: DirectionIllustration,
  psy: PsyIllustration,
} as const;

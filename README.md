# École du Dos — HSNE Eupen · Maquette interactive

> Prototype de plateforme intégrée pour la coordination du programme École du Dos
> (Rückenschule) de l'Hôpital Saint-Nicolas Eupen. Protocole KCE/INAMI, 36 séances,
> bilingue FR/DE.

**Auteur** : Philippe Banaszak — Kinésithérapeute HSNE
**Contact** : philippe.banaszak@hospital-eupen.be
**Statut** : Maquette cliquable · données fictives · pas de backend

---

## Objectif de la maquette

Illustrer en 5 minutes de clic la transformation du service École du Dos :
d'un processus papier dispersé à un parcours patient coordonné autour
d'une plateforme unique, accessible aux 5 acteurs du soin.

Cette maquette a pour vocation de **susciter l'intérêt initial** auprès de
la direction et du service IT afin de débloquer les ressources pour le
développement de la v1 en production.

## Écrans démontrés

| Route | Description |
|-------|-------------|
| `/` | Accueil — sélecteur des 5 rôles + features clés |
| `/vision` | **Vision avant/après** · schéma parcours · métriques cibles · feuille de route |
| `/physio` | Dashboard médecin physiothérapeute (prescripteur) — résumé 1 page, scores T0/T1, validation rapport final |
| `/kine` | Dashboard kinésithérapeute — liste patients + KPI |
| `/kine/[id]` | Fiche patient détaillée — 5 onglets (vue d'ensemble, anamnèse, tests, séances, rapport) |
| `/secretary` | Dashboard secrétariat — agenda, contacts, mutuelle, facturation INAMI |
| `/ergo` | Dashboard ergothérapeute — ODI par items, poste de travail, adaptations |
| `/patient` | Interface patient (tablette) — questionnaire NRS + STarT Back interactif bilingue |

## Argumentaire de démo (5 minutes)

1. **`/vision`** — « Voilà le problème aujourd'hui, voilà ce qu'on propose. »
   Schéma avant/après, métriques chiffrées (−75% temps rapport, 100% RGPD).
2. **`/secretary`** (Vue d'ensemble) — « Voici ce que voit la secrétaire en
   arrivant lundi matin. Plus rien ne se perd. »
3. **`/secretary`** (Mutuelle) — La relance automatique Freie Krankenkasse qui
   n'est plus oubliée.
4. **`/physio`** (patient Delcour) — « Le médecin physio voit en 30 secondes
   l'évolution T0 → T1 avant la consultation. Il valide le rapport en 1 clic. »
5. **`/patient`** — Répondre à 2-3 questions pour montrer le questionnaire
   tablette bilingue FR/DE.

## Stack technique

- **Next.js 16** · React 19 · TypeScript
- **TailwindCSS v4** (design tokens inspirés de la fiche v3 — palette navy/clover/amber)
- **Recharts** (courbes EVA, barres ODI)
- **lucide-react** (icônes)
- Données mockées (TypeScript, pas de backend) · 7 patients fictifs

## Démarrer en local

```bash
npm install
npm run dev
# http://localhost:3000
```

Build production :
```bash
npm run build
npm start
```

## Structure

```
src/
  app/
    page.tsx              # accueil
    kine/                 # dashboard kiné + fiche patient
    physio/               # dashboard médecin physio
    secretary/            # dashboard secrétariat
    ergo/                 # dashboard ergothérapeute
    patient/              # interface patient (tablette)
    vision/               # page narrative avant/après
  components/             # UI primitives, KPITile, StatusBadge, charts
  lib/
    app-context.tsx       # langue FR/DE + rôle courant
    i18n.ts               # dictionnaires FR/DE
    mock-data.ts          # patients, scores, agenda, facturation, ODI items
```

## Roadmap (voir `/vision` dans l'app)

8 phases, voir aussi `progress.txt` à la racine pour le journal de
progression du prototype.

## Licence

Prototype interne HSNE · tous droits réservés. Non destiné à un usage clinique.


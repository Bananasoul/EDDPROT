# Clarifications INAMI / facturation EDD HSNE

> Document destiné à clarifier avec Fanny (ergo) / la finance HSNE / la
> facturation interne, **les conventions et tarifs exacts** utilisés pour
> le programme École du Dos. Sans ces réponses, la nouvelle brochure et la
> maquette restent calibrées sur des chiffres 2021 (obsolètes) ou des
> estimations.

---

## ⚠️ Le problème en une phrase

La brochure HSNE FR/DE indique « 7,29 €/séance (VIPO/OMNIO 2,91 €/séance) »
avec date pied de page **25.02.2021**.

Deux scénarios sont possibles en 2026 — et les chiffres patient sont **très différents** :

| Scénario | Cadre INAMI | Patient ordinaire | BIM/VIPO/OMNIO |
|---|---|---|---|
| **A — Article 7 (nomenclature kiné)** | EDD facturé comme prestations kinésithérapeutiques classiques avec accord médecin-conseil | ~7,49 €/séance × 36 ≈ **270 €** | ~2,99 €/séance × 36 ≈ **108 €** |
| **B — Article 22 II (convention rééducation pluridisciplinaire)** | HSNE est centre conventionné INAMI sous convention spécifique « rééducation pluridisciplinaire » | **2,33 €/séance × 36 = 83,88 €** | **0,00 €/séance × 36 = gratuit** |

C'est jusqu'à **3× moins cher** dans le scénario B. Communiquer le mauvais chiffre = mensonge involontaire.

---

## ✅ 5 questions précises à poser à Fanny / Finance HSNE

### Question 1 — Le code de nomenclature exact

**Demande** :
> « Pour une séance EDD facturée, quel est le **code de nomenclature INAMI exact** qui apparaît sur le bordereau de facturation envoyé à la mutuelle ? »

À chercher : code à 6 chiffres (format `5xxxxx`, `7xxxxx` ou autre).

**Indices possibles** :
- `563011`, `564134`, `564156` etc. → nomenclature kiné article 7
- `771xxx` → centre conventionné article 22 II
- Code spécifique à la convention rééducation lombalgie

### Question 2 — Le statut conventionnel HSNE

**Demande** :
> « HSNE est-il enregistré comme **centre de rééducation conventionné** auprès de l'INAMI pour le programme École du Dos ? Si oui, quel est le numéro de la convention ? »

À chercher : numéro à 3-4 chiffres (ex: « R/2003 », « convention rééducation lombalgie chronique »).

### Question 3 — Le bordereau type d'un patient

**Demande** :
> « Peux-tu me partager (anonymisé) un **bordereau de remboursement complet** d'un patient EDD récent : qu'est-ce qui est facturé, à combien, et quel est le ticket modérateur exact ? »

→ Réponse directe la plus efficace : un seul document anonymisé = toutes les questions résolues.

### Question 4 — Suppléments hospitaliers

**Demande** :
> « Le patient EDD paie-t-il en plus du ticket modérateur des **suppléments hospitaliers** (frais administratifs, suppléments d'honoraires, frais de dossier) ? Si oui, combien et sur quelle base légale ? »

À clarifier : les ~7 € de la brochure de 2021 incluent peut-être des suppléments. À savoir si c'est encore le cas.

### Question 5 — Honoraires complets et intervention assurance

**Demande** :
> « Quel est en 2026 :
> - L'honoraire complet INAMI facturé à la mutuelle par séance ?
> - L'intervention exacte de la mutuelle (régime ordinaire vs BIM) ?
> - Le ticket modérateur exact à charge du patient ? »

---

## 📋 Checklist post-réponse — ce qu'on mettra à jour

Une fois ces réponses obtenues :

- [ ] `BROCHURE-v2026.md` : remplacer les `[À CONFIRMER]` par les vrais chiffres
- [ ] `src/lib/mock-data.ts` : remplacer `158,40 €` par le montant exact + indiquer code nomenclature correct
- [ ] PDF générateurs : ajuster le tableau récapitulatif INAMI ([medicalReport.ts](../src/lib/pdf/medicalReport.ts), [inamiReport.ts](../src/lib/pdf/inamiReport.ts))
- [ ] Page secrétariat : actualiser table de facturation avec montants 2026
- [ ] Page direction : ROI mensuel recalculé avec les bons honoraires

---

## 🔗 Sources

- INAMI — [Part personnelle centres de rééducation conventionnés](https://www.inami.fgov.be/fr/themes/soins-de-sante-cout-et-remboursement/maladies/part-personnelle-a-payer-pour-les-soins-dispenses-par-un-centre-qui-a-conclu-une-convention-de-reeducation-fonctionnelle) — confirme 2,33 €/séance régime ordinaire 2026
- INAMI — [Tarifs rééducation fonctionnelle 01/01/2026 (PDF)](https://www.inami.fgov.be/SiteCollectionDocuments/tarif_reeducation_fonctionnelle_20260101.pdf)
- INAMI — [Convention 2025-2026 kinésithérapeutes (indexation +2,72 %)](https://www.inami.fgov.be/fr/professionnels/professionnels-de-la-sante/kinesitherapeutes/convention-2025-2026-pour-les-kinesitherapeutes)
- INAMI — [Interdiction de cumul kiné](https://www.inami.fgov.be/fr/professionnels/professionnels-de-la-sante/kinesitherapeutes/interdiction-de-cumuler-une-prestation-de-kinesitherapie-et-certaines-autres-prestations) (règle anti-cumul même jour)

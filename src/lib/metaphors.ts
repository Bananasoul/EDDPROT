/**
 * Bibliothèque des métaphores pédagogiques HSNE.
 *
 * Extraites des 5 transcripts d'anamnèses Philippe Banaszak.
 * Chaque métaphore est utilisée par Philippe selon la sensibilité du
 * patient et son champ lexical (réponse Q11 : « dans la tête,
 * je les emploie en fonction de la sensibilité du patient »).
 *
 * Cette bibliothèque permet :
 * - Au clinicien : choisir rapidement la bonne métaphore selon le contexte
 * - Au patient : retrouver chez lui les explications reçues en consultation
 * - À l'équipe : partager un langage commun et homogène
 */

export type MetaphorCategory =
  | "biomechanique"     // explication anatomique
  | "neuroscience"      // douleur cerveau-corps
  | "comportement"      // gestion quotidienne
  | "physiologie";      // circulation, oxygène, nutrition

export type Metaphor = {
  id: string;
  emoji: string;
  category: MetaphorCategory;
  titleFr: string;
  titleDe: string;
  /** Phrase d'accroche très courte (~12 mots) */
  hookFr: string;
  hookDe: string;
  /** Explication développée (200-400 mots) */
  storyFr: string;
  storyDe: string;
  /** Cas d'usage : quand l'utiliser */
  useCaseFr: string;
  useCaseDe: string;
  /** Quel public est sensible à cette métaphore */
  audienceTags: string[];
  /** Concept scientifique sous-jacent */
  scientificConcept: string;
};

export const METAPHORS: Metaphor[] = [
  {
    id: "locomotive",
    emoji: "🚂",
    category: "physiologie",
    titleFr: "La locomotive",
    titleDe: "Die Lokomotive",
    hookFr: "Vos épaules sont des sprinters, pas des marathoniens. Bouger les rince.",
    hookDe: "Ihre Schultern sind Sprinter, keine Marathonläufer. Bewegung spült sie durch.",
    storyFr:
      "Vos muscles d'épaules (trapèzes, deltoïdes) sont conçus pour des grands mouvements rapides : envoyer un objet, parer un choc, se balancer. Ce sont des sprinters. " +
      "Quand vous restez crispé devant l'ordinateur ou debout derrière le bar pendant des heures, vous leur demandez de courir un marathon — un job pour lequel ils ne sont pas faits. " +
      "Ils accumulent des déchets de contraction (acide lactique, métabolites) qui leur font mal. " +
      "Le geste « locomotive » : roulez les épaules en grands cercles vers l'arrière puis vers l'avant, 5-10 fois, plusieurs fois par jour. " +
      "Vous rincez les muscles, vous renvoyez du sang frais qui apporte oxygène et glucose, vous chassez les déchets. C'est gratuit, ça prend 30 secondes, et ça fonctionne.",
    storyDe:
      "Ihre Schultermuskeln (Trapez, Deltamuskeln) sind für große, schnelle Bewegungen gemacht: einen Gegenstand werfen, einen Schlag abwehren, sich schwingen. Das sind Sprinter. " +
      "Wenn Sie verkrampft am Computer sitzen oder stundenlang hinter der Theke stehen, bitten Sie sie, einen Marathon zu laufen — einen Job, für den sie nicht gemacht sind. " +
      "Sie sammeln Abfallprodukte der Kontraktion (Milchsäure, Metaboliten), die ihnen wehtun. " +
      "Die « Lokomotiven »-Bewegung: rollen Sie die Schultern in großen Kreisen nach hinten, dann nach vorne, 5-10 Mal, mehrmals täglich. " +
      "Sie spülen die Muskeln, lassen frisches Blut hinein, das Sauerstoff und Glukose bringt, und entsorgen Abfälle. Es ist kostenlos, dauert 30 Sekunden und funktioniert.",
    useCaseFr: "Cervicalgie posturale, tension trapèze, télétravailleurs, métiers debout statiques.",
    useCaseDe: "Posturale Zervikalgie, Trapezius-Spannung, Homeoffice, statisch stehende Berufe.",
    audienceTags: ["sédentaire", "posture", "stress", "tablier"],
    scientificConcept: "Vascularisation musculaire / clearance métaboliques / micro-pauses actives (Pranay et al. 2020)",
  },
  {
    id: "voiture-essence",
    emoji: "🚗",
    category: "neuroscience",
    titleFr: "Le nerf, c'est une voiture qu'il faut nourrir",
    titleDe: "Der Nerv ist ein Auto, das gefüttert werden muss",
    hookFr: "Votre nerf consomme énormément. Sans essence (sang), il râle.",
    hookDe: "Ihr Nerv verbraucht enorm. Ohne Benzin (Blut) beschwert er sich.",
    storyFr:
      "Le nerf est une structure très énergivore. Pour produire son courant (l'influx nerveux), il fait fonctionner en permanence des « petites pompes » dans sa paroi cellulaire qui consomment de l'oxygène et du glucose. " +
      "Comme une voiture, il a besoin d'essence (sang oxygéné) en continu. " +
      "Quand quelque chose perturbe sa circulation — une compression, une inflammation, une mauvaise position — c'est comme couper l'arrivée d'essence : il proteste. " +
      "La protestation, ce sont les picotements, les fourmillements, les décharges électriques sur le trajet du nerf (la « bande » à l'arrière de la jambe pour la sciatique, par exemple). " +
      "Votre rôle : éviter les positions qui déclenchent ces signaux, et donner du mouvement. Le mouvement = pompe à sang pour le nerf.",
    storyDe:
      "Der Nerv ist eine sehr energieintensive Struktur. Um seinen Strom (den Nervenimpuls) zu erzeugen, betreibt er ständig « kleine Pumpen » in seiner Zellwand, die Sauerstoff und Glukose verbrauchen. " +
      "Wie ein Auto braucht er kontinuierlich Benzin (sauerstoffreiches Blut). " +
      "Wenn etwas seine Durchblutung stört — eine Kompression, eine Entzündung, eine schlechte Position — ist es, als würde man die Benzinzufuhr abschneiden: er protestiert. " +
      "Der Protest sind die Kribbeln, das Ameisenkribbeln, die elektrischen Entladungen entlang des Nervenverlaufs. " +
      "Ihre Rolle: vermeiden Sie Positionen, die diese Signale auslösen, und geben Sie Bewegung. Bewegung = Blutpumpe für den Nerv.",
    useCaseFr: "Sciatique, lombo-radiculalgie, paresthésies, syndrome du canal carpien.",
    useCaseDe: "Ischias, Lumboradikulalgie, Parästhesien, Karpaltunnelsyndrom.",
    audienceTags: ["sciatique", "douleur neuropathique", "mécanisme"],
    scientificConcept: "Pompe Na+/K+ ATPase / vascularisation intra-neurale / dynamique du nerf (Shacklock 2005)",
  },
  {
    id: "eponge",
    emoji: "🧽",
    category: "biomechanique",
    titleFr: "Le disque, c'est une éponge",
    titleDe: "Die Bandscheibe ist ein Schwamm",
    hookFr: "Pas d'artères dedans. Il se nourrit en bougeant.",
    hookDe: "Keine Arterien drin. Sie ernährt sich durch Bewegung.",
    storyFr:
      "Le disque intervertébral est unique dans le corps : il n'a quasiment pas d'artères ni de veines à l'intérieur. " +
      "Pourquoi ? Parce qu'il est constamment écrasé entre deux vertèbres : la pression écraserait les vaisseaux. " +
      "Alors comment fait-il pour vivre ? Il fonctionne comme une éponge : quand vous le comprimez (rester assis, soulever une charge), il évacue son liquide. " +
      "Quand vous le relâchez (changer de position, bouger), il aspire à nouveau du liquide qui apporte oxygène et nutriments. " +
      "C'est pour cela que rester immobile longtemps est la pire chose : l'éponge reste pressée, le disque ne se nourrit plus, il s'irrite, il fait mal. " +
      "Le mouvement, c'est sa nutrition. Bouger un peu toutes les 20 minutes pendant une journée assise est plus efficace qu'un seul gros effort.",
    storyDe:
      "Die Bandscheibe ist im Körper einzigartig: sie hat fast keine Arterien oder Venen im Inneren. " +
      "Warum? Weil sie ständig zwischen zwei Wirbeln zusammengedrückt wird: der Druck würde die Gefäße zerquetschen. " +
      "Wie überlebt sie also? Sie funktioniert wie ein Schwamm: wenn Sie sie komprimieren (Sitzen, Last heben), gibt sie ihre Flüssigkeit ab. " +
      "Wenn Sie loslassen (Positionswechsel, Bewegung), saugt sie wieder Flüssigkeit auf, die Sauerstoff und Nährstoffe bringt. " +
      "Deshalb ist langes Stillsitzen das Schlimmste: der Schwamm bleibt gepresst, die Scheibe ernährt sich nicht mehr, sie irritiert, sie schmerzt. " +
      "Bewegung ist ihre Ernährung. Sich alle 20 Minuten ein wenig zu bewegen ist effektiver als eine einzige große Anstrengung.",
    useCaseFr: "Lombalgie chronique, hernie discale, métiers sédentaires, télétravail.",
    useCaseDe: "Chronische Lumbalgie, Bandscheibenvorfall, sitzende Berufe, Homeoffice.",
    audienceTags: ["disque", "lombalgie", "sédentaire", "physiologie"],
    scientificConcept: "Imbibition par diffusion (Urban & McMullin 1988) / hydratation discale nocturne / mobilité segmentaire",
  },
  {
    id: "cable-electrique",
    emoji: "🔌",
    category: "biomechanique",
    titleFr: "Le nerf est un câble électrique avec sa gaine",
    titleDe: "Der Nerv ist ein elektrisches Kabel mit Ummantelung",
    hookFr: "À l'intérieur de la gaine, des artères et des veines circulent autour.",
    hookDe: "In der Hülle laufen Arterien und Venen um den Nerv herum.",
    storyFr:
      "Imaginez un câble électrique : à l'intérieur, le fil de cuivre qui conduit le courant ; autour, l'isolant en plastique. " +
      "Le nerf, c'est pareil : à l'intérieur, des fibres qui conduisent les signaux ; autour, une gaine protectrice (le périnèvre). " +
      "Mais ce qui est unique au nerf : entre les fibres et la gaine, il y a une couche molle où passent des artères et des veines. " +
      "Cette couche est sensible. Si on étire trop le nerf, ces vaisseaux sont compressés et le sang circule moins. " +
      "Si on comprime le nerf à un endroit (hernie discale, posture prolongée), même chose. " +
      "C'est pour cela que parfois changer simplement de position fait disparaître les picotements en quelques minutes : vous avez relâché la pression sur la zone congestionnée. " +
      "Le mouvement répété (étirer/relâcher comme une chaîne nerveuse) agit comme une pompe qui maintient le sang en circulation.",
    storyDe:
      "Stellen Sie sich ein elektrisches Kabel vor: innen der Kupferdraht, der Strom leitet; außen die Plastikisolierung. " +
      "Der Nerv ist gleich: innen die Fasern, die Signale leiten; außen eine schützende Hülle (das Perineurium). " +
      "Aber das Einzigartige am Nerv: zwischen Fasern und Hülle gibt es eine weiche Schicht, durch die Arterien und Venen verlaufen. " +
      "Diese Schicht ist empfindlich. Wenn man den Nerv zu sehr dehnt, werden diese Gefäße komprimiert und das Blut zirkuliert weniger. " +
      "Wenn man den Nerv an einer Stelle komprimiert (Bandscheibenvorfall, anhaltende Position), das Gleiche. " +
      "Manchmal lässt eine einfache Positionsänderung die Kribbeln in wenigen Minuten verschwinden. " +
      "Wiederholte Bewegung (dehnen/entlasten wie eine Nervenkette) wirkt wie eine Pumpe, die das Blut zirkulieren lässt.",
    useCaseFr: "Sciatique post-opératoire, syndromes canalaires, neuropathies positionnelles.",
    useCaseDe: "Postoperative Ischias, Engpasssyndrome, positionelle Neuropathien.",
    audienceTags: ["sciatique", "câble", "anatomie", "visuel"],
    scientificConcept: "Vasa nervorum / mobilité du nerf (neurodynamique, Butler & Gifford 1989) / pression intrafasciculaire",
  },
  {
    id: "sprinter-marathonien",
    emoji: "🏃",
    category: "biomechanique",
    titleFr: "Sprinter ou marathonien ?",
    titleDe: "Sprinter oder Marathonläufer?",
    hookFr: "Vos muscles ont chacun leur job. Demander un marathon à un sprinter = douleur garantie.",
    hookDe: "Jeder Muskel hat seinen Job. Einem Sprinter einen Marathon abverlangen = garantiert Schmerz.",
    storyFr:
      "Dans votre corps, deux types de muscles cohabitent. " +
      "Les muscles profonds (multifides, transverses, scalènes profonds) sont les marathoniens : ils maintiennent la posture toute la journée, sans bouger, à bas régime. Ils sont accrochés directement aux os. " +
      "Les muscles superficiels (trapèzes, biceps, grands dorsaux) sont les sprinters : ils sont conçus pour faire de grands mouvements rapides, intenses, mais courts. " +
      "Quand on est stressé, fatigué ou inattentif, les marathoniens se relâchent et les sprinters prennent le relais — mais ils ne sont pas faits pour tenir. Résultat : ils se contractent, ils saturent, ils font mal. " +
      "Le but de la rééducation : réveiller les marathoniens, leur réapprendre à faire leur travail, et libérer les sprinters. " +
      "C'est pour ça que les exercices visent souvent à activer en douceur les muscles profonds avant tout autre travail.",
    storyDe:
      "In Ihrem Körper koexistieren zwei Muskeltypen. " +
      "Die tiefen Muskeln (Multifidi, Transversi, tiefe Skalenen) sind die Marathonläufer: sie halten den ganzen Tag die Haltung, ohne zu bewegen, im Niedrigregime. Sie sind direkt am Knochen befestigt. " +
      "Die oberflächlichen Muskeln (Trapezius, Bizeps, Latissimus) sind die Sprinter: sie sind für große, schnelle, intensive, aber kurze Bewegungen gemacht. " +
      "Wenn man gestresst, müde oder unaufmerksam ist, entspannen sich die Marathonläufer und die Sprinter übernehmen — aber sie sind nicht dafür gemacht durchzuhalten. Ergebnis: sie kontrahieren, sättigen, schmerzen. " +
      "Ziel der Rehabilitation: die Marathonläufer wecken, ihnen ihre Arbeit wieder beibringen, und die Sprinter entlasten.",
    useCaseFr: "Cervicalgies, lombalgies posturales, expliquer pourquoi le repos seul ne suffit pas.",
    useCaseDe: "Zervikalgien, posturale Lumbalgien, erklären warum Ruhe allein nicht ausreicht.",
    audienceTags: ["sportif", "explication", "muscle", "posture"],
    scientificConcept: "Muscles toniques (type I) vs phasiques (type IIb) / contrôle moteur (Hodges & Richardson 1996)",
  },
  {
    id: "jeu-on-off",
    emoji: "🎮",
    category: "comportement",
    titleFr: "Le jeu : allumer / éteindre les symptômes",
    titleDe: "Das Spiel: Symptome an- / ausschalten",
    hookFr: "Identifier ce qui DÉCLENCHE et ce qui ÉTEINT votre douleur. Vous reprenez le contrôle.",
    hookDe: "Identifizieren, was Ihren Schmerz AUSLÖST und was ihn AUSSCHALTET. Sie übernehmen die Kontrolle.",
    storyFr:
      "Beaucoup de patients vivent leur douleur comme une fatalité : « ça vient quand ça vient, ça part quand ça veut ». " +
      "L'objectif de la rééducation cognitive est de transformer cette passivité en jeu actif. " +
      "Vous devenez observateur de votre corps : à chaque fois qu'un symptôme apparaît, vous notez ce que vous faisiez. À chaque fois qu'il disparaît, vous notez quelle position ou geste a aidé. " +
      "Très vite, des patterns émergent : « ah, après 30 minutes assis ça commence », « si je me lève et je marche 2 minutes ça part », « la position fœtale me soulage la nuit ». " +
      "Plus vous identifiez ces déclencheurs et ces interrupteurs, plus vous reprenez le contrôle. La douleur n'est plus une attaque imprévisible mais une réaction à des conditions modifiables. " +
      "Cela réduit l'anxiété, la catastrophisation, et active votre propre arsenal d'outils.",
    storyDe:
      "Viele Patienten erleben ihren Schmerz als Schicksal: « kommt wann er kommt, geht wann er will ». " +
      "Ziel der kognitiven Rehabilitation ist es, diese Passivität in ein aktives Spiel zu verwandeln. " +
      "Sie werden zum Beobachter Ihres Körpers: jedes Mal, wenn ein Symptom auftritt, notieren Sie was Sie gerade tun. Jedes Mal wenn es verschwindet, notieren Sie welche Position oder Geste geholfen hat. " +
      "Schnell entstehen Muster: « ah, nach 30 Minuten Sitzen beginnt es », « wenn ich aufstehe und 2 Minuten gehe, geht es weg », « die Fötalstellung lindert nachts ». " +
      "Je mehr Sie diese Auslöser und Schalter identifizieren, desto mehr übernehmen Sie die Kontrolle. Schmerz ist kein unvorhersehbarer Angriff mehr, sondern eine Reaktion auf veränderbare Bedingungen.",
    useCaseFr: "Lombalgie chronique, kinésiophobie, catastrophisation, drapeaux jaunes.",
    useCaseDe: "Chronische Lumbalgie, Kinesiophobie, Katastrophisierung, gelbe Flaggen.",
    audienceTags: ["chronique", "psychologique", "auto-gestion", "yellow flags"],
    scientificConcept: "Théorie cognitivo-comportementale (Vlaeyen) / éducation à la neurophysiologie de la douleur (Moseley 2003) / sentiment d'auto-efficacité (Bandura)",
  },
];

export const CATEGORY_META: Record<MetaphorCategory, { fr: string; de: string; color: string; icon: string }> = {
  biomechanique: { fr: "Biomécanique", de: "Biomechanik", color: "#1D2C50", icon: "⚙️" },
  neuroscience: { fr: "Neurosciences", de: "Neurowissenschaften", color: "#1F96B5", icon: "🧠" },
  comportement: { fr: "Comportement & cognitif", de: "Verhalten & Kognition", color: "#1A6B45", icon: "🎯" },
  physiologie: { fr: "Physiologie", de: "Physiologie", color: "#D35400", icon: "❤️" },
};

export function getMetaphor(id: string): Metaphor | undefined {
  return METAPHORS.find((m) => m.id === id);
}

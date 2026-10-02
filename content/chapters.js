/* ============================================================
   CONTENU DES COURS / COURSE CONTENT
   ------------------------------------------------------------
   Pour ajouter une leçon : copie un bloc de leçon dans "lessons"
   d'un chapitre, change l'id, le texte, la grille et les tests.
   Tout texte est bilingue : T('français', 'english').

   Types de leçon :
   - "practice" : l'élève écrit une formule dans une cellule (grille + tests)
   - "quiz"     : questions à choix multiples

   Pour une leçon "practice" :
   - grid     : tableau de lignes (null = cellule vide)
   - target   : cellule où écrire la formule (ex. 'D2')
   - tests    : liste de { set:{adresse:valeur}, expect:valeur }
                (le 1er test = données de départ ; les autres changent
                 les données pour vérifier que la formule est "vivante")
   - mustUse  : fonctions obligatoires { fr:[...], en:[...] }
   - mustRef  : morceaux obligatoires dans la formule (ex. '$E$1')
   - fmt      : formats { B:'eur', E1:'pct' } (colonne ou cellule)
   ============================================================ */

const T = (fr, en) => ({ fr, en });

window.LEVELS = {
  1: T('Les bases', 'The basics'),
  2: T('Logique & références', 'Logic & references'),
  3: T('Recherches & robustesse', 'Lookups & error-proofing'),
  4: T('Analyse', 'Analysis'),
  5: T('Expert', 'Expert'),
};

window.CHAPTERS = [
  /* ---------------------------------------------------------- 1 */
  {
    id: 'tables', track: 'skills', color: 'peach', icon: '📋',
    title: T('Tableaux', 'Tables'),
    tagline: T('Construire un tableau propre et lisible', 'Build clean, readable tables'),
    lessons: [],
    roadmap: [
      T('Saisir et structurer ses données', 'Entering and structuring data'),
      T('Formats : nombres, dates, devises', 'Formats: numbers, dates, currency'),
      T('Tableaux structurés (Ctrl + T)', 'Structured tables (Ctrl + T)'),
      T('Trier, filtrer, figer les volets', 'Sort, filter, freeze panes'),
      T('Mise en forme conditionnelle', 'Conditional formatting'),
      T('Palette pastel & mise en page pro', 'Pastel palette & pro layout'),
    ],
  },

  /* ---------------------------------------------------------- 2 */
  {
    id: 'formulas', track: 'skills', color: 'blue', icon: '🧮',
    title: T('Formules', 'Formulas'),
    tagline: T('Du premier calcul aux recherches intelligentes', 'From your first calculation to smart lookups'),
    roadmap: [
      T('Niveau 4 · SOMMEPROD, SOMME.SI.ENS, dates', 'Level 4 · SUMPRODUCT, SUMIFS, dates'),
      T('Niveau 4 · TEXTE, GAUCHE/DROITE, CONCAT', 'Level 4 · TEXT, LEFT/RIGHT, CONCAT'),
      T('Niveau 5 · RECHERCHEX, LET, FILTRE, TRIER', 'Level 5 · XLOOKUP, LET, FILTER, SORT'),
      T('Niveau 5 · Formules matricielles dynamiques', 'Level 5 · Dynamic array formulas'),
    ],
    lessons: [
      /* ---------- NIVEAU 1 ---------- */
      {
        id: 'f1', type: 'practice', level: 1, xp: 10,
        title: T('Ton premier calcul', 'Your first calculation'),
        intro: T(
          `<p>Dans Excel, une formule <strong>commence toujours par <code>=</code></strong>. Ensuite, tu écris ton calcul avec des <strong>adresses de cellules</strong> (comme <code>B2</code>) au lieu de chiffres tapés à la main.</p>
           <p>Pourquoi ? Parce que si le prix change, ton résultat se met à jour tout seul. C'est ça, la magie ✨</p>
           <p>Les opérateurs : <code>+</code> addition, <code>-</code> soustraction, <code>*</code> multiplication, <code>/</code> division.</p>`,
          `<p>In Excel, a formula <strong>always starts with <code>=</code></strong>. Then you write your calculation using <strong>cell addresses</strong> (like <code>B2</code>) instead of typed numbers.</p>
           <p>Why? If the price changes, your result updates by itself. That's the magic ✨</p>
           <p>Operators: <code>+</code> add, <code>-</code> subtract, <code>*</code> multiply, <code>/</code> divide.</p>`),
        task: T('Dans la cellule rose, calcule le <strong>total</strong> de la bougie Lune : prix × quantité.',
                'In the pink cell, calculate the <strong>total</strong> for the Moon candle: price × quantity.'),
        grid: [
          [T('Produit', 'Product'), T('Prix', 'Price'), T('Quantité', 'Qty'), 'Total'],
          [T('Lune', 'Moon'), 12, 3, null],
          [T('Soleil', 'Sun'), 15, 2, null],
          [T('Étoile', 'Star'), 9, 5, null],
        ],
        fmt: { B: 'eur', D: 'eur' },
        target: 'D2',
        tests: [{ expect: 36 }, { set: { B2: 20, C2: 4 }, expect: 80 }],
        hints: [
          T('Commence par taper le signe <code>=</code>.', 'Start by typing the <code>=</code> sign.'),
          T('Tu dois multiplier le prix (<code>B2</code>) par la quantité (<code>C2</code>). La multiplication s\'écrit <code>*</code>.',
            'You need to multiply the price (<code>B2</code>) by the quantity (<code>C2</code>). Multiplication is written <code>*</code>.'),
          T('Tape exactement : <code>=B2*C2</code>', 'Type exactly: <code>=B2*C2</code>'),
        ],
        solution: T('=B2*C2', '=B2*C2'),
        explain: T(
          `Tu as relié le résultat aux cellules <code>B2</code> et <code>C2</code>. Si tu changes le prix ou la quantité, le total suit automatiquement.`,
          `You linked the result to cells <code>B2</code> and <code>C2</code>. Change the price or quantity and the total follows automatically.`),
        pro: T('Astuce de pro : clique sur la cellule puis double-clique sur le petit carré en bas à droite (poignée de recopie) pour copier la formule vers le bas en une seconde.',
               'Pro tip: click the cell, then double-click the small square at its bottom-right corner (fill handle) to copy the formula down in a second.'),
      },
      {
        id: 'f2', type: 'practice', level: 1, xp: 10,
        title: T('SOMME : additionner une plage', 'SUM: add up a range'),
        intro: T(
          `<p>Additionner cellule par cellule (<code>=B2+B3+B4+B5</code>) devient vite pénible. La fonction <code>SOMME</code> additionne toute une <strong>plage</strong>.</p>
           <p>Une plage s'écrit <code>première:dernière</code>, par exemple <code>B2:B5</code> = toutes les cellules de B2 à B5.</p>
           <p>Forme générale : <code>=SOMME(plage)</code></p>`,
          `<p>Adding cell by cell (<code>=B2+B3+B4+B5</code>) gets painful fast. The <code>SUM</code> function adds a whole <strong>range</strong>.</p>
           <p>A range is written <code>first:last</code>, for example <code>B2:B5</code> = every cell from B2 to B5.</p>
           <p>General form: <code>=SUM(range)</code></p>`),
        task: T('Calcule le <strong>total des ventes</strong> des 4 mois dans la cellule rose.',
                'Calculate the <strong>total sales</strong> of the 4 months in the pink cell.'),
        grid: [
          [T('Mois', 'Month'), T('Ventes', 'Sales')],
          [T('Janvier', 'January'), 1200],
          [T('Février', 'February'), 950],
          [T('Mars', 'March'), 1430],
          [T('Avril', 'April'), 1100],
          [T('Total', 'Total'), null],
        ],
        fmt: { B: 'eur' },
        target: 'B6',
        tests: [{ expect: 4680 }, { set: { B2: 100, B3: 200, B4: 300, B5: 400 }, expect: 1000 }],
        mustUse: { fr: ['SOMME'], en: ['SUM'] },
        hints: [
          T('Utilise la fonction <code>SOMME</code>, suivie d\'une parenthèse.', 'Use the <code>SUM</code> function, followed by an opening parenthesis.'),
          T('La plage va de <code>B2</code> à <code>B5</code> : écris <code>B2:B5</code> avec deux-points.', 'The range goes from <code>B2</code> to <code>B5</code>: write <code>B2:B5</code> with a colon.'),
          T('Tape : <code>=SOMME(B2:B5)</code>', 'Type: <code>=SUM(B2:B5)</code>'),
        ],
        solution: T('=SOMME(B2:B5)', '=SUM(B2:B5)'),
        explain: T(
          `<code>SOMME(B2:B5)</code> additionne toutes les cellules de la plage. Si tu ajoutes une ligne <em>à l'intérieur</em> de la plage, elle est comptée automatiquement.`,
          `<code>SUM(B2:B5)</code> adds every cell in the range. If you insert a row <em>inside</em> the range, it is counted automatically.`),
        pro: T('Astuce de pro : sélectionne la cellule sous une colonne de chiffres et appuie sur Alt + = (Mac : ⌘ + ⇧ + T). Excel écrit la SOMME pour toi !',
               'Pro tip: select the cell under a column of numbers and press Alt + = (Mac: ⌘ + ⇧ + T). Excel writes the SUM for you!'),
      },
      {
        id: 'f3', type: 'practice', level: 1, xp: 10,
        title: T('MOYENNE : la valeur typique', 'AVERAGE: the typical value'),
        intro: T(
          `<p><code>MOYENNE</code> additionne les valeurs puis divise par leur nombre. Elle s'écrit comme <code>SOMME</code> : <code>=MOYENNE(plage)</code>.</p>
           <p>C'est parfait pour répondre à : « Combien je vends <em>en général</em> par mois ? »</p>`,
          `<p><code>AVERAGE</code> adds the values then divides by how many there are. It is written like <code>SUM</code>: <code>=AVERAGE(range)</code>.</p>
           <p>Perfect to answer: "How much do I usually sell <em>per month</em>?"</p>`),
        task: T('Calcule les <strong>ventes moyennes par mois</strong>.', 'Calculate the <strong>average sales per month</strong>.'),
        grid: [
          [T('Mois', 'Month'), T('Ventes', 'Sales')],
          [T('Janvier', 'January'), 1200],
          [T('Février', 'February'), 950],
          [T('Mars', 'March'), 1430],
          [T('Avril', 'April'), 1100],
          [T('Moyenne', 'Average'), null],
        ],
        fmt: { B: 'eur' },
        target: 'B6',
        tests: [{ expect: 1170 }, { set: { B2: 100, B3: 200, B4: 300, B5: 400 }, expect: 250 }],
        mustUse: { fr: ['MOYENNE'], en: ['AVERAGE'] },
        hints: [
          T('Cette fois, la fonction s\'appelle <code>MOYENNE</code>.', 'This time the function is called <code>AVERAGE</code>.'),
          T('Même plage que tout à l\'heure : <code>B2:B5</code>.', 'Same range as before: <code>B2:B5</code>.'),
          T('Tape : <code>=MOYENNE(B2:B5)</code>', 'Type: <code>=AVERAGE(B2:B5)</code>'),
        ],
        solution: T('=MOYENNE(B2:B5)', '=AVERAGE(B2:B5)'),
        explain: T(
          `Excel a calculé (1200 + 950 + 1430 + 1100) ÷ 4. Attention : les cellules <strong>vides</strong> sont ignorées, mais un <code>0</code> est compté !`,
          `Excel computed (1200 + 950 + 1430 + 1100) ÷ 4. Careful: <strong>empty</strong> cells are ignored, but a <code>0</code> is counted!`),
        pro: T('Astuce de pro : sélectionne des cellules avec des chiffres, et regarde en bas de la fenêtre Excel : somme, moyenne et nombre s\'affichent sans aucune formule.',
               'Pro tip: select some cells with numbers and look at the bottom of the Excel window: sum, average and count appear with no formula at all.'),
      },
      {
        id: 'f4', type: 'practice', level: 1, xp: 10,
        title: T('MIN et MAX : les extrêmes', 'MIN and MAX: the extremes'),
        intro: T(
          `<p><code>MAX(plage)</code> donne la plus grande valeur, <code>MIN(plage)</code> la plus petite.</p>
           <p>Tu peux <strong>combiner</strong> des fonctions dans un même calcul : <code>=MAX(…)-MIN(…)</code> donne l'écart entre le meilleur et le pire.</p>`,
          `<p><code>MAX(range)</code> gives the largest value, <code>MIN(range)</code> the smallest.</p>
           <p>You can <strong>combine</strong> functions in one calculation: <code>=MAX(…)-MIN(…)</code> gives the gap between best and worst.</p>`),
        task: T('Calcule l\'<strong>écart</strong> entre le meilleur et le moins bon mois.', 'Calculate the <strong>gap</strong> between the best and the worst month.'),
        grid: [
          [T('Mois', 'Month'), T('Ventes', 'Sales')],
          [T('Janvier', 'January'), 1200],
          [T('Février', 'February'), 950],
          [T('Mars', 'March'), 1430],
          [T('Avril', 'April'), 1100],
          [T('Écart', 'Gap'), null],
        ],
        fmt: { B: 'eur' },
        target: 'B6',
        tests: [{ expect: 480 }, { set: { B2: 100, B3: 200, B4: 300, B5: 400 }, expect: 300 }],
        mustUse: { fr: ['MAX', 'MIN'], en: ['MAX', 'MIN'] },
        hints: [
          T('Il te faut deux fonctions dans la même formule : <code>MAX</code> et <code>MIN</code>.', 'You need two functions in the same formula: <code>MAX</code> and <code>MIN</code>.'),
          T('Écris <code>MAX(B2:B5)</code>, puis un signe moins, puis <code>MIN(B2:B5)</code>.', 'Write <code>MAX(B2:B5)</code>, then a minus sign, then <code>MIN(B2:B5)</code>.'),
          T('Tape : <code>=MAX(B2:B5)-MIN(B2:B5)</code>', 'Type: <code>=MAX(B2:B5)-MIN(B2:B5)</code>'),
        ],
        solution: T('=MAX(B2:B5)-MIN(B2:B5)', '=MAX(B2:B5)-MIN(B2:B5)'),
        explain: T(
          `Tu viens de faire ta première <strong>formule composée</strong> : 1430 − 950 = 480. Excel calcule d'abord ce qui est dans les fonctions, puis la soustraction.`,
          `You just wrote your first <strong>compound formula</strong>: 1430 − 950 = 480. Excel evaluates the functions first, then the subtraction.`),
        pro: T('Astuce de pro : ajoute une mise en forme conditionnelle « 10 % supérieurs » sur la colonne pour colorer automatiquement ton meilleur mois.',
               'Pro tip: add a "Top 10%" conditional format on the column to automatically color your best month.'),
      },

      /* ---------- NIVEAU 2 ---------- */
      {
        id: 'f5', type: 'practice', level: 2, xp: 15,
        title: T('SI : prendre une décision', 'IF: make a decision'),
        intro: T(
          `<p><code>SI</code> permet à Excel de choisir entre deux résultats selon une condition.</p>
           <p><code>=SI(condition ; si_vrai ; si_faux)</code></p>
           <p>Exemple : <code>=SI(B2&gt;=1000 ; "Top" ; "À améliorer")</code>. Opérateurs de comparaison : <code>&gt;</code> <code>&lt;</code> <code>&gt;=</code> <code>&lt;=</code> <code>=</code> <code>&lt;&gt;</code> (différent).</p>`,
          `<p><code>IF</code> lets Excel choose between two results depending on a condition.</p>
           <p><code>=IF(condition, if_true, if_false)</code></p>
           <p>Example: <code>=IF(B2&gt;=1000, "Top", "Improve")</code>. Comparison operators: <code>&gt;</code> <code>&lt;</code> <code>&gt;=</code> <code>&lt;=</code> <code>=</code> <code>&lt;&gt;</code> (not equal).</p>`),
        task: T('Léa gagne un <strong>bonus de 100 €</strong> si ses ventes sont <strong>supérieures ou égales à 1000 €</strong>, sinon 0. Calcule le bonus de Léa.',
                'Léa earns a <strong>€100 bonus</strong> if her sales are <strong>greater than or equal to €1000</strong>, otherwise 0. Calculate Léa\'s bonus.'),
        grid: [
          [T('Vendeur', 'Seller'), T('Ventes', 'Sales'), 'Bonus'],
          ['Léa', 1800, null],
          ['Tom', 950, null],
          ['Sam', 1200, null],
        ],
        fmt: { B: 'eur', C: 'eur' },
        target: 'C2',
        tests: [{ expect: 100 }, { set: { B2: 500 }, expect: 0 }, { set: { B2: 1000 }, expect: 100 }],
        mustUse: { fr: ['SI'], en: ['IF'] },
        hints: [
          T('Tu as besoin de la fonction <code>SI</code> avec 3 parties séparées par des <code>;</code>.', 'You need the <code>IF</code> function with 3 parts separated by <code>,</code>.'),
          T('Condition : <code>B2&gt;=1000</code>. Si c\'est vrai → <code>100</code>. Sinon → <code>0</code>.', 'Condition: <code>B2&gt;=1000</code>. If true → <code>100</code>. Otherwise → <code>0</code>.'),
          T('Tape : <code>=SI(B2&gt;=1000;100;0)</code>', 'Type: <code>=IF(B2&gt;=1000,100,0)</code>'),
        ],
        solution: T('=SI(B2>=1000;100;0)', '=IF(B2>=1000,100,0)'),
        explain: T(
          `La condition <code>B2&gt;=1000</code> est évaluée : vraie → 100, fausse → 0. Nous avons testé 3 cas (dont <strong>exactement 1000</strong>) : c'est le piège classique entre <code>&gt;</code> et <code>&gt;=</code> !`,
          `The condition <code>B2&gt;=1000</code> is evaluated: true → 100, false → 0. We tested 3 cases (including <strong>exactly 1000</strong>): the classic trap between <code>&gt;</code> and <code>&gt;=</code>!`),
        pro: T('Astuce de pro : pour combiner plusieurs conditions, utilise <code>ET(…)</code> et <code>OU(…)</code> à l\'intérieur du SI.',
               'Pro tip: to combine several conditions, use <code>AND(…)</code> and <code>OR(…)</code> inside the IF.'),
      },
      {
        id: 'f6', type: 'practice', level: 2, xp: 15,
        title: T('Références absolues ($)', 'Absolute references ($)'),
        intro: T(
          `<p>Quand tu recopies une formule vers le bas, les références <strong>glissent</strong> : <code>B2</code> devient <code>B3</code>, puis <code>B4</code>… C'est pratique… sauf pour une valeur <em>fixe</em> comme un taux de TVA.</p>
           <p>Pour <strong>verrouiller</strong> une cellule, ajoute des <code>$</code> : <code>$E$1</code> ne bougera jamais, même recopiée.</p>`,
          `<p>When you copy a formula down, references <strong>slide</strong>: <code>B2</code> becomes <code>B3</code>, then <code>B4</code>… Handy… except for a <em>fixed</em> value like a VAT rate.</p>
           <p>To <strong>lock</strong> a cell, add <code>$</code> signs: <code>$E$1</code> will never move, even when copied.</p>`),
        task: T('Calcule le <strong>prix TTC</strong> de la bougie Lune en utilisant le taux de TVA de la cellule <code>E1</code>, <strong>verrouillée avec des $</strong> pour pouvoir recopier la formule.',
                'Calculate the <strong>price including VAT</strong> of the Moon candle using the VAT rate in cell <code>E1</code>, <strong>locked with $</strong> so the formula can be copied down.'),
        grid: [
          [T('Produit', 'Product'), T('Prix HT', 'Price excl.'), T('Prix TTC', 'Price incl.'), T('TVA', 'VAT'), 0.2],
          [T('Lune', 'Moon'), 50, null],
          [T('Soleil', 'Sun'), 80, null],
          [T('Étoile', 'Star'), 30, null],
        ],
        fmt: { B: 'eur', C: 'eur', E1: 'pct' },
        target: 'C2',
        tests: [{ expect: 60 }, { set: { B2: 100, E1: 0.1 }, expect: 110 }],
        mustRef: ['$E$1'],
        hints: [
          T('Prix TTC = prix HT × (1 + taux de TVA).', 'Price incl. VAT = price excl. × (1 + VAT rate).'),
          T('Le prix est en <code>B2</code>, le taux en <code>E1</code>. N\'oublie pas les <code>$</code> autour de E1 : <code>$E$1</code>.', 'The price is in <code>B2</code>, the rate in <code>E1</code>. Don\'t forget the <code>$</code> around E1: <code>$E$1</code>.'),
          T('Tape : <code>=B2*(1+$E$1)</code>', 'Type: <code>=B2*(1+$E$1)</code>'),
        ],
        solution: T('=B2*(1+$E$1)', '=B2*(1+$E$1)'),
        explain: T(
          `Si tu recopies cette formule sur les lignes 3 et 4, <code>B2</code> devient <code>B3</code>, <code>B4</code> (c'est voulu), mais <code>$E$1</code> reste figé sur le taux de TVA. Un seul endroit à modifier si le taux change.`,
          `If you copy this formula to rows 3 and 4, <code>B2</code> becomes <code>B3</code>, <code>B4</code> (intended), but <code>$E$1</code> stays locked on the VAT rate. Only one place to edit if the rate changes.`),
        pro: T('Astuce de pro : pendant que tu écris une référence, appuie sur <strong>F4</strong> (Mac : ⌘ + T) pour faire défiler : <code>E1</code> → <code>$E$1</code> → <code>E$1</code> → <code>$E1</code>.',
               'Pro tip: while typing a reference, press <strong>F4</strong> (Mac: ⌘ + T) to cycle: <code>E1</code> → <code>$E$1</code> → <code>E$1</code> → <code>$E1</code>.'),
      },
      {
        id: 'f7', type: 'practice', level: 2, xp: 15,
        title: T('SOMME.SI : additionner avec un critère', 'SUMIF: add up with a criterion'),
        intro: T(
          `<p><code>SOMME.SI</code> additionne seulement les lignes qui correspondent à un critère.</p>
           <p><code>=SOMME.SI(plage_critère ; critère ; plage_à_additionner)</code></p>
           <p>Exemple : additionner les montants <em>seulement</em> pour la catégorie « Bougie ».</p>`,
          `<p><code>SUMIF</code> adds up only the rows that match a criterion.</p>
           <p><code>=SUMIF(criteria_range, criterion, sum_range)</code></p>
           <p>Example: add up the amounts <em>only</em> for the "Candle" category.</p>`),
        task: T('Calcule le <strong>total des ventes</strong> de la catégorie écrite en <code>D2</code>, avec la cellule rose.',
                'Calculate the <strong>total sales</strong> for the category written in <code>D2</code>, in the pink cell.'),
        grid: [
          [T('Catégorie', 'Category'), T('Montant', 'Amount'), null, T('Catégorie cherchée', 'Looking for'), T('Total', 'Total')],
          [T('Bougie', 'Candle'), 120, null, T('Bougie', 'Candle'), null],
          [T('Savon', 'Soap'), 80],
          [T('Bougie', 'Candle'), 200],
          [T('Savon', 'Soap'), 60],
          [T('Bougie', 'Candle'), 90],
        ],
        fmt: { B: 'eur', E: 'eur' },
        target: 'E2',
        tests: [{ expect: 410 }, { set: { D2: T('Savon', 'Soap') }, expect: 140 }],
        mustUse: { fr: ['SOMME.SI'], en: ['SUMIF'] },
        hints: [
          T('Trois ingrédients : où chercher (<code>A2:A6</code>), quoi chercher (<code>D2</code>), quoi additionner (<code>B2:B6</code>).', 'Three ingredients: where to look (<code>A2:A6</code>), what to look for (<code>D2</code>), what to add up (<code>B2:B6</code>).'),
          T('Dans cet ordre : <code>SOMME.SI(A2:A6;D2;B2:B6)</code>', 'In this order: <code>SUMIF(A2:A6,D2,B2:B6)</code>'),
          T('Tape : <code>=SOMME.SI(A2:A6;D2;B2:B6)</code>', 'Type: <code>=SUMIF(A2:A6,D2,B2:B6)</code>'),
        ],
        solution: T('=SOMME.SI(A2:A6;D2;B2:B6)', '=SUMIF(A2:A6,D2,B2:B6)'),
        explain: T(
          `Excel regarde la colonne A, repère les lignes égales à <code>D2</code>, puis additionne les montants correspondants dans B. Change <code>D2</code> en « Savon » : le total se met à jour ! C'est la base d'un vrai tableau de bord.`,
          `Excel scans column A, finds the rows equal to <code>D2</code>, then adds the matching amounts in B. Change <code>D2</code> to "Soap" and the total updates! This is the building block of a real dashboard.`),
        pro: T('Astuce de pro : pour plusieurs critères à la fois (catégorie ET mois), utilise <code>SOMME.SI.ENS</code>. Tu le verras au niveau 4.',
               'Pro tip: for several criteria at once (category AND month), use <code>SUMIFS</code>. You\'ll see it at level 4.'),
      },
      {
        id: 'f8', type: 'practice', level: 2, xp: 15,
        title: T('NB.SI : compter avec un critère', 'COUNTIF: count with a criterion'),
        intro: T(
          `<p><code>NB.SI</code> compte combien de cellules respectent un critère.</p>
           <p><code>=NB.SI(plage ; critère)</code></p>
           <p>Idéal pour compter les commandes livrées, les clients actifs, les tâches terminées…</p>`,
          `<p><code>COUNTIF</code> counts how many cells meet a criterion.</p>
           <p><code>=COUNTIF(range, criterion)</code></p>
           <p>Ideal for counting delivered orders, active clients, finished tasks…</p>`),
        task: T('Compte <strong>combien de commandes</strong> ont le statut écrit en <code>D2</code>.', 'Count <strong>how many orders</strong> have the status written in <code>D2</code>.'),
        grid: [
          [T('Commande', 'Order'), T('Statut', 'Status'), null, T('Statut cherché', 'Status wanted'), T('Nombre', 'Count')],
          [101, T('Livrée', 'Delivered'), null, T('Livrée', 'Delivered'), null],
          [102, T('En cours', 'Pending')],
          [103, T('Livrée', 'Delivered')],
          [104, T('Annulée', 'Cancelled')],
          [105, T('Livrée', 'Delivered')],
          [106, T('En cours', 'Pending')],
        ],
        target: 'E2',
        tests: [
          { expect: 3 },
          { set: { D2: T('En cours', 'Pending') }, expect: 2 },
          { set: { B3: T('Livrée', 'Delivered') }, expect: 4 },
        ],
        mustUse: { fr: ['NB.SI'], en: ['COUNTIF'] },
        hints: [
          T('La fonction s\'appelle <code>NB.SI</code> et prend 2 éléments : la plage et le critère.', 'The function is <code>COUNTIF</code> and takes 2 items: the range and the criterion.'),
          T('La plage des statuts : <code>B2:B7</code>. Le critère : la cellule <code>D2</code>.', 'The status range: <code>B2:B7</code>. The criterion: cell <code>D2</code>.'),
          T('Tape : <code>=NB.SI(B2:B7;D2)</code>', 'Type: <code>=COUNTIF(B2:B7,D2)</code>'),
        ],
        solution: T('=NB.SI(B2:B7;D2)', '=COUNTIF(B2:B7,D2)'),
        explain: T(
          `Excel parcourt <code>B2:B7</code> et compte chaque cellule égale à <code>D2</code>. Remarque : tes tests ont changé le critère <em>et</em> les données, et ta formule a suivi : elle est « vivante » !`,
          `Excel scans <code>B2:B7</code> and counts each cell equal to <code>D2</code>. Note: our tests changed the criterion <em>and</em> the data, and your formula kept up: it's "alive"!`),
        pro: T('Astuce de pro : tu peux compter avec des conditions : <code>=NB.SI(B2:B7;"&gt;100")</code> compte les valeurs supérieures à 100.',
               'Pro tip: you can count with conditions: <code>=COUNTIF(B2:B7,"&gt;100")</code> counts values greater than 100.'),
      },

      /* ---------- NIVEAU 3 ---------- */
      {
        id: 'f9', type: 'practice', level: 3, xp: 20,
        title: T('SI imbriqués : plusieurs cas', 'Nested IFs: several cases'),
        intro: T(
          `<p>Et s'il y a <strong>plus de deux</strong> résultats possibles ? Tu peux mettre un <code>SI</code> <em>à l'intérieur</em> d'un autre SI, à la place du « sinon » :</p>
           <p><code>=SI(cond1 ; résultat1 ; SI(cond2 ; résultat2 ; résultat3))</code></p>
           <p>Excel teste dans l'ordre et s'arrête au premier cas vrai. Mets donc les conditions du <strong>plus exigeant au moins exigeant</strong>.</p>`,
          `<p>What if there are <strong>more than two</strong> possible results? You can put an <code>IF</code> <em>inside</em> another IF, in place of the "else":</p>
           <p><code>=IF(cond1, result1, IF(cond2, result2, result3))</code></p>
           <p>Excel tests in order and stops at the first true case. So put conditions from <strong>most demanding to least demanding</strong>.</p>`),
        task: T('Attribue une médaille : <strong>« Or »</strong> si les ventes sont ≥ 1000, <strong>« Argent »</strong> si ≥ 500, sinon <strong>« Bronze »</strong>.',
                'Award a medal: <strong>"Gold"</strong> if sales are ≥ 1000, <strong>"Silver"</strong> if ≥ 500, otherwise <strong>"Bronze"</strong>.'),
        grid: [
          [T('Vendeur', 'Seller'), T('Ventes', 'Sales'), T('Médaille', 'Medal')],
          ['Tom', 750, null],
          ['Léa', 1800, null],
          ['Sam', 300, null],
        ],
        fmt: { B: 'eur' },
        target: 'C2',
        tests: [
          { expect: T('Argent', 'Silver') },
          { set: { B2: 1500 }, expect: T('Or', 'Gold') },
          { set: { B2: 200 }, expect: 'Bronze' },
        ],
        mustUse: { fr: ['SI'], en: ['IF'] },
        hints: [
          T('Commence par le cas le plus exigeant : <code>SI(B2&gt;=1000;"Or"; …)</code>', 'Start with the most demanding case: <code>IF(B2&gt;=1000,"Gold", …)</code>'),
          T('À la place de « … », mets un deuxième SI : <code>SI(B2&gt;=500;"Argent";"Bronze")</code>', 'In place of "…", put a second IF: <code>IF(B2&gt;=500,"Silver","Bronze")</code>'),
          T('Tape : <code>=SI(B2&gt;=1000;"Or";SI(B2&gt;=500;"Argent";"Bronze"))</code>', 'Type: <code>=IF(B2&gt;=1000,"Gold",IF(B2&gt;=500,"Silver","Bronze"))</code>'),
        ],
        solution: T('=SI(B2>=1000;"Or";SI(B2>=500;"Argent";"Bronze"))', '=IF(B2>=1000,"Gold",IF(B2>=500,"Silver","Bronze"))'),
        explain: T(
          `Pour 750 : la 1ʳᵉ condition (≥ 1000) est fausse → Excel passe au 2ᵉ SI : ≥ 500 est vrai → « Argent ». Si tu inverses l'ordre des conditions, tout le monde finit « Argent » !`,
          `For 750: the 1st condition (≥ 1000) is false → Excel moves to the 2nd IF: ≥ 500 is true → "Silver". Swap the order of the conditions and everybody ends up "Silver"!`),
        pro: T('Astuce de pro : avec Excel 2019 ou 365, <code>SI.CONDITIONS</code> (IFS) est plus lisible pour beaucoup de cas. Et pour des paliers, une petite table + <code>RECHERCHEV</code> est encore plus propre.',
               'Pro tip: with Excel 2019 or 365, <code>IFS</code> is more readable for many cases. For tiers, a small table + <code>VLOOKUP</code> is even cleaner.'),
      },
      {
        id: 'f10', type: 'practice', level: 3, xp: 20,
        title: T('RECHERCHEV : retrouver une information', 'VLOOKUP: find a piece of information'),
        intro: T(
          `<p><code>RECHERCHEV</code> cherche une valeur dans la <strong>première colonne</strong> d'un tableau, puis renvoie une information située dans la même ligne.</p>
           <p><code>=RECHERCHEV(valeur_cherchée ; tableau ; n°_colonne ; FAUX)</code></p>
           <p><code>FAUX</code> à la fin = correspondance <strong>exacte</strong> (presque toujours ce que tu veux).</p>`,
          `<p><code>VLOOKUP</code> looks for a value in the <strong>first column</strong> of a table, then returns information from the same row.</p>
           <p><code>=VLOOKUP(lookup_value, table, column_number, FALSE)</code></p>
           <p><code>FALSE</code> at the end = <strong>exact</strong> match (almost always what you want).</p>`),
        task: T('Retrouve le <strong>prix</strong> du produit dont le code est écrit en <code>E2</code>.', 'Find the <strong>price</strong> of the product whose code is written in <code>E2</code>.'),
        grid: [
          [T('Code', 'Code'), T('Produit', 'Product'), T('Prix', 'Price'), null, T('Code cherché', 'Code wanted'), T('Prix trouvé', 'Price found')],
          ['B01', T('Bougie Lune', 'Moon Candle'), 12, null, 'S01', null],
          ['B02', T('Bougie Soleil', 'Sun Candle'), 15],
          ['S01', T('Savon Menthe', 'Mint Soap'), 6],
          ['S02', T('Savon Miel', 'Honey Soap'), 7],
        ],
        fmt: { C: 'eur', F: 'eur' },
        target: 'F2',
        tests: [{ expect: 6 }, { set: { E2: 'B02' }, expect: 15 }, { set: { E2: 'S02' }, expect: 7 }],
        mustUse: { fr: ['RECHERCHEV'], en: ['VLOOKUP'] },
        hints: [
          T('Valeur cherchée : <code>E2</code>. Tableau : <code>A2:C5</code> (le code doit être dans sa 1ʳᵉ colonne).', 'Lookup value: <code>E2</code>. Table: <code>A2:C5</code> (the code must be in its 1st column).'),
          T('Le prix est dans la <strong>3ᵉ</strong> colonne du tableau (A, B, C). Termine avec <code>FAUX</code>.', 'The price is in the <strong>3rd</strong> column of the table (A, B, C). Finish with <code>FALSE</code>.'),
          T('Tape : <code>=RECHERCHEV(E2;A2:C5;3;FAUX)</code>', 'Type: <code>=VLOOKUP(E2,A2:C5,3,FALSE)</code>'),
        ],
        solution: T('=RECHERCHEV(E2;A2:C5;3;FAUX)', '=VLOOKUP(E2,A2:C5,3,FALSE)'),
        explain: T(
          `Excel cherche « S01 » dans la colonne A, trouve la ligne 4, et renvoie la 3ᵉ colonne de cette ligne : 6 €. Si tu oublies <code>FAUX</code>, Excel peut renvoyer un mauvais résultat <strong>sans aucune erreur</strong> : c'est le bug silencieux n°1 !`,
          `Excel looks for "S01" in column A, finds row 4, and returns the 3rd column of that row: €6. If you forget <code>FALSE</code>, Excel may return a wrong result <strong>with no error at all</strong>: the #1 silent bug!`),
        pro: T('Limite : RECHERCHEV ne peut chercher que dans la colonne de <em>gauche</em> du tableau. Les deux leçons suivantes te montrent comment dépasser ça.',
               'Limit: VLOOKUP can only search the <em>leftmost</em> column of the table. The next two lessons show how to go beyond that.'),
      },
      {
        id: 'f11', type: 'practice', level: 3, xp: 20,
        title: T('INDEX + EQUIV : le duo flexible', 'INDEX + MATCH: the flexible duo'),
        intro: T(
          `<p>Deux fonctions qui travaillent en équipe :</p>
           <p>• <code>EQUIV(valeur ; plage ; 0)</code> te donne la <strong>position</strong> d'une valeur dans une plage.<br>
              • <code>INDEX(plage ; position)</code> renvoie la valeur située à cette position.</p>
           <p>Ensemble : <code>=INDEX(colonne_résultat ; EQUIV(valeur ; colonne_recherche ; 0))</code>. Elles peuvent chercher dans <strong>n'importe quelle colonne</strong>, même à droite de la réponse.</p>`,
          `<p>Two functions working as a team:</p>
           <p>• <code>MATCH(value, range, 0)</code> gives the <strong>position</strong> of a value in a range.<br>
              • <code>INDEX(range, position)</code> returns the value at that position.</p>
           <p>Together: <code>=INDEX(result_column, MATCH(value, search_column, 0))</code>. They can search <strong>any column</strong>, even to the right of the answer.</p>`),
        task: T('Cette fois on cherche par <strong>nom de produit</strong> (<code>E2</code>) et on veut le prix. Impossible avec RECHERCHEV : utilise INDEX + EQUIV !',
                'This time we search by <strong>product name</strong> (<code>E2</code>) and want the price. Impossible with VLOOKUP: use INDEX + MATCH!'),
        grid: [
          [T('Code', 'Code'), T('Produit', 'Product'), T('Prix', 'Price'), null, T('Produit cherché', 'Product wanted'), T('Prix trouvé', 'Price found')],
          ['B01', T('Bougie Lune', 'Moon Candle'), 12, null, T('Savon Miel', 'Honey Soap'), null],
          ['B02', T('Bougie Soleil', 'Sun Candle'), 15],
          ['S01', T('Savon Menthe', 'Mint Soap'), 6],
          ['S02', T('Savon Miel', 'Honey Soap'), 7],
        ],
        fmt: { C: 'eur', F: 'eur' },
        target: 'F2',
        tests: [
          { expect: 7 },
          { set: { E2: T('Bougie Lune', 'Moon Candle') }, expect: 12 },
          { set: { E2: T('Savon Menthe', 'Mint Soap') }, expect: 6 },
        ],
        mustUse: { fr: ['INDEX', 'EQUIV'], en: ['INDEX', 'MATCH'] },
        hints: [
          T('D\'abord la position : <code>EQUIV(E2;B2:B5;0)</code> cherche le nom dans la colonne des produits.', 'First the position: <code>MATCH(E2,B2:B5,0)</code> looks for the name in the product column.'),
          T('Ensuite <code>INDEX(C2:C5; position)</code> prend le prix à cette position. Mets l\'EQUIV à la place de « position ».', 'Then <code>INDEX(C2:C5, position)</code> takes the price at that position. Put the MATCH in place of "position".'),
          T('Tape : <code>=INDEX(C2:C5;EQUIV(E2;B2:B5;0))</code>', 'Type: <code>=INDEX(C2:C5,MATCH(E2,B2:B5,0))</code>'),
        ],
        solution: T('=INDEX(C2:C5;EQUIV(E2;B2:B5;0))', '=INDEX(C2:C5,MATCH(E2,B2:B5,0))'),
        explain: T(
          `« Savon Miel » est en 4ᵉ position dans <code>B2:B5</code> → <code>EQUIV</code> renvoie 4 → <code>INDEX</code> prend la 4ᵉ valeur de <code>C2:C5</code> : 7 €. Le <code>0</code> demande une correspondance exacte.`,
          `"Honey Soap" is in 4th position in <code>B2:B5</code> → <code>MATCH</code> returns 4 → <code>INDEX</code> takes the 4th value of <code>C2:C5</code>: €7. The <code>0</code> asks for an exact match.`),
        pro: T('Astuce de pro : dans Excel 365 / 2021, <code>RECHERCHEX</code> (XLOOKUP) remplace les deux : <code>=RECHERCHEX(E2;B2:B5;C2:C5)</code>. Tu l\'apprendras au niveau 5, mais comprendre INDEX/EQUIV reste précieux.',
               'Pro tip: in Excel 365 / 2021, <code>XLOOKUP</code> replaces both: <code>=XLOOKUP(E2,B2:B5,C2:C5)</code>. You\'ll learn it at level 5, but understanding INDEX/MATCH is still valuable.'),
      },
      {
        id: 'f12', type: 'practice', level: 3, xp: 20,
        title: T('SIERREUR : zéro erreur moche', 'IFERROR: no ugly errors'),
        intro: T(
          `<p>Quand une recherche ne trouve rien, Excel affiche <code>#N/A</code>, ce qui fait peu professionnel dans un tableau de bord.</p>
           <p><code>SIERREUR</code> entoure une formule et affiche un message de ton choix en cas d'erreur :</p>
           <p><code>=SIERREUR(formule ; valeur_si_erreur)</code></p>`,
          `<p>When a lookup finds nothing, Excel shows <code>#N/A</code>, which looks unprofessional in a dashboard.</p>
           <p><code>IFERROR</code> wraps a formula and shows a message of your choice if it fails:</p>
           <p><code>=IFERROR(formula, value_if_error)</code></p>`),
        task: T('Retrouve le prix du code en <code>E2</code> avec RECHERCHEV, mais affiche <strong>« Introuvable »</strong> si le code n\'existe pas.',
                'Find the price of the code in <code>E2</code> with VLOOKUP, but show <strong>"Not found"</strong> if the code does not exist.'),
        grid: [
          [T('Code', 'Code'), T('Produit', 'Product'), T('Prix', 'Price'), null, T('Code cherché', 'Code wanted'), T('Prix trouvé', 'Price found')],
          ['B01', T('Bougie Lune', 'Moon Candle'), 12, null, 'Z99', null],
          ['B02', T('Bougie Soleil', 'Sun Candle'), 15],
          ['S01', T('Savon Menthe', 'Mint Soap'), 6],
          ['S02', T('Savon Miel', 'Honey Soap'), 7],
        ],
        fmt: { C: 'eur', F: 'eur' },
        target: 'F2',
        tests: [
          { expect: T('Introuvable', 'Not found') },
          { set: { E2: 'B01' }, expect: 12 },
          { set: { E2: 'S02' }, expect: 7 },
        ],
        mustUse: { fr: ['SIERREUR', 'RECHERCHEV'], en: ['IFERROR', 'VLOOKUP'] },
        hints: [
          T('Entoure ta RECHERCHEV avec <code>SIERREUR( … ; "Introuvable")</code>.', 'Wrap your VLOOKUP with <code>IFERROR( … , "Not found")</code>.'),
          T('La RECHERCHEV est la même qu\'avant : <code>RECHERCHEV(E2;A2:C5;3;FAUX)</code>.', 'The VLOOKUP is the same as before: <code>VLOOKUP(E2,A2:C5,3,FALSE)</code>.'),
          T('Tape : <code>=SIERREUR(RECHERCHEV(E2;A2:C5;3;FAUX);"Introuvable")</code>', 'Type: <code>=IFERROR(VLOOKUP(E2,A2:C5,3,FALSE),"Not found")</code>'),
        ],
        solution: T('=SIERREUR(RECHERCHEV(E2;A2:C5;3;FAUX);"Introuvable")', '=IFERROR(VLOOKUP(E2,A2:C5,3,FALSE),"Not found")'),
        explain: T(
          `« Z99 » n'existe pas : la RECHERCHEV produit <code>#N/A</code>, SIERREUR le remplace par « Introuvable ». Quand le code existe, SIERREUR laisse passer le vrai résultat.`,
          `"Z99" doesn't exist: VLOOKUP produces <code>#N/A</code>, IFERROR replaces it with "Not found". When the code exists, IFERROR lets the real result through.`),
        pro: T('Attention : SIERREUR cache <em>toutes</em> les erreurs, même celles qui révèlent une vraie faute dans ta formule. Pour ne masquer que « introuvable », utilise <code>SI.NON.DISP</code> (IFNA).',
               'Careful: IFERROR hides <em>all</em> errors, even ones revealing a real mistake in your formula. To hide only "not found", use <code>IFNA</code>.'),
      },
    ],
  },

  /* ---------------------------------------------------------- 3 */
  {
    id: 'pivot', track: 'skills', color: 'green', icon: '📊',
    title: T('Tableaux croisés', 'Pivot tables'),
    tagline: T('Résumer des milliers de lignes en 3 clics', 'Summarize thousands of rows in 3 clicks'),
    lessons: [],
    roadmap: [
      T('Préparer ses données pour un TCD', 'Preparing your data for a pivot table'),
      T('Créer son premier tableau croisé', 'Creating your first pivot table'),
      T('Lignes, colonnes, valeurs, filtres', 'Rows, columns, values, filters'),
      T('Regrouper par mois, trimestre, année', 'Group by month, quarter, year'),
      T('Champs calculés & % du total', 'Calculated fields & % of total'),
      T('Graphiques et segments (slicers)', 'Charts and slicers'),
    ],
  },

  /* ---------------------------------------------------------- 4 */
  {
    id: 'financials', track: 'finance', color: 'lilac', icon: '💶',
    title: T('États financiers', 'Financial statements'),
    tagline: T('Comprendre les chiffres d\'une entreprise', 'Understand a company\'s numbers'),
    roadmap: [
      T('Ratios : marge, rentabilité, liquidité', 'Ratios: margin, profitability, liquidity'),
      T('Seuil de rentabilité (point mort)', 'Break-even point'),
      T('Construire un compte de résultat dans Excel', 'Build an income statement in Excel'),
      T('Prévisionnel de trésorerie sur 12 mois', '12-month cash-flow forecast'),
    ],
    lessons: [
      {
        id: 'q1', type: 'quiz', level: 1, xp: 8,
        title: T('Le compte de résultat', 'The income statement'),
        intro: T(
          `<p>Le <strong>compte de résultat</strong> raconte l'histoire d'une <em>période</em> (un mois, une année) : combien l'entreprise a <strong>gagné</strong> (produits) et combien elle a <strong>dépensé</strong> (charges).</p>
           <p>À la fin : <code>Produits − Charges = Résultat</code> (bénéfice si positif, perte si négatif).</p>`,
          `<p>The <strong>income statement</strong> tells the story of a <em>period</em> (a month, a year): how much the company <strong>earned</strong> (revenue) and how much it <strong>spent</strong> (expenses).</p>
           <p>At the end: <code>Revenue − Expenses = Net result</code> (profit if positive, loss if negative).</p>`),
        questions: [
          {
            q: T('Que montre le compte de résultat ?', 'What does the income statement show?'),
            options: [
              T('Ce que l\'entreprise possède à une date précise', 'What the company owns on a specific date'),
              T('Les produits et les charges sur une période', 'Revenue and expenses over a period'),
              T('L\'argent réellement présent sur le compte en banque', 'The money actually in the bank account'),
              T('La liste des clients', 'The list of customers'),
            ],
            answer: 1,
            explain: T('Oui : c\'est un film sur une période. Ce que l\'entreprise possède à une date, c\'est le bilan.', 'Yes: it\'s a movie over a period. What the company owns on a date is the balance sheet.'),
          },
          {
            q: T('Chiffre d\'affaires 10 000 € − charges 7 500 € = ?', 'Sales 10,000 − expenses 7,500 = ?'),
            options: [
              T('Un résultat de 2 500 € (bénéfice)', 'A result of 2,500 (profit)'),
              T('Un résultat de 17 500 €', 'A result of 17,500'),
              T('Une perte de 2 500 €', 'A loss of 2,500'),
              T('Impossible à calculer', 'Impossible to calculate'),
            ],
            answer: 0,
            explain: T('10 000 − 7 500 = 2 500. Positif → bénéfice. (Avant impôts, dans cet exemple simplifié.)', '10,000 − 7,500 = 2,500. Positive → profit. (Before tax, in this simplified example.)'),
          },
          {
            q: T('Lequel de ces éléments est une <strong>charge</strong> ?', 'Which of these is an <strong>expense</strong>?'),
            options: [
              T('La vente de bougies', 'Selling candles'),
              T('Le loyer de l\'atelier', 'The workshop rent'),
              T('Le capital apporté par l\'associé', 'Capital brought in by a partner'),
              T('Un emprunt reçu de la banque', 'A loan received from the bank'),
            ],
            answer: 1,
            explain: T('Le loyer est une charge. Un capital ou un emprunt ne sont pas des charges : ils apparaissent au bilan.', 'Rent is an expense. Capital or a loan are not expenses: they appear on the balance sheet.'),
          },
        ],
      },
      {
        id: 'q2', type: 'quiz', level: 1, xp: 8,
        title: T('Le bilan', 'The balance sheet'),
        intro: T(
          `<p>Le <strong>bilan</strong> est une <em>photo</em> de l'entreprise à une date précise. Deux côtés, toujours égaux :</p>
           <p><code>Actif</code> (ce que l'entreprise possède) <code>=</code> <code>Passif</code> (ce qu'elle doit : dettes + capitaux propres).</p>`,
          `<p>The <strong>balance sheet</strong> is a <em>photo</em> of the company on a specific date. Two sides, always equal:</p>
           <p><code>Assets</code> (what the company owns) <code>=</code> <code>Liabilities + Equity</code> (what it owes: debts + owners' funds).</p>`),
        questions: [
          {
            q: T('Le bilan est…', 'The balance sheet is…'),
            options: [
              T('Un film de toute l\'année', 'A movie of the whole year'),
              T('Une photo à une date précise', 'A photo at a specific date'),
              T('La liste des factures', 'The list of invoices'),
              T('Un budget pour l\'an prochain', 'A budget for next year'),
            ],
            answer: 1,
            explain: T('Exactement : il décrit la situation au 31 décembre (par exemple), pas ce qui s\'est passé pendant l\'année.', 'Exactly: it describes the situation on December 31st (for example), not what happened during the year.'),
          },
          {
            q: T('L\'actif est toujours égal à…', 'Assets always equal…'),
            options: [
              T('Les charges de l\'année', 'The year\'s expenses'),
              T('Le chiffre d\'affaires', 'Sales revenue'),
              T('Dettes + capitaux propres', 'Debts + equity'),
              T('Le résultat net', 'Net result'),
            ],
            answer: 2,
            explain: T('C\'est l\'équation fondamentale : tout ce que l\'entreprise possède a été financé par des dettes ou par ses propriétaires.', 'That is the fundamental equation: everything the company owns was financed by debts or by its owners.'),
          },
          {
            q: T('Un stock de bougies prêtes à vendre est…', 'A stock of candles ready to sell is…'),
            options: [
              T('Un actif (l\'entreprise le possède)', 'An asset (the company owns it)'),
              T('Une dette', 'A debt'),
              T('Une charge de la période', 'An expense of the period'),
              T('Du capital', 'Capital'),
            ],
            answer: 0,
            explain: T('Oui, c\'est un actif (actif circulant). Il devient une charge seulement quand il est vendu ou consommé.', 'Yes, it\'s an asset (current asset). It becomes an expense only when sold or used.'),
          },
        ],
      },
      {
        id: 'q3', type: 'quiz', level: 2, xp: 10,
        title: T('Cash ≠ bénéfice', 'Cash ≠ profit'),
        intro: T(
          `<p>Le <strong>tableau de flux de trésorerie</strong> suit l'argent qui <em>entre</em> et <em>sort réellement</em>. Une entreprise peut afficher un bénéfice… et manquer de cash. C'est l'un des pièges les plus importants à comprendre !</p>`,
          `<p>The <strong>cash-flow statement</strong> tracks money that <em>actually comes in</em> and <em>goes out</em>. A company can show a profit… and run out of cash. This is one of the most important traps to understand!</p>`),
        questions: [
          {
            q: T('Pourquoi une entreprise rentable peut-elle manquer de trésorerie ?', 'Why can a profitable company run short of cash?'),
            options: [
              T('Parce que ses clients paient en retard et qu\'elle a acheté du stock d\'avance', 'Because customers pay late and it bought stock in advance'),
              T('C\'est impossible', 'It\'s impossible'),
              T('Parce que le bénéfice est toujours faux', 'Because profit is always wrong'),
              T('Parce qu\'Excel s\'est trompé', 'Because Excel made a mistake'),
            ],
            answer: 0,
            explain: T('La vente est comptée dans le résultat dès qu\'elle est faite, mais l\'argent n\'arrive qu\'au paiement. Pendant ce temps, les dépenses, elles, sortent.', 'The sale counts in the result as soon as it is made, but the money only arrives when paid. Meanwhile, expenses go out.'),
          },
          {
            q: T('Un « encaissement », c\'est…', 'A "cash receipt" is…'),
            options: [
              T('Une facture envoyée', 'An invoice sent'),
              T('De l\'argent qui entre réellement', 'Money that actually comes in'),
              T('Une commande reçue', 'An order received'),
              T('Une promesse de paiement', 'A promise of payment'),
            ],
            answer: 1,
            explain: T('Tant que l\'argent n\'est pas arrivé, ce n\'est pas un encaissement, même si la facture est envoyée.', 'Until the money has arrived, it is not a receipt, even if the invoice has been sent.'),
          },
          {
            q: T('L\'<strong>amortissement</strong> d\'un équipement est…', 'The <strong>depreciation</strong> of equipment is…'),
            options: [
              T('Une sortie d\'argent chaque mois', 'A cash outflow every month'),
              T('Une charge comptable sans sortie d\'argent', 'An accounting expense with no cash outflow'),
              T('Un encaissement', 'A cash receipt'),
              T('Un impôt', 'A tax'),
            ],
            answer: 1,
            explain: T('L\'argent est sorti à l\'achat ; l\'amortissement répartit simplement ce coût dans le compte de résultat sur plusieurs années.', 'The cash went out at purchase; depreciation just spreads that cost across several years in the income statement.'),
          },
        ],
      },
    ],
  },

  /* ---------------------------------------------------------- 5 */
  {
    id: 'tricks', track: 'skills', color: 'pink', icon: '✨',
    title: T('Outils & astuces', 'Tools & tricks'),
    tagline: T('Les raccourcis qui changent la vie', 'The shortcuts that change your life'),
    lessons: [],
    roadmap: [
      T('Raccourcis clavier essentiels', 'Essential keyboard shortcuts'),
      T('Validation de données : listes déroulantes', 'Data validation: dropdown lists'),
      T('Cases à cocher & barres de progression', 'Checkboxes & progress bars'),
      T('Protéger ses feuilles et ses formules', 'Protect your sheets and formulas'),
      T('Importer et nettoyer des données (Power Query)', 'Import & clean data (Power Query)'),
      T('Automatiser avec les macros', 'Automate with macros'),
    ],
  },

  /* ------------------------------------------------- visual: projects */
  {
    id: 'dash', track: 'visual', color: 'pink', icon: '🎀',
    title: T('Outils pastel', 'Pastel tools'),
    tagline: T('Construire de vrais outils beaux et utiles, dans Excel', 'Build real tools that are pretty and useful, in Excel'),
    levelNames: { 2: T('Projets', 'Projects') },
    roadmap: [
      T('Suivi de devis (statuts en couleur)', 'Quote tracker (colour-coded statuses)'),
      T('Suivi des commandes avec graphiques', 'Order tracker with charts'),
      T('Base de données clients', 'Customer database'),
      T('Suivi de stock et inventaire', 'Stock and inventory tracker'),
      T('Tableau de bord comptable annuel', 'Yearly accounting dashboard'),
      T('Suivi de prospection', 'Prospecting tracker'),
    ],
    lessons: [
      {
        id: 'p1', type: 'build', level: 2, xp: 40,
        title: T('Projet : le calculateur de prix', 'Project: the price calculator'),
        intro: T(
          `<p>Tu as vu les formules. Maintenant on construit un <strong>vrai outil dans Excel</strong> : un calculateur qui te dit à quel prix vendre un produit, avec ta marge et la TVA. C'est le même genre d'outil que dans les modèles pastel que tu aimes.</p>
           <p>Trois étapes : <strong>calculer</strong>, <strong>formater</strong>, <strong>décorer</strong>. Ensuite tu déposes ton fichier ici et je le vérifie, case par case.</p>`,
          `<p>You've seen formulas. Now we build a <strong>real tool in Excel</strong>: a calculator that tells you what price to sell a product at, with your margin and VAT. It's the same kind of tool as the pastel templates you like.</p>
           <p>Three stages: <strong>calculate</strong>, <strong>format</strong>, <strong>decorate</strong>. Then you drop your file here and I check it, cell by cell.</p>`),
        files: {
          start: { fr: 'assets/calculateur-prix-depart-fr.xlsx', en: 'assets/calculateur-prix-depart-en.xlsx' },
          model: { fr: 'assets/calculateur-prix-modele-fr.xlsx', en: 'assets/calculateur-prix-modele-en.xlsx' },
        },
        steps: [
          {
            title: T('Ouvre le fichier de départ', 'Open the starter file'),
            body: T(
              `<p>Télécharge le fichier de départ (bouton ci-dessus) et ouvre-le dans <strong>Excel</strong>. Tu y vois six cases de départ (matières, temps, taux horaire, autres coûts, marge, TVA) et <strong>cinq résultats vides</strong> de <code>B10</code> à <code>B14</code>.</p>
               <p>Enregistre-le tout de suite sous un nouveau nom : <kbd>F12</kbd> sous Windows, ou <em>Fichier → Enregistrer une copie</em> sur iPad.</p>`,
              `<p>Download the starter file (button above) and open it in <strong>Excel</strong>. You'll see six starting cells (materials, time, hourly rate, other costs, markup, VAT) and <strong>five empty results</strong> from <code>B10</code> to <code>B14</code>.</p>
               <p>Save it under a new name right away: <kbd>F12</kbd> on Windows, or <em>File → Save a Copy</em> on iPad.</p>`),
          },
          {
            title: T('Calcule le coût de revient (B10)', 'Calculate the cost price (B10)'),
            body: T(
              `<p>Coût de revient = <strong>matières + main-d'œuvre + autres coûts</strong>. La main-d'œuvre, c'est le temps (en minutes) ÷ 60 × le taux horaire.</p>
               <p>Clique sur <code>B10</code> et écris la formule avec des <strong>références de cellules</strong> (<code>B3</code>, <code>B4</code>…), jamais avec des chiffres tapés.</p>
               <details><summary>💡 Indice</summary><p>Matières <code>B3</code>, minutes <code>B4</code>, taux horaire <code>B5</code>, autres coûts <code>B6</code> :<br><code>=B3+B4/60*B5+B6</code></p></details>`,
              `<p>Cost price = <strong>materials + labour + other costs</strong>. Labour is the time (in minutes) ÷ 60 × the hourly rate.</p>
               <p>Click <code>B10</code> and write the formula using <strong>cell references</strong> (<code>B3</code>, <code>B4</code>…), never typed numbers.</p>
               <details><summary>💡 Hint</summary><p>Materials <code>B3</code>, minutes <code>B4</code>, hourly rate <code>B5</code>, other costs <code>B6</code>:<br><code>=B3+B4/60*B5+B6</code></p></details>`),
          },
          {
            title: T('Les prix de vente (B11 et B12)', 'The selling prices (B11 and B12)'),
            body: T(
              `<p><strong>Prix HT</strong> = coût de revient × (1 + taux de marge). <strong>Prix TTC</strong> = prix HT × (1 + TVA).</p>
               <details><summary>💡 Indice</summary><p><code>B11</code> : <code>=B10*(1+B7)</code><br><code>B12</code> : <code>=B11*(1+B8)</code></p></details>`,
              `<p><strong>Price excl. VAT</strong> = cost price × (1 + markup). <strong>Price incl. VAT</strong> = price excl. VAT × (1 + VAT).</p>
               <details><summary>💡 Hint</summary><p><code>B11</code>: <code>=B10*(1+B7)</code><br><code>B12</code>: <code>=B11*(1+B8)</code></p></details>`),
          },
          {
            title: T('Bénéfice et taux de marque (B13 et B14)', 'Profit and margin rate (B13 and B14)'),
            body: T(
              `<p><strong>Bénéfice</strong> = prix HT − coût de revient. <strong>Taux de marque</strong> = bénéfice ÷ prix HT.</p>
               <p>⚠️ Ne confonds pas : le <em>taux de marge</em> se calcule sur le coût, le <em>taux de marque</em> sur le prix de vente. Avec 50 % de marge, tu n'as « que » 33 % de taux de marque !</p>
               <details><summary>💡 Indice</summary><p><code>B13</code> : <code>=B11-B10</code><br><code>B14</code> : <code>=B13/B11</code></p></details>`,
              `<p><strong>Profit</strong> = price excl. VAT − cost price. <strong>Margin rate</strong> = profit ÷ price excl. VAT.</p>
               <p>⚠️ Don't mix them up: the <em>markup</em> is computed on cost, the <em>margin rate</em> on the selling price. With a 50% markup you only get a 33% margin rate!</p>
               <details><summary>💡 Hint</summary><p><code>B13</code>: <code>=B11-B10</code><br><code>B14</code>: <code>=B13/B11</code></p></details>`),
          },
          {
            title: T('Mets les bons formats (€ et %)', 'Apply the right formats (€ and %)'),
            body: T(
              `<p>Sélectionne les cases d'argent (<code>B3</code>, <code>B5</code>, <code>B6</code>, <code>B10</code> à <code>B13</code>) : <kbd>Ctrl</kbd> + clic pour en choisir plusieurs, puis <kbd>Ctrl</kbd> + <kbd>1</kbd> → <em>Nombre → Monétaire → €</em>.</p>
               <p>Pour les pourcentages (<code>B7</code>, <code>B8</code>, <code>B14</code>) : clique sur le bouton <strong>%</strong> du groupe <em>Nombre</em> (onglet <em>Accueil</em>).</p>
               <p><em>iPad :</em> sélectionne les cases, onglet <em>Accueil</em>, puis le menu <em>Format numérique</em>.</p>`,
              `<p>Select the money cells (<code>B3</code>, <code>B5</code>, <code>B6</code>, <code>B10</code> to <code>B13</code>): <kbd>Ctrl</kbd> + click to pick several, then <kbd>Ctrl</kbd> + <kbd>1</kbd> → <em>Number → Currency → €</em>.</p>
               <p>For percentages (<code>B7</code>, <code>B8</code>, <code>B14</code>): click the <strong>%</strong> button in the <em>Number</em> group (<em>Home</em> tab).</p>
               <p><em>iPad:</em> select the cells, <em>Home</em> tab, then the <em>Number format</em> menu.</p>`),
          },
          {
            title: T('Colore le titre et l\'en-tête', 'Colour the title and header'),
            body: T(
              `<p>Mets le titre <code>A1</code> en <strong>gras</strong> (<kbd>Ctrl</kbd> + <kbd>G</kbd>) et plus grand. Puis donne une couleur de fond à l'en-tête <code>A2:B2</code> : <em>Accueil → Couleur de remplissage → Autres couleurs</em>.</p>
               <p>Des pastels qui marchent bien : 🌸 rose <code>F9B9D0</code> · 💙 bleu <code>A8D3F5</code> · 🍑 pêche <code>FBC9A0</code> · 🌿 vert <code>BDE5A6</code> · 💜 lilas <code>D3B6F3</code>. (Onglet <em>Personnalisées</em> : saisis le code, ou choisis une teinte proche.)</p>`,
              `<p>Make the title <code>A1</code> <strong>bold</strong> (<kbd>Ctrl</kbd> + <kbd>B</kbd>) and larger. Then give the header <code>A2:B2</code> a fill colour: <em>Home → Fill Color → More Colors</em>.</p>
               <p>Pastels that work well: 🌸 pink <code>F9B9D0</code> · 💙 blue <code>A8D3F5</code> · 🍑 peach <code>FBC9A0</code> · 🌿 green <code>BDE5A6</code> · 💜 lilac <code>D3B6F3</code>. (<em>Custom</em> tab: type the code, or pick a close shade.)</p>`),
          },
          {
            title: T('Sépare « à remplir » et « calculé » par la couleur', 'Separate "to fill in" from "calculated" with colour'),
            body: T(
              `<p>Règle d'or des tableaux pros : on voit au premier coup d'œil <strong>où on tape</strong> et <strong>ce qui se calcule tout seul</strong>.</p>
               <p>Donne une couleur claire aux cases de départ <code>B3:B8</code> (par ex. pêche <code>FDE9D8</code>) et une <strong>autre</strong> couleur aux résultats <code>B10:B14</code> (par ex. vert <code>E4F5DA</code>).</p>`,
              `<p>Golden rule of pro spreadsheets: you can see at a glance <strong>where to type</strong> and <strong>what calculates itself</strong>.</p>
               <p>Give the starting cells <code>B3:B8</code> a light colour (e.g. peach <code>FDE9D8</code>) and the results <code>B10:B14</code> a <strong>different</strong> colour (e.g. green <code>E4F5DA</code>).</p>`),
          },
          {
            title: T('✨ Bonus : va plus loin', '✨ Bonus: go further'),
            body: T(
              `<p>Facultatif, mais c'est ce qui fait la différence :</p>
               <p>• <strong>Mise en forme conditionnelle</strong> sur <code>B14</code> : une couleur d'alerte si le taux de marque passe sous 20 % (<em>Accueil → Mise en forme conditionnelle</em>).<br>
                  • <strong>Liste déroulante</strong> sur la TVA <code>B8</code> : 5,5 % / 10 % / 20 % (<em>Données → Validation des données → Liste</em>).<br>
                  • <strong>Graphique</strong> : un secteur qui montre la part des matières, de la main-d'œuvre et des autres coûts (<em>Insertion → Graphique</em>).</p>`,
              `<p>Optional, but it's what makes the difference:</p>
               <p>• <strong>Conditional formatting</strong> on <code>B14</code>: an alert colour if the margin rate drops below 20% (<em>Home → Conditional Formatting</em>).<br>
                  • <strong>Dropdown list</strong> on the VAT <code>B8</code>: 5.5% / 10% / 20% (<em>Data → Data Validation → List</em>).<br>
                  • <strong>Chart</strong>: a pie showing the share of materials, labour and other costs (<em>Insert → Chart</em>).</p>`),
          },
        ],
        // cells the learner types into (the starting values); checks re-run her formulas on other values
        inputs: ['B3', 'B4', 'B5', 'B6', 'B7', 'B8'],
        scenarios: [
          { B3: 10, B4: 60, B5: 20, B6: 2, B7: 0.3, B8: 0.1 },
          { B3: 0, B4: 0, B5: 10, B6: 5, B7: 1, B8: 0.2 },
        ],
        model: (i) => {
          const cost = i.B3 + (i.B4 / 60) * i.B5 + i.B6, ht = cost * (1 + i.B7), ttc = ht * (1 + i.B8);
          return { B10: cost, B11: ht, B12: ttc, B13: ht - cost, B14: ht ? (ht - cost) / ht : 0 };
        },
        checks: [
          { id: 'c10', group: 'calc', kind: 'calc', cell: 'B10', label: T('Coût de revient (B10)', 'Cost price (B10)') },
          { id: 'c11', group: 'calc', kind: 'calc', cell: 'B11', label: T('Prix de vente HT (B11)', 'Selling price excl. VAT (B11)') },
          { id: 'c12', group: 'calc', kind: 'calc', cell: 'B12', label: T('Prix de vente TTC (B12)', 'Selling price incl. VAT (B12)') },
          { id: 'c13', group: 'calc', kind: 'calc', cell: 'B13', label: T('Bénéfice (B13)', 'Profit (B13)') },
          { id: 'c14', group: 'calc', kind: 'calc', cell: 'B14', display: 'pct', tol: 0.0005, label: T('Taux de marque (B14)', 'Margin rate (B14)') },
          { id: 'd1', group: 'design', kind: 'format', type: 'euro', cells: ['B3', 'B5', 'B6', 'B10', 'B11', 'B12', 'B13'], label: T('Les montants sont en euros €', 'Amounts are formatted in euros €') },
          { id: 'd2', group: 'design', kind: 'format', type: 'percent', cells: ['B7', 'B8', 'B14'], label: T('Les taux sont en pourcentage %', 'Rates are formatted as percentages %') },
          { id: 'd3', group: 'design', kind: 'bold', cells: ['A1'], label: T('Le titre est en gras', 'The title is bold') },
          { id: 'd4', group: 'design', kind: 'fill', cells: ['A2', 'B2'], label: T('L\'en-tête a une couleur de fond', 'The header has a fill colour') },
          { id: 'd5', group: 'design', kind: 'fillGroups', groups: [['B3', 'B4', 'B5', 'B6', 'B7', 'B8'], ['B10', 'B11', 'B12', 'B13', 'B14']], label: T('Cases de départ et de résultat : deux couleurs différentes', 'Starting and result cells: two different colours') },
          { id: 'b1', group: 'bonus', bonus: true, kind: 'feature', feature: 'conditionalFormatting', label: T('Mise en forme conditionnelle', 'Conditional formatting') },
          { id: 'b2', group: 'bonus', bonus: true, kind: 'feature', feature: 'dataValidation', label: T('Liste déroulante', 'Dropdown list') },
          { id: 'b3', group: 'bonus', bonus: true, kind: 'feature', feature: 'chart', label: T('Graphique', 'Chart') },
        ],
        explain: T(
          `Tu viens de construire un outil qui marche pour <strong>n'importe quel produit</strong> : change les cases de départ et tout se recalcule. C'est exactement ce qu'on vérifie : tes formules utilisent des références, pas des chiffres tapés. Et la couleur n'est pas que de la déco : elle dit à l'utilisateur où il peut taper.`,
          `You just built a tool that works for <strong>any product</strong>: change the starting cells and everything recalculates. That's exactly what we check: your formulas use references, not typed numbers. And colour isn't just decoration: it tells the user where they can type.`),
        pro: T('Astuce de pro : cache le quadrillage (<em>Affichage → Quadrillage</em> décoché) et élargis les colonnes en double-cliquant entre deux lettres : ça fait tout de suite plus « pro ».',
               'Pro tip: hide the gridlines (<em>View → Gridlines</em> unticked) and widen columns by double-clicking between two column letters: it instantly looks more "pro".'),
      },
    ],
  },

  {
    id: 'design', track: 'visual', color: 'lilac', icon: '🎨',
    title: T('Design & mise en forme', 'Design & formatting'),
    tagline: T('Des tableaux qui donnent envie d\'être ouverts', 'Spreadsheets people want to open'),
    lessons: [],
    roadmap: [
      T('Construire sa palette pastel (et la réutiliser)', 'Build your pastel palette (and reuse it)'),
      T('Polices, tailles, alignements', 'Fonts, sizes, alignment'),
      T('Bordures, fusions et espacement', 'Borders, merges and spacing'),
      T('Mise en forme conditionnelle avancée', 'Advanced conditional formatting'),
      T('Graphiques propres et lisibles', 'Clean, readable charts'),
      T('Composer un tableau de bord', 'Composing a dashboard'),
    ],
  },

  /* ---------------------------------------------------------- 6 */
  {
    id: 'word', track: 'visual', color: 'yellow', icon: '📝',
    title: T('Word & rapports', 'Word & reports'),
    tagline: T('Transformer tes chiffres en rapport pro', 'Turn your numbers into a pro report'),
    lessons: [],
    roadmap: [
      T('Styles et mise en page propre', 'Styles and clean layout'),
      T('Tableaux et graphiques Excel dans Word', 'Excel tables and charts in Word'),
      T('Table des matières automatique', 'Automatic table of contents'),
      T('Publipostage : factures et devis en série', 'Mail merge: invoices and quotes in bulk'),
      T('Modèle de rapport financier pastel', 'Pastel financial report template'),
    ],
  },
  /* ------------------------------------------------- finance: projects */
  {
    id: 'finprojects', track: 'finance', color: 'green', icon: '📈',
    title: T('Modèles financiers', 'Financial models'),
    tagline: T('Construire des outils de gestion qui servent vraiment', 'Build management tools that are actually useful'),
    lessons: [],
    roadmap: [
      T('Budget mensuel avec objectifs', 'Monthly budget with targets'),
      T('Seuil de rentabilité (point mort)', 'Break-even point'),
      T('Compte de résultat prévisionnel', 'Forecast income statement'),
      T('Plan de trésorerie sur 12 mois', '12-month cash-flow plan'),
      T('Suivi de TVA et d\'impôts estimés', 'VAT and estimated-tax tracker'),
      T('Tableau de bord comptable (comme sur ton modèle)', 'Accounting dashboard (like your template)'),
    ],
  },
];

window.TRACKS = [
  {
    id: 'skills', icon: '🧠', color: 'blue',
    title: T('Compétences Excel', 'Excel skills'),
    tagline: T('Maîtriser Excel de zéro à expert : tableaux, formules, tableaux croisés, astuces.', 'Master Excel from zero to expert: tables, formulas, pivot tables, tricks.'),
  },
  {
    id: 'visual', icon: '🎀', color: 'pink',
    title: T('Visuel & outils pastel', 'Visuals & pastel tools'),
    tagline: T('Créer de beaux tableaux de bord, comme dans les modèles que tu aimes.', 'Create beautiful dashboards, like the templates you love.'),
  },
  {
    id: 'finance', icon: '💶', color: 'green',
    title: T('Finance', 'Finance'),
    tagline: T('Comprendre les chiffres d\'une entreprise et construire des modèles financiers.', 'Understand a company\'s numbers and build financial models.'),
  },
];

window.BADGES = [
  { id: 'first',   icon: '🌱', title: T('Premier pas', 'First step'),        desc: T('Termine ta 1ʳᵉ leçon', 'Finish your 1st lesson') },
  { id: 'streak3', icon: '🔥', title: T('En feu', 'On fire'),                desc: T('3 jours d\'affilée', '3 days in a row') },
  { id: 'nohint',  icon: '🧠', title: T('Sans filet', 'No safety net'),      desc: T('Réussis une leçon sans indice', 'Solve a lesson with no hint') },
  { id: 'level2',  icon: '🌸', title: T('Niveau 2', 'Level 2'),              desc: T('Termine tout le niveau 1 des formules', 'Finish all level 1 of formulas') },
  { id: 'five',    icon: '💐', title: T('Bouquet', 'Bouquet'),               desc: T('Termine 5 leçons', 'Finish 5 lessons') },
  { id: 'chapter', icon: '🏆', title: T('Chapitre complété', 'Chapter done'), desc: T('Termine un chapitre entier', 'Finish a whole chapter') },
  { id: 'builder', icon: '🛠️', title: T('Bâtisseur', 'Builder'),              desc: T('Réussis ton premier projet dans Excel', 'Complete your first project in Excel') },
  { id: 'bonus',   icon: '✨', title: T('Perfectionniste', 'Perfectionist'),  desc: T('Réussis un bonus de projet', 'Complete a project bonus') },
];

window.GARDEN = [
  { xp: 0,   icon: '🌱', name: T('Graine', 'Seed') },
  { xp: 30,  icon: '🌿', name: T('Pousse', 'Sprout') },
  { xp: 80,  icon: '🌷', name: T('Bourgeon', 'Bud') },
  { xp: 140, icon: '🌸', name: T('Fleur', 'Blossom') },
  { xp: 220, icon: '💐', name: T('Bouquet', 'Bouquet') },
  { xp: 320, icon: '🌺', name: T('Jardin', 'Garden') },
];

/* ============================================================
   MORE LESSONS (loaded after chapters.js)
   Fills the Tables, Pivot, Tools, Design, Pastel-tools and
   Financial-models chapters. Same format as chapters.js.
   ============================================================ */
(() => {
  const chapter = (id) => CHAPTERS.find((c) => c.id === id);
  const addLessons = (id, list) => chapter(id).lessons.push(...list);
  const range = (col, from, to) => Array.from({ length: to - from + 1 }, (_, i) => col + (from + i));

  /* ---------------------------------------------------------------- Tables (skills) */
  chapter('tables').levelNames = { 1: T('Structurer et mettre en forme', 'Structure and format') };
  chapter('tables').roadmap = [
    T('Trier et filtrer sans casser ses données', 'Sort and filter without breaking your data'),
    T('Mise en forme conditionnelle', 'Conditional formatting'),
    T('Listes déroulantes (validation de données)', 'Dropdown lists (data validation)'),
    T('Nettoyer des données importées', 'Cleaning imported data'),
  ];

  addLessons('tables', [
    {
      id: 't1', type: 'quiz', level: 1, xp: 8,
      title: T('Bien structurer ses données', 'Structuring your data well'),
      intro: T(
        `<p>Un bon tableau Excel, c'est d'abord une <strong>bonne structure</strong>. Si tes données sont propres, les formules, les filtres et les tableaux croisés marchent du premier coup. Si elles ne le sont pas, tout devient compliqué.</p>
         <p>La règle de base : <strong>une ligne = un élément</strong> (une vente, un client), <strong>une colonne = une information</strong>, et des <strong>en-têtes</strong> sur la première ligne.</p>`,
        `<p>A good Excel table starts with a <strong>good structure</strong>. If your data is clean, formulas, filters and pivot tables work first time. If not, everything gets complicated.</p>
         <p>The basic rule: <strong>one row = one item</strong> (a sale, a client), <strong>one column = one piece of information</strong>, and <strong>headers</strong> on the first row.</p>`),
      questions: [
        {
          q: T('Quelle est la bonne façon de ranger une liste de ventes ?', 'What is the right way to lay out a list of sales?'),
          options: [
            T('Une ligne par vente, une colonne par information, en-têtes en haut', 'One row per sale, one column per piece of information, headers on top'),
            T('Un petit tableau par mois, posés côte à côte', 'A small table per month, side by side'),
            T('Des lignes vides entre chaque groupe pour aérer', 'Empty rows between each group to give air'),
            T('Un titre fusionné au-dessus de chaque colonne', 'A merged title above each column'),
          ],
          answer: 0,
          explain: T('Une liste « à plat » est lue par tous les outils d\'Excel. Les blocs côte à côte et les lignes vides les perturbent.', 'A flat list is understood by every Excel tool. Side-by-side blocks and empty rows confuse them.'),
        },
        {
          q: T('Pourquoi éviter les cellules fusionnées dans une liste de données ?', 'Why avoid merged cells in a list of data?'),
          options: [
            T('Elles sont moins jolies', 'They are less pretty'),
            T('Elles bloquent le tri, les filtres et les tableaux croisés', 'They block sorting, filters and pivot tables'),
            T('Elles ralentissent l\'ordinateur', 'They slow the computer down'),
            T('Elles ne s\'impriment pas', 'They don\'t print'),
          ],
          answer: 1,
          explain: T('Fusionner est très bien pour un titre décoratif, mais jamais dans la zone de données elle-même.', 'Merging is fine for a decorative title, but never inside the data area itself.'),
        },
        {
          q: T('Que doit contenir une cellule de la colonne « Quantité » ?', 'What should a cell in the "Quantity" column contain?'),
          options: [
            T('« 12 pièces »', '"12 pieces"'),
            T('Le nombre 12, tout simplement', 'Just the number 12'),
            T('« douze »', '"twelve"'),
            T('« 12 » avec une apostrophe devant', '"12" with an apostrophe in front'),
          ],
          answer: 1,
          explain: T('Un nombre doit rester un vrai nombre pour pouvoir être additionné. L\'unité va dans l\'en-tête ou dans le format.', 'A number must stay a real number to be added up. The unit goes in the header or in the format.'),
        },
        {
          q: T('Comment saisir une date ?', 'How should you enter a date?'),
          options: [
            T('En texte libre : « le 6 janvier »', 'As free text: "January 6th"'),
            T('Comme une vraie date que Excel reconnaît (06/01/2025)', 'As a real date Excel recognises (01/06/2025)'),
            T('Avec le jour et le mois dans deux colonnes de texte', 'With day and month in two text columns'),
            T('Peu importe, Excel devine toujours', 'It doesn\'t matter, Excel always guesses'),
          ],
          answer: 1,
          explain: T('Une vraie date peut être triée, filtrée et calculée (ajouter 30 jours, par exemple). Du texte, non.', 'A real date can be sorted, filtered and calculated with (adding 30 days, say). Text can\'t.'),
        },
      ],
    },
    {
      id: 't2', type: 'build', level: 1, xp: 35, requires: ['t1', 'f1'],
      title: T('Projet : une liste de ventes propre', 'Project: a clean sales list'),
      intro: T(
        `<p>On part d'une liste de ventes <strong>brute</strong> et on la transforme en tableau propre, lisible et prêt à être filtré. C'est la base de presque tous les outils que tu construiras ensuite.</p>
         <p>Tu vas <strong>formater</strong> (dates, euros), <strong>calculer</strong> une colonne Total, puis <strong>structurer</strong> (en-tête, filtres, volets figés).</p>`,
        `<p>We start from a <strong>raw</strong> list of sales and turn it into a clean, readable table ready to be filtered. It's the base of almost every tool you'll build next.</p>
         <p>You will <strong>format</strong> (dates, euros), <strong>calculate</strong> a Total column, then <strong>structure</strong> (header, filters, frozen panes).</p>`),
      files: {
        start: { fr: 'assets/liste-ventes-depart-fr.xlsx', en: 'assets/liste-ventes-depart-en.xlsx' },
        model: { fr: 'assets/liste-ventes-modele-fr.xlsx', en: 'assets/liste-ventes-modele-en.xlsx' },
      },
      steps: [
        {
          title: T('Ouvre le fichier de départ', 'Open the starter file'),
          body: T(
            `<p>Tu vois 12 ventes. Bizarre : la colonne <code>A</code> affiche des nombres comme <code>45663</code> au lieu de dates. C'est normal : <strong>Excel stocke une date comme un nombre</strong> (les jours écoulés depuis 1900). Il suffit de lui dire de l'afficher en date.</p>
             <p>Enregistre ton fichier sous un nouveau nom : <kbd>F12</kbd> (Windows) ou <em>Fichier → Enregistrer une copie</em> (iPad).</p>`,
            `<p>You can see 12 sales. Odd: column <code>A</code> shows numbers like <code>45663</code> instead of dates. That's normal: <strong>Excel stores a date as a number</strong> (days since 1900). You just have to tell it to display a date.</p>
             <p>Save your file under a new name: <kbd>F12</kbd> (Windows) or <em>File → Save a Copy</em> (iPad).</p>`),
        },
        {
          title: T('Formate les dates et les euros', 'Format the dates and euros'),
          body: T(
            `<p>Sélectionne <code>A2:A13</code>, puis <kbd>Ctrl</kbd> + <kbd>1</kbd> → <em>Nombre → Date</em>.</p>
             <p>Sélectionne <code>E2:F13</code> (prix et total), puis <kbd>Ctrl</kbd> + <kbd>1</kbd> → <em>Nombre → Monétaire → €</em>. <em>iPad :</em> onglet Accueil, menu Format numérique.</p>`,
            `<p>Select <code>A2:A13</code>, then <kbd>Ctrl</kbd> + <kbd>1</kbd> → <em>Number → Date</em>.</p>
             <p>Select <code>E2:F13</code> (price and total), then <kbd>Ctrl</kbd> + <kbd>1</kbd> → <em>Number → Currency → €</em>. <em>iPad:</em> Home tab, Number format menu.</p>`),
        },
        {
          title: T('Calcule le total de chaque vente', 'Calculate each sale\'s total'),
          body: T(
            `<p>Dans <code>F2</code>, écris <code>=D2*E2</code> (quantité × prix), puis recopie vers le bas jusqu'à <code>F13</code> avec la poignée de recopie (le petit carré en bas à droite de la cellule).</p>
             <p><strong>Fais cette étape avant de créer le tableau (étape 5).</strong> Une fois la liste transformée en tableau, Excel écrit les formules avec des noms de colonnes, que le vérificateur ne sait pas lire.</p>`,
            `<p>In <code>F2</code>, write <code>=D2*E2</code> (quantity × price), then copy it down to <code>F13</code> with the fill handle (the small square at the bottom-right of the cell).</p>
             <p><strong>Do this step before creating the table (step 5).</strong> Once the list is a table, Excel writes formulas with column names, which the checker can't read.</p>`),
        },
        {
          title: T('Mets l\'en-tête en valeur', 'Make the header stand out'),
          body: T(
            `<p>Sélectionne <code>A1:F1</code> : mets-la en <strong>gras</strong> (<kbd>Ctrl</kbd> + <kbd>G</kbd>) et donne-lui une couleur de fond pastel (<em>Accueil → Couleur de remplissage</em>).</p>`,
            `<p>Select <code>A1:F1</code>: make it <strong>bold</strong> (<kbd>Ctrl</kbd> + <kbd>B</kbd>) and give it a pastel fill colour (<em>Home → Fill Color</em>).</p>`),
        },
        {
          title: T('Transforme la liste en tableau', 'Turn the list into a table'),
          body: T(
            `<p>Clique dans la liste, puis <kbd>Ctrl</kbd> + <kbd>T</kbd> et coche <em>« Mon tableau comporte des en-têtes »</em>. Excel ajoute des <strong>boutons de filtre</strong>, des lignes alternées et fait grandir le tableau tout seul quand tu ajoutes une ligne.</p>
             <p>Essaie : clique sur la flèche de <em>Client</em> et ne garde que « Studio Nomade ».</p>`,
            `<p>Click inside the list, then <kbd>Ctrl</kbd> + <kbd>T</kbd> and tick <em>"My table has headers"</em>. Excel adds <strong>filter buttons</strong>, banded rows, and the table grows by itself when you add a row.</p>
             <p>Try it: click the arrow on <em>Client</em> and keep only "Studio Nomade".</p>`),
        },
        {
          title: T('Fige la ligne d\'en-tête', 'Freeze the header row'),
          body: T(
            `<p><em>Affichage → Figer les volets → Figer la ligne supérieure.</em> Quand tu fais défiler une longue liste, les en-têtes restent visibles.</p>`,
            `<p><em>View → Freeze Panes → Freeze Top Row.</em> When you scroll a long list, the headers stay visible.</p>`),
        },
        {
          title: T('Bonus : repère les grosses ventes', 'Bonus: spot the big sales'),
          body: T(
            `<p>Sélectionne <code>F2:F13</code> → <em>Accueil → Mise en forme conditionnelle → Règles de mise en surbrillance → Supérieur à…</em> et choisis 100 €.</p>`,
            `<p>Select <code>F2:F13</code> → <em>Home → Conditional Formatting → Highlight Cells Rules → Greater Than…</em> and choose €100.</p>`),
        },
      ],
      groupTitles: { design: T('Format et structure', 'Format and structure') },
      inputs: [...range('D', 2, 13), ...range('E', 2, 13)],
      // every row changes in every scenario, so a shortcut on a single row can't survive
      scenarios: [3, 7].map((k) => { const o = {}; for (let r = 2; r <= 13; r++) { o['D' + r] = ((r * k) % 9) + 1; o['E' + r] = 5 + ((r * k) % 11) + 0.5; } return o; }),
      model: (i) => { const o = {}; for (let r = 2; r <= 13; r++) o['F' + r] = i['D' + r] * i['E' + r]; return o; },
      checks: [
        { id: 'c1', group: 'calc', kind: 'calc', cells: 'F2:F13', display: 'eur', label: T('Total = quantité × prix (F2:F13)', 'Total = quantity × price (F2:F13)') },
        { id: 'd1', group: 'design', kind: 'format', type: 'date', cells: ['A2:A13'], label: T('Les dates s\'affichent comme des dates', 'Dates display as dates') },
        { id: 'd2', group: 'design', kind: 'format', type: 'euro', cells: ['E2:F13'], label: T('Prix et totaux en euros', 'Prices and totals in euros') },
        { id: 'd3', group: 'design', kind: 'bold', cells: ['A1:F1'], label: T('En-tête en gras', 'Header in bold') },
        { id: 'd4', group: 'design', kind: 'fill', cells: ['A1:F1'], label: T('En-tête coloré', 'Coloured header') },
        { id: 's1', group: 'design', kind: 'feature', feature: 'filter', label: T('Filtres sur la liste (tableau ou filtre)', 'Filters on the list (table or filter)') },
        { id: 's2', group: 'design', kind: 'feature', feature: 'freeze', label: T('Ligne d\'en-tête figée', 'Header row frozen') },
        { id: 'b1', group: 'bonus', bonus: true, kind: 'feature', feature: 'table', label: T('Vrai tableau Excel (Ctrl + T)', 'Real Excel table (Ctrl + T)') },
        { id: 'b2', group: 'bonus', bonus: true, kind: 'feature', feature: 'conditionalFormatting', label: T('Mise en forme conditionnelle', 'Conditional formatting') },
      ],
      explain: T(
        `Tu as appliqué les trois piliers d'un bon tableau : un <strong>format</strong> qui dit ce qu'est chaque nombre, des <strong>formules</strong> qui se recalculent, et une <strong>structure</strong> (en-tête, filtres, volets figés) qui reste utilisable quand la liste grandit.`,
        `You applied the three pillars of a good table: a <strong>format</strong> that says what each number is, <strong>formulas</strong> that recalculate, and a <strong>structure</strong> (header, filters, frozen panes) that stays usable as the list grows.`),
      pro: T('Astuce de pro : dans un vrai tableau (<kbd>Ctrl</kbd> + <kbd>T</kbd>), donne-lui un nom dans <em>Création de tableau → Nom du tableau</em>. Tes formules deviennent lisibles : <code>=SOMME(Ventes[Total])</code>.',
             'Pro tip: in a real table (<kbd>Ctrl</kbd> + <kbd>T</kbd>), give it a name under <em>Table Design → Table Name</em>. Your formulas become readable: <code>=SUM(Sales[Total])</code>.'),
    },
  ]);

  /* ---------------------------------------------------------------- Pivot tables (skills) */
  chapter('pivot').levelNames = { 1: T('Comprendre', 'Understand'), 2: T('Construire', 'Build') };
  chapter('pivot').roadmap = [
    T('Regrouper par mois, trimestre, année', 'Group by month, quarter, year'),
    T('Champs calculés et % du total', 'Calculated fields and % of total'),
    T('Graphiques croisés dynamiques', 'PivotCharts'),
    T('Chronologies et segments combinés', 'Timelines and combined slicers'),
  ];
  addLessons('pivot', [
    {
      id: 'v1', type: 'quiz', level: 1, xp: 8, requires: ['t1'],
      title: T('Comprendre le tableau croisé', 'Understanding the pivot table'),
      intro: T(
        `<p>Un <strong>tableau croisé dynamique</strong> (TCD) résume une longue liste en quelques lignes : « combien j'ai vendu <em>par catégorie</em> ? », « <em>par région</em> ? ». Pas de formule à écrire : tu <strong>glisses des champs</strong> dans quatre zones.</p>
         <p><strong>Lignes</strong> et <strong>Colonnes</strong> : ce que tu regroupes. <strong>Valeurs</strong> : ce que tu calcules (somme, moyenne, nombre…). <strong>Filtres</strong> : ce que tu veux isoler.</p>`,
        `<p>A <strong>pivot table</strong> summarises a long list in a few rows: "how much did I sell <em>per category</em>?", "<em>per region</em>?". No formula to write: you <strong>drag fields</strong> into four areas.</p>
         <p><strong>Rows</strong> and <strong>Columns</strong>: what you group by. <strong>Values</strong>: what you calculate (sum, average, count…). <strong>Filters</strong>: what you want to isolate.</p>`),
      questions: [
        {
          q: T('À quoi sert un tableau croisé dynamique ?', 'What is a pivot table for?'),
          options: [
            T('À dessiner un joli graphique', 'To draw a pretty chart'),
            T('À résumer de grandes listes en choisissant ce qu\'on regroupe et ce qu\'on calcule', 'To summarise big lists by choosing what to group and what to calculate'),
            T('À protéger un classeur par mot de passe', 'To password-protect a workbook'),
            T('À importer des données du web', 'To import data from the web'),
          ],
          answer: 1,
          explain: T('C\'est l\'outil de synthèse d\'Excel : il transforme 5 000 lignes en un tableau de 5 lignes.', 'It\'s Excel\'s summarising tool: it turns 5,000 rows into a 5-row table.'),
        },
        {
          q: T('Dans quelle zone places-tu « Catégorie » pour avoir une ligne par catégorie ?', 'Which area do you put "Category" in to get one row per category?'),
          options: [T('Filtres', 'Filters'), T('Lignes', 'Rows'), T('Valeurs', 'Values'), T('Nulle part : il faut une formule', 'Nowhere: you need a formula')],
          answer: 1,
          explain: T('La zone Lignes crée une ligne pour chaque élément distinct du champ.', 'The Rows area creates one row for each distinct item of the field.'),
        },
        {
          q: T('Où glisses-tu « Montant » pour obtenir le total par catégorie ?', 'Where do you drag "Amount" to get the total per category?'),
          options: [T('Dans Valeurs, en Somme', 'In Values, as a Sum'), T('Dans Lignes', 'In Rows'), T('Dans Filtres', 'In Filters'), T('Dans Colonnes', 'In Columns')],
          answer: 0,
          explain: T('La zone Valeurs calcule. Par défaut, Excel fait une Somme pour les nombres (et un Nombre pour du texte).', 'The Values area calculates. By default Excel does a Sum for numbers (and a Count for text).'),
        },
        {
          q: T('Tu ajoutes des ventes dans la liste d\'origine. Le tableau croisé…', 'You add sales to the original list. The pivot table…'),
          options: [
            T('se met à jour tout seul instantanément', 'updates by itself instantly'),
            T('doit être actualisé (clic droit → Actualiser)', 'needs a refresh (right-click → Refresh)'),
            T('ne peut plus jamais être modifié', 'can never be changed again'),
            T('se supprime', 'deletes itself'),
          ],
          answer: 1,
          explain: T('Un TCD garde une copie des données. Pense à l\'actualiser (ou mets ta liste en tableau avec Ctrl + T pour qu\'elle grandisse).', 'A pivot keeps a copy of the data. Remember to refresh it (or make your list a table with Ctrl + T so it grows).'),
        },
      ],
    },
    {
      id: 'v2', type: 'build', level: 2, xp: 40, requires: ['v1'],
      title: T('Projet : ton premier tableau croisé', 'Project: your first pivot table'),
      intro: T(
        `<p>Tu as 40 ventes. Question : <strong>combien par catégorie de produit ?</strong> Avec des formules ce serait long. Avec un tableau croisé, c'est une minute.</p>
         <p>Tu construis le tableau dans Excel, puis tu déposes ton fichier : je vérifie que les bons champs sont dans les bonnes zones.</p>`,
        `<p>You have 40 sales. The question: <strong>how much per product category?</strong> With formulas that would take a while. With a pivot table, it takes a minute.</p>
         <p>You build the table in Excel, then drop your file: I check the right fields are in the right areas.</p>`),
      files: { start: { fr: 'assets/donnees-tcd-depart-fr.xlsx', en: 'assets/donnees-tcd-depart-en.xlsx' } },
      groupTitles: { calc: T('Ton tableau croisé', 'Your pivot table') },
      steps: [
        {
          title: T('Ouvre le fichier de départ', 'Open the starter file'),
          body: T(`<p>Tu y vois 40 ventes : date, catégorie, produit, région, montant. Enregistre-le sous un nouveau nom.</p>`, `<p>You'll see 40 sales: date, category, product, region, amount. Save it under a new name.</p>`),
        },
        {
          title: T('Insère le tableau croisé', 'Insert the pivot table'),
          body: T(
            `<p>Clique dans la liste, puis <em>Insertion → Tableau croisé dynamique</em> (<em>Insert → PivotTable</em> si ton Excel est en anglais). Choisis <em>Nouvelle feuille de calcul</em> et valide. Une zone « Champs du tableau croisé » apparaît.</p>`,
            `<p>Click inside the list, then <em>Insert → PivotTable</em>. Choose <em>New Worksheet</em> and confirm. A "PivotTable Fields" pane appears.</p>`),
        },
        {
          title: T('Mets la catégorie en lignes', 'Put the category in rows'),
          body: T(
            `<p>Glisse le champ <strong>Catégorie</strong> dans la zone <strong>Lignes</strong>. Tu vois apparaître les catégories.</p>`,
            `<p>Drag the <strong>Category</strong> field into the <strong>Rows</strong> area. The categories appear.</p>`),
        },
        {
          title: T('Calcule la somme des montants', 'Calculate the sum of amounts'),
          body: T(
            `<p>Glisse le champ <strong>Montant</strong> dans la zone <strong>Valeurs</strong>. Excel écrit « Somme de Montant » : tu as ton total par catégorie.</p>
             <p>Mets les montants en euros : clic droit sur un total → <em>Format de nombre</em> → <em>Monétaire</em>.</p>`,
            `<p>Drag the <strong>Amount</strong> field into the <strong>Values</strong> area. Excel writes "Sum of Amount": you have your total per category.</p>
             <p>Put amounts in euros: right-click a total → <em>Number Format</em> → <em>Currency</em>.</p>`),
        },
        {
          title: T('Bonus : croise avec les régions', 'Bonus: cross with regions'),
          body: T(
            `<p>Glisse <strong>Région</strong> dans la zone <strong>Colonnes</strong>. Tu obtiens un tableau à double entrée : catégories en lignes, régions en colonnes.</p>`,
            `<p>Drag <strong>Region</strong> into the <strong>Columns</strong> area. You get a two-way table: categories in rows, regions in columns.</p>`),
        },
        {
          title: T('Bonus : ajoute un segment', 'Bonus: add a slicer'),
          body: T(
            `<p>Clique dans le tableau croisé → <em>Analyse du tableau croisé dynamique → Insérer un segment</em> et choisis <strong>Région</strong>. Tu obtiens des boutons pour filtrer d'un clic.</p>`,
            `<p>Click inside the pivot table → <em>PivotTable Analyze → Insert Slicer</em> and choose <strong>Region</strong>. You get buttons to filter in one click.</p>`),
        },
      ],
      inputs: [],
      model: () => ({}),
      checks: [
        { id: 'p0', group: 'calc', kind: 'pivot', part: 'exists', label: T('Un tableau croisé dynamique existe', 'A pivot table exists') },
        { id: 'p1', group: 'calc', kind: 'pivot', part: 'rows', field: 'B1', label: T('Catégorie dans la zone Lignes', 'Category in the Rows area') },
        { id: 'p2', group: 'calc', kind: 'pivot', part: 'sum', field: 'E1', label: T('Montant dans Valeurs, en Somme', 'Amount in Values, as a Sum') },
        { id: 'b1', group: 'bonus', bonus: true, kind: 'pivot', part: 'cols', label: T('Deuxième dimension en Colonnes', 'Second dimension in Columns') },
        { id: 'b2', group: 'bonus', bonus: true, kind: 'feature', feature: 'slicer', label: T('Segment (slicer)', 'Slicer') },
      ],
      explain: T(
        `Tu viens de faire en quelques clics ce qui aurait demandé une formule <code>SOMME.SI</code> par catégorie. Et si tu changes les champs de zone, le résumé change instantanément : c'est ça, « dynamique ».`,
        `You just did in a few clicks what would have needed one <code>SUMIF</code> per category. And if you move fields between areas, the summary changes instantly: that's what "dynamic" means.`),
      pro: T('Astuce de pro : double-clique sur un total du tableau croisé. Excel ouvre sur une nouvelle feuille <strong>les lignes détaillées</strong> qui composent ce chiffre. Parfait pour vérifier un résultat.',
             'Pro tip: double-click a total in the pivot table. Excel opens <strong>the detailed rows</strong> behind that figure on a new sheet. Perfect for checking a result.'),
    },
  ]);

  /* ---------------------------------------------------------------- Tools & tricks (skills) */
  chapter('tricks').levelNames = { 1: T('Raccourcis', 'Shortcuts'), 2: T('Comprendre les erreurs', 'Understanding errors') };
  chapter('tricks').roadmap = [
    T('Listes déroulantes et validation de données', 'Dropdown lists and data validation'),
    T('Cases à cocher et barres de progression', 'Checkboxes and progress bars'),
    T('Protéger ses feuilles et ses formules', 'Protect your sheets and formulas'),
    T('Importer et nettoyer avec Power Query', 'Import and clean with Power Query'),
    T('Automatiser avec les macros', 'Automate with macros'),
  ];
  addLessons('tricks', [
    {
      id: 'k1', type: 'quiz', level: 1, xp: 10,
      title: T('Les raccourcis qui changent tout', 'The shortcuts that change everything'),
      intro: T(
        `<p>Les gens qui vont vite dans Excel ont rarement les mains sur la souris. Cinq raccourcis (Windows) suffisent pour gagner un temps fou.</p>`,
        `<p>People who are fast in Excel rarely have their hands on the mouse. Five shortcuts (Windows) are enough to save a huge amount of time.</p>`),
      questions: [
        {
          q: T('Quel raccourci annule la dernière action ?', 'Which shortcut undoes the last action?'),
          options: [T('Ctrl + Z', 'Ctrl + Z'), T('Ctrl + Y', 'Ctrl + Y'), T('Ctrl + A', 'Ctrl + A'), T('Échap', 'Esc')],
          answer: 0,
          explain: T('Ctrl + Z annule. Ctrl + Y fait l\'inverse : il rétablit ce que tu viens d\'annuler.', 'Ctrl + Z undoes. Ctrl + Y does the opposite: it redoes what you just undid.'),
        },
        {
          q: T('Comment sélectionner d\'un coup toutes les cellules remplies vers le bas ?', 'How do you select all filled cells downwards in one go?'),
          options: [T('Ctrl + Maj + Flèche bas', 'Ctrl + Shift + Down arrow'), T('Maj + Clic sur la dernière ligne', 'Shift + click on the last row'), T('Ctrl + Entrée', 'Ctrl + Enter'), T('Tab', 'Tab')],
          answer: 0,
          explain: T('Ctrl + Flèche saute au bout des données, et avec Maj tu sélectionnes tout le trajet. Indispensable sur de longues listes.', 'Ctrl + Arrow jumps to the end of the data, and with Shift you select the whole way. Essential on long lists.'),
        },
        {
          q: T('Que fait F4 quand tu écris une référence comme B2 dans une formule ?', 'What does F4 do when you write a reference like B2 in a formula?'),
          options: [
            T('Il ferme le classeur', 'It closes the workbook'),
            T('Il alterne B2, $B$2, B$2 et $B2', 'It cycles B2, $B$2, B$2 and $B2'),
            T('Il recalcule tout', 'It recalculates everything'),
            T('Il supprime la formule', 'It deletes the formula'),
          ],
          answer: 1,
          explain: T('C\'est le raccourci pour verrouiller une cellule avec les $, comme tu l\'as fait pour la TVA.', 'It\'s the shortcut to lock a cell with $, as you did for VAT.'),
        },
        {
          q: T('Ctrl + 1 ouvre…', 'Ctrl + 1 opens…'),
          options: [T('La fenêtre Format de cellule', 'The Format Cells window'), T('Une nouvelle feuille', 'A new sheet'), T('L\'aide d\'Excel', 'Excel help'), T('Le gestionnaire de noms', 'The Name Manager')],
          answer: 0,
          explain: T('C\'est le raccourci le plus utile pour la mise en forme : nombres, dates, alignement, bordures, remplissage.', 'It\'s the most useful formatting shortcut: numbers, dates, alignment, borders, fill.'),
        },
        {
          q: T('Alt + = sert à…', 'Alt + = is used to…'),
          options: [T('Insérer automatiquement une somme', 'Automatically insert a sum'), T('Mettre en gras', 'Make text bold'), T('Figer les volets', 'Freeze panes'), T('Insérer un graphique', 'Insert a chart')],
          answer: 0,
          explain: T('Place-toi sous une colonne de chiffres et appuie sur Alt + = : Excel écrit =SOMME(…) pour toi.', 'Stand under a column of numbers and press Alt + =: Excel writes =SUM(…) for you.'),
        },
      ],
    },
    {
      id: 'k2', type: 'quiz', level: 2, xp: 10, requires: ['f12'],
      title: T('Décoder les erreurs Excel', 'Decoding Excel errors'),
      intro: T(
        `<p>Une erreur n'est pas une catastrophe : c'est Excel qui te dit <strong>ce qui ne va pas</strong>. Chaque message a un sens précis, et une fois que tu le connais, tu corriges en 10 secondes.</p>`,
        `<p>An error isn't a disaster: it's Excel telling you <strong>what's wrong</strong>. Each message has a precise meaning, and once you know it, you fix it in 10 seconds.</p>`),
      questions: [
        {
          q: T('<code>#DIV/0!</code> signifie…', '<code>#DIV/0!</code> means…'),
          options: [T('Tu divises par zéro (ou par une cellule vide)', 'You divide by zero (or by an empty cell)'), T('La cellule est trop étroite', 'The cell is too narrow'), T('La fonction n\'existe pas', 'The function doesn\'t exist'), T('Le fichier est corrompu', 'The file is corrupted')],
          answer: 0,
          explain: T('Vérifie le diviseur. Pour masquer l\'erreur proprement : <code>=SIERREUR(A1/B1;0)</code>.', 'Check the divisor. To hide the error cleanly: <code>=IFERROR(A1/B1,0)</code>.'),
        },
        {
          q: T('Ta RECHERCHEV renvoie <code>#N/A</code>. Pourquoi ?', 'Your VLOOKUP returns <code>#N/A</code>. Why?'),
          options: [T('La valeur cherchée est introuvable dans la première colonne', 'The lookup value isn\'t found in the first column'), T('Le tableau est trop grand', 'The table is too big'), T('Tu as oublié le signe =', 'You forgot the = sign'), T('La cellule est verrouillée', 'The cell is locked')],
          answer: 0,
          explain: T('Souvent : une faute de frappe, un espace en trop, ou un nombre stocké comme du texte.', 'Often: a typo, an extra space, or a number stored as text.'),
        },
        {
          q: T('<code>#REF!</code> apparaît après avoir supprimé une colonne. Pourquoi ?', '<code>#REF!</code> appears after deleting a column. Why?'),
          options: [T('La formule pointait vers une cellule qui n\'existe plus', 'The formula pointed to a cell that no longer exists'), T('Excel a besoin d\'être redémarré', 'Excel needs a restart'), T('Il faut un format monétaire', 'It needs a currency format'), T('Le fichier est trop lourd', 'The file is too heavy')],
          answer: 0,
          explain: T('Annule avec Ctrl + Z, ou réécris la formule vers les bonnes cellules.', 'Undo with Ctrl + Z, or rewrite the formula to the right cells.'),
        },
        {
          q: T('Une cellule affiche <code>########</code>. Que faire ?', 'A cell shows <code>########</code>. What should you do?'),
          options: [T('Élargir la colonne : ce n\'est pas une vraie erreur', 'Widen the column: it isn\'t a real error'), T('Supprimer la formule', 'Delete the formula'), T('Réinstaller Excel', 'Reinstall Excel'), T('Changer de feuille', 'Change sheets')],
          answer: 0,
          explain: T('Le nombre est trop large pour la colonne. Double-clique entre deux lettres de colonnes pour ajuster automatiquement.', 'The number is too wide for the column. Double-click between two column letters to auto-fit.'),
        },
        {
          q: T('<code>#NOM?</code> (ou <code>#NAME?</code>) indique le plus souvent…', '<code>#NAME?</code> most often means…'),
          options: [T('Un nom de fonction mal écrit, ou un texte sans guillemets', 'A misspelled function name, or text without quotes'), T('Un fichier trop ancien', 'A file that\'s too old'), T('Un doublon', 'A duplicate'), T('Une date impossible', 'An impossible date')],
          answer: 0,
          explain: T('Relis l\'orthographe de la fonction et mets tes textes entre guillemets <code>"…"</code>.', 'Re-read the function spelling and put your text between quotes <code>"…"</code>.'),
        },
      ],
    },
  ]);

  /* ---------------------------------------------------------------- Design (visual) */
  chapter('design').levelNames = { 1: T('Les règles qui changent tout', 'The rules that change everything') };
  chapter('design').roadmap = [
    T('Réutiliser sa palette avec les thèmes Excel', 'Reuse your palette with Excel themes'),
    T('Choisir ses polices et ses tailles', 'Choosing fonts and sizes'),
    T('Graphiques propres et lisibles', 'Clean, readable charts'),
    T('Composer un tableau de bord', 'Composing a dashboard'),
  ];
  addLessons('design', [
    {
      id: 'd1', type: 'quiz', level: 1, xp: 8,
      title: T('Palette et lisibilité', 'Palette and readability'),
      intro: T(
        `<p>Un beau tableau n'est pas un tableau chargé : c'est un tableau où l'œil sait <strong>où aller</strong>. Quelques règles simples font 90 % du travail.</p>`,
        `<p>A beautiful spreadsheet isn't a busy one: it's one where the eye knows <strong>where to go</strong>. A few simple rules do 90% of the work.</p>`),
      questions: [
        {
          q: T('Combien de couleurs principales pour un tableau lisible ?', 'How many main colours for a readable spreadsheet?'),
          options: [T('2 ou 3, avec des variantes claires', '2 or 3, with light variants'), T('Autant que possible', 'As many as possible'), T('Une seule, sans variantes', 'Just one, no variants'), T('Une couleur par colonne', 'One colour per column')],
          answer: 0,
          explain: T('Peu de couleurs, bien réparties : c\'est ce qui donne l\'air « pro » aux modèles pastel.', 'Few colours, well distributed: that\'s what makes pastel templates look "pro".'),
        },
        {
          q: T('Comment signaler les cases où l\'utilisateur doit taper ?', 'How do you signal the cells where the user should type?'),
          options: [T('Une couleur claire constante, réservée aux saisies', 'A constant light colour reserved for inputs'), T('Du texte rouge clignotant', 'Flashing red text'), T('Rien : il devinera', 'Nothing: they\'ll guess'), T('Des bordures épaisses partout', 'Thick borders everywhere')],
          answer: 0,
          explain: T('Toujours la même couleur pour « à remplir » : l\'utilisateur apprend le code en 5 secondes.', 'Always the same colour for "to fill in": the user learns the code in 5 seconds.'),
        },
        {
          q: T('Comment aligner des nombres dans une colonne ?', 'How should numbers in a column be aligned?'),
          options: [T('À droite, avec le même format partout', 'Right-aligned, with the same format throughout'), T('Centrés', 'Centred'), T('À gauche', 'Left-aligned'), T('Peu importe', 'It doesn\'t matter')],
          answer: 0,
          explain: T('Alignés à droite, les unités sont sous les unités et les dizaines sous les dizaines : on compare d\'un coup d\'œil.', 'Right-aligned, units sit under units and tens under tens: you compare at a glance.'),
        },
        {
          q: T('Quel texte sur un fond pastel ?', 'Which text on a pastel background?'),
          options: [T('Un texte foncé, pour un bon contraste', 'Dark text, for good contrast'), T('Un texte pastel plus foncé d\'un ton', 'Pastel text one shade darker'), T('Du blanc', 'White'), T('Du jaune', 'Yellow')],
          answer: 0,
          explain: T('Un fond clair demande un texte foncé. Du blanc sur du pastel se lit très mal, surtout à l\'écran d\'un iPad en plein jour.', 'A light background needs dark text. White on pastel is hard to read, especially on an iPad screen in daylight.'),
        },
      ],
    },
  ]);

  /* ---------------------------------------------------------------- Pastel tools: project 2 */
  chapter('dash').roadmap = [
    T('Suivi des commandes avec graphiques', 'Order tracker with charts'),
    T('Base de données clients', 'Customer database'),
    T('Suivi de stock et inventaire', 'Stock and inventory tracker'),
    T('Tableau de bord comptable annuel', 'Yearly accounting dashboard'),
    T('Suivi de prospection', 'Prospecting tracker'),
  ];
  const Q = (col) => range(col, 8, 17);
  addLessons('dash', [
    {
      id: 'p2', type: 'build', level: 2, xp: 50, requires: ['p1', 'f5', 'f7', 'f8'],
      title: T('Projet : le suivi de devis', 'Project: the quote tracker'),
      intro: T(
        `<p>Le deuxième outil : un <strong>suivi de devis</strong>, comme dans les modèles pastel que tu aimes. Il calcule les montants et les dates limites, compte les devis par statut, donne le taux de conversion, et colore chaque statut tout seul.</p>
         <p>C'est le projet où tout se combine : formules de comptage (<code>NB.SI</code>, <code>SOMME.SI</code>), dates, liste déroulante et mise en forme conditionnelle.</p>`,
        `<p>The second tool: a <strong>quote tracker</strong>, like the pastel templates you love. It calculates amounts and deadlines, counts quotes by status, gives the conversion rate, and colours each status by itself.</p>
         <p>This is the project where it all combines: counting formulas (<code>COUNTIF</code>, <code>SUMIF</code>), dates, a dropdown list and conditional formatting.</p>`),
      files: {
        start: { fr: 'assets/suivi-devis-depart-fr.xlsx', en: 'assets/suivi-devis-depart-en.xlsx' },
        model: { fr: 'assets/suivi-devis-modele-fr.xlsx', en: 'assets/suivi-devis-modele-en.xlsx' },
      },
      steps: [
        {
          title: T('Ouvre le fichier de départ', 'Open the starter file'),
          body: T(
            `<p>Tu y vois 10 devis (lignes 8 à 17), un bloc de résumé en haut (<code>B3:B6</code> et <code>E3:E5</code>, vides), les colonnes <code>G</code> et <code>H</code> à remplir, et une petite liste de statuts en <code>K8:K10</code>. Enregistre-le sous un nouveau nom.</p>`,
            `<p>You'll see 10 quotes (rows 8 to 17), a summary block at the top (<code>B3:B6</code> and <code>E3:E5</code>, empty), columns <code>G</code> and <code>H</code> to fill in, and a small list of statuses in <code>K8:K10</code>. Save it under a new name.</p>`),
        },
        {
          title: T('Calcule le montant TTC (G8:G17)', 'Calculate the amount incl. VAT (G8:G17)'),
          body: T(
            `<p>Dans <code>G8</code> : montant HT × (1 + TVA). Puis recopie jusqu'à <code>G17</code> avec la poignée de recopie.</p>
             <details><summary>Indice</summary><p><code>=E8*(1+F8)</code></p></details>`,
            `<p>In <code>G8</code>: amount excl. VAT × (1 + VAT). Then copy down to <code>G17</code> with the fill handle.</p>
             <details><summary>Hint</summary><p><code>=E8*(1+F8)</code></p></details>`),
        },
        {
          title: T('Calcule la date limite (H8:H17)', 'Calculate the deadline (H8:H17)'),
          body: T(
            `<p>Date limite = date du devis + validité en jours. Comme Excel stocke les dates en nombres, une simple addition suffit.</p>
             <p>Si tu vois un nombre comme <code>45695</code>, c'est normal : applique le format date (étape 5).</p>
             <details><summary>Indice</summary><p><code>=C8+D8</code></p></details>`,
            `<p>Deadline = quote date + validity in days. Since Excel stores dates as numbers, a simple addition is enough.</p>
             <p>If you see a number like <code>45695</code>, that's normal: apply the date format (step 5).</p>
             <details><summary>Hint</summary><p><code>=C8+D8</code></p></details>`),
        },
        {
          title: T('Remplis le résumé', 'Fill in the summary'),
          body: T(
            `<p>Compte les devis et additionne les montants. Astuce : le critère de <code>NB.SI</code> peut être <strong>une cellule</strong> (<code>K8</code>, <code>K9</code>, <code>K10</code>) plutôt qu'un mot tapé.</p>
             <p>• <code>B3</code> : nombre de devis · <code>B4</code> : acceptés · <code>B5</code> : en attente · <code>B6</code> : refusés<br>
                • <code>E3</code> : taux de conversion (acceptés ÷ total) · <code>E4</code> : total TTC · <code>E5</code> : total TTC des devis acceptés</p>
             <details><summary>Indice</summary><p><code>B3</code> : <code>=NBVAL(A8:A17)</code><br><code>B4</code> : <code>=NB.SI(I8:I17;K8)</code><br><code>E3</code> : <code>=B4/B3</code><br><code>E4</code> : <code>=SOMME(G8:G17)</code><br><code>E5</code> : <code>=SOMME.SI(I8:I17;K8;G8:G17)</code></p></details>`,
            `<p>Count the quotes and add up the amounts. Tip: the <code>COUNTIF</code> criterion can be <strong>a cell</strong> (<code>K8</code>, <code>K9</code>, <code>K10</code>) rather than a typed word.</p>
             <p>• <code>B3</code>: number of quotes · <code>B4</code>: accepted · <code>B5</code>: pending · <code>B6</code>: declined<br>
                • <code>E3</code>: conversion rate (accepted ÷ total) · <code>E4</code>: total incl. VAT · <code>E5</code>: total incl. VAT of accepted quotes</p>
             <details><summary>Hint</summary><p><code>B3</code>: <code>=COUNTA(A8:A17)</code><br><code>B4</code>: <code>=COUNTIF(I8:I17,K8)</code><br><code>E3</code>: <code>=B4/B3</code><br><code>E4</code>: <code>=SUM(G8:G17)</code><br><code>E5</code>: <code>=SUMIF(I8:I17,K8,G8:G17)</code></p></details>`),
        },
        {
          title: T('Mets les bons formats', 'Apply the right formats'),
          body: T(
            `<p>Euros : <code>E8:E17</code>, <code>G8:G17</code>, <code>E4</code>, <code>E5</code>. Pourcentages : <code>F8:F17</code> et <code>E3</code>. Dates : <code>C8:C17</code> et <code>H8:H17</code>.</p>
             <p><kbd>Ctrl</kbd> + clic pour sélectionner plusieurs zones, puis <kbd>Ctrl</kbd> + <kbd>1</kbd>.</p>`,
            `<p>Euros: <code>E8:E17</code>, <code>G8:G17</code>, <code>E4</code>, <code>E5</code>. Percentages: <code>F8:F17</code> and <code>E3</code>. Dates: <code>C8:C17</code> and <code>H8:H17</code>.</p>
             <p><kbd>Ctrl</kbd> + click to select several areas, then <kbd>Ctrl</kbd> + <kbd>1</kbd>.</p>`),
        },
        {
          title: T('Crée la liste déroulante des statuts', 'Create the status dropdown'),
          body: T(
            `<p>Sélectionne <code>I8:I17</code> → <em>Données → Validation des données</em> → Autoriser : <em>Liste</em> → Source : <code>=$K$8:$K$10</code>. Chaque case du statut propose maintenant les trois choix.</p>`,
            `<p>Select <code>I8:I17</code> → <em>Data → Data Validation</em> → Allow: <em>List</em> → Source: <code>=$K$8:$K$10</code>. Each status cell now offers the three choices.</p>`),
        },
        {
          title: T('Colore les statuts automatiquement', 'Colour the statuses automatically'),
          body: T(
            `<p>Sélectionne <code>I8:I17</code> → <em>Accueil → Mise en forme conditionnelle → Nouvelle règle → Utiliser une formule</em>. Crée <strong>trois règles</strong> :</p>
             <p>• <code>=$I8=$K$8</code> → remplissage vert (accepté)<br>
                • <code>=$I8=$K$9</code> → remplissage jaune (en attente)<br>
                • <code>=$I8=$K$10</code> → remplissage rose (refusé)</p>
             <p>Change un statut avec la liste déroulante : la couleur suit toute seule.</p>`,
            `<p>Select <code>I8:I17</code> → <em>Home → Conditional Formatting → New Rule → Use a formula</em>. Create <strong>three rules</strong>:</p>
             <p>• <code>=$I8=$K$8</code> → green fill (accepted)<br>
                • <code>=$I8=$K$9</code> → yellow fill (pending)<br>
                • <code>=$I8=$K$10</code> → pink fill (declined)</p>
             <p>Change a status with the dropdown: the colour follows by itself.</p>`),
        },
        {
          title: T('Soigne le design', 'Polish the design'),
          body: T(
            `<p>Titre <code>A1</code> en gras et plus grand. En-tête <code>A7:I7</code> avec une couleur de fond. Pense à la règle d'or : les cases de résumé dans une couleur, les cases à remplir dans une autre.</p>`,
            `<p>Title <code>A1</code> bold and larger. Header <code>A7:I7</code> with a fill colour. Remember the golden rule: summary cells in one colour, cells to fill in in another.</p>`),
        },
        {
          title: T('Bonus : va plus loin', 'Bonus: go further'),
          body: T(
            `<p>• <strong>Fige les volets</strong> sous l'en-tête : clique en <code>A8</code> puis <em>Affichage → Figer les volets</em>.<br>
                • Ajoute un <strong>graphique</strong> en secteurs des statuts (<code>K8:K10</code> et <code>B4:B6</code>).</p>`,
            `<p>• <strong>Freeze the panes</strong> under the header: click <code>A8</code> then <em>View → Freeze Panes</em>.<br>
                • Add a <strong>pie chart</strong> of statuses (<code>K8:K10</code> and <code>B4:B6</code>).</p>`),
        },
      ],
      inputs: [...Q('A'), ...Q('C'), ...Q('D'), ...Q('E'), ...Q('F'), ...Q('I'), 'K8', 'K9', 'K10'],
      required: [...Q('C'), ...Q('D'), ...Q('E'), ...Q('F'), 'K8', 'K9', 'K10'],
      // every row changes in every scenario; '@K8' means "the word in K8 of her file" (works in FR and EN)
      scenarios: [3, 7].map((k) => {
        const o = {};
        for (let r = 8; r <= 17; r++) {
          o['C' + r] = 45000 + r * k; o['D' + r] = 10 + ((r * k) % 50); o['E' + r] = 50 * r + k * 13;
          o['F' + r] = (r + k) % 3 === 0 ? 0.055 : (r + k) % 2 ? 0.1 : 0.2;
          o['I' + r] = '@K' + (8 + ((r + k) % 3));
        }
        return o;
      }),
      model: (i) => {
        const o = {}; let n = 0, acc = 0, pen = 0, dec = 0, tot = 0, accTot = 0;
        for (let r = 8; r <= 17; r++) {
          const g = i['E' + r] * (1 + i['F' + r]);
          o['G' + r] = g; o['H' + r] = i['C' + r] + i['D' + r];
          if (i['A' + r] !== null && i['A' + r] !== undefined) n++;
          const st = i['I' + r];
          if (st === i.K8) { acc++; accTot += g; } else if (st === i.K9) pen++; else if (st === i.K10) dec++;
          tot += g;
        }
        Object.assign(o, { B3: n, B4: acc, B5: pen, B6: dec, E3: n ? acc / n : 0, E4: tot, E5: accTot });
        return o;
      },
      checks: [
        { id: 'c1', group: 'calc', kind: 'calc', cells: 'G8:G17', display: 'eur', label: T('Montant TTC (G8:G17)', 'Amount incl. VAT (G8:G17)') },
        { id: 'c2', group: 'calc', kind: 'calc', cells: 'H8:H17', display: 'num', label: T('Date limite (H8:H17)', 'Deadline (H8:H17)') },
        { id: 'c3', group: 'calc', kind: 'calc', cells: 'B3:B6', display: 'num', label: T('Nombres de devis par statut (B3:B6)', 'Number of quotes by status (B3:B6)') },
        { id: 'c4', group: 'calc', kind: 'calc', cells: 'E3', display: 'pct', tol: 0.0005, label: T('Taux de conversion (E3)', 'Conversion rate (E3)') },
        { id: 'c5', group: 'calc', kind: 'calc', cells: 'E4:E5', display: 'eur', label: T('Montants totaux (E4:E5)', 'Total amounts (E4:E5)') },
        { id: 'd1', group: 'design', kind: 'format', type: 'euro', cells: ['E8:E17', 'G8:G17', 'E4', 'E5'], label: T('Montants en euros', 'Amounts in euros') },
        { id: 'd2', group: 'design', kind: 'format', type: 'percent', cells: ['F8:F17', 'E3'], label: T('Taux en pourcentage', 'Rates as percentages') },
        { id: 'd3', group: 'design', kind: 'format', type: 'date', cells: ['C8:C17', 'H8:H17'], label: T('Dates au format date', 'Dates in date format') },
        { id: 'd4', group: 'design', kind: 'bold', cells: ['A1'], label: T('Titre en gras', 'Title in bold') },
        { id: 'd5', group: 'design', kind: 'fill', cells: ['A7:I7'], label: T('En-tête coloré', 'Coloured header') },
        { id: 'd6', group: 'design', kind: 'dvList', range: 'I8:I17', label: T('Liste déroulante sur les statuts', 'Dropdown on the statuses') },
        { id: 'd7', group: 'design', kind: 'cfRules', range: 'I8:I17', min: 3, label: T('Une couleur par statut (3 règles)', 'One colour per status (3 rules)') },
        { id: 'b1', group: 'bonus', bonus: true, kind: 'feature', feature: 'freeze', label: T('Volets figés', 'Frozen panes') },
        { id: 'b2', group: 'bonus', bonus: true, kind: 'feature', feature: 'chart', label: T('Graphique', 'Chart') },
      ],
      explain: T(
        `Ton outil réagit maintenant tout seul : change un statut, et les compteurs, le taux de conversion, les montants et la couleur suivent. C'est la différence entre un tableau qu'on <em>remplit</em> et un tableau qui <em>travaille</em>.`,
        `Your tool now reacts by itself: change a status and the counters, the conversion rate, the amounts and the colour all follow. That's the difference between a table you <em>fill in</em> and a table that <em>works</em>.`),
      pro: T('Astuce de pro : dans <code>NB.SI</code>, le critère accepte aussi des conditions : <code>"&gt;1000"</code> compte les devis de plus de 1000 €. Pour plusieurs critères à la fois, passe à <code>NB.SI.ENS</code>.',
             'Pro tip: in <code>COUNTIF</code>, the criterion also accepts conditions: <code>"&gt;1000"</code> counts quotes above €1000. For several criteria at once, move up to <code>COUNTIFS</code>.'),
    },
  ]);

  /* ---------------------------------------------------------------- Financial models (finance) */
  chapter('finprojects').levelNames = { 1: T('Ratios', 'Ratios'), 2: T('Gestion', 'Management'), 3: T('Prévisions', 'Forecasting') };
  chapter('finprojects').roadmap = [
    T('Budget mensuel avec objectifs', 'Monthly budget with targets'),
    T('Compte de résultat prévisionnel', 'Forecast income statement'),
    T('Plan de trésorerie sur 12 mois (projet Excel)', '12-month cash-flow plan (Excel project)'),
    T('Suivi de TVA et d\'impôts estimés', 'VAT and estimated-tax tracker'),
    T('Tableau de bord comptable (comme sur ton modèle)', 'Accounting dashboard (like your template)'),
  ];
  addLessons('finprojects', [
    {
      id: 'm1', type: 'practice', level: 1, xp: 12, requires: ['f1'],
      title: T('Le taux de marge brute', 'Gross margin rate'),
      intro: T(
        `<p>La <strong>marge brute</strong> est ce qu'il te reste d'une vente une fois le coût du produit payé : prix de vente − coût. Le <strong>taux de marge brute</strong> la rapporte au prix de vente, pour comparer des produits de prix différents.</p>
         <p><code>taux = (prix − coût) ÷ prix</code></p>`,
        `<p><strong>Gross margin</strong> is what is left of a sale once the product's cost is paid: selling price − cost. The <strong>gross margin rate</strong> expresses it against the selling price, so you can compare products at different prices.</p>
         <p><code>rate = (price − cost) ÷ price</code></p>`),
      task: T('Calcule le <strong>taux de marge brute</strong> de la bougie Lune.', 'Calculate the <strong>gross margin rate</strong> of the Moon candle.'),
      grid: [
        [T('Produit', 'Product'), T('Prix de vente', 'Selling price'), T('Coût', 'Cost'), T('Marge brute %', 'Gross margin %')],
        [T('Lune', 'Moon'), 50, 30, null],
        [T('Soleil', 'Sun'), 80, 48, null],
        [T('Étoile', 'Star'), 30, 21, null],
      ],
      fmt: { B: 'eur', C: 'eur', D: 'pct' },
      target: 'D2',
      tests: [{ expect: 0.4 }, { set: { B2: 100, C2: 75 }, expect: 0.25 }, { set: { B2: 20, C2: 20 }, expect: 0 }],
      hints: [
        T('Commence par la marge en euros : prix moins coût.', 'Start with the margin in euros: price minus cost.'),
        T('Puis divise cette marge par le <strong>prix de vente</strong> (pas par le coût).', 'Then divide that margin by the <strong>selling price</strong> (not by the cost).'),
        T('Tape : <code>=(B2-C2)/B2</code>', 'Type: <code>=(B2-C2)/B2</code>'),
      ],
      solution: T('=(B2-C2)/B2', '=(B2-C2)/B2'),
      explain: T(`Les parenthèses sont essentielles : sans elles, Excel diviserait seulement <code>C2</code> par <code>B2</code> avant de soustraire. Ici, 50 € vendus pour 30 € de coût donnent 40 % de marge brute.`,
                 `The parentheses are essential: without them, Excel would divide only <code>C2</code> by <code>B2</code> before subtracting. Here, €50 sold for a €30 cost gives a 40% gross margin.`),
      pro: T('À savoir : ne confonds pas ce taux (calculé sur le prix de vente) avec le <em>taux de marge</em> « commercial » (calculé sur le coût). Même marge en euros, deux pourcentages différents.',
             'Good to know: don\'t confuse this rate (computed on the selling price) with the "markup" (computed on cost). Same margin in euros, two different percentages.'),
    },
    {
      id: 'm2', type: 'practice', level: 1, xp: 12, requires: ['f1'],
      title: T('La variation en pourcentage', 'Percentage change'),
      intro: T(
        `<p>« Les ventes ont progressé de 15 % » : comment on calcule ça ? On regarde l'<strong>écart</strong> avec la période d'avant, et on le rapporte à la <strong>valeur de départ</strong>.</p>
         <p><code>variation = (nouveau − ancien) ÷ ancien</code>. Un résultat négatif est une baisse.</p>`,
        `<p>"Sales grew by 15%": how is that calculated? You look at the <strong>gap</strong> with the previous period, and divide it by the <strong>starting value</strong>.</p>
         <p><code>change = (new − old) ÷ old</code>. A negative result is a decrease.</p>`),
      task: T('Calcule la <strong>variation de février</strong> par rapport à janvier.', 'Calculate <strong>February\'s change</strong> compared to January.'),
      grid: [
        [T('Mois', 'Month'), T('Ventes', 'Sales'), T('Variation', 'Change')],
        [T('Janvier', 'January'), 1200, null],
        [T('Février', 'February'), 1380, null],
        [T('Mars', 'March'), 1242, null],
      ],
      fmt: { B: 'eur', C: 'pct' },
      target: 'C3',
      tests: [{ expect: 0.15 }, { set: { B3: 900 }, expect: -0.25 }, { set: { B2: 1000, B3: 1100 }, expect: 0.1 }],
      hints: [
        T('L\'écart, c\'est février moins janvier : <code>B3-B2</code>.', 'The gap is February minus January: <code>B3-B2</code>.'),
        T('Divise cet écart par la valeur de départ, janvier : <code>B2</code>.', 'Divide that gap by the starting value, January: <code>B2</code>.'),
        T('Tape : <code>=(B3-B2)/B2</code>', 'Type: <code>=(B3-B2)/B2</code>'),
      ],
      solution: T('=(B3-B2)/B2', '=(B3-B2)/B2'),
      explain: T(`1380 − 1200 = 180, et 180 ÷ 1200 = 0,15 : +15 %. Si les ventes baissent, le résultat est négatif : Excel te le montre en négatif sans rien faire de plus.`,
                 `1380 − 1200 = 180, and 180 ÷ 1200 = 0.15: +15%. If sales fall, the result is negative: Excel shows it as negative with nothing more to do.`),
      pro: T('Astuce de pro : ajoute une mise en forme conditionnelle pour colorer en rose les variations négatives. Elles sautent aux yeux dans un rapport.',
             'Pro tip: add conditional formatting to colour negative changes pink. They jump out in a report.'),
    },
    {
      id: 'm3', type: 'practice', level: 2, xp: 16, requires: ['f1', 'm1'],
      title: T('Le seuil de rentabilité', 'The break-even point'),
      intro: T(
        `<p>Le <strong>seuil de rentabilité</strong> (ou point mort) est le nombre de ventes à partir duquel tu ne perds plus d'argent. Chaque vente rapporte <em>prix − coût variable</em> ; il faut en vendre assez pour couvrir les <strong>charges fixes</strong>.</p>
         <p><code>unités = charges fixes ÷ (prix − coût variable)</code>. Comme on ne vend pas 0,4 bougie, on <strong>arrondit au-dessus</strong> avec <code>ARRONDI.SUP</code>.</p>`,
        `<p>The <strong>break-even point</strong> is the number of sales after which you stop losing money. Each sale earns <em>price − variable cost</em>; you need enough of them to cover the <strong>fixed costs</strong>.</p>
         <p><code>units = fixed costs ÷ (price − variable cost)</code>. Since you can't sell 0.4 of a candle, you <strong>round up</strong> with <code>ROUNDUP</code>.</p>`),
      task: T('Combien d\'unités faut-il vendre pour atteindre le seuil de rentabilité ? <strong>Arrondis au-dessus</strong>.', 'How many units must you sell to break even? <strong>Round up</strong>.'),
      grid: [
        [T('Hypothèse', 'Assumption'), T('Valeur', 'Value')],
        [T('Charges fixes', 'Fixed costs'), 3200],
        [T('Prix de vente', 'Selling price'), 25],
        [T('Coût variable par unité', 'Variable cost per unit'), 10],
        [null, null],
        [T('Unités à vendre', 'Units to sell'), null],
      ],
      fmt: { B2: 'eur', B3: 'eur', B4: 'eur' },
      target: 'B6',
      tests: [{ expect: 214 }, { set: { B2: 1500, B3: 30, B4: 15 }, expect: 100 }, { set: { B2: 2000, B4: 12 }, expect: 154 }],
      mustUse: { fr: ['ARRONDI.SUP'], en: ['ROUNDUP'] },
      hints: [
        T('Chaque unité rapporte <code>B3-B4</code> (prix moins coût variable).', 'Each unit earns <code>B3-B4</code> (price minus variable cost).'),
        T('Divise les charges fixes <code>B2</code> par ce gain par unité, puis entoure le tout de <code>ARRONDI.SUP( … ; 0)</code>.', 'Divide the fixed costs <code>B2</code> by that gain per unit, then wrap it in <code>ROUNDUP( … , 0)</code>.'),
        T('Tape : <code>=ARRONDI.SUP(B2/(B3-B4);0)</code>', 'Type: <code>=ROUNDUP(B2/(B3-B4),0)</code>'),
      ],
      solution: T('=ARRONDI.SUP(B2/(B3-B4);0)', '=ROUNDUP(B2/(B3-B4),0)'),
      explain: T(`Chaque bougie vendue laisse 15 € pour couvrir les charges. 3 200 ÷ 15 = 213,3, donc il en faut <strong>214</strong> : arrondi au-dessus, car 213 ne suffirait pas. Un simple <code>ARRONDI</code> aurait donné 213 et te ferait croire que tu es rentable un peu trop tôt.`,
                 `Each candle sold leaves €15 to cover costs. 3,200 ÷ 15 = 213.3, so you need <strong>214</strong>: rounded up, because 213 wouldn't be enough. A plain <code>ROUND</code> would give 213 and make you think you break even slightly too early.`),
      pro: T('Astuce de pro : multiplie ce nombre par le prix pour obtenir le <em>chiffre d\'affaires</em> à atteindre. C\'est souvent le chiffre qu\'on présente à une banque.',
             'Pro tip: multiply this number by the price to get the <em>revenue</em> to reach. It\'s often the number you present to a bank.'),
    },
    {
      id: 'm4', type: 'practice', level: 2, xp: 16, requires: ['f1'],
      title: T('Le solde de trésorerie cumulé', 'Cumulative cash balance'),
      intro: T(
        `<p>Un plan de trésorerie suit l'argent <em>réellement</em> disponible, mois après mois. Chaque mois : <strong>solde du mois précédent + encaissements − décaissements</strong>.</p>
         <p>Le truc : la formule référence <strong>la ligne du dessus</strong>. Quand tu la recopieras vers le bas, chaque mois s'appuiera sur le précédent.</p>`,
        `<p>A cash-flow plan tracks the money <em>actually</em> available, month after month. Each month: <strong>previous month's balance + receipts − payments</strong>.</p>
         <p>The trick: the formula refers to <strong>the row above</strong>. When you copy it down, each month builds on the previous one.</p>`),
      task: T('Calcule le <strong>solde de fin février</strong>.', 'Calculate the <strong>end-of-February balance</strong>.'),
      grid: [
        [T('Mois', 'Month'), T('Encaissements', 'Receipts'), T('Décaissements', 'Payments'), T('Solde', 'Balance')],
        [T('Janvier', 'January'), 5000, 3800, 1200],
        [T('Février', 'February'), 4200, 4600, null],
        [T('Mars', 'March'), 6000, 3500, null],
      ],
      fmt: { B: 'eur', C: 'eur', D: 'eur' },
      target: 'D3',
      tests: [{ expect: 800 }, { set: { D2: 500, B3: 1000, C3: 1800 }, expect: -300 }, { set: { B3: 0, C3: 0 }, expect: 1200 }],
      hints: [
        T('Pars du solde de janvier : <code>D2</code>.', 'Start from January\'s balance: <code>D2</code>.'),
        T('Ajoute les encaissements de février <code>B3</code>, retire les décaissements <code>C3</code>.', 'Add February\'s receipts <code>B3</code>, subtract the payments <code>C3</code>.'),
        T('Tape : <code>=D2+B3-C3</code>', 'Type: <code>=D2+B3-C3</code>'),
      ],
      solution: T('=D2+B3-C3', '=D2+B3-C3'),
      explain: T(`1 200 + 4 200 − 4 600 = 800. Remarque : février est « déficitaire » (on dépense plus qu'on n'encaisse) mais le solde reste positif grâce à janvier. C'est exactement ce qu'on surveille : <strong>le solde</strong>, pas le mois isolé.`,
                 `1,200 + 4,200 − 4,600 = 800. Note: February is "negative" (you spend more than you receive) but the balance stays positive thanks to January. That's exactly what you watch: <strong>the balance</strong>, not the month on its own.`),
      pro: T('Astuce de pro : recopie la formule en <code>D4</code> : elle devient <code>=D3+B4-C4</code> toute seule. Colore le solde en rose dès qu\'il passe sous zéro avec la mise en forme conditionnelle.',
             'Pro tip: copy the formula to <code>D4</code>: it becomes <code>=D3+B4-C4</code> by itself. Colour the balance pink as soon as it drops below zero using conditional formatting.'),
    },
    {
      id: 'm5', type: 'practice', level: 3, xp: 20, requires: ['f1', 'f6'],
      title: T('Intérêts composés : la valeur future', 'Compound interest: future value'),
      intro: T(
        `<p>Un capital placé à 5 % par an ne rapporte pas toujours 5 % de la somme de départ : chaque année, les intérêts <em>génèrent à leur tour des intérêts</em>. C'est l'effet « boule de neige ».</p>
         <p><code>valeur finale = capital × (1 + taux) ^ années</code>. Le signe <code>^</code> veut dire « puissance ».</p>`,
        `<p>A sum invested at 5% a year doesn't always earn 5% of the starting amount: each year, interest <em>earns interest in turn</em>. That's the "snowball" effect.</p>
         <p><code>final value = capital × (1 + rate) ^ years</code>. The <code>^</code> sign means "to the power of".</p>`),
      task: T('Calcule la <strong>valeur finale</strong> du capital après la durée indiquée.', 'Calculate the <strong>final value</strong> of the capital after the stated period.'),
      grid: [
        [T('Donnée', 'Item'), T('Valeur', 'Value')],
        [T('Capital', 'Capital'), 1000],
        [T('Taux annuel', 'Annual rate'), 0.05],
        [T('Années', 'Years'), 3],
        [T('Valeur finale', 'Final value'), null],
      ],
      fmt: { B2: 'eur', B3: 'pct', B5: 'eur' },
      target: 'B5',
      tests: [{ expect: 1157.625 }, { set: { B2: 2000, B3: 0.1, B4: 2 }, expect: 2420 }, { set: { B4: 0 }, expect: 1000 }],
      hints: [
        T('Le facteur de croissance d\'une année est <code>1+B3</code>.', 'The yearly growth factor is <code>1+B3</code>.'),
        T('Élève-le à la puissance du nombre d\'années avec <code>^B4</code>, puis multiplie par le capital.', 'Raise it to the power of the number of years with <code>^B4</code>, then multiply by the capital.'),
        T('Tape : <code>=B2*(1+B3)^B4</code>', 'Type: <code>=B2*(1+B3)^B4</code>'),
      ],
      solution: T('=B2*(1+B3)^B4', '=B2*(1+B3)^B4'),
      explain: T(`1 000 € à 5 % pendant 3 ans donnent 1 157,63 €, et non 1 150 € (qui serait 3 × 5 %). Les 7,63 € d'écart, ce sont les intérêts sur les intérêts. Plus la durée est longue, plus l'écart grandit.`,
                 `€1,000 at 5% for 3 years gives €1,157.63, not €1,150 (which would be 3 × 5%). The €7.63 difference is interest on interest. The longer the period, the more the gap grows.`),
      pro: T('Astuce de pro : Excel a des fonctions financières toutes prêtes (<code>VC</code>, <code>VA</code>, <code>VPM</code>…). Comprendre la formule à la main te permet de les utiliser sans te tromper.',
             'Pro tip: Excel has ready-made financial functions (<code>FV</code>, <code>PV</code>, <code>PMT</code>…). Understanding the formula by hand lets you use them without mistakes.'),
    },
  ]);
})();

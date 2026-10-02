/* ============================================================
   DIAPOS D'EXPLICATION / EXPLANATION SLIDES
   Une "diapo" = un court texte + un exemple vivant (js/slides.js).
   Chaque leçon "practice" peut avoir un jeu de diapos : window.SLIDES[id].
   Pour en ajouter : copie un bloc, change l'exemple (ex) et les diapos.
     ex     : { grid, target, f, fmt, also, editText }
              f = formule (T(fr, en)), also = cellules remplies par "recopier",
              editText = cellules texte/extra modifiables sur une diapo "edit"
     show   : 'data'  (pas encore de formule)
              'type'  (la formule s'écrit toute seule, puis Entrée)
              'result'(le résultat est là)   'edit' (on peut changer les nombres)
     copy   : true  → remplit aussi les cellules de ex.also (poignée de recopie)
   ============================================================ */
(() => {
  const T = window.T;
  const S = (show, t, p, extra) => Object.assign({ show, t, p }, extra || {});
  const D = (window.SLIDES = {});

  /* ---------- f1 : premier calcul ---------- */
  D.f1 = {
    ex: {
      grid: [[T('Article', 'Item'), T('Prix', 'Price'), T('Qté', 'Qty'), 'Total'], [T('Thé', 'Tea'), 6, 4, null], [T('Miel', 'Honey'), 9, 2, null]],
      target: 'D2', f: T('=B2*C2', '=B2*C2'), fmt: { B: 'money', D: 'money' }, also: ['D3'],
    },
    slides: [
      S('data', T('Une formule commence par =', 'A formula starts with ='),
        T(`<p>Dans Excel, une formule <strong>commence toujours par <code>=</code></strong>. Sans ce signe, Excel croit que tu écris du texte.</p><p>Ici, on veut le <strong>total du thé</strong> : prix × quantité.</p>`,
          `<p>In Excel, a formula <strong>always starts with <code>=</code></strong>. Without it, Excel thinks you're typing text.</p><p>Here we want the <strong>total for the tea</strong>: price × quantity.</p>`)),
      S('type', T('Des adresses, pas des chiffres', 'Addresses, not numbers'),
        T(`<p>Au lieu de taper <code>6*4</code>, on utilise les <strong>adresses</strong> des cellules : <code>B2</code> (le prix) et <code>C2</code> (la quantité).</p><p>Regarde : chaque adresse prend une couleur, dans la formule <em>et</em> dans le tableau. Excel fait pareil.</p>`,
          `<p>Instead of typing <code>6*4</code>, we use the cells' <strong>addresses</strong>: <code>B2</code> (the price) and <code>C2</code> (the quantity).</p><p>Look: each address gets a colour, in the formula <em>and</em> in the table. Excel does the same.</p>`)),
      S('copy', T('Recopier vers le bas', 'Copy it down'),
        T(`<p>Le résultat s'affiche, et la barre de formule garde la formule. Touche <code>D3</code> : Excel a adapté la formule à la ligne du miel (<code>B3*C3</code>).</p><p><strong>Astuce :</strong> double-clique le petit carré en bas à droite de la cellule pour recopier d'un coup.</p>`,
          `<p>The result shows up, and the formula bar keeps the formula. Tap <code>D3</code>: Excel adjusted the formula for the honey row (<code>B3*C3</code>).</p><p><strong>Tip:</strong> double-click the small square at the cell's bottom-right corner to copy in one go.</p>`), { show: 'result', copy: true }),
      S('edit', T('Une formule est vivante', 'A formula is alive'),
        T(`<p>Change un prix ou une quantité : les totaux suivent <strong>tout seuls</strong>. C'est pour ça qu'on utilise des adresses plutôt que des nombres tapés.</p>`,
          `<p>Change a price or a quantity: the totals follow <strong>by themselves</strong>. That's why we use addresses instead of typed numbers.</p>`), { copy: true }),
    ],
  };

  /* ---------- f2 : SOMME ---------- */
  D.f2 = {
    ex: {
      grid: [[T('Mois', 'Month'), T('Ventes', 'Sales')], [T('Mai', 'May'), 300], [T('Juin', 'June'), 450], [T('Juillet', 'July'), 520], [T('Août', 'August'), 380], [T('Total', 'Total'), null]],
      target: 'B6', f: T('=SOMME(B2:B5)', '=SUM(B2:B5)'), fmt: { B: 'money' },
    },
    slides: [
      S('data', T('Additionner, version longue', 'Adding, the long way'),
        T(`<p>Pour le total des 4 mois, on pourrait écrire <code>=B2+B3+B4+B5</code>. Avec 4 cases, ça va. Avec 400, impossible.</p><p>La fonction <code>SOMME</code> additionne toute une <strong>plage</strong> d'un coup.</p>`,
          `<p>For the 4-month total we could write <code>=B2+B3+B4+B5</code>. With 4 cells, fine. With 400, impossible.</p><p>The <code>SUM</code> function adds a whole <strong>range</strong> in one go.</p>`)),
      S('type', T('Une plage : première:dernière', 'A range: first:last'),
        T(`<p>Une plage s'écrit <code>B2:B5</code> : les <strong>deux-points</strong> veulent dire « jusqu'à ». Toutes les cellules de B2 à B5 s'allument de la même couleur.</p><p>Forme générale : <code>=SOMME(plage)</code></p>`,
          `<p>A range is written <code>B2:B5</code>: the <strong>colon</strong> means "through". Every cell from B2 to B5 lights up in the same colour.</p><p>General form: <code>=SUM(range)</code></p>`)),
      S('edit', T('Elle suit tes données', 'It follows your data'),
        T(`<p>Change un chiffre : le total se met à jour. Et si tu insères une ligne <em>à l'intérieur</em> de la plage, Excel l'inclut automatiquement.</p>`,
          `<p>Change a number: the total updates. And if you insert a row <em>inside</em> the range, Excel includes it automatically.</p>`)),
    ],
  };

  /* ---------- f3 : MOYENNE ---------- */
  D.f3 = {
    ex: {
      grid: [[T('Semaine', 'Week'), T('Ventes', 'Sales')], ['S1', 240], ['S2', 310], ['S3', 275], ['S4', 335], [T('Moyenne', 'Average'), null]],
      target: 'B6', f: T('=MOYENNE(B2:B5)', '=AVERAGE(B2:B5)'), fmt: { B: 'money' },
    },
    slides: [
      S('data', T('La valeur « habituelle »', 'The "typical" value'),
        T(`<p>Combien vends-tu <strong>en général</strong> par semaine ? La moyenne répond : on additionne tout, puis on divise par le nombre de valeurs.</p><p>Excel fait les deux d'un coup avec <code>MOYENNE</code>.</p>`,
          `<p>How much do you <strong>usually</strong> sell per week? The average answers: add everything up, then divide by how many values there are.</p><p>Excel does both at once with <code>AVERAGE</code>.</p>`)),
      S('type', T('Écrite comme SOMME', 'Written like SUM'),
        T(`<p><code>=MOYENNE(plage)</code> : même forme que <code>SOMME</code>. Les 4 semaines sont comptées, donc Excel divise par 4.</p>`,
          `<p><code>=AVERAGE(range)</code>: same shape as <code>SUM</code>. The 4 weeks are counted, so Excel divides by 4.</p>`)),
      S('edit', T('Fais bouger la moyenne', 'Move the average'),
        T(`<p>Mets une très grosse semaine : la moyenne monte, mais moins que le total. Une cellule <strong>vide</strong> n'est pas comptée, alors qu'un <code>0</code> l'est.</p>`,
          `<p>Put in a really big week: the average goes up, but less than the total. An <strong>empty</strong> cell isn't counted, whereas a <code>0</code> is.</p>`)),
    ],
  };

  /* ---------- f4 : MIN / MAX ---------- */
  D.f4 = {
    ex: {
      grid: [[T('Jour', 'Day'), T('Visiteurs', 'Visitors')], [T('Lun', 'Mon'), 120], [T('Mar', 'Tue'), 95], [T('Mer', 'Wed'), 140], [T('Jeu', 'Thu'), 110], [T('Écart', 'Gap'), null]],
      target: 'B6', f: T('=MAX(B2:B5)-MIN(B2:B5)', '=MAX(B2:B5)-MIN(B2:B5)'),
    },
    slides: [
      S('data', T('Le plus grand, le plus petit', 'The largest, the smallest'),
        T(`<p><code>MAX(plage)</code> donne la plus grande valeur, <code>MIN(plage)</code> la plus petite.</p><p>On peut les <strong>combiner</strong> dans un même calcul. Ici : l'écart entre le meilleur et le pire jour.</p>`,
          `<p><code>MAX(range)</code> gives the largest value, <code>MIN(range)</code> the smallest.</p><p>You can <strong>combine</strong> them in one calculation. Here: the gap between the best and worst day.</p>`)),
      S('type', T('Deux fonctions, un calcul', 'Two functions, one calculation'),
        T(`<p>Chaque fonction a sa plage, et chaque plage sa couleur. Excel calcule les deux, puis fait la soustraction : 140 − 95.</p>`,
          `<p>Each function has its range, and each range its colour. Excel works out both, then subtracts: 140 − 95.</p>`)),
      S('edit', T('Teste les extrêmes', 'Test the extremes'),
        T(`<p>Mets un jour à 300 : le MAX change, donc l'écart aussi. Mets un jour à 10 : c'est le MIN qui bouge.</p>`,
          `<p>Set a day to 300: the MAX changes, so the gap does too. Set a day to 10: now the MIN moves.</p>`)),
    ],
  };

  /* ---------- f5 : SI ---------- */
  D.f5 = {
    ex: {
      grid: [[T('Élève', 'Student'), 'Note', T('Résultat', 'Result')], ['Jade', 82, null]],
      target: 'C2', f: T('=SI(B2>=60;"Réussi";"À revoir")', '=IF(B2>=60,"Pass","Review")'),
    },
    slides: [
      S('data', T('Laisser Excel décider', 'Let Excel decide'),
        T(`<p>La fonction <code>SI</code> choisit entre <strong>deux résultats</strong> selon une condition.</p><p><code>=SI(condition ; si_vrai ; si_faux)</code></p><p>Ici : « Réussi » à partir de 60, sinon « À revoir ».</p>`,
          `<p>The <code>IF</code> function picks between <strong>two results</strong> depending on a condition.</p><p><code>=IF(condition, if_true, if_false)</code></p><p>Here: "Pass" from 60 up, otherwise "Review".</p>`)),
      S('type', T('Trois morceaux', 'Three pieces'),
        T(`<p>La condition <code>B2>=60</code> (la case est colorée), puis le texte si c'est vrai, puis le texte si c'est faux. Les <strong>textes</strong> vont entre guillemets.</p><p>Les comparaisons : <code>&gt;</code> <code>&lt;</code> <code>&gt;=</code> <code>&lt;=</code> <code>=</code> <code>&lt;&gt;</code></p>`,
          `<p>The condition <code>B2>=60</code> (the cell is coloured), then the text if true, then the text if false. <strong>Text</strong> goes in quotes.</p><p>Comparisons: <code>&gt;</code> <code>&lt;</code> <code>&gt;=</code> <code>&lt;=</code> <code>=</code> <code>&lt;&gt;</code></p>`)),
      S('edit', T('Pile sur la limite', 'Right on the limit'),
        T(`<p>Essaie <strong>60</strong>, puis <strong>59</strong>. Avec <code>&gt;=</code>, 60 passe ; avec <code>&gt;</code> seul, il ne passerait pas. C'est le piège classique.</p>`,
          `<p>Try <strong>60</strong>, then <strong>59</strong>. With <code>&gt;=</code>, 60 passes; with <code>&gt;</code> alone it wouldn't. That's the classic trap.</p>`)),
    ],
  };

  /* ---------- f6 : références absolues ---------- */
  D.f6 = {
    ex: {
      grid: [[T('Article', 'Item'), T('Prix', 'Price'), T('Avec taxes', 'With tax'), T('TPS', 'GST'), 0.05], [T('Thé', 'Tea'), 20, null, T('TVQ', 'QST'), 0.09975], [T('Miel', 'Honey'), 30, null], [T('Savon', 'Soap'), 10, null]],
      target: 'C2', f: T('=B2*(1+$E$1+$E$2)', '=B2*(1+$E$1+$E$2)'), fmt: { B: 'money', C: 'money', E1: 'pct', E2: 'pct' }, also: ['C3', 'C4'], editText: ['E1'],
    },
    slides: [
      S('data', T('Quand les adresses glissent', 'When addresses slide'),
        T(`<p>Quand on recopie une formule vers le bas, les adresses <strong>glissent</strong> : <code>B2</code> devient <code>B3</code>, puis <code>B4</code>. Pratique pour les prix.</p><p>Mais les taux de taxe, eux, restent <strong>toujours aux mêmes cases</strong> : <code>E1</code> (TPS) et <code>E2</code> (TVQ).</p>`,
          `<p>When you copy a formula down, addresses <strong>slide</strong>: <code>B2</code> becomes <code>B3</code>, then <code>B4</code>. Handy for prices.</p><p>But the tax rates always stay <strong>in the same cells</strong>: <code>E1</code> (GST) and <code>E2</code> (QST).</p>`)),
      S('type', T('Verrouiller avec $', 'Lock with $'),
        T(`<p>Un <code>$</code> devant la lettre et le chiffre verrouille la cellule : <code>$E$1</code> ne bougera jamais.</p><p>Astuce : pendant que tu écris une adresse, appuie sur <kbd>F4</kbd> pour ajouter les <code>$</code>.</p>`,
          `<p>A <code>$</code> before the letter and the number locks the cell: <code>$E$1</code> will never move.</p><p>Tip: while typing an address, press <kbd>F4</kbd> to add the <code>$</code>.</p>`)),
      S('copy', T('Recopie : ce qui glisse, ce qui reste', 'Copy: what slides, what stays'),
        T(`<p>Touche <code>C3</code> puis <code>C4</code> : le prix glisse (<code>B3</code>, <code>B4</code>), mais <code>$E$1</code> et <code>$E$2</code> restent figés.</p>`,
          `<p>Tap <code>C3</code> then <code>C4</code>: the price slides (<code>B3</code>, <code>B4</code>), but <code>$E$1</code> and <code>$E$2</code> stay locked.</p>`), { show: 'result', copy: true }),
      S('edit', T('Un seul endroit à changer', 'One place to change'),
        T(`<p>Change la TPS (<code>E1</code>) : <strong>tous</strong> les prix se mettent à jour d'un coup. Voilà pourquoi on verrouille.</p>`,
          `<p>Change the GST (<code>E1</code>): <strong>every</strong> price updates at once. That's why we lock.</p>`), { copy: true }),
    ],
  };

  /* ---------- f7 : SOMME.SI ---------- */
  D.f7 = {
    ex: {
      grid: [[T('Catégorie', 'Category'), T('Montant', 'Amount'), null, T('Chercher', 'Look for'), 'Total'], [T('Thé', 'Tea'), 40, null, T('Thé', 'Tea')], [T('Café', 'Coffee'), 25], [T('Thé', 'Tea'), 60], [T('Café', 'Coffee'), 30], [T('Thé', 'Tea'), 20]],
      target: 'E2', f: T('=SOMME.SI(A2:A6;D2;B2:B6)', '=SUMIF(A2:A6,D2,B2:B6)'), fmt: { B: 'money', E: 'money' }, editText: ['D2'],
    },
    slides: [
      S('data', T('Additionner seulement certaines lignes', 'Add up only some rows'),
        T(`<p>Combien a-t-on vendu <strong>de thé</strong> en tout ? Il faut additionner les montants, mais <em>seulement</em> ceux de la catégorie « Thé ».</p><p><code>SOMME.SI</code> fait exactement ça.</p>`,
          `<p>How much <strong>tea</strong> did we sell in total? We need to add the amounts, but <em>only</em> those in the "Tea" category.</p><p><code>SUMIF</code> does exactly that.</p>`)),
      S('type', T('Trois informations', 'Three pieces of information'),
        T(`<p><code>=SOMME.SI(où chercher ; quoi chercher ; quoi additionner)</code></p><p>Trois couleurs : la colonne des catégories, la cellule du critère (<code>D2</code>), la colonne des montants.</p>`,
          `<p><code>=SUMIF(where to look, what to look for, what to add)</code></p><p>Three colours: the category column, the criterion cell (<code>D2</code>), the amount column.</p>`)),
      S('edit', T('Change le critère', 'Change the criterion'),
        T(`<p>Dans <code>D2</code>, remplace « Thé » par « Café » : le total change tout de suite. Un critère dans une cellule se change sans toucher à la formule.</p>`,
          `<p>In <code>D2</code>, replace "Tea" with "Coffee": the total changes right away. A criterion in a cell can change without touching the formula.</p>`)),
    ],
  };

  /* ---------- f8 : NB.SI ---------- */
  D.f8 = {
    ex: {
      grid: [[T('Commande', 'Order'), T('Statut', 'Status'), null, T('Chercher', 'Look for'), T('Nombre', 'Count')], [101, T('Livré', 'Delivered'), null, T('Livré', 'Delivered')], [102, T('En attente', 'Pending')], [103, T('Livré', 'Delivered')], [104, T('Annulé', 'Cancelled')], [105, T('Livré', 'Delivered')]],
      target: 'E2', f: T('=NB.SI(B2:B6;D2)', '=COUNTIF(B2:B6,D2)'), editText: ['D2'],
    },
    slides: [
      S('data', T('Compter avec un critère', 'Count with a criterion'),
        T(`<p><code>NB.SI</code> compte <strong>combien de cellules</strong> correspondent à un critère : commandes livrées, clients actifs, tâches terminées…</p><p><code>=NB.SI(plage ; critère)</code></p>`,
          `<p><code>COUNTIF</code> counts <strong>how many cells</strong> meet a criterion: delivered orders, active clients, finished tasks…</p><p><code>=COUNTIF(range, criterion)</code></p>`)),
      S('type', T('Deux informations', 'Two pieces of information'),
        T(`<p>La plage où regarder (les statuts) et le critère (<code>D2</code>). Excel compte les cellules identiques au critère.</p>`,
          `<p>The range to look in (the statuses) and the criterion (<code>D2</code>). Excel counts the cells that match the criterion.</p>`)),
      S('edit', T('Compte autre chose', 'Count something else'),
        T(`<p>Remplace « Livré » par « En attente » ou « Annulé » dans <code>D2</code>. Le nombre se met à jour. Écris-le <strong>exactement</strong> comme dans la liste.</p>`,
          `<p>Replace "Delivered" with "Pending" or "Cancelled" in <code>D2</code>. The count updates. Spell it <strong>exactly</strong> like in the list.</p>`)),
    ],
  };

  /* ---------- f9 : SI imbriqués ---------- */
  D.f9 = {
    ex: {
      grid: [[T('Élève', 'Student'), 'Note', T('Mention', 'Grade')], ['Jade', 72, null]],
      target: 'C2', f: T('=SI(B2>=80;"Excellent";SI(B2>=60;"Bien";"À revoir"))', '=IF(B2>=80,"Excellent",IF(B2>=60,"Good","Review"))'),
    },
    slides: [
      S('data', T('Plus de deux résultats', 'More than two results'),
        T(`<p>Et s'il y a <strong>trois cas</strong> ? On met un <code>SI</code> à l'intérieur d'un autre, à la place du « sinon » :</p><p><code>=SI(cond1 ; résultat1 ; SI(cond2 ; résultat2 ; résultat3))</code></p>`,
          `<p>What if there are <strong>three cases</strong>? Put an <code>IF</code> inside another, in place of the "else":</p><p><code>=IF(cond1, result1, IF(cond2, result2, result3))</code></p>`)),
      S('type', T('Excel teste dans l\'ordre', 'Excel tests in order'),
        T(`<p>D'abord <code>B2>=80</code>. Si non, il passe au deuxième <code>SI</code> : <code>B2>=60</code>. Si non encore, c'est « À revoir ».</p><p><strong>Règle :</strong> la condition la plus exigeante en premier.</p>`,
          `<p>First <code>B2>=80</code>. If not, it moves on to the second <code>IF</code>: <code>B2>=60</code>. If still not, it's "Review".</p><p><strong>Rule:</strong> most demanding condition first.</p>`)),
      S('edit', T('Les trois cas', 'The three cases'),
        T(`<p>Essaie <strong>85</strong>, <strong>72</strong> et <strong>40</strong> dans la note : tu obtiens les trois mentions.</p>`,
          `<p>Try <strong>85</strong>, <strong>72</strong> and <strong>40</strong> as the score: you get all three grades.</p>`)),
    ],
  };

  /* ---------- f10 : RECHERCHEV ---------- */
  const CODES = [[T('Code', 'Code'), T('Produit', 'Product'), T('Prix', 'Price'), null, T('Code cherché', 'Code wanted'), T('Prix trouvé', 'Price found')], ['T01', T('Thé vert', 'Green tea'), 6, null, 'M01'], ['M01', T('Miel', 'Honey'), 9], ['S01', T('Savon', 'Soap'), 4]];
  D.f10 = {
    ex: {
      grid: CODES, target: 'F2', f: T('=RECHERCHEV(E2;A2:C4;3;FAUX)', '=VLOOKUP(E2,A2:C4,3,FALSE)'), fmt: { C: 'money', F: 'money' }, editText: ['E2'],
    },
    slides: [
      S('data', T('Chercher dans un tableau', 'Look something up in a table'),
        T(`<p>Tu connais le <strong>code</strong> d'un produit et tu veux son <strong>prix</strong>. <code>RECHERCHEV</code> cherche le code dans la <em>première colonne</em> du tableau, puis rapporte une info de la même ligne.</p>`,
          `<p>You know a product's <strong>code</strong> and want its <strong>price</strong>. <code>VLOOKUP</code> searches for the code in the table's <em>first column</em>, then brings back info from the same row.</p>`)),
      S('type', T('Quatre informations', 'Four pieces of information'),
        T(`<p><code>=RECHERCHEV(ce que je cherche ; le tableau ; n° de colonne ; FAUX)</code></p><p>Ici : le code <code>E2</code>, le tableau <code>A2:C4</code>, la <strong>3<sup>e</sup> colonne</strong> (le prix), et <code>FAUX</code> pour « valeur exacte » (presque toujours ce qu'on veut).</p>`,
          `<p><code>=VLOOKUP(what I'm looking for, the table, column number, FALSE)</code></p><p>Here: the code <code>E2</code>, the table <code>A2:C4</code>, the <strong>3rd column</strong> (the price), and <code>FALSE</code> for "exact match" (almost always what you want).</p>`)),
      S('edit', T('Change le code', 'Change the code'),
        T(`<p>Tape <strong>S01</strong> ou <strong>T01</strong> dans <code>E2</code> : le prix suit. Tape un code qui n'existe pas : Excel répond <code>#N/A</code>. (On règle ça dans la leçon SIERREUR.)</p>`,
          `<p>Type <strong>S01</strong> or <strong>T01</strong> in <code>E2</code>: the price follows. Type a code that doesn't exist: Excel answers <code>#N/A</code>. (We fix that in the IFERROR lesson.)</p>`)),
    ],
  };

  /* ---------- f11 : INDEX + EQUIV ---------- */
  D.f11 = {
    ex: {
      grid: [[T('Code', 'Code'), T('Produit', 'Product'), T('Prix', 'Price'), null, T('Produit cherché', 'Product wanted'), T('Prix trouvé', 'Price found')], ['T01', T('Thé vert', 'Green tea'), 6, null, T('Miel', 'Honey')], ['M01', T('Miel', 'Honey'), 9], ['S01', T('Savon', 'Soap'), 4]],
      target: 'F2', f: T('=INDEX(C2:C4;EQUIV(E2;B2:B4;0))', '=INDEX(C2:C4,MATCH(E2,B2:B4,0))'), fmt: { C: 'money', F: 'money' }, editText: ['E2'],
    },
    slides: [
      S('data', T('Un duo flexible', 'A flexible duo'),
        T(`<p>Cette fois on cherche par <strong>nom de produit</strong>, qui est <em>à droite</em> du code, pas dans la première colonne. <code>RECHERCHEV</code> ne peut pas.</p><p>Deux fonctions en équipe : <code>EQUIV</code> trouve la <strong>position</strong>, <code>INDEX</code> rapporte la valeur à cette position.</p>`,
          `<p>This time we search by <strong>product name</strong>, which is <em>to the right</em> of the code, not in the first column. <code>VLOOKUP</code> can't do it.</p><p>Two functions as a team: <code>MATCH</code> finds the <strong>position</strong>, <code>INDEX</code> returns the value at that position.</p>`)),
      S('type', T('De l\'intérieur vers l\'extérieur', 'From the inside out'),
        T(`<p><code>EQUIV(E2 ; B2:B4 ; 0)</code> répond « le miel est en 2<sup>e</sup> position ». Puis <code>INDEX(C2:C4 ; 2)</code> prend la 2<sup>e</sup> case des prix : 9 $.</p>`,
          `<p><code>MATCH(E2, B2:B4, 0)</code> answers "honey is in 2nd position". Then <code>INDEX(C2:C4, 2)</code> takes the 2nd price: $9.</p>`)),
      S('edit', T('Cherche un autre produit', 'Look up another product'),
        T(`<p>Remplace « Miel » par « Savon » ou « Thé vert » dans <code>E2</code>. Le résultat change, et tu peux même chercher dans <em>n'importe quelle</em> colonne.</p>`,
          `<p>Replace "Honey" with "Soap" or "Green tea" in <code>E2</code>. The result changes, and you can search in <em>any</em> column.</p>`)),
    ],
  };

  /* ---------- f12 : SIERREUR ---------- */
  D.f12 = {
    ex: {
      grid: [CODES[0], CODES[1].slice(0, 4).concat(['Z99']), CODES[2], CODES[3]], target: 'F2',
      f: T('=SIERREUR(RECHERCHEV(E2;A2:C4;3;FAUX);"Introuvable")', '=IFERROR(VLOOKUP(E2,A2:C4,3,FALSE),"Not found")'), fmt: { C: 'money', F: 'money' }, editText: ['E2'],
    },
    slides: [
      S('result', T('Le problème : #N/A', 'The problem: #N/A'),
        T(`<p>Le code <code>Z99</code> n'existe pas. Excel répond <code>#N/A</code>. Dans un tableau de bord, ça fait <strong>peu professionnel</strong>.</p>`,
          `<p>The code <code>Z99</code> doesn't exist. Excel answers <code>#N/A</code>. In a dashboard, that looks <strong>unprofessional</strong>.</p>`),
        { f: T('=RECHERCHEV(E2;A2:C4;3;FAUX)', '=VLOOKUP(E2,A2:C4,3,FALSE)') }),
      S('type', T('Envelopper dans SIERREUR', 'Wrap it in IFERROR'),
        T(`<p><code>=SIERREUR(formule ; valeur_si_erreur)</code></p><p>Ta formule va à l'intérieur. Si elle échoue, Excel affiche <strong>ton message</strong> à la place.</p>`,
          `<p><code>=IFERROR(formula, value_if_error)</code></p><p>Your formula goes inside. If it fails, Excel shows <strong>your message</strong> instead.</p>`)),
      S('edit', T('Un bon code, un mauvais code', 'A good code, a bad code'),
        T(`<p>Tape <strong>M01</strong> : le prix s'affiche. Tape n'importe quoi : « Introuvable ». Attention : <code>SIERREUR</code> cache <em>toutes</em> les erreurs, même une faute dans ta formule. Utilise-la une fois que ça marche.</p>`,
          `<p>Type <strong>M01</strong>: the price shows. Type anything else: "Not found". Careful: <code>IFERROR</code> hides <em>every</em> error, even a typo in your formula. Add it once the formula works.</p>`)),
    ],
  };

  /* ---------- m1 : marge brute ---------- */
  D.m1 = {
    ex: {
      grid: [[T('Produit', 'Product'), T('Prix', 'Price'), T('Coût', 'Cost'), T('Marge %', 'Margin %')], [T('Thé', 'Tea'), 20, 12, null], [T('Miel', 'Honey'), 30, 21, null]],
      target: 'D2', f: T('=(B2-C2)/B2', '=(B2-C2)/B2'), fmt: { B: 'money', C: 'money', D: 'pct' }, also: ['D3'],
    },
    slides: [
      S('data', T('Ce qu\'il reste après le coût', 'What is left after the cost'),
        T(`<p>La <strong>marge brute</strong>, c'est le prix de vente moins le coût du produit. En <strong>pourcentage du prix</strong>, on peut comparer des produits à des prix différents.</p><p><code>taux = (prix − coût) ÷ prix</code></p>`,
          `<p>The <strong>gross margin</strong> is the selling price minus the product's cost. As a <strong>percentage of the price</strong>, you can compare products at different prices.</p><p><code>rate = (price − cost) ÷ price</code></p>`)),
      S('type', T('Les parenthèses comptent', 'Parentheses matter'),
        T(`<p>On calcule d'abord <code>(B2-C2)</code> : le bénéfice (8 $). Puis on divise par le prix <code>B2</code>. Sans les parenthèses, Excel diviserait <code>C2</code> avant de soustraire.</p>`,
          `<p>First <code>(B2-C2)</code>: the profit ($8). Then divide by the price <code>B2</code>. Without parentheses, Excel would divide <code>C2</code> before subtracting.</p>`)),
      S('result', T('Comparer deux produits', 'Compare two products'),
        T(`<p>Touche <code>D3</code> : même formule, ligne suivante. Le thé laisse 40 % de marge, le miel 30 %. Le miel coûte plus cher, mais rapporte <em>proportionnellement</em> moins.</p>`,
          `<p>Tap <code>D3</code>: same formula, next row. Tea leaves a 40% margin, honey 30%. Honey costs more but earns <em>proportionally</em> less.</p>`), { copy: true }),
      S('edit', T('Joue avec le prix', 'Play with the price'),
        T(`<p>Monte le prix du miel à 40 $ : la marge passe à 47,5 %. Baisse le coût : la marge monte aussi.</p>`,
          `<p>Raise the honey price to $40: the margin goes to 47.5%. Lower the cost: the margin rises too.</p>`), { copy: true }),
    ],
  };

  /* ---------- m2 : variation en % ---------- */
  D.m2 = {
    ex: {
      grid: [[T('Mois', 'Month'), T('Ventes', 'Sales'), T('Variation', 'Change')], [T('Mai', 'May'), 800, null], [T('Juin', 'June'), 920, null], [T('Juillet', 'July'), 828, null]],
      target: 'C3', f: T('=(B3-B2)/B2', '=(B3-B2)/B2'), fmt: { B: 'money', C: 'pct' }, also: ['C4'],
    },
    slides: [
      S('data', T('« Les ventes ont augmenté de 15 % »', '"Sales grew by 15%"'),
        T(`<p>Comment ça se calcule ? On regarde l'<strong>écart</strong> avec la période précédente, puis on le divise par la valeur de <strong>départ</strong>.</p><p><code>variation = (nouveau − ancien) ÷ ancien</code></p>`,
          `<p>How is that calculated? Take the <strong>gap</strong> with the previous period, then divide it by the <strong>starting</strong> value.</p><p><code>change = (new − old) ÷ old</code></p>`)),
      S('type', T('La formule va sur la 2e ligne', 'The formula goes on the 2nd row'),
        T(`<p>On a besoin de deux mois pour comparer : la formule commence donc en <code>C3</code> (juin vs mai). Un résultat négatif signifie une <strong>baisse</strong>.</p>`,
          `<p>You need two months to compare, so the formula starts in <code>C3</code> (June vs May). A negative result means a <strong>decrease</strong>.</p>`)),
      S('result', T('Recopie vers le bas', 'Copy it down'),
        T(`<p>Touche <code>C4</code> : la formule compare maintenant juillet à juin (<code>B4-B3</code>). Résultat : −10 %, une baisse.</p>`,
          `<p>Tap <code>C4</code>: the formula now compares July with June (<code>B4-B3</code>). Result: −10%, a decrease.</p>`), { copy: true }),
      S('edit', T('Fais monter ou descendre', 'Push it up or down'),
        T(`<p>Mets juin à 1 600 : la variation passe à +100 %. Une hausse de 100 %, c'est le <strong>double</strong>.</p>`,
          `<p>Set June to 1,600: the change becomes +100%. A 100% increase means <strong>double</strong>.</p>`), { copy: true }),
    ],
  };

  /* ---------- m3 : seuil de rentabilité ---------- */
  D.m3 = {
    ex: {
      grid: [[T('Hypothèse', 'Assumption'), T('Valeur', 'Value')], [T('Frais fixes', 'Fixed costs'), 2000], [T('Prix de vente', 'Selling price'), 20], [T('Coût variable', 'Variable cost'), 8], [null, null], [T('Unités à vendre', 'Units to sell'), null]],
      target: 'B6', f: T('=ARRONDI.SUP(B2/(B3-B4);0)', '=ROUNDUP(B2/(B3-B4),0)'), fmt: { B2: 'money', B3: 'money', B4: 'money' },
    },
    slides: [
      S('data', T('À partir de quand on gagne ?', 'When do we start making money?'),
        T(`<p>Chaque vente rapporte <strong>prix − coût variable</strong> (ici 12 $). Il faut en vendre assez pour couvrir les <strong>frais fixes</strong> (2 000 $).</p><p><code>unités = frais fixes ÷ (prix − coût variable)</code></p>`,
          `<p>Each sale earns <strong>price − variable cost</strong> (here $12). You need enough of them to cover the <strong>fixed costs</strong> ($2,000).</p><p><code>units = fixed costs ÷ (price − variable cost)</code></p>`)),
      S('type', T('Arrondir vers le haut', 'Round up'),
        T(`<p>2 000 ÷ 12 = 166,67. On ne peut pas vendre 0,67 produit : on arrondit <strong>vers le haut</strong> avec <code>ARRONDI.SUP(nombre ; 0)</code>. Le <code>0</code> veut dire « zéro décimale ».</p>`,
          `<p>2,000 ÷ 12 = 166.67. You can't sell 0.67 of a product: round <strong>up</strong> with <code>ROUNDUP(number, 0)</code>. The <code>0</code> means "zero decimals".</p>`)),
      S('edit', T('Que se passe-t-il si… ?', 'What happens if…?'),
        T(`<p>Monte le prix à 25 $ : il faut moins d'unités. Monte les frais fixes à 5 000 $ : il en faut beaucoup plus. C'est l'outil rêvé pour « et si ? ».</p>`,
          `<p>Raise the price to $25: fewer units needed. Raise fixed costs to $5,000: far more. It's the perfect tool for "what if?".</p>`)),
    ],
  };

  /* ---------- m4 : solde de trésorerie cumulé ---------- */
  D.m4 = {
    ex: {
      grid: [[T('Mois', 'Month'), T('Entrées', 'Receipts'), T('Sorties', 'Payments'), 'Solde'], [T('Mai', 'May'), 3000, 2400, 600], [T('Juin', 'June'), 2800, 3100, null], [T('Juillet', 'July'), 3500, 2000, null]],
      target: 'D3', f: T('=D2+B3-C3', '=D2+B3-C3'), fmt: { B: 'money', C: 'money', D: 'money' }, also: ['D4'],
    },
    slides: [
      S('data', T('L\'argent réellement disponible', 'The money actually available'),
        T(`<p>Un plan de trésorerie suit l'argent <strong>mois après mois</strong>. Chaque mois :</p><p><code>solde précédent + entrées − sorties</code></p><p>Mai est déjà fait (600 $). Calculons juin.</p>`,
          `<p>A cash-flow plan tracks money <strong>month after month</strong>. Each month:</p><p><code>previous balance + receipts − payments</code></p><p>May is done (600). Let's work out June.</p>`)),
      S('type', T('La formule regarde la ligne du dessus', 'The formula looks at the row above'),
        T(`<p><code>D2</code> est le solde de mai. On y ajoute les entrées de juin (<code>B3</code>) et on retire les sorties (<code>C3</code>) : 600 + 2 800 − 3 100.</p>`,
          `<p><code>D2</code> is May's balance. Add June's receipts (<code>B3</code>) and subtract payments (<code>C3</code>): 600 + 2,800 − 3,100.</p>`)),
      S('result', T('Chaque mois s\'appuie sur le précédent', 'Each month builds on the last'),
        T(`<p>Touche <code>D4</code> : <code>D3+B4-C4</code>. Le solde de juin sert de point de départ à juillet. En recopiant, la référence au-dessus <strong>glisse</strong> d'une ligne.</p>`,
          `<p>Tap <code>D4</code>: <code>D3+B4-C4</code>. June's balance is July's starting point. When copied, the reference above <strong>slides</strong> down a row.</p>`), { copy: true }),
      S('edit', T('Une mauvaise surprise', 'A nasty surprise'),
        T(`<p>Mets les sorties de juin à 4 000 : le solde devient négatif, et juillet en hérite. C'est exactement ce qu'un plan de trésorerie doit te montrer <em>à l'avance</em>.</p>`,
          `<p>Set June's payments to 4,000: the balance goes negative, and July inherits it. That's exactly what a cash-flow plan should show you <em>in advance</em>.</p>`), { copy: true }),
    ],
  };

  /* ---------- m5 : intérêts composés ---------- */
  D.m5 = {
    ex: {
      grid: [[T('Élément', 'Item'), T('Valeur', 'Value')], [T('Capital', 'Capital'), 500], [T('Taux annuel', 'Annual rate'), 0.04], [T('Années', 'Years'), 5], [T('Valeur finale', 'Final value'), null]],
      target: 'B5', f: T('=B2*(1+B3)^B4', '=B2*(1+B3)^B4'), fmt: { B2: 'money', B3: 'pct', B5: 'money' },
    },
    slides: [
      S('data', T('L\'effet boule de neige', 'The snowball effect'),
        T(`<p>À 4 % par an, on ne gagne pas toujours 4 % du capital de départ : chaque année, les <strong>intérêts rapportent des intérêts</strong>.</p><p><code>valeur finale = capital × (1 + taux) ^ années</code></p>`,
          `<p>At 4% a year, you don't always earn 4% of the starting capital: every year, <strong>interest earns interest</strong>.</p><p><code>final value = capital × (1 + rate) ^ years</code></p>`)),
      S('type', T('Le signe ^ : « puissance »', 'The ^ sign: "to the power of"'),
        T(`<p><code>(1+B3)^B4</code> multiplie <code>(1+taux)</code> par lui-même autant de fois qu'il y a d'années. 5 ans : 1,04 × 1,04 × 1,04 × 1,04 × 1,04.</p>`,
          `<p><code>(1+B3)^B4</code> multiplies <code>(1+rate)</code> by itself as many times as there are years. 5 years: 1.04 × 1.04 × 1.04 × 1.04 × 1.04.</p>`)),
      S('edit', T('Le temps travaille pour toi', 'Time works for you'),
        T(`<p>Passe les années de 5 à 20, puis à 40. La valeur ne fait pas que doubler : elle <strong>explose</strong>. C'est pour ça qu'il vaut mieux commencer tôt.</p>`,
          `<p>Change the years from 5 to 20, then 40. The value doesn't just double: it <strong>explodes</strong>. That's why starting early pays off.</p>`)),
    ],
  };
})();

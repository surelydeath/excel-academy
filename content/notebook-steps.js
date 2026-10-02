/* ============================================================
   CARNET : PAS À PAS / NOTEBOOK: STEP BY STEP
   Chaque entrée du carnet peut avoir, en plus de son résumé :
     needs : ce qu'il te faut avant de commencer (liste)
     steps : les étapes, une à la fois (titre + explication)
     traps : les erreurs fréquentes
   Elles sont rattachées aux entrées de notebook.js par leur id.
   Windows et iPad : on précise quand ça change.
   ============================================================ */
(() => {
  const N = {};
  const st = (ft, et, fp, ep) => ({ t: T(ft, et), p: T(fp, ep) });
  const add = (id, needs, steps, traps) => { N[id] = { needs, steps, traps }; };
  const n = (fr, en) => T(fr, en);

  /* ------------------------------------------------------------ functions */
  add('sum',
    [n('Des nombres dans une colonne ou une ligne', 'Numbers in a column or a row'), n('Une cellule vide où afficher le total', 'An empty cell to show the total')],
    [
      st('Choisis où afficher le total', 'Pick where the total goes', `<p>Clique la cellule du résultat, par exemple juste sous ta colonne de nombres. Sur iPad, touche la cellule.</p>`, `<p>Click the result cell, for example right under your column of numbers. On iPad, tap the cell.</p>`),
      st('Tape =SOMME(', 'Type =SUM(', `<p>Écris <code>=SOMME(</code> : le <code>=</code>, le nom de la fonction, puis une parenthèse ouverte. Excel propose la fonction pendant que tu tapes, tu peux la choisir dans la liste.</p>`, `<p>Write <code>=SUM(</code>: the <code>=</code>, the function name, then an opening parenthesis. Excel suggests the function as you type; you can pick it from the list.</p>`),
      st('Sélectionne la plage', 'Select the range', `<p>Glisse sur les cellules à additionner (de <code>B2</code> à <code>B5</code>) ou tape <code>B2:B5</code>. Un cadre coloré entoure la plage dans le tableau : c'est ce que la formule va additionner.</p>`, `<p>Drag over the cells to add up (<code>B2</code> to <code>B5</code>) or type <code>B2:B5</code>. A coloured frame surrounds the range in the table: that's what the formula will add up.</p>`),
      st('Ferme et valide', 'Close and confirm', `<p>Tape <code>)</code> puis <kbd>Entrée</kbd> (sur iPad, la coche ✓ au-dessus du clavier). Le total s'affiche ; la formule reste lisible dans la barre de formule.</p>`, `<p>Type <code>)</code> then <kbd>Enter</kbd> (on iPad, the ✓ tick above the keyboard). The total shows; the formula stays readable in the formula bar.</p>`),
      st('Le raccourci', 'The shortcut', `<p><strong>Windows :</strong> clique sous tes nombres puis <kbd>Alt</kbd> + <kbd>=</kbd>, et <kbd>Entrée</kbd>. <strong>iPad :</strong> onglet <em>Accueil</em> → <em>Somme automatique</em> (Σ).</p>`, `<p><strong>Windows:</strong> click under your numbers then <kbd>Alt</kbd> + <kbd>=</kbd>, and <kbd>Enter</kbd>. <strong>iPad:</strong> <em>Home</em> tab → <em>AutoSum</em> (Σ).</p>`),
    ],
    [n('Un nombre aligné à gauche est souvent du texte : il n\'est pas additionné.', 'A number aligned to the left is often text: it isn\'t added.'), n('Une ligne ajoutée <em>en dehors</em> de la plage n\'est pas comptée. Insère-la à l\'intérieur.', 'A row added <em>outside</em> the range isn\'t counted. Insert it inside.')]);

  add('average',
    [n('Des nombres dans une plage', 'Numbers in a range'), n('Savoir si les zéros doivent compter (un 0 compte, une case vide non)', 'Knowing whether zeros should count (a 0 counts, an empty cell doesn\'t)')],
    [
      st('Choisis la cellule du résultat', 'Pick the result cell', `<p>Clique où tu veux voir la moyenne.</p>`, `<p>Click where you want to see the average.</p>`),
      st('Tape =MOYENNE(', 'Type =AVERAGE(', `<p>Même forme que <code>SOMME</code> : <code>=MOYENNE(</code> puis la plage.</p>`, `<p>Same shape as <code>SUM</code>: <code>=AVERAGE(</code> then the range.</p>`),
      st('Sélectionne la plage', 'Select the range', `<p>Glisse sur les valeurs, ou tape <code>B2:B5</code>. Ne sélectionne pas la ligne du total si elle est dans la même colonne : elle fausserait la moyenne.</p>`, `<p>Drag over the values, or type <code>B2:B5</code>. Don't include the total row if it's in the same column: it would skew the average.</p>`),
      st('Valide et vérifie', 'Confirm and check', `<p>Ferme la parenthèse et valide. Vérifie à l'œil : la moyenne doit se situer entre ta plus petite et ta plus grande valeur.</p>`, `<p>Close the parenthesis and confirm. Sanity-check: the average must sit between your smallest and largest values.</p>`),
    ],
    [n('Une cellule <strong>vide</strong> est ignorée, mais un <code>0</code> est compté : ça change la moyenne.', 'An <strong>empty</strong> cell is ignored, but a <code>0</code> is counted: it changes the average.'), n('La moyenne cache les extrêmes : regarde aussi MIN et MAX.', 'The average hides extremes: look at MIN and MAX too.')]);

  add('minmax',
    [n('Une plage de nombres', 'A range of numbers')],
    [
      st('Le plus grand : MAX', 'The largest: MAX', `<p>Dans une cellule libre : <code>=MAX(B2:B5)</code>. Excel renvoie la plus grande valeur de la plage.</p>`, `<p>In a free cell: <code>=MAX(B2:B5)</code>. Excel returns the largest value in the range.</p>`),
      st('Le plus petit : MIN', 'The smallest: MIN', `<p>Dans une autre cellule : <code>=MIN(B2:B5)</code>.</p>`, `<p>In another cell: <code>=MIN(B2:B5)</code>.</p>`),
      st('Les combiner', 'Combine them', `<p>Pour l'écart entre le meilleur et le pire : <code>=MAX(B2:B5)-MIN(B2:B5)</code>. Chaque fonction a sa plage ; Excel fait la soustraction à la fin.</p>`, `<p>For the gap between best and worst: <code>=MAX(B2:B5)-MIN(B2:B5)</code>. Each function has its own range; Excel subtracts at the end.</p>`),
      st('Retrouver la ligne', 'Find the row', `<p>Pour savoir <em>qui</em> a le maximum, combine avec <code>INDEX</code> et <code>EQUIV</code> (voir leur entrée).</p>`, `<p>To find <em>who</em> has the maximum, combine with <code>INDEX</code> and <code>MATCH</code> (see their entry).</p>`),
    ],
    [n('Le texte est ignoré : si ton « nombre » est du texte, il ne sera pas trouvé.', 'Text is ignored: if your "number" is text, it won\'t be found.')]);

  add('counta',
    [n('Une plage à compter', 'A range to count')],
    [
      st('Choisis ce que tu comptes', 'Decide what you count', `<p><code>NBVAL</code> compte les cellules <strong>non vides</strong> (texte ou nombres). <code>NB</code> ne compte que les <strong>nombres</strong>.</p>`, `<p><code>COUNTA</code> counts <strong>non-empty</strong> cells (text or numbers). <code>COUNT</code> counts only <strong>numbers</strong>.</p>`),
      st('Écris la formule', 'Write the formula', `<p>Pour compter des lignes remplies, prends une colonne qui est toujours remplie (les numéros, les noms) : <code>=NBVAL(A8:A17)</code>.</p>`, `<p>To count filled rows, use a column that is always filled (numbers, names): <code>=COUNTA(A8:A17)</code>.</p>`),
      st('Vérifie', 'Check', `<p>Compte à l'œil sur un petit tableau. Si le résultat est trop grand, une cellule en apparence vide contient peut-être une espace.</p>`, `<p>Count by eye on a small table. If the result is too big, a seemingly empty cell may hold a space.</p>`),
    ],
    [n('Si tu ajoutes des lignes sous la plage, élargis-la (ou utilise un tableau Excel).', 'If you add rows under the range, widen it (or use an Excel table).')]);

  add('if',
    [n('Une condition claire (« plus grand que… », « égal à… »)', 'A clear condition ("greater than…", "equal to…")'), n('Les deux résultats possibles', 'The two possible results')],
    [
      st('Écris la condition en français d\'abord', 'Say the condition in plain words first', `<p>Par exemple : « si les ventes sont d'au moins 1 000 $ ». Cherche la cellule (<code>B2</code>) et le seuil (<code>1000</code>).</p>`, `<p>For example: "if sales are at least $1,000". Find the cell (<code>B2</code>) and the threshold (<code>1000</code>).</p>`),
      st('Traduis-la', 'Translate it', `<p>« Au moins » se dit <code>&gt;=</code>. La condition devient <code>B2&gt;=1000</code>. Les autres : <code>&gt;</code> <code>&lt;</code> <code>&lt;=</code> <code>=</code> <code>&lt;&gt;</code>.</p>`, `<p>"At least" is <code>&gt;=</code>. The condition becomes <code>B2&gt;=1000</code>. The others: <code>&gt;</code> <code>&lt;</code> <code>&lt;=</code> <code>=</code> <code>&lt;&gt;</code>.</p>`),
      st('Ajoute les deux résultats', 'Add the two results', `<p><code>=SI(condition ; si_vrai ; si_faux)</code> donne <code>=SI(B2&gt;=1000;100;0)</code>. Un <strong>texte</strong> va entre guillemets : <code>"Oui"</code>.</p>`, `<p><code>=IF(condition, if_true, if_false)</code> gives <code>=IF(B2&gt;=1000,100,0)</code>. <strong>Text</strong> goes in quotes: <code>"Yes"</code>.</p>`),
      st('Teste les deux côtés', 'Test both sides', `<p>Essaie une valeur au-dessus, une en dessous, et <strong>pile sur la limite</strong> (1 000). C'est là que <code>&gt;</code> et <code>&gt;=</code> se distinguent.</p>`, `<p>Try a value above, one below, and <strong>exactly on the limit</strong> (1,000). That's where <code>&gt;</code> and <code>&gt;=</code> differ.</p>`),
    ],
    [n('En français, les parties se séparent par <code>;</code>, pas par une virgule.', 'In French Excel, the parts are separated by <code>;</code>, not a comma.'), n('Oublier les guillemets autour d\'un texte donne <code>#NOM?</code>.', 'Forgetting quotes around text gives <code>#NAME?</code>.')]);

  add('nested-if',
    [n('Trois résultats ou plus', 'Three results or more'), n('Les paliers, rangés du plus exigeant au moins exigeant', 'The thresholds, ordered from most to least demanding')],
    [
      st('Liste tes paliers', 'List your tiers', `<p>Exemple : 1 000 et plus = Or, 500 et plus = Argent, sinon Bronze. Écris-les sur papier, du plus haut au plus bas.</p>`, `<p>Example: 1,000 and up = Gold, 500 and up = Silver, otherwise Bronze. Write them down, highest first.</p>`),
      st('Écris le premier SI', 'Write the first IF', `<p><code>=SI(B2&gt;=1000;"Or";…)</code> : le premier palier, et son résultat. À la place du « sinon », on va continuer.</p>`, `<p><code>=IF(B2&gt;=1000,"Gold",…)</code>: the first tier and its result. In place of the "else", we'll continue.</p>`),
      st('Glisse un deuxième SI', 'Nest a second IF', `<p>Remplace le « … » par un SI : <code>SI(B2&gt;=500;"Argent";"Bronze")</code>. Le dernier « sinon » est le cas par défaut.</p>`, `<p>Replace the "…" with an IF: <code>IF(B2&gt;=500,"Silver","Bronze")</code>. The last "else" is the default case.</p>`),
      st('Compte les parenthèses', 'Count the parentheses', `<p>Il faut autant de <code>)</code> que de <code>(</code> : ici deux fermantes à la fin. Excel colore les paires pendant que tu écris.</p>`, `<p>You need as many <code>)</code> as <code>(</code>: here, two closing at the end. Excel colours the pairs as you type.</p>`),
    ],
    [n('Si tu testes le palier le plus bas en premier, tout le monde y tombe. Va du plus exigeant au moins exigeant.', 'If you test the lowest tier first, everyone lands there. Go from most to least demanding.'), n('Au-delà de 3 ou 4 niveaux, une table de correspondance avec RECHERCHEV est plus lisible.', 'Beyond 3 or 4 levels, a lookup table with VLOOKUP is easier to read.')]);

  add('and-or',
    [n('Deux conditions ou plus à combiner', 'Two or more conditions to combine')],
    [
      st('Choisis ET ou OU', 'Choose AND or OR', `<p><code>ET</code> : toutes les conditions doivent être vraies. <code>OU</code> : une seule suffit.</p>`, `<p><code>AND</code>: every condition must be true. <code>OR</code>: just one is enough.</p>`),
      st('Écris les conditions dans ET / OU', 'Write the conditions inside AND / OR', `<p><code>ET(B2&gt;=1000;C2="Oui")</code> : ventes d'au moins 1 000 <em>et</em> objectif atteint.</p>`, `<p><code>AND(B2&gt;=1000,C2="Yes")</code>: sales of at least 1,000 <em>and</em> target met.</p>`),
      st('Glisse le tout dans un SI', 'Drop it all inside an IF', `<p><code>=SI(ET(B2&gt;=1000;C2="Oui");100;0)</code>. ET devient la condition du SI.</p>`, `<p><code>=IF(AND(B2&gt;=1000,C2="Yes"),100,0)</code>. AND becomes the IF's condition.</p>`),
    ],
    [n('Ne pas écrire <code>B2&gt;=1000 ET …</code> comme en français : en Excel, ET est une fonction avec des parenthèses.', 'Don\'t write <code>B2&gt;=1000 AND …</code> as in a sentence: in Excel, AND is a function with parentheses.')]);

  add('sumif',
    [n('Une colonne de critères (catégories, statuts…)', 'A criteria column (categories, statuses…)'), n('Une colonne de montants, de la même hauteur', 'A column of amounts, of the same height'), n('Le critère, idéalement dans une cellule', 'The criterion, ideally in a cell')],
    [
      st('Repère les trois morceaux', 'Spot the three pieces', `<p>1) <strong>Où chercher</strong> (la colonne des catégories) · 2) <strong>Quoi chercher</strong> (la cellule avec « Thé ») · 3) <strong>Quoi additionner</strong> (la colonne des montants).</p>`, `<p>1) <strong>Where to look</strong> (the category column) · 2) <strong>What to look for</strong> (the cell holding "Tea") · 3) <strong>What to add up</strong> (the amount column).</p>`),
      st('Écris la formule', 'Write the formula', `<p><code>=SOMME.SI(A2:A6;D2;B2:B6)</code>. Les deux plages doivent avoir <strong>la même taille</strong>.</p>`, `<p><code>=SUMIF(A2:A6,D2,B2:B6)</code>. Both ranges must be <strong>the same size</strong>.</p>`),
      st('Change le critère pour tester', 'Change the criterion to test', `<p>Remplace le texte de la cellule critère : le total change sans toucher à la formule. C'est l'intérêt de mettre le critère dans une cellule.</p>`, `<p>Change the text in the criterion cell: the total changes without touching the formula. That's the point of putting the criterion in a cell.</p>`),
      st('Plus d\'un critère ?', 'More than one criterion?', `<p>Passe à <code>SOMME.SI.ENS</code> (voir son entrée).</p>`, `<p>Move up to <code>SUMIFS</code> (see its entry).</p>`),
    ],
    [n('Une faute de frappe ou une espace en trop dans le critère donne 0.', 'A typo or an extra space in the criterion gives 0.'), n('Avec une condition comme <code>"&gt;100"</code>, les guillemets sont obligatoires.', 'With a condition like <code>"&gt;100"</code>, the quotes are required.')]);

  add('countif',
    [n('Une plage à regarder', 'A range to look through'), n('Le critère (un mot, un nombre ou une condition)', 'The criterion (a word, a number or a condition)')],
    [
      st('Écris la plage', 'Write the range', `<p><code>=NB.SI(B2:B7;…)</code> : la colonne où regarder, par exemple les statuts.</p>`, `<p><code>=COUNTIF(B2:B7,…)</code>: the column to look in, for example the statuses.</p>`),
      st('Ajoute le critère', 'Add the criterion', `<p>Une cellule (<code>D2</code>), un mot entre guillemets (<code>"Livré"</code>) ou une condition (<code>"&gt;100"</code>).</p>`, `<p>A cell (<code>D2</code>), a word in quotes (<code>"Delivered"</code>) or a condition (<code>"&gt;100"</code>).</p>`),
      st('Vérifie', 'Check', `<p>Compte à la main sur quelques lignes. Écris le critère <strong>exactement</strong> comme dans la liste (accents compris).</p>`, `<p>Count a few rows by hand. Spell the criterion <strong>exactly</strong> as in the list (accents included).</p>`),
    ],
    [n('<code>NB.SI</code> ne fait pas la différence entre majuscules et minuscules, mais bien entre « Livré » et « Livre ».', '<code>COUNTIF</code> ignores upper/lower case but does tell "Délivré" from "Delivre" apart.')]);

  add('sumifs',
    [n('Plusieurs colonnes de critères', 'Several criteria columns'), n('Une colonne à additionner (ou à compter)', 'A column to add up (or count)')],
    [
      st('Commence par la plage à additionner', 'Start with the range to add up', `<p>Contrairement à SOMME.SI, elle vient <strong>en premier</strong> : <code>=SOMME.SI.ENS(C2:C20;…)</code>.</p>`, `<p>Unlike SUMIF, it comes <strong>first</strong>: <code>=SUMIFS(C2:C20,…)</code>.</p>`),
      st('Ajoute une paire par critère', 'Add one pair per criterion', `<p>Chaque critère = une plage + une condition : <code>A2:A20;"Bougie";B2:B20;"Nord"</code>. Toutes les plages ont la même taille.</p>`, `<p>Each criterion = a range + a condition: <code>A2:A20,"Candle",B2:B20,"North"</code>. All ranges are the same size.</p>`),
      st('Pour compter', 'To count', `<p><code>NB.SI.ENS</code> fonctionne pareil, sans plage à additionner.</p>`, `<p><code>COUNTIFS</code> works the same way, without a range to add up.</p>`),
    ],
    [n('Tous les critères doivent être vrais en même temps (c\'est un ET).', 'All criteria must be true at once (it\'s an AND).')]);

  add('vlookup',
    [n('Un tableau dont la <strong>première colonne</strong> contient ce que tu cherches', 'A table whose <strong>first column</strong> holds what you look for'), n('Le numéro de la colonne qui contient la réponse', 'The number of the column that holds the answer')],
    [
      st('Ce que tu cherches', 'What you look for', `<p>Le premier morceau : la cellule qui contient le code, par exemple <code>E2</code>.</p>`, `<p>The first piece: the cell holding the code, for example <code>E2</code>.</p>`),
      st('Le tableau', 'The table', `<p>Sélectionne tout le tableau, à partir de la colonne des codes : <code>A2:C5</code>. Les codes doivent être dans la <strong>première</strong> colonne de la sélection.</p>`, `<p>Select the whole table, starting from the code column: <code>A2:C5</code>. The codes must be in the <strong>first</strong> column of the selection.</p>`),
      st('Le numéro de colonne', 'The column number', `<p>Compte à partir de la <strong>première colonne du tableau</strong> : si le prix est dans la 3<sup>e</sup>, écris <code>3</code>.</p>`, `<p>Count from the <strong>table's first column</strong>: if the price is in the 3rd, write <code>3</code>.</p>`),
      st('FAUX pour « exact »', 'FALSE for "exact"', `<p>Termine par <code>FAUX</code> : <code>=RECHERCHEV(E2;A2:C5;3;FAUX)</code>. Sans lui, Excel peut renvoyer une valeur voisine sans prévenir.</p>`, `<p>End with <code>FALSE</code>: <code>=VLOOKUP(E2,A2:C5,3,FALSE)</code>. Without it, Excel may return a neighbouring value without warning.</p>`),
      st('Si tu vois #N/A', 'If you see #N/A', `<p>Le code n'existe pas dans la première colonne (ou contient une espace en trop). Entoure ensuite avec <code>SIERREUR</code> pour un message propre.</p>`, `<p>The code isn't in the first column (or has an extra space). Then wrap it in <code>IFERROR</code> for a clean message.</p>`),
    ],
    [n('RECHERCHEV ne peut pas regarder à gauche de la colonne de recherche : utilise INDEX + EQUIV.', 'VLOOKUP can\'t look left of the search column: use INDEX + MATCH.'), n('Si tu recopies la formule vers le bas, verrouille le tableau : <code>$A$2:$C$5</code>.', 'If you copy the formula down, lock the table: <code>$A$2:$C$5</code>.')]);

  add('index-match',
    [n('Une colonne où chercher', 'A column to search'), n('Une colonne qui contient la réponse (n\'importe où)', 'A column that holds the answer (anywhere)')],
    [
      st('Trouve la position avec EQUIV', 'Find the position with MATCH', `<p><code>=EQUIV(E2;B2:B5;0)</code> répond « en 3<sup>e</sup> position ». Le <code>0</code> veut dire « valeur exacte ».</p>`, `<p><code>=MATCH(E2,B2:B5,0)</code> answers "in 3rd position". The <code>0</code> means "exact match".</p>`),
      st('Prends la valeur avec INDEX', 'Take the value with INDEX', `<p><code>=INDEX(C2:C5;3)</code> renvoie la 3<sup>e</sup> case de la colonne des prix.</p>`, `<p><code>=INDEX(C2:C5,3)</code> returns the 3rd cell of the price column.</p>`),
      st('Assemble-les', 'Put them together', `<p>Remplace le <code>3</code> par l'EQUIV : <code>=INDEX(C2:C5;EQUIV(E2;B2:B5;0))</code>. Les deux plages ont la même taille.</p>`, `<p>Replace the <code>3</code> with the MATCH: <code>=INDEX(C2:C5,MATCH(E2,B2:B5,0))</code>. Both ranges are the same size.</p>`),
    ],
    [n('Si les plages ne commencent pas à la même ligne, la position est décalée.', 'If the ranges don\'t start on the same row, the position is off.')]);

  add('xlookup',
    [n('Excel 365 ou 2021 (pas dans les versions plus anciennes)', 'Excel 365 or 2021 (not in older versions)')],
    [
      st('Vérifie ta version', 'Check your version', `<p>Commence à taper <code>=RECHERCHEX(</code> : si Excel la propose, tu l'as. Sinon, utilise INDEX + EQUIV.</p>`, `<p>Start typing <code>=XLOOKUP(</code>: if Excel suggests it, you have it. Otherwise, use INDEX + MATCH.</p>`),
      st('Trois morceaux', 'Three pieces', `<p><code>=RECHERCHEX(ce que je cherche ; où chercher ; quoi renvoyer)</code>, avec deux plages de même taille.</p>`, `<p><code>=XLOOKUP(what I look for, where to look, what to return)</code>, with two ranges of the same size.</p>`),
      st('Gère l\'introuvable', 'Handle "not found"', `<p>Ajoute un quatrième morceau : <code>"Introuvable"</code>. Plus besoin de SIERREUR.</p>`, `<p>Add a fourth piece: <code>"Not found"</code>. No need for IFERROR.</p>`),
    ],
    [n('Un fichier avec RECHERCHEX s\'affiche mal chez quelqu\'un qui a une ancienne version.', 'A file using XLOOKUP looks broken for someone with an older version.')]);

  add('iferror',
    [n('Une formule qui marche déjà quand tout est correct', 'A formula that already works when everything is correct')],
    [
      st('Fais marcher la formule seule', 'Get the formula working alone', `<p>Teste d'abord ta formule sans SIERREUR. Sinon, tu risques de cacher une vraie faute.</p>`, `<p>Test your formula first without IFERROR. Otherwise you may hide a real mistake.</p>`),
      st('Entoure-la', 'Wrap it', `<p>Écris <code>=SIERREUR(</code> devant, puis ta formule <em>sans</em> son <code>=</code>.</p>`, `<p>Write <code>=IFERROR(</code> in front, then your formula <em>without</em> its <code>=</code>.</p>`),
      st('Ajoute le message', 'Add the message', `<p>Après un <code>;</code>, le texte de remplacement : <code>"Introuvable"</code>. Ferme la parenthèse.</p>`, `<p>After a <code>,</code>, the replacement text: <code>"Not found"</code>. Close the parenthesis.</p>`),
      st('Teste la panne', 'Test the failure', `<p>Tape un code qui n'existe pas : ton message doit apparaître à la place de <code>#N/A</code>.</p>`, `<p>Type a code that doesn't exist: your message should appear instead of <code>#N/A</code>.</p>`),
    ],
    [n('SIERREUR cache <strong>toutes</strong> les erreurs, y compris une faute dans ta formule.', 'IFERROR hides <strong>all</strong> errors, including a mistake in your formula.')]);

  add('round',
    [n('Un nombre avec des décimales', 'A number with decimals'), n('Savoir si tu arrondis au plus proche, vers le haut ou vers le bas', 'Knowing whether you round to nearest, up or down')],
    [
      st('Choisis la fonction', 'Pick the function', `<p><code>ARRONDI</code> : au plus proche. <code>ARRONDI.SUP</code> : toujours vers le haut. <code>ARRONDI.INF</code> : toujours vers le bas.</p>`, `<p><code>ROUND</code>: to the nearest. <code>ROUNDUP</code>: always up. <code>ROUNDDOWN</code>: always down.</p>`),
      st('Écris le nombre et les décimales', 'Write the number and the decimals', `<p><code>=ARRONDI(B2;2)</code> garde 2 décimales. Avec <code>0</code>, on obtient un entier ; avec <code>-1</code>, on arrondit à la dizaine.</p>`, `<p><code>=ROUND(B2,2)</code> keeps 2 decimals. With <code>0</code>, you get a whole number; with <code>-1</code>, you round to the ten.</p>`),
      st('Pourquoi pas juste le format ?', 'Why not just the format?', `<p>Le format change l'<em>affichage</em>, pas la valeur : les totaux utilisent encore les décimales cachées. <code>ARRONDI</code> change la valeur elle-même.</p>`, `<p>The format changes the <em>display</em>, not the value: totals still use the hidden decimals. <code>ROUND</code> changes the value itself.</p>`),
    ],
    [n('Pour un nombre d\'objets à vendre (point mort), arrondis vers le haut : on ne vend pas 0,4 bougie.', 'For a number of items to sell (break-even), round up: you can\'t sell 0.4 of a candle.')]);

  /* ------------------------------------------------------------ basics */
  add('formula-basics',
    [n('Une cellule où écrire', 'A cell to write in'), n('Les adresses des cellules à utiliser', 'The addresses of the cells to use')],
    [
      st('Clique la cellule du résultat', 'Click the result cell', `<p>C'est là que le résultat va s'afficher. Sur iPad, touche la cellule.</p>`, `<p>That's where the result will show. On iPad, tap the cell.</p>`),
      st('Commence par =', 'Start with =', `<p>Sans ce signe, Excel croit que tu écris du texte.</p>`, `<p>Without this sign, Excel thinks you're typing text.</p>`),
      st('Clique les cellules plutôt que de taper des chiffres', 'Click cells instead of typing numbers', `<p>Clique <code>B2</code>, tape <code>*</code>, clique <code>C2</code> : <code>=B2*C2</code>. Chaque adresse prend une couleur.</p>`, `<p>Click <code>B2</code>, type <code>*</code>, click <code>C2</code>: <code>=B2*C2</code>. Each address gets a colour.</p>`),
      st('Valide', 'Confirm', `<p><kbd>Entrée</kbd> sous Windows, ✓ sur iPad. <kbd>Échap</kbd> annule.</p>`, `<p><kbd>Enter</kbd> on Windows, ✓ on iPad. <kbd>Esc</kbd> cancels.</p>`),
      st('Relis dans la barre de formule', 'Re-read it in the formula bar', `<p>Clique la cellule : la formule apparaît dans la barre au-dessus du tableau, le résultat reste dans la cellule.</p>`, `<p>Click the cell: the formula shows in the bar above the table, the result stays in the cell.</p>`),
    ],
    [n('Ordre des calculs : parenthèses, puissance, × et ÷, puis + et −. En cas de doute, ajoute des parenthèses.', 'Order of operations: parentheses, power, × and ÷, then + and −. When in doubt, add parentheses.'), n('Un chiffre tapé dans la formule (<code>=B2*1,15</code>) ne se met pas à jour tout seul.', 'A number typed into the formula (<code>=B2*1.15</code>) doesn\'t update by itself.')]);

  add('cell-reference',
    [n('Un tableau avec des lettres (colonnes) et des numéros (lignes)', 'A table with letters (columns) and numbers (rows)')],
    [
      st('Lis l\'adresse', 'Read the address', `<p><code>C5</code> = colonne C, ligne 5. La lettre vient toujours en premier.</p>`, `<p><code>C5</code> = column C, row 5. The letter always comes first.</p>`),
      st('Vois-la dans la boîte de nom', 'See it in the Name Box', `<p>En haut à gauche, la boîte de nom affiche la cellule sélectionnée. Tu peux y taper une adresse pour t'y rendre.</p>`, `<p>At the top left, the Name Box shows the selected cell. You can type an address there to jump to it.</p>`),
      st('Recopie une formule', 'Copy a formula', `<p>Recopiée vers le bas, <code>B2</code> devient <code>B3</code>, <code>B4</code>… Les références <strong>glissent</strong> : c'est la référence relative.</p>`, `<p>Copied down, <code>B2</code> becomes <code>B3</code>, <code>B4</code>… References <strong>slide</strong>: that's a relative reference.</p>`),
      st('Fige ce qui ne doit pas bouger', 'Lock what must not move', `<p>Pour une cellule fixe (un taux), ajoute des <code>$</code> : <code>$E$1</code>. Voir « Références absolues ».</p>`, `<p>For a fixed cell (a rate), add <code>$</code>: <code>$E$1</code>. See "Absolute references".</p>`),
    ],
    [n('Si tu déplaces une formule en la copiant-collant, les références glissent aussi.', 'If you move a formula by copy-pasting, the references slide too.')]);

  add('absolute-ref',
    [n('Une valeur fixe dans une cellule (un taux, un revenu)', 'A fixed value in a cell (a rate, an income)'), n('Une formule à recopier sur plusieurs lignes', 'A formula to copy over several rows')],
    [
      st('Écris la formule normalement', 'Write the formula normally', `<p><code>=B2*(1+E1)</code>. Elle marche pour la première ligne.</p>`, `<p><code>=B2*(1+E1)</code>. It works for the first row.</p>`),
      st('Place le curseur sur la référence fixe', 'Put the cursor on the fixed reference', `<p>Clique dans la barre de formule, sur <code>E1</code>, ou fais-le pendant que tu tapes.</p>`, `<p>Click in the formula bar on <code>E1</code>, or do it while typing.</p>`),
      st('Appuie sur F4', 'Press F4', `<p>Ça ajoute les <code>$</code> : <code>$E$1</code>. Un autre appui donne <code>E$1</code>, puis <code>$E1</code>, puis revient. <em>Sans clavier (iPad) :</em> tape les <code>$</code> à la main.</p>`, `<p>That adds the <code>$</code>: <code>$E$1</code>. Another press gives <code>E$1</code>, then <code>$E1</code>, then loops. <em>No keyboard (iPad):</em> type the <code>$</code> by hand.</p>`),
      st('Recopie et vérifie', 'Copy down and check', `<p>Recopie vers le bas, puis clique la dernière ligne : <code>B2</code> a glissé en <code>B5</code>, mais <code>$E$1</code> est resté.</p>`, `<p>Copy down, then click the last row: <code>B2</code> slid to <code>B5</code>, but <code>$E$1</code> stayed.</p>`),
    ],
    [n('Oublier le <code>$</code> donne des résultats faux, ou <code>#DIV/0!</code> quand la référence glisse sur une case vide.', 'Forgetting the <code>$</code> gives wrong results, or <code>#DIV/0!</code> when the reference slides onto an empty cell.'), n('<code>$E$1</code> verrouille colonne et ligne ; <code>E$1</code> seulement la ligne ; <code>$E1</code> seulement la colonne.', '<code>$E$1</code> locks column and row; <code>E$1</code> only the row; <code>$E1</code> only the column.')]);

  add('range',
    [n('Un groupe de cellules voisines', 'A group of neighbouring cells')],
    [
      st('Écris le début et la fin', 'Write the start and the end', `<p><code>B2:B5</code> : première cellule, deux-points, dernière cellule. Les deux-points veulent dire « jusqu'à ».</p>`, `<p><code>B2:B5</code>: first cell, colon, last cell. The colon means "through".</p>`),
      st('Ou sélectionne à la souris', 'Or select with the mouse', `<p>Glisse sur les cellules (sur iPad, glisse avec le doigt depuis une poignée de sélection) : Excel écrit la plage pour toi.</p>`, `<p>Drag over the cells (on iPad, drag a selection handle with your finger): Excel writes the range for you.</p>`),
      st('Plusieurs colonnes', 'Several columns', `<p><code>A2:C5</code> forme un rectangle : colonnes A à C, lignes 2 à 5.</p>`, `<p><code>A2:C5</code> is a rectangle: columns A to C, rows 2 to 5.</p>`),
      st('Colonne entière', 'A whole column', `<p><code>B:B</code> prend toute la colonne B, même les lignes que tu ajouteras plus tard.</p>`, `<p><code>B:B</code> takes the whole column B, even rows you add later.</p>`),
    ],
    [n('Ne mets pas la ligne de total dans la plage qu\'elle additionne : ça crée une référence circulaire.', 'Don\'t put the total row inside the range it adds up: it creates a circular reference.')]);

  add('fill-handle',
    [n('Une cellule avec une formule', 'A cell holding a formula')],
    [
      st('Clique la cellule', 'Click the cell', `<p>Elle est entourée d'un cadre, avec un petit carré en bas à droite : c'est la poignée de recopie.</p>`, `<p>It has a frame with a small square at the bottom-right: the fill handle.</p>`),
      st('Double-clique la poignée', 'Double-click the handle', `<p>Excel recopie la formule vers le bas, jusqu'à la fin de tes données.</p>`, `<p>Excel copies the formula down to the end of your data.</p>`),
      st('Ou fais-la glisser', 'Or drag it', `<p>Tire la poignée sur les lignes voulues. <em>iPad :</em> touche la cellule, puis tire la poignée (un petit rond) avec le doigt.</p>`, `<p>Drag the handle over the rows you want. <em>iPad:</em> tap the cell, then drag the handle (a small circle) with your finger.</p>`),
      st('Vérifie la dernière ligne', 'Check the last row', `<p>Clique la dernière cellule et relis sa formule : les références ont glissé comme prévu.</p>`, `<p>Click the last cell and re-read its formula: the references slid as expected.</p>`),
    ],
    [n('Le double-clic s\'arrête au premier trou dans la colonne voisine.', 'Double-click stops at the first gap in the neighbouring column.')]);

  add('text-vs-number',
    [n('Une colonne qui ne se calcule pas comme prévu', 'A column that doesn\'t calculate as expected')],
    [
      st('Repère le symptôme', 'Spot the symptom', `<p>Les nombres sont alignés à gauche, un petit triangle vert apparaît, ou la SOMME donne 0.</p>`, `<p>Numbers are aligned left, a small green triangle appears, or SUM gives 0.</p>`),
      st('Convertis', 'Convert', `<p>Sélectionne la colonne, puis <em>Données → Convertir</em> (Windows) et termine. Ou multiplie par 1 dans une colonne à côté.</p>`, `<p>Select the column, then <em>Data → Text to Columns</em> (Windows) and finish. Or multiply by 1 in a column next to it.</p>`),
      st('Règle le format', 'Fix the format', `<p>Mets le format <em>Nombre</em> ou <em>Monétaire</em> (<kbd>Ctrl</kbd> + <kbd>1</kbd>).</p>`, `<p>Set the <em>Number</em> or <em>Currency</em> format (<kbd>Ctrl</kbd> + <kbd>1</kbd>).</p>`),
    ],
    [n('Un nombre avec une apostrophe devant (\'12) est du texte.', 'A number with an apostrophe in front (\'12) is text.'), n('Dans un fichier importé, des espaces invisibles transforment parfois un nombre en texte.', 'In an imported file, invisible spaces sometimes turn a number into text.')]);

  add('dates',
    [n('Une date saisie ou importée', 'A date typed or imported')],
    [
      st('Comprends : une date est un nombre', 'Understand: a date is a number', `<p>Excel compte les jours depuis 1900. C'est pour ça qu'on peut les additionner : date du devis + 30 jours.</p>`, `<p>Excel counts days since 1900. That's why you can add them: quote date + 30 days.</p>`),
      st('Applique le format date', 'Apply the date format', `<p>Si tu vois un nombre comme <code>45695</code> : sélectionne les cellules, <kbd>Ctrl</kbd> + <kbd>1</kbd> → <em>Date</em>.</p>`, `<p>If you see a number like <code>45695</code>: select the cells, <kbd>Ctrl</kbd> + <kbd>1</kbd> → <em>Date</em>.</p>`),
      st('Calcule', 'Calculate', `<p>Date limite : <code>=C8+D8</code>. Nombre de jours entre deux dates : <code>=C8-B8</code> (mets le résultat en format <em>Nombre</em>).</p>`, `<p>Deadline: <code>=C8+D8</code>. Days between two dates: <code>=C8-B8</code> (set the result to <em>Number</em> format).</p>`),
    ],
    [n('Au Canada, l\'ordre jour/mois/année dépend de la langue de ton Windows : vérifie qu\'Excel lit bien la date.', 'In Canada, day/month/year order depends on your Windows language: check that Excel reads the date correctly.')]);

  add('number-format',
    [n('Les cellules à mettre en forme', 'The cells to format')],
    [
      st('Sélectionne les cellules', 'Select the cells', `<p>Plusieurs zones : maintiens <kbd>Ctrl</kbd> en cliquant. Sur iPad, sélectionne une zone à la fois.</p>`, `<p>Several areas: hold <kbd>Ctrl</kbd> while clicking. On iPad, select one area at a time.</p>`),
      st('Ouvre le format', 'Open the format', `<p><kbd>Ctrl</kbd> + <kbd>1</kbd> → onglet <em>Nombre</em>. <em>iPad :</em> <em>Accueil</em> → menu <em>Format numérique</em>.</p>`, `<p><kbd>Ctrl</kbd> + <kbd>1</kbd> → <em>Number</em> tab. <em>iPad:</em> <em>Home</em> → <em>Number Format</em> menu.</p>`),
      st('Choisis le type', 'Pick the type', `<p><em>Monétaire</em> pour le $ (2 décimales), <em>Pourcentage</em> pour un taux, <em>Date</em> pour une date.</p>`, `<p><em>Currency</em> for $ (2 decimals), <em>Percentage</em> for a rate, <em>Date</em> for a date.</p>`),
      st('Vérifie la valeur', 'Check the value', `<p>Le format change l'affichage seulement : clique la cellule, la barre de formule montre la vraie valeur.</p>`, `<p>The format only changes the display: click the cell, the formula bar shows the real value.</p>`),
    ],
    [n('Choisis bien le <strong>$</strong> et non l\'euro dans la liste des symboles.', 'Pick the <strong>$</strong> and not the euro in the symbol list.'), n('Mets le format Pourcentage <em>avant</em> de taper 5 : sinon Excel lit 5, pas 5 %.', 'Apply the Percentage format <em>before</em> typing 5: otherwise Excel reads 5, not 5%.')]);

  add('percent',
    [n('Un nombre en pourcentage ou un taux', 'A percentage or a rate')],
    [
      st('Comprends : 20 % = 0,2', 'Understand: 20% = 0.2', `<p>Excel stocke le pourcentage comme une fraction de 1. Le format ajoute le signe % à l'affichage.</p>`, `<p>Excel stores a percentage as a fraction of 1. The format adds the % sign for display.</p>`),
      st('Écris le taux dans une cellule', 'Put the rate in a cell', `<p>Tape <code>5%</code> (avec le signe) ou <code>0,05</code>, puis mets le format Pourcentage.</p>`, `<p>Type <code>5%</code> (with the sign) or <code>0.05</code>, then apply the Percentage format.</p>`),
      st('Utilise-le dans une formule', 'Use it in a formula', `<p>Ajouter une taxe : <code>=B2*(1+$E$1)</code>. Calculer la part : <code>=C2/$B$3</code>.</p>`, `<p>Adding a tax: <code>=B2*(1+$E$1)</code>. Working out a share: <code>=C2/$B$3</code>.</p>`),
    ],
    [n('Ne tape pas <code>=B2*5</code> pour 5 % : ça multiplie par 5, pas par 0,05.', 'Don\'t type <code>=B2*5</code> for 5%: that multiplies by 5, not 0.05.')]);

  add('table-structure',
    [n('Des données à organiser', 'Data to organise')],
    [
      st('Une ligne = un élément', 'One row = one item', `<p>Une vente, un client, un devis. Jamais deux éléments sur une même ligne.</p>`, `<p>One sale, one client, one quote. Never two items on the same row.</p>`),
      st('Une colonne = une information', 'One column = one piece of information', `<p>Date, client, montant… Ne mélange pas deux informations dans une cellule (« 12 $ Nord »).</p>`, `<p>Date, client, amount… Don't mix two pieces of information in one cell ("$12 North").</p>`),
      st('Des en-têtes sur la première ligne', 'Headers on the first row', `<p>Un titre court par colonne, sans cellules fusionnées.</p>`, `<p>A short title per column, with no merged cells.</p>`),
      st('Pas de lignes ni de colonnes vides', 'No empty rows or columns', `<p>Elles coupent le tableau en deux pour les filtres et les tableaux croisés.</p>`, `<p>They split the table in two for filters and pivot tables.</p>`),
    ],
    [n('Les totaux se mettent à côté ou dans un autre tableau, pas au milieu des données.', 'Totals go beside or in another table, not in the middle of the data.')]);

  add('merged-cells',
    [n('Un titre ou une mise en page à centrer', 'A title or a layout to centre')],
    [
      st('Évite de fusionner dans les données', 'Avoid merging in your data', `<p>Les cellules fusionnées bloquent le tri, les filtres et les tableaux croisés.</p>`, `<p>Merged cells block sorting, filters and pivot tables.</p>`),
      st('Utilise « Centrer sur plusieurs colonnes »', 'Use "Center Across Selection"', `<p>Sélectionne la zone, <kbd>Ctrl</kbd> + <kbd>1</kbd> → <em>Alignement</em> → Horizontal : <em>Centré sur plusieurs colonnes</em>. L'effet est le même, sans fusion.</p>`, `<p>Select the area, <kbd>Ctrl</kbd> + <kbd>1</kbd> → <em>Alignment</em> → Horizontal: <em>Center Across Selection</em>. Same look, no merging.</p>`),
      st('Défusionne si besoin', 'Unmerge if needed', `<p><em>Accueil → Fusionner et centrer</em> (clique-le une fois de plus pour défusionner).</p>`, `<p><em>Home → Merge &amp; Center</em> (click it again to unmerge).</p>`),
    ],
    [n('Les cellules fusionnées dans un tableau de données causent presque toujours des problèmes plus tard.', 'Merged cells in a data table almost always cause trouble later.')]);

  add('excel-table',
    [n('Des données avec une ligne d\'en-têtes, sans lignes vides', 'Data with a header row and no empty rows')],
    [
      st('Clique dans les données', 'Click inside the data', `<p>N'importe quelle cellule du tableau suffit.</p>`, `<p>Any cell in the table is enough.</p>`),
      st('Crée le tableau', 'Create the table', `<p><kbd>Ctrl</kbd> + <kbd>T</kbd>, coche « Mon tableau comporte des en-têtes », OK. <em>iPad :</em> <em>Insertion → Tableau</em>.</p>`, `<p><kbd>Ctrl</kbd> + <kbd>T</kbd>, tick "My table has headers", OK. <em>iPad:</em> <em>Insert → Table</em>.</p>`),
      st('Donne-lui un nom', 'Give it a name', `<p>Onglet <em>Création de tableau</em> → Nom du tableau (par exemple <code>Ventes</code>).</p>`, `<p><em>Table Design</em> tab → Table Name (for example <code>Sales</code>).</p>`),
      st('Profite des avantages', 'Enjoy the benefits', `<p>Filtres automatiques, couleurs en alternance, formules recopiées toutes seules et plage qui s'agrandit avec tes nouvelles lignes.</p>`, `<p>Automatic filters, banded colours, formulas filled down by themselves, and a range that grows with your new rows.</p>`),
    ],
    [n('Dans un tableau, les formules utilisent des noms de colonnes (<code>[@Quantité]</code>) : le vérificateur du site préfère les références classiques comme <code>D2</code>.', 'In a table, formulas use column names (<code>[@Quantity]</code>): the site\'s checker prefers classic references like <code>D2</code>.')]);

  add('sort-filter',
    [n('Un tableau avec des en-têtes', 'A table with headers')],
    [
      st('Clique dans la colonne à trier', 'Click in the column to sort', `<p>Une seule cellule de la colonne suffit : Excel prend tout le tableau.</p>`, `<p>A single cell of the column is enough: Excel takes the whole table.</p>`),
      st('Trie', 'Sort', `<p><em>Données → Trier de A à Z</em> (ou du plus petit au plus grand). Toutes les colonnes suivent ensemble.</p>`, `<p><em>Data → Sort A to Z</em> (or smallest to largest). All columns move together.</p>`),
      st('Active les filtres', 'Turn on filters', `<p><kbd>Ctrl</kbd> + <kbd>Maj</kbd> + <kbd>L</kbd>, ou <em>Données → Filtrer</em>. Des flèches apparaissent sur les en-têtes.</p>`, `<p><kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>L</kbd>, or <em>Data → Filter</em>. Arrows appear on the headers.</p>`),
      st('Filtre', 'Filter', `<p>Clique la flèche, coche les valeurs à garder. Pour tout réafficher : <em>Effacer le filtre</em>.</p>`, `<p>Click the arrow, tick the values to keep. To show everything again: <em>Clear Filter</em>.</p>`),
    ],
    [n('Ne sélectionne pas une seule colonne avant de trier : les autres ne suivraient pas et tes lignes se mélangeraient.', 'Don\'t select a single column before sorting: the others wouldn\'t follow and your rows would get scrambled.')]);

  add('freeze-panes',
    [n('Un tableau assez long pour défiler', 'A table long enough to scroll')],
    [
      st('Clique sous la ligne à figer', 'Click below the row to freeze', `<p>Pour figer l'en-tête de la ligne 7, clique dans la cellule <strong>A8</strong> (juste en dessous).</p>`, `<p>To freeze the header on row 7, click cell <strong>A8</strong> (right below).</p>`),
      st('Fige les volets', 'Freeze the panes', `<p><em>Affichage → Figer les volets → Figer les volets</em>. <em>iPad :</em> onglet <em>Affichage</em> → <em>Figer les volets</em>.</p>`, `<p><em>View → Freeze Panes → Freeze Panes</em>. <em>iPad:</em> <em>View</em> tab → <em>Freeze Panes</em>.</p>`),
      st('Teste', 'Test', `<p>Fais défiler : l'en-tête reste visible. Pour annuler : <em>Libérer les volets</em>.</p>`, `<p>Scroll: the header stays visible. To undo: <em>Unfreeze Panes</em>.</p>`),
    ],
    [n('Excel fige tout ce qui est <em>au-dessus et à gauche</em> de la cellule choisie.', 'Excel freezes everything <em>above and to the left</em> of the chosen cell.')]);

  add('cond-format',
    [n('Les cellules à surveiller', 'The cells to watch'), n('Une règle claire (« moins de 0 », « égal à Accepté »)', 'A clear rule ("less than 0", "equal to Accepted")')],
    [
      st('Sélectionne les cellules', 'Select the cells', `<p>Par exemple le reste de chaque catégorie, <code>D6:D12</code>.</p>`, `<p>For example the amount left in each category, <code>D6:D12</code>.</p>`),
      st('Ouvre le menu', 'Open the menu', `<p><em>Accueil → Mise en forme conditionnelle</em> (iPad : même onglet, même bouton).</p>`, `<p><em>Home → Conditional Formatting</em> (iPad: same tab, same button).</p>`),
      st('Choisis la règle', 'Pick the rule', `<p><em>Règles de mise en surbrillance → Inférieur à…</em> pour un seuil simple. Pour comparer à une autre cellule ou un statut : <em>Nouvelle règle → Utiliser une formule</em>.</p>`, `<p><em>Highlight Cells Rules → Less Than…</em> for a simple threshold. To compare with another cell or a status: <em>New Rule → Use a formula</em>.</p>`),
      st('Choisis la couleur', 'Pick the colour', `<p>Un remplissage rose pâle avec un texte foncé reste lisible.</p>`, `<p>A pale pink fill with dark text stays readable.</p>`),
      st('Teste', 'Test', `<p>Change une valeur : la couleur doit suivre toute seule.</p>`, `<p>Change a value: the colour must follow by itself.</p>`),
    ],
    [n('Avec une formule, la référence de ligne doit être relative et celle de colonne verrouillée : <code>=$I8=$K$8</code>.', 'With a formula, the row reference must be relative and the column locked: <code>=$I8=$K$8</code>.')]);

  add('data-validation',
    [n('Les cellules à contrôler', 'The cells to control'), n('La liste des choix permis, écrite quelque part dans le fichier', 'The list of allowed choices, written somewhere in the file')],
    [
      st('Écris la liste des choix', 'Write the list of choices', `<p>Par exemple « Accepté », « En attente », « Refusé » dans trois cellules (<code>K8:K10</code>).</p>`, `<p>For example "Accepted", "Pending", "Declined" in three cells (<code>K8:K10</code>).</p>`),
      st('Sélectionne les cellules', 'Select the cells', `<p>Celles qui recevront la liste déroulante (<code>I8:I17</code>).</p>`, `<p>The ones that will get the dropdown (<code>I8:I17</code>).</p>`),
      st('Ouvre la validation', 'Open validation', `<p><em>Données → Validation des données</em> (iPad : onglet <em>Données</em>).</p>`, `<p><em>Data → Data Validation</em> (iPad: <em>Data</em> tab).</p>`),
      st('Choisis « Liste »', 'Choose "List"', `<p>Autoriser : <em>Liste</em>. Source : <code>=$K$8:$K$10</code> (ou clique la plage).</p>`, `<p>Allow: <em>List</em>. Source: <code>=$K$8:$K$10</code> (or click the range).</p>`),
      st('Teste', 'Test', `<p>Une flèche apparaît à droite de chaque cellule : choisis un élément.</p>`, `<p>An arrow appears at the right of each cell: pick an item.</p>`),
    ],
    [n('Une liste tapée directement (<code>Oui,Non</code>) marche, mais une liste dans des cellules est plus facile à modifier.', 'A list typed directly (<code>Yes,No</code>) works, but a list in cells is easier to edit.')]);

  add('pivot',
    [n('Des données en tableau propre (en-têtes, sans lignes vides)', 'Data in a clean table (headers, no empty rows)'), n('Une question : « combien par… ? »', 'A question: "how much per…?"')],
    [
      st('Clique dans les données', 'Click in the data', `<p>N'importe quelle cellule du tableau.</p>`, `<p>Any cell in the table.</p>`),
      st('Insère le tableau croisé', 'Insert the pivot table', `<p><em>Insertion → Tableau croisé dynamique</em>, nouvelle feuille, OK. <em>iPad :</em> <em>Insertion → Tableau croisé dynamique</em>.</p>`, `<p><em>Insert → PivotTable</em>, new worksheet, OK. <em>iPad:</em> <em>Insert → PivotTable</em>.</p>`),
      st('Glisse un champ en Lignes', 'Drag a field to Rows', `<p>Par exemple « Catégorie » : ce que tu veux regrouper.</p>`, `<p>For example "Category": what you want to group.</p>`),
      st('Glisse un champ en Valeurs', 'Drag a field to Values', `<p>Par exemple « Montant ». Vérifie que c'est une <strong>Somme</strong> (et non un Nombre).</p>`, `<p>For example "Amount". Check it's a <strong>Sum</strong> (not a Count).</p>`),
      st('Va plus loin', 'Go further', `<p>Ajoute un champ en <em>Colonnes</em> pour croiser deux dimensions, ou un segment (slicer) pour filtrer.</p>`, `<p>Add a field in <em>Columns</em> to cross two dimensions, or a slicer to filter.</p>`),
    ],
    [n('Le tableau croisé ne se met pas à jour tout seul : <em>Données → Actualiser tout</em> après avoir changé les données.', 'The pivot table doesn\'t update by itself: <em>Data → Refresh All</em> after changing the data.')]);

  add('slicer',
    [n('Un tableau croisé dynamique existant', 'An existing pivot table')],
    [
      st('Clique dans le tableau croisé', 'Click in the pivot table', `<p>L'onglet <em>Analyse du tableau croisé</em> apparaît.</p>`, `<p>The <em>PivotTable Analyze</em> tab appears.</p>`),
      st('Insère un segment', 'Insert a slicer', `<p><em>Insérer un segment</em>, coche un champ (par exemple « Région »), OK.</p>`, `<p><em>Insert Slicer</em>, tick a field (for example "Region"), OK.</p>`),
      st('Filtre en un clic', 'Filter in one click', `<p>Clique un bouton du segment : le tableau se filtre. <kbd>Ctrl</kbd> + clic pour en choisir plusieurs ; la croix en haut efface le filtre.</p>`, `<p>Click a slicer button: the table filters. <kbd>Ctrl</kbd> + click to pick several; the cross at the top clears the filter.</p>`),
    ],
    [n('Sur iPad, les segments existants fonctionnent, mais vérifie que ta version permet d\'en créer.', 'On iPad, existing slicers work, but check that your version lets you create one.')]);

  add('chart-basics',
    [n('Des données avec des libellés (catégories) et des valeurs', 'Data with labels (categories) and values')],
    [
      st('Sélectionne les libellés et les valeurs', 'Select labels and values', `<p>Par exemple <code>A5:C12</code> : catégories, prévu, dépensé (en-têtes compris).</p>`, `<p>For example <code>A5:C12</code>: categories, planned, spent (headers included).</p>`),
      st('Insère le graphique', 'Insert the chart', `<p><em>Insertion → Graphiques recommandés</em>, ou choisis Histogramme (comparer), Secteurs (parts d'un tout) ou Courbe (évolution).</p>`, `<p><em>Insert → Recommended Charts</em>, or choose Column (compare), Pie (parts of a whole) or Line (trend).</p>`),
      st('Donne-lui un titre', 'Give it a title', `<p>Clique le titre et écris ce que le graphique montre, pas « Graphique 1 ».</p>`, `<p>Click the title and write what the chart shows, not "Chart 1".</p>`),
      st('Allège', 'Simplify', `<p>Retire les lignes en trop, garde 2 ou 3 couleurs pastel. Un graphique doit se lire en 5 secondes.</p>`, `<p>Remove extra lines, keep 2 or 3 pastel colours. A chart should read in 5 seconds.</p>`),
    ],
    [n('Un secteur (camembert) ne montre bien que 4 à 5 parts. Au-delà, préfère des barres.', 'A pie chart only reads well with 4 or 5 slices. Beyond that, use bars.')]);

  add('download-open',
    [n('Une connexion internet', 'An internet connection'), n('Excel installé (Windows ou iPad)', 'Excel installed (Windows or iPad)')],
    [
      st('Touche le bouton de téléchargement', 'Tap the download button', `<p>Le fichier part vers ton dossier <em>Téléchargements</em> (Windows) ou vers <em>Fichiers</em> (iPad).</p>`, `<p>The file goes to your <em>Downloads</em> folder (Windows) or to <em>Files</em> (iPad).</p>`),
      st('Trouve-le', 'Find it', `<p><strong>Windows :</strong> la flèche de téléchargement du navigateur, ou le dossier Téléchargements. <strong>iPad :</strong> l'icône de flèche dans Safari, puis <em>Téléchargements</em>.</p>`, `<p><strong>Windows:</strong> the browser's download arrow, or the Downloads folder. <strong>iPad:</strong> the arrow icon in Safari, then <em>Downloads</em>.</p>`),
      st('Ouvre-le dans Excel', 'Open it in Excel', `<p>Double-clic (Windows) ou toucher (iPad), puis « Ouvrir avec Excel ».</p>`, `<p>Double-click (Windows) or tap (iPad), then "Open with Excel".</p>`),
      st('Active la modification', 'Enable editing', `<p>Si une bande jaune dit « Mode protégé », clique <em>Activer la modification</em>.</p>`, `<p>If a yellow bar says "Protected View", click <em>Enable Editing</em>.</p>`),
      st('Enregistre une copie', 'Save a copy', `<p><kbd>F12</kbd> sous Windows, ou <em>Fichier → Enregistrer une copie</em> sur iPad : garde l'original intact.</p>`, `<p><kbd>F12</kbd> on Windows, or <em>File → Save a Copy</em> on iPad: keeps the original untouched.</p>`),
    ],
    [n('Enregistre toujours en <strong>.xlsx</strong> pour pouvoir le faire vérifier sur le site.', 'Always save as <strong>.xlsx</strong> so it can be checked on the site.')]);

  /* ------------------------------------------------------------ shortcuts */
  add('keys-essential',
    [n('Un clavier (sur iPad : un clavier externe)', 'A keyboard (on iPad: an external keyboard)')],
    [
      st('Annuler / rétablir', 'Undo / redo', `<p><kbd>Ctrl</kbd> + <kbd>Z</kbd> annule, <kbd>Ctrl</kbd> + <kbd>Y</kbd> rétablit.</p>`, `<p><kbd>Ctrl</kbd> + <kbd>Z</kbd> undoes, <kbd>Ctrl</kbd> + <kbd>Y</kbd> redoes.</p>`),
      st('Copier / coller', 'Copy / paste', `<p><kbd>Ctrl</kbd> + <kbd>C</kbd>, <kbd>Ctrl</kbd> + <kbd>V</kbd>. <kbd>Ctrl</kbd> + <kbd>X</kbd> pour couper.</p>`, `<p><kbd>Ctrl</kbd> + <kbd>C</kbd>, <kbd>Ctrl</kbd> + <kbd>V</kbd>. <kbd>Ctrl</kbd> + <kbd>X</kbd> to cut.</p>`),
      st('Enregistrer', 'Save', `<p><kbd>Ctrl</kbd> + <kbd>S</kbd> toutes les quelques minutes.</p>`, `<p><kbd>Ctrl</kbd> + <kbd>S</kbd> every few minutes.</p>`),
      st('Naviguer vite', 'Move quickly', `<p><kbd>Ctrl</kbd> + flèches saute au bout des données. <kbd>Ctrl</kbd> + <kbd>Début</kbd> retourne en A1.</p>`, `<p><kbd>Ctrl</kbd> + arrows jumps to the end of the data. <kbd>Ctrl</kbd> + <kbd>Home</kbd> returns to A1.</p>`),
    ],
    [n('Sur iPad sans clavier, utilise les boutons du ruban : les raccourcis ne sont pas disponibles.', 'On iPad without a keyboard, use the ribbon buttons: shortcuts aren\'t available.')]);

  add('key-select',
    [n('Un tableau de données', 'A table of data')],
    [
      st('Une colonne ou une ligne', 'A column or a row', `<p><kbd>Ctrl</kbd> + <kbd>Espace</kbd> sélectionne la colonne, <kbd>Maj</kbd> + <kbd>Espace</kbd> la ligne.</p>`, `<p><kbd>Ctrl</kbd> + <kbd>Space</kbd> selects the column, <kbd>Shift</kbd> + <kbd>Space</kbd> the row.</p>`),
      st('Tout le tableau', 'The whole table', `<p><kbd>Ctrl</kbd> + <kbd>A</kbd> (deux fois en dehors d'un tableau).</p>`, `<p><kbd>Ctrl</kbd> + <kbd>A</kbd> (twice outside a table).</p>`),
      st('Jusqu\'au bout des données', 'To the end of the data', `<p><kbd>Ctrl</kbd> + <kbd>Maj</kbd> + flèche étend la sélection jusqu'à la dernière cellule remplie.</p>`, `<p><kbd>Ctrl</kbd> + <kbd>Shift</kbd> + arrow extends the selection to the last filled cell.</p>`),
      st('Zones séparées', 'Separate areas', `<p>Maintiens <kbd>Ctrl</kbd> en cliquant ou en glissant.</p>`, `<p>Hold <kbd>Ctrl</kbd> while clicking or dragging.</p>`),
    ],
    []);

  add('key-f4',
    [n('Une référence dans une formule en cours d\'écriture', 'A reference in a formula being written')],
    [
      st('Écris ou clique la référence', 'Write or click the reference', `<p>Dans la formule, place le curseur sur <code>E1</code>.</p>`, `<p>In the formula, put the cursor on <code>E1</code>.</p>`),
      st('Appuie sur F4', 'Press F4', `<p><code>E1</code> → <code>$E$1</code> → <code>E$1</code> → <code>$E1</code> → retour. Sur certains portables : <kbd>Fn</kbd> + <kbd>F4</kbd>.</p>`, `<p><code>E1</code> → <code>$E$1</code> → <code>E$1</code> → <code>$E1</code> → back. On some laptops: <kbd>Fn</kbd> + <kbd>F4</kbd>.</p>`),
      st('Arrête-toi sur la bonne forme', 'Stop on the right form', `<p>Pour un taux fixe : <code>$E$1</code>.</p>`, `<p>For a fixed rate: <code>$E$1</code>.</p>`),
    ],
    [n('Sur iPad sans clavier, tape les <code>$</code> à la main.', 'On iPad without a keyboard, type the <code>$</code> by hand.')]);

  add('key-autosum',
    [n('Une colonne ou une ligne de nombres', 'A column or a row of numbers')],
    [
      st('Clique sous (ou à droite) des nombres', 'Click under (or right of) the numbers', `<p>La cellule vide juste après le dernier nombre.</p>`, `<p>The empty cell right after the last number.</p>`),
      st('Alt + =', 'Alt + =', `<p>Excel écrit <code>=SOMME(…)</code> et entoure la plage qu'il propose.</p>`, `<p>Excel writes <code>=SUM(…)</code> and frames the range it proposes.</p>`),
      st('Vérifie et valide', 'Check and confirm', `<p>Contrôle que le cadre couvre bien tous les nombres, puis <kbd>Entrée</kbd>.</p>`, `<p>Check that the frame covers all the numbers, then <kbd>Enter</kbd>.</p>`),
    ],
    [n('Sur iPad : <em>Accueil → Somme automatique (Σ)</em>.', 'On iPad: <em>Home → AutoSum (Σ)</em>.')]);

  add('key-format',
    [n('Les cellules à formater', 'The cells to format')],
    [
      st('Sélectionne', 'Select', `<p>La ou les zones à formater.</p>`, `<p>The area or areas to format.</p>`),
      st('Ctrl + 1', 'Ctrl + 1', `<p>La fenêtre <em>Format de cellule</em> s'ouvre : Nombre, Alignement, Police, Bordure, Remplissage.</p>`, `<p>The <em>Format Cells</em> window opens: Number, Alignment, Font, Border, Fill.</p>`),
      st('Raccourcis rapides', 'Quick shortcuts', `<p><kbd>Ctrl</kbd> + <kbd>Maj</kbd> + <kbd>$</kbd> = monétaire, <kbd>Ctrl</kbd> + <kbd>Maj</kbd> + <kbd>%</kbd> = pourcentage, <kbd>Ctrl</kbd> + <kbd>G</kbd> = gras.</p>`, `<p><kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>$</kbd> = currency, <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>%</kbd> = percent, <kbd>Ctrl</kbd> + <kbd>B</kbd> = bold.</p>`),
    ],
    [n('Sur iPad, passe par l\'onglet <em>Accueil</em>.', 'On iPad, use the <em>Home</em> tab.')]);

  /* ------------------------------------------------------------ errors */
  add('err-div0',
    [n('La cellule qui affiche <code>#DIV/0!</code>', 'The cell showing <code>#DIV/0!</code>')],
    [
      st('Comprends', 'Understand', `<p>Excel essaie de diviser par zéro, ou par une case vide.</p>`, `<p>Excel is trying to divide by zero, or by an empty cell.</p>`),
      st('Clique la cellule et lis la formule', 'Click the cell and read the formula', `<p>Repère la division (<code>/</code>) et la cellule du dessous (le diviseur).</p>`, `<p>Spot the division (<code>/</code>) and the cell underneath (the divisor).</p>`),
      st('Vérifie le diviseur', 'Check the divisor', `<p>Est-il vide ou à 0 ? Souvent, une référence a <strong>glissé</strong> en recopiant : il manquait un <code>$</code>.</p>`, `<p>Is it empty or 0? Often a reference <strong>slid</strong> when copying: a <code>$</code> was missing.</p>`),
      st('Corrige ou protège', 'Fix or protect', `<p>Remplis la case ou verrouille la référence. Si le zéro est normal : <code>=SI(B2=0;0;A2/B2)</code>.</p>`, `<p>Fill the cell or lock the reference. If zero is expected: <code>=IF(B2=0,0,A2/B2)</code>.</p>`),
    ],
    []);
  add('err-na',
    [n('La cellule qui affiche <code>#N/A</code>', 'The cell showing <code>#N/A</code>')],
    [
      st('Comprends', 'Understand', `<p>Une recherche n'a rien trouvé.</p>`, `<p>A lookup found nothing.</p>`),
      st('Compare ce que tu cherches et la liste', 'Compare what you look for with the list', `<p>Une espace en trop, un accent, une majuscule différente ou un nombre stocké comme texte suffisent à empêcher la correspondance.</p>`, `<p>An extra space, an accent, or a number stored as text is enough to break the match.</p>`),
      st('Vérifie la plage', 'Check the range', `<p>La valeur cherchée est-elle dans la <strong>première colonne</strong> du tableau (RECHERCHEV) ?</p>`, `<p>Is the searched value in the table's <strong>first column</strong> (VLOOKUP)?</p>`),
      st('Affiche un message propre', 'Show a clean message', `<p>Entoure avec <code>SIERREUR</code> une fois que la formule marche.</p>`, `<p>Wrap with <code>IFERROR</code> once the formula works.</p>`),
    ],
    []);
  add('err-ref',
    [n('La cellule qui affiche <code>#REF!</code>', 'The cell showing <code>#REF!</code>')],
    [
      st('Comprends', 'Understand', `<p>La formule pointe vers une cellule qui n'existe plus : ligne ou colonne supprimée.</p>`, `<p>The formula points to a cell that no longer exists: a deleted row or column.</p>`),
      st('Essaie d\'annuler', 'Try undoing', `<p><kbd>Ctrl</kbd> + <kbd>Z</kbd> juste après la suppression.</p>`, `<p><kbd>Ctrl</kbd> + <kbd>Z</kbd> right after the deletion.</p>`),
      st('Sinon, réécris la référence', 'Otherwise, rewrite the reference', `<p>Clique la cellule, remplace le <code>#REF!</code> dans la formule par la bonne cellule.</p>`, `<p>Click the cell, replace the <code>#REF!</code> in the formula with the right cell.</p>`),
    ],
    [n('Avant de supprimer une ligne ou une colonne, vérifie que rien ne s\'y réfère.', 'Before deleting a row or column, check that nothing refers to it.')]);
  add('err-name',
    [n('La cellule qui affiche <code>#NOM?</code>', 'The cell showing <code>#NAME?</code>')],
    [
      st('Comprends', 'Understand', `<p>Excel ne reconnaît pas un mot de ta formule.</p>`, `<p>Excel doesn't recognise a word in your formula.</p>`),
      st('Vérifie l\'orthographe de la fonction', 'Check the function spelling', `<p>En français : SOMME, SI, MOYENNE, RECHERCHEV… (pas SUM, IF). Excel propose la fonction pendant que tu tapes.</p>`, `<p>In English: SUM, IF, AVERAGE, VLOOKUP…</p>`),
      st('Vérifie les adresses', 'Check the addresses', `<p>Une faute comme <code>BC</code> au lieu de <code>C2</code> est lue comme un nom inconnu.</p>`, `<p>A slip like <code>BC</code> instead of <code>C2</code> is read as an unknown name.</p>`),
      st('Mets les textes entre guillemets', 'Put text in quotes', `<p><code>"Livré"</code>, pas <code>Livré</code>.</p>`, `<p><code>"Delivered"</code>, not <code>Delivered</code>.</p>`),
    ],
    []);
  add('err-value',
    [n('La cellule qui affiche <code>#VALEUR!</code>', 'The cell showing <code>#VALUE!</code>')],
    [
      st('Comprends', 'Understand', `<p>Excel essaie de calculer avec quelque chose qui n'est pas un nombre.</p>`, `<p>Excel is trying to calculate with something that isn't a number.</p>`),
      st('Cherche le texte caché', 'Look for hidden text', `<p>Une espace, un mot ou un nombre stocké comme texte dans une des cellules de la formule.</p>`, `<p>A space, a word, or a number stored as text in one of the formula's cells.</p>`),
      st('Corrige la cellule fautive', 'Fix the offending cell', `<p>Retape le nombre, ou convertis la colonne (voir « Texte ou nombre »).</p>`, `<p>Retype the number, or convert the column (see "Text or number").</p>`),
    ],
    []);
  add('err-hash',
    [n('Une cellule qui affiche <code>#####</code>', 'A cell showing <code>#####</code>')],
    [
      st('Comprends', 'Understand', `<p>Ce n'est pas une vraie erreur : la colonne est trop étroite pour le nombre.</p>`, `<p>It isn't a real error: the column is too narrow for the number.</p>`),
      st('Élargis la colonne', 'Widen the column', `<p>Double-clique la ligne entre deux lettres de colonnes, ou tire-la.</p>`, `<p>Double-click the line between two column letters, or drag it.</p>`),
    ],
    [n('Une date négative peut aussi afficher <code>#####</code> : vérifie ton calcul de dates.', 'A negative date can also show <code>#####</code>: check your date calculation.')]);

  /* ------------------------------------------------------------ finance */
  add('gross-margin',
    [n('Le prix de vente', 'The selling price'), n('Le coût du produit', 'The product\'s cost')],
    [
      st('Calcule la marge en dollars', 'Work out the margin in dollars', `<p>Prix − coût : 50 $ − 30 $ = 20 $.</p>`, `<p>Price − cost: $50 − $30 = $20.</p>`),
      st('Divise par le prix de vente', 'Divide by the selling price', `<p>20 ÷ 50 = 0,4. Pas par le coût : sinon c'est le taux de marge « commercial ».</p>`, `<p>20 ÷ 50 = 0.4. Not by the cost: that would be the markup.</p>`),
      st('Écris-le avec des parenthèses', 'Write it with parentheses', `<p><code>=(B2-C2)/B2</code>. Sans parenthèses, Excel diviserait avant de soustraire.</p>`, `<p><code>=(B2-C2)/B2</code>. Without parentheses, Excel would divide before subtracting.</p>`),
      st('Mets le format %', 'Apply the % format', `<p>0,4 s'affiche 40 %.</p>`, `<p>0.4 shows as 40%.</p>`),
    ],
    [n('Marge brute et marge nette ne sont pas la même chose : la nette retire aussi les autres charges.', 'Gross margin and net margin aren\'t the same: net also subtracts other expenses.')]);
  add('markup',
    [n('Le coût de revient', 'The cost price'), n('Le taux de marge voulu', 'The desired markup')],
    [
      st('Pars du coût', 'Start from the cost', `<p>Coût de revient : matières + main-d'œuvre + autres coûts.</p>`, `<p>Cost price: materials + labour + other costs.</p>`),
      st('Ajoute ta marge', 'Add your markup', `<p>Prix avant taxes = coût × (1 + taux de marge). Avec 50 % : coût × 1,5.</p>`, `<p>Price before tax = cost × (1 + markup). With 50%: cost × 1.5.</p>`),
      st('Ajoute les taxes', 'Add the taxes', `<p>Prix avec taxes = prix avant taxes × (1 + 14,975 %) au Québec.</p>`, `<p>Price with tax = price before tax × (1 + 14.975%) in Quebec.</p>`),
      st('Compare avec le taux de marque', 'Compare with the margin rate', `<p>50 % de marge sur le coût = seulement 33 % de taux de marque sur le prix de vente.</p>`, `<p>A 50% markup on cost = only a 33% margin rate on the selling price.</p>`),
    ],
    [n('Ne mélange pas marge (sur le coût) et marque (sur le prix de vente).', 'Don\'t mix up markup (on cost) and margin (on selling price).')]);
  add('pct-change',
    [n('Une valeur de départ et une valeur d\'arrivée', 'A starting value and an ending value')],
    [
      st('Calcule l\'écart', 'Work out the gap', `<p>Nouveau − ancien : 1 380 − 1 200 = 180.</p>`, `<p>New − old: 1,380 − 1,200 = 180.</p>`),
      st('Divise par la valeur de départ', 'Divide by the starting value', `<p>180 ÷ 1 200 = 0,15.</p>`, `<p>180 ÷ 1,200 = 0.15.</p>`),
      st('Écris la formule', 'Write the formula', `<p><code>=(B3-B2)/B2</code>, puis format Pourcentage : +15 %.</p>`, `<p><code>=(B3-B2)/B2</code>, then Percentage format: +15%.</p>`),
      st('Lis le signe', 'Read the sign', `<p>Positif = hausse, négatif = baisse.</p>`, `<p>Positive = increase, negative = decrease.</p>`),
    ],
    [n('Divise toujours par l\'<strong>ancienne</strong> valeur, pas la nouvelle.', 'Always divide by the <strong>old</strong> value, not the new one.')]);
  add('break-even',
    [n('Les frais fixes', 'The fixed costs'), n('Le prix de vente par unité', 'The selling price per unit'), n('Le coût variable par unité', 'The variable cost per unit')],
    [
      st('Calcule ce que rapporte une vente', 'Work out what one sale earns', `<p>Prix − coût variable : 20 $ − 8 $ = 12 $ par unité.</p>`, `<p>Price − variable cost: $20 − $8 = $12 per unit.</p>`),
      st('Divise les frais fixes', 'Divide the fixed costs', `<p>2 000 ÷ 12 = 166,67 unités.</p>`, `<p>2,000 ÷ 12 = 166.67 units.</p>`),
      st('Arrondis vers le haut', 'Round up', `<p><code>=ARRONDI.SUP(B2/(B3-B4);0)</code> donne 167 : on ne vend pas 0,67 produit.</p>`, `<p><code>=ROUNDUP(B2/(B3-B4),0)</code> gives 167: you can't sell 0.67 of a product.</p>`),
      st('Joue avec les hypothèses', 'Play with the assumptions', `<p>Change le prix ou les frais fixes : le point mort suit.</p>`, `<p>Change the price or the fixed costs: the break-even follows.</p>`),
    ],
    [n('Si le prix est inférieur ou égal au coût variable, il n\'y a pas de point mort (division par zéro ou résultat négatif).', 'If the price is at or below the variable cost, there is no break-even (division by zero or a negative result).')]);
  add('cash-vs-profit',
    [n('Les entrées et sorties d\'argent par mois', 'Monthly cash in and cash out')],
    [
      st('Distingue profit et trésorerie', 'Tell profit and cash apart', `<p>Le profit compte les ventes quand elles sont faites ; la trésorerie, quand l'argent entre ou sort vraiment.</p>`, `<p>Profit counts sales when they are made; cash counts when money actually moves.</p>`),
      st('Écris le solde de départ', 'Write the opening balance', `<p>Le solde du premier mois.</p>`, `<p>The first month's balance.</p>`),
      st('Calcule chaque mois', 'Work out each month', `<p>Solde = solde précédent + entrées − sorties : <code>=D2+B3-C3</code>.</p>`, `<p>Balance = previous balance + receipts − payments: <code>=D2+B3-C3</code>.</p>`),
      st('Repère les mois négatifs', 'Spot negative months', `<p>Une mise en forme conditionnelle les colore : c'est là que l'argent manque, même si l'entreprise est rentable.</p>`, `<p>Conditional formatting colours them: that's where cash runs short, even if the business is profitable.</p>`),
    ],
    [n('Une facture envoyée mais pas payée est une vente, pas encore de l\'argent.', 'An invoice sent but not paid is a sale, not yet cash.')]);
  add('income-statement',
    [n('Les revenus et les charges d\'une période', 'The revenues and expenses of a period')],
    [
      st('Commence par les revenus', 'Start with revenue', `<p>Le total des ventes de la période.</p>`, `<p>Total sales for the period.</p>`),
      st('Retire le coût des ventes', 'Subtract the cost of sales', `<p>Revenus − coût des ventes = <strong>marge brute</strong>.</p>`, `<p>Revenue − cost of sales = <strong>gross margin</strong>.</p>`),
      st('Retire les charges', 'Subtract the expenses', `<p>Loyer, salaires, publicité… = <strong>résultat d'exploitation</strong>.</p>`, `<p>Rent, salaries, advertising… = <strong>operating income</strong>.</p>`),
      st('Termine par le résultat net', 'End with net income', `<p>Après intérêts et impôts : ce qu'il reste vraiment.</p>`, `<p>After interest and taxes: what is really left.</p>`),
    ],
    []);
  add('balance-sheet',
    [n('Ce que possède l\'entreprise et ce qu\'elle doit', 'What the business owns and what it owes')],
    [
      st('Liste l\'actif', 'List the assets', `<p>Ce que l'entreprise possède : argent en banque, stock, équipement.</p>`, `<p>What the business owns: cash in the bank, stock, equipment.</p>`),
      st('Liste le passif', 'List the liabilities', `<p>Ce qu'elle doit : fournisseurs, prêts, taxes à payer.</p>`, `<p>What it owes: suppliers, loans, taxes payable.</p>`),
      st('Calcule les capitaux propres', 'Work out equity', `<p>Actif − passif = ce qui appartient aux propriétaires.</p>`, `<p>Assets − liabilities = what belongs to the owners.</p>`),
      st('Vérifie l\'équilibre', 'Check the balance', `<p>Actif = passif + capitaux propres. Si ce n'est pas le cas, il y a une erreur.</p>`, `<p>Assets = liabilities + equity. If not, there's a mistake.</p>`),
    ],
    []);
  add('depreciation',
    [n('Le coût d\'un équipement', 'The cost of an item of equipment'), n('Sa durée d\'utilisation estimée', 'Its estimated useful life')],
    [
      st('Note le coût et la durée', 'Note the cost and the life', `<p>Un ordinateur à 1 500 $ utilisé 3 ans.</p>`, `<p>A computer at $1,500 used for 3 years.</p>`),
      st('Divise', 'Divide', `<p>1 500 ÷ 3 = 500 $ de charge par année (amortissement linéaire).</p>`, `<p>1,500 ÷ 3 = $500 expense per year (straight-line depreciation).</p>`),
      st('Répartis la charge', 'Spread the expense', `<p>La charge apparaît chaque année dans le compte de résultat, même si tu as payé en une fois.</p>`, `<p>The expense shows up each year in the income statement, even though you paid in one go.</p>`),
    ],
    [n('L\'amortissement est une charge comptable : il ne sort pas d\'argent chaque année.', 'Depreciation is an accounting expense: no cash leaves each year.')]);
  add('compound-interest',
    [n('Un capital de départ', 'A starting capital'), n('Un taux annuel', 'An annual rate'), n('Un nombre d\'années', 'A number of years')],
    [
      st('Mets les trois valeurs dans des cellules', 'Put the three values in cells', `<p>Capital en <code>B2</code>, taux en <code>B3</code> (format %), années en <code>B4</code>.</p>`, `<p>Capital in <code>B2</code>, rate in <code>B3</code> (% format), years in <code>B4</code>.</p>`),
      st('Écris le facteur de croissance', 'Write the growth factor', `<p><code>(1+B3)</code> : à 5 %, c'est 1,05.</p>`, `<p><code>(1+B3)</code>: at 5%, that's 1.05.</p>`),
      st('Élève-le à la puissance des années', 'Raise it to the number of years', `<p><code>(1+B3)^B4</code>. Le signe <code>^</code> veut dire « puissance ».</p>`, `<p><code>(1+B3)^B4</code>. The <code>^</code> sign means "to the power of".</p>`),
      st('Multiplie par le capital', 'Multiply by the capital', `<p><code>=B2*(1+B3)^B4</code> : 1 000 $ à 5 % sur 3 ans donnent 1 157,63 $.</p>`, `<p><code>=B2*(1+B3)^B4</code>: $1,000 at 5% over 3 years gives $1,157.63.</p>`),
    ],
    [n('Si le taux est mensuel, les années doivent être des mois (ou le taux divisé par 12).', 'If the rate is monthly, years must be months (or the rate divided by 12).')]);
  add('sales-tax-ca',
    [n('Le prix avant taxes', 'The price before tax'), n('Ta province (pour connaître les taux)', 'Your province (to know the rates)')],
    [
      st('Trouve les taux', 'Find the rates', `<p>Québec : TPS 5 % + TVQ 9,975 %. Ontario : TVH 13 %. Plusieurs provinces de l'Atlantique : TVH 15 %.</p>`, `<p>Quebec: GST 5% + QST 9.975%. Ontario: HST 13%. Several Atlantic provinces: HST 15%.</p>`),
      st('Mets les taux dans des cellules', 'Put the rates in cells', `<p>Un taux par cellule, en format %. Ainsi, un seul endroit à changer si les taux évoluent.</p>`, `<p>One rate per cell, in % format. That way there's one place to change if rates move.</p>`),
      st('Écris la formule', 'Write the formula', `<p><code>=B2*(1+$E$1+$E$2)</code> : les deux taux sont verrouillés avec des <code>$</code>.</p>`, `<p><code>=B2*(1+$E$1+$E$2)</code>: both rates are locked with <code>$</code>.</p>`),
      st('Recopie vers le bas', 'Copy down', `<p>Le prix glisse d'une ligne à l'autre, les taux restent fixes.</p>`, `<p>The price slides from row to row, the rates stay fixed.</p>`),
    ],
    [n('Ces explications sont générales : pour la déclaration officielle des taxes, vérifie auprès des autorités fiscales.', 'These explanations are general: for official tax filing, check with the tax authorities.')]);
  add('budget-basics',
    [n('Ton revenu du mois', 'Your income for the month'), n('Tes catégories de dépenses', 'Your spending categories')],
    [
      st('Liste les catégories', 'List the categories', `<p>Loyer, épicerie, transport, loisirs, épargne… une ligne chacune.</p>`, `<p>Rent, groceries, transport, fun, savings… one row each.</p>`),
      st('Écris le prévu et le dépensé', 'Write planned and spent', `<p>Deux colonnes : ce que tu prévois, puis ce que tu dépenses vraiment.</p>`, `<p>Two columns: what you plan, then what you really spend.</p>`),
      st('Calcule le reste', 'Work out what is left', `<p><code>=B6-C6</code> : un résultat négatif veut dire que tu as dépassé.</p>`, `<p><code>=B6-C6</code>: a negative result means you went over.</p>`),
      st('Calcule la part du revenu', 'Work out the share of income', `<p><code>=C6/$B$3</code> : le revenu est verrouillé avec des <code>$</code>.</p>`, `<p><code>=C6/$B$3</code>: the income is locked with <code>$</code>.</p>`),
      st('Ajoute les totaux et l\'alerte', 'Add totals and the alert', `<p>Une ligne de total avec <code>SOMME</code>, et une couleur rose quand le reste passe sous zéro.</p>`, `<p>A total row with <code>SUM</code>, and a pink colour when the amount left drops below zero.</p>`),
    ],
    [n('Un budget n\'est utile que s\'il est mis à jour : prends 5 minutes chaque semaine.', 'A budget is only useful if it\'s kept up to date: take 5 minutes each week.')]);
  add('savings-rate',
    [n('Ton revenu', 'Your income'), n('Le montant épargné', 'The amount saved')],
    [
      st('Trouve le montant épargné', 'Find the amount saved', `<p>La ligne « Épargne » de ton budget (400 $).</p>`, `<p>The "Savings" row of your budget ($400).</p>`),
      st('Divise par le revenu', 'Divide by income', `<p><code>=C11/B3</code> : 400 ÷ 3 400.</p>`, `<p><code>=C11/B3</code>: 400 ÷ 3,400.</p>`),
      st('Mets le format %', 'Apply the % format', `<p>Le résultat s'affiche 11,8 %.</p>`, `<p>The result shows 11.8%.</p>`),
      st('Compare', 'Compare', `<p>Une règle courante : 20 % du revenu. C'est un repère, pas une obligation : adapte-le à ta situation.</p>`, `<p>A common rule of thumb: 20% of income. It's a guide, not a requirement: adapt it to your situation.</p>`),
    ],
    []);

  /* ------------------------------------------------------------ design */
  add('palette-rules',
    [n('Une couleur principale (l\'en-tête)', 'A main colour (the header)'), n('Deux ou trois teintes claires', 'Two or three light tints')],
    [
      st('Choisis 2 ou 3 couleurs', 'Pick 2 or 3 colours', `<p>Rose <code>F9B9D0</code>, bleu <code>A8D3F5</code>, pêche <code>FBC9A0</code>, vert <code>BDE5A6</code>, lilas <code>D3B6F3</code>. Pas plus.</p>`, `<p>Pink <code>F9B9D0</code>, blue <code>A8D3F5</code>, peach <code>FBC9A0</code>, green <code>BDE5A6</code>, lilac <code>D3B6F3</code>. No more.</p>`),
      st('Applique la couleur de remplissage', 'Apply the fill colour', `<p><em>Accueil → Couleur de remplissage → Autres couleurs → Personnalisées</em>, tape le code hexadécimal.</p>`, `<p><em>Home → Fill Color → More Colors → Custom</em>, type the hex code.</p>`),
      st('Garde un texte foncé', 'Keep dark text', `<p>Du texte sombre sur fond pastel reste lisible, même sur iPad en plein jour.</p>`, `<p>Dark text on a pastel background stays readable, even on an iPad in daylight.</p>`),
      st('Répète les mêmes couleurs partout', 'Repeat the same colours everywhere', `<p>Une couleur = un rôle (en-tête, saisie, résultat).</p>`, `<p>One colour = one role (header, input, result).</p>`),
    ],
    [n('Du blanc ou du jaune pâle sur du pastel se lit très mal.', 'White or pale yellow on pastel is hard to read.')]);
  add('inputs-vs-results',
    [n('Un tableau avec des cases à remplir et des cases calculées', 'A table with cells to fill in and calculated cells')],
    [
      st('Repère les cases où l\'on tape', 'Spot the cells where you type', `<p>Les valeurs de départ : revenu, prix, quantités.</p>`, `<p>The starting values: income, prices, quantities.</p>`),
      st('Donne-leur une couleur claire', 'Give them a light colour', `<p>Par exemple pêche <code>FDE9D8</code>.</p>`, `<p>For example peach <code>FDE9D8</code>.</p>`),
      st('Repère les cases calculées', 'Spot the calculated cells', `<p>Celles qui contiennent une formule.</p>`, `<p>The ones holding a formula.</p>`),
      st('Donne-leur une autre couleur', 'Give them another colour', `<p>Par exemple vert <code>E4F5DA</code>. Ajoute une petite légende si le tableau sert à d'autres.</p>`, `<p>For example green <code>E4F5DA</code>. Add a small legend if others will use the table.</p>`),
    ],
    [n('Si les deux ont la même couleur, on finit par taper par-dessus une formule.', 'If both have the same colour, someone ends up typing over a formula.')]);
  add('number-alignment',
    [n('Une colonne de nombres', 'A column of numbers')],
    [
      st('Sélectionne la colonne', 'Select the column', `<p>Les nombres seulement, pas l'en-tête.</p>`, `<p>The numbers only, not the header.</p>`),
      st('Aligne à droite', 'Align right', `<p><em>Accueil → Aligner à droite</em>. Les unités tombent sous les unités.</p>`, `<p><em>Home → Align Right</em>. Units sit under units.</p>`),
      st('Même format partout', 'Same format throughout', `<p>Le même nombre de décimales pour toute la colonne.</p>`, `<p>The same number of decimals for the whole column.</p>`),
      st('Aligne l\'en-tête pareil', 'Align the header the same way', `<p>L'en-tête d'une colonne de nombres se met aussi à droite.</p>`, `<p>The header of a number column goes right too.</p>`),
    ],
    []);
  add('contrast',
    [n('Une couleur de fond et une couleur de texte', 'A background colour and a text colour')],
    [
      st('Regarde ton tableau de loin', 'Look at your table from a distance', `<p>Éloigne-toi ou réduis le zoom : tout doit rester lisible.</p>`, `<p>Step back or zoom out: everything must stay readable.</p>`),
      st('Texte foncé sur fond clair', 'Dark text on a light background', `<p>Un gris très foncé ou un noir doux, jamais du gris clair sur du pastel.</p>`, `<p>Very dark grey or soft black, never light grey on pastel.</p>`),
      st('Teste sur l\'écran où tu l\'utilises', 'Test on the screen you use', `<p>Une couleur lisible sur un écran d'ordinateur peut disparaître sur un iPad en plein soleil.</p>`, `<p>A colour that reads well on a computer screen can vanish on an iPad in bright sun.</p>`),
    ],
    []);

  window.NOTEBOOK_STEPS = N;
  // attach to the entries
  (window.NOTEBOOK || []).forEach((e) => { if (N[e.id]) Object.assign(e, N[e.id]); });
})();

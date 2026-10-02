# Excel Académie 🌸

A pastel, step-by-step learning site for Excel, pastel dashboards and finance.
French by default, English with one click. No build step, no framework: plain HTML/CSS/JS.

Three tracks on the home screen:

1. **Excel skills**: tables, formulas, pivot tables, tricks (levels 1 to 5)
2. **Visuals & pastel tools**: design and real build projects
3. **Finance**: financial statements and financial models

Two kinds of practice:

- **Practice inside the site**: a mini Excel where you type a formula and it is checked on changed data.
- **Build in real Excel**: a step-by-step project with a starter `.xlsx`. When finished, you upload your
  file and the site checks formulas, formats and design **in your browser** (the file is never sent anywhere).

## Run it on your computer

```bash
npm install      # only needed for the tests and the starter files
npm start        # then open http://localhost:4173
```

## Where things are

| What | Where |
|---|---|
| All lessons, projects, tracks (FR + EN) | `content/chapters.js` |
| Screens and progress | `js/app.js` |
| Formula checker for practice lessons | `js/engine.js` |
| Reads uploaded .xlsx files | `js/xlsx-reader.js` |
| Project checks | `js/project-checks.js` |
| Colours (all in `:root`) | `css/style.css` |
| Starter / model Excel files | `assets/` (made by `npm run build:starters`) |

## Add a lesson or project

Copy an existing one in `content/chapters.js`. Lesson types: `practice` (formula in the mini sheet),
`quiz`, `build` (Excel project with upload check). Every text is bilingual: `T('français', 'english')`.

For a new build project: add its starter and model in `tools/make-starters.js`, run
`npm run build:starters`, then describe `steps`, `inputs`, `scenarios`, `model` and `checks` in the lesson.

## Tests

```bash
npm test
```

- `tests/verify-content.js`: every practice solution passes its own tests in FR and EN, and a typed-in number does not.
- `tests/verify-projects.js`: the finished model passes every check, the plain starter fails, and sneaky files
  (typed numbers, wrong formulas, same colours, dollars instead of euros) are caught.

## Put it online

The site is on GitHub Pages: every push to `main` updates it. The formula engine and the zip library
are loaded from the jsDelivr CDN (pinned versions in `index.html`).

## Where progress is saved

In the browser (`localStorage`) on each device. It is not shared between devices yet.

## Licence note

The formula engine is [HyperFormula](https://github.com/handsontable/hyperformula) (GPL v3), loaded from a CDN.
That is fine for a free/personal project. If you ever sell the site, check its commercial licence.

# Excel Académie 🌸

A pastel study site for Excel, pastel dashboards and finance. French by default, English with one click.
Plain HTML/CSS/JS, no framework and no build step. Currency is Canadian dollars ($).

## What it does

- **Dashboard** with where you are, what's next, what to review and your badges, plus a sidebar to navigate.
- **Three tracks:** Excel skills (A), Visuals & pastel tools (B), Finance (C).
- **Every lesson is a few short screens** (no long scrolling):
  - *practice*: understand → practise in a mini Excel → remember
  - *quiz*: one question per screen, with "Besoin d'aide ?" and "Voir la réponse"
  - *project*: download the starter → "did it download?" → open it in Excel → one step at a time → upload the `.xlsx` to be checked (in the browser, never sent anywhere)
- **Notebook (Carnet):** 60 searchable entries (functions, basics, shortcuts, errors, finance, design). Open it from the sidebar, the search button, the `/` key, or the help button on any lesson or question.
- **Soft prerequisites:** "recommended before" lessons with *I already know this* and *Continue anyway*. Nothing is locked.
- **First visit:** "Where are you at?" marks what she already knows.

## Run it on your computer

```bash
npm install      # only needed for the tests and the generators
npm start        # then open http://localhost:4173
```

## Where things are

| What | Where |
|---|---|
| Tracks, chapters, first lessons (FR + EN) | `content/chapters.js` |
| More lessons: tables, pivot, tools, design, quote tracker, finance models | `content/lessons-2.js` |
| Notebook entries and which lesson uses which | `content/notebook.js` |
| App core: state, progress, prerequisites | `js/core.js` |
| Shell and router (sidebar, top bar) | `js/app.js` |
| Dashboard, track, chapter, progress, welcome screens | `js/views.js` |
| Lesson screens (practice, quiz, project wizard) | `js/lessons.js` |
| Notebook page and help drawer | `js/notebook-ui.js`, `js/search.js` |
| Formula checker for practice lessons | `js/engine.js` |
| Reads uploaded .xlsx files | `js/xlsx-reader.js` |
| Project checks | `js/project-checks.js` |
| UI text (FR + EN) | `js/i18n.js` |
| Colours, spacing, layout | `css/style.css` (tokens in `:root`) |
| Starter / model Excel files | `assets/` (made by `npm run build:starters`) |
| App icons | `assets/icons/` (made by `node tools/make-icons.js`) |

## Add a lesson or project

Copy an existing one in `content/chapters.js` or `content/lessons-2.js`. Lesson types: `practice`, `quiz`, `build`.
Every text is bilingual: `T('français', 'english')`.

- Add `requires: ['f1', 'f2']` to a lesson (or a chapter) for the prerequisite warning.
- Add its help entries to `NOTES_FOR` in `content/notebook.js` (and `NOTES_FOR_Q` for individual quiz questions).
- A *build* project can check formulas (re-calculated on changed values), formats, fills, dropdowns, conditional-format rules, frozen panes, filters/tables, charts and pivot tables. Add its starter and model in `tools/make-starters.js` or `tools/make-projects.js`, run `npm run build:starters`, then describe `steps`, `inputs`, `scenarios`, `model` and `checks`.

## Tests

```bash
npm test
```

- `verify-content.js`: every practice solution passes its tests in FR and EN, and a typed-in number does not.
- `verify-projects.js`: each finished model passes, each starter fails, and sneaky files (typed numbers, hard-coded values, wrong colours, euros instead of dollars, missing dropdowns, simulated pivot tables) are caught.
- `verify-notebook.js`: every help link points to a real entry, everything exists in FR and EN, and search ranks the right entry first.

## Put it online

The site is on GitHub Pages: every push to `main` updates it. The formula engine and the zip library
come from the jsDelivr CDN (pinned versions in `index.html`).

**Home-screen icon:** on iPad, open the site in Safari → Share → *Add to Home Screen*. If an old shortcut shows a plain "E",
delete it and add it again (iOS keeps the old icon).

## Where progress is saved

In the browser (`localStorage`) on each device. It is not shared between devices yet.

## Licence note

The formula engine is [HyperFormula](https://github.com/handsontable/hyperformula) (GPL v3), loaded from a CDN.
That is fine for a free/personal project. If you ever sell the site, check its commercial licence.

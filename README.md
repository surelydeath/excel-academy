# Excel Académie 🌸

A pastel, step-by-step learning site for Excel and finance. French by default, English with one click.
No build step, no framework: plain HTML/CSS/JS, so it is easy to edit.

## Run it on your computer

```bash
node serve.js
```

Then open http://localhost:4173

## Add or change lessons (the file you will edit most)

Everything lives in `content/chapters.js`. Copy an existing lesson inside a chapter's `lessons` list,
change the `id`, texts, `grid`, `target`, `tests` and `solution`. Every text is bilingual: `T('français', 'english')`.

After editing, check that every solution passes its own tests in both languages:

```bash
node tests/verify-content.js
```

## How an exercise is checked

The learner types a real formula (French names like `SOMME` / English like `SUM`). The app evaluates it
with the HyperFormula engine, then re-runs it on **changed data** (`tests` with `set`). A formula that is
just a typed-in number fails, because it does not follow the data.

## Colours and look

All colours are CSS variables at the top of `css/style.css` (`--peach`, `--pink`, `--blue`, `--green`, `--lilac`, `--yellow`).

## Put it online (free)

- **Netlify Drop**: drag the whole `excel-academy` folder onto https://app.netlify.com/drop
- or **GitHub Pages**: push the folder to a repo and enable Pages.

On an iPad: open the link in Safari, Share, then "Add to Home Screen" to get an app-like icon.

## Where progress is saved

In the browser (`localStorage`) on each device. It is not shared between devices yet.

## Licence note

The formula engine is [HyperFormula](https://github.com/handsontable/hyperformula) (GPL v3, in `vendor/`).
That is fine for a free/personal project. If you ever sell the site, check its commercial licence.

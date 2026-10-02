// Builds ONE self-contained HTML page (for hosts that only take a single file).
// Usage: node build-single-file.js <output.html>
const fs = require('fs'), path = require('path');
const rd = (p) => fs.readFileSync(path.join(__dirname, p), 'utf8');
const VER = '3.4.0';
const js = ['content/chapters.js', 'js/i18n.js', 'js/engine.js', 'js/app.js'].map(rd).join('\n;\n');
if (/<\/script/i.test(js)) throw new Error('A source file contains </script');
const html = `<title>Excel Académie</title>
<meta name="description" content="Apprends Excel et la finance pas à pas : formules, tableaux croisés, états financiers.">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Fredoka:wght@400;500;600;700&family=JetBrains+Mono:wght@500;600&display=swap" rel="stylesheet">
<style>
${rd('css/style.css')}
</style>
<header class="topbar" id="topbar"></header>
<main id="app"></main>
<footer id="footerText"></footer>
<script src="https://cdn.jsdelivr.net/npm/hyperformula@${VER}/dist/hyperformula.full.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/hyperformula@${VER}/dist/languages/frFR.js"></script>
<script>
${js}
</script>
`;
fs.writeFileSync(process.argv[2] || 'excel-academy-single.html', html);
console.log('written', (html.length / 1024).toFixed(0) + ' KB');

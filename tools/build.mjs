import fs from 'node:fs';
for(const p of ['dist/index.html','dist/app.mjs','dist/core.mjs','dist/style.css','dist/sw.js','dist/vendor/fflate.mjs','dist/icon-192.png','dist/icon-512.png'])if(!fs.existsSync(p))throw Error('Missing '+p);
fs.mkdirSync('docs',{recursive:true});fs.cpSync('dist','docs',{recursive:true,filter:p=>!p.endsWith('.idsig')});fs.writeFileSync('docs/.nojekyll','');
console.log('Static app verified; docs/ refreshed for GitHub Pages.');

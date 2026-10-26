import fs from 'node:fs';
import path from 'node:path';

// Run after npm ci. Dependencies remain separately licensed; this is an attribution inventory.
const manifest = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const lock = JSON.parse(fs.readFileSync('package-lock.json', 'utf8'));
let text = '# Third-party notices\n\n';
text += 'SongShowcase was bootstrapped with create-next-app. The retained Next.js/Vercel template SVGs and template-derived code are subject to the Next.js MIT notice reproduced below. Spotify names, artwork, and data remain subject to Spotify terms; this project is not affiliated with Spotify.\n\n';
text += 'The former Blanka font has been omitted from the public history because no redistribution license accompanied it. The interface uses system fonts and Plus Jakarta Sans served by Google Fonts ([SIL Open Font License](https://github.com/google/fonts/blob/main/ofl/plusjakartasans/OFL.txt)); Bootstrap Icons CSS and fonts come from the installed MIT-licensed package. Older revisions used its jsDelivr distribution.\n\n';
text += '## Direct dependencies\n\n| Package | Version | License |\n|---|---|---|\n';
for (const name of Object.keys({ ...manifest.dependencies, ...manifest.devDependencies }).sort()) {
  const p = JSON.parse(fs.readFileSync(path.join('node_modules', name, 'package.json'), 'utf8'));
  text += `| [${name}](https://www.npmjs.com/package/${name}) | ${p.version} | ${p.license ?? 'See package'} |\n`;
}
text += '\n## Dependency license inventory\n\nVersions and declarations from package-lock.json, including transitive and optional dependencies. npm packages retain their own license files; this source repository does not vendor their implementations. Regenerate with `node scripts/third-party-notices.mjs` after dependency changes.\n\n| Package path | Version | License |\n|---|---|---|\n';
for (const [name, p] of Object.entries(lock.packages)) {
  if (name) text += `| ${name} | ${p.version ?? ''} | ${p.license ?? 'See package distribution'} |\n`;
}
text += '\n## Next.js / create-next-app MIT notice\n\n```text\n' + fs.readFileSync('node_modules/next/license.md', 'utf8').trim() + '\n```\n';
text += '\n## Bootstrap Icons MIT notice\n\n```text\n' + fs.readFileSync('node_modules/bootstrap-icons/LICENSE', 'utf8').trim() + '\n```\n';
fs.writeFileSync('THIRD_PARTY_NOTICES.md', text);
fs.appendFileSync('THIRD_PARTY_NOTICES.md', '\n## Original template and icon notices\n\nOriginal notices are also retained for historical revisions:\n\n- [Next.js 14 template, copyright 2023](docs/third-party/original-next-template-MIT.txt)\n- [Bootstrap Icons 1.11.2, copyright 2019-2023](docs/third-party/original-bootstrap-icons-MIT.txt)\n');
console.log('Updated third-party inventory and template/asset notices.');

import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { chargerDonnees, enregistrerReleve, assembler, lireDescriptions } from './donnees.mjs';
import { relevesDemo, NOM_DEMO } from './demo.mjs';
import { nettoyerSaisie } from './releve.mjs';

const PUBLIC = fileURLToPath(new URL(process.env.PUBLIC_DIR ? `file://${process.env.PUBLIC_DIR}/` : '../front/dist/', import.meta.url));
const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.webmanifest': 'application/manifest+json',
};
const RELEVE = /^\/api\/releve\/(\d{4}-(?:0[1-9]|1[0-2]))$/;
const MAX_CORPS = 200_000;

function lireCorps(req) {
  return new Promise((ok, ko) => {
    const morceaux = [];
    let taille = 0;
    req.on('data', (c) => {
      taille += c.length;
      if (taille > MAX_CORPS) { ko(Object.assign(new Error('Corps trop gros'), { statut: 413 })); req.destroy(); } else morceaux.push(c);
    });
    req.on('end', () => ok(Buffer.concat(morceaux).toString('utf8')));
    req.on('error', ko);
  });
}

export function creerServeur({ dossierReleves, nom = 'Moi', coach = 'Coach', dossierPage = PUBLIC }) {
  return createServer(async (req, res) => {
    try {
      const { pathname, searchParams } = new URL(req.url, 'http://local');
      const demo = searchParams.get('demo') === '1';
      if (req.method === 'PUT' && RELEVE.test(pathname)) {
        if (demo) { res.writeHead(403).end('Le mode démo ne modifie rien'); return; }
        let saisie;
        try {
          saisie = nettoyerSaisie(JSON.parse(await lireCorps(req)));
        } catch (e) {
          res.writeHead(e.statut ?? 400, { 'content-type': 'text/plain; charset=utf-8' }).end(e.message);
          return;
        }
        await enregistrerReleve(dossierReleves, pathname.match(RELEVE)[1], saisie);
        res.writeHead(204).end();
        return;
      }
      if (req.method !== 'GET') { res.writeHead(405).end(); return; }
      if (pathname === '/api/donnees') {
        const donnees = demo
          ? { ...assembler(relevesDemo(), await lireDescriptions(dossierReleves)), nom: NOM_DEMO, coach, demo: true }
          : { ...(await chargerDonnees(dossierReleves)), nom, coach, demo: false };
        res.writeHead(200, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' });
        res.end(JSON.stringify(donnees));
        return;
      }
      let fichier = normalize(join(dossierPage, pathname === '/' ? 'index.html' : pathname.slice(1)));
      if (!extname(fichier)) fichier = join(dossierPage, 'index.html');
      const type = TYPES[extname(fichier)];
      if (!fichier.startsWith(dossierPage) || !type) { res.writeHead(404).end(); return; }
      const contenu = await readFile(fichier);
      res.writeHead(200, { 'content-type': type, 'cache-control': 'no-store' });
      res.end(contenu);
    } catch (e) {
      res.writeHead(e.code === 'ENOENT' ? 404 : 500).end();
    }
  });
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const { HOST = '127.0.0.1', PORT = '5690', RELEVES_DIR, NOM, COACH } = process.env;
  if (!RELEVES_DIR) { console.error('RELEVES_DIR manquant'); process.exit(1); }
  creerServeur({ dossierReleves: RELEVES_DIR, nom: NOM || undefined, coach: COACH || undefined }).listen(Number(PORT), HOST, () => {
    console.log(`Growth my life sur http://${HOST}:${PORT}`);
  });
}

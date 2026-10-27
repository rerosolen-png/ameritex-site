#!/usr/bin/env node
/**
 * Servidor de desenvolvimento (sem dependências).
 *
 *   node scripts/serve.mjs            → build + serve em http://localhost:8080
 *   node scripts/serve.mjs --watch    → idem, e refaz o build ao salvar arquivos em src/ ou public/
 *   node scripts/serve.mjs --no-build → só serve o dist/ existente
 *
 * Variáveis: PORT (padrão 8080), HOST (padrão 127.0.0.1)
 */

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from './build.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(ROOT, 'dist');
const args = new Set(process.argv.slice(2));
const PORT = Number(process.env.PORT || 8080);
const HOST = process.env.HOST || undefined; // undefined = todas as interfaces (IPv4 e IPv6)

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.pdf': 'application/pdf',
  '.woff2': 'font/woff2',
};

function send(res, status, file) {
  const ext = path.extname(file).toLowerCase();
  res.writeHead(status, { 'Content-Type': MIME[ext] || 'application/octet-stream', 'Cache-Control': 'no-store' });
  fs.createReadStream(file).pipe(res);
}

function handler(req, res) {
  let pathname = decodeURIComponent(new URL(req.url, `http://${req.headers.host}`).pathname);
  if (pathname.includes('..')) {
    res.writeHead(400).end('bad request');
    return;
  }
  let file = path.join(DIST, pathname);
  if (fs.existsSync(file) && fs.statSync(file).isDirectory()) {
    if (!pathname.endsWith('/')) {
      res.writeHead(301, { Location: `${pathname}/` }).end();
      return;
    }
    file = path.join(file, 'index.html');
  }
  if (fs.existsSync(file) && fs.statSync(file).isFile()) {
    send(res, 200, file);
    return;
  }
  const notFound = path.join(DIST, '404.html');
  if (fs.existsSync(notFound)) send(res, 404, notFound);
  else res.writeHead(404).end('404');
}

let building = false;
let pending = false;
async function rebuild() {
  if (building) {
    pending = true;
    return;
  }
  building = true;
  try {
    await build({ quiet: true });
    console.log(`↻ rebuild ${new Date().toLocaleTimeString()}`);
  } catch (err) {
    console.error(`✖ ${err.message}`);
  } finally {
    building = false;
    if (pending) {
      pending = false;
      rebuild();
    }
  }
}

(async () => {
  if (!args.has('--no-build')) await build();
  http.createServer(handler).listen(PORT, HOST, () => {
    console.log(`▶ http://localhost:${PORT}/  (Ctrl+C para parar)`);
  });
  if (args.has('--watch')) {
    let timer;
    const onChange = () => {
      clearTimeout(timer);
      timer = setTimeout(rebuild, 150);
    };
    for (const dir of ['src', 'public']) {
      const full = path.join(ROOT, dir);
      if (fs.existsSync(full)) fs.watch(full, { recursive: true }, onChange);
    }
    console.log('👀 observando src/ e public/');
  }
})();

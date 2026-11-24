#!/usr/bin/env node
/**
 * Build do site estático.
 *
 *   node scripts/build.mjs
 *
 * 1. limpa dist/
 * 2. copia public/ (arquivos servidos como estão) e src/assets/img
 * 3. gera CSS e JS com hash no nome (cache busting)
 * 4. carrega e valida o conteúdo (src/data + src/content)
 * 5. renderiza todas as páginas, sitemap.xml e robots.txt
 *
 * Sem dependências externas: apenas APIs nativas do Node.js (>= 20).
 */

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { loadContent, ContentError } from '../src/lib/content.mjs';
import { renderPages } from '../src/templates/index.mjs';
import { renderHtaccess } from '../src/lib/htaccess.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.join(ROOT, 'src');
const PUBLIC = path.join(ROOT, 'public');
const DIST = path.join(ROOT, 'dist');

function hashOf(content) {
  return crypto.createHash('sha256').update(content).digest('hex').slice(0, 8);
}

function copyDir(from, to) {
  if (!fs.existsSync(from)) return 0;
  fs.cpSync(from, to, { recursive: true });
  let count = 0;
  const walk = (d) => {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      if (e.isDirectory()) walk(path.join(d, e.name));
      else count += 1;
    }
  };
  walk(to);
  return count;
}

function writeFile(rel, content) {
  const full = path.join(DIST, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content);
}

export async function build({ quiet = false } = {}) {
  const started = Date.now();
  const log = (...args) => {
    if (!quiet) console.log(...args);
  };

  fs.rmSync(DIST, { recursive: true, force: true });
  fs.mkdirSync(DIST, { recursive: true });

  // 1. arquivos públicos e imagens
  const publicCount = copyDir(PUBLIC, DIST);
  const imgCount = copyDir(path.join(SRC, 'assets', 'img'), path.join(DIST, 'assets', 'img'));

  // 2. CSS e JS com hash
  const css = fs.readFileSync(path.join(SRC, 'styles', 'main.css'), 'utf8');
  const js = fs.readFileSync(path.join(SRC, 'scripts', 'main.js'), 'utf8');
  const cssName = `main.${hashOf(css)}.css`;
  const jsName = `main.${hashOf(js)}.js`;
  writeFile(`assets/css/${cssName}`, css);
  writeFile(`assets/js/${jsName}`, js);

  // 3. conteúdo
  const content = loadContent(SRC);
  const buildDate = new Date();

  // URL pública: por padrão a de site.json; o deploy pode sobrescrever com SITE_URL
  // (ex.: https://usuario.github.io/ameritex-site antes de o domínio próprio estar ativo).
  // Quando a URL tem um caminho (/ameritex-site), todos os links absolutos recebem esse prefixo.
  const productionUrl = content.site.siteUrl.replace(/\/+$/, '');
  const siteUrl = (process.env.SITE_URL || productionUrl).replace(/\/+$/, '');
  content.site.siteUrl = siteUrl;
  // Prévia: build publicado em um endereço diferente do de produção (ex.: github.io).
  // Recebe noindex para não disputar posição com o domínio oficial nos buscadores.
  const staging = siteUrl !== productionUrl;
  const basePath = new URL(siteUrl).pathname.replace(/\/+$/, '');
  const applyBase = (htmlText) => (basePath ? htmlText.replace(/=(["'])\/(?!\/)/g, `=$1${basePath}/`) : htmlText);

  // Medição (Analytics, Ads, Meta Pixel): só em produção e só se houver algum ID em site.json.
  // A prévia nunca mede, para não misturar visitas de teste com as reais.
  const t = content.site.tracking;
  const tracking = { ...t, hasAnalytics: Boolean(t.ga4), hasMarketing: Boolean(t.ads || t.pixel) };
  tracking.enabled = !staging && (tracking.hasAnalytics || tracking.hasMarketing);
  const trackingJs = fs.readFileSync(path.join(SRC, 'scripts', 'tracking.js'), 'utf8');
  const trackingName = `tracking.${hashOf(trackingJs)}.js`;
  if (tracking.enabled) writeFile(`assets/js/${trackingName}`, trackingJs);

  const ctx = {
    ...content,
    assets: { css: `/assets/css/${cssName}`, js: `/assets/js/${jsName}`, tracking: `/assets/js/${trackingName}` },
    tracking,
    buildDate,
    staging,
    /** Resolve uma imagem de src/assets/img para { src, width, height }. */
    img(rel) {
      const meta = content.images.get(rel);
      if (!meta) throw new ContentError(`Imagem "${rel}" não encontrada`);
      return { src: `/assets/img/${rel}`, width: meta.width, height: meta.height };
    },
  };

  // 4. páginas
  const pages = renderPages(ctx);
  const seen = new Set();
  for (const page of pages) {
    if (seen.has(page.url)) throw new ContentError(`URL duplicada: ${page.url}`);
    seen.add(page.url);
    const rel = page.url.endsWith('/') ? `${page.url}index.html` : page.url;
    writeFile(rel.replace(/^\//, ''), applyBase(page.html));
  }

  // 5. redirecionamentos das URLs antigas:
  //    - página com meta refresh para cada URL exata (funciona em qualquer hospedagem estática)
  //    - _redirects (Netlify / Cloudflare Pages) e .htaccess (Apache / HostGator) com 301 de servidor
  const site = content.site;
  const redirectsFile = path.join(SRC, 'data', 'redirects.json');
  let redirectCount = 0;
  let exactRedirects = {};
  let prefixRedirects = {};
  if (fs.existsSync(redirectsFile)) {
    const redirects = JSON.parse(fs.readFileSync(redirectsFile, 'utf8'));
    const lines = [];
    for (const [from, to] of Object.entries(redirects)) {
      if (from.startsWith('_')) continue;
      if (!seen.has(to)) throw new ContentError(`redirects.json: destino "${to}" não existe`);
      if (seen.has(from)) throw new ContentError(`redirects.json: origem "${from}" colide com uma página existente`);
      const target = `${site.siteUrl}${to}`;
      const page = `<!doctype html>\n<html lang="pt-BR"><head><meta charset="utf-8"><title>Redirecionando…</title><meta name="robots" content="noindex"><meta http-equiv="refresh" content="0; url=${target}"><link rel="canonical" href="${target}"></head><body><p>Esta página mudou de endereço. <a href="${target}">Clique aqui</a> se não for redirecionado.</p></body></html>\n`;
      writeFile(`${from.replace(/^\//, '')}index.html`, page);
      lines.push(`${from} ${to} 301`);
      redirectCount += 1;
    }
    // prefixos: qualquer URL que comece com o trecho indicado (só valem com redirecionamento de servidor)
    prefixRedirects = redirects._prefixos || {};
    for (const [from, to] of Object.entries(prefixRedirects)) {
      if (!seen.has(to)) throw new ContentError(`redirects.json: destino "${to}" não existe`);
      const clash = [...seen].find((url) => url.startsWith(from));
      if (clash) throw new ContentError(`redirects.json: o prefixo "${from}" engoliria a página ${clash}`);
      lines.push(`${from}* ${to} 301`);
    }
    if (lines.length) writeFile('_redirects', `${lines.join('\n')}\n`);
    exactRedirects = Object.fromEntries(Object.entries(redirects).filter(([from]) => !from.startsWith('_')));
  }

  // .htaccess só faz sentido quando o site fica na raiz do domínio (sem caminho base)
  if (!basePath) writeFile('.htaccess', renderHtaccess({ siteUrl, redirects: exactRedirects, prefixes: prefixRedirects }));

  // 6. sitemap, robots e manifest (dependem da URL pública, por isso são gerados aqui)
  const lastmod = buildDate.toISOString().slice(0, 10);
  const sitemapUrls = pages.filter((p) => p.sitemap !== false && p.url.endsWith('/'));
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemapUrls
    .map((p) => `  <url><loc>${site.siteUrl}${p.url}</loc><lastmod>${p.lastmod || lastmod}</lastmod></url>`)
    .join('\n')}\n</urlset>\n`;
  writeFile('sitemap.xml', sitemap);
  writeFile('robots.txt', `User-agent: *\nAllow: /\n\nSitemap: ${site.siteUrl}/sitemap.xml\n`);
  const manifest = {
    name: `${site.brand} – ${site.tagline}`,
    short_name: site.brand,
    description: site.description,
    start_url: `${basePath}/`,
    display: 'browser',
    lang: 'pt-BR',
    background_color: '#ffffff',
    theme_color: '#2d2c4d',
    icons: [
      { src: `${basePath}/icon-192.png`, sizes: '192x192', type: 'image/png' },
      { src: `${basePath}/icon-512.png`, sizes: '512x512', type: 'image/png' },
    ],
  };
  writeFile('manifest.webmanifest', `${JSON.stringify(manifest, null, 2)}\n`);
  writeFile('.build-meta.json', `${JSON.stringify({ siteUrl, basePath, staging, buildDate: buildDate.toISOString(), pages: pages.length }, null, 2)}\n`);

  const ms = Date.now() - started;
  log(`✔ build concluído em ${ms} ms`);
  log(`  páginas: ${pages.length} | redirecionamentos: ${redirectCount} | imagens: ${imgCount} | arquivos públicos: ${publicCount}`);
  log(`  css: ${cssName} | js: ${jsName}`);
  log(`  url pública: ${siteUrl}${basePath ? ` (caminho base ${basePath})` : ''}${staging ? ' · PRÉVIA (noindex)' : ''}`);
  const tools = [t.ga4 && 'Analytics', t.ads && 'Google Ads', t.pixel && 'Meta Pixel'].filter(Boolean);
  log(`  medição: ${tracking.enabled ? `${tools.join(', ')} (com aviso de cookies)` : tools.length ? 'desligada na prévia' : 'nenhum ID configurado'}`);
  return { pages: pages.length, ms };
}

const isDirectRun = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isDirectRun) {
  build().catch((err) => {
    if (err instanceof ContentError) {
      console.error(`✖ erro de conteúdo: ${err.message}`);
    } else {
      console.error(err);
    }
    process.exit(1);
  });
}

#!/usr/bin/env node
/**
 * Validação do site gerado em dist/ (roda no CI e antes de cada deploy).
 *
 * Para cada página HTML verifica:
 * - <html lang="pt-BR">, <title> único (10–65 caracteres), meta description (50–165)
 * - canonical, og:title, og:description, og:image, viewport
 * - exatamente um <h1>
 * - todas as <img> com alt (pode ser vazio apenas em imagens decorativas marcadas)
 * - width/height em todas as <img> (evita CLS)
 * - links e imagens internas apontam para arquivos existentes em dist/
 * - blocos JSON-LD são JSON válido
 * - sitemap.xml lista todas as páginas indexáveis
 *
 * Sai com código 1 se houver qualquer erro.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(ROOT, 'dist');

const errors = [];
const warnings = [];

function listFiles(dir, ext) {
  const out = [];
  const walk = (d) => {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const full = path.join(d, e.name);
      if (e.isDirectory()) walk(full);
      else if (!ext || full.endsWith(ext)) out.push(full);
    }
  };
  walk(dir);
  return out;
}

function toUrl(file) {
  const rel = path.relative(DIST, file).split(path.sep).join('/');
  return `/${rel.replace(/index\.html$/, '')}`;
}

// caminho base usado no build (ex.: /ameritex-site quando publicado em usuario.github.io/ameritex-site)
const buildMeta = fs.existsSync(path.join(DIST, '.build-meta.json')) ? JSON.parse(fs.readFileSync(path.join(DIST, '.build-meta.json'), 'utf8')) : {};
const BASE = buildMeta.basePath || '';

function stripBase(href) {
  if (BASE && (href === BASE || href.startsWith(`${BASE}/`))) return href.slice(BASE.length) || '/';
  return href;
}

function resolveInternal(href) {
  const clean = stripBase(href.split('#')[0].split('?')[0]);
  if (clean === '') return true; // âncora na própria página
  let target = path.join(DIST, decodeURIComponent(clean));
  if (clean.endsWith('/')) target = path.join(target, 'index.html');
  return fs.existsSync(target);
}

function attr(tag, name) {
  const m = tag.match(new RegExp(`\\s${name}\\s*=\\s*("([^"]*)"|'([^']*)'|([^\\s>]+))`, 'i'));
  if (!m) return null;
  return m[2] ?? m[3] ?? m[4] ?? '';
}

function metaContent(html, selector) {
  const re = new RegExp(`<meta[^>]*\\s(?:name|property)\\s*=\\s*["']${selector}["'][^>]*>`, 'i');
  const m = html.match(re);
  return m ? attr(m[0], 'content') : null;
}

if (!fs.existsSync(DIST)) {
  console.error('✖ dist/ não existe. Rode `node scripts/build.mjs` antes.');
  process.exit(1);
}

const htmlFiles = listFiles(DIST, '.html');
const sitemap = fs.existsSync(path.join(DIST, 'sitemap.xml')) ? fs.readFileSync(path.join(DIST, 'sitemap.xml'), 'utf8') : '';
const titles = new Map();

for (const file of htmlFiles) {
  const url = toUrl(file);
  const html = fs.readFileSync(file, 'utf8');
  const err = (msg) => errors.push(`${url}: ${msg}`);
  const warn = (msg) => warnings.push(`${url}: ${msg}`);
  const is404 = url.endsWith('404.html');

  // páginas de redirecionamento (URLs antigas): só precisam apontar para um destino válido
  const refresh = html.match(/<meta[^>]*http-equiv\s*=\s*["']refresh["'][^>]*content\s*=\s*["'][^;]*;\s*url=([^"']+)["']/i);
  if (refresh) {
    const target = refresh[1].replace(/^https?:\/\/[^/]+/, '');
    if (!resolveInternal(target)) err(`redirecionamento para destino inexistente: ${target}`);
    if (!/<meta[^>]*name\s*=\s*["']robots["'][^>]*noindex/i.test(html)) err('página de redirecionamento sem noindex');
    continue;
  }

  if (!/<html[^>]*\slang\s*=\s*["']pt-BR["']/i.test(html)) err('falta <html lang="pt-BR">');
  if (!/<meta[^>]*name\s*=\s*["']viewport["']/i.test(html)) err('falta meta viewport');
  if (!/<meta[^>]*charset/i.test(html)) err('falta meta charset');

  const title = (html.match(/<title>([^<]*)<\/title>/i) || [])[1];
  if (!title) err('falta <title>');
  else {
    if (title.length < 10 || title.length > 65) warn(`title com ${title.length} caracteres: "${title}"`);
    if (titles.has(title) && !is404) err(`title duplicado com ${titles.get(title)}: "${title}"`);
    titles.set(title, url);
  }

  const desc = metaContent(html, 'description');
  if (!desc) err('falta meta description');
  else if (desc.length < 50 || desc.length > 165) warn(`description com ${desc.length} caracteres`);

  if (!is404) {
    const canonical = html.match(/<link[^>]*rel\s*=\s*["']canonical["'][^>]*>/i);
    if (!canonical) err('falta link canonical');
    else {
      const href = attr(canonical[0], 'href');
      if (!href || !href.endsWith(url)) err(`canonical "${href}" não corresponde à URL ${url}`);
    }
    for (const p of ['og:title', 'og:description', 'og:image', 'og:url', 'og:type']) {
      if (!metaContent(html, p)) err(`falta meta ${p}`);
    }
    if (!sitemap.includes(`<loc>`) || !new RegExp(`<loc>[^<]*${url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}</loc>`).test(sitemap)) {
      if (!/<meta[^>]*name\s*=\s*["']robots["'][^>]*noindex/i.test(html)) err('página não está no sitemap.xml');
    }
  }

  const h1s = html.match(/<h1[\s>]/gi) || [];
  if (h1s.length !== 1) err(`${h1s.length} <h1> (esperado 1)`);

  const imgs = html.match(/<img\b[^>]*>/gi) || [];
  for (const tag of imgs) {
    const src = attr(tag, 'src');
    const alt = attr(tag, 'alt');
    if (alt === null) err(`<img> sem alt: ${src}`);
    if (attr(tag, 'width') === null || attr(tag, 'height') === null) err(`<img> sem width/height: ${src}`);
    if (src && src.startsWith('/') && !resolveInternal(src)) err(`imagem não encontrada: ${src}`);
  }

  const links = html.match(/<a\b[^>]*>/gi) || [];
  for (const tag of links) {
    const href = attr(tag, 'href');
    if (!href) {
      err('<a> sem href');
      continue;
    }
    if (/^(https?:|mailto:|tel:|#|javascript:)/i.test(href)) {
      if (/^https?:/i.test(href) && !/\brel\s*=\s*["'][^"']*noopener/i.test(tag) && /target\s*=\s*["']_blank["']/i.test(tag)) {
        warn(`link externo com target=_blank sem rel=noopener: ${href}`);
      }
      continue;
    }
    if (!href.startsWith('/')) {
      err(`link relativo (use caminho absoluto a partir da raiz): ${href}`);
      continue;
    }
    if (BASE && !href.startsWith(`${BASE}/`) && href !== BASE) err(`link sem o caminho base ${BASE}: ${href}`);
    if (!resolveInternal(href)) err(`link quebrado: ${href}`);
  }

  const ld = html.match(/<script[^>]*type\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi) || [];
  for (const block of ld) {
    const body = block.replace(/^<script[^>]*>/i, '').replace(/<\/script>$/i, '');
    try {
      JSON.parse(body);
    } catch (e) {
      err(`JSON-LD inválido: ${e.message}`);
    }
  }
}

// imagens grandes demais (performance)
for (const file of listFiles(path.join(DIST, 'assets', 'img'))) {
  const kb = fs.statSync(file).size / 1024;
  if (kb > 350) warnings.push(`imagem com ${Math.round(kb)} KB (ideal ≤ 350 KB): ${path.relative(DIST, file)}`);
}

for (const w of warnings) console.warn(`⚠ ${w}`);
for (const e of errors) console.error(`✖ ${e}`);
console.log(`\n${htmlFiles.length} páginas verificadas · ${errors.length} erro(s) · ${warnings.length} aviso(s)${BASE ? ` · caminho base ${BASE}` : ''}`);
process.exit(errors.length ? 1 : 0);

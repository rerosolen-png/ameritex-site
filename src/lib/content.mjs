/**
 * Carrega e valida todo o conteúdo do site (JSON + Markdown).
 *
 * Qualquer inconsistência (imagem inexistente, campo obrigatório ausente,
 * slug duplicado) interrompe o build com uma mensagem clara, para que o erro
 * apareça no CI e não em produção.
 */

import fs from 'node:fs';
import path from 'node:path';
import { parseFrontMatter, markdownToHtml, markdownToText, readingTime } from './markdown.mjs';
import { scanImages } from './images.mjs';

export class ContentError extends Error {}

function readJson(file) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (err) {
    throw new ContentError(`JSON inválido em ${file}: ${err.message}`);
  }
}

function must(obj, field, where) {
  if (obj[field] === undefined || obj[field] === null || obj[field] === '') {
    throw new ContentError(`Campo obrigatório "${field}" ausente em ${where}`);
  }
}

export function loadContent(srcDir) {
  const dataDir = path.join(srcDir, 'data');
  const contentDir = path.join(srcDir, 'content');
  const imgDir = path.join(srcDir, 'assets', 'img');

  const images = scanImages(imgDir);
  const requireImage = (rel, where) => {
    if (!images.has(rel)) throw new ContentError(`Imagem "${rel}" não encontrada (referenciada em ${where})`);
    return rel;
  };

  // ---- site
  const site = readJson(path.join(dataDir, 'site.json'));
  for (const f of ['brand', 'legalName', 'cnpj', 'foundedYear', 'siteUrl', 'email', 'phone', 'whatsapp', 'addresses', 'nav']) {
    must(site, f, 'site.json');
  }
  requireImage(site.logo.light, 'site.json logo.light');
  requireImage(site.logo.dark, 'site.json logo.dark');
  requireImage(site.ogImage, 'site.json ogImage');

  // ---- produtos (categorias)
  const produtos = readJson(path.join(dataDir, 'produtos.json'));
  const slugs = new Set();
  for (const cat of produtos) {
    const where = `produtos.json (${cat.slug || '?'})`;
    for (const f of ['slug', 'name', 'title', 'description', 'h1', 'lead', 'heroImage', 'cardImage', 'lines']) must(cat, f, where);
    if (slugs.has(cat.slug)) throw new ContentError(`Slug duplicado: ${cat.slug}`);
    slugs.add(cat.slug);
    if (cat.title.length > 65) throw new ContentError(`${where}: title com ${cat.title.length} caracteres (máx. 65)`);
    if (cat.description.length > 165) throw new ContentError(`${where}: description com ${cat.description.length} caracteres (máx. 165)`);
    requireImage(cat.heroImage, where);
    requireImage(cat.cardImage, where);
    for (const line of cat.lines) {
      must(line, 'code', `${where} line`);
      must(line, 'name', `${where} line`);
      for (const v of line.variants || []) {
        must(v, 'code', `${where} ${line.code} variant`);
        must(v, 'name', `${where} ${line.code} variant`);
        if (v.image) requireImage(v.image, `${where} ${v.code}`);
        if (v.backImage) requireImage(v.backImage, `${where} ${v.code}`);
      }
      for (const img of line.images || []) requireImage(img.src, `${where} ${line.code} images`);
    }
    const mdFile = path.join(contentDir, 'produtos', `${cat.slug}.md`);
    if (!fs.existsSync(mdFile)) throw new ContentError(`Texto não encontrado: ${mdFile}`);
    const md = fs.readFileSync(mdFile, 'utf8');
    const rendered = markdownToHtml(md, { headingOffset: 0 });
    cat.bodyHtml = rendered.html;
    cat.bodyHeadings = rendered.headings;
    cat.bodyText = markdownToText(md);
    cat.url = `/produtos/${cat.slug}/`;
    cat.variantCount = cat.lines.reduce((n, l) => n + (l.variants ? l.variants.length : 0), 0);
  }
  for (const cat of produtos) {
    for (const rel of cat.related || []) {
      if (!slugs.has(rel)) throw new ContentError(`produtos.json (${cat.slug}): related "${rel}" não existe`);
    }
  }

  // ---- guias
  const guiasDir = path.join(contentDir, 'guias');
  const guias = fs
    .readdirSync(guiasDir)
    .filter((f) => f.endsWith('.md'))
    .map((file) => {
      const slug = file.replace(/\.md$/, '');
      const text = fs.readFileSync(path.join(guiasDir, file), 'utf8');
      const { data, body } = parseFrontMatter(text);
      const where = `guias/${file}`;
      for (const f of ['title', 'description', 'date', 'image', 'imageAlt']) must(data, f, where);
      if (data.title.length > 65) throw new ContentError(`${where}: title com ${data.title.length} caracteres (máx. 65)`);
      if (data.description.length > 165) throw new ContentError(`${where}: description com ${data.description.length} caracteres (máx. 165)`);
      requireImage(data.image, where);
      if (data.category && !slugs.has(data.category)) throw new ContentError(`${where}: category "${data.category}" não existe`);
      const rendered = markdownToHtml(body, { headingOffset: 0 }); // o texto usa "##" (o h1 é o título do front matter)
      return {
        slug,
        url: `/guias/${slug}/`,
        ...data,
        bodyHtml: rendered.html,
        headings: rendered.headings,
        text: markdownToText(body),
        readingTime: readingTime(body),
      };
    })
    .sort((a, b) => (a.date < b.date ? 1 : -1));

  // ---- FAQ geral
  const faq = readJson(path.join(dataDir, 'faq.json'));

  return { site, produtos, guias, faq, images };
}

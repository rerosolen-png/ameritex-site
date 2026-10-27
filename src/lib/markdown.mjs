/**
 * Conversor Markdown → HTML sem dependências.
 *
 * Suporta o subconjunto usado pelo conteúdo do site:
 * - títulos (#, ##, ###, ####) com id automático para âncoras
 * - parágrafos, listas (- / 1.), citações (>), linha horizontal (---)
 * - tabelas no formato GitHub (| a | b |)
 * - imagens isoladas em linha própria viram <figure>
 * - blocos de código ```
 * - inline: **negrito**, *itálico*, `código`, [link](url), ![alt](src)
 * - front matter simples (chave: valor) entre linhas `---`
 */

import { escape, slugify } from './html.mjs';

export function parseFrontMatter(text) {
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) return { data: {}, body: text };
  const data = {};
  for (const line of match[1].split(/\r?\n/)) {
    const idx = line.indexOf(':');
    if (idx < 0 || line.trim().startsWith('#')) continue;
    const key = line.slice(0, idx).trim();
    let value = line.slice(idx + 1).trim();
    if (/^(["']).*\1$/.test(value)) {
      value = value.slice(1, -1);
    } else if (value.startsWith('[') && value.endsWith(']')) {
      value = value
        .slice(1, -1)
        .split(',')
        .map((s) => s.trim().replace(/^["']|["']$/g, ''))
        .filter(Boolean);
    } else if (value === 'true' || value === 'false') {
      value = value === 'true';
    }
    data[key] = value;
  }
  return { data, body: match[2] };
}

function inline(text) {
  let out = escape(text);
  // código inline primeiro, para não formatar o conteúdo dele
  out = out.replace(/`([^`]+)`/g, (_, code) => `<code>${code}</code>`);
  // imagens inline
  out = out.replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, (_, alt, src) => `<img src="${src}" alt="${alt}" loading="lazy">`);
  // links
  out = out.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, label, href) => {
    const external = /^https?:\/\//.test(href);
    const extra = external ? ' rel="noopener" target="_blank"' : '';
    return `<a href="${href}"${extra}>${label}</a>`;
  });
  // negrito e itálico
  out = out.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  out = out.replace(/(^|[\s(])\*([^*\s][^*]*?)\*(?=[\s).,;:!?]|$)/g, '$1<em>$2</em>');
  out = out.replace(/(^|[\s(])_([^_\s][^_]*?)_(?=[\s).,;:!?]|$)/g, '$1<em>$2</em>');
  return out;
}

export function markdownToHtml(markdown, { headingOffset = 0 } = {}) {
  const lines = markdown.replace(/\r\n/g, '\n').split('\n');
  const out = [];
  const headings = [];
  let i = 0;

  const flushParagraph = (buf) => {
    if (buf.length) {
      out.push(`<p>${inline(buf.join(' '))}</p>`);
      buf.length = 0;
    }
  };

  const para = [];
  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    if (trimmed === '') {
      flushParagraph(para);
      i += 1;
      continue;
    }

    // bloco de código
    if (trimmed.startsWith('```')) {
      flushParagraph(para);
      const code = [];
      i += 1;
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        code.push(lines[i]);
        i += 1;
      }
      i += 1;
      out.push(`<pre><code>${escape(code.join('\n'))}</code></pre>`);
      continue;
    }

    // título
    const h = trimmed.match(/^(#{1,6})\s+(.+?)\s*#*$/);
    if (h) {
      flushParagraph(para);
      const level = Math.min(6, h[1].length + headingOffset);
      const text = h[2];
      const id = slugify(text);
      headings.push({ level, text, id });
      out.push(`<h${level} id="${id}">${inline(text)}</h${level}>`);
      i += 1;
      continue;
    }

    // linha horizontal
    if (/^(-{3,}|\*{3,}|_{3,})$/.test(trimmed)) {
      flushParagraph(para);
      out.push('<hr>');
      i += 1;
      continue;
    }

    // imagem isolada
    const img = trimmed.match(/^!\[([^\]]*)\]\(([^)\s]+)\)$/);
    if (img) {
      flushParagraph(para);
      out.push(`<figure><img src="${escape(img[2])}" alt="${escape(img[1])}" loading="lazy"><figcaption>${inline(img[1])}</figcaption></figure>`);
      i += 1;
      continue;
    }

    // tabela
    if (trimmed.startsWith('|') && i + 1 < lines.length && /^\|?\s*:?-{2,}/.test(lines[i + 1].trim())) {
      flushParagraph(para);
      const splitRow = (row) =>
        row
          .trim()
          .replace(/^\||\|$/g, '')
          .split('|')
          .map((c) => c.trim());
      const header = splitRow(trimmed);
      i += 2;
      const rows = [];
      while (i < lines.length && lines[i].trim().startsWith('|')) {
        rows.push(splitRow(lines[i]));
        i += 1;
      }
      let table = '<div class="table-wrap"><table><thead><tr>';
      table += header.map((c) => `<th scope="col">${inline(c)}</th>`).join('');
      table += '</tr></thead><tbody>';
      for (const r of rows) {
        table += `<tr>${r.map((c) => `<td>${inline(c)}</td>`).join('')}</tr>`;
      }
      table += '</tbody></table></div>';
      out.push(table);
      continue;
    }

    // citação
    if (trimmed.startsWith('>')) {
      flushParagraph(para);
      const quote = [];
      while (i < lines.length && lines[i].trim().startsWith('>')) {
        quote.push(lines[i].trim().replace(/^>\s?/, ''));
        i += 1;
      }
      out.push(`<blockquote>${markdownToHtml(quote.join('\n'), { headingOffset }).html}</blockquote>`);
      continue;
    }

    // lista não ordenada
    if (/^[-*]\s+/.test(trimmed)) {
      flushParagraph(para);
      const items = [];
      while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) {
        items.push(lines[i].trim().replace(/^[-*]\s+/, ''));
        i += 1;
      }
      out.push(`<ul>${items.map((it) => `<li>${inline(it)}</li>`).join('')}</ul>`);
      continue;
    }

    // lista ordenada
    if (/^\d+[.)]\s+/.test(trimmed)) {
      flushParagraph(para);
      const items = [];
      while (i < lines.length && /^\s*\d+[.)]\s+/.test(lines[i])) {
        items.push(lines[i].trim().replace(/^\d+[.)]\s+/, ''));
        i += 1;
      }
      out.push(`<ol>${items.map((it) => `<li>${inline(it)}</li>`).join('')}</ol>`);
      continue;
    }

    para.push(trimmed);
    i += 1;
  }
  flushParagraph(para);

  return { html: out.join('\n'), headings };
}

/** Remove a formatação e devolve texto simples (para resumos e meta tags). */
export function markdownToText(markdown) {
  return markdown
    .replace(/```[\s\S]*?```/g, '')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/^#+\s+/gm, '')
    .replace(/[*_`>|]/g, '')
    .replace(/^-{3,}$/gm, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Estima o tempo de leitura em minutos (200 palavras/min). */
export function readingTime(markdown) {
  const words = markdownToText(markdown).split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

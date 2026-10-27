/**
 * Utilitários mínimos para gerar HTML com segurança.
 *
 * `html` é um tagged template: toda interpolação é escapada automaticamente,
 * exceto valores marcados com `raw()` ou resultados de outro `html` (que já
 * são seguros). Isso evita XSS por conteúdo vindo de JSON/Markdown.
 */

const ESCAPES = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

export function escape(value) {
  return String(value ?? '').replace(/[&<>"']/g, (c) => ESCAPES[c]);
}

class RawHtml {
  constructor(value) {
    this.value = value;
  }
  toString() {
    return this.value;
  }
}

/** Marca uma string como HTML confiável (não será escapada). */
export function raw(value) {
  return value instanceof RawHtml ? value : new RawHtml(String(value ?? ''));
}

export function isRaw(value) {
  return value instanceof RawHtml;
}

function render(value) {
  if (value == null || value === false) return '';
  if (value instanceof RawHtml) return value.value;
  if (Array.isArray(value)) return value.map(render).join('');
  return escape(value);
}

/** Tagged template que escapa interpolações. */
export function html(strings, ...values) {
  let out = '';
  for (let i = 0; i < strings.length; i += 1) {
    out += strings[i];
    if (i < values.length) out += render(values[i]);
  }
  return new RawHtml(out);
}

/** Converte um texto simples em slug seguro para URLs e ids. */
export function slugify(text) {
  return String(text)
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** Serializa um objeto como JSON seguro para dentro de <script>. */
export function jsonForScript(obj) {
  return raw(JSON.stringify(obj, null, 0).replace(/</g, '\\u003c'));
}

/** Junta classes ignorando valores falsos. */
export function cx(...classes) {
  return classes.filter(Boolean).join(' ');
}

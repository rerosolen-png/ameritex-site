/**
 * Ponto de entrada dos templates: devolve a lista de páginas a gerar.
 * Cada página é { url, html, sitemap?: boolean, lastmod?: 'AAAA-MM-DD' }.
 */

import { renderHome } from './pages/home.mjs';
import { renderProdutosIndex, renderProduto } from './pages/produtos.mjs';
import { renderGuiasIndex, renderGuia } from './pages/guias.mjs';
import { renderSobre, renderContato, renderCatalogo, renderPrivacidade, renderNotFound } from './pages/institucional.mjs';

export function renderPages(ctx) {
  const pages = [];
  pages.push(renderHome(ctx));
  pages.push(renderProdutosIndex(ctx));
  for (const cat of ctx.produtos) pages.push(renderProduto(ctx, cat));
  pages.push(renderGuiasIndex(ctx));
  for (const guia of ctx.guias) pages.push(renderGuia(ctx, guia));
  pages.push(renderSobre(ctx));
  pages.push(renderContato(ctx));
  pages.push(renderCatalogo(ctx));
  pages.push(renderPrivacidade(ctx));
  pages.push(renderNotFound(ctx));
  return pages;
}

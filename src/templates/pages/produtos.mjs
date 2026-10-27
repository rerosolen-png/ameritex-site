import { html, raw, slugify } from '../../lib/html.mjs';
import { layout, breadcrumbLd } from '../layout.mjs';
import { img, icons, waLink, breadcrumbs, categoryCard, sectionHead, specsTable, dataTable, variantGrid, faqList, faqLd, ctaBand, highlightList } from '../components.mjs';

export function renderProdutosIndex(ctx) {
  const { site, produtos } = ctx;
  const url = '/produtos/';
  const title = `Produtos | Catálogo de PVC e revestimentos no atacado – Ameritex`;
  const description = `Linhas Ameritex: passadeiras e toalhas de PVC, plástico cristal, carpete para eventos, forro para gavetas, grama artificial, papel de parede e placa adesiva.`;
  const crumbs = [
    { name: 'Início', url: '/' },
    { name: 'Produtos', url },
  ];

  const body = html`
<section class="page-head">
  <div class="container">
    ${breadcrumbs(crumbs)}
    <h1>Catálogo de produtos</h1>
    <p class="lead">${produtos.length} linhas de produto importadas diretamente e vendidas no atacado, com código, especificação técnica e todas as estampas e cores do catálogo ${site.catalogYear}. Clique em uma linha para ver detalhes, variantes e aplicações.</p>
    <div class="page-head__actions">
      <a class="btn btn--outline" href="/catalogo/">${icons.download} Baixar catálogo em PDF</a>
      <a class="btn btn--wa" href="${waLink(ctx)}" target="_blank" rel="noopener">${icons.whatsapp} Pedir orçamento</a>
    </div>
  </div>
</section>

<section class="section">
  <div class="container">
    <div class="grid grid--3">
      ${produtos.map((cat) => categoryCard(ctx, cat, { headingLevel: 2 }))}
    </div>
  </div>
</section>

<section class="section section--alt">
  <div class="container container--narrow prose">
    <h2>Como funciona a compra no atacado</h2>
    <p>Trabalhamos com venda por <strong>rolo fechado</strong> (passadeiras, toalhas, plástico cristal, carpete, forro e grama) e por <strong>caixa fechada</strong> (papel de parede e placas adesivas, além dos rolinhos de forro). Em cada página de produto você encontra a apresentação exata: comprimento do rolo, largura, composição, gramatura e a quantidade por caixa quando aplicável.</p>
    <p>Para montar o pedido, anote os códigos (por exemplo, <code>85001 C4</code> ou <code>TMP20</code>) e envie para o nosso time pelo WhatsApp ou pelo <a href="/contato/">formulário de contato</a>. Respondemos com preço, prazo e frete para o seu endereço. Clientes recorrentes contam com reposição programada e condições diferenciadas.</p>
    <h2>Padrão de qualidade e origem</h2>
    <p>Todos os itens de PVC são importados da China de fábricas parceiras, com especificação definida pela ${site.brand} e inspeção antes do embarque. Mantemos a mesma referência de estampa e cor entre lotes, o que permite ao lojista repor o mix sem surpresas e ao fabricante manter a padronização dos seus produtos.</p>
  </div>
</section>

${ctaBand(ctx, {})}
`;

  const jsonLd = [
    breadcrumbLd(ctx, crumbs),
    {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: 'Linhas de produto Ameritex',
      itemListElement: produtos.map((c, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: c.name,
        url: `${site.siteUrl}${c.url}`,
      })),
    },
  ];

  return { url, html: layout(ctx, { url, title, description, jsonLd, bodyClass: 'page-produtos' }, body) };
}

function productLd(ctx, cat, line) {
  const { site } = ctx;
  const images = [];
  for (const v of line.variants || []) if (v.image) images.push(`${site.siteUrl}${ctx.img(v.image).src}`);
  for (const i of line.images || []) images.push(`${site.siteUrl}${ctx.img(i.src).src}`);
  if (!images.length) images.push(`${site.siteUrl}${ctx.img(cat.heroImage).src}`);
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: line.name,
    sku: line.code,
    brand: { '@type': 'Brand', name: site.brand },
    description: line.summary || cat.description,
    category: cat.name,
    url: `${site.siteUrl}${cat.url}#${slugify(line.code)}`,
    image: images.slice(0, 12),
    ...(line.material ? { material: line.material } : {}),
    ...(line.countryOfOrigin ? { countryOfOrigin: { '@type': 'Country', name: line.countryOfOrigin } } : {}),
    additionalProperty: (line.specs || []).map(([name, value]) => ({ '@type': 'PropertyValue', name, value })),
    manufacturer: { '@id': `${site.siteUrl}/#organization` },
  };
}

export function renderProduto(ctx, cat) {
  const { site, produtos } = ctx;
  const url = cat.url;
  const crumbs = [
    { name: 'Início', url: '/' },
    { name: 'Produtos', url: '/produtos/' },
    { name: cat.name, url },
  ];
  const related = (cat.related || []).map((slug) => produtos.find((p) => p.slug === slug)).filter(Boolean);
  const waMessage = `Olá! Vim pelo site da Ameritex e gostaria de um orçamento de ${cat.name}.`;

  const body = html`
<section class="product-hero">
  <div class="container product-hero__inner">
    <div class="product-hero__text">
      ${breadcrumbs(crumbs)}
      <h1>${cat.h1}</h1>
      <p class="lead">${cat.lead}</p>
      ${cat.highlights ? highlightList(cat.highlights) : ''}
      <div class="product-hero__actions">
        <a class="btn btn--wa btn--lg" href="${waLink(ctx, waMessage)}" target="_blank" rel="noopener">${icons.whatsapp} Pedir orçamento</a>
        <a class="btn btn--outline-light btn--lg" href="#variantes">Ver estampas e cores</a>
      </div>
    </div>
    <div class="product-hero__media">
      ${img(ctx, cat.heroImage, cat.heroAlt || cat.name, { loading: 'eager', fetchpriority: 'high' })}
    </div>
  </div>
</section>

<div class="container product-layout">
  <aside class="product-side" aria-label="Resumo e navegação">
    <div class="sticky">
      <nav class="toc" aria-label="Nesta página">
        <h2 class="toc__title">Nesta página</h2>
        <ul>
          ${cat.lines.map((l) => html`<li><a href="#${slugify(l.code)}">${l.name}</a></li>`)}
          ${cat.bodyHeadings.filter((h) => h.level === 2).map((h) => html`<li><a href="#${h.id}">${h.text}</a></li>`)}
          ${cat.faq && cat.faq.length ? html`<li><a href="#faq">Perguntas frequentes</a></li>` : ''}
        </ul>
      </nav>
      <div class="side-card">
        <h2 class="side-card__title">Compre no atacado</h2>
        <p>Envie os códigos de interesse e receba preço, prazo e frete.</p>
        <a class="btn btn--wa btn--block" href="${waLink(ctx, waMessage)}" target="_blank" rel="noopener">${icons.whatsapp} WhatsApp</a>
        <a class="btn btn--outline btn--block" href="/contato/">Formulário de contato</a>
        <a class="side-card__link" href="/catalogo/">${icons.download} Catálogo ${site.catalogYear} (PDF)</a>
      </div>
    </div>
  </aside>

  <div class="product-main">
    <div id="variantes"></div>
    ${cat.lines.map((line) => html`<section class="product-line" id="${slugify(line.code)}" aria-labelledby="${slugify(line.code)}-title">
      <div class="product-line__head">
        <p class="eyebrow">Código ${line.code}</p>
        <h2 id="${slugify(line.code)}-title">${line.name}</h2>
        ${line.summary ? html`<p class="lead">${line.summary}</p>` : ''}
      </div>
      ${line.specs ? specsTable(line.specs, 'Especificações técnicas') : ''}
      ${line.note ? html`<p class="note">${line.note}</p>` : ''}
      ${line.table ? dataTable(line.table) : ''}
      ${line.images && line.images.length
        ? html`<div class="photo-row">${line.images.map((i) => html`<figure class="photo">${img(ctx, i.src, i.alt)}${i.caption ? html`<figcaption>${i.caption}</figcaption>` : ''}</figure>`)}</div>`
        : ''}
      ${line.variants && line.variants.length ? html`<h3 class="variants__title">${line.variantLabel || 'Estampas e cores'} <span>(${line.variants.length})</span></h3>` : ''}
      ${variantGrid(ctx, cat, line)}
    </section>`)}

    <article class="prose product-body">
      ${raw(cat.bodyHtml)}
    </article>

    ${cat.faq && cat.faq.length
      ? html`<section class="product-faq" id="faq" aria-labelledby="faq-title">
      <h2 id="faq-title">Perguntas frequentes sobre ${cat.shortName || cat.name}</h2>
      ${faqList(cat.faq)}
    </section>`
      : ''}
  </div>
</div>

${related.length
  ? html`<section class="section section--alt" aria-labelledby="related-title">
  <div class="container">
    ${sectionHead({ eyebrow: 'Veja também', title: 'Produtos relacionados' })}
    <div class="grid grid--3">
      ${related.map((r) => categoryCard(ctx, r))}
    </div>
  </div>
</section>`
  : ''}

${ctaBand(ctx, { message: waMessage, title: `Peça um orçamento de ${cat.shortName || cat.name}` })}
`;

  const jsonLd = [breadcrumbLd(ctx, crumbs), ...cat.lines.map((l) => productLd(ctx, cat, l))];
  if (cat.faq && cat.faq.length) jsonLd.push(faqLd(cat.faq));

  return {
    url,
    html: layout(ctx, { url, title: cat.title, description: cat.description, ogImage: cat.heroImage, jsonLd, bodyClass: 'page-produto' }, body),
  };
}

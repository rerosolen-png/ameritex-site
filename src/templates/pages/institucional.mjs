import { html, raw } from '../../lib/html.mjs';
import { layout, breadcrumbLd } from '../layout.mjs';
import { img, icons, waLink, breadcrumbs, sectionHead, ctaBand, featureGrid, formatAddress, mapsUrl } from '../components.mjs';

export function renderSobre(ctx) {
  const { site, produtos } = ctx;
  const url = '/sobre/';
  const years = ctx.buildDate.getFullYear() - site.foundedYear;
  const totalVariants = produtos.reduce((n, c) => n + c.variantCount, 0);
  const title = `Sobre a Ameritex | Importadora desde ${site.foundedYear}`;
  const description = `Ameritex: importadora de tecidos e plásticos fundada em ${site.foundedYear}, com sede em Albertina (MG), showroom em Santa Bárbara d'Oeste (SP) e atacado para todo o Brasil.`;
  const crumbs = [
    { name: 'Início', url: '/' },
    { name: 'Sobre', url },
  ];
  const shown = site.addresses.filter((a) => a.show);
  const values = [
    { icon: 'award', title: 'Compromisso com a especificação', text: 'Largura, metragem, composição e gramatura são definidas antes da compra e conferidas no recebimento. O que está no catálogo é o que chega na sua loja.' },
    { icon: 'users', title: 'Relação de longo prazo', text: 'Preferimos clientes que compram todo mês a vendas únicas. Por isso mantemos referências estáveis de estampa e cor, para facilitar a reposição.' },
    { icon: 'box', title: 'Estoque e logística próprios', text: 'Centro de distribuição com produtos em rolos e caixas fechadas, embalagem adequada e expedição por transportadoras para todas as regiões.' },
    { icon: 'globe', title: 'Importação direta e transparente', text: 'Compramos de fábricas parceiras na China, com inspeção pré-embarque, documentação completa e nota fiscal em todas as operações.' },
  ];

  const body = html`
<section class="page-head">
  <div class="container">
    ${breadcrumbs(crumbs)}
    <h1>Sobre a ${site.brand}</h1>
    <p class="lead">Importadora de tecidos e plásticos com mais de ${years} anos de atividade, especializada em produtos de PVC e revestimentos para o varejo, a indústria e o mercado de eventos.</p>
  </div>
</section>

<section class="section">
  <div class="container split">
    <div class="prose">
      <h2>Quem somos</h2>
      <p>A <strong>${site.legalName}</strong> foi fundada em ${site.foundedYear} e atua desde então na importação e na distribuição de produtos têxteis e plásticos para o mercado brasileiro. Ao longo de mais de três décadas, a empresa se especializou em artigos de PVC para a casa, para o comércio e para eventos — como passadeiras, toalhas de mesa, plástico cristal, forros, carpetes e revestimentos adesivos — sempre com foco na venda no atacado.</p>
      <p>Hoje a ${site.brand} mantém sede e centro de distribuição em <strong>Albertina, no sul de Minas Gerais</strong>, e showroom em <strong>Santa Bárbara d'Oeste, interior de São Paulo</strong>, de onde atende clientes em todas as regiões do país. A operação combina compra programada junto a fábricas parceiras, estoque próprio e uma equipe comercial que conhece o giro de cada produto no ponto de venda.</p>
      <h2>O que fazemos</h2>
      <p>Nosso trabalho começa na seleção das fábricas e na definição das especificações de cada linha: largura do rolo, metragem, composição, gramatura, acabamento e paleta de estampas e cores. Acompanhamos a produção, fazemos inspeção antes do embarque e cuidamos de todo o processo de importação até a chegada ao nosso centro de distribuição.</p>
      <p>A partir daí, o produto é vendido em rolos e caixas fechadas para lojistas, distribuidores regionais, fabricantes e empresas de eventos. Cada linha tem código próprio e ficha técnica publicada, o que simplifica o cadastro no seu sistema, a reposição e a comunicação com o consumidor final.</p>
    </div>
    <div class="split__media split__media--stack">
      ${img(ctx, 'categorias/carpete-para-eventos-rolos.jpg', 'Rolos de carpete para eventos Ameritex em diversas cores')}
      ${img(ctx, 'categorias/papel-de-parede-rolos.jpg', 'Rolos de papel de parede de PVC com padrões de madeira e mármore')}
    </div>
  </div>
</section>

<section class="section section--alt">
  <div class="container">
    <div class="stats">
      <div class="stat"><strong>${site.foundedYear}</strong><span>ano de fundação</span></div>
      <div class="stat"><strong>${years}+</strong><span>anos de mercado</span></div>
      <div class="stat"><strong>${produtos.length}</strong><span>linhas de produto</span></div>
      <div class="stat"><strong>${totalVariants}</strong><span>estampas, cores e medidas</span></div>
    </div>
  </div>
</section>

<section class="section">
  <div class="container">
    ${sectionHead({ eyebrow: 'Como trabalhamos', title: 'Princípios que orientam cada pedido' })}
    ${featureGrid(values)}
  </div>
</section>

<section class="section section--alt">
  <div class="container">
    ${sectionHead({ eyebrow: 'Estrutura', title: 'Onde estamos' })}
    <div class="grid grid--2">
      ${shown.map((a) => html`<div class="info-card">
        <h3>${a.label}</h3>
        <address>${formatAddress(a, { multiline: true })}</address>
        <a href="${mapsUrl(a)}" target="_blank" rel="noopener">Ver no mapa ${icons.arrow}</a>
      </div>`)}
    </div>
    <p class="note">Dados cadastrais: ${site.legalName} · CNPJ ${site.cnpj} · Comércio atacadista de tecidos e artigos de PVC.</p>
  </div>
</section>

${ctaBand(ctx, {})}
`;

  const jsonLd = [
    breadcrumbLd(ctx, crumbs),
    {
      '@context': 'https://schema.org',
      '@type': 'AboutPage',
      name: title,
      url: `${site.siteUrl}${url}`,
      inLanguage: 'pt-BR',
      about: { '@id': `${site.siteUrl}/#organization` },
    },
  ];
  return { url, html: layout(ctx, { url, title, description, jsonLd, bodyClass: 'page-sobre' }, body) };
}

export function renderContato(ctx) {
  const { site, produtos } = ctx;
  const url = '/contato/';
  const title = `Contato e orçamento | Ameritex – WhatsApp ${site.whatsapp.display}`;
  const description = `Fale com a Ameritex: WhatsApp ${site.whatsapp.display}, telefone ${site.phone.display} ou ${site.email}. Orçamentos no atacado para todo o Brasil.`;
  const crumbs = [
    { name: 'Início', url: '/' },
    { name: 'Contato', url },
  ];
  const shown = site.addresses.filter((a) => a.show);
  const primary = shown.find((a) => a.primary) || shown[0];
  const mapEmbed = `https://www.google.com/maps?q=${encodeURIComponent(`${primary.street}, ${primary.city} - ${primary.state}, ${primary.postalCode}`)}&output=embed`;

  const body = html`
<section class="page-head">
  <div class="container">
    ${breadcrumbs(crumbs)}
    <h1>Contato e orçamento</h1>
    <p class="lead">Atendimento comercial para lojistas, distribuidores e fabricantes. Envie os códigos de interesse e a quantidade aproximada: respondemos com preço, prazo e frete.</p>
  </div>
</section>

<section class="section">
  <div class="container contact-grid">
    <div>
      <div class="contact-cards">
        <a class="contact-card" href="${waLink(ctx)}" target="_blank" rel="noopener">
          <span class="contact-card__icon contact-card__icon--wa">${icons.whatsapp}</span>
          <span><strong>WhatsApp</strong><br>${site.whatsapp.display}<small>Resposta mais rápida em horário comercial</small></span>
        </a>
        <a class="contact-card" href="tel:${site.phone.e164}">
          <span class="contact-card__icon">${icons.phone}</span>
          <span><strong>Telefone</strong><br>${site.phone.display}<small>Ligação para o escritório comercial</small></span>
        </a>
        <a class="contact-card" href="mailto:${site.email}">
          <span class="contact-card__icon">${icons.mail}</span>
          <span><strong>E-mail</strong><br>${site.email}<small>Para pedidos, documentos e cadastro</small></span>
        </a>
      </div>

      <h2>Endereços</h2>
      <div class="grid grid--2">
        ${shown.map((a) => html`<div class="info-card">
          <h3>${a.label}</h3>
          <address>${formatAddress(a, { multiline: true })}</address>
          <a href="${mapsUrl(a)}" target="_blank" rel="noopener">Como chegar ${icons.arrow}</a>
        </div>`)}
      </div>
      ${site.openingHours ? html`<p class="note">Horário de atendimento: ${site.openingHours}</p>` : ''}
      <div class="map">
        <iframe src="${mapEmbed}" width="600" height="360" style="border:0" loading="lazy" referrerpolicy="no-referrer-when-downgrade" allowfullscreen title="Mapa – ${primary.label} ${site.brand}"></iframe>
      </div>
    </div>

    <div class="contact-form-wrap">
      <h2>Solicite um orçamento</h2>
      <p>Preencha os dados abaixo. Ao enviar, a mensagem é aberta no WhatsApp já formatada, para você revisar e enviar ao nosso time comercial.</p>
      <form class="contact-form" data-contact-form data-wa="${site.whatsapp.digits}" action="${waLink(ctx)}" method="get" target="_blank">
        <div class="field"><label for="f-nome">Nome *</label><input id="f-nome" name="nome" type="text" autocomplete="name" required></div>
        <div class="field"><label for="f-empresa">Empresa</label><input id="f-empresa" name="empresa" type="text" autocomplete="organization"></div>
        <div class="field-row">
          <div class="field"><label for="f-cidade">Cidade / UF *</label><input id="f-cidade" name="cidade" type="text" autocomplete="address-level2" required></div>
          <div class="field"><label for="f-telefone">WhatsApp / telefone *</label><input id="f-telefone" name="telefone" type="tel" autocomplete="tel" required></div>
        </div>
        <div class="field"><label for="f-tipo">Tipo de negócio</label>
          <select id="f-tipo" name="tipo">
            <option value="">Selecione</option>
            ${site.audiences.map((a) => html`<option>${a.charAt(0).toUpperCase() + a.slice(1)}</option>`)}
            <option>Outro</option>
          </select>
        </div>
        <div class="field"><label for="f-produto">Produto de interesse</label>
          <select id="f-produto" name="produto">
            <option value="">Selecione</option>
            ${produtos.map((p) => html`<option>${p.name}</option>`)}
            <option>Vários produtos</option>
          </select>
        </div>
        <div class="field"><label for="f-msg">Mensagem (códigos, quantidades, dúvidas) *</label><textarea id="f-msg" name="mensagem" rows="5" required></textarea></div>
        <p class="form-consent">Ao enviar, você concorda com a nossa <a href="/politica-de-privacidade/">política de privacidade</a>. Usamos seus dados apenas para responder ao seu contato.</p>
        <button type="submit" class="btn btn--wa btn--lg btn--block">${icons.whatsapp} Enviar pelo WhatsApp</button>
        <p class="form-alt">Prefere e-mail? Escreva para <a href="mailto:${site.email}">${site.email}</a>.</p>
      </form>
    </div>
  </div>
</section>
`;

  const jsonLd = [
    breadcrumbLd(ctx, crumbs),
    {
      '@context': 'https://schema.org',
      '@type': 'ContactPage',
      name: title,
      url: `${site.siteUrl}${url}`,
      inLanguage: 'pt-BR',
      about: { '@id': `${site.siteUrl}/#organization` },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'LocalBusiness',
      '@id': `${site.siteUrl}/#localbusiness`,
      name: site.brand,
      parentOrganization: { '@id': `${site.siteUrl}/#organization` },
      image: `${site.siteUrl}${ctx.img(site.ogImage).src}`,
      telephone: site.phone.e164,
      email: site.email,
      url: `${site.siteUrl}/`,
      priceRange: '$$',
      address: shown.map((a) => ({
        '@type': 'PostalAddress',
        name: a.label,
        streetAddress: a.street,
        addressLocality: a.city,
        addressRegion: a.state,
        postalCode: a.postalCode || undefined,
        addressCountry: 'BR',
      })),
      areaServed: { '@type': 'Country', name: 'Brasil' },
    },
  ];
  return { url, html: layout(ctx, { url, title, description, jsonLd, bodyClass: 'page-contato' }, body) };
}

export function renderCatalogo(ctx) {
  const { site, produtos } = ctx;
  const url = '/catalogo/';
  const title = `Catálogo ${site.catalogYear} em PDF | Ameritex`;
  const description = `Baixe o catálogo ${site.catalogYear} da Ameritex em PDF: todas as linhas de PVC e revestimentos com códigos, medidas, composição e fotos de estampas e cores.`;
  const crumbs = [
    { name: 'Início', url: '/' },
    { name: `Catálogo ${site.catalogYear}`, url },
  ];
  const body = html`
<section class="page-head">
  <div class="container">
    ${breadcrumbs(crumbs)}
    <h1>Catálogo ${site.catalogYear} em PDF</h1>
    <p class="lead">Todas as linhas de produto em um único arquivo, com códigos, especificações técnicas e fotos de cada estampa e cor. Ideal para montar pedidos, treinar a equipe e apresentar aos seus clientes.</p>
    <div class="page-head__actions">
      <a class="btn btn--primary btn--lg" href="${site.catalogFile}" download>${icons.download} Baixar catálogo (PDF, 28 MB)</a>
      <a class="btn btn--wa btn--lg" href="${waLink(ctx)}" target="_blank" rel="noopener">${icons.whatsapp} Pedir orçamento</a>
    </div>
  </div>
</section>
<section class="section">
  <div class="container split">
    <div class="prose">
      <h2>O que você encontra no catálogo</h2>
      <ul>
        ${produtos.map((p) => html`<li><a href="${p.url}">${p.name}</a> – ${p.lead}</li>`)}
      </ul>
      <h2>Como usar</h2>
      <ol>
        <li>Baixe o PDF e localize a linha de produto desejada.</li>
        <li>Anote o código completo de cada item (por exemplo, <code>85002 B9</code> ou <code>TMP30</code>).</li>
        <li>Envie a lista com as quantidades pelo <a href="/contato/">formulário</a> ou pelo WhatsApp.</li>
      </ol>
      <p>Prefere navegar online? As mesmas informações estão nas <a href="/produtos/">páginas de produto</a>, com filtros por grupo de estampa e imagens ampliadas.</p>
    </div>
    <div class="split__media">
      ${img(ctx, 'categorias/plastico-cristal-expositor.jpg', 'Expositor Ameritex com rolos de plástico cristal transparente')}
    </div>
  </div>
</section>
${ctaBand(ctx, {})}
`;
  const jsonLd = [
    breadcrumbLd(ctx, crumbs),
    {
      '@context': 'https://schema.org',
      '@type': 'DigitalDocument',
      name: `Catálogo Ameritex ${site.catalogYear}`,
      url: `${site.siteUrl}${site.catalogFile}`,
      encodingFormat: 'application/pdf',
      inLanguage: 'pt-BR',
      publisher: { '@id': `${site.siteUrl}/#organization` },
    },
  ];
  return { url, html: layout(ctx, { url, title, description, jsonLd, bodyClass: 'page-catalogo' }, body) };
}

export function renderPrivacidade(ctx) {
  const { site } = ctx;
  const url = '/politica-de-privacidade/';
  const title = 'Política de privacidade | Ameritex';
  const description = `Saiba como a Ameritex trata os dados pessoais enviados pelo site, formulários e WhatsApp, em conformidade com a LGPD (Lei nº 13.709/2018).`;
  const crumbs = [
    { name: 'Início', url: '/' },
    { name: 'Política de privacidade', url },
  ];
  const body = html`
<section class="page-head">
  <div class="container container--narrow">
    ${breadcrumbs(crumbs)}
    <h1>Política de privacidade</h1>
    <p class="lead">Última atualização: ${ctx.buildDate.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
  </div>
</section>
<section class="section">
  <div class="container container--narrow prose">
    <h2>1. Quem somos</h2>
    <p>Este site é mantido por <strong>${site.legalName}</strong>, inscrita no CNPJ sob o nº ${site.cnpj} (“${site.brand}”). Esta política explica quais dados pessoais coletamos, para que os usamos e quais são os seus direitos, em conformidade com a Lei Geral de Proteção de Dados Pessoais (Lei nº 13.709/2018 – LGPD).</p>
    <h2>2. Dados que coletamos</h2>
    <ul>
      <li><strong>Dados de contato</strong> informados voluntariamente por você no formulário de orçamento, por e-mail ou pelo WhatsApp: nome, empresa, cidade, telefone, e-mail e o conteúdo da mensagem.</li>
      <li><strong>Dados de navegação</strong> coletados de forma automática pelo servidor de hospedagem, como endereço IP, data e hora de acesso, páginas visitadas e tipo de navegador, utilizados exclusivamente para segurança e estatísticas agregadas.</li>
    </ul>
    <p>O site não utiliza cookies de rastreamento publicitário. Fontes tipográficas são carregadas do Google Fonts e o mapa da página de contato é fornecido pelo Google Maps; esses serviços podem registrar o seu endereço IP conforme suas próprias políticas.</p>
    <h2>3. Finalidade e base legal</h2>
    <p>Usamos os dados de contato para responder às suas solicitações, elaborar orçamentos, emitir documentos fiscais e manter o relacionamento comercial (execução de contrato e procedimentos preliminares, art. 7º, V, da LGPD, e legítimo interesse, art. 7º, IX). Não vendemos nem cedemos seus dados a terceiros para fins de marketing.</p>
    <h2>4. Compartilhamento</h2>
    <p>Os dados podem ser compartilhados apenas com prestadores de serviço necessários à operação (transportadoras, provedores de e-mail e hospedagem, serviços de mensagens) e com autoridades quando exigido por lei.</p>
    <h2>5. Armazenamento e segurança</h2>
    <p>Mantemos os dados pelo tempo necessário ao atendimento da solicitação e ao cumprimento de obrigações legais e fiscais. Adotamos medidas técnicas e administrativas razoáveis para proteger os dados contra acesso não autorizado, perda ou alteração.</p>
    <h2>6. Seus direitos</h2>
    <p>Você pode solicitar, a qualquer momento, a confirmação do tratamento, o acesso, a correção, a anonimização, a portabilidade ou a eliminação dos seus dados, bem como revogar consentimentos. Para exercer esses direitos, escreva para <a href="mailto:${site.email}">${site.email}</a>.</p>
    <h2>7. Alterações</h2>
    <p>Esta política pode ser atualizada para refletir mudanças legais ou operacionais. A data da última atualização aparece no topo desta página.</p>
  </div>
</section>
`;
  const jsonLd = [breadcrumbLd(ctx, crumbs)];
  return { url, html: layout(ctx, { url, title, description, jsonLd, bodyClass: 'page-privacidade' }, body) };
}

export function renderNotFound(ctx) {
  const { site, produtos } = ctx;
  const url = '/404.html';
  const title = 'Página não encontrada | Ameritex';
  const description = 'A página que você procura não existe ou foi movida. Veja as linhas de produto da Ameritex ou fale com o nosso time comercial.';
  const body = html`
<section class="page-head">
  <div class="container container--narrow">
    <p class="eyebrow">Erro 404</p>
    <h1>Página não encontrada</h1>
    <p class="lead">O endereço pode ter mudado com a atualização do site. Use os atalhos abaixo ou volte para a <a href="/">página inicial</a>.</p>
    <ul class="link-list">
      ${produtos.map((p) => html`<li><a href="${p.url}">${p.name}</a></li>`)}
      <li><a href="/contato/">Contato e orçamento</a></li>
    </ul>
  </div>
</section>
`;
  return { url, sitemap: false, html: layout(ctx, { url, title, description, noindex: true, bodyClass: 'page-404' }, body) };
}

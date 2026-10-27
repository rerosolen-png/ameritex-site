import { html } from '../../lib/html.mjs';
import { layout } from '../layout.mjs';
import { img, icons, waLink, categoryCard, guideCard, sectionHead, faqList, faqLd, ctaBand, featureGrid, highlightList } from '../components.mjs';

export function renderHome(ctx) {
  const { site, produtos, guias, faq } = ctx;
  const years = ctx.buildDate.getFullYear() - site.foundedYear;
  const totalVariants = produtos.reduce((n, c) => n + c.variantCount, 0);

  const title = `Ameritex | Importadora de tecidos e plásticos – atacado`;
  const description = `Importadora de tecidos e plásticos desde ${site.foundedYear}: passadeiras e toalhas de PVC, plástico cristal, carpete para eventos e revestimentos adesivos. Venda no atacado.`;

  const features = [
    { icon: 'award', title: `Mais de ${years} anos de mercado`, text: `Fundada em ${site.foundedYear}, a ${site.brand} é uma importadora com histórico comprovado, CNPJ ativo e relacionamento de longo prazo com fornecedores e clientes.` },
    { icon: 'globe', title: 'Importação direta', text: 'Compramos direto das fábricas, em volume, e controlamos cada etapa: especificação, inspeção, desembaraço aduaneiro e armazenagem.' },
    { icon: 'box', title: 'Estoque pronto para entrega', text: 'Rolos e caixas fechadas em estoque no centro de distribuição, com reposição programada ao longo do ano para evitar ruptura na sua loja.' },
    { icon: 'truck', title: 'Entrega para todo o Brasil', text: 'Expedimos para todas as regiões por transportadoras parceiras, com embalagem adequada para rolos longos e produtos sensíveis.' },
    { icon: 'layers', title: 'Especificação técnica clara', text: 'Cada linha tem código, largura, metragem, composição e gramatura definidos — o que facilita o cadastro, o pedido e a reposição.' },
    { icon: 'users', title: 'Atendimento consultivo', text: 'Nossa equipe conhece o giro de cada produto no varejo e ajuda a montar um mix equilibrado de estampas, cores e larguras.' },
  ];

  const steps = [
    { n: '1', title: 'Escolha no catálogo', text: 'Navegue pelas linhas de produto ou baixe o catálogo em PDF e anote os códigos das estampas, cores e larguras de interesse.' },
    { n: '2', title: 'Fale com um consultor', text: 'Envie a lista pelo WhatsApp, e-mail ou formulário. Informe cidade, CNPJ e o tipo do seu negócio.' },
    { n: '3', title: 'Receba o orçamento', text: 'Retornamos com preços, condições de pagamento, prazo e frete para o seu endereço.' },
    { n: '4', title: 'Receba os produtos', text: 'Após a confirmação, separamos e expedimos. Você acompanha a entrega até a chegada na sua loja ou depósito.' },
  ];

  const body = html`
<section class="hero">
  <div class="container hero__inner">
    <div class="hero__text">
      <p class="eyebrow eyebrow--light">Importadora de tecidos e plásticos desde ${site.foundedYear}</p>
      <h1>Produtos de PVC e revestimentos para o seu negócio, com importação direta e entrega em todo o Brasil</h1>
      <p class="hero__lead">Passadeiras de PVC, toalhas de mesa plásticas, plástico cristal, carpete para eventos, forro para gavetas, grama artificial, papel de parede e placas adesivas. ${totalVariants} opções de estampas, cores e medidas, em rolos e caixas fechadas para lojistas, distribuidores e fabricantes.</p>
      <div class="hero__actions">
        <a class="btn btn--primary btn--lg" href="/produtos/">Ver todos os produtos ${icons.arrow}</a>
        <a class="btn btn--wa btn--lg" href="${waLink(ctx)}" target="_blank" rel="noopener">${icons.whatsapp} Falar com um consultor</a>
      </div>
      ${highlightList(['Venda no atacado, em rolos e caixas fechadas', 'Códigos e fichas técnicas de todas as linhas', `Catálogo ${site.catalogYear} em PDF para download`])}
    </div>
    <div class="hero__media">
      ${img(ctx, 'categorias/toalhas-de-mesa-expositor.jpg', 'Expositor Ameritex com rolos de toalhas de mesa plásticas estampadas', { loading: 'eager', fetchpriority: 'high' })}
    </div>
  </div>
</section>

<section class="section" aria-labelledby="linhas-title">
  <div class="container">
    ${sectionHead({ eyebrow: 'Catálogo', title: 'Linhas de produto', text: 'Cada linha tem código próprio, especificação técnica completa e todas as estampas e cores disponíveis no catálogo atual.', center: true })}
    <div class="grid grid--3">
      ${produtos.map((cat) => categoryCard(ctx, cat))}
    </div>
    <p class="section__more"><a class="btn btn--outline" href="/catalogo/">${icons.download} Baixar o catálogo ${site.catalogYear} em PDF</a></p>
  </div>
</section>

<section class="section section--alt" aria-labelledby="porque-title">
  <div class="container">
    ${sectionHead({ eyebrow: 'Por que comprar da Ameritex', title: 'Uma importadora com estrutura para abastecer o varejo e a indústria', text: `Desde ${site.foundedYear} trabalhamos com um princípio simples: produto certo, especificação clara e entrega no prazo. É isso que mantém o cliente comprando ano após ano.` })}
    ${featureGrid(features)}
  </div>
</section>

<section class="section" aria-labelledby="para-quem-title">
  <div class="container split">
    <div>
      ${sectionHead({ eyebrow: 'Para quem vendemos', title: 'Clientes que atendemos no atacado' })}
      <p>Nossos produtos chegam ao consumidor final por meio de uma rede de revendedores e empresas que precisam de abastecimento constante e preço de importadora. Entre eles:</p>
      <ul class="check-list">
        ${site.audiences.map((a) => html`<li>${icons.check}<span>${a.charAt(0).toUpperCase() + a.slice(1)}</span></li>`)}
      </ul>
      <p>Se o seu negócio compra em rolos, caixas fechadas ou volumes regulares, você está no lugar certo. Consulte quantidades mínimas por linha com o nosso time comercial.</p>
    </div>
    <div class="split__media">
      ${img(ctx, 'categorias/passadeiras-de-pvc-expositor.jpg', 'Expositor de passadeiras de PVC Ameritex com rolos estampados')}
    </div>
  </div>
</section>

<section class="section section--alt" aria-labelledby="como-comprar-title">
  <div class="container">
    ${sectionHead({ eyebrow: 'Como comprar', title: 'Do catálogo à entrega em quatro passos', center: true })}
    <ol class="steps">
      ${steps.map((s) => html`<li class="step"><span class="step__n" aria-hidden="true">${s.n}</span><h3>${s.title}</h3><p>${s.text}</p></li>`)}
    </ol>
  </div>
</section>

<section class="section" aria-labelledby="guias-title">
  <div class="container">
    ${sectionHead({ eyebrow: 'Guias', title: 'Conteúdo para vender melhor', text: 'Explicações práticas sobre nossos produtos, para você orientar o seu cliente e montar um mix que gira.' })}
    <div class="grid grid--3">
      ${guias.slice(0, 3).map((g) => guideCard(ctx, g))}
    </div>
    <p class="section__more"><a class="btn btn--outline" href="/guias/">Ver todos os guias ${icons.arrow}</a></p>
  </div>
</section>

<section class="section section--alt" aria-labelledby="faq-title">
  <div class="container container--narrow">
    ${sectionHead({ eyebrow: 'Perguntas frequentes', title: 'Dúvidas comuns de quem compra no atacado', center: true })}
    ${faqList(faq)}
  </div>
</section>

${ctaBand(ctx, {})}
`;

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      '@id': `${site.siteUrl}/#website`,
      url: `${site.siteUrl}/`,
      name: site.brand,
      inLanguage: 'pt-BR',
      publisher: { '@id': `${site.siteUrl}/#organization` },
    },
    faqLd(faq),
  ];

  return { url: '/', html: layout(ctx, { url: '/', title, description, jsonLd, bodyClass: 'page-home' }, body) };
}

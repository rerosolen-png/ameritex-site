# Medição e marketing

Como o site se conecta ao Google Analytics, Google Ads, Meta Pixel, Search Console e demais ferramentas, e como ligar cada uma.

## 1. Como funciona

- Os IDs ficam em um único lugar: os blocos `tracking` e `verification` de [`src/data/site.json`](../src/data/site.json). Campo vazio significa ferramenta desligada.
- Com pelo menos um ID preenchido, o build inclui nas páginas o **aviso de cookies** e o script [`src/scripts/tracking.js`](../src/scripts/tracking.js).
- **Nada de terceiros é carregado antes da escolha do visitante.** Isso atende à LGPD, que exige consentimento para cookies de análise e de publicidade.
- O visitante pode aceitar tudo, recusar, ou escolher por categoria. A escolha vale por 12 meses e pode ser revista em **Preferências de cookies**, no rodapé. Ao revogar, os cookies de medição são apagados.
- A política de privacidade passa a listar, automaticamente, só as ferramentas que estiverem ligadas.
- A prévia no GitHub Pages nunca mede, para não misturar visitas de teste com as reais.

| Categoria no aviso | Ferramentas | Campo em `site.json` |
|--------------------|-------------|----------------------|
| Análise | Google Analytics 4 | `tracking.ga4Id` |
| Marketing | Google Ads | `tracking.googleAdsId` e `tracking.googleAdsConversions` |
| Marketing | Meta Pixel (Facebook e Instagram) | `tracking.metaPixelId` |

O Google recebe o estado do consentimento pelo **Consent Mode v2** (`ad_storage`, `ad_user_data`, `ad_personalization`, `analytics_storage`), exigido para campanhas no Google Ads.

## 2. Eventos enviados

| Ação do visitante | Google Analytics | Meta Pixel | Conversão do Google Ads |
|-------------------|------------------|------------|--------------------------|
| Abre qualquer página | `page_view` (automático) | `PageView` | |
| Abre uma página de produto | `page_view` | `ViewContent` com o nome do produto | |
| Clica em um link do WhatsApp | `whatsapp_click` | `Contact` | `googleAdsConversions.whatsapp` |
| Clica no telefone | `phone_click` | `Contact` | `googleAdsConversions.phone` |
| Clica no e-mail | `email_click` | `Contact` | |
| Envia o formulário de orçamento | `generate_lead` | `Lead` | `googleAdsConversions.lead` |
| Baixa o catálogo em PDF | `catalog_download` | `CatalogDownload` (personalizado) | `googleAdsConversions.catalog` |

Nenhum dado pessoal do formulário (nome, telefone, cidade, mensagem) é enviado às ferramentas. Do formulário vão apenas o produto de interesse e o tipo de negócio.

No Google Analytics, marque `generate_lead` e `whatsapp_click` como **eventos principais** (Administrador → Eventos), para que apareçam como conversões nos relatórios.

## 3. Onde obter cada ID

Use sempre a conta Google da empresa (a mesma que administra o e-mail), para que os dados pertençam à Ameritex e não a uma conta pessoal.

### Google Analytics 4 → `tracking.ga4Id`

1. Acesse <https://analytics.google.com> e crie uma conta "Ameritex" e uma propriedade "ameritex.com.br" (fuso horário de Brasília, moeda Real). É preciso aceitar os termos de serviço.
2. Em **Fluxos de dados**, adicione um fluxo **Web** com `https://ameritex.com.br`.
3. Copie o **ID da métrica**, no formato `G-XXXXXXXXXX`.

### Google Ads → `tracking.googleAdsId` e conversões

1. Acesse <https://ads.google.com> e crie a conta. A criação pede dados de faturamento.
2. Em **Metas → Conversões → Nova ação de conversão → Site**, crie as ações desejadas, por exemplo "Clique no WhatsApp" e "Formulário de orçamento".
3. Em cada ação, escolha "Usar a tag do Google" e veja o trecho do evento. Dele saem dois valores:
   - o ID da conta, `AW-1234567890`, que vai em `googleAdsId`;
   - o destino completo, `AW-1234567890/AbCdEfGhIjK`, que vai no campo correspondente de `googleAdsConversions`.
4. Vincule o Google Ads ao Google Analytics em **Administrador → Vinculações de produtos**.

### Meta Pixel → `tracking.metaPixelId`

1. Acesse <https://business.facebook.com> → **Gerenciador de Eventos → Conectar dados → Web**.
2. Crie o conjunto de dados (pixel) "Ameritex" e copie o **ID do pixel**, formado só por números.
3. Para verificar o domínio na Meta, vá em **Configurações do negócio → Segurança da marca → Domínios**, adicione `ameritex.com.br` e escolha a verificação por DNS ou por meta tag. Na opção meta tag, o código vai em `verification.facebookDomain`.

### Google Search Console

- Propriedade do tipo **Domínio**, verificada por registro TXT no DNS da HostGator. Não exige nada no código.
- Sitemap a enviar: `https://ameritex.com.br/sitemap.xml`.
- Se um dia for preciso verificar por meta tag, o código vai em `verification.google`.

### Bing Webmaster Tools

- Acesse <https://www.bing.com/webmasters> e use **Importar do Google Search Console**. É o caminho mais rápido.
- Alternativa: meta tag, com o código em `verification.bing`.

## 4. Como ligar uma ferramenta

1. Edite `src/data/site.json` e preencha o campo do ID.
2. Rode `npm test`. O build confere o formato de cada ID e avisa se algo estiver errado.
3. Abra um pull request. Depois do merge, a publicação é automática.

Exemplo:

```json
"tracking": {
  "ga4Id": "G-ABCDE12345",
  "googleAdsId": "AW-1234567890",
  "googleAdsConversions": {
    "whatsapp": "AW-1234567890/AbCdEfGhIjK",
    "lead": "AW-1234567890/LmNoPqRsTuV",
    "phone": "",
    "catalog": ""
  },
  "metaPixelId": "123456789012345"
}
```

## 5. Como testar depois de publicar

- **Aviso de cookies:** abra o site em uma janela anônima. O aviso aparece e, antes de aceitar, a aba Rede do navegador não mostra chamadas para `googletagmanager.com` nem `facebook.net`.
- **Google Analytics:** aceite os cookies e veja a visita em **Relatórios → Tempo real**. Para depurar evento por evento, use a extensão Google Tag Assistant e o **DebugView**.
- **Google Ads:** em **Metas → Conversões**, o status da ação muda para "Registrando conversões" depois do primeiro clique medido.
- **Meta Pixel:** use a extensão Meta Pixel Helper ou a aba **Testar eventos** do Gerenciador de Eventos.

## 6. Decisões de projeto

- **Sem Google Tag Manager.** As tags ficam no repositório, versionadas e validadas pelo CI. O site carrega menos código e toda mudança passa por revisão. Se a equipe de marketing precisar publicar tags sem deploy, o GTM pode ser adicionado depois.
- **Consentimento básico, sem pings.** Sem autorização, o site não envia nenhum dado ao Google nem à Meta. A consequência é que visitas de quem recusa não aparecem nos relatórios.
- **Eventos com nomes próprios** (`whatsapp_click`, `catalog_download`) para não duplicar o que a medição otimizada do GA4 já coleta sozinha, como downloads e cliques de saída.

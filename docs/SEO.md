# SEO – o que está implementado e o que fazer após o lançamento

## 1. Estratégia

O site antigo tinha nove produtos genéricos ("Toalha Mesa Impermeavel", "Tecido para Roupas") sem especificação, com textos duplicados e dados desatualizados. O novo site segue três princípios:

1. **Uma página por linha de produto, com conteúdo real.** Cada página tem código, ficha técnica, todas as variantes com nome descritivo e foto, 600 a 900 palavras de texto útil, FAQ e dados estruturados. É o que o Google precisa para entender e posicionar a página para buscas como "passadeira de pvc atacado" ou "toalha de mesa plástica em rolo".
2. **Conteúdo de apoio (guias).** Artigos que respondem às dúvidas que precedem a compra ("qual espessura de plástico cristal", "quantos rolos de carpete") trazem tráfego qualificado e linkam para os produtos.
3. **Sinais de confiança (E-E-A-T).** CNPJ, razão social, ano de fundação, endereços, telefone e política de privacidade visíveis e marcados em JSON-LD.

## 2. Implementação técnica

| Item | Onde |
|------|------|
| `<title>` único por página (≤ 65 caracteres), com palavra-chave principal no início | `title` em `produtos.json`, front matter dos guias, templates |
| Meta description única (50–165 caracteres) | idem |
| Um `<h1>` por página; hierarquia `h2`/`h3` consistente | templates e Markdown |
| URLs limpas, em português, com barra final (`/produtos/passadeiras-de-pvc/`) | `slug` |
| `<link rel="canonical">` em todas as páginas | `layout.mjs` |
| `<html lang="pt-BR">`, `og:locale pt_BR` | `layout.mjs` |
| Open Graph e Twitter Card com imagem por página | `layout.mjs` (`ogImage` = imagem de destaque) |
| Dados estruturados JSON-LD: `Organization` (todas), `WebSite` + `FAQPage` (início), `BreadcrumbList` (internas), `Product` por linha + `FAQPage` (produtos), `ItemList` (listagem), `Article` (guias), `AboutPage`, `ContactPage` + `LocalBusiness`, `DigitalDocument` (catálogo) | `layout.mjs` e templates de página |
| `sitemap.xml` com `lastmod` e `robots.txt` com referência ao sitemap | `build.mjs`, `public/robots.txt` |
| Breadcrumbs visíveis e marcados | `components.mjs` |
| Imagens com `alt` descritivo (código + nome da estampa), `width`/`height` (sem CLS) e `loading="lazy"` (exceto a primeira dobra, com `fetchpriority="high"`) | `components.mjs` |
| Links internos entre produtos relacionados, guias ↔ produtos, menu e rodapé completos | templates e `related` |
| Página 404 com `noindex` e atalhos | `institucional.mjs` |
| Redirecionamentos das URLs antigas | `redirects.json` → páginas `meta refresh` com canonical para o destino + `_redirects` |
| Performance: CSS único com hash, ~4 KB de JS, fontes com `preconnect` e `display=swap`, sem bibliotecas | `main.css`, `main.js`, `layout.mjs` |
| Mobile first, menu acessível (`aria-expanded`), foco visível, skip link | `main.css`, `main.js` |
| Validação automática de tudo isso em cada build | `scripts/check.mjs` |

## 3. Palavras-chave por página

| Página | Foco principal | Secundárias |
|--------|----------------|-------------|
| Início | importadora de tecidos e plásticos, atacado | PVC, Albertina MG, Santa Bárbara d'Oeste |
| Passadeiras de PVC | passadeira de pvc em rolo, passadeira de pvc atacado | tapete passadeira antiderrapante, passadeira pet |
| Toalhas com forro | toalha de mesa plástica com forro, toalha térmica em rolo | toalha plástica 1,40 m, toalha xadrez |
| Toalhas dupla face | toalha de mesa dupla face pvc | toalha plástica estampada |
| Plástico cristal | plástico cristal transparente, pvc cristal em rolo | plástico cristal 0,20 mm, 1 mm |
| Carpete para eventos | carpete para eventos, forração para eventos | carpete retardante de chamas, carpete 2 m |
| Forro para gavetas | forro antiderrapante para gavetas, forro para armário | manta antiderrapante pvc |
| Grama artificial | grama sintética em rolo, grama artificial 2 m | grama sintética 10 mm, 20 mm |
| Papel de parede | papel de parede adesivo pvc, papel de parede ripado | adesivo mármore, 45 cm x 10 m |
| Placa adesiva | placa adesiva de pvc, painel ripado adesivo | placa 3d parede, subway tile adesivo |

## 4. Checklist pós-lançamento

1. **Google Search Console:** adicionar a propriedade `ameritex.com.br` (verificação por DNS), enviar `https://ameritex.com.br/sitemap.xml`, pedir indexação das páginas principais e acompanhar "Páginas" e "Melhorias" por algumas semanas.
2. **Bing Webmaster Tools:** importar do Search Console.
3. **Google Business Profile:** criar/atualizar o perfil da empresa com o mesmo nome, endereço e telefone do site (NAP consistente), categoria "Importador" / "Atacadista de tecidos", fotos e link para o site. Depois, preencher `social` em `site.json` com os perfis e o build inclui em `sameAs`.
4. **Redirecionamentos:** testar as URLs antigas listadas em `src/data/redirects.json`. Se o novo site for hospedado em Netlify/Cloudflare, os 301 reais são lidos de `_redirects`.
5. **Rich results:** validar uma página de produto e um guia em https://search.google.com/test/rich-results.
6. **Core Web Vitals:** rodar o PageSpeed Insights na página inicial e em uma página de produto; a meta é ≥ 90 em mobile.
7. **Conteúdo contínuo:** publicar um guia novo por mês (dúvidas reais do balcão), atualizar as páginas de produto a cada catálogo e manter os guias com `updated` quando revisados.
8. **Backlinks:** solicitar que fornecedores, associações e clientes-chave linkem para o site; cadastrar em diretórios B2B do setor têxtil e de utilidades domésticas.

## 5. O que não fazer

- Não criar páginas quase iguais para cada estampa (conteúdo duplicado). As variantes vivem na página da linha, com âncoras.
- Não trocar URLs sem adicionar o redirecionamento em `redirects.json`.
- Não publicar imagens sem `alt` nem acima de 350 KB (o build avisa).
- Não usar títulos genéricos ("Produto", "Home"): cada `title` deve dizer o que a página é.

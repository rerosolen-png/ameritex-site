# Como editar o conteúdo do site

Todo o conteúdo fica em arquivos de texto dentro de `src/`. Não é preciso mexer em HTML: o build monta as páginas a partir desses arquivos. Depois de editar, rode `npm test` (ou abra um pull request e deixe o CI rodar) — se algo estiver inconsistente, a validação aponta o arquivo e o problema.

## 1. Dados da empresa – `src/data/site.json`

| Campo | O que é |
|-------|---------|
| `brand`, `legalName`, `cnpj`, `foundedYear` | Nome fantasia, razão social, CNPJ e ano de fundação (aparecem no rodapé, no Sobre e nos dados estruturados) |
| `siteUrl` | URL pública de produção, sem barra no final. Usada em canonical, sitemap, robots e Open Graph (o deploy pode sobrescrever com a variável `SITE_URL`) |
| `email` | E-mail de contato |
| `phone.display` / `phone.e164` | Telefone como aparece e no formato internacional (`+55…`) para o link `tel:` |
| `whatsapp.display` / `e164` / `digits` / `defaultMessage` | WhatsApp. `digits` é só números com DDI (usado em `wa.me/`). `defaultMessage` é o texto pré-preenchido |
| `addresses[]` | Endereços. `show: false` esconde o endereço do site sem apagá-lo; `primary: true` marca o endereço principal (mapa e dados estruturados) |
| `openingHours` | Horário de atendimento (texto livre). Vazio = não exibe |
| `social` | URLs do Instagram, Facebook e LinkedIn. Vazias = não exibe |
| `catalogFile`, `catalogYear` | Caminho do PDF em `public/` e ano do catálogo (aparece nos botões) |
| `nav[]` | Itens do menu principal. O item com `"children": "produtos"` recebe o submenu com todas as linhas |
| `audiences[]` | Lista de públicos (página inicial e formulário de contato) |

## 2. Produtos – `src/data/produtos.json`

É uma lista de **categorias** (uma por página). Campos principais:

```jsonc
{
  "slug": "passadeiras-de-pvc",            // vira a URL: /produtos/passadeiras-de-pvc/
  "name": "Passadeiras de PVC",            // nome completo
  "shortName": "Passadeiras de PVC",       // nome curto (menu, rodapé)
  "title": "… | Ameritex",                 // <title> da página – máx. 65 caracteres
  "description": "…",                      // meta description – 50 a 165 caracteres
  "h1": "Passadeiras de PVC em rolo",      // título visível
  "lead": "…",                             // parágrafo de abertura (também aparece nos cards)
  "heroImage": "categorias/….jpg",         // imagem de destaque (também usada no Open Graph)
  "heroAlt": "…",                          // texto alternativo da imagem de destaque
  "cardImage": "produtos/…/85001-c4.jpg",  // imagem do card nas listagens
  "variantNoun": "estampas e cores",       // como contar as variantes no card ("31 estampas e cores")
  "highlights": ["…", "…"],                // até 4 destaques com ✓ no topo
  "related": ["toalhas-de-mesa-com-forro"],// slugs de categorias relacionadas
  "lines": [ … ],                          // linhas de produto (ver abaixo)
  "faq": [ { "q": "…", "a": "…" } ]        // perguntas frequentes (geram FAQPage no JSON-LD)
}
```

### Linhas (`lines[]`)

Cada categoria tem uma ou mais linhas (por exemplo, passadeira 45 cm e passadeira 65 cm):

```jsonc
{
  "code": "85001",                          // código do catálogo (vira a âncora da seção)
  "name": "Passadeira de PVC 45 cm",
  "summary": "…",                           // parágrafo curto abaixo do título
  "material": "PVC",                        // opcional – vai para o JSON-LD
  "countryOfOrigin": "China",               // opcional – vai para o JSON-LD
  "specs": [["Largura", "45 cm"], …],       // tabela "Especificações técnicas"
  "note": "…",                              // opcional – observação destacada
  "table": {                                // opcional – tabela adicional (espessuras, códigos por largura)
    "caption": "…", "headers": ["…"], "rows": [["…", "…"]]
  },
  "images": [ { "src": "…", "alt": "…", "caption": "…" } ], // opcional – fotos extras
  "variantLabel": "Estampas e cores",       // título da grade de variantes
  "variants": [ … ]                         // ver abaixo
}
```

### Variantes (`variants[]`)

```jsonc
{ "code": "85001 C4", "name": "Folhas bege", "group": "Estampadas", "image": "produtos/passadeiras-de-pvc/85001-c4.jpg" }
```

- `code` e `name` são obrigatórios. `name` deve descrever a estampa/cor (ajuda o cliente e o Google).
- `group` é opcional; quando há mais de um grupo, a página ganha filtros ("Todas", "Estampadas", "Lisas", "Linha pet").
- `image` é opcional. Sem imagem, a variante aparece como etiqueta; use `"color": "#8d8d8d"` para mostrar uma bolinha de cor.
- `backImage` (toalhas dupla face) mostra o verso em um círculo sobre a foto.

### Para incluir uma estampa nova

1. Salve a foto em `src/assets/img/produtos/<slug>/<codigo>.jpg` (800 px de largura, ≤ 350 KB).
2. Acrescente a variante na lista da linha correspondente.
3. Rode `npm test`. Se a imagem não existir ou o nome estiver errado, o build avisa.

### Para incluir uma linha de produto nova

1. Copie um bloco de categoria em `produtos.json` e ajuste todos os campos (slug novo e único).
2. Crie `src/content/produtos/<slug>.md` com o texto longo (use os existentes como modelo: "O que é", "Características", "Onde usar", "Para o lojista", "Cuidados", "Como comprar").
3. Adicione as imagens em `src/assets/img/produtos/<slug>/` e a imagem de destaque em `src/assets/img/categorias/`.
4. Rode `npm test`. A nova página entra automaticamente no menu, no rodapé, na listagem de produtos e no sitemap.

## 3. Texto longo dos produtos – `src/content/produtos/<slug>.md`

Markdown simples. Use `##` para seções (viram o índice "Nesta página"), listas com `-` ou `1.`, negrito com `**`, tabelas no formato `| a | b |` e links `[texto](/url/)`. Links internos sempre com caminho absoluto começando em `/` e terminando em `/`.

## 4. Guias – `src/content/guias/<slug>.md`

O nome do arquivo vira a URL (`/guias/<slug>/`). O cabeçalho é obrigatório:

```markdown
---
title: Como escolher passadeira de PVC: largura, estampa e uso    # máx. 65 caracteres
description: Guia prático para …                                   # 50 a 165 caracteres
date: 2026-10-20                                                   # AAAA-MM-DD (ordena a listagem)
image: categorias/passadeiras-de-pvc-expositor.jpg                # imagem de destaque
imageAlt: Expositor com rolos de passadeira de PVC estampada
category: passadeiras-de-pvc                                       # slug do produto relacionado (opcional)
---

Texto do guia em Markdown, com seções em `##`.
```

Se um guia for atualizado depois de publicado, acrescente `updated: AAAA-MM-DD` ao cabeçalho (vai para o sitemap e para o JSON-LD).

## 5. FAQ da página inicial – `src/data/faq.json`

Lista de `{ "q": "pergunta", "a": "resposta" }`. As respostas devem ser completas em um parágrafo (são usadas no JSON-LD `FAQPage`).

## 6. Redirecionamentos – `src/data/redirects.json`

Mapeia URLs antigas para novas (`"/sobre-nos/": "/sobre/"`). Quando uma página mudar de endereço, adicione a entrada aqui para não perder visitantes e posicionamento. O destino precisa existir.

## 7. Imagens

- Pasta: `src/assets/img/` (subpastas `produtos/<slug>/`, `categorias/`, `brand/`).
- Formato: JPEG para fotos (qualidade 80–85), PNG apenas para o logo.
- Tamanho: 800 px de largura para amostras; 1200 px para destaques; ≤ 350 KB.
- Nome: minúsculas, sem acentos ou espaços, com o código (`85003-b7.jpg`, `85003-b7-verso.jpg`).
- O build lê as dimensões automaticamente e preenche `width`/`height` nas tags `<img>`.

As imagens atuais foram recortadas das páginas do Catálogo 2026. Para fotos novas de melhor qualidade, substitua o arquivo mantendo o mesmo nome.

## 8. Regras da validação (`npm run check`)

| Verificação | Limite |
|-------------|--------|
| `<title>` | único, 10–65 caracteres |
| Meta description | 50–165 caracteres |
| `<h1>` | exatamente um por página |
| Imagens | todas com `alt`, `width` e `height`; arquivo existente; aviso acima de 350 KB |
| Links internos | caminho absoluto (`/produtos/...`) e destino existente |
| Canonical, Open Graph, viewport, charset, `lang="pt-BR"` | obrigatórios |
| Sitemap | todas as páginas indexáveis presentes |
| JSON-LD | JSON válido |

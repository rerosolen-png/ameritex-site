# Guia de contribuição

Este documento descreve como trabalhamos no repositório do site Ameritex. O objetivo é que qualquer alteração — de um telefone no rodapé a uma nova linha de produto — seja rastreável, revisada e publicada sem quebrar o site.

## Branches

| Branch | Uso |
|--------|-----|
| `main` | Produção. Protegida: só recebe merge por pull request com o CI verde. Cada push em `main` publica o site. |
| `feat/<descrição>` | Nova funcionalidade ou seção (ex.: `feat/pagina-grama-artificial`) |
| `fix/<descrição>` | Correção de bug (ex.: `fix/menu-mobile-fechar`) |
| `content/<descrição>` | Alterações de conteúdo (ex.: `content/estampas-85001-2027`) |
| `docs/<descrição>` | Documentação |
| `ci/<descrição>` | Workflows, Dependabot, infraestrutura |

Nunca faça commit direto em `main`. Crie a branch a partir de `main` atualizada:

```bash
git switch main && git pull
git switch -c content/telefone-rodape
```

## Commits (Conventional Commits)

Formato: `tipo(escopo opcional): descrição no imperativo`, em português, sem ponto final.

| Tipo | Quando usar |
|------|-------------|
| `feat` | Nova funcionalidade, página ou seção |
| `fix` | Correção de comportamento ou visual |
| `content` | Textos, produtos, imagens, dados de contato |
| `seo` | Meta tags, dados estruturados, sitemap, redirecionamentos |
| `style` | Apenas CSS/visual, sem mudar comportamento |
| `refactor` | Reorganização de código sem mudar comportamento |
| `perf` | Performance (imagens, carregamento) |
| `docs` | Documentação |
| `ci` | Workflows e automações |
| `chore` | Manutenção (configs, limpeza) |

Exemplos:

```
content(produtos): incluir estampas 85001 C22 a C24
fix(nav): fechar menu mobile ao navegar por âncora
seo(contato): adicionar LocalBusiness com os dois endereços
```

Um commit por assunto. Mensagens explicam **o quê** e, quando não é óbvio, **por quê** no corpo.

## Pull requests

1. Rode `npm test` localmente; só abra o PR com build e validação passando.
2. Preencha o template (tipo de mudança, checklist, capturas de tela quando for visual).
3. O CI roda build + validação e publica um artefato `site-dist` para conferência.
4. Pelo menos uma revisão aprovada (CODEOWNERS). Para mudanças só de conteúdo, a revisão pode ser do responsável comercial.
5. Merge por **squash** para manter o histórico de `main` limpo (um commit por PR, com a mensagem no formato acima).
6. Após o merge, o deploy é automático. Confira o site em produção.

## Versionamento

Usamos [SemVer](https://semver.org/lang/pt-BR/) para marcar lançamentos relevantes:

- **MAJOR** (2.0.0): redesign ou mudança de estrutura de URLs.
- **MINOR** (1.1.0): nova página, nova linha de produto, nova funcionalidade.
- **PATCH** (1.0.1): correções e ajustes de conteúdo.

A cada lançamento: atualize `version` em `package.json`, registre em `CHANGELOG.md` (formato [Keep a Changelog](https://keepachangelog.com/pt-BR/)) e crie a tag:

```bash
git tag -a v1.1.0 -m "Nova linha: grama artificial"
git push origin v1.1.0
```

Alterações rotineiras de conteúdo não precisam de nova versão; acumule-as e lance um PATCH quando fizer sentido.

## Padrões de código

- `.editorconfig` define indentação (2 espaços), UTF-8 e LF. Configure seu editor para respeitá-lo.
- JavaScript em ES Modules (`.mjs`), sem dependências externas. Se uma dependência se tornar realmente necessária, discuta em issue antes.
- Templates usam o helper `html` (escapa tudo por padrão). Use `raw()` apenas para HTML gerado pelo próprio build (Markdown convertido).
- CSS: tokens em `:root`, mobile first, sem `!important` (exceto `[hidden]`).
- Textos em português do Brasil, com acentuação correta. Códigos de produto sempre no formato do catálogo (`85001 C4`, `TMP20`).

## Imagens

- Formato JPEG (fotos) ou PNG (logo/transparência). Tamanho máximo: 350 KB (a validação avisa acima disso).
- Largura: 800 px para amostras de estampa, 1200 px para fotos de destaque.
- Nome em minúsculas, sem acentos, com o código do produto: `85002-b11.jpg`.
- Sempre com `alt` descritivo (o build exige `alt` em todas as imagens).

## Reportando problemas

Use os templates de issue: **Relatar um problema** para bugs e **Atualizar conteúdo** para produtos, textos e contatos. Inclua a URL da página e, quando possível, uma captura de tela.

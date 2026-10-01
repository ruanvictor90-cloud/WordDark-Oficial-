# WordDark — Modelo oficial de branches

## As três linhas oficiais

| Branch | Visual | Função |
|---|---|---|
| `main` | 🌍 produção | Linha do mundo online/produção |
| `develop` | 🛠️ criação | Linha livre de desenvolvimento |
| `staging` | 🧪 integração/testes | Linha de integração e validação |

## Fluxo oficial

`develop → staging → main`

### main → 🌍 produção
Linha de referência do mundo. Recebe somente mudanças validadas.

### develop → 🛠️ criação
Oficina de criação. Novas cidades, módulos, interfaces e experimentos entram primeiro aqui.

### staging → 🧪 integração/testes
Área de união, integração e testes antes da promoção para produção.

## Regra estrutural

> Um galho pode depender do tronco, mas não deve quebrar o tronco para crescer.

As três branches acima são os únicos caminhos ativos do fluxo oficial. Branches `dev/*` antigas foram consolidadas e passaram a ser apenas históricas.

## Observação

Os nomes técnicos continuam exatamente `main`, `develop` e `staging`. Os textos com emojis são apenas identificação visual/documental e não alteram URLs, código ou roteamento.

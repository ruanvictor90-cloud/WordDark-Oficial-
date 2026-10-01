# Transplante da base existente

Commit do transplante: c7b9a004e987b7b3a84b10c82d9e1e91b84c0ae7

Este diretório registra como a base anterior entrou no WordDark Oficial.

## Fontes
- WordDark/main: Core, contratos, segurança, biblioteca, Céu/Dark Factory, Terra/SucoCast e testes.
- WordDark/develop: módulos exclusivos da Cidade de Compras e outros arquivos que não existiam no main.
- financas-fn01/main: aplicação financeira existente.

## Regra do transplante
O código anterior foi preservado dentro de worddark/runtime/ para manter seus relacionamentos internos intactos durante a primeira integração. Ele agora faz parte do repositório oficial; não é uma cópia descartável.

## Mapa macro
- worddark/runtime/world/core -> núcleo operacional existente.
- worddark/runtime/world/contracts -> contratos do núcleo.
- worddark/runtime/world/sky -> base anterior do Céu, incluindo Dark Factory.
- worddark/runtime/world/earth -> base anterior da Terra, incluindo País Suco/SucoCast.
- worddark/runtime/world/cidade-compras -> Cidade de Compras.
- worddark/runtime/world/library -> biblioteca/memória existente.
- worddark/runtime/world/security -> segurança existente.
- worddark/financeiro-central/runtime -> código do Financeiro FN-01.

A reorganização física definitiva será feita depois da reconciliação entre a arquitetura antiga e o esqueleto novo. Nenhum código é descartado.

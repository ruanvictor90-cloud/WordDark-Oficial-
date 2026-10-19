# 05 — Limite entre legado e ECOSSISTEMA

**Status:** regra obrigatória da nova linha.

## Referências de Git

- Linha limpa de arquitetura: `ecossistema`.
- Snapshot preservado do estado anterior: `legado-arquivado-2026-10-19`.
- Branch principal: `main`, destinada a acompanhar a linha limpa por avanço controlado. O estado antigo está preservado separadamente na branch de arquivo.

## O que significa arquivar

O legado fica preservado para consulta e recuperação, mas deixa de ser fonte automática de código, interface, nomes, componentes ou decisões. Arquivar não significa apagar o histórico nem declarar que todo código antigo é seguro ou reutilizável.

## Barreiras contra retorno acidental

1. Não fazer merge do legado na linha `ecossistema`.
2. Não copiar arquivos antigos sem revisão e decisão explícita.
3. Não tratar nomes antigos, caminhos antigos ou interfaces antigas como padrões oficiais.
4. Não importar dependências antigas sem avaliação de necessidade, licença, segurança e testes.
5. Toda proposta de reaproveitamento deve registrar origem, motivo, mudanças necessárias e aprovação.
6. A documentação desta linha é a referência para novos trabalhos; decisões novas devem atualizar estes documentos.

## Situação no início da linha

A branch `ecossistema` deve conter somente documentação arquitetural. Não deve incluir aplicações antigas, interfaces antigas, motores antigos ou fluxos de publicação preexistentes.

A branch `main` deve acompanhar o estado documental/código aprovado de `ecossistema`; a branch de arquivo permanece separada. Nenhuma das branches, por si só, comprova que algo foi publicado ou está pronto para produção.

## Regra de segurança

Não excluir nem sobrescrever o legado para conseguir uma aparência de limpeza. A separação é feita por referência de versão e linha de desenvolvimento. Qualquer alteração futura de branches de referência, publicação ou exclusão deve ser avaliada como operação independente.

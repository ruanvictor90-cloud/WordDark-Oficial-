# Cidade de Compras — Contrato de Transplante V1

A Cidade de Compras permanece em uma linha própria de atualização até validação.

## Unidade mínima

A unidade de integração é o setor, não a cidade inteira.

## Fluxo

ATUALIZAÇÃO
→ TESTE DO SETOR
→ TESTE DE INTEGRAÇÃO
→ REVISÃO
→ AUTORIZAÇÃO
→ TRANSPLANTE DO SETOR
→ CÓDIGO CENTRAL

## Regras

1. Não alterar main diretamente.
2. Não apagar histórico da linha de desenvolvimento.
3. Não transplantar setor com teste quebrado.
4. Não transplantar dependência sem identificar sua interface.
5. Registrar versão e origem de cada setor transplantado.
6. A integração final deve preservar contratos já operacionais.
7. Dark Factory continua serviço externo à Cidade de Compras.
8. Marketing continua ponte entre necessidade comercial, fábrica e canais.

## Estado V1

A Cidade de Compras possui contratos setoriais, fluxo de conteúdo e um runtime comercial inicial. A próxima validação é a matriz de cenários e fronteiras de permissão.

# ✍️ 02 · Roteiro

Setor responsável por transformar o pacote de inteligência em uma estrutura de conteúdo executável.

## Fluxo
INTELIGÊNCIA → ESTRUTURA → HOOKS → ROTEIRO → PACOTE DE ROTEIRO

## Contrato
Entrada:
- operationId
- intelligence
- brand
- audience
- format
- constraints
- toolPolicy

Saída normalizada:
- status
- operationId
- hook
- titleOptions
- structure
- script
- metadata
- learning

## Política
O setor não publica conteúdo. Ele entrega um pacote para os próximos setores da Fábrica.

A versão inicial usa um adapter local em modo SIMULATION. Ferramentas externas ou um motor próprio podem ser conectados depois sem alterar o contrato do setor.

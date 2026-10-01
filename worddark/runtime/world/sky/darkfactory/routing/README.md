# Routing

A camada de Routing representa a **Rodovia** da Dark Factory.

Ela será responsável por organizar o caminho das solicitações entre origem, destino e executor.

## Fluxo planejado

ORIGEM
↓
RODOVIA
↓
DARK FACTORY
↓
EXECUTOR
↓
RODOVIA
↓
DESTINO

## Responsabilidades futuras

- identificar origem e destino
- validar rota permitida
- encaminhar solicitações
- preservar o requestId
- preservar o messageId
- registrar passagem
- devolver a resposta para a origem

## Regra

A Rodovia transporta a solicitação. Ela não decide sozinha se a solicitação pode ser executada.


## Implementação inicial

O arquivo `router.js` transforma a Rodovia em um componente executável.

Nesta primeira versão, a Rodovia consegue:

- registrar rotas;
- validar rotas antes do registro;
- localizar uma rota ativa por origem, destino e serviço;
- rejeitar mensagens sem rota;
- preservar `messageId` e `requestId`;
- encaminhar um envelope sem executar a tarefa.

A Rodovia continua separada da autorização e da execução.

## Próxima evolução

A integração com Security e Dark Factory será feita depois que o contrato de passagem estiver validado isoladamente.

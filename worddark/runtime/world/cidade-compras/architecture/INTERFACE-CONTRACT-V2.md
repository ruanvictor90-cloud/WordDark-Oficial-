# Cidade de Compras — Interface Contract V2

## Objetivo
A interface é uma camada de operação. Ela não substitui os contratos do núcleo.

## Mapa
HOME
├── PORTÃO
├── PAINEL
├── CANAIS
├── ATENDIMENTO
├── COMÉRCIO
├── CONTAS
├── FORNECEDORES
├── LOGÍSTICA
├── PÓS-VENDA
├── OCORRÊNCIAS
├── BIBLIOTECA
└── SERVIÇOS DO CÉU

## Regra de navegação
Uma tela só expõe ações permitidas ao ator e ao contexto.

## Portão
Recebe:
- identidade
- papel
- origem
- destino
- contexto

Entrega:
- autorizado
- negado
- rota

## Painel
Mostra estado; não executa regras de negócio por conta própria.

## Operação
Cada ação relevante deve conseguir apontar para:
operationId
resourceId
actorId
status
history

## Serviço externo
A interface apresenta o pedido e o resultado. Não incorpora a implementação do serviço.

## Futuro
A mesma estrutura deve poder receber adaptadores de:
- site
- rede social
- mensageria
- marketplace
- novos canais
sem alterar o núcleo comercial.

# Storage

A camada de Storage será responsável pelo armazenamento persistente necessário à Dark Factory.

## Objetivo

Separar memória operacional de armazenamento persistente.

## Dados que poderão ser armazenados

- solicitações
- mensagens
- resultados
- logs
- identidades
- registros de unidades
- configurações
- versões
- histórico de execução

## Regra

O núcleo da fábrica não deve depender de um armazenamento específico.

A implementação poderá começar simples e posteriormente migrar para infraestrutura própria sem reconstruir o núcleo.

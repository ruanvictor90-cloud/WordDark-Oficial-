# Testes das Bibliotecas

## Biblioteca Local

Deve permitir criar, atualizar/substituir, consultar, listar e remover registros locais.

Ela representa memória operacional viva.

## Biblioteca Central

Deve permitir receber, preservar, consultar e listar registros históricos.

Não possui operação de substituição ou remoção.

## Registry

O Registry conecta a operação ao histórico:

```
OPERAÇÃO
   ↓
REGISTRY
   ├── snapshot → Biblioteca Local
   └── evento → Biblioteca Central
```

O Registry não autoriza, roteia ou executa.

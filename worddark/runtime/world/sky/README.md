# Céu

O **Céu é a área do WordDark que concentra empresas especializadas, fábricas e infraestrutura compartilhada**.

Ele não é uma empresa.

É uma área do mundo que fornece capacidades para as empresas da Terra e para outras unidades do próprio WordDark.

## Empresas e serviços

### Dark Factory — Empresa de Produção de Conteúdo

A Dark Factory é uma empresa especializada em:

- criação de conteúdo;
- edição;
- montagem;
- transformação;
- renderização;
- validação;
- preparação de ativos;
- operações modulares de produção.

Ela recebe operações através das interfaces do WordDark.

### Central de Conexões Externas

É uma infraestrutura centralizada para comunicação com plataformas e serviços externos.

Responsável por:

- OAuth;
- credenciais;
- tokens;
- adapters;
- providers;
- estado das conexões;
- capacidades;
- auditoria;
- comunicação externa.

Ela não deve ser incorporada à lógica de negócio das empresas.

## Relação entre empresas

```
EMPRESA DE GESTÃO DE NEGÓCIOS
            ↕
EMPRESA DE OPERAÇÃO DIGITAL
            ↕
        WORDDARK
            ↕
     DARK FACTORY
            ↕
CENTRAL DE CONEXÕES EXTERNAS
            ↕
      MUNDO EXTERNO
```

As conexões entre essas unidades passam por contratos, permissões e Rodovias.

## Princípio

O Céu fornece capacidades especializadas.

A empresa que precisa de uma capacidade não precisa conhecer sua implementação interna. Ela solicita o serviço ao WordDark, que encaminha a operação para a unidade capaz.

## Estrutura-base

```
CÉU
├── Empresas especializadas
│   └── Dark Factory
├── Conexões externas
├── Routing / Rodovia
├── Registry
├── Security
├── Library
└── Contracts
```

Novas empresas especializadas podem ser adicionadas ao Céu sem alterar a estrutura das empresas já existentes.

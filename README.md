# WordDark Oficial

Este repositório é a base oficial de desenvolvimento do WordDark.

## Estrutura-mãe

```
WORDDARK OFICIAL
│
└── MAIN
    │
    ├── WORDDARK
    │   └── CENTRAL DO MUNDO
    │
    ├── CÉU
    │
    └── TERRA
```

**MAIN** organiza o mundo; não é o próprio WordDark.

**WORDDARK** é a área central de administração, coordenação, segurança, memória e controle.

**CÉU** é a camada superior/global. Suas subdivisões serão definidas depois.

**TERRA** é a camada territorial/operacional, onde poderão existir cidades, ilhas e setores.

## Fundação arquitetural

- Modularidade: módulos podem crescer, ser movidos ou substituídos sem destruir o núcleo.
- Autonomia local: cada área administra sua operação dentro das regras.
- Coordenação central: o Core Central acompanha e coordena o funcionamento global.
- Autorização: ações relevantes podem exigir aprovação superior.
- Portões: entradas, saídas, pedidos e movimentações possuem controle e rastreabilidade.
- Segurança: violações, erros e riscos possuem tratamento próprio.
- Memória: decisões, testes, incidentes e aprendizados importantes são preservados.
- Comunicação: áreas usam rotas definidas para solicitar, responder e encaminhar.
- Desenvolvimento separado da operação: mudanças passam por teste e validação antes do mundo ativo.
- Interface por responsabilidade: cada usuário/módulo recebe apenas o necessário para sua função.
- Preservação histórica: o antigo WordDark é fonte de conceitos, regras e módulos consolidados para futuros transplantes.

## Primeira divisão de responsabilidades

```
CORE CENTRAL  → coordena
GOVERNANÇA    → regras e autorizações
SEGURANÇA     → proteção e incidentes
MEMÓRIA       → registro e preservação
REDE          → comunicação e rotas
PORTÕES       → entradas, saídas e controle
AUDITORIA     → rastreabilidade
PERMISSÕES    → acesso e autorização
DESENVOLVIMENTO → mudanças e evolução
EXECUTORES    → realizam tarefas autorizadas
ÁREAS LOCAIS  → operam com autonomia
```

Esta é a fundação inicial. Os READMEs serão reescritos de forma definitiva quando a arquitetura estiver consolidada.

# WordDark — Mapa Oficial Consolidado

## Regra central

O WordDark é uma infraestrutura modular. A estrutura territorial nasce conforme conexões, grupos e operações reais existirem.

```
WORDDARK
├── CÉU  → infraestrutura, serviços e execução
└── TERRA → grupos, operações, ambientes e setores
```

**A Terra gera necessidades. O Céu fornece os meios para atendê-las.**

## Terra

A estrutura territorial é dinâmica:

```
PAÍS    → GRUPO / ORGANIZAÇÃO
ESTADO  → OPERAÇÃO
CIDADE  → AMBIENTE / PERFIL / REDE
BAIRRO  → SETOR EXECUTOR
```

Nenhuma camada é criada artificialmente. Antes de criar uma nova camada, o classificador verifica se a necessidade cabe em uma estrutura existente.

### Exemplo

Uma conta isolada:

```
CONTA
└── contexto mínimo
    └── ambiente/perfil
```

Várias contas de uma mesma pessoa ou grupo:

```
PAÍS: Grupo
└── ESTADO: Operação
    ├── CIDADE: Instagram
    └── CIDADE: YouTube
```

## Céu

```
DOMÍNIO → REGIÃO → NÚCLEO → DISTRITO
```

O Céu contém serviços compartilhados, como:

- Runtime
- Registry
- Rodovia
- Segurança
- Biblioteca
- Dark Factory
- Marketing
- infraestrutura de conexões externas

## Central de Conexões Externas

Todas as integrações com serviços externos passam por um único ponto:

```
SETOR
  ↓
CENTRAL DE CONEXÕES EXTERNAS
  ├── identidade/autorização
  ├── provider
  ├── connector/adapter
  ├── capacidades
  ├── estado
  ├── saúde
  ├── auditoria
  └── recuperação
  ↓
SERVIÇO EXTERNO
```

O setor não precisa conhecer a implementação do provedor.

## Fluxo operacional

```
TERRA
 ↓
PORTÃO
 ↓
IDENTIFICAÇÃO
 ↓
PERMISSÃO
 ↓
RODOVIA
 ↓
CÉU / SERVIÇO
 ↓
VALIDAÇÃO
 ↓
RESULTADO
 ↓
RODOVIA
 ↓
TERRA
```

## Automação

Toda automação futura deve passar por:

```
REQUISITO
→ FILA
→ APROVAÇÃO
→ EXECUÇÃO
→ RESULTADO
→ REGISTRO
```

A automação permanece controlada e possui parada por operação e parada global.

## Estado do mundo

Os nomes históricos **País Suco, SucoCast, Cidade de Compras** e outros permanecem como templates/legado funcional quando aplicável. Eles não devem aparecer como estrutura universal do WordDark.

A conexão real ou criação explícita determina quando essas estruturas passam a existir no mundo operacional.

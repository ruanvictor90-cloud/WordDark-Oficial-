# Arquitetura do Céu

O Céu é a camada de suporte, execução e infraestrutura do WordDark.

A Terra gera necessidades. O Céu recebe essas necessidades por meios controlados e fornece serviços, recursos ou execução.

## Estrutura-base

CÉU
│
├── DARK FACTORY
│
├── ROUTING
│
├── REGISTRY
│
├── SECURITY
│
├── STORAGE
│
└── CONTRACTS

## Responsabilidade de cada camada

### Dark Factory

Executa tarefas autorizadas e devolve resultados rastreáveis.

### Routing / Rodovia

Transporta solicitações e respostas entre unidades.

### Registry

Mantém o catálogo das unidades, serviços, executores e capacidades conhecidas.

### Security

Controla identidade, autenticação, autorização, escopo, auditoria e bloqueio.

### Storage

Fornece persistência para dados operacionais e históricos.

### Contracts

Define os formatos e regras de comunicação entre as partes.

## Relação com a Terra

O Céu não deve assumir a identidade de quem solicita um serviço.

Fluxo conceitual:

TERRA
  ↓
IDENTIDADE
  ↓
RODOVIA
  ↓
SEGURANÇA
  ↓
DARK FACTORY
  ↓
EXECUTOR
  ↓
VALIDAÇÃO
  ↓
REGISTRO
  ↓
RODOVIA
  ↓
TERRA

## Regra de separação

Cada camada possui uma responsabilidade própria.

Routing não autoriza.

Registry não autoriza.

Executor não define sua própria permissão.

Storage não decide o que deve ser executado.

Contracts não executam tarefas.

Security não executa tarefas.

A Dark Factory coordena a execução utilizando essas camadas.

## Preparação para escala

Uma nova unidade da Terra deve poder entrar no sistema por identidade, registro, contrato, rota e permissão, sem exigir alteração estrutural no núcleo da fábrica.

## Estado atual

A maior parte desta arquitetura ainda é documental.

O DF-0.3 possui um núcleo funcional de execução e gerenciamento de executores.

As demais camadas serão transformadas em componentes operacionais gradualmente, depois que seus contratos estiverem definidos.

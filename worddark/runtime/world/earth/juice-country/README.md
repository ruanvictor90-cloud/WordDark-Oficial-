# Empresa de Operação Digital — estrutura terrestre

O **Juice Country** é a primeira instância de laboratório da **Empresa de Operação Digital** do WordDark. O nome "Juice Country" é apenas uma identidade interna de teste; a arquitetura abaixo é genérica e será reutilizada para clientes reais.

## Função da empresa

A Empresa de Operação Digital é a camada da **Terra** responsável por receber um cliente, organizar sua presença digital e administrar o ciclo operacional das contas e conteúdos.

Ela coordena:

- entrada e cadastro de clientes;
- organização de Países, Estados, Cidades e Bairros;
- criação e administração de contas digitais;
- planejamento de conteúdo;
- abertura e acompanhamento de operações;
- solicitação de produção à Dark Factory;
- revisão e retorno de conteúdo;
- solicitação de publicação;
- acompanhamento de contas e resultados.

A empresa **não guarda credenciais externas nem implementa OAuth diretamente**. A comunicação com plataformas externas permanece na **Central de Conexões Externas**, no Céu.

## Hierarquia operacional

```
EMPRESA DE OPERAÇÃO DIGITAL
│
├── País
│   ├── Estado
│   │   ├── Cidade / Canal / Plataforma
│   │   │   └── Bairro / Setor executor
│   │   └── Operações
│   └── Contas e recursos
│
├── Clientes
├── Gestor de Contas
├── Gestor de Conteúdo
├── Central de Operações
└── Relatórios / histórico
```

### Significado das camadas

**País** — unidade organizacional que agrupa uma operação, marca, cliente ou conjunto de operações relacionadas.

**Estado** — operação especializada dentro do País.

**Cidade** — presença digital concreta, como um canal, perfil ou ambiente de uma plataforma.

**Bairro** — setor executor responsável por uma função específica.

Assim, os nomes territoriais continuam sendo a linguagem interna do WordDark, mas agora possuem uma função empresarial concreta.

## Fluxo de um cliente

```
Cliente
  ↓
Empresa de Operação Digital
  ↓
País
  ↓
Estado / Operação
  ↓
Cidade / Conta digital
  ↓
Necessidade
  ↓
Central de Operações
  ↓
Rodovia
  ↓
Dark Factory
  ↓
Resultado
  ↓
Empresa de Operação Digital
  ↓
Central de Conexões Externas
  ↓
Publicação
```

## Responsabilidades separadas

| Estrutura | Responsabilidade |
|---|---|
| Empresa de Operação Digital | administrar cliente e operação |
| País / Estados / Cidades / Bairros | organizar a operação |
| Central de Operações | acompanhar e controlar operações |
| Rodovia | transportar solicitações |
| Dark Factory | produzir e transformar conteúdo |
| Central de Conexões Externas | conectar plataformas e executar comunicação externa |
| WordDark | governança, segurança, memória e infraestrutura |

## Instância de laboratório atual

**Juice Country — JC-001**

Estados planejados:

- **SucoCast** — piloto operacional;
- **SucoGeek** — reservado;
- **SucoComed** — reservado;
- **SucoFactor** — reservado.

Esses nomes não definem a arquitetura. São somente identidades de teste para validar o modelo antes da entrada de clientes reais.

## Estado

A estrutura empresarial agora possui um núcleo de código próprio em:

`core/digital-operations-company.js`

Esse núcleo mantém o cadastro de Países, clientes, contas e operações sem misturar responsabilidades com a Dark Factory ou com as conexões externas.

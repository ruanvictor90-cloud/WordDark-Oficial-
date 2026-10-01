# WordDark — Arquitetura Oficial do Mundo

> Documento-base do Marco Zero. Define o mapa público e as responsabilidades das grandes camadas antes da expansão do código.

## 1. Visão do mundo

O WordDark é um mundo digital modular.

~~~
WORDDARK
├── CÉU  → fornece suporte, infraestrutura e execução
└── TERRA → cria, opera e expande necessidades
~~~

A separação existe para evitar que uma área assuma a função da outra.

### Céu

O Céu resolve necessidades. Pode fornecer infraestrutura, serviços, sistemas, segurança, armazenamento, roteamento, execução, fábricas e tecnologias.

### Terra

A Terra gera e administra necessidades. Pode conter países, estados, setores, empresas, marcas, lojas, produtos, serviços, projetos e operações.

**Regra central:** A Terra gera necessidades. O Céu fornece os meios para atendê-las.

## 2. Mapa territorial da Terra

~~~
TERRA
└── PAÍS
    └── ESTADO
        └── SETOR
            └── OPERAÇÃO
~~~

Cada unidade pode possuir identidade, memória, armazenamento, segurança e regras próprias.

### Exemplo

~~~
Juice Country
└── SucoCast
    ├── Conteúdo
    ├── Produção
    ├── Distribuição
    └── Inteligência
~~~

## 3. Mapa de suporte do Céu

~~~
CÉU
├── DARK FACTORY
├── ROUTING / RODOVIA
├── REGISTRY
├── SECURITY
├── STORAGE
└── CONTRACTS
~~~

### Dark Factory
Produz, edita, processa e valida trabalhos autorizados. Não cria a necessidade da Terra, não administra uma marca e não escolhe onde um conteúdo será publicado.

### Rodovia
Transporta pedidos e respostas entre unidades.

### Registry
Conhece unidades, serviços, capacidades e executores registrados.

### Security
Cuida de identidade, autenticação, autorização, escopo e auditoria.

### Storage
Mantém dados operacionais e históricos conforme as regras do mundo.

### Contracts
Define como as unidades conversam e quais formatos devem respeitar.

## 4. Fluxo oficial

~~~
TERRA
  │ necessidade
  ▼
RODOVIA
  ▼
CÉU
  ├── identificação
  ├── autorização
  ├── execução
  ├── validação
  └── registro
  ▼
RODOVIA
  ▼
TERRA
  └── resultado
~~~

### Exemplo de conteúdo

~~~
SucoCast → requerimento → Rodovia → Dark Factory
Dark Factory → produção/edição/validação → Rodovia → SucoCast
SucoCast → escolhe destino → distribuição/publicação
~~~

**Regra:** a Fábrica produz; o País/Estado decide o destino e a distribuição.

## 5. Identidade e rastreabilidade

Toda comunicação importante deve permitir responder: quem, o quê, de onde, para onde, com qual autorização, o que foi executado e qual foi o resultado.

## 6. Princípios do Marco Zero

1. Modularidade.
2. Responsabilidade separada.
3. Identidade antes de execução.
4. Autorização antes de ação.
5. Registro das operações importantes.
6. Comunicação por contratos e rotas.
7. Nada de função escondida em outra camada.
8. Crescimento sem reconstrução do núcleo.
9. Testes antes de colocar mudanças no mundo operacional.
10. O mapa do mundo vem antes da expansão do código.

## 7. Ordem de construção

~~~
MARCO ZERO → NÚCLEO → MVP FUNCIONAL → TESTES → SEGURANÇA → AUTOMAÇÃO → ESCALA
~~~
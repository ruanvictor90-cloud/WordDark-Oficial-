# Arquitetura de Interfaces

Esta é a regra definitiva de apresentação do WordDark.

## Princípio

A interface nunca tenta mostrar o mundo inteiro.

A infraestrutura visual é criada para receber conexões. Conta, grupo, operação e setor são contextos dinâmicos, não nomes pré-cadastrados.

Fluxo base:
LOGIN → WORDDARK → GESTOR → CONTA → OPERAÇÃO → AMBIENTE → SETOR → ÁREA → AÇÃO

Nem todos os níveis precisam existir em toda conta. A interface só mostra o nível que realmente existe.

## Regra de conta conectada

Uma única conta não deve receber um País artificial. Ao conectar novas contas ou criar explicitamente um grupo, a estrutura territorial pode nascer conforme a necessidade.

Suco, SucoCast, Instagram, YouTube e outros nomes conectados entram como contexto depois da conexão; não são a estrutura fixa da interface inicial.

## Princípio anterior

A interface nunca tenta mostrar o mundo inteiro.

Cada tela representa apenas o nível atual de acesso e a responsabilidade daquele nível.

Fluxo:

LOGIN
→ MUNDO
→ CAMADA
→ SETOR
→ ÁREA
→ AÇÃO

Cada avanço substitui o contexto anterior pelo novo contexto.

## Entrada

Após o login, o usuário vê somente as áreas às quais sua conta possui acesso.

Exemplo:

WORDDARK
- Céu
- Terra

Ao selecionar Céu, a tela passa a mostrar somente os setores existentes no Céu.

Ao selecionar Terra, a tela passa a mostrar somente os setores existentes na Terra.

## Entrada de setor

Ao selecionar um setor, o Portão daquele setor abre a interface de entrada.

O Portão mostra somente:
- identidade;
- status essencial;
- áreas disponíveis;
- ações de navegação necessárias.

## Interface do setor

Exemplo: Dark Factory.

Ao entrar na Dark Factory, mostrar somente as responsabilidades da fábrica:

- Criar pedido
- Analisar pedidos
- Pesquisa de mercado
- Outras funções que pertençam à Dark Factory

Não mostrar simultaneamente:
- funções de outros setores;
- administração global;
- memória global;
- segurança global;
- ferramentas que não pertençam àquela área.

## Regra de profundidade

Se uma função possuir várias operações, ela abre sua própria página.

Exemplo:

Dark Factory
→ Pesquisa de mercado
→ Nova pesquisa
→ Resultado

A tela da Dark Factory não precisa mostrar o conteúdo da pesquisa antes que ela seja selecionada.

## Regra de crescimento

Quando uma nova área for adicionada a um setor, ela aparece apenas na entrada daquele setor.

Quando uma nova função for adicionada a uma área, ela aparece apenas dentro daquela área.

Assim, o crescimento do mundo não transforma as interfaces existentes em painéis gigantes.

## Regra de responsabilidade

**Uma interface = um contexto.**

**Uma página = uma responsabilidade principal.**

**Uma função complexa = uma página própria.**

O sistema deve revelar informação sob demanda, não despejar informação antecipadamente.

## Regra definitiva

O WordDark Oficial está sendo construído como uma arquitetura definitiva.

Correções de problemas encontrados durante o desenvolvimento devem fortalecer esta estrutura, e não criar atalhos que quebrem a separação de responsabilidades.


## HUD oficial por setor — atualização 2.0

A identidade visual não é tratada como avatar de usuário. Ela é um recurso espacial do mundo.

### Identidade por contexto

Cada entrada de setor pode possuir uma identidade visual própria:
- símbolo/marca do ambiente;
- imagem de entrada;
- imagem de capa/ambientação;
- ícone da função;
- imagem de estado quando fizer sentido.

A mesma identidade pode aparecer em pontos diferentes quando representar o mesmo local, mas não deve ser usada apenas como decoração ou perfil.

### Regra de revelação

A entrada de cada setor mostra apenas:
1. onde estou;
2. qual é a responsabilidade deste setor;
3. quais são as poucas áreas disponíveis;
4. ações essenciais de entrada/saída.

Ao selecionar uma área, a página muda de contexto e passa a mostrar somente aquela área.

Fluxo visual:

```
ENTRADA DO SETOR
    ↓
ÁREA
    ↓
OPERAÇÃO
    ↓
RESULTADO
```

Voltar significa retornar ao contexto anterior; não significa carregar novamente todas as informações do mundo.

### Imagem como parte da arquitetura

Imagens oficiais podem ser vinculadas a:
- País/grupo;
- Estado/operação;
- Cidade/perfil;
- Bairro/setor;
- área específica;
- ferramenta ou operação.

A imagem deve comunicar o local/função em que o usuário entrou. Ela não substitui permissões, identidade técnica ou registros.

### HUD mínimo

O HUD deve privilegiar:
- identificação visual do setor;
- nome e posição no mundo;
- status essencial;
- entrada para as áreas daquele setor;
- navegação contextual;
- retorno ao nível anterior.

Indicadores secundários, logs, diagnósticos, configurações e dados técnicos ficam atrás de suas respectivas áreas.

### Regra anti-painel gigante

Nenhuma página deve antecipar as funções de seus filhos.

Exemplo:

```
SUCOCAST
└── YOUTUBE
    └── VÍDEO
```

A entrada do YouTube não mostra roteiro, áudio, vídeo, publicação e diagnósticos simultaneamente. Ela mostra os setores disponíveis. O conteúdo de cada setor aparece somente depois da entrada.

### Regra para novas interfaces

Quando um novo setor for criado, sua interface deve nascer com:
- Portão visual;
- identidade;
- contexto estrutural;
- responsabilidade;
- áreas filhas;
- navegação de retorno;
- ações mínimas.

A interface só cresce quando o setor cresce.


## GitHub Pages oficial — Portão → Contexto → Setor

O GitHub Pages é a representação visual navegável do mundo oficial. Ele não cria uma segunda arquitetura: apenas expõe a arquitetura operacional existente.

Entrada oficial:

```
PORTÃO WORDDARK
  ↓
IDENTIDADE / ACESSO
  ↓
CAMADA
  ├── TERRA
  ├── CÉU
  └── NÚCLEO
  ↓
SETOR
  ↓
ÁREA
  ↓
AÇÃO
```

A página inicial não lista estruturas de negócio como SucoCast, YouTube ou Dark Factory como se fossem obrigatórias. Elas só aparecem depois que existirem no contexto apropriado.

O HUD deve manter:
- contexto atual e posição no mundo;
- identidade visual do local/setor;
- status essencial;
- ações de entrada e saída;
- navegação para o próximo nível;
- segurança contextual;
- memória contextual.

Não deve antecipar funções dos níveis filhos nem transformar a entrada em um painel administrativo gigante.

A Biblioteca Central pode ser acessada pelo contexto de memória, mas continua sendo memória mundial, não centro de controle da execução.

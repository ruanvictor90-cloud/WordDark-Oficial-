# Arquitetura de Interfaces

Esta é a regra definitiva de apresentação do WordDark.

## Princípio

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

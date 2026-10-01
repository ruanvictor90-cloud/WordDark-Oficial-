# PORTÕES

O Portão é a **entrada oficial de um setor**.

Ele não é um painel administrativo gigante e não deve despejar todas as informações do setor na tela.

## Experiência de entrada

Ao acessar um setor:

1. o Portão identifica o setor;
2. mostra somente as informações mínimas necessárias para orientar a entrada;
3. apresenta as áreas principais disponíveis naquele setor;
4. o usuário escolhe uma área;
5. somente então aquela área é aberta;
6. a página aberta mostra apenas o que pertence à responsabilidade daquela área.

O Portão funciona como uma recepção: identifica, autoriza e direciona. O conteúdo interno pertence às áreas do setor.

## Regra de interface

**Uma página = uma responsabilidade principal.**

Não devemos colocar todas as funções de um setor em uma única tela.

Exemplo:

```
PORTÃO DO SETOR
│
├── identificação do setor
├── status essencial
└── entradas disponíveis
       │
       ├── Área A
       ├── Área B
       └── Área C
              ↓
        abre somente a área escolhida
              ↓
        mostra somente sua responsabilidade
```

## Navegação

A navegação segue:

**Setor → Portão → Área → responsabilidade da área**

Quando uma solicitação precisa sair do setor:

**Área → Portão → Rodovia → destino**

Quando uma resposta retorna:

**destino → Rodovia → Portão → Área de origem**

## Princípio de isolamento

Uma área não precisa apresentar ou conhecer a estrutura interna das outras áreas.

O Portão cria a fronteira do setor e a Rodovia cria a ligação operacional entre setores.

Assim:

- setores permanecem independentes;
- telas permanecem limpas;
- cada página tem uma função clara;
- novas áreas podem ser adicionadas sem reconstruir o setor inteiro;
- permissões podem ser aplicadas na entrada e também dentro de cada área.

## Regra arquitetural

**O Portão mostra o caminho. A área mostra a responsabilidade. A Rodovia faz a ligação.**

Portão é uma responsabilidade arquitetural e também pode possuir uma representação visual de entrada.
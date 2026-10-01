# Modelo Territorial

O modelo territorial define como as unidades da Terra são organizadas antes de qualquer teste operacional com a Dark Factory.

## Hierarquia

TERRA
│
└── PAÍS
    │
    └── ESTADO
        │
        └── SETOR
            │
            └── OPERAÇÃO

## 1. País

O País é uma unidade organizacional ampla dentro da Terra.

Responsabilidades:

- possuir uma identidade própria;
- organizar seus estados;
- manter informações administrativas do próprio território;
- concentrar necessidades que pertencem ao país;
- comunicar-se com o Céu por rotas e contratos definidos.

Um país não deve depender de um estado específico para existir.

## 2. Estado

O Estado é uma unidade independente dentro de um País.

Responsabilidades:

- possuir identidade própria;
- organizar seus setores;
- manter suas operações;
- gerar necessidades;
- solicitar serviços ao Céu quando necessário.

Estados podem possuir funções diferentes sem alterar a estrutura dos demais.

## 3. Setor

O Setor representa uma área funcional de um Estado.

Exemplos:

- conteúdo;
- edição;
- pesquisa;
- administração;
- distribuição;
- análise.

Os exemplos são apenas categorias possíveis. Cada Estado poderá definir seus próprios setores.

## 4. Operação

A Operação é a menor unidade funcional do modelo territorial.

Ela representa uma ação ou processo que pode gerar uma necessidade executável.

Exemplos:

- criar conteúdo;
- processar arquivo;
- analisar dados;
- solicitar publicação;
- registrar resultado.

Uma operação não precisa conhecer o funcionamento interno da Dark Factory. Ela deve utilizar os contratos e a Rodovia definidos para comunicação.

## Identidade

Cada nível deve possuir uma identidade própria e estável.

A identidade deverá permitir distinguir:

- país;
- estado;
- setor;
- operação.

A identidade não significa autorização.

Identidade responde a:

> Quem é esta unidade?

Autorização responde a:

> O que esta unidade pode fazer?

## Relações

A relação entre níveis é hierárquica:

País → Estado → Setor → Operação

A comunicação com o Céu ocorre por solicitação controlada:

Unidade da Terra → Rodovia → Céu → serviço → Rodovia → unidade da Terra

## Regra de isolamento

Uma unidade não deve precisar conhecer a implementação interna de outra unidade para solicitar um serviço.

O contrato define a comunicação.

A Rodovia define o encaminhamento.

A segurança define a autorização.

A Dark Factory executa o serviço quando houver um executor compatível.

## Objetivo do modelo

Este modelo existe para que o Juice Country seja um exemplo real da arquitetura, e não uma exceção criada apenas para os testes.

Antes de implementar operações reais, a hierarquia e as responsabilidades devem permanecer claras e estáveis.

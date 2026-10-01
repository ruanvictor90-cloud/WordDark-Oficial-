# WordDark — Planta V1 do Laboratório

## Regra principal

Uma estrutura só recebe o poder necessário para cumprir sua responsabilidade.

## Objetos

| Objeto | Responsabilidade | ID | Gate | Permissão | Log |
|---|---|---:|---:|---:|---:|
| WordDark | infraestrutura | WD | sim | sim | sim |
| Cliente | consumidor da infraestrutura | WD-CLI-* | sim | sim | sim |
| Canal/Recurso | unidade operacional do cliente | WD-CH-* | sim | sim | sim |
| Projeto | agrupamento opcional | WD-PRJ-* | quando necessário | sim | sim |
| Operação | unidade de trabalho rastreável | WD-OP-* | sim | sim | sim |
| Resultado | saída de uma operação | WD-RES-* | conforme fluxo | sim | sim |
| Usuário | identidade de acesso | WD-USR-* | conforme entrada | sim | sim |
| Serviço | capacidade executável | WD-SVC-* | sim | sim | sim |
| Conector | ponte com plataforma externa | WD-CON-* | sim | sim | sim |

## Contexto

Toda ação deve responder:

- quem;
- cliente;
- projeto;
- recurso;
- origem;
- destino;
- serviço;
- operação;
- ambiente.

## Portão

O portão:

1. identifica;
2. verifica permissão;
3. valida contexto;
4. registra entrada;
5. encaminha.

O portão não executa o trabalho.

## Operação

A operação viaja como pacote rastreável:

```
IDENTIDADE
CONTEXTO
PERMISSÕES
SOLICITAÇÃO
RECURSOS
HISTÓRICO
```

## Fluxo

```
SOLICITAÇÃO
    ↓
PORTÃO
    ↓
ANÁLISE
    ↓
EXECUÇÃO
    ↓
VALIDAÇÃO
    ↓
RESULTADO
    ↓
PORTÃO DE RETORNO
```

Erro:

```
ERRO
 ↓
DIAGNÓSTICO
 ↓
CORREÇÃO
 ↓
NOVO TESTE
```

Se não houver solução:

```
CANCELAMENTO
ou
NOVO REQUERIMENTO
```

## Regra de integração

O laboratório pode criar novos contratos e protótipos, mas não deve assumir que esses contratos já fazem parte do runtime operacional.

A integração só acontece depois de:

```
PROTÓTIPO
 ↓
TESTE
 ↓
VALIDAÇÃO
 ↓
REVISÃO
 ↓
TRANSPLANTE
```

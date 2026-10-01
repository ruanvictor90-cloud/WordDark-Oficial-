# Modelo Visual dos Portões

Este modelo define como um setor aparece quando o usuário entra nele.

## Nível 1 — Portão

Mostrar somente:

- nome/identidade do setor;
- estado essencial;
- permissões ou avisos necessários;
- áreas disponíveis.

Não mostrar dados internos de todas as áreas.

## Nível 2 — Área

Ao selecionar uma área, a interface troca para o contexto daquela responsabilidade.

Mostrar:

- nome da área;
- função/responsabilidade;
- informações necessárias para executar sua função;
- ações permitidas;
- retorno para o Portão.

## Nível 3 — Detalhe

Quando uma ação exigir mais profundidade, abrir somente o detalhe daquela ação.

A informação aparece sob demanda, em vez de ocupar a tela inicial.

## Regra de navegação

```
PORTÃO
  ↓
ÁREA
  ↓
DETALHE
  ↓
AÇÃO
```

Para comunicação externa:

```
ÁREA
  ↓
PORTÃO
  ↓
RODOVIA
  ↓
DESTINO
```

O objetivo é manter cada tela pequena, clara e responsável por uma única função principal.
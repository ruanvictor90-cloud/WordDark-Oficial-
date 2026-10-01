# WordDark — Sistema de Bibliotecas

A arquitetura de bibliotecas do WordDark possui dois níveis:

- **Biblioteca Local** — memória viva de cada unidade.
- **Biblioteca Central** — arquivo histórico permanente do mundo.

## Regra principal

> A biblioteca local pode mudar. A Biblioteca Central preserva.

### Biblioteca Local

Cada cidade, ilha, estado, país, fábrica ou outro módulo pode possuir sua própria biblioteca local.

Ela guarda:
- operação cotidiana;
- conhecimento de trabalho;
- aprendizados;
- procedimentos;
- versões atuais;
- contexto local;
- resultados e referências úteis.

O conteúdo local pode ser atualizado, substituído ou reorganizado.

### Biblioteca Central

A Biblioteca Central pertence à camada aérea do WordDark.

Ela preserva:
- ideias;
- testes;
- erros;
- soluções;
- versões;
- descobertas;
- decisões arquiteturais;
- operações relevantes;
- aprendizados enviados pelas unidades.

Conteúdo registrado nela não deve ser apagado para "limpar" o histórico.

## Fluxo

```
UNIDADE
  ↓
BIBLIOTECA LOCAL
  ↓
REGISTRO / APRENDIZADO
  ↓
BIBLIOTECA CENTRAL
```

A biblioteca **não decide operações**. Ela registra e preserva conhecimento.

## Separação

- Local = memória operacional viva.
- Central = memória histórica permanente.
- Registry = rastreamento de operações e eventos.
- Security = autorização.
- Router/Rodovia = transporte.
- Executor = execução.

Nenhuma biblioteca deve assumir a responsabilidade de outro módulo.


## Promoção de conhecimento

A Biblioteca Local **não envia tudo automaticamente** para a Central.

Um registro local pode ser promovido quando houver motivo para preservação histórica:

```
BIBLIOTECA LOCAL
      │
      │ seleção / validação
      ▼
REGISTRY
      │
      ▼
BIBLIOTECA CENTRAL
```

A promoção é explícita e rastreável.

Exemplos de conhecimento que pode ser promovido:
- solução reutilizável;
- erro importante e sua correção;
- decisão arquitetural;
- descoberta;
- aprendizado validado;
- procedimento que pode beneficiar outras unidades.

A Central não deve virar um espelho bruto das bibliotecas locais.


## Conhecimento arquitetural

Conhecimento histórico não é o mesmo que evento de operação.

O contrato `WordDarkKnowledgeRecord` representa uma descoberta, solução, correção, decisão arquitetural, procedimento ou aprendizado que pode ser validado independentemente do fluxo de uma operação.

Fluxo:

```
IDEIA / TESTE / ERRO
        ↓
BIBLIOTECA LOCAL
        ↓
VALIDAÇÃO
        ↓
KNOWLEDGE CONTRACT
        ↓
REGISTRY / INGESTÃO
        ↓
BIBLIOTECA CENTRAL
```

Somente conhecimento com status `VALIDATED` pode ser arquivado como conhecimento na Central.

Isso mantém a Central como memória histórica confiável, sem transformar qualquer hipótese ou teste inconclusivo em regra do mundo.

### Tipos de conhecimento

- `DISCOVERY`
- `SOLUTION`
- `ERROR_CORRECTION`
- `ARCHITECTURE_DECISION`
- `PROCEDURE`
- `LEARNING`

### Status

- `PROPOSED` — ainda em avaliação.
- `VALIDATED` — validado e elegível para preservação.
- `REJECTED` — não validado.
- `ARCHIVED` — reservado para evolução futura do ciclo histórico.

O armazenamento central de conhecimento é append-only: conhecimento arquivado não é sobrescrito nem removido.

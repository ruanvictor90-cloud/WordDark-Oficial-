# Central do Mundo

A Central do Mundo é o núcleo de conhecimento operacional sobre os setores do WordDark.

Ela mantém o catálogo de:
- setores existentes;
- capacidades disponíveis;
- responsáveis por cada capacidade;
- estado dos setores;
- conexões operacionais;
- solicitações em andamento;
- soluções conhecidas;
- propostas de novos setores.

## Função

A Central não executa tudo e não substitui a Rodovia.

A Rodovia pergunta à Central:
Quem possui capacidade para resolver este pedido?

A Central responde com a capacidade e o destino adequado.

Se não existir capacidade compatível, a solicitação é encaminhada ao Setor de Criação do Mundo.

## Regra de crescimento

1. Terra gera uma necessidade.
2. O Portão recebe a solicitação.
3. A Rodovia consulta a Central.
4. Se existir capacidade, a Rodovia encaminha ao destino.
5. O resultado retorna pela Rodovia.
6. Se não existir capacidade, a Rodovia encaminha o problema para Criação do Mundo.
7. Criação do Mundo analisa e produz uma proposta de estrutura/solução.
8. A proposta chega ao Painel Central.
9. O responsável autoriza ou rejeita.
10. Somente após autorização a nova estrutura pode entrar no mundo.
11. A Central registra a nova capacidade para futuras solicitações.

## Princípio

A Central conhece o que cada setor sabe fazer, não precisa conhecer toda a implementação interna de cada setor.

Isso mantém o mundo modular.
## Fronteira de informações

A Central do Mundo agora recebe informações externas somente pela **Fronteira de Informações** da Central de Conexões.

O fluxo é:

```
PROVEDOR EXTERNO
      ↓
GATEWAY SEGURO
      ↓
FRONTEIRA / SANITIZAÇÃO
      ↓
MUNDO WORDDARK
      ↓
CENTRAL / RODOVIA / SETOR
```

O Mundo pode consultar o estado das conexões, capacidades e informações operacionais necessárias, mas não possui acesso à porta de entrada, credenciais, client secrets, refresh tokens ou códigos de autorização.

Isso preserva a separação entre **entrada**, **conhecimento** e **execução**.

A conexão também é tratada como capacidade modular: um setor pode pedir apenas a função necessária sem obrigar o conteúdo a atravessar novamente setores que não precisam participar.

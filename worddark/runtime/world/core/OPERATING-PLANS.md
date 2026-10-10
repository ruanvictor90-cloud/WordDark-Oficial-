# WordDark — Planos Operacionais e Financeiro Recorrente v0.1

## Objetivo

Um plano define **o que uma operação pode usar**, quanto custa, a periodicidade e quais limites são concedidos. O financeiro recorrente transforma o calendário do plano em obrigações rastreáveis. Plano comercial, obrigação financeira e tentativa de pagamento são entidades diferentes.

## Modelo

- **Plano:** identidade, estado, ciclo, preço em unidade monetária mínima, moeda e permissões/limites (`entitlements`).
- **Vigência:** início, próxima data de cobrança, dia-âncora e estado do plano.
- **Obrigação:** cobrança prevista com período, vencimento, valor, moeda e situação.
- **Pagamento:** futura integração separada; a versão atual não cobra nem movimenta dinheiro.
- **Auditoria:** cada obrigação recebe ID determinístico `planId:YYYY-MM-DD`, impedindo duplicação quando o agendador é executado mais de uma vez.

## Ciclos

`WEEKLY`, `MONTHLY`, `QUARTERLY` e `YEARLY`.

Datas são tratadas como datas de calendário UTC. Ciclos mensais preservam o dia-âncora: uma cobrança ancorada no dia 31 cai no último dia de fevereiro e volta ao dia 31 em março.

## Estados

Plano: `DRAFT → ACTIVE → PAUSED → ACTIVE → RETIRED` (transições devem ser controladas pelo serviço de planos; não são feitas automaticamente pelo gerador).

Obrigação: `DUE`, `OVERDUE`, `PAID`, `VOID` e `SCHEDULED`. A versão inicial gera `DUE` ou `OVERDUE`; conciliação e baixa de pagamento pertencem ao próximo módulo.

Planos `DRAFT`, `PAUSED` e `RETIRED` não geram obrigações. Apenas planos `ACTIVE` entram no agendador.

## Segurança e limites da versão

1. Nenhuma cobrança real é executada.
2. Nenhum cartão, token bancário ou credencial é armazenado.
3. Valores usam inteiros na menor unidade monetária (por exemplo, centavos de BRL), evitando erros de ponto flutuante.
4. Preços e limites comerciais precisam ser aprovados antes de ativar um plano público.
5. O financeiro deve registrar tanto receitas previstas (`INCOME`) quanto custos recorrentes (`EXPENSE`).
6. TEST usa dados simulados; qualquer integração real exige autorização, gateway próprio e auditoria.

## Próximas etapas

1. Registro persistente e transições de estado auditadas.
2. Livro financeiro imutável para obrigações, baixas e estornos.
3. Alertas de vencimento e período de carência.
4. Gateway de pagamento isolado, com aprovação e conciliação.
5. Painel de planos e simulação antes de ativar preços comerciais.

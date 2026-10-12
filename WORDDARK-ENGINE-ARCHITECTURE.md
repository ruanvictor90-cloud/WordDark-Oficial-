# Arquitetura dos Motores — Ruan e WordDark

## Fronteira soberana

- Ruan é o motor central pessoal e permanece soberano.
- `ruan/engine/ruan-central.js` compõe o motor pessoal existente (`central-engine.js`) com a fronteira soberana, sem renomear nem substituir suas APIs.
- WordDark, Céu, Terra e conectores externos não recebem acesso à raiz nem métodos de escrita de Ruan.
- Sistemas conectados a Ruan recebem uma porta de solicitação: podem pedir uma capacidade e fornecer contexto, mas não aprovar pedidos, executar comandos pessoais ou alterar o estado pessoal.
- Ruan pode iniciar mensagens para sistemas conectados. A resposta de um sistema é informação, não autoridade sobre Ruan.
- A porta de solicitação em JavaScript estabelece separação de API; quando houver serviços remotos, a mesma regra precisa ser reforçada por autenticação, autorização no servidor, isolamento de credenciais e logs imutáveis.

## Motor central do WordDark

`worddark/core-central/world-engine.js` é o núcleo compartilhado do ecossistema. Ele recebe envelopes, valida tipo e origem, chama somente a responsabilidade de domínio correspondente, registra trilha de auditoria e cataloga modelos de receita. Não recria interfaces e não substitui os motores já existentes; é uma camada nova de coordenação sobre os contratos atuais.

## Motores de domínio

- **WordDark** — coordena, julga o encaminhamento e propõe rotas; não executa efeitos externos.
- **Céu** — prepara soluções, planos, conteúdos e entregáveis para revisão; não publica por conta própria.
- **Terra** — registra necessidades de clientes/negócios e recorrência; registrar demanda não significa aceitar orçamento nem prometer resultado.


## Motores de setores e empresas

- `worddark/runtime/world/core/sector-engine.js` cria uma instância isolada por setor, registra as empresas vinculadas e mantém uma visão resumida das operações e uma trilha de auditoria.
- `worddark/runtime/world/core/company-engine.js` cria uma instância isolada por empresa. Cada empresa mantém suas próprias ordens de trabalho, recorrência, orçamento/prazo, transições de estado e aprovações.
- O núcleo `worddark/core-central/world-engine.js` registra setores e empresas, encaminha operações para a instância da empresa e mantém o resumo do estado no setor. Uma empresa precisa pertencer a um setor registrado.
- O fluxo de uma operação empresarial é `RECEIVED → TRIAGED → PREPARING → REVIEW → APPROVED → DELIVERED`; cancelamento e retorno de revisão são estados explícitos. A aprovação exige confirmação explícita e identidade do responsável.
- Cada instância é isolada por identificador. Nenhum motor executa publicação, cobrança, compra ou chamada externa; o estado aprovado não liga execução real.

## Fluxo padrão

`DEMANDA → REGISTRO EM TERRA → COORDENAÇÃO WORDDARK → PREPARAÇÃO EM CÉU → REVISÃO/APROVAÇÃO → EXECUTOR AUTORIZADO`

O código desta etapa implementa intake, planejamento, roteamento e catálogo de modelos de receita. Publicação, cobrança, compras, alterações de contas e chamadas a conectores reais continuam desligadas.

## Preparação para receitas

O catálogo aceita modelos propostos, incluindo serviços avulsos, pacotes recorrentes, assinaturas, produtos digitais/físicos e operações comerciais. Cada modelo registra responsável, preço/modelo de cobrança e recorrência. O catálogo não cobra, não movimenta dinheiro e não afirma que um modelo está validado; todo registro nasce como `PROPOSED`.

## Regras obrigatórias

1. Nenhum domínio altera diretamente dados de outro domínio.
2. Cada solicitação tem identificador, estado, origem e trilha de auditoria.
3. A aprovação não executa automaticamente uma operação.
4. Sem autorização explícita, não há publicação, cobrança, compra nem mudança de conta.
5. O ambiente de testes usa motores simulados e não chama serviços reais.
6. Falha em um módulo deve permitir corrigir e testar aquele módulo sem reconstruir os demais.
7. Os nomes e caminhos existentes são preservados; estes arquivos acrescentam motores, sem substituir as interfaces antigas.

## Testes

```bash
node ruan/engine/sovereign-core.test.js
node ruan/engine/ruan-central.test.js
node worddark/core-central/world-engine.test.js
node worddark/runtime/world/core/worddark-engine.test.js
node worddark/runtime/world/core/sector-engine.test.js
node worddark/runtime/world/core/company-engine.test.js
node worddark/runtime/world/sky/sky-engine.test.js
node worddark/runtime/world/earth/earth-engine.test.js
```

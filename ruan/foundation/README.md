# Ruan — Fundação pessoal

**Branch:** feature/ruan-personal-foundation  
**Status:** protótipo isolado em desenvolvimento; não integrado à interface oficial.

## Visão de produto

Ruan é a plataforma pessoal. A central Ruan é a única dona da gaveta global de aplicativos. Os apps Pessoal e Shadow são independentes: cada um tem seus dados, sua navegação interna e seu próprio ciclo de desenvolvimento. Nenhum app deve renderizar uma segunda gaveta global.

## Estrutura da plataforma

1. **Ruan / Central:** navegação global, captura rápida, widgets e resumos autorizados.
2. **Pessoal:** tarefas, rotina, compras, lembretes, financeiro e futuras áreas de organização pessoal.
3. **Shadow:** app independente para ferramentas de navegação e integrações. DarkEye é um módulo planejado dentro dele; IA e navegador real não fazem parte desta etapa.
4. **Núcleos de domínio:** regras e validação de cada app, sem duplicar dados em widgets.
5. **Persistência e integrações:** adaptadores futuros, com permissões explícitas, tratamento de falhas e recuperação.

## Arquivos de estrutura

- ruan-platform-registry.js: mapa da plataforma e fronteira entre Central, Pessoal e Shadow.
- ruan-app-registry.js: catálogo de módulos pessoais e seus escopos.
- ruan-core.js: esquema versionado, validação, cálculos, recorrência e backup.
- shadow/ARCHITECTURE.md: arquitetura e limites do app Shadow.
- shadow/shadow-registry.js: catálogo declarativo de DarkEye, conectores, plugins, permissões e atividade.

## O que já existe na interface pessoal

- Visão geral, tarefas, compras, lembretes e financeiro.
- Tarefas com categorias, prioridades e conclusão.
- Múltiplas listas de compras com itens marcáveis.
- Lembretes com data/hora armazenada.
- Entradas e saídas, saldo calculado, reservas, investimentos registrados manualmente e orçamento por categoria.
- Visual dark roxo/preto responsivo e mobile-first.
- Exportação/importação JSON com validação e confirmação.

## Testes automatizados

O workflow dedicado verifica sintaxe e executa:
- node ruan/foundation/ruan-core.test.js
- node ruan/foundation/ruan-app-registry.test.js
- node ruan/foundation/ruan-platform-registry.test.js
- node ruan/foundation/shadow/shadow-registry.test.js

A existência do workflow não significa que os testes passaram; é necessário conferir o resultado de uma execução real no GitHub Actions.

## Limites atuais

- A interface pessoal salva no armazenamento local do navegador; não há sincronização nem autenticação real.
- O registro de permissões é declarativo e não substitui isolamento técnico.
- O financeiro é manual: não confirma saldo bancário, não realiza pagamentos e não executa investimentos.
- Lembretes ainda não são notificações em segundo plano do sistema.
- Shadow e DarkEye ainda não são um navegador funcional; o registro atual não executa plugins nem chama APIs.
- Não inserir senhas, tokens, credenciais bancárias ou documentos sensíveis no protótipo.

## Próximas etapas

1. Verificar a execução do workflow e revisar erros.
2. Definir os contratos de dados entre a Central Ruan e o app Pessoal.
3. Criar o esqueleto independente de Shadow/DarkEye sem duplicar a gaveta global.
4. Completar objetivos, vencimentos e planejamento pessoal.
5. Validar em celular antes de qualquer integração com a versão oficial.

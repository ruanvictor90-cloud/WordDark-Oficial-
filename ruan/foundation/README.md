# Ruan — Fundação pessoal

**Branch:** `feature/ruan-personal-foundation`  
**Status:** protótipo isolado em desenvolvimento; não integrado à interface oficial.

## Visão de produto

Ruan deve ser um ambiente pessoal extensível: simples para o uso diário, mas com estrutura suficiente para reunir rotina, tarefas, compras, lembretes, finanças, objetivos, projetos, notas e futuras áreas sem criar um aplicativo monolítico.

## Camadas

1. **Central:** resumo e navegação. Não é dona dos dados dos outros módulos; lê resumos autorizados.
2. **Aplicativos pessoais:** Tarefas/Rotina, Compras, Lembretes, Financeiro, Objetivos, Projetos e Notas.
3. **Núcleo de domínio:** esquema de dados, validação, datas recorrentes, cálculos financeiros, exportação/importação e histórico.
4. **Persistência e segurança:** armazenamento local temporário no protótipo. A sincronização futura deverá usar um adaptador autorizado, autenticação e recuperação; não compartilhar dados privados por padrão.
5. **Integrações:** notificações do sistema, calendário e provedores financeiros só depois de contratos, permissões e testes específicos.

## O que já existe na interface

- Visão geral, tarefas, compras, lembretes e financeiro.
- Tarefas com categorias, prioridades e conclusão.
- Múltiplas listas de compras com itens marcáveis.
- Lembretes com data/hora armazenada.
- Entradas e saídas, saldo calculado, reservas e valores de investimentos informados manualmente.
- Visual dark roxo/preto responsivo e mobile-first.

## Núcleo de domínio adicionado

`ruan-core.js` é um módulo puro, sem DOM, rede ou efeitos externos. Contém:
- esquema versionado e normalização para migração;
- validação básica de importação;
- cálculo de resumo financeiro e acompanhamento de orçamento por categoria;
- cálculo da próxima data para tarefas diárias, semanais e mensais;
- eventos de histórico limitados;
- pacote de exportação/importação validado.

Testes locais:
- `node ruan/foundation/ruan-core.test.js`
- `node ruan/foundation/ruan-app-registry.test.js`

A visão geral de módulos, contratos, limites e marcos está em `ARCHITECTURE.md`.

## Limites de segurança atuais

- A interface salva no armazenamento local do navegador. Isso não é um cofre seguro e não sincroniza entre aparelhos.
- Não inserir senhas bancárias, credenciais, documentos sensíveis ou dados de cartão no protótipo.
- O financeiro é um registro manual; não representa saldo bancário verificado, não faz pagamentos e não executa ordens de investimento.
- Lembretes ainda não são notificações em segundo plano do sistema.
- Importações futuras devem validar e confirmar os dados antes de substituir o estado atual.
- Os eventos do núcleo são trilha de aplicação, não uma auditoria inviolável.

## Próximos marcos

### Fundação
- Ligar a interface ao núcleo de domínio.
- Adicionar objetivos financeiros e datas de vencimento à interface.
- Exportação/importação com confirmação e backup prévio.
- Testes de cálculos, recorrência, migração e regressão.

### Gestão pessoal
- Tarefas recorrentes materializadas sem duplicação.
- Contas futuras, despesas previstas e orçamento mensal.
- Metas pessoais, projetos e notas.
- Busca global e captura rápida.

### Integração
- Definir contratos com o Ruan oficial sem editar a interface oficial durante a prototipagem.
- Substituir armazenamento local por adaptador de persistência quando necessário.
- Implementar notificações reais e sincronização somente com permissões explícitas.
- Revisar acessibilidade, estados vazios, erros e testes mobile antes de qualquer merge.

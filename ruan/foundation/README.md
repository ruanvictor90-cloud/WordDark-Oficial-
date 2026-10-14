# Ruan — Fundação pessoal (isolada)

**Branch:** `feature/ruan-personal-foundation`  
**Status:** protótipo funcional isolado; não integrado à tela oficial do Ruan.

## Objetivo

Desenvolver a experiência pessoal sem mexer na implementação oficial. A integração só deve acontecer depois de revisão visual, testes e alinhamento dos contratos de dados.

## Áreas do protótipo

- **Visão geral:** tarefas do dia, lembretes, itens pendentes de compras e resumo financeiro.
- **Tarefas:** tarefas domésticas e pessoais, categorias, prioridade, conclusão e sugestão de rotina básica (ex.: arrumar a cama).
- **Compras:** múltiplas listas, inclusão/remoção de itens e marcação do que já foi comprado.
- **Lembretes:** título, data/hora opcional, conclusão e remoção.
- **Financeiro:** lançamentos de entradas/saídas, saldo calculado, reservas e valores de investimentos registrados manualmente.
- **Interface:** dark roxo/preto, responsiva e mobile-first, preservando o estilo visual Ruan.

## Limites intencionais

- Não substitui nem altera `ruan/index.html`, `ruan/app.css` ou o app Pessoal oficial.
- Não se conecta ao banco WordDark, a contas bancárias ou a provedores de investimento.
- Não executa pagamentos, transferências ou ordens de investimento.
- Lembretes são registros locais; notificações do sistema ainda não foram implementadas.
- Os dados ficam no `localStorage` do navegador usado para abrir o protótipo. Não é armazenamento seguro nem sincronização entre dispositivos.
- Os saldos usam todos os lançamentos salvos e não são extratos bancários nem aconselhamento de investimento.

## Como abrir

Abra `index.html` em um navegador moderno. Os três arquivos deste diretório são autossuficientes e não exigem bibliotecas externas.

## Direção de integração futura

1. Revisar UI em celular e desktop.
2. Validar as regras dos cálculos financeiros e dos estados de tarefas/listas.
3. Definir um contrato de dados único com a arquitetura Ruan, evitando cópias e componentes duplicados.
4. Substituir armazenamento local por uma camada de dados autorizada quando houver necessidade de sincronização.
5. Conectar notificações reais somente depois de definir permissões e comportamento em segundo plano.
6. Manter os aplicativos como áreas independentes; a visão geral lê resumos autorizados, não duplica a lógica de cada área.
7. Integrar ao código oficial por mudanças pequenas e testadas; não mesclar esta branch diretamente sem revisão.

## Próximos passos técnicos

- Testes automatizados para cálculos financeiros, listas e tarefas.
- Exportação/importação de dados.
- Recorrência de tarefas (diária/semanal) e datas de vencimento.
- Orçamentos por categoria, metas financeiras e acompanhamento de despesas previstas.
- Notificações do sistema e regras de privacidade.

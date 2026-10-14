# Ruan — Arquitetura geral do aplicativo pessoal

**Estado:** fundação isolada em `feature/ruan-personal-foundation`.  
**Regra de integração:** não substituir nem editar a central oficial até a fundação ser validada.

## Missão

Ruan é o ambiente pessoal privado do usuário. Deve ajudar a capturar informações, organizar a rotina, gerir tarefas e dinheiro, acompanhar objetivos e facilitar decisões. Não deve exigir registro constante, encher a tela de métricas nem tornar a organização uma obrigação.

## Princípios de produto

- **Uma informação, uma fonte:** cada módulo é responsável pelos seus próprios registros; a central apresenta resumos.
- **Ação rápida:** registrar uma tarefa, item de compra, lembrete ou movimentação em poucos passos.
- **Mobile-first:** interfaces simples, legíveis e confortáveis no celular.
- **Autonomia do usuário:** editar, concluir, apagar, exportar e recuperar os próprios dados.
- **Sem falsa certeza:** dados manuais devem ser identificados como registros, nunca como saldo bancário verificado.
- **Privacidade por padrão:** nenhum módulo recebe acesso total só por existir.
- **Crescimento modular:** novos aplicativos são adicionados por contratos, não por duplicação da central.
- **Falha segura:** importações inválidas, ações não autorizadas e integrações indisponíveis não devem destruir dados.

## Camadas

### 1. Central Ruan
Responsável por navegação, captura rápida, widgets e resumos autorizados:
- agenda e tarefas prioritárias;
- lembretes;
- compras pendentes;
- resumo financeiro;
- objetivos e progresso;
- alertas de dados ou integração.

A central não deve manter uma segunda cópia dos registros.

### 2. Aplicativos pessoais
| Área | Responsabilidade | Estado |
|---|---|---|
| Tarefas | Pendências, prioridades, recorrência, conclusão | Protótipo |
| Compras | Listas independentes, itens e marcação de compra | Protótipo |
| Lembretes | Data/hora, conclusão e gestão de avisos | Protótipo |
| Financeiro | Entradas, saídas, reservas, investimentos registrados e orçamentos | Protótipo parcial |
| Objetivos | Metas pessoais e marcos de progresso | Planejado |
| Projetos | Projetos pessoais, etapas e próximas ações | Planejado |
| Notas e ideias | Captura rápida, organização e pesquisa | Planejado |
| Calendário | Eventos e visão temporal unificada | Planejado |
| Rotina e hábitos | Rotinas recorrentes e histórico de conclusão | Planejado |
| Documentos | Referências a documentos pessoais, com proteção reforçada | Planejado |
| Bem-estar | Registros voluntários de rotina e autocuidado | Planejado |

O registro de bem-estar é opcional e não substitui orientação profissional. Dados de documentos e bem-estar exigem proteção adicional antes de serem implementados.

### 3. Núcleo de domínio
- esquema versionado e normalização de dados;
- validação antes de salvar ou importar;
- cálculos financeiros centralizados;
- cálculo de recorrência de tarefas;
- trilha de eventos para diagnóstico;
- exportação e importação de backup;
- registro de módulos e limites de acesso.

### 4. Persistência
O protótipo usa armazenamento local do navegador. É adequado para testar a experiência, mas não oferece sincronização, recuperação remota ou proteção equivalente a um cofre de dados.

Futura interface de persistência:
- leitura e escrita validadas;
- versionamento/migração;
- cópia de segurança;
- sincronização opcional com resolução de conflitos;
- tratamento explícito de falhas;
- criptografia e autenticação antes de armazenar informações sensíveis.

### 5. Integrações
Integrações futuras (notificações, calendário externo ou dados financeiros) devem ser conectores independentes, com permissões específicas, indicação de estado e possibilidade de revogação. Nenhuma conexão externa é presumida ou ativada pelo protótipo.

## Contrato mínimo entre módulos

Uma ação entre áreas deve ter:
- identificador da ação;
- módulo de origem e módulo responsável;
- tipo de operação;
- referência ao registro, quando aplicável;
- permissões necessárias;
- estado e horário;
- resultado ou erro legível.

A central consulta apenas resumos definidos pelo módulo responsável. Dados financeiros detalhados não devem ser enviados para tarefas, e tarefas não devem receber dados financeiros completos.

## Segurança e limites atuais

- O protótipo não possui autenticação ou sincronização entre dispositivos.
- Os dados em `localStorage` podem ser acessados por código executado na mesma origem; não armazenar senhas, cartões, credenciais bancárias ou documentos sensíveis.
- O financeiro é manual: sem conexão bancária, pagamento, transferência ou ordem de investimento.
- A estimativa de saldo é calculada apenas pelos lançamentos existentes.
- Lembretes com data/hora ainda não geram notificações do sistema em segundo plano.
- O histórico é uma trilha de aplicação editável pelo ambiente, não uma auditoria inviolável.
- O registro de acesso do núcleo é uma regra inicial, não substitui autenticação real nem uma política de segurança do servidor.

## Marcos de desenvolvimento

### Marco A — Fundação isolada
- [x] Central e navegação básica.
- [x] Tarefas, listas de compras, lembretes e registros financeiros.
- [x] Núcleo de domínio versionado.
- [x] Recorrência diária/semanal/mensal em nível de cálculo e criação da próxima ocorrência ao concluir.
- [x] Orçamento por categoria.
- [x] Exportação/importação JSON com validação e confirmação.
- [x] Catálogo modular e limites de acesso descritos.
- [x] Testes automatizados iniciais e workflow dedicado.
- [ ] Confirmar execução de CI e testar visualmente em celular.

### Marco B — Gestão pessoal consistente
- [ ] Datas de vencimento e planejamento semanal.
- [ ] Contas futuras e despesas previstas.
- [ ] Objetivos de economia e acompanhamento de metas.
- [ ] Busca global e captura rápida unificada.
- [ ] Exportação com backup prévio automático antes de importar.
- [ ] Testes para recorrência, orçamentos, migração e casos de erro.

### Marco C — Uso cotidiano confiável
- [ ] Notificações reais e preferências por tipo de aviso.
- [ ] Calendário integrado.
- [ ] Sincronização e recuperação entre dispositivos.
- [ ] Acessibilidade e testes em diferentes tamanhos de tela.
- [ ] Proteção de dados sensíveis e modelo de ameaça revisado.

### Marco D — Integração com o Ruan oficial
- [ ] Congelar o contrato de dados e a navegação final.
- [ ] Mapear cada módulo para a arquitetura oficial existente.
- [ ] Migrar em mudanças pequenas, com testes de regressão.
- [ ] Preservar identidade visual, URLs e comportamento que já funcionam.
- [ ] Integrar somente após revisão; nunca mesclar automaticamente esta fundação inteira.

## Critérios para considerar o Ruan pronto para o uso diário

1. Dados persistem sem desaparecer durante recargas normais.
2. Backup pode ser exportado e restaurado com validação.
3. Tarefas recorrentes não criam duplicatas.
4. Cálculos financeiros são testados e deixam claras as limitações.
5. Notificações indicam corretamente o que foi configurado e o que ainda não está ativo.
6. A central mostra informações reais e não duplica registros.
7. Cada módulo só acessa os dados necessários.
8. Falhas e erros são comunicados sem apagar dados silenciosamente.

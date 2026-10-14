# Ruan — Arquitetura geral da plataforma pessoal

**Estado:** fundação isolada em feature/ruan-personal-foundation.  
**Regra de integração:** não substituir nem editar a central oficial até a fundação ser validada.

## Missão

Ruan é a plataforma pessoal privada. Deve reunir apps independentes, facilitar a organização diária e crescer sem virar uma interface monolítica. A central apresenta atalhos e resumos; os apps são responsáveis pelos próprios registros.

## Estrutura fixa

### Ruan — plataforma e central
- Única área com a gaveta global de aplicativos.
- Mantém navegação global, preferências da plataforma, captura rápida e widgets.
- Exibe resumos autorizados dos apps, sem criar cópias paralelas dos registros.
- Não deve mostrar uma área ADM.

### Pessoal — app independente
Responsável pela organização da vida pessoal:
- Tarefas, recorrência e prioridades.
- Compras e listas.
- Lembretes.
- Financeiro manual, reservas registradas, investimentos informados e orçamento.
- Futuramente: objetivos, projetos, notas, calendário, rotina/hábitos, documentos e bem-estar.

Pessoal pode ter navegação própria, mas não deve renderizar a gaveta global do Ruan nem conter cópias de outros apps da plataforma.

### Shadow — app independente
Responsável por ferramentas de navegação e futuras integrações.
- DarkEye: conceito planejado de navegador/overlay.
- Conectores: contratos futuros para APIs externas.
- Plugins: catálogo, permissões, compatibilidade e revogação.
- Permissões: escopos mínimos e concessões explícitas.
- Atividade: histórico legível e controlado pelo usuário.

Shadow não contém IA nesta etapa, não executa plugins, não chama APIs e não é ainda um navegador funcional. O detalhamento está em shadow/ARCHITECTURE.md.

## Contrato da plataforma

O arquivo ruan-platform-registry.js declara três superfícies: Central, Pessoal e Shadow. Somente a superfície raiz Ruan pode exibir a gaveta global. O catálogo declara escopos permitidos por app e nega por padrão escopos desconhecidos.

Esse registro é um contrato de arquitetura para orientar a implementação; não oferece sozinho autenticação, isolamento entre origens, criptografia nem autorização de servidor.

## Princípios de produto

- **Uma informação, uma fonte:** cada módulo é responsável pelos seus registros; a central só lê resumos autorizados.
- **Ação rápida:** capturar uma tarefa, item de compra, lembrete ou movimentação em poucos passos.
- **Mobile-first:** interfaces simples, legíveis e confortáveis no celular.
- **Autonomia:** editar, concluir, apagar, exportar e recuperar os próprios dados.
- **Sem falsa certeza:** dados manuais não são apresentados como saldo bancário verificado.
- **Privacidade por padrão:** nenhum app recebe acesso total apenas por existir.
- **Crescimento modular:** novos apps são adicionados por contratos, não por duplicação da central.
- **Falha segura:** dados inválidos ou integrações indisponíveis não devem destruir registros.

## Apps pessoais e estado

| Área | Responsabilidade | Estado |
|---|---|---|
| Tarefas | Pendências, prioridades, recorrência, conclusão | Protótipo |
| Compras | Listas, itens e marcação de compra | Protótipo |
| Lembretes | Data/hora, conclusão e avisos futuros | Protótipo |
| Financeiro | Entradas, saídas, reservas, investimentos registrados e orçamentos | Protótipo parcial |
| Objetivos | Metas pessoais e marcos | Planejado |
| Projetos | Projetos, etapas e próximas ações | Planejado |
| Notas e ideias | Captura, organização e pesquisa | Planejado |
| Calendário | Eventos e visão temporal | Planejado |
| Rotina e hábitos | Rotinas recorrentes e histórico | Planejado |
| Documentos | Referências a documentos com proteção reforçada | Planejado |
| Bem-estar | Registros voluntários de rotina e autocuidado | Planejado |

## Núcleo de domínio e persistência

O núcleo de domínio inclui esquema versionado, normalização, validação, cálculos financeiros, recorrência, eventos de aplicação e exportação/importação. O protótipo usa armazenamento local do navegador: não sincroniza entre dispositivos e não é um cofre seguro.

Antes de guardar dados sensíveis, será necessário definir autenticação, criptografia, controle de acesso, recuperação e um modelo de ameaça. Não armazenar senhas, cartões, tokens, credenciais bancárias ou documentos sensíveis no protótipo.

## Integrações

Notificações do sistema, calendário externo e dados financeiros devem ser conectores independentes, com escopos específicos, indicação de estado e possibilidade de revogação. Nenhuma integração é presumida ou ativada pelo protótipo.

## Marcos

### A — Fundação isolada
- [x] Central pessoal e navegação básica.
- [x] Tarefas, compras, lembretes e registros financeiros.
- [x] Núcleo de domínio versionado.
- [x] Recorrência diária/semanal/mensal no núcleo e criação da próxima ocorrência.
- [x] Orçamento por categoria.
- [x] Exportação/importação JSON com validação e confirmação.
- [x] Registro modular pessoal e testes iniciais.
- [x] Registro da plataforma e estrutura declarativa de Shadow/DarkEye.
- [ ] Confirmar CI e testar visualmente em celular.

### B — Gestão pessoal consistente
- [ ] Datas de vencimento, contas futuras e despesas previstas.
- [ ] Objetivos de economia e acompanhamento de metas.
- [ ] Busca global e captura rápida unificada.
- [ ] Backup prévio automático antes de importar.
- [ ] Testes de migração, recorrência, orçamento e erros.

### C — Shadow e integrações
- [ ] Criar shell próprio de Shadow, sem gaveta global duplicada.
- [ ] Definir interface inicial de DarkEye como protótipo.
- [ ] Especificar contratos de conectores e plugins.
- [ ] Implementar permissões técnicas antes de habilitar extensões.
- [ ] Revisar armazenamento, privacidade e revogação.

### D — Integração com a versão oficial
- [ ] Congelar contratos de navegação e dados.
- [ ] Mapear cada módulo para a arquitetura oficial existente.
- [ ] Migrar em mudanças pequenas com testes de regressão.
- [ ] Preservar identidade visual, URLs e comportamento existentes.
- [ ] Integrar somente após revisão; nunca mesclar automaticamente toda a fundação.

## Critérios de aceite

1. Dados persistem durante recargas normais e podem ser exportados.
2. Tarefas recorrentes não criam duplicatas.
3. Cálculos financeiros são testados e suas limitações ficam claras.
4. A central mostra resumos reais sem duplicar registros.
5. Apenas Ruan exibe a gaveta global.
6. Pessoal e Shadow não recebem dados um do outro sem escopo explícito.
7. Erros são comunicados sem apagar dados silenciosamente.
8. Nenhuma função futura é descrita como pronta antes de estar implementada e testada.

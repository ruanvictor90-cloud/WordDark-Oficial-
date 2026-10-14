# WordDark Oficial — arquitetura consolidada em construção

Este repositório reúne o aplicativo pessoal Ruan, seu painel Hub, o mundo operacional WordDark e os motores que serão conectados progressivamente.

## Fonte canônica de alinhamento

Leia primeiro: [Consolidação arquitetural](worddark/runtime/world/ARCHITECTURE-CONSOLIDATION.md).

**Regra principal:** manter os sistemas separados por responsabilidade. A presença de código legado ou de um motor no repositório não significa que ele esteja conectado ao fluxo ativo.

## Sistemas e responsabilidades

### Ruan — aplicativo pessoal
- Aplicativo privado e independente, com seus próprios dados.
- Inclui Pessoal (Financeiro e Tarefas) e Shadow.
- O financeiro pessoal organiza registros locais; não é um banco e não movimenta dinheiro real.
- Não é parte do mundo WordDark e não compartilha dados automaticamente com ele.

### Hub — painel superior do Ruan
- Pertence logicamente ao Ruan e é acessado por ele.
- Centraliza pedidos, execução, avisos e verificações do mundo.
- Deve permitir gerir o WordDark sem abrir cada setor, usando contratos autorizados.
- Não é um segundo Core e não executa operações por conta própria.
- Pedidos salvos localmente ainda não comprovam recebimento ou execução no mundo.

### WordDark — mundo operacional
- Coordena necessidades, operações, capacidades, empresas e resultados.
- **WordDark/Core** coordena; **Céu** executa capacidades especializadas; **Terra** organiza empresas e necessidades externas.
- A Central de Conexões controla a fronteira com provedores externos.
- Darknet é independente do Ruan e solicita operações ao mundo por contrato governado.

### Banco — instituição financeira do mundo
- Banco (interface atualmente chamada Darkbank) é responsável pela camada financeira interna do WordDark: registros, contas, tesouraria, Cofre, investimentos e controles.
- Recursos internos do WordDark não são fundos pessoais do Ruan.
- A interface e os registros atuais não constituem serviço bancário real nem comprovam transações ou investimentos executados.

## Fontes canônicas do runtime

- Ruan: `ruan/`
- Hub: `hub/`
- Interface WordDark: `worddark/app/`
- Core: `worddark/runtime/world/core/`
- Céu: `worddark/runtime/world/sky/`
- Terra: `worddark/runtime/world/earth/`
- Darknet independente: `darknet/`

A pasta `hub/` continua separada por conveniência de implementação/publicação, sem alterar sua propriedade lógica pelo Ruan. `worddark/core-central/` é legado e não deve virar um segundo Core ativo.

## Estado real e limites

- Várias funções de Ruan e Hub usam armazenamento local; não há sincronização central garantida entre dispositivos.
- A ponte Darknet–WordDark está desativada por padrão, sem rota HTTP ou transporte externo ativo.
- Publicação de conteúdo permanece manual por padrão; testes simulados não são publicação real.
- Credenciais, aprovações, permissões e auditoria reais precisam ser validadas no backend antes de produção.
- Banco/Darkbank não deve ser descrito como banco regulado operacional sem integração real e validação específica.

## Desenvolvimento e testes

- `main`: produção publicada.
- `develop`: criação.
- `staging`: integração e testes.

Executar `npm test` antes de concluir mudanças. Validar a publicação do GitHub Pages separadamente.

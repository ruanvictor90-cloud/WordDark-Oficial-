# Consolidação arquitetural — Ruan, Hub, WordDark e Banco

**Estado deste documento:** fonte canônica de alinhamento arquitetural. Descreve a responsabilidade de cada sistema e distingue código existente de integração real.

## 1. Regra soberana

Cada sistema possui uma responsabilidade e uma fronteira de dados. A existência de um módulo no repositório não o torna parte do fluxo ativo. O Core do WordDark é a fonte canônica de coordenação do mundo; o Hub não cria um segundo Core, e Ruan não é administrado pelo WordDark.

## 2. Ruan — aplicativo pessoal

- É um aplicativo próprio, privado e separado.
- É a raiz pessoal de navegação e o proprietário lógico do Hub.
- Guarda os dados pessoais e oferece os aplicativos pessoais, incluindo Pessoal (Financeiro e Tarefas) e Shadow.
- O financeiro do Ruan organiza registros pessoais. Não é a instituição financeira do WordDark, não movimenta dinheiro real e não concede ao WordDark acesso aos dados pessoais.
- O WordDark não pode alterar a autoridade, os dados ou as regras internas do Ruan.
- A Área ADM não faz parte da interface atual do Ruan.

**Regra:** integrações entre Ruan e serviços externos exigem contratos e permissões explícitos. Não compartilhar armazenamento ou credenciais por conveniência.

## 3. Hub — painel superior pertencente ao Ruan

O Hub é a tela de gestão superior do mundo acessada a partir do Ruan. Ele deve permitir ao operador enviar uma solicitação, acompanhar pedidos e execuções, consultar avisos, verificar setores e acionar operações autorizadas sem abrir individualmente cada setor.

Responsabilidades:
- receber e organizar pedidos;
- apresentar estados, alertas, resultados e falhas fornecidos por fontes autorizadas;
- oferecer verificações do mundo ou de setores;
- atuar como painel de comando e acompanhamento, não como motor de execução;
- encaminhar comandos ao WordDark Core por contratos governados, sem contornar autorização ou auditoria.

Limites:
- o Hub não é o WordDark e não é dono do Core;
- os registros locais atuais do Hub são rascunhos locais, não prova de que uma operação foi recebida pelo servidor nem de que esteja em execução;
- o Hub não ganha acesso irrestrito a dados pessoais de Ruan nem a segredos de conectores;
- a pasta física `hub/` permanece separada para manter caminhos e publicação simples; essa separação de arquivos não altera a propriedade lógica do Hub pelo Ruan.

## 4. WordDark — mundo operacional e solucionador de necessidades

O WordDark coordena operações e administra a infraestrutura necessária para empresas especializadas trabalharem juntas. Recebe uma intenção/necessidade, verifica política e autorização, encontra capacidades, encaminha a operação, registra o percurso e devolve um resultado.

- **Core/WordDark:** coordenação, contratos, identidade, autorização, auditoria, registro, roteamento e gestão operacional.
- **Céu:** execução de capacidades e serviços especializados, incluindo Dark Factory e Marketing conforme o catálogo ativo.
- **Terra:** empresas, clientes, canais, negócios, entidades e necessidades externas.
- **Central de Operações/Rodovia:** organizam o ciclo da solicitação e o trânsito entre empresas e capacidades.
- **Central de Conexões:** fronteira controlada para credenciais e adaptadores de serviços externos.
- **Darknet:** sistema independente de acesso e preparação de solicitações; não é parte do Ruan e não possui autoridade própria sobre o mundo.

Regra: **o WordDark coordena; as empresas operam; os setores executam; os resultados retornam à origem.** Céu e Terra são áreas do mundo, não sinônimos de empresas. Novas empresas devem ser adicionadas por registro de responsabilidade e capacidades, não por duplicação do Core.

## 5. Darkbank — gestão financeira interna do WordDark

Darkbank é, nesta fase, o setor de gestão financeira interna do mundo — não uma instituição financeira autorizada. Sua responsabilidade inicial é registrar e acompanhar: 
- gestão financeira interna do WordDark;
- contas e registros financeiros;
- tesouraria e Cofre;
- planejamento e acompanhamento de investimentos;
- controles, aprovações, limites, reconciliação e auditoria financeira;
- contratos claros entre operações financeiras e as demais empresas do mundo.

Fronteiras e estado:
- os saldos/recursos internos do Cofre pertencem ao WordDark, não ao Ruan;
- a área Financeiro do Ruan é pessoal e independente;
- telas e registros locais não constituem conta bancária real, custódia, investimento executado ou transferência;
- integração bancária real, movimentações, custódia ou investimento não fazem parte da operação atual. Uma futura expansão para instituição financeira exigirá enquadramento legal/regulatório aplicável, parceiros/provedores legítimos, backend seguro, autenticação, aprovação, auditoria, validação operacional e autorização explícita;
- nenhuma capacidade financeira deve ser concedida apenas por existir um token ou uma conexão OAuth.

## 6. Contrato de operação comum

A linguagem compartilhada do código e da documentação deve seguir este vocabulário:

1. **Pedido/necessidade:** o que precisa ser resolvido.
2. **Intenção:** objetivo declarado, sem pressupor como será executado.
3. **Capacidade:** ação que um setor/empresa está autorizado e apto a realizar.
4. **Operação:** instância rastreável do trabalho autorizado.
5. **Aprovação:** decisão identificável de uma autoridade confiável.
6. **Execução:** trabalho efetivamente iniciado por um executor autorizado.
7. **Resultado:** saída estruturada devolvida à origem.
8. **Conector/adaptador:** fronteira técnica para um sistema externo.
9. **Auditoria:** registro verificável de decisões e mudanças relevantes.

Estados sugeridos e normalizados para novos contratos: `RECEIVED`, `NEEDS_REVIEW`, `APPROVED`, `QUEUED`, `RUNNING`, `SUCCEEDED`, `FAILED`, `CANCELLED`. Interfaces podem exibir traduções em português; contratos devem evitar estados equivalentes com nomes diferentes. Não renomear estados existentes sem migração e testes de compatibilidade.

## 7. Fronteiras de integração

- Ruan → Hub: navegação e gestão do mundo, sem transferir a propriedade dos dados pessoais.
- Hub → WordDark Core: solicitações e consultas governadas; a autoridade e a auditoria permanecem no Core.
- Darknet → WordDark Core: contrato independente, desligado por padrão; não há transporte HTTP ativo.
- WordDark → Céu/Terra: contratos e roteamento por capacidade.
- WordDark → Central de Conexões → provedores: credenciais e chamadas externas ficam no backend controlado.
- Banco ↔ empresas: apenas contratos financeiros explícitos, com identidade, autorização, aprovação e auditoria.
- Nenhuma integração pode depender de um caminho de arquivo ou de armazenamento local compartilhado como mecanismo de autorização.

## 8. Critério de consolidação

Antes de considerar qualquer módulo integrado:
- identificar a fonte canônica de verdade;
- declarar entradas, saídas, permissões e responsável;
- eliminar cópias ativas e nomenclatura contraditória, mantendo legado claramente inativo;
- testar limites de dados e caminhos;
- validar erros, negação, idempotência e auditoria quando aplicável;
- diferenciar testes simulados de evidência em serviços reais;
- preservar a interface existente salvo pedido explícito de alteração.

## 9. Ruan Hub ↔ WordDark Core

O contrato de controle do Hub fica em `core/connections/ruan-hub-control-adapter.js`. Ele exige contexto de identidade confiável separado do payload, autorização por ação, aprovação identificável para submissão, auditoria e idempotência fornecidas por dependências de backend. `core/connections/firestore-operation-control-store.js` implementa essas duas últimas dependências sobre Firestore transacional injetado; a integração foi testada com o runtime do Hub e a ponte comercial. O runtime permanece desligado por padrão, não registra rota HTTP e está fixado em `TEST`. O Hub ainda guarda rascunhos locais; não está ligado a uma sessão de operador real nem a um serviço remoto autenticado. A instância Firestore, identidade, autorização e aprovação reais continuam pendentes. Consulte [Mapa da arquitetura e pendências](./ARCHITECTURE-MAP.md).

## 10. Estado real conhecido nesta fase

- Ruan e Hub são aplicações estáticas; várias funções guardam dados no armazenamento local do navegador.
- Os pedidos atuais do Hub são locais e não demonstram execução remota.
- A ponte Darknet–WordDark está desativada por padrão, é in-process e não possui rota HTTP ativa.
- A publicação de conteúdo continua manual por padrão. Nenhuma publicação real foi feita por estes testes.
- Os testes automatizados com dependências simuladas não comprovam IAM, armazenamento transacional real, credenciais de produção nem deploy.
- O código do Banco/Darkbank deve ser tratado como gestão financeira do mundo, não como instituição bancária regulada já operacional.

Este documento define o alinhamento alvo; ele não declara que integrações ainda pendentes já estejam implementadas.


## 11. Operação comercial inicial

O desenvolvimento passa a seguir também o [Plano de operação comercial sem investimento inicial](../../../COMMERCIAL-BOOTSTRAP.md). A primeira receita deve vir de uma entrega pequena e revisada manualmente, não da conclusão de todos os setores. APIs pagas, assinaturas, propostas automáticas e ações financeiras externas exigem evidência de retorno e autorização explícita. Faturamento, custos, horas e saldo disponível devem ser registrados separadamente.

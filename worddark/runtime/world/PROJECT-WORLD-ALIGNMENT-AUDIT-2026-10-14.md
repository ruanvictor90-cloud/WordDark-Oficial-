# Auditoria geral e alinhamento do mundo — 14/10/2026

**Branch de trabalho:** `feature/world-alignment-audit-20261014`, criada a partir de `staging` (`500dc552f416812b184a0d2cb6add29b8c040049`).  
**Escopo desta revisão:** arquitetura/documentação canônica, fronteiras entre apps, fluxo comercial, fila de execução manual, integração com Core, Darknet/Conexões, finanças, testes e disciplina de publicação.  
**Interfaces:** nenhuma interface existente foi alterada nesta etapa. Novos apps/categorias devem seguir o contrato de shell mínimo e caixa de diálogo de requisitos, sem construir telas funcionais.

## 1. Objetivo do mundo

O WordDark é uma infraestrutura operacional para receber necessidades, transformar cada necessidade em uma operação autorizada, encaminhar o trabalho à capacidade certa, acompanhar sua execução e devolver um resultado verificável. Seu objetivo econômico inicial é validar uma operação comercial pequena, entregar valor real, registrar custos e recebimentos reais e reinvestir somente recursos confirmados.

O mundo cresce por empresas e capacidades registradas — não por duplicar o Core nem por criar integrações implícitas.

## 2. Arquitetura canônica

- **Ruan:** ambiente pessoal privado e independente. Mantém sua identidade visual, apps e dados pessoais. O WordDark não o administra e não recebe seus dados por padrão.
- **Ruan Hub:** painel superior de acompanhamento do mundo, logicamente pertencente ao Ruan. Rascunhos locais não são pedidos remotos.
- **Darknet:** app/sistema independente de navegação, descoberta e preparação de solicitações; não é um app interno do Ruan e não possui autoridade própria.
- **WordDark Core:** autoridade operacional do mundo para contratos, políticas, autorização, auditoria, registro, roteamento e estado das operações.
- **Central de Conexões:** fronteira compartilhada do WordDark para provedores, credenciais, capacidades e adaptadores externos.
- **Terra:** origina e organiza necessidades externas, clientes, entidades, canais, empresas, oportunidades e pedidos.
- **Céu:** executa capacidades e serviços especializados.
- **Dark Factory:** capacidade de produção pertencente ao Céu; produz e valida entregáveis, mas não é dona dos clientes, canais, decisões comerciais nem da publicação.
- **Biblioteca:** registra conhecimento e artefatos; não autoriza nem executa operações.
- **Darkbank:** gestão financeira interna do WordDark, não banco autorizado. Separado do Financeiro pessoal do Ruan.
- **Shadow / darkEye:** ferramentas pessoais experimentais dentro do ecossistema Ruan; não são parte do WordDark ou da Darknet e não devem receber lógica nova sem solicitação específica.

Regra: **Terra identifica a necessidade → WordDark valida e coordena → Céu executa → WordDark registra o resultado → o resultado retorna à origem.**

## 3. Revisão técnica: constatações

### P0 — bloqueios antes de operação pública

1. **Não existe ainda uma entrada pública conectada a um backend autenticado.** GitHub Pages entrega arquivos estáticos; formulários e armazenamento local não criam uma fila compartilhada confiável.
2. **A fila de execução manual é em memória.** Reiniciar o processo perde tarefas e histórico. Não serve como fila de produção.
3. **Identidade, autorização, aprovação, idempotência e auditoria reais ainda não estão conectadas ao ambiente implantado.** Contratos e testes simulados não provam a integração real.
4. **O despacho comercial e a ponte Darknet/Core permanecem desligados por padrão e/ou fixados em TEST.** Isso é correto até haver validação; não ativar via flag de interface.
5. **Não existe confirmação automática de pagamento.** Entrega, fatura, proposta aceita, valor esperado e dinheiro recebido são estados diferentes.
6. **Nenhuma publicação externa ou chamada de API de produção deve ser considerada ativa** só porque existe um adapter, OAuth store ou teste.

### P1 — confiabilidade do fluxo comercial

1. O ciclo a consolidar é:  
   `necessidade → lead → qualificação → proposta → aceite explícito → pedido → aprovação de despacho → operação Core → fila de execução → material real → revisão → entrega confirmada → recebimento conferido → custos → resultado líquido`.
2. A fonte comercial deve continuar sendo Terra; o Core coordena a operação; a fila da Dark Factory acompanha a execução assistida. Não criar um segundo motor comercial.
3. O bridge comercial tem um caso de recuperação a reforçar: se o Core aceitar uma operação, mas não devolver um ID rastreável, a resposta atual pode parecer uma recusa embora a operação já tenha sido aceita. Tratar isso como **resultado incerto/reconciliação obrigatória**, nunca como falha simples que autorize repetir cegamente.
4. A ponte pode aceitar a operação no Core e depois falhar ao registrar a tarefa na fila. O código já retorna um aviso em alguns caminhos; essa situação precisa de registro durável e ferramenta de reconciliação antes de qualquer ativação real.
5. A fila usa catálogo restrito de serviços e exige aprovação explícita. O catálogo comercial, os tipos de serviço e os briefs devem permanecer sincronizados; nomes não devem ser inventados no frontend.
6. O módulo de fila marca a revisão como independente apenas quando o revisor é diferente do executor. Para trabalhos pagos, preferir revisão por outra pessoa quando viável; caso contrário, registrar que a revisão foi própria.

### P1 — arquitetura e segurança

1. Não confiar em identidade, permissões ou status enviados pelo navegador.
2. Tokens e segredos permanecem no backend; o frontend recebe apenas metadados e capacidades permitidas.
3. Toda ação externa deve ter ator autenticado, permissão específica, aprovação quando exigida, chave idempotente, auditoria antes/depois e tratamento explícito de falhas parciais.
4. Separar claramente rascunho local, dado persistido, dado validado por fonte externa, operação aceita pelo Core e ação concluída no provedor.
5. Firestore adapters e testes com store falso são preparação técnica; ainda é necessário validar IAM, regras, transações concorrentes, retenção, backups e recuperação no projeto real.
6. O estado de prontidão precisa ser derivado de verificações reais, não da existência de arquivos nem de flags locais.

### P2 — organização e manutenção

1. `worddark/runtime/world/core/` é a fonte canônica do Core ativo. `worddark/core-central/` permanece referência/legado, não segundo runtime.
2. Não promover `Cidade de Compras` de `develop` sem inventário de dependências, migração explícita e testes.
3. Manter Ruan, Hub, WordDark e Darknet com fronteiras de dados e ownership claros; caminhos de arquivos não são mecanismo de autorização.
4. Normalizar nomes de estados e capacidades apenas por migração compatível, com testes. Não renomear estados existentes por estética.
5. O histórico de branches diverge: na comparação feita, `staging` estava 492 commits à frente de `main` e 8 atrás. Isso não significa 492 funcionalidades prontas; antes de promover, revisar os commits exclusivos de `main` e reconciliar conflitos.

## 4. Perspectiva empreendedora

### Primeiro serviço-piloto

Oferta inicial recomendada para validar demanda, não promessa de receita:
- 3 textos curtos para publicações;
- 1 roteiro de vídeo vertical curto;
- 1 revisão de bio/apresentação;
- entrega em documento;
- 1 rodada de ajustes.

A faixa de teste documentada é R$ 50–100, a confirmar após compreender escopo, prazo e esforço. Não prometer crescimento, vendas, seguidores ou publicação automática.

### Indicadores que realmente importam

- contatos personalizados feitos;
- respostas recebidas;
- necessidades qualificadas;
- propostas enviadas e aceitas;
- horas reais por entrega;
- custos diretos;
- entregas aceitas;
- valores efetivamente recebidos;
- margem após custos;
- retrabalho e satisfação.

Proposta não é venda; aceite não é dinheiro recebido; faturamento não é lucro. Só escalar o serviço depois de confirmar demanda, qualidade, tempo e margem.

### Caminho econômico

1. Operação manual e sem custo recorrente desnecessário.
2. Registrar leads, escopo, custos e resultados de modo recuperável.
3. Automatizar primeiro tarefas repetitivas de baixo risco.
4. Só pagar por infraestrutura quando a necessidade estiver comprovada.
5. Não ativar APIs pagas, anúncios, publicações, pagamentos ou investimentos sem orçamento, autorização e validação explícitos.

## 5. Padrão para apps e categorias novas

- Registrar cada app/categoria no catálogo com responsável, finalidade, entradas, saídas, dependências, permissões e estado real.
- Criar apenas a estrutura mínima de identidade: cabeçalho padrão, logo/identificação, retorno e área de conteúdo vazia.
- Incluir uma caixa de diálogo informativa com o que a futura interface precisa contemplar, sem escolher layout funcional por conta própria.
- Não desenvolver dashboards, formulários, listas operacionais ou fluxos visuais específicos até o usuário definir a interface.
- Não alterar as interfaces atuais do Ruan, Hub, WordDark ou Darknet como parte desta revisão.
- A caixa de diálogo é uma especificação, não um controle de segurança nem prova de integração.

## 6. Critérios de liberação

Uma operação só pode sair de TEST quando:
- a entrada usa backend real e autenticação confiável;
- autorização e aprovações são verificadas no servidor;
- armazenamento e idempotência são duráveis e concorrentes;
- auditoria é persistente e pesquisável;
- falhas parciais têm reconciliação e não causam duplicação;
- testes automatizados e testes manuais no dispositivo passam;
- conectores reais são verificados com credenciais e escopos mínimos;
- monitoramento, recuperação e parada de emergência estão definidos;
- o usuário aprova explicitamente a promoção.

## 7. Próxima sequência

1. Consolidar este catálogo e os contratos de interface sem alterar as telas existentes.
2. Criar a entrada comercial e painel de operação como estrutura mínima em uma branch baseada no staging atual; a persistência/autenticação exige backend real.
3. Corrigir e testar os caminhos de falha parcial do despacho comercial.
4. Executar a suíte completa e os testes de arquitetura/segurança.
5. Fazer validação manual no celular.
6. Só então propor PR para `staging`; `main` permanece intocada até revisão e aprovação explícitas.

**Estado final desta auditoria:** estrutura e contratos podem ser organizados agora; a operação pública autônoma ainda não está pronta. A primeira meta realista é uma venda manual rastreável e entregue com qualidade, não simular autonomia que o ambiente ainda não oferece.

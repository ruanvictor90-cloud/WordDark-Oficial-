# 08 — Modulos, interfaces e contratos internos do nucleo

**Status:** especificacao arquitetural v1.0. Proximo passo: transformar os contratos em modelos validaveis e testes antes de criar interfaces finais.

## 1. Objetivo

Definir limites claros para que o WordDark possa crescer sem virar um bloco unico e sem precisar ser refeito a cada novo cliente. Cada modulo tem uma responsabilidade, uma interface explicita, dados sob sua propriedade e testes verificaveis.

Este documento descreve o desenho esperado. Nao afirma que os modulos ja estejam implementados.

## 2. Modulos do nucleo

### A. Registro e catalogo
Responsabilidade: manter a lista de sistemas, entidades, capacidades e versoes de contrato conhecidas.

Entradas: pedido de cadastro, declaracao de capacidades, versao, responsavel e evidencias de validacao.
Saidas: registro, estado atual, compatibilidade conhecida e historico.
Limite: nao pode ativar a si proprio, conceder permissoes ou declarar uma capacidade comprovada sem teste.

### B. Identidade e acesso
Responsabilidade: validar quem solicita uma operacao e quais acoes, recursos e ambientes estao autorizados.

Entradas: identidade do solicitante, acao, recurso, ambiente e contexto da operacao.
Saidas: decisao permitir/negar, escopo aplicado, motivo e referencia de auditoria.
Limite: nao pode transformar permissao de leitura em escrita, ou permitir que uma entidade amplie os proprios privilegios.

### C. Contratos e validacao
Responsabilidade: validar formato, versao, campos obrigatorios e compatibilidade entre solicitante e destino.
Entradas: mensagem ou declaracao de capacidade.
Saidas: validacao aprovada ou lista estruturada de erros.
Limite: nao pode executar a operacao que esta validando.

### D. Registro de necessidades
Responsabilidade: manter objetivos, restricoes, criterios de sucesso e relacoes com contratos e entregaveis.
Entradas: necessidade interna ou derivada de contrato de cliente.
Saidas: necessidade identificada, pendencias, prioridade e criterios de aceite.
Limite: nao pode inventar informacoes contratuais ausentes.

### E. Planejador e analise de lacunas
Responsabilidade: decompor necessidades em entregaveis e tarefas, identificar dependencias e comparar tarefas com capacidades ativas.

Saidas possiveis:
- plano executavel com capacidades conhecidas;
- plano parcial com bloqueios identificados;
- lacunas que exigem novo modulo, parceiro, recurso ou mudanca de escopo;
- perguntas que precisam de decisao humana.

Limite: nao pode afirmar que uma capacidade existe apenas porque foi mencionada em uma descricao.

### F. Roteador
Responsabilidade: escolher destinos compativeis para tarefas autorizadas, segundo capacidades declaradas, estado, permissao, risco, disponibilidade e restricoes.
Entradas: tarefa validada e lista de destinos elegiveis.
Saidas: destino escolhido, justificativa, alternativas ou motivo de bloqueio.
Limite: nao pode encaminhar para entidade inativa, incompativel ou sem permissao.

### G. Aprovacoes
Responsabilidade: recolher e registrar decisao humana vinculada a uma acao especifica e ao seu escopo.

Uma aprovacao deve indicar solicitacao, aprovador autorizado, acao, ambiente, limites, validade e versao do plano aprovado. Alterar materialmente o plano invalida a aprovacao anterior e exige nova revisao.

Limite: nao pode aprovar em nome do usuario sem autorizacao expressa ou reutilizar aprovacao para outra operacao.

### H. Executor
Responsabilidade: despachar apenas operacoes autorizadas para adaptadores ou entidades executoras.

Antes da execucao, confirmar: contrato valido, entidade ativa, permissao, aprovacao exigida, limites, ambiente e chave de idempotencia.
Depois da execucao, retornar resultado verificavel e identificador de rastreamento.

Limite: nao pode contornar bloqueios, ocultar falhas ou declarar sucesso sem confirmacao do destino.

### I. Auditoria e evidencias
Responsabilidade: registrar eventos importantes, decisao, versoes, autorizacoes, mudancas de estado e resultados.

Registros devem ser append-only sempre que viavel; correcao gera novo evento em vez de apagar silenciosamente o historico. Segredos nao entram nos logs.

### J. Recuperacao e suspensao
Responsabilidade: tratar timeout, falha parcial, cancelamento, revogacao, suspensao de entidade e recuperacao segura.

A recuperacao deve ser limitada, rastreavel e idempotente quando possivel. Se nao houver compensacao segura, bloquear e encaminhar para revisao humana.

## 3. Fluxo de dependencia

Entrada -> Contratos e validacao -> Identidade e permissao -> Registro de necessidade -> Planejador e analise de lacunas -> Aprovacao conforme risco -> Roteador -> Executor -> Verificacao do resultado -> Auditoria e evidencia -> Relatorio e aceite.

A auditoria recebe eventos de todas as etapas. Suspensao, revogacao ou falha critica pode interromper o fluxo. O fluxo real pode voltar para planejamento quando uma lacuna, ambiguidade ou mudanca de escopo for encontrada.

## 4. Contratos minimos de dados

Os schemas definitivos serao implementados em formato validavel, com versao e testes. Os campos logicos iniciais sao:

### Necessidade
- need_id, tenant_id, source_contract_id opcional;
- objective, context, constraints;
- success_criteria, priority, risk_level;
- status, owner, created_at, updated_at.

### Capacidade
- capability_id, provider_entity_id, contract_version;
- purpose, input_schema, output_schema;
- permissions_required, risk_class, dependencies;
- availability_state, test_evidence, version.

### Tarefa
- task_id, need_id, deliverable_id opcional;
- dependencies, required_capabilities, assigned_entity_id opcional;
- input_reference, expected_output, acceptance_criteria;
- status, approval_id opcional, evidence_refs.

### Operacao
- operation_id, message_id, correlation_id, idempotency_key;
- source, destination, contract_version, action;
- scope, environment, risk_level, mode;
- approval_ref opcional, status, result_ref, error_ref.

### Evidencia
- evidence_id, operation_id ou task_id;
- evidence_type, source_system, created_at;
- integrity_reference, verification_status, retention_class.

Dados de clientes devem incluir tenant_id ou mecanismo de isolamento equivalente validado no servidor. Nao confiar em um identificador enviado pelo cliente como unica barreira de seguranca.

## 5. Eventos iniciais

Nomes ilustrativos estaveis; payloads definitivos dependem dos schemas:
- entity.submitted
- entity.validation_failed
- entity.activated
- entity.suspended
- need.created
- plan.proposed
- gap.detected
- approval.requested
- approval.granted
- approval.rejected
- operation.started
- operation.succeeded
- operation.failed
- deliverable.review_requested
- deliverable.accepted
- contract.change_requested

Um evento descreve algo que aconteceu. Nao funciona como permissao nem deve disparar automaticamente uma acao de alto risco sem politica, validacao e aprovacao separadas.

## 6. Isolamento entre clientes

- Cada cliente recebe um identificador interno estavel.
- A autorizacao deve verificar o cliente no lado confiavel do sistema, nao apenas confiar no tenant_id da requisicao.
- Consultas, arquivos, logs, evidencias, conectores e caches devem respeitar o mesmo isolamento.
- Testes negativos tentam ler, alterar ou associar dados de outro cliente e precisam falhar.
- Acesso de suporte excepcional exige motivo, escopo, prazo, aprovacao e trilha de auditoria.

## 7. Estrategia de implementacao sem custo inicial

A primeira versao deve funcionar localmente e em modo simulado:
1. Schemas e validacao.
2. Maquina de estados e transicoes permitidas.
3. Catalogo vazio e entidades ficticias isoladas.
4. Necessidade -> plano -> lacuna ou tarefa roteada.
5. Aprovacao e bloqueio de execucao.
6. Executor simulado com resultados deterministas.
7. Auditoria, repeticao idempotente e testes de falha.
8. Relatorio de resultado e criterios de aceite.

Nao introduzir fila remota, banco gerenciado, API paga ou automacao externa antes de medir necessidade e custo-beneficio. Para qualquer persistencia local inicial, definir backup e limites de uso; nao tratar armazenamento no navegador como cofre de segredos.

## 8. Testes obrigatorios do nucleo

- Mensagem malformada ou versao desconhecida e rejeitada.
- Entidade nao ativa ou contrato incompativel nao recebe tarefa.
- Permissao ausente bloqueia a operacao.
- Operacao de alto risco sem aprovacao nao e executada.
- A mesma chave de idempotencia nao duplica efeito.
- Falha ou timeout nao gera estado de sucesso.
- Mudanca no plano aprovado invalida a aprovacao correspondente.
- Uma necessidade sem capacidade gera lacuna explicita.
- Dados de dois clientes ficam isolados em testes positivos e negativos.
- Toda transicao relevante tem origem, horario e evidencia.
- Cancelamento e suspensao bloqueiam novos efeitos nao essenciais.
- O modo simulado nao acessa servicos ou contas reais.

## 9. Criterio para considerar o nucleo pronto

O nucleo so pode ser considerado pronto para um primeiro caso real depois que:
- schemas e estados estiverem implementados e testados;
- o fluxo completo funcionar em ambiente isolado;
- os testes de permissao, isolamento, repeticao e falha passarem;
- houver procedimento de backup, recuperacao e auditoria;
- o plano de operacao real listar explicitamente o que continua manual;
- o usuario aprovar o escopo e os riscos do caso inicial.

Este criterio nao significa que todas as capacidades comerciais futuras estarao prontas. Significa que o mecanismo central de registro, planejamento, autorizacao, roteamento e verificacao foi validado para um escopo definido.

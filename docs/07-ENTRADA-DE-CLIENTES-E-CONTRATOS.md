# WordDark — Entrada de contratos e operacao de clientes

Este documento define como o mundo deve receber uma empresa real e transformar o contrato em uma operacao governada. E especificacao; nao afirma que a execucao automatica ja existe.

## 1. Fronteira comercial e operacional

Um contrato assinado autoriza somente o escopo escrito nele. Ele nao concede automaticamente acesso a contas, dados, fornecedores, dinheiro, credenciais ou outros sistemas do cliente. Cada acesso exige finalidade, permissao, prazo e responsavel.

## 2. Pacote de entrada do cliente

O onboarding deve reunir e validar:
- identificacao da organizacao e contatos autorizados;
- contrato, escopo contratado, exclusoes e criterios de aceite;
- necessidades e resultados esperados;
- prazos, prioridades e marcos;
- dados fornecidos, origem, formato, classificacao e base de autorizacao;
- recursos, ferramentas e integracoes permitidas;
- limites de custo, quantidade, frequencia e volume;
- riscos, requisitos de seguranca e regras de aprovacao;
- responsaveis por decisao e escalonamento;
- evidencia necessaria para demonstrar conclusao.

Informacao faltante vira uma pendencia explicita. O sistema nao deve preencher fatos contratuais por suposicao.

## 3. Transformacao do contrato em operacao

1. Registrar o contrato e sua versao como fonte de verdade.
2. Extrair entregaveis, limites, dependencias e criterios de aceite.
3. Validar ambiguidades e abrir perguntas para revisao humana.
4. Converter entregaveis em necessidades e tarefas rastreaveis.
5. Mapear cada tarefa para capacidades ativas e autorizadas.
6. Identificar lacunas: criar modulo, configurar entidade, contratar parceiro ou renegociar prazo/escopo.
7. Montar plano com custos estimados, riscos, sequencia e pontos de aprovacao.
8. Apresentar o plano para aprovacao antes de executar qualquer acao relevante.
9. Executar tarefas autorizadas e registrar evidencias.
10. Validar cada entrega contra o contrato e gerar relatorio de status.
11. Solicitar aceite do cliente quando o contrato exigir.
12. Encerrar, manter ou renovar a operacao segundo as regras acordadas.

## 4. Rastreamento de ponta a ponta

Cada item de trabalho deve ligar:
contrato -> entregavel -> necessidade -> plano -> tarefa -> entidade executora -> aprovacao -> evidencia -> resultado -> aceite.

Nenhuma tarefa deve ficar sem origem contratual ou objetivo interno justificado. Nenhuma entrega deve ser marcada como concluida sem verificacao e evidencia adequadas.

## 5. Gestao de mudancas

Pedido fora do escopo nao entra silenciosamente na fila de execucao. Deve virar uma solicitacao de mudanca com impacto em custo, prazo, dados, risco e capacidade. Uma pessoa autorizada aprova, rejeita ou encaminha para aditivo contratual.

## 6. Controle de execucao

- Simulacao e planejamento antes da primeira execucao real, sempre que aplicavel.
- Aprovacao humana para acoes externas, financeiras, irreversiveis, sensiveis ou de alto impacto.
- Limites de gastos e de chamadas por operacao.
- Cancelamento e suspensao devem impedir novos efeitos nao essenciais.
- Repeticoes seguras com chave de idempotencia.
- Falhas devem preservar estado, evidencia e possibilidade de recuperacao.
- Credenciais do cliente ficam isoladas, com acesso minimo e revogacao clara.
- Separacao de dados entre clientes desde a modelagem inicial.

## 7. Status padronizados

Contrato: draft, under_review, approved, active, paused, completed, terminated.

Onboarding: missing_information, validating, ready_for_planning, pending_approval, active, blocked.

Entregavel: planned, in_progress, awaiting_review, accepted, rejected, blocked, cancelled.

Status devem ter definicoes e transicoes validadas no codigo; nao usar texto livre como unica fonte de estado.

## 8. Criterios de aceite

- Contrato sem escopo ou responsavel nao inicia execucao.
- Acoes fora do escopo sao bloqueadas e registradas como mudanca.
- Cada tarefa pode ser rastreada ate a origem e o criterio de aceite.
- Dados de clientes diferentes nao podem ser consultados entre si sem autorizacao explicita.
- Falta de capacidade e reportada como lacuna, nao como sucesso.
- Uma entrega nao e concluida sem verificacao apropriada.
- Suspensao, revogacao de acesso e encerramento sao auditaveis.
- O sistema consegue operar primeiro em modo manual/simulado sem APIs pagas.

## 9. Fora do escopo

Este contrato nao implementa assinatura digital, faturamento, contabilidade, armazenamento juridico definitivo ou integracoes externas. Cada um desses recursos exige avaliacao propria de requisitos, seguranca e conformidade antes de ser ativado.

# 12 — Motores lógicos e mapa de dependências

**Estado:** arquitetura lógica proposta, ainda sem motores implementados.  
**Objetivo:** agrupar responsabilidades em componentes testáveis sem transformar o ecossistema em um bloco monolítico.

## 1. Regra de separação

“Motor” significa responsabilidade lógica e contrato, não necessariamente um processo, servidor ou serviço pago separado. Na primeira versão, vários motores podem ser módulos pequenos no mesmo artefato, desde que tenham interfaces, testes e limites explícitos. A separação física só será decidida quando necessária.

## 2. Motores de fundação

| Motor lógico | Responsabilidade | Depende de | Não pode fazer |
|---|---|---|---|
| Identidade e contexto | Identificar solicitante, domínio, tenant e ambiente | Configuração segura de identidade | Conceder privilégios com base em texto não confiável |
| Política e autorização | Decidir se ação, recurso e ambiente são permitidos | Identidade, política e escopo da ação | Executar a ação que está autorizando |
| Validador de contratos | Validar schema, versão e compatibilidade | Schemas e catálogo de versões | Executar mensagem inválida |
| Catálogo/registro | Registrar sistemas, entidades, capacidades e versões | Validação e identidade do proprietário | Ativar capacidade sem evidência |
| Máquina de estados | Validar transições de necessidade, tarefa, operação e solução | Contratos e políticas | Permitir transição arbitrária por atualização de texto |
| Registro de eventos/auditoria | Registrar decisão, mudança e evidência | Identificadores, relógio e política de retenção | Armazenar segredos ou apagar silenciosamente histórico |
| Persistência e recuperação | Guardar estado e permitir backup/recuperação | Modelo de dados e estratégia de armazenamento | Ser tratada como cofre de segredos sem controles apropriados |

## 3. Motores de coordenação do WordDark

| Motor lógico | Responsabilidade | Depende de | Saída principal |
|---|---|---|---|
| Intake/contratos | Receber necessidade e contrato e verificar completude | Validador, identidade e catálogo | Registro aceito ou pendências |
| Registro de necessidades | Manter objetivo, restrições e critérios | Intake, estados e auditoria | Necessidade rastreável |
| Analisador de capacidade/lacunas | Comparar necessidade com capacidades ativas | Catálogo, critérios e política | Capacidade compatível, plano parcial ou lacuna |
| Planejador | Decompor objetivo em entregáveis, tarefas e dependências | Necessidade e analisador de lacunas | Plano versionado |
| Roteador | Selecionar destino elegível por capacidade, estado, risco e custo | Catálogo, plano e política | Destino justificado ou bloqueio |
| Aprovações | Registrar decisão vinculada a escopo e versão | Identidade, política, plano e auditoria | Aprovação válida, rejeição ou expiração |
| Despachante/executor | Enviar operação a adaptador autorizado | Contrato, autorização, aprovação e idempotência | Resultado verificado ou erro |
| Verificador de resultado | Comparar resultado com critérios de aceite | Evidências e critérios | Aceite, rejeição ou necessidade de revisão |
| Recuperação/suspensão | Interromper, repetir com limites, compensar ou reverter | Estado da operação, idempotência e política | Estado seguro e registro de recuperação |

## 4. Motores do ciclo de criação de soluções

| Motor lógico | Responsabilidade | Limite principal |
|---|---|---|
| Descoberta de soluções | Pesquisar alternativas e reunir fontes via Shadow/Shadoweb | Pesquisa não equivale a validação |
| Gerador de especificação | Preparar requisitos, contratos e critérios | Não aprova a própria especificação crítica |
| Orquestrador de desenvolvimento | Organizar tarefas, dependências e artefatos de Céu/Dark Factory | Não recebe acesso irrestrito ao ambiente ou segredos |
| Testes e qualidade | Executar testes funcionais, segurança, contrato e regressão | Não marca teste como aprovado sem resultado |
| Gestão de versões | Versionar artefatos, compatibilidade e migrações | Não sobrescreve versão aprovada silenciosamente |
| Promoção/retirada | Controlar temporário, piloto, permanente, suspenso e retirado | Não promove solução sem critérios e autorização |
| Métricas de sustentabilidade | Medir uso, custos, falhas, retrabalho e valor | Não inventa custo ou retorno sem dados |

## 5. Motores de integração

Cada conector implementa adaptadores para um sistema ou provedor específico. O contrato do conector declara finalidade, autenticação, escopo, entradas, saídas, custo, limite de uso, ambiente, modo de simulação e comportamento de falha.

A Central de Conexão registra e governa conectores. Shadoweb pode utilizá-los quando autorizada. O WordDark não deve codificar regras específicas de cada provedor dentro do roteador ou do núcleo de políticas.

## 6. Dependências de alto nível

~~~text
Identidade + Política + Schemas + Persistência
                  |
          Catálogo + Estados
                  |
       Intake -> Necessidades
                  |
    Análise de capacidade/lacunas
                  |
              Planejador
                  |
       Aprovação conforme risco
                  |
      Roteador -> Executor/adaptador
                  |
        Verificação de resultado
                  |
       Auditoria + Evidências
                  |
      Aceite / Recuperação / Relatório

Lacuna -> Shadow/Shadoweb -> Proposta de solução
       -> Aprovação -> Céu/Dark Factory
       -> Testes isolados -> Revisão
       -> Piloto -> Promoção ou retirada
~~~

A auditoria deve observar todas as etapas relevantes. Falha crítica, revogação ou suspensão pode interromper o fluxo.

## 7. Ordem lógica de construção — não iniciar antes da aprovação da planta

1. Schemas e contratos com testes.
2. Identidade mínima, políticas e máquina de estados.
3. Catálogo, registro de necessidades e auditoria.
4. Intake e análise de lacunas.
5. Planejamento e roteamento em simulação.
6. Aprovações, executor simulado e verificação.
7. Recuperação, idempotência e testes negativos.
8. Fluxo simulado de criação de solução temporária/piloto/permanente.
9. Interface mínima do darkHub ligada a estados reais.
10. WordDark Hub e fluxos empresariais.
11. Shadow e Shadoweb por contratos delimitados.
12. Primeiro caso real de baixo risco, com operação manual/assistida.
13. Integrações e automações adicionais somente com evidência de necessidade e aprovação.

A sequência pode mudar apenas por dependência comprovada e decisão registrada. Esta lista é uma proposta de ordem, não autorização para começar implementação.

## 8. Regras de falha transversal

- Timeout não equivale a sucesso.
- Repetição precisa ser limitada e idempotente.
- Falha parcial deve ser visível e ter estratégia de compensação ou intervenção humana.
- Revogar permissão bloqueia novas operações; ações já iniciadas são avaliadas conforme risco.
- Mudança de plano invalida aprovação materialmente afetada.
- Se a evidência for insuficiente, o estado permanece pendente de verificação.
- O executor não recebe a capacidade de alterar a política que o governa.

## 9. Critério de aceite do mapa de motores

Cada motor deve ter proprietário, interface, dados, dependências, erros, riscos, testes e critério de aceite. Não deve haver ciclo de dependência sem resolução, responsabilidade duplicada ou caminho de execução que contorne política, aprovação exigida ou auditoria.

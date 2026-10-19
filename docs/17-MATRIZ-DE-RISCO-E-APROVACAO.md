# 17 — Matriz de risco, aprovação e limites de autonomia

**Estado:** política arquitetural proposta, a revisar antes de habilitar operações reais.  
**Princípio:** a capacidade técnica de executar uma ação nunca substitui autorização.

## 1. O que a autorização precisa identificar

Toda autorização para ação com efeito deve estar ligada a:
- identidade do solicitante e autoridade para aprovar;
- ação e recurso exatos;
- sistema, tenant e ambiente;
- versão da proposta/plano/artefato;
- dados que podem ser lidos, alterados ou enviados;
- limites de quantidade, custo e duração;
- validade, condições de expiração e cancelamento;
- resultado esperado e evidência necessária;
- plano de interrupção ou retorno, quando aplicável.

Uma aprovação genérica como “pode fazer tudo” não é suficiente para operação de risco relevante.

## 2. Níveis de risco propostos

| Nível | Exemplos | Comportamento padrão | Condições para automação |
|---|---|---|---|
| R0 — Consulta | Ler status e dados não sensíveis já autorizados | Pode ocorrer sem nova aprovação por operação se houver permissão vigente | Escopo de leitura e registro definidos |
| R1 — Preparação reversível | Criar rascunho, plano, análise, código em sandbox | Pode ser assistido ou automatizado dentro de limites pré-aprovados | Ambiente isolado, sem efeito externo, logs e limite de recursos |
| R2 — Mudança interna reversível | Alterar dados de teste, executar teste, atualizar artefato de desenvolvimento | Exige permissão específica; aprovação pode ser prévia por lote limitado | Testes, rollback e escopo delimitado |
| R3 — Efeito externo ou impacto relevante | Publicar conteúdo, enviar mensagem a terceiros, alterar sistema ativo, compartilhar dados, contratar serviço | Exige aprovação humana explícita para a ação e o destino | Somente depois de política e conectores testados |
| R4 — Financeiro, privilégio ou irreversível | Pagamento, compra, compromisso financeiro, mudança de segurança/identidade, exclusão irreversível | Confirmação humana explícita e controles adicionais; bloquear se não houver mecanismo seguro | Não habilitar autonomia ampla; autenticação forte e evidência são requisitos |

A classificação real deve considerar o contexto. Uma leitura de dado altamente sensível pode ser R3/R4 mesmo sem escrita. Se houver dúvida, usar o nível mais restritivo até revisão.

## 3. Quem pode aprovar

A identidade e a hierarquia real de aprovadores ainda dependem da implementação. A regra de arquitetura é:
- o solicitante pode propor;
- o agente que planeja pode apresentar recomendação;
- o componente que executa não pode conceder a própria autorização;
- o aprovador precisa ter autoridade sobre o recurso e o escopo;
- ações críticas podem exigir confirmação separada da preparação da ação;
- conflitos de interesse ou aprovações automáticas circulares devem bloquear o fluxo.

A política deve evitar que Shadow gere uma alteração, marque-a como aprovada e execute-a sem revisão independente quando a ação exigir aprovação humana.

## 4. Escopo da aprovação

A aprovação deve ser invalidada se mudar materialmente:
- o objetivo ou entregável;
- os dados acessados ou destinatários;
- a versão do artefato;
- as permissões;
- o ambiente;
- o custo máximo ou volume;
- o risco;
- a reversibilidade ou plano de retorno.

Aprovações têm validade temporal e podem ser revogadas. A revogação impede novas ações; operações em curso entram em avaliação segura conforme o efeito e a possibilidade de interrupção.

## 5. Política de baixo risco pré-aprovado

Pode existir uma lista de ações R0/R1 previamente autorizadas pelo usuário. Cada regra deve definir sistema, ação, ambiente, dados, limites e validade. O sistema precisa permitir desligar essa autorização e registrar cada uso.

A pré-aprovação não pode incluir automaticamente publicação externa, compra, transferência financeira, exposição de dados ou alteração crítica.

## 6. Dupla confirmação e confirmação contextual

Para R4, a confirmação deve resumir em linguagem clara:
- o que acontecerá;
- em qual conta, ambiente ou destinatário;
- quais dados e valores estão envolvidos;
- qual consequência pode ser irreversível;
- como verificar o resultado;
- se existe alternativa mais segura.

Não basta botão genérico “OK” sem mostrar o alvo e o efeito. Se a identidade ou o destino não puder ser verificado, a operação permanece bloqueada.

## 7. Estados da aprovação

Proposta: `not_required`, `pending`, `approved`, `rejected`, `expired`, `revoked`, `invalidated`.

A aprovação é um registro separado da operação. A operação não deve alterar seu próprio estado de aprovação. Estados finais não são reescritos silenciosamente; correções geram novos registros auditáveis.

## 8. Critérios de aceite

Antes de conectar um serviço real, testar:
- ação permitida e ação negada;
- aprovador sem autoridade;
- aprovação vencida ou revogada;
- plano alterado depois da aprovação;
- ambiente/destino diferente do autorizado;
- custo ou volume excedido;
- falha na confirmação;
- cancelamento e revogação durante execução;
- tentativa do agente executor de aprovar a própria ação.

Qualquer teste que demonstre contorno da política bloqueia a ativação do caminho afetado.

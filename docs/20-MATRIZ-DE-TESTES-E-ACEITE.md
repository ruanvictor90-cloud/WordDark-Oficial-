# 20 — Matriz de testes e critérios de aceite do ECOSSISTEMA

**Estado:** plano de validação; nenhum teste de software é declarado executado por este documento.

## 1. Objetivo

Converter as regras da planta em cenários observáveis. Cada implementação futura deve apontar para os testes aplicáveis e guardar evidências ligadas à versão exata do artefato.

## 2. Tipos de teste

- **Contrato/schema:** formato, campos obrigatórios, limites, versão e rejeição de propriedades inválidas.
- **Domínio/estado:** transições permitidas, bloqueios e invariantes.
- **Autorização:** identidade, ação, recurso, tenant, ambiente e validade.
- **Integração:** origem/destino, versão compatível, correlação, repetição e resposta.
- **Segurança/isolamento:** acesso negado fora do escopo, proteção de segredo e isolamento de clientes.
- **Falhas/recuperação:** timeout, resultado desconhecido, erro parcial, cancelamento e retorno.
- **Ciclo de solução:** lacuna, proposta, desenvolvimento isolado, teste, aprovação, piloto, promoção e retirada.
- **Operação/implantação:** versão correta, promoção autorizada, saúde, suspensão e retorno.
- **Usabilidade:** fluxo móvel, estado real versus desconhecido, mensagem clara de bloqueio e acessibilidade.

## 3. Matriz transversal mínima

| ID | Cenário | Resultado esperado | Bloqueia produção? |
|---|---|---|---|
| T-001 | Mensagem com schema/versão suportados | Validada estruturalmente, sem implicar autorização | Sim, se falhar no contrato usado |
| T-002 | Campo obrigatório ausente ou propriedade não permitida | Rejeição explícita e segura | Sim |
| T-003 | Schema válido, mas sem permissão | Operação bloqueada | Sim |
| T-004 | Solicitante/tenant incompatível com o recurso | Acesso negado e evento auditável | Sim |
| T-005 | Capacidade declarada, mas não ativa | Roteador não a seleciona | Sim |
| T-006 | Aprovação vencida, revogada ou ligada a outra versão | Execução bloqueada | Sim |
| T-007 | Mensagem duplicada com mesma chave de idempotência | Nenhum efeito duplicado | Sim para ações repetíveis |
| T-008 | Timeout sem confirmação do destino | Estado unknown/pending verification, não succeeded | Sim |
| T-009 | Resultado parcial | Estado partial e recuperação definida | Sim para fluxo que dependa de conclusão total |
| T-010 | Tentativa de ler dados de outro cliente | Negada em consulta, arquivo, cache e evidência | Sim |
| T-011 | Conector sem credencial, escopo ou custo declarado | Inativo ou bloqueado | Sim para esse conector |
| T-012 | Modo simulado tenta alcançar serviço real | Acesso externo bloqueado | Sim |
| T-013 | Plano alterado após aprovação | Aprovação invalidada quando a mudança é material | Sim |
| T-014 | Solução temporária chega à expiração | Novas operações bloqueadas e retirada acionada | Sim para uso temporário real |
| T-015 | Promoção de solução sem testes ou responsável | Promoção rejeitada | Sim |
| T-016 | Rollback não é seguro por causa de efeitos já ocorridos | Sistema não promete reversão; aciona compensação/revisão | Sim |
| T-017 | Publicação solicitada sem destino ou aprovação definidos | Publicação não ocorre | Sim |
| T-018 | Estado do app não pode ser verificado | Mostrar desconhecido/desatualizado, nunca saudável presumido | Sim para roteamento dependente de saúde |
| T-019 | Atualização de registro usa versão obsoleta | Conflito detectado; decisão mais recente não é sobrescrita | Sim para registros críticos |
| T-020 | Logs contêm token/segredo de teste | Teste falha e ativação é bloqueada | Sim |

## 4. Testes do ciclo de criação de soluções

No modo simulado, demonstrar em ordem:
1. necessidade registrada com critérios;
2. catálogo sem capacidade compatível;
3. lacuna criada e vinculada;
4. pesquisa com fontes/referências registradas;
5. alternativas e custos desconhecidos explicitados;
6. proposta criada e aprovação exigida;
7. artefato fictício desenvolvido em sandbox;
8. testes associados à versão;
9. aprovação válida vinculada ao escopo;
10. capacidade ativada em ambiente de piloto simulado;
11. operação de teste verificada;
12. expiração, suspensão ou promoção demonstrada;
13. auditoria completa sem segredos.

O teste deve incluir rejeição por falta de autorização, teste reprovado, dependência ausente e tentativa de promover a versão errada.

## 5. Validação dos schemas atuais

Schemas iniciais registrados:
- `schemas/need.schema.json`
- `schemas/capability.schema.json`
- `schemas/operation.schema.json`

Antes de tratá-los como contratos aprovados, executar:
- parse JSON e validação contra o dialeto declarado;
- exemplos válidos para cada tipo;
- casos inválidos para cada campo obrigatório e limite;
- rejeição de propriedades extras quando aplicável;
- validação de formato para datas, identificadores e referências;
- testes de compatibilidade e política de versão;
- revisão de alinhamento entre campos, documentos 02/08/16/17 e máquinas de estado;
- teste de que schema válido não concede autorização.

Este documento não afirma que essas baterias tenham sido executadas.

## 6. Evidência de aceite

Cada execução de teste deve registrar:
- ID do teste e versão;
- ambiente;
- pré-condições;
- entradas não sensíveis ou referência a fixture;
- resultado esperado e obtido;
- status pass/fail/blocked;
- logs seguros e evidências;
- incidente ou pendência;
- responsável pela revisão quando necessária.

Captura de tela isolada não substitui logs ou confirmação do destino quando a operação exige evidência técnica.

## 7. Gate por escopo

Um escopo pode avançar somente se:
- todos os testes críticos aplicáveis passaram;
- nenhum risco crítico conhecido permanece sem mitigação;
- falhas conhecidas e limitações estão documentadas;
- a versão e o ambiente estão identificados;
- autorização e rollback/compensação estão definidos;
- o responsável e os critérios de acompanhamento estão definidos.

Teste não aplicável deve ter justificativa. Teste bloqueado não equivale a aprovado.

## 8. Critério de aceite deste documento

A matriz é considerada incorporada à planta quando os módulos e fluxos referenciam os testes aplicáveis e o portão de validação exige evidência. A execução dos testes ocorrerá na fase de implementação, depois de aprovada a planta e definido o escopo inicial.

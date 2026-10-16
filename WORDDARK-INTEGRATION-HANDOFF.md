# WordDark — pacote de passagem para alinhamento no código principal

**Branch de origem:** `finalize/worddark-2026-10-15`  
**Base prevista:** `main`  
**Estado:** trabalho isolado para revisão; não é uma autorização de merge.  
**Responsável pela integração:** chat separado de código principal, após comparar e revisar.

## Como usar este pacote

1. Buscar a branch `finalize/worddark-2026-10-15` e comparar com `main`.
2. Ler primeiro `WORDDARK-FINALIZATION-PLAN.md` e `WORDDARK-AUDIT-LOG.md`.
3. Revisar os commits individualmente; não copiar arquivos inteiros sem comparar com o estado atual do principal.
4. Executar `npm test` na branch e registrar o resultado real.
5. Resolver ou aceitar explicitamente os achados WD-AUD-003 e WD-AUD-004 antes de declarar o sistema integrado.
6. Só então planejar a incorporação no principal, sem sobrescrever alterações posteriores.

## Alterações atualmente preparadas para revisão

- `WORDDARK-FINALIZATION-PLAN.md`: escopo, arquitetura canônica, regras de segurança e critérios de aceite.
- `WORDDARK-AUDIT-LOG.md`: trilha de correções, evidências e achados abertos.
- `worddark/runtime/world/core/environment-guard.js`: validação fail-closed de ambiente; PROD requer aprovação separada.
- `worddark/runtime/world/core/environment-guard.test.js`: casos adicionais para ambientes inválidos, ausentes, bloqueados e aprovação PROD.
- `worddark/runtime/world/core/connections/connection-gateway.js`: capacidade exata exigida, sem alias que permita tratar roteamento como publicação.
- `worddark/runtime/world/core/connections/connection-gateway.test.js`: regressão para conta com `CONTENT_ROUTE` tentando `CONTENT_PUBLISH`.

## Achados que bloqueiam o aceite final

### WD-AUD-003 — contrato síncrono/assíncrono

O Engine e o Coordinator chamam rotas/executores sem `await`, enquanto a Dark Factory expõe caminhos assíncronos e os testes de integração usam módulos async. Não converter apenas um elo da cadeia: definir o contrato de execução e propagar corretamente até o Operation Center; adicionar testes com Promise resolvida/rejeitada.

### WD-AUD-004 — OAuth persistido não é conexão operacional

O backend persiste tokens cifrados por KMS/Firestore, mas o gateway consultado usa um registry local e credenciais de runtime em memória. A ponte de ativação servidor-a-servidor ainda não foi demonstrada. A interface já informa que persistência é diferente de ativação. Não habilitar publicação real até integrar e testar essa ponte, incluindo revogação, escopo e capacidade exata.

## Limites de validação

- O teste isolado do Environment Guard passou em harness local reconstruído; não é evidência de aprovação da suíte completa.
- O teste de regressão do gateway foi alterado, mas sua execução ainda está pendente.
- `npm test` completo ainda não foi executado.
- Não declarar APIs externas ativas, fluxo de publicação real validado ou sistema pronto para produção.
- Ruan permanece separado do WordDark.
- Nenhum merge, pull request ou alteração em `main` foi feito por esta frente.

## Critério para liberar o pacote ao principal

A branch pode ser usada para revisão e cherry-pick seletivo dos commits, mas o sistema como um todo **não deve ser rotulado como finalizado/produção** até que os achados abertos sejam resolvidos e os testes executados.

# WordDark Core — camada operacional atual

Este é o único Core ativo do mundo WordDark. A consolidação deve reforçar esta camada, sem criar um segundo runtime e sem recuperar a arquitetura visual antiga.

## Responsabilidades

- **Operações:** contratos, motor, coordenação, central de operações, roteamento e comunicação.
- **Segurança:** identidade, permissões contextuais, gates, guardas de ambiente e parada de emergência.
- **Estado e evidência:** registro de operações/eventos, persistência, memória operacional, biblioteca hierárquica e versionamento.
- **Resiliência:** diagnóstico, recuperação e tratamento de reentrada.
- **Conexões externas:** gateway único; TEST executa somente simulação, PROD exige aprovação explícita, capacidade exata e conta conectada.
- **Composição do mundo:** empresas, setores, capacidades e runtime único.

## Estrutura vigente

- Entrada pública dos módulos: `index.js`.
- Runtime único: `world-runtime.js`.
- Motor de execução: `operation-engine.js`.
- Coordenação: `operation-coordinator.js` e `operation-center.js`.
- Registro operacional: `operation-registry.js`.
- Conexões externas: `connections/connection-gateway.js`.
- Guardas: `environment-guard.js` e `emergency-stop-manager.js`.

## Fronteiras

- **WordDark** coordena a infraestrutura e a operação do mundo.
- **Céu** executa capacidades, incluindo a Dark Factory.
- **Terra** origina necessidades, pedidos e operações comerciais.
- **Ruan** é privado e permanece fora do mundo WordDark.

## Contratos canônicos de segurança

- `permissions.js` é o conjunto de permissões exportado pela entrada principal atual.
- `permission-set.js` tem um contrato diferente e não deve ser usado como autoridade paralela sem adaptação e testes explícitos.
- O gateway de conexões valida `TEST/PROD`; TEST usa somente `testExecute`, enquanto PROD bloqueia sem `productionApproval` configurado e aprovado.
- Capacidade de publicação não pode ser rebaixada para uma capacidade de roteamento. Os nomes devem corresponder à permissão efetivamente concedida.
- O contrato externo clona o payload e os logs do gateway não registram o payload completo.

## Tratamento do legado

`worddark/core-central/` é somente fonte para auditoria comportamental. Não importar seus orquestradores, contratos de conta, políticas ou interfaces diretamente. Extrair apenas regras comprovadamente úteis, adaptando-as aos contratos ativos e acrescentando testes. Consulte `CONSOLIDATION-AUDIT.md` para decisões e pendências.

## Validação e promoção

Pipeline: **AUDITORIA → CONTRATO → TESTES → REVISÃO → AUTORIZAÇÃO → INTEGRAÇÃO**.

Testes não devem acionar serviços reais. `PROD` precisa de aprovação explícita configurada; segredos não ficam no GitHub Pages. A existência de um arquivo ou de uma tela não comprova que a capacidade operacional está pronta.

A revisão atual fortalece o isolamento de snapshots/eventos no registro operacional e impõe uma fronteira explícita TEST/PROD no gateway externo. Isso protege referências em memória, mas não equivale a persistência durável nem à integração completa com o serviço oficial de Aprovações. Não declarar a consolidação completa até a suíte integral e a revisão final passarem.

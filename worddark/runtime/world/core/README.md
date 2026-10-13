# WordDark Core — camada operacional atual

Este é o único Core ativo do mundo WordDark. A consolidação deve reforçar esta camada, sem criar um segundo runtime e sem recuperar a arquitetura visual antiga.

## Responsabilidades

- **Operações:** contratos, motor, coordenação, central de operações, roteamento e comunicação.
- **Segurança:** identidade, permissões contextuais, gates, guardas de ambiente e parada de emergência.
- **Estado e evidência:** registro de operações/eventos, persistência, memória operacional, biblioteca hierárquica e versionamento.
- **Resiliência:** diagnóstico, recuperação e tratamento de reentrada.
- **Conexões externas:** gateway único e contratos de conexão sob autorização.
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

## Tratamento do legado

`worddark/core-central/` é somente fonte para auditoria comportamental. Não importar seus orquestradores, contratos de conta, políticas ou interfaces diretamente. Extrair apenas regras comprovadamente úteis, adaptando-as aos contratos ativos e acrescentando testes. Consulte `CONSOLIDATION-AUDIT.md` para decisões e pendências.

## Validação e promoção

Pipeline: **AUDITORIA → CONTRATO → TESTES → REVISÃO → AUTORIZAÇÃO → INTEGRAÇÃO**.

Testes não devem acionar serviços reais. `PROD` precisa de aprovação explícita configurada; segredos não ficam no GitHub Pages. A existência de um arquivo ou de uma tela não comprova que a capacidade operacional está pronta.

A revisão atual fortalece o isolamento de snapshots e eventos no registro operacional. Isso protege referências em memória, mas não equivale a persistência durável. Não declarar a consolidação completa até a suíte integral e a revisão final passarem.

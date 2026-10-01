# 🖼️ Setor 04 — Imagem

Responsabilidade: transformar roteiro + identidade em um pacote visual reutilizável.

Fluxo:
ROTEIRO + IDENTIDADE → DIREÇÃO VISUAL → VARIAÇÕES → PACOTE DE IMAGEM

Contrato de entrada:
- operationId
- script
- identity
- brand
- format
- constraints
- toolPolicy

Contrato de saída:
- status
- sector
- adapter
- operationId
- prompts
- assetSlots
- metadata
- tool
- learning

Política:
- adapter normaliza ferramentas externas ou motor próprio;
- versão inicial usa internal.demo em SIMULATION;
- publicação continua fora da Dark Factory.

Independência:
- pode executar isoladamente;
- não precisa reexecutar Inteligência, Roteiro ou Identidade;
- recebe pacotes já aprovados quando chamado pelo orquestrador.

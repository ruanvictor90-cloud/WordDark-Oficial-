# WordDark — Núcleos Centrais (fundação v0.1)

Esta camada consolida contratos de coordenação compartilhados sem criar um segundo motor operacional. Ela foi adicionada ao lado do runtime existente e não substitui seus módulos.

## Núcleos e responsabilidades

- **Identidade e Acesso:** validar identidade, capacidade, ação, ambiente e escopo. A implementação de autenticação de produção permanece externa a esta camada.
- **Governança e Aprovações:** decisões explícitas, registradas e vinculadas à operação, ação, ambiente e escopo.
- **Operações:** o WordDarkKernel prepara o pedido e delega execução ao operationEngine existente; não replica o pipeline.
- **Comunicação:** WordDarkEventBus distribui eventos e mantém um histórico limitado.
- **Registro de Setores:** WordDarkSectorRegistry mantém identidade única, domínio, capacidades e visibilidade de cada setor.
- **Rodovia:** continua responsável por transportar mensagens, sem autorizar ou executar.
- **Biblioteca e Aprendizado:** continuam no módulo existente; promoção de conhecimento deve continuar validada.
- **Segurança e Ambiente:** regras existentes de TEST/PROD, menor privilégio, auditoria, segredo e parada de emergência não são substituídas.
- **Conectores:** conectam provedores através de capacidades controladas, sem expor credenciais.
- **Resultados:** estados devem refletir o resultado real do motor, distinguindo recebimento, aprovação, execução e conclusão.

## Contrato de operação

O pedido canônico exige requestId, operationId, requesterId, originId, targetSectorId, capability, action, environment e scope.

Fluxo da fundação:

pedido → validação do contrato → registro do setor/capacidade → aprovação quando necessária → parada de emergência → motor operacional existente → resultado e eventos.

Qualquer operação em PROD exige aprovação. Aprovação não executa a operação: apenas permite que o pedido correspondente avance. A decisão é vinculada à operação, ação, ambiente e escopo e só pode ser consumida uma vez.

## Interface

A home do app de alinhamento usa a regra visual nova:
1. apps fixados na parte superior;
2. widgets informativos abaixo;
3. Portão e catálogo de setores ao abrir o app WordDark.

Os widgets são leitura e não inventam contagens ou estados externos. A home não conecta nem administra a Área ADM/Ruan.

## Testes

No diretório worddark/runtime/world/nuclei/, execute npm test.

Os testes cobrem identidade única dos setores, infraestrutura invisível, isolamento de falhas do Event Bus, aprovação humana, bloqueio de PROD e delegação ao motor operacional.

## Limites

- Esta fundação não ativa autenticação externa, banco persistente, OAuth, publicação social ou movimentação financeira.
- O registry de seed marca módulos planejados como PLANNED; não os apresenta como serviços ativos.
- O motor operacional existente precisa ser injetado para executar operações reais do runtime.
- O código estático publicado não é autoridade de segurança; permissões finais e segredos devem permanecer no backend seguro.
- A conexão desta camada ao runtime existente é por composição explícita e deve ser validada com testes de integração antes de promover novas operações a produção.

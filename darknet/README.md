# Darknet — central independente de conexões

Darknet é um aplicativo/sistema independente, não uma área interna do Ruan. Sua função é oferecer catálogo, pesquisa, preparação de solicitações e, futuramente, um ponto comum de acesso a APIs, plugins e serviços externos e internos.

## Relação com o WordDark

- **Darknet:** interface e motor de acesso/solicitação; descreve o que deseja, sem assumir autoridade do mundo.
- **WordDark Core:** autoridade operacional interna; valida identidade, política, capacidade, aprovação, roteamento e auditoria.
- **Central de Conexões do WordDark:** fronteira governada para provedores externos, credenciais e adaptadores. Darknet não deve guardar tokens de plataformas.
- **Céu:** executa capacidades e devolve resultados.
- **Terra:** origina necessidades externas, clientes, entidades e operações.
- **Ruan:** ambiente privado separado. Darknet não depende do estado privado do Ruan nem escreve na sua área de dados.

## Contrato de integração

`darknet-world-bridge.js` define a porta de saída do Darknet. `worddark/runtime/world/core/connections/darknet-world-adapter.js` define a entrada confiável do WordDark. A mensagem inclui identificador, origem/destino, setor, ação e payload estruturado. Ações permitidas inicialmente: `CAPABILITY_DISCOVERY`, `REQUEST_OPERATION`, `REQUEST_STATUS` e `SUBMIT_NEED`.

Fluxo planejado: Darknet → envelope validado → política/autorização do WordDark → auditoria → Core/Central de Operações → setor responsável → resultado estruturado → Darknet.

A porta usa comunicação in-process injetada, não HTTP nem rede. Os dois lados vêm **desativados por padrão**. Ativar um lado não ativa o outro. A integração real exige uma fonte confiável de identidade/aprovação, implementação concreta da porta, autorização no Core e auditoria persistente. Não se deve habilitar a ponte com uma simples flag de interface.

## Estado atual

- App independente disponível em `darknet/index.html`.
- Catálogo, contratos de envelope, motor de conexões, gateway de API, gerenciador de plugins, política de segurança e monitoramento são componentes modulares.
- Plugins e conectores são apenas metadados; nenhum código de plugin é executado e nenhum transporte externo é aberto.
- As mensagens locais permanecem rascunhos; nenhuma mensagem é enviada para fora.
- O adaptador WordDark só encaminha pedidos para a Central de Operações depois de autorização e auditoria, e usa `environment: TEST` nesta etapa.
- A integração é estrutural/testável, não uma conexão de produção. Não há endpoint HTTP, publicação externa ou API paga habilitada.
- `ruan/apps/darknet/` é o local legado da fundação anterior; a localização canônica independente passa a ser `darknet/`. O Hub pode consumir o catálogo público do Darknet, mas não deve ser proprietário do sistema.

## Próximos passos técnicos

1. Ligar a autorização do adaptador à identidade e ao modelo de permissões canônico do Core.
2. Ligar auditoria a armazenamento confiável e com retenção definida.
3. Criar uma porta de integração backend (sem endpoint público nesta etapa) que injete o WordDark Core e o adaptador.
4. Integrar capacidades e respostas por contratos versionados; tratar timeouts, idempotência e correlação de operações.
5. Somente depois validar a ponte em ambiente de teste; manter rede externa e execução de plugins desligadas até revisão explícita.

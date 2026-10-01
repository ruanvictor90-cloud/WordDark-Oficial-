# WordDark Core V1 — Operational City Lab

Este diretório é o laboratório isolado da próxima composição do Core.

## Objetivo atual

A V1 agora possui uma **cidade operacional autônoma**. Ela não depende da existência de uma cidade definitiva no mundo para testar uma operação real.

A cidade consegue:

- receber operações pelo portão;
- identificar solicitante e contexto;
- validar permissões;
- localizar serviço e rota;
- executar localmente quando possui capacidade;
- registrar operação, resultado e histórico;
- capturar falhas e abrir recuperação;
- gerar pedido externo quando não possui a capacidade necessária;
- manter o pedido pendente na inbox;
- resolver o pedido sem apagar o histórico;
- permanecer isolada para futuros transplantes.

## Fluxo

`Operação`
→ `Portão da cidade`
→ `Permissões`
→ **capacidade local?**
→ sim → `Serviço local` → `Resultado`

ou

→ não → `Pedido externo` → `Inbox` → outro setor

A cidade **não executa diretamente o serviço de outro setor**. Ela cria um pedido rastreável para o destino responsável.

## Peças

- `city.js` — orquestrador da cidade.
- `operation.js` — ciclo da operação.
- `operation-package.js` — pacote independente.
- `context.js` — contexto.
- `entities.js` / `entity-registry.js` — entidades.
- `gate.js` — entrada.
- `permissions.js` — autorização contextual.
- `route.js` — rotas.
- `service.js` — execução local.
- `error-recovery.js` — falhas e recuperação.
- `inbox.js` — pedidos e notificações.
- `versioning.js` — histórico de versões.
- `connector.js` — fronteira externa.
- `composition-bridge.js` — experimento de transplante para o Core consolidado.

## Regra do laboratório

Este branch pode quebrar.

O que não pode acontecer é uma experiência quebrada ser promovida automaticamente para `main`.

`staging` = composição, incompatibilidade, testes e descoberta.

`main` = consolidação posterior.

# SucoCast — Integrações

Esta camada é a fronteira entre o Estado SucoCast e os meios externos de comunicação com o público.

## Regra

SucoCast decide **o que publicar e onde publicar**.

Os conectores executam somente a operação autorizada para a plataforma correspondente.

A Dark Factory não recebe a decisão de destino.

## Estados do conector

- `DISCONNECTED` — nenhum vínculo externo ativo.
- `READY` — interface preparada, sem sessão externa ativa.
- `CONNECTED` — vínculo externo ativo.
- `ERROR` — houve falha de conexão/operação.
- `TEST` — adaptador apenas simulado.

## Segurança

Credenciais, tokens e segredos **não ficam no frontend nem no repositório público**.

O futuro fluxo real será:

```
SUCOCAST
   ↓
OPERAÇÃO AUTORIZADA
   ↓
CONNECTION MANAGER
   ↓
PROVEDOR SEGURO DE CREDENCIAIS
   ↓
ADAPTADOR DA PLATAFORMA
   ↓
API EXTERNA
   ↓
RESULTADO
   ↓
REGISTRO / BIBLIOTECA
```

O MVP atual implementa a interface e o gerenciamento do estado da conexão. As chamadas reais serão adicionadas plataforma por plataforma depois da infraestrutura segura de credenciais.

## Plataformas previstas

- YouTube
- Instagram
- TikTok
- Site próprio
- Outras aplicações externas

Nenhuma plataforma deve ser tratada como conectada enquanto não houver vínculo externo realmente estabelecido.

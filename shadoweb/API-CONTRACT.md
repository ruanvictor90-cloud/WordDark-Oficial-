# Contrato da API e dos conectores da Shadoweb

**Versão do contrato:** 1.0.0  
**Estado:** Bridge funcional localmente. Servidor HTTP público não implementado nem publicado.

## Pedido local

Todas as chamadas de conectores passam por `Bridge.request`:

```json
{
  "connectorId": "wikipedia",
  "action": "search",
  "input": { "query": "Shadoweb" }
}
```

O Bridge valida o formato, localiza o conector registrado, confere se a ação é permitida, verifica ativação e permissão, impõe um limite de tempo, executa somente um manipulador registrado e registra o resultado na auditoria local.

## Resposta

```json
{
  "version": "1.0.0",
  "requestId": "generated-by-gateway",
  "ok": true,
  "result": []
}
```

Falhas retornam `ok: false` e uma mensagem curta em `error`. Respostas não devem expor credenciais nem rastros internos de execução.

## Conectores da versão atual

| Identificador | Escopo | Estado | Responsabilidade |
|---|---|---|---|
| `web-search` | `web.search` | Integrado | Abre pesquisa no mecanismo escolhido pelo usuário |
| `wikipedia` | `connector.read` | Desativado por padrão | Pesquisa pública somente leitura |
| `local-knowledge` | `knowledge.read` | Local | Pesquisa a biblioteca local |

As ações permitidas são definidas por conector. Um manifesto de plugin não pode registrar um executor novo nem fornecer uma URL arbitrária para ser acessada.

## Manifesto de plugin

```json
{
  "schemaVersion": "1.0.0",
  "id": "wiki-helper",
  "name": "Wiki Helper",
  "version": "1.0.0",
  "description": "Busca conhecimento público.",
  "connectorId": "wikipedia",
  "permissions": ["connector.read"]
}
```

Manifestos importados começam inativos. Ativar um manifesto não executa código de plugin nesta fase.

## Fronteira futura da API HTTP

Rotas como `POST /api/v1/requests` e `GET /api/v1/connectors` são propostas de desenho, não endpoints disponíveis. Antes de ativá-las, implementar e testar:

1. autenticação no servidor e credenciais de curta duração;
2. autorização por usuário e aplicativo, escopos e quotas;
3. lista permitida de conectores e validação estrita do pedido;
4. limitação de taxa, idempotência e limite de tamanho;
5. armazenamento seguro de segredos no servidor;
6. retenção, controle de acesso e proteção dos registros de auditoria;
7. revogação, tratamento de abuso, timeout e política de falhas;
8. ambientes separados de desenvolvimento, homologação e produção.

Nunca transforme uma URL fornecida pelo frontend em destino de busca do servidor: isso cria risco de SSRF. Executores externos precisam ser revisados e registrados no servidor. Os identificadores de campos do contrato permanecem estáveis em inglês para compatibilidade; documentação e mensagens ao usuário devem ser em português claro.

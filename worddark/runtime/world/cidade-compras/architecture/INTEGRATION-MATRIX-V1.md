# Cidade de Compras — Matriz de Integração V1

| Cenário | Entrada | Caminho | Resultado esperado |
|---|---|---|---|
| Site | SITE | Comunicação → Atendimento → Comércio | mesma semântica comercial |
| Rede social | SOCIAL | Comunicação → Atendimento → Comércio | mesma semântica comercial |
| Mensageria | MESSAGING | Comunicação → Atendimento → Comércio | mesma semântica comercial |
| Marketplace | MARKETPLACE | Comunicação → Atendimento → Comércio | mesma semântica comercial |
| Atendimento humano | HANDOFF | Atendimento → humano | origem e histórico preservados |
| Pagamento | CHARGE | Contas | operação liquidada |
| Reembolso | REFUND | Contas | operação financeira identificada |
| Fornecedor | SUPPLIER_ORDER | Comércio → Fornecedor | pedido enviado |
| Exceção logística | EXCEPTION | Logística → Ocorrências | incidente analisável |
| Requeue | REQUEUED | Ocorrências → etapa necessária | histórico preservado |
| Conteúdo | MARKETING_REQUEST | Marketing → Dark Factory → Marketing → Canal | material pronto para distribuição |
| Aprendizado | LESSON | Ocorrência → Biblioteca | conhecimento registrado |

## Lacunas deliberadamente identificadas

A V1 valida contratos e passagem de responsabilidade. Ainda não implementa:
- seleção automática de fornecedor alternativo;
- estorno financeiro efetivo ligado ao estado do pedido;
- publicação real em plataformas externas;
- rastreamento real de transportadora;
- decisão automática de aprovação de conteúdo;
- autenticação/autorizações de usuário na interface.

Esses pontos ficam como próximos setores/integrações, não como lógica escondida dentro do Runtime.

## Regra

A matriz valida a arquitetura sem transformar o Runtime em um monólito.

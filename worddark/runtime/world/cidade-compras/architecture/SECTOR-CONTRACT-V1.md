# Cidade de Compras — Contrato de Setor V1

Cada setor possui uma responsabilidade única e uma fronteira explícita.

| Setor | Recebe | Produz | Não executa |
|---|---|---|---|
| Gate | entrada | passagem autorizada/rastreável | trabalho comercial |
| Comunicação | mensagens de canais | comunicação normalizada | decisão de negócio |
| Atendimento | comunicação | intenção/encaminhamento | pagamento/logística |
| Comércio | contexto comercial | sessão/carrinho/pedido | produção de conteúdo |
| Contas | operação financeira | estado financeiro | atendimento |
| Marketing | necessidade comercial | requerimento/conteúdo pronto para distribuição | produção da fábrica |
| Fornecedores | pedido de compra | confirmação/recusa | atendimento ao cliente |
| Logística | envio | rastreio/estado | decisão comercial |
| Pós-venda | solicitação pós-compra | resolução | produção |
| Ocorrências | erro/incidente | recuperação/cancelamento/requeue | apagar histórico |
| Biblioteca | registros | conhecimento/aprendizado | executar operações |

## Regra de comunicação

Setores não acessam diretamente a implementação interna de outro setor. A comunicação deve ocorrer por contrato de operação, requerimento, resultado ou evento definido.

## Regra de propriedade

O setor que cria um dado é seu proprietário operacional. Outros setores recebem referências necessárias, não cópias arbitrárias da responsabilidade.

## Regra de saída

Todo setor deve produzir estado rastreável e permitir identificar:
- origem;
- destino;
- operação;
- estado;
- histórico;
- resultado ou erro.

## Regra de evolução

Um setor pode ser alterado, testado e transplantado isoladamente:

SETOR → TESTES → REVISÃO → AUTORIZAÇÃO → TRANSPLANTE

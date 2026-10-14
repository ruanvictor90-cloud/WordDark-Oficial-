# Dark Factory — execução assistida de pedidos

## Executor inicial

O primeiro executor comercial é `CEU/DARK_FACTORY/MANUAL_OPERATOR`: a Dark Factory organiza e acompanha a execução de serviços de conteúdo digital, enquanto uma pessoa responsável produz/revisa a entrega com apoio das ferramentas disponíveis.

Serviços habilitados neste estágio:
- `content.copywriting`: textos curtos para publicações;
- `content.short-script`: roteiro curto;
- `content.profile-review`: revisão de bio/apresentação;
- `content.digital-package`: pacote combinado de conteúdo.

## Ciclo operacional

`pedido aceito + aprovação explícita → fila → responsável assume → material real anexado → revisão → cliente confirma entrega → recebimento confirmado separadamente`

O sistema recusa:
- pedidos sem aprovação explícita e identificador de aprovação;
- serviços fora do catálogo;
- pedido duplicado na fila;
- material vazio ou inexistente;
- entrega sem revisão aprovada e referência de entrega;
- registro de recebimento antes da entrega ou sem confirmação manual.

## Limites importantes

Este módulo é uma fila operacional em memória, não um serviço publicado nem uma integração remota. Não gera o material sozinho, não chama ChatGPT/API, não publica em redes sociais, não envia mensagens, não cobra, não movimenta dinheiro e não possui persistência entre reinícios. O resultado do executor só pode ser considerado produzido quando um responsável anexa conteúdo real.

O registro de recebimento é manual e não equivale a confirmação bancária automática. A revisão feita pela mesma pessoa que produziu o material fica marcada como não independente.

## Integração e próximos bloqueios

A ponte comercial do WordDark Core já pode, quando explicitamente habilitada e com operador/autorização válidos, encaminhar a ordem aceita para esta fila. A integração permanece em ambiente TEST; o despacho continua desativado por padrão. O teste integrado cobre ordem aceita → Core → fila → conteúdo real anexado → revisão → entrega confirmada → recebimento manual.

Antes da operação pública ainda é obrigatório:
1. Trocar armazenamento em memória por backend persistente com auditoria e controle de acesso.
2. Disponibilizar painel autenticado para operadores e uma entrada de pedidos que chegue a esse backend.
3. Configurar autenticação/autorização de produção, monitoramento e recuperação de falhas.
4. Testar todo o ciclo em staging e só promover para produção após revisão/aprovação.

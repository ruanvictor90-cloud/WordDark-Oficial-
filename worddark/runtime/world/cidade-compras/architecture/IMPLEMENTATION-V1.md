# Cidade de Compras — Implementation V1

## 1. Fronteira
A cidade está na Terra. Ela coordena comércio multicanal e pode solicitar serviços do Céu.

## 2. Entrada
Todo fluxo externo entra por:
PORTÃO → IDENTIDADE → PERMISSÃO → DESTINO → SETOR.

O portão não executa comércio.

## 3. Núcleo comercial
Os contratos centrais são:
- Customer
- Channel
- Product
- Cart
- Order
- Commerce Operation

A operação liga os recursos pelo ID, mantendo rastreabilidade.

## 4. Máquina do pedido
O pedido não pode pular estados arbitrariamente.

DRAFT
→ AWAITING_PAYMENT
→ PAID
→ VALIDATING
→ SENT_TO_SUPPLIER
→ SUPPLIER_CONFIRMED
→ SHIPPED
→ DELIVERED

Rotas de exceção:
- CANCELLED
- REFUNDED
- INCIDENT

## 5. Contas
A Central de Contas recebe operações financeiras do comércio:
CHARGE / RECEIVE / REFUND / PAYOUT / RECONCILE.

Ela não decide o produto nem a logística.

## 6. Fornecedor e logística
Commerce cria a necessidade.
Suppliers cria o pedido ao fornecedor.
Logistics acompanha a remessa.
After Sales atende o cliente após a compra.
Incidents registra desvios sem apagar histórico.

## 7. Serviços do Céu
A cidade nunca importa a implementação da Dark Factory.

Fluxo:
CITY
→ SERVICE REQUEST
→ RODOVIA
→ CEU SERVICE
→ SERVICE RESULT
→ CITY

Marketing pode planejar uma demanda e solicitar produção à Dark Factory.

## 8. Biblioteca
Cada operação importante pode gerar:
- histórico
- resultado
- ocorrência
- aprendizado

Esses registros ficam preparados para futura Biblioteca Central.

## 9. Interface
A interface futura deve refletir a arquitetura, não criar regras próprias:
PORTÃO → PAINEL → SETOR → OPERAÇÃO → HISTÓRICO.

## 10. Regra de evolução
Novos canais, fornecedores, gateways, transportadoras e serviços entram por contratos/adaptadores.

Não duplicar o núcleo comercial para cada plataforma.

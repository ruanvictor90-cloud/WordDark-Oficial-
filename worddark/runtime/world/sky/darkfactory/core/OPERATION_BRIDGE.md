# Operation → Dark Factory

Esta camada conecta a Operação global ao circuito existente da Dark Factory.

## Regra

A Operação é o registro global do trabalho.

A Dark Factory continua sendo apenas o executor do serviço quando a operação precisar de infraestrutura do Céu.

OPERATION → IDENTIDADE/ACESSO → RODOVIA → DARK FACTORY → RESULTADO → OPERATION

O adaptador converte a operação para o contrato de DarkFactoryRequest, evitando criar um segundo protocolo de execução.

A ponte não publica conteúdo, não escolhe destino de distribuição e não transforma a Dark Factory em dona da operação.

## Estado

Primeira ponte modular e testável. A próxima camada pode substituir os stubs pelos componentes reais de Registry, Security e Library.

# Modelo Operacional V1 — Cidade de Compras

## Regra de serviços
A Cidade de Compras solicita serviços externos. Ela não contém a Dark Factory nem transforma Marketing em parte interna da cidade.

## Ciclo de conteúdo
Necessidade comercial → Marketing → requerimento → Dark Factory → resultado → Marketing → distribuição.

### Estados do requerimento
REQUESTED → PLANNED → SENT_TO_FACTORY → RESULT_RETURNED → READY_FOR_DISTRIBUTION

## Responsabilidades
- Comércio: identifica a necessidade e solicita conteúdo.
- Marketing: recebe, planeja, envia à Dark Factory, recebe o resultado e prepara distribuição.
- Dark Factory: produz e devolve resultado.
- Canal: recebe o material aprovado para distribuição.

## Não fazer
- Não ligar Comércio diretamente à Dark Factory.
- Não colocar produção de conteúdo dentro da Cidade de Compras.
- Não misturar lógica de Marketing com canais.

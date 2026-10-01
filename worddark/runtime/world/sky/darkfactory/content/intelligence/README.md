# Setor 01 — Inteligência

Primeiro setor operacional da Fábrica de Criação.

## Função
Transformar uma necessidade/briefing em um pacote de inteligência estruturado para os próximos setores.

## Fluxo
BRIEFING → PESQUISA → NORMALIZAÇÃO → INSIGHTS → PACOTE DE INTELIGÊNCIA

## Modelo híbrido
O setor pode utilizar:
- ferramenta externa;
- ferramenta própria;
- combinação das duas.

A ferramenta externa nunca conversa diretamente com o Core. O adapter normaliza a entrada e a saída.

## Registro
Toda execução deve registrar:
- operationId;
- ferramenta/adapter;
- versão;
- entrada;
- saída normalizada;
- evidências/fontes quando existirem;
- custo/tempo quando disponível;
- aprovação;
- observações para aprendizado.

## Estado inicial
Nesta primeira versão, a pesquisa é preparada e normalizada por um adapter local de demonstração. Nenhuma API externa é chamada automaticamente.

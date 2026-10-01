# WordDark Oficial

Base oficial do mundo.

## Arquitetura atual

MAIN
├── WORDDARK — governança, segurança, permissões, auditoria, biblioteca, Central do Mundo, desenvolvimento, financeiro, jurídico e infraestrutura.
├── CÉU — soluções globais, começando por Dark Factory e Marketing.
└── TERRA — País → Estado → Cidade → Bairro.

A implementação nova usa um único Core Central. Portões são entradas/saídas formais; a Rodovia encaminha por capacidade; módulos são independentes e podem receber reentrada isolada.

O código legado foi usado como fonte de comportamento durante a conversão. O runtime legado em worddark/runtime/ permanece como referência histórica/testável até cada parte ser totalmente reconciliada e removida da função de referência.

## Regra de reentrada

Se uma operação passar por vários módulos e apenas um falhar, a correção pode retornar somente ao módulo responsável. Os checkpoints aprovados não precisam ser repetidos.

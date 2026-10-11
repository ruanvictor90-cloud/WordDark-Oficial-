# Core legado — desativado

O antigo `worddark/core-central/` foi retirado da execução do WordDark.

## Fonte única do Core

A fonte canônica agora é:

`worddark/runtime/world/core/`

Ela concentra apenas a infraestrutura central do mundo:
- identidade e autorização;
- contratos;
- Portão;
- Rodovia;
- comunicação;
- catálogo de capacidades;
- registro de empresas;
- motor e coordenador de operações;
- memória, recuperação e segurança.

## Limites de arquitetura

**Céu não foi movido nem externalizado.**

`worddark/runtime/world/sky/` continua sendo a camada de operações e soluções do mundo.

Dentro do Céu permanecem, em seus próprios módulos:
- Marketing;
- Dark Factory;
- Conexões Externas;
- futuras operações especializadas.

A Dark Factory continua em:

`worddark/runtime/world/sky/darkfactory/`

O Core coordena e encaminha. O Céu executa operações. A fábrica produz.

Nenhum cliente externo, grupo ou canal específico faz parte do Core.

## Regra de migração

Novos módulos devem ser adicionados no domínio responsável, nunca recriados em um segundo Core.


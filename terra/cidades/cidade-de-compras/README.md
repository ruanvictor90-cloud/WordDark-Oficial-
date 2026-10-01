# Cidade de Compras — Nova implementação

A Cidade de Compras foi convertida para a arquitetura Terra nova.

**País → Estado → Cidade → Bairro** é a hierarquia. A cidade não contém Dark Factory nem Marketing: ela possui a responsabilidade comercial e solicita capacidades externas pela Rodovia.

O Bairro administra necessidades e pedidos. O Portão identifica a entrada/saída. A Rodovia encaminha para capacidades registradas no WordDark.

O fluxo comercial preservado da versão anterior foi convertido para operações modulares em `commerce.js`. Incidentes possuem reentrada própria: um problema não obriga a operação inteira a começar de novo.

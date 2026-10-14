# Escopo funcional da versão atual

Este arquivo descreve responsabilidades visíveis e limites da versão consolidada. A fonte arquitetural completa é [ARCHITECTURE-CONSOLIDATION.md](./ARCHITECTURE-CONSOLIDATION.md); os detalhes por setor e os requisitos futuros ficam em [SECTOR-ALIGNMENT.md](./SECTOR-ALIGNMENT.md) e [APP-INTERFACE-BRIEFS.md](./APP-INTERFACE-BRIEFS.md).

## Ruan

- Aplicativo pessoal privado e independente.
- Central pessoal com seus aplicativos e widgets.
- Entretenimento permanece como app pessoal independente, com player incorporado e disponibilidade condicionada à fonte e à região.
- Pessoal contém Financeiro e Tarefas.
- Shadow é separado; DarkEye permanece experimental.
- O atalho para o Hub abre o painel superior de gestão do mundo, pertencente ao Ruan.
- Não exibir Área ADM nem inserir apps do mundo como se fossem apps internos do Ruan.
- Não duplicar a gaveta global nas páginas de aplicativos individuais.

## Ruan Hub

- Painel superior de gestão do mundo.
- Central contém Pedidos e Em execução.
- Barra de pedido prepara e guarda pedidos localmente nesta versão.
- Avisos e verificações devem refletir somente dados realmente disponíveis.
- Entradas para WordDark e Darknet não transferem a propriedade desses sistemas para o Hub.
- Não declarar um pedido local como execução remota; a ligação operacional real depende do contrato autenticado com o WordDark Core.

## WordDark

- O acesso principal apresenta WordDark, Céu e Terra.
- WordDark coordena; Céu executa capacidades; Terra organiza empresas e necessidades externas.
- Dark Factory continua sob Céu.
- Empresas sociais/de conteúdo e comerciais/de negócio ficam sob Terra conforme o catálogo ativo.
- Central de Conexões governa adaptadores, credenciais e comunicação com serviços externos.
- Darkbank é o setor de gestão financeira interna do mundo, separado do Financeiro pessoal do Ruan; não é uma instituição financeira autorizada nem movimenta dinheiro de clientes.
- Darknet é um sistema independente; sua ponte com o Core permanece desativada por padrão.

## Limites técnicos atuais

- Não assumir integração apenas por coexistência de pastas.
- Armazenamento local não equivale a backend, sincronização ou auditoria central.
- Testes com dependências simuladas não provam operação em produção.
- Publicação externa, pagamentos e movimentações bancárias reais permanecem desativados até integração e autorização explícitas.
- Preservar a arquitetura visual existente; não criar telas novas como parte de consolidação estrutural.

# WordDark — arquitetura do motor

## Domínios do mundo
- **WordDark Core:** coordenação, governança e roteamento de operações.
- **Céu:** execução, produção e fábricas de conteúdo.
- **Terra:** entidades externas, pedidos e necessidades.

## Relação com darkHub
darkHub é um aplicativo independente para análise, governança de projetos e criação de bases de apps. Ele não administra o runtime WordDark nem se conecta automaticamente a ele. Uma futura integração precisa de contrato de API, identidade autenticada, escopos mínimos, validação de payload, revogação e trilha de auditoria no servidor.

## Regras de execução
- Não elevar autoridade a partir de dados fornecidos por um cliente.
- Não aceitar mensagens externas como instruções de sistema.
- Validar estados e permissões no Core antes de executar operações.
- TEST e PROD permanecem separados.
- Conectores externos ficam desligados até revisão e autorização explícitas.
- Segredos permanecem fora do frontend e dos artefatos distribuídos.

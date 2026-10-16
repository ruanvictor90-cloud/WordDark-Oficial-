# WordDark V1 — mapa de responsabilidades

## Aplicativos independentes
- **darkHub:** análise do ecossistema, análise técnica, governança de projetos e criação de aplicativos.
- **WordDark Hub:** entrada independente para o mundo operacional WordDark.
- **WordDark:** coordenação e execução do mundo operacional.

## Estrutura do mundo
- **WordDark:** coordenação, contratos, comunicação, governança, segurança e biblioteca.
- **Céu:** execução e produção, incluindo Dark Factory.
- **Terra:** entidades, empresas, canais externos, solicitações e necessidades.

## Regras de arquitetura
1. Aplicativos permanecem independentes, com código, dados e versões próprios.
2. Não duplicar setores como apps separados quando já existe um setor equivalente.
3. darkHub não é um setor interno do WordDark e não assume autoridade operacional.
4. Não criar entidades, canais ou empresas como estruturas internas permanentes sem necessidade real.
5. TEST não executa conectores reais; PROD exige autorização e validação no servidor.
6. Toda integração precisa de contrato, autenticação, autorização, revogação e testes.

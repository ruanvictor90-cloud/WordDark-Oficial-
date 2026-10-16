# WordDark — fronteiras de acesso e responsabilidade

## Camadas
- **darkHub:** análise, governança de projetos e criação de bases independentes de aplicativos.
- **WordDark Hub:** interface de entrada própria do mundo operacional.
- **WordDark:** coordenação das operações do mundo.
- **Céu:** execução e produção.
- **Terra:** entidades, solicitações e necessidades que alimentam operações.

## Fronteiras
- Cada aplicativo mantém código, dados, permissões e versões próprios.
- darkHub pode registrar uma especificação e exportar arquivos iniciais; não assume que o app foi testado, publicado ou conectado.
- WordDark Hub não importa o motor interno do darkHub.
- Nenhum app pode conceder autoridade a si próprio ou aprovar a própria operação sensível.
- Integrações exigem contratos explícitos, autenticação, autorização por escopo, revogação e validação no servidor.
- GitHub Pages é uma camada pública de interface, nunca um cofre de credenciais.
- TEST não aciona conectores reais; produção exige autorização e controles externos.

## Runtime canônico
O Core ativo do WordDark é `worddark/runtime/world/core/`. O legado permanece fora do fluxo ativo até ser revisado e autorizado.

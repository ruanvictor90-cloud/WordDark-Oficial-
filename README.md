# WordDark Oficial — ecossistema em construção

Este repositório reúne aplicativos independentes e o runtime do ecossistema **WordDark**, incluindo **darkHub**, **WordDark Hub** e **WordDark**. Cada aplicativo tem sua própria identidade, escopo, dados e ciclo de liberação.

## Regra principal
Não misturar módulos antigos apenas porque existem no repositório. Cada módulo só entra no fluxo ativo depois de análise, contrato definido, testes e autorização explícita.

## Aplicativos
- **darkHub:** central de análise do ecossistema, análise técnica, governança de projetos e criação de aplicativos independentes. Fonte nesta linha de desenvolvimento: `darkhub/`.
- **WordDark Hub:** entrada própria para o ambiente operacional WordDark, com seus fluxos e identidade.
- **WordDark:** mundo operacional com coordenação central, Céu (execução e produção) e Terra (entidades e necessidades).

## Regras de separação
- darkHub e WordDark Hub são aplicativos diferentes; nenhum deve importar a interface ou os motores internos do outro.
- Apps criados pelo darkHub recebem especificação e base inicial próprias; não executam código arbitrário nem se conectam automaticamente a outros apps.
- Conectores externos ficam desligados até existir autenticação, autorização, revogação e validação do lado servidor.
- Nenhuma interface web é considerada a raiz de segurança ou autoridade de produção.
- Os registros locais do darkHub são criptografados no cofre do navegador, mas não sincronizam entre dispositivos.

## Runtime WordDark
- Core canônico: `worddark/runtime/world/core/`.
- Interface operacional: `worddark/app/`.
- Céu contém execução e produção, incluindo Dark Factory.
- Terra representa entidades, solicitações e necessidades externas.

## Testes
Execute `npm test` com Node.js 20 ou superior. Os testes do darkHub verificam o cofre criptografado, validação de registros, geração de base inicial e limites estruturais.
